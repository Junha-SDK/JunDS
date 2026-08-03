#!/usr/bin/env node
/**
 * One-shot migration: copies ButterMoney components/ + lib/ into ds/finance/
 * and rewrites imports so the moved files compile inside JunDS.
 *
 *   @/components/X  → ./X         (from ds/finance/X.tsx)
 *                     ../X        (from ds/finance/charts/X.tsx or ds/finance/lib/X.ts)
 *   @/lib/X         → ./lib/X     (from ds/finance/X.tsx)
 *                     ../lib/X    (from ds/finance/charts/X.tsx)
 *                     ./X         (from ds/finance/lib/X.ts)
 *   @junds/ui       → ../index    (from ds/finance/X.tsx)
 *                     ../../index (from ds/finance/charts or ds/finance/lib)
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const BM = "/Users/junha/develop/ButterMoney";
const DS_FIN = "/Users/junha/develop/jjunhaa/JunDS/ds/finance";

const COMPONENTS_SRC = path.join(BM, "components");
const LIB_SRC = path.join(BM, "lib");

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.map((e) => ({
    name: e.name,
    isDirectory: () => e.isDirectory(),
    isFile: () => e.isFile(),
    full: path.join(dir, e.name),
  }));
}

/**
 * Rewrites import specifier strings.
 * `relPrefix` is the relative prefix to reach ds/finance root from the file location.
 *   - ds/finance/X.tsx           → relPrefix = "."         (parentToFinance)
 *   - ds/finance/charts/X.tsx    → relPrefix = ".."
 *   - ds/finance/lib/X.ts        → relPrefix = ".."
 */
function rewriteSpecifier(spec, ctx) {
  // Keep @junds/ui imports as-is — rollup marks them external so the
  // package self-reference resolves to the consumer's installed copy at
  // runtime, sharing the same React context instance.
  if (spec === "@junds/ui" || spec.startsWith("@junds/ui/")) return spec;
  if (spec.startsWith("@/components/")) {
    const rest = spec.slice("@/components/".length);
    // rest could be "X" (a file in components/) or "charts/lazy" etc.
    // After migration, components live flat in ds/finance/*.tsx
    // and ds/finance/charts/lazy.tsx
    // From ds/finance/X.tsx (relPrefix "."): ./{rest}
    // From ds/finance/charts/X.tsx (relPrefix ".."): ../{rest}
    // From ds/finance/lib/X.ts (relPrefix ".."): ../{rest}
    return ctx.relPrefix === "." ? `./${rest}` : `../${rest}`;
  }
  if (spec.startsWith("@/lib/")) {
    const rest = spec.slice("@/lib/".length);
    if (ctx.locationKind === "lib") {
      // from ds/finance/lib/X.ts to sibling: ./{rest}
      return `./${rest}`;
    }
    if (ctx.locationKind === "charts") {
      return `../lib/${rest}`;
    }
    // root file in ds/finance/X.tsx
    return `./lib/${rest}`;
  }
  return spec;
}

const IMPORT_RE =
  /(\bimport\s+(?:type\s+)?(?:[^'"]*?)from\s+|\bexport\s+(?:type\s+)?(?:\*|\{[^}]*\})\s+from\s+|\brequire\s*\(\s*|\bimport\s*\(\s*)(['"])([^'"]+)(\2)/g;

function transformSource(src, ctx) {
  return src.replace(IMPORT_RE, (m, prefix, q1, spec, q2) => {
    const newSpec = rewriteSpecifier(spec, ctx);
    return `${prefix}${q1}${newSpec}${q2}`;
  });
}

async function copyAndTransform(srcFile, destFile, ctx) {
  let src = await fs.readFile(srcFile, "utf8");
  src = transformSource(src, ctx);
  await fs.mkdir(path.dirname(destFile), { recursive: true });
  await fs.writeFile(destFile, src, "utf8");
}

async function main() {
  await fs.mkdir(DS_FIN, { recursive: true });
  await fs.mkdir(path.join(DS_FIN, "lib"), { recursive: true });
  await fs.mkdir(path.join(DS_FIN, "charts"), { recursive: true });

  // 1. components/*.tsx → ds/finance/*.tsx
  const compEntries = await listFiles(COMPONENTS_SRC);
  const componentNames = [];
  for (const e of compEntries) {
    if (e.isDirectory()) continue;
    if (!e.name.endsWith(".tsx") && !e.name.endsWith(".ts")) continue;
    const dest = path.join(DS_FIN, e.name);
    await copyAndTransform(e.full, dest, { relPrefix: ".", locationKind: "root" });
    componentNames.push(e.name.replace(/\.tsx?$/, ""));
  }

  // 2. components/charts/*.tsx → ds/finance/charts/*.tsx
  const chartsSrc = path.join(COMPONENTS_SRC, "charts");
  try {
    const chartEntries = await listFiles(chartsSrc);
    for (const e of chartEntries) {
      if (e.isDirectory()) continue;
      const dest = path.join(DS_FIN, "charts", e.name);
      await copyAndTransform(e.full, dest, { relPrefix: "..", locationKind: "charts" });
    }
  } catch {}

  // 3. lib/*.ts → ds/finance/lib/*.ts
  const libEntries = await listFiles(LIB_SRC);
  const libNames = [];
  for (const e of libEntries) {
    if (e.isDirectory()) continue;
    if (!e.name.endsWith(".ts")) continue;
    const dest = path.join(DS_FIN, "lib", e.name);
    await copyAndTransform(e.full, dest, { relPrefix: "..", locationKind: "lib" });
    libNames.push(e.name.replace(/\.ts$/, ""));
  }

  console.log(`Migrated ${componentNames.length} components`);
  console.log(`Migrated ${libNames.length} lib modules`);
  console.log("Components:", componentNames.sort().join(", "));
  console.log("Libs:", libNames.sort().join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
