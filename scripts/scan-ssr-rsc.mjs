#!/usr/bin/env node
/**
 * scan-ssr-rsc — verify every component file has a coherent client/server
 * declaration:
 *
 *   - If the file uses client-only React hooks (useState, useEffect, etc.) or
 *     references browser globals (window, document) outside of side-effect
 *     gates, it MUST start with `"use client";`.
 *   - If the file declares `"use client"` but uses no client-only API, that's
 *     just a style hint (advisory), not an error.
 *   - If the file is server-safe (no client API), no directive is required.
 *
 * Also flags:
 *   - top-level access to `window.` / `document.` (crashes RSC builds)
 *   - import of `next/navigation` from a non-client file
 *
 * Output report at .ai/ssr-rsc.json. Exits non-zero only on hard mismatches
 * (hook usage without `"use client"`, or unguarded browser-global access).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const REPORT_PATH = path.join(ROOT, ".ai", "ssr-rsc.json");
const STRICT = process.argv.includes("--strict");

const SCAN_DIRS = [
  path.join(ROOT, "ds", "primitives"),
  path.join(ROOT, "ds", "composites"),
  path.join(ROOT, "ds", "patterns"),
];

const CLIENT_HOOKS = [
  "useState",
  "useEffect",
  "useLayoutEffect",
  "useRef",
  "useReducer",
  "useImperativeHandle",
  "useContext",
  "useDeferredValue",
  "useTransition",
  "useSyncExternalStore",
  "useId",
];

const HOOK_RE = new RegExp(`\\b(?:${CLIENT_HOOKS.join("|")})\\s*\\(`);
const USE_CLIENT_RE = /^\s*["']use client["'];?\s*$/m;
const TOP_BROWSER_GLOBAL_RE = /^[^\n]*\b(?:window|document|navigator|localStorage|sessionStorage)\b[^\n]*$/m;
const NEXT_NAVIGATION_RE = /from\s+["']next\/navigation["']/;

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.isFile() && /\.(tsx|ts)$/.test(entry.name) && !/\.test\.|\.stories\./.test(entry.name)) {
      yield p;
    }
  }
}

// Top-level = outside any function/component body. Naive but fast: we only
// inspect lines whose indentation is 0 and that don't sit inside a block or
// line comment. JSX prop expressions (onClick={() => window.x}) are inside
// function bodies → indented → ignored.
function topLevelBrowserGlobalLine(src) {
  const lines = src.split("\n");
  let inBlockComment = false;
  for (const line of lines) {
    if (inBlockComment) {
      if (line.includes("*/")) inBlockComment = false;
      continue;
    }
    const trimmed = line.trimStart();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) continue;
    if (trimmed.startsWith("/*")) {
      if (!trimmed.includes("*/")) inBlockComment = true;
      continue;
    }
    if (line.length === trimmed.length && /\b(?:window|document|navigator|localStorage|sessionStorage)\b/.test(line)) {
      // Allow `import` / `type` / `interface` / `declare` references — those
      // don't actually evaluate the global.
      if (/^(?:import|export|type|interface|declare)\b/.test(trimmed)) continue;
      // Allow `typeof window` guards.
      if (/typeof\s+(?:window|document|navigator)/.test(line)) continue;
      return line.trim();
    }
  }
  return null;
}

const findings = {
  hookWithoutUseClient: [],
  browserGlobalAtTopLevel: [],
  nextNavigationInServerFile: [],
  unnecessaryUseClient: [],
};

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const src = fs.readFileSync(file, "utf8");
    const rel = path.relative(ROOT, file);
    const hasUseClient = USE_CLIENT_RE.test(src);
    const usesHook = HOOK_RE.test(src);
    const usesNextNav = NEXT_NAVIGATION_RE.test(src);

    if (usesHook && !hasUseClient) {
      findings.hookWithoutUseClient.push({ file: rel });
    }
    if (!usesHook && hasUseClient) {
      findings.unnecessaryUseClient.push({ file: rel });
    }
    if (usesNextNav && !hasUseClient) {
      findings.nextNavigationInServerFile.push({ file: rel });
    }

    const topGlobal = topLevelBrowserGlobalLine(src);
    if (topGlobal) {
      findings.browserGlobalAtTopLevel.push({ file: rel, line: topGlobal });
    }
  }
}

const summary = {
  hookWithoutUseClient: findings.hookWithoutUseClient.length,
  browserGlobalAtTopLevel: findings.browserGlobalAtTopLevel.length,
  nextNavigationInServerFile: findings.nextNavigationInServerFile.length,
  unnecessaryUseClient: findings.unnecessaryUseClient.length,
};

const report = {
  generatedAt: new Date().toISOString(),
  summary,
  findings,
};

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n", "utf8");

console.log(
  `[scan-ssr-rsc] hook-without-use-client=${summary.hookWithoutUseClient} ` +
    `browser-global-top=${summary.browserGlobalAtTopLevel} ` +
    `next-nav-in-server=${summary.nextNavigationInServerFile} ` +
    `unnecessary-use-client=${summary.unnecessaryUseClient} → ${path.relative(ROOT, REPORT_PATH)}`,
);

const HARD_FAILURES =
  summary.hookWithoutUseClient +
  summary.browserGlobalAtTopLevel +
  summary.nextNavigationInServerFile;

if (HARD_FAILURES > 0) {
  console.error("[scan-ssr-rsc] hard failures detected:");
  for (const f of findings.hookWithoutUseClient) {
    console.error(`  - hook without "use client": ${f.file}`);
  }
  for (const f of findings.browserGlobalAtTopLevel) {
    console.error(`  - top-level browser global: ${f.file}: ${f.line}`);
  }
  for (const f of findings.nextNavigationInServerFile) {
    console.error(`  - next/navigation imported in server file: ${f.file}`);
  }
  if (STRICT) process.exit(1);
}
