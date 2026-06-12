#!/usr/bin/env node
/**
 * Generates ds/finance barrels.
 *
 *   - ds/finance/lib/index.ts        : per-file re-exports of lib utilities
 *   - ds/finance/charts/index.ts     : per-file re-exports of charts/
 *   - ds/finance/index.ts            : per-file re-exports of components + lib + charts
 *
 * Conflict policy: when the same name is exported from multiple modules,
 * the FIRST occurrence wins. Module ordering is:
 *   1) component .tsx files at root, alphabetically
 *   2) lib/ modules, alphabetically
 *   3) charts/ modules, alphabetically
 * This matches ButterMoney intent — domain components own a name like
 * `heatmapColor` (re-exported from MarketHeatmap.tsx) and the lib version
 * is only reachable via the `lib` subpath, which is fine because consumers
 * already use named imports.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const FIN = "/Users/junha/develop/jjunhaa/JunDS/ds/finance";

const VALUE_DECL = /^export\s+(?:async\s+)?(?:function|const|let|var|class|enum)\s+([\p{ID_Start}_$][\p{ID_Continue}$]*)/gmu;
const TYPE_DECL = /^export\s+(?:type|interface)\s+([\p{ID_Start}_$][\p{ID_Continue}$]*)/gmu;
const NAMED_LIST = /^export\s+(?:type\s+)?\{([^}]+)\}\s*(?:from\s+['"][^'"]+['"])?\s*;?/gm;

function parseExports(src) {
  const values = new Set();
  const types = new Set();
  let m;

  while ((m = VALUE_DECL.exec(src)) !== null) values.add(m[1]);
  while ((m = TYPE_DECL.exec(src)) !== null) types.add(m[1]);

  // For `export { ... }` lists we need the full match including the leading
  // `export` token to know whether the WHOLE list is type-only.
  const listRe = /^(export(?:\s+type)?)\s+\{([^}]+)\}\s*(?:from\s+['"][^'"]+['"])?\s*;?/gm;
  while ((m = listRe.exec(src)) !== null) {
    const wholeIsType = /export\s+type/.test(m[1]);
    const list = m[2];
    for (const part of list.split(",")) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const isPartType = /^type\s+/.test(trimmed) || wholeIsType;
      const stripped = trimmed.replace(/^type\s+/, "");
      const asMatch = stripped.match(/(\S+)\s+as\s+(\S+)/);
      const name = asMatch ? asMatch[2] : stripped;
      if (!/^[\p{ID_Start}_$][\p{ID_Continue}$]*$/u.test(name)) continue;
      (isPartType ? types : values).add(name);
    }
  }
  return { values, types };
}

async function listSources(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((n) => (n.endsWith(".ts") || n.endsWith(".tsx")) && n !== "index.ts" && n !== "index.tsx")
    .sort();
}

function modulePath(name) {
  return name.replace(/\.tsx?$/, "");
}

async function collectModules(srcDir, prefix = ".") {
  const files = await listSources(srcDir);
  const out = [];
  for (const fileName of files) {
    const src = await fs.readFile(path.join(srcDir, fileName), "utf8");
    const { values, types } = parseExports(src);
    out.push({
      mod: `${prefix}/${modulePath(fileName)}`,
      values: [...values].sort(),
      types: [...types].sort(),
    });
  }
  return out;
}

function renderModuleExports(modules) {
  // rollup-plugin-dts rejects duplicate names even when the duplicates are
  // (value, type) pairs — TypeScript's declaration merging confuses it.
  // So we share a single namespace: first sighting (value or type) wins.
  const seen = new Set();
  const lines = [];
  for (const { mod, values, types } of modules) {
    const v = values.filter((n) => !seen.has(n));
    const t = types.filter((n) => !seen.has(n));
    v.forEach((n) => seen.add(n));
    t.forEach((n) => seen.add(n));
    if (v.length > 0) lines.push(`export { ${v.join(", ")} } from "${mod}";`);
    if (t.length > 0) lines.push(`export type { ${t.join(", ")} } from "${mod}";`);
  }
  return lines;
}

// Lib modules that are SERVER-ONLY (Node APIs, secrets, server-only fetch).
// These are still reachable via `@junds/ui/finance/lib/<name>` granular
// subpaths, but excluded from the top-level `@junds/ui/finance` barrel so
// client bundles don't accidentally pull `yahoo-finance2`, `process.env`,
// or other non-isomorphic dependencies.
const SERVER_ONLY_LIBS = new Set([
  "auth",
  "ecos",
  "rss",
  "yahoo",
]);

async function main() {
  // 1) lib barrel
  const libMods = await collectModules(path.join(FIN, "lib"));
  const libLines = ["// Auto-generated barrel for ds/finance/lib", "", ...renderModuleExports(libMods)];
  await fs.writeFile(path.join(FIN, "lib", "index.ts"), libLines.join("\n") + "\n", "utf8");

  // 2) charts barrel
  const chartsMods = await collectModules(path.join(FIN, "charts"));
  const chartsLines = ["// Auto-generated barrel for ds/finance/charts", "", ...renderModuleExports(chartsMods)];
  await fs.writeFile(path.join(FIN, "charts", "index.ts"), chartsLines.join("\n") + "\n", "utf8");

  // 3) finance root barrel: components first (component-name wins on collision),
  //    then *client-safe* lib (with prefixed paths), then charts. Server-only
  //    lib modules are intentionally absent here.
  const rootMods = await collectModules(FIN);
  const libModsRel = libMods
    .filter((m) => {
      const base = m.mod.replace(/^\.\//, "");
      return !SERVER_ONLY_LIBS.has(base);
    })
    .map((m) => ({ ...m, mod: m.mod.replace(/^\./, "./lib") }));
  const chartsModsRel = chartsMods.map((m) => ({ ...m, mod: m.mod.replace(/^\./, "./charts") }));

  const finLines = [
    "// Auto-generated barrel for ds/finance",
    "// Conflict policy: components win, then lib, then charts.",
    "",
    ...renderModuleExports([...rootMods, ...libModsRel, ...chartsModsRel]),
  ];
  await fs.writeFile(path.join(FIN, "index.ts"), finLines.join("\n") + "\n", "utf8");

  console.log("Wrote barrels:");
  console.log("  ds/finance/index.ts        (" + (finLines.length - 3) + " export lines)");
  console.log("  ds/finance/lib/index.ts    (" + (libLines.length - 2) + " export lines)");
  console.log("  ds/finance/charts/index.ts (" + (chartsLines.length - 2) + " export lines)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
