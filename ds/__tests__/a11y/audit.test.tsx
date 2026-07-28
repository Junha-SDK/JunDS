/**
 * Accessibility audit — non-blocking by default, strict on demand.
 *
 * Renders every "safely renderable" primitive / composite / pattern via
 * @testing-library/react in jsdom, then runs axe-core against each one.
 * Results are aggregated into `.ai/a11y.json` for AI agents to consult before
 * editing a component.
 *
 * NOTE: this file is INTENTIONALLY excluded from the regular `npm test` run
 * (see vitest.config.ts `test.exclude`). Run via:
 *
 *   npm run audit:a11y          → non-blocking; report only.
 *   npm run audit:a11y:strict   → fails when render errors > 0 OR
 *                                 critical/serious violations exist.
 *
 * Strict mode is gated by `process.env.JUNDS_AUDIT_STRICT === "1"`.
 *
 * Renderability rule:
 *   - kind ∈ {primitive, composite, pattern}
 *   - the source file has a top-level value export named after the component
 *   - all required props can be filled with type-derived defaults
 *     (ReactNode → "샘플", arrays → [], strings → "sample", numbers → 0,
 *      booleans → false, functions → noop). If any required prop has an
 *      unknown shape we skip the component.
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
const STRICT = process.env.JUNDS_AUDIT_STRICT === "1";

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

/**
 * React.forwardRef / React.memo return objects (not functions) carrying a
 * `$$typeof` symbol. Treat them as components alongside plain function
 * components and compound components (function + member props).
 */
function isReactComponentLike(value: unknown): boolean {
  if (typeof value === "function") return true;
  if (value && typeof value === "object") {
    const v = value as { $$typeof?: unknown; render?: unknown };
    if (v.$$typeof != null) return true;
    if (typeof v.render === "function") return true;
  }
  return false;
}

function isArrayType(type: string): boolean {
  return /\[\]\s*$|^\s*Array\s*<|^\s*ReadonlyArray\s*</.test(type);
}

function isReactNodeType(type: string): boolean {
  return /\b(ReactNode|JSX\.Element|React\.ReactNode|ReactElement|React\.ReactElement)\b/.test(
    type,
  );
}

function isFunctionType(type: string): boolean {
  // Crude: anything containing "=>" we treat as a function type.
  return /=>/.test(type);
}

function defaultForProp(p: PropMeta): { ok: true; value: unknown } | { ok: false } {
  const t = p.type;
  if (isArrayType(t)) return { ok: true, value: [] };
  if (isReactNodeType(t)) return { ok: true, value: "샘플" };
  if (isFunctionType(t)) return { ok: true, value: () => {} };
  if (/^\s*string\s*$/.test(t) || /\bstring\b/.test(t.split("|")[0] ?? "")) {
    return { ok: true, value: "sample" };
  }
  if (/^\s*number\s*$/.test(t) || /\bnumber\b/.test(t.split("|")[0] ?? "")) {
    return { ok: true, value: 0 };
  }
  if (/^\s*boolean\s*$/.test(t) || /\bboolean\b/.test(t.split("|")[0] ?? "")) {
    return { ok: true, value: false };
  }
  // Object-ish required prop with no clear shape — bail out.
  return { ok: false };
}

type Renderable = { meta: ComponentMeta; props: Record<string, unknown> };

/**
 * Components whose root DOM element is a void/non-content element where
 * passing children would crash or produce noisy warnings during audit.
 */
const NO_CHILDREN_COMPONENTS = new Set<string>([
  "Input",
  "Textarea",
  "TextareaAutosize",
  "Checkbox",
  "RangeSlider",
  "Slider",
  "PasswordInput",
  "NumberInput",
  "PhoneInput",
  "CurrencyInput",
  "DateInput",
  "DateRangeFilter",
  "FileUpload",
  "ScrollProgress",
  "CodeEditor",
  "Image",
]);

/**
 * Components whose root is a non-interactive element (e.g. `<img alt="">` for
 * decorative images) where adding `aria-label` triggers
 * `presentation-role-conflict`. They expose no labellable surface.
 */
const NO_AUDIT_ARIA_LABEL_COMPONENTS = new Set<string>(["Image"]);

/**
 * Layout / list-shaped components whose root is a non-labellable element
 * (`<div>` with no role). Adding `aria-label` to these triggers
 * `aria-prohibited-attr`. Their accessibility relies on inner heading /
 * landmark structure, not a single label.
 */
const NO_ARIA_LABEL_COMPONENTS = new Set<string>([
  "PricingTable",
  "PricingPage",
  "SettingsLayout",
  "AuthLayout",
  "Container",
  "Stack",
  "Grid",
  "Spacer",
  "Marquee",
]);

function pickRenderable(components: ComponentMeta[]): Renderable[] {
  const out: Renderable[] = [];
  for (const c of components) {
    const plural = KIND_TO_PLURAL[c.kind];
    if (!plural) continue;
    const sourceAbs = path.join(ROOT, c.file);
    if (!hasValueExport(sourceAbs, c.name)) continue;
    const required = (c.props || []).filter((p) => p.optional !== true);
    const props: Record<string, unknown> = {};
    let ok = true;
    for (const p of required) {
      const def = defaultForProp(p);
      if (!def.ok) {
        ok = false;
        break;
      }
      props[p.name] = def.value;
    }
    if (!ok) continue;

    // Audit-only convenience: simulate realistic usage by always supplying an
    // accessible name. Component code that forwards `aria-label` to the root
    // element will pass axe; components that ignore it remain unaffected.
    if (
      props["aria-label"] === undefined &&
      !NO_ARIA_LABEL_COMPONENTS.has(c.name) &&
      !NO_AUDIT_ARIA_LABEL_COMPONENTS.has(c.name)
    ) {
      props["aria-label"] = `${c.name} 샘플`;
    }
    if (props.children === undefined && !NO_CHILDREN_COMPONENTS.has(c.name)) {
      props.children = "샘플 컨텐츠";
    }

    out.push({ meta: c, props });
  }
  return out;
}

function summarize(results: ComponentResult[]) {
  const byImpact = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  let withViolations = 0;
  let withErrors = 0;
  for (const r of results) {
    if (r.violations.length > 0) withViolations++;
    if (r.error) withErrors++;
    for (const v of r.violations) {
      const impact = (v.impact || "").toLowerCase();
      if (impact === "critical") byImpact.critical++;
      else if (impact === "serious") byImpact.serious++;
      else if (impact === "moderate") byImpact.moderate++;
      else if (impact === "minor") byImpact.minor++;
    }
  }
  return { total: results.length, withViolations, withErrors, byImpact };
}

const { components: allComponents } = readPropsJson();
const renderable = pickRenderable(allComponents);
const results: ComponentResult[] = [];

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

describe("a11y audit", () => {
  for (const renderableEntry of renderable) {
    const { meta, props } = renderableEntry;
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
        if (STRICT) throw err;
        return;
      }

      const Comp = mod[meta.name] as React.ComponentType<unknown> | undefined;
      if (!isReactComponentLike(Comp)) {
        results.push({
          name: meta.name,
          kind: meta.kind,
          violations: [],
          error: "named export is not a component",
        });
        if (STRICT) {
          throw new Error(
            `[${meta.name}] named export is not a React component (got ${typeof Comp})`,
          );
        }
        return;
      }

      let container: HTMLElement | null = null;
      try {
        const element = React.createElement(
          Comp as React.ComponentType<Record<string, unknown>>,
          props,
        );
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
        if (STRICT) throw err;
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

        if (STRICT) {
          const blockers = violations.filter(
            (v) => v.impact === "critical" || v.impact === "serious",
          );
          if (blockers.length > 0) {
            throw new Error(
              `[${meta.name}] ${blockers.length} critical/serious a11y violation(s): ` +
                blockers.map((b) => b.id).join(", "),
            );
          }
        }
      } catch (err) {
        const msg = (err as Error).message;
        if (STRICT && /\d+ critical\/serious/.test(msg)) {
          // already a strict-mode violation; rethrow.
          throw err;
        }
        results.push({
          name: meta.name,
          kind: meta.kind,
          violations: [],
          error: `axe failed: ${msg}`,
        });
        if (STRICT) throw err;
      } finally {
        cleanup();
      }

      expect(results).toBeDefined();
    }, 30000);
  }

  afterAll(() => {
    console.warn = originalWarn;
    console.error = originalError;

    results.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind.localeCompare(b.kind);
      return a.name.localeCompare(b.name);
    });

    const summary = summarize(results);
    const report = {
      generatedAt: new Date().toISOString(),
      tooling: `axe-core@${(axe as unknown as { version: string }).version}`,
      strict: STRICT,
      summary,
      components: results,
    };

    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n", "utf8");

    originalWarn(
      `[a11y-audit] ${STRICT ? "STRICT " : ""}scanned=${summary.total} ` +
        `errors=${summary.withErrors} withViolations=${summary.withViolations} ` +
        `critical=${summary.byImpact.critical} serious=${summary.byImpact.serious} ` +
        `moderate=${summary.byImpact.moderate} minor=${summary.byImpact.minor}`,
    );
  });
});
