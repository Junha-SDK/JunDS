/**
 * Accessibility audit — non-blocking, on-demand.
 *
 * Renders every "safely renderable" primitive / composite / pattern via
 * @testing-library/react in jsdom, then runs axe-core against each one.
 * Results are aggregated into `.ai/a11y.json` for AI agents to consult before
 * editing a component.
 *
 * NOTE: this file is INTENTIONALLY excluded from the regular `npm test` run
 * (see vitest.config.ts `test.exclude`). Run via:
 *
 *   npm run audit:a11y
 *
 * The audit NEVER fails the test even when violations are found — the report
 * is the artifact, not a CI gate. Each component reports a list of violations
 * with axe-core impact levels:
 *
 *   - critical:  must-fix; blocks users.
 *   - serious:   high-impact barrier for many users.
 *   - moderate:  affects some users in some contexts.
 *   - minor:     edge cases / strongly recommended fixes.
 *
 * Renderability rule (slightly looser than `scripts/generate-smoke-tests.mjs`):
 *   - kind ∈ {primitive, composite, pattern}
 *   - the source file has a top-level value export named after the component
 *   - either all props are optional, OR the only required props are
 *     children-like (`children` / `ReactNode` / `JSX.Element`) — for those we
 *     pass a small text node so the audit still gets coverage.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { describe, it, expect, afterAll } from "vitest";
import axe from "axe-core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..", "..", "..");
const PROPS_JSON = path.join(ROOT, ".ai", "props.json");
const REPORT_PATH = path.join(ROOT, ".ai", "a11y.json");

const KIND_TO_PLURAL: Record<string, string> = {
  primitive: "primitives",
  composite: "composites",
  pattern: "patterns",
};

type PropMeta = { name: string; type: string; optional?: boolean };
type ComponentMeta = {
  name: string;
  kind: string;
  file: string;
  props?: PropMeta[];
};

type ViolationNode = {
  html: string;
  target: string[];
  failureSummary: string;
};
type ViolationOut = {
  id: string;
  impact: string | null;
  help: string;
  helpUrl: string;
  nodes: ViolationNode[];
};
type ComponentResult = {
  name: string;
  kind: string;
  violations: ViolationOut[];
  error?: string;
};

function readPropsJson(): { components: ComponentMeta[] } {
  const raw = fs.readFileSync(PROPS_JSON, "utf8");
  return JSON.parse(raw);
}

function hasValueExport(sourcePath: string, name: string): boolean {
  let src: string;
  try {
    src = fs.readFileSync(sourcePath, "utf8");
  } catch {
    return false;
  }
  const patterns: RegExp[] = [
    new RegExp(`export\\s+const\\s+${name}\\b`),
    new RegExp(`export\\s+function\\s+${name}\\b`),
    new RegExp(`export\\s+class\\s+${name}\\b`),
    new RegExp(`export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}`),
  ];
  return patterns.some((p) => p.test(src));
}

function isChildrenLikeProp(p: PropMeta): boolean {
  if (p.name === "children") return true;
  return /ReactNode|JSX\.Element|React\.ReactNode/.test(p.type);
}

type Renderable = { meta: ComponentMeta; needsChildren: boolean };

function pickRenderable(components: ComponentMeta[]): Renderable[] {
  const out: Renderable[] = [];
  for (const c of components) {
    const plural = KIND_TO_PLURAL[c.kind];
    if (!plural) continue;
    const sourceAbs = path.join(ROOT, c.file);
    if (!hasValueExport(sourceAbs, c.name)) continue;
    const required = (c.props || []).filter((p) => p.optional !== true);
    if (required.length === 0) {
      out.push({ meta: c, needsChildren: false });
      continue;
    }
    // Allow components whose only required prop(s) are children-like — we
    // pass a short text node when rendering so axe has meaningful DOM.
    if (required.every(isChildrenLikeProp)) {
      out.push({ meta: c, needsChildren: true });
    }
  }
  return out;
}

function summarize(results: ComponentResult[]) {
  const byImpact = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  let withViolations = 0;
  for (const r of results) {
    if (r.violations.length > 0) withViolations++;
    for (const v of r.violations) {
      const impact = (v.impact || "").toLowerCase();
      if (impact === "critical") byImpact.critical++;
      else if (impact === "serious") byImpact.serious++;
      else if (impact === "moderate") byImpact.moderate++;
      else if (impact === "minor") byImpact.minor++;
    }
  }
  return { total: results.length, withViolations, byImpact };
}

const { components: allComponents } = readPropsJson();
const renderable = pickRenderable(allComponents);
const results: ComponentResult[] = [];

// Suppress noisy axe-core / jsdom warnings while still letting hard errors
// surface. axe writes a number of "color-contrast cannot run in jsdom" style
// notices that are not actionable here.
const originalWarn = console.warn;
const originalError = console.error;
console.warn = (...args: unknown[]) => {
  const first = args[0];
  if (typeof first === "string" && /axe|color-contrast|getComputedStyle/i.test(first)) return;
  originalWarn(...(args as []));
};
console.error = (...args: unknown[]) => {
  const first = args[0];
  if (typeof first === "string" && /Not implemented:|color-contrast/i.test(first)) return;
  originalError(...(args as []));
};

describe("a11y audit (non-blocking)", () => {
  for (const renderableEntry of renderable) {
    const { meta, needsChildren } = renderableEntry;
    const plural = KIND_TO_PLURAL[meta.kind];
    const importSpec = `../../${plural}/${meta.name}`;

    it(`audits ${meta.kind}/${meta.name}`, async () => {
      let mod: Record<string, unknown>;
      try {
        mod = (await import(/* @vite-ignore */ importSpec)) as Record<string, unknown>;
      } catch (err) {
        results.push({
          name: meta.name,
          kind: meta.kind,
          violations: [],
          error: `import failed: ${(err as Error).message}`,
        });
        return;
      }

      const Comp = mod[meta.name] as React.ComponentType<unknown> | undefined;
      if (!Comp || typeof Comp !== "function") {
        results.push({
          name: meta.name,
          kind: meta.kind,
          violations: [],
          error: "named export is not a component",
        });
        return;
      }

      let container: HTMLElement | null = null;
      try {
        const element = needsChildren
          ? React.createElement(Comp, null, "샘플")
          : React.createElement(Comp);
        const result = render(element);
        container = result.container;
      } catch (err) {
        results.push({
          name: meta.name,
          kind: meta.kind,
          violations: [],
          error: `render failed: ${(err as Error).message}`,
        });
        cleanup();
        return;
      }

      try {
        const axeResult = await axe.run(container, {
          rules: {
            "color-contrast": { enabled: false },
          },
          resultTypes: ["violations"],
        });
        const violations: ViolationOut[] = axeResult.violations.map((v) => ({
          id: v.id,
          impact: v.impact ?? null,
          help: v.help,
          helpUrl: v.helpUrl,
          nodes: v.nodes.map((n) => ({
            html: n.html,
            target: n.target.map(String),
            failureSummary: n.failureSummary || "",
          })),
        }));
        results.push({
          name: meta.name,
          kind: meta.kind,
          violations,
        });
      } catch (err) {
        results.push({
          name: meta.name,
          kind: meta.kind,
          violations: [],
          error: `axe failed: ${(err as Error).message}`,
        });
      } finally {
        cleanup();
      }

      // Always pass — this is an audit, not a gate.
      expect(results).toBeDefined();
    }, 30000);
  }

  afterAll(() => {
    console.warn = originalWarn;
    console.error = originalError;

    // Sort for deterministic diffs.
    results.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind.localeCompare(b.kind);
      return a.name.localeCompare(b.name);
    });

    const summary = summarize(results);
    const report = {
      generatedAt: new Date().toISOString(),
      tooling: `axe-core@${(axe as unknown as { version: string }).version}`,
      summary,
      components: results,
    };

    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n", "utf8");

    // eslint-disable-next-line no-console
    originalWarn(
      `[a11y-audit] scanned=${summary.total} withViolations=${summary.withViolations} ` +
        `critical=${summary.byImpact.critical} serious=${summary.byImpact.serious} ` +
        `moderate=${summary.byImpact.moderate} minor=${summary.byImpact.minor}`,
    );
  });
});
