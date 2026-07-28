#!/usr/bin/env node
/**
 * scan-motion-rtl — flag components that use animation/transition without a
 * `motion-reduce` companion class, and components that rely on directional
 * left/right utilities (Tailwind ltr-only) without `rtl:` overrides.
 *
 * Non-blocking by default. Use --strict to fail on findings (CI gate).
 * Output JSON report at .ai/motion-rtl.json.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const REPORT_PATH = path.join(ROOT, ".ai", "motion-rtl.json");
const STRICT = process.argv.includes("--strict");

const SCAN_DIRS = [
  path.join(ROOT, "ds", "primitives"),
  path.join(ROOT, "ds", "composites"),
  path.join(ROOT, "ds", "patterns"),
];

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (
      entry.isFile() &&
      /\.(tsx|ts)$/.test(entry.name) &&
      !/\.test\.|\.stories\./.test(entry.name)
    ) {
      yield p;
    }
  }
}

const MOTION_RE = /\b(animate-|transition-?\w*|duration-\d|ease-\w+)\b/;
const MOTION_REDUCE_RE = /\bmotion-reduce:/;
const PREFERS_REDUCED_RE = /prefers-reduced-motion/;

const LR_RE =
  /\b(?:left|right)-(?:\d|auto|full|px)\b|\b(?:ml|mr|pl|pr|border-l|border-r|rounded-l|rounded-r|translate-x)-/;
const RTL_RE = /\brtl:/;
const LOGICAL_RE =
  /\b(?:start|end)-(?:\d|auto|full)\b|\b(?:ms|me|ps|pe|border-s|border-e|rounded-s|rounded-e)-/;

const motionFindings = [];
const rtlFindings = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const src = fs.readFileSync(file, "utf8");
    const rel = path.relative(ROOT, file);

    if (MOTION_RE.test(src) && !MOTION_REDUCE_RE.test(src) && !PREFERS_REDUCED_RE.test(src)) {
      motionFindings.push({ file: rel });
    }

    if (LR_RE.test(src) && !RTL_RE.test(src) && !LOGICAL_RE.test(src)) {
      rtlFindings.push({ file: rel });
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    motionWithoutReduce: motionFindings.length,
    leftRightWithoutRtl: rtlFindings.length,
  },
  motionFindings,
  rtlFindings,
};

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n", "utf8");

console.log(
  `[scan-motion-rtl] motion-without-reduce=${motionFindings.length} left-right-without-rtl=${
    rtlFindings.length
  } → ${path.relative(ROOT, REPORT_PATH)}`,
);

if (STRICT && (motionFindings.length > 0 || rtlFindings.length > 0)) {
  console.error("[scan-motion-rtl] strict mode: findings present, exit 1");
  process.exit(1);
}
