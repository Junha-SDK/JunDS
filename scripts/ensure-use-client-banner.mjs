#!/usr/bin/env node
/**
 * Post-build guarantee: every .mjs / .cjs in dist/ that should be a client
 * module has a `"use client";` directive at byte 0.
 *
 * Why this exists:
 *   rollup's `output.banner: '"use client";'` is a string-statement at the
 *   top of the bundle, which terser's `dead_code` pass treats as a no-op
 *   expression and eliminates. Setting `compress.directives: false` doesn't
 *   help (terser only preserves prologue directives that terser itself
 *   inserted). The robust fix is to prepend after minification.
 *
 *   The finance/lib subtree is special — only specific modules declared
 *   `"use client"` in source (livePrices, themeMode, …). For those, we
 *   read the original source and only prepend if the source had it.
 *   Everything else in dist/ is a barrel that bundles client components,
 *   so it gets the directive unconditionally.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = "/Users/junha/develop/jjunhaa/JunDS";
const DIST = path.join(ROOT, "dist");

const FINANCE_LIB_DIR = path.join(DIST, "finance", "lib");
const FINANCE_LIB_SRC = path.join(ROOT, "ds", "finance", "lib");

const DIRECTIVE = '"use client";';

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.isFile()) yield full;
  }
}

async function hasClientDirective(filePath) {
  try {
    const src = await fs.readFile(filePath, "utf8");
    return /^\s*["']use client["']/.test(src);
  } catch {
    return false;
  }
}

async function prepend(filePath) {
  const src = await fs.readFile(filePath, "utf8");
  if (src.startsWith(DIRECTIVE)) return false;
  await fs.writeFile(filePath, DIRECTIVE + "\n" + src, "utf8");
  return true;
}

async function main() {
  let touched = 0;
  for await (const f of walk(DIST)) {
    if (!/\.(mjs|cjs)$/.test(f)) continue;

    // Per-file finance/lib: only mirror source-side directive
    const rel = path.relative(DIST, f);
    if (rel.startsWith("finance/lib/")) {
      const baseName = path.basename(f, path.extname(f));
      const srcPath = path.join(FINANCE_LIB_SRC, `${baseName}.ts`);
      if (await hasClientDirective(srcPath)) {
        if (await prepend(f)) touched++;
      }
      continue;
    }

    // Everything else: bundled client barrel — always client
    if (await prepend(f)) touched++;
  }
  console.log(`Ensured "use client" on ${touched} bundle file(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
