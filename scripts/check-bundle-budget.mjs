#!/usr/bin/env node
/**
 * Bundle budget guard.
 *
 * Reads `.ai/bundle.json` (regenerate with `npm run bundle:report`) and fails
 * the run when any component's gzip size exceeds the budget for its kind.
 *
 * Exit codes:
 *   0 — all components within budget.
 *   1 — at least one component is over budget (or missing report).
 *
 * Tune budgets via `BUDGETS` below or via per-component overrides in
 * `OVERRIDES`.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const REPORT = join(ROOT, ".ai", "bundle.json");

/**
 * Default per-kind gzip ceiling, in bytes. Calibrated April 2026 with ~30%
 * headroom over the current largest component in each tier.
 */
const BUDGETS = {
  primitive: 3 * 1024, // 3 KB
  composite: 6 * 1024, // 6 KB
  pattern: 8 * 1024, // 8 KB
};

/**
 * Per-component overrides for components we explicitly accept as larger
 * than their kind's budget. Keep this list small and document the reason.
 */
const OVERRIDES = {
  // 25-feature DataTable (filter, sort, virtualize, CSV, inline edit, etc.)
  // Single largest deliberate component in the library. Hard cap at 15 KB.
  DataTable: 15 * 1024,
  // Slider gained aria-label/i18n forwarding + safeValue gates — 3.0KB → 3.1KB.
  // Acceptable for an interactive form primitive with full a11y.
  Slider: 3.5 * 1024,
};

function fmtKB(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function main() {
  if (!existsSync(REPORT)) {
    console.error(
      `[check-bundle-budget] Missing ${REPORT}. Run 'npm run bundle:report' first.`,
    );
    process.exit(1);
  }

  const report = JSON.parse(readFileSync(REPORT, "utf8"));
  const violations = [];
  const warnings = [];

  for (const c of report.components) {
    const budget = OVERRIDES[c.name] ?? BUDGETS[c.kind];
    if (budget == null) continue; // unknown kind — skip
    if (c.gzipBytes > budget) {
      violations.push({ ...c, budget });
    } else if (c.gzipBytes > budget * 0.85) {
      warnings.push({ ...c, budget });
    }
  }

  if (warnings.length > 0) {
    console.warn(
      `\n[check-bundle-budget] ${warnings.length} component(s) within 15% of budget:`,
    );
    for (const w of warnings) {
      console.warn(
        `  ⚠️  ${w.name.padEnd(28)} ${w.kind.padEnd(10)} ` +
          `${fmtKB(w.gzipBytes)} / ${fmtKB(w.budget)}`,
      );
    }
  }

  if (violations.length > 0) {
    console.error(
      `\n[check-bundle-budget] ${violations.length} component(s) OVER budget:`,
    );
    for (const v of violations) {
      const over = v.gzipBytes - v.budget;
      console.error(
        `  ❌ ${v.name.padEnd(28)} ${v.kind.padEnd(10)} ` +
          `${fmtKB(v.gzipBytes)} / ${fmtKB(v.budget)} (+${fmtKB(over)})`,
      );
    }
    console.error(
      `\nReduce the component, split it, or add an override in scripts/check-bundle-budget.mjs.`,
    );
    process.exit(1);
  }

  console.log(
    `[check-bundle-budget] ✅ ${report.components.length} components, all within budget. ` +
      `(primitive ≤${fmtKB(BUDGETS.primitive)}, composite ≤${fmtKB(BUDGETS.composite)}, ` +
      `pattern ≤${fmtKB(BUDGETS.pattern)})`,
  );
}

main();
