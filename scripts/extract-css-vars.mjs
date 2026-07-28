#!/usr/bin/env node
//
// Scans `app/globals.css` for CSS custom properties and emits
// `.ai/css-vars.json` — a manifest of every `--*` token grouped by selector
// (`:root`, `.dark`, etc.) and category. Agents can read this to know which
// CSS variables exist before writing styles that reference them.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cssFile = path.join(repoRoot, "app", "globals.css");
const outFile = path.join(repoRoot, ".ai", "css-vars.json");

function categorize(name) {
  if (/^--jds-(?:density|font|radius|spacing|shadow)/.test(name)) return "system";
  if (/^--(?:primary|accent|danger|success|warning|info)/.test(name)) return "semantic-color";
  if (/^--(?:background|foreground|card|border|muted|surface)/.test(name)) return "surface-color";
  if (name.startsWith("--gray") || name.startsWith("--color")) return "color";
  if (name.startsWith("--shadow")) return "shadow";
  if (name.startsWith("--radius")) return "radius";
  if (name.startsWith("--spacing")) return "spacing";
  if (name.startsWith("--font") || name.startsWith("--text")) return "typography";
  return "other";
}

async function main() {
  const src = await readFile(cssFile, "utf8");

  const blocks = [];
  const blockRe = /(^|\})\s*([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = blockRe.exec(src)) !== null) {
    const selector = m[2].trim();
    const body = m[3];
    const vars = [];
    const varRe = /(--[\w-]+)\s*:\s*([^;]+);/g;
    let v;
    while ((v = varRe.exec(body)) !== null) {
      vars.push({ name: v[1], value: v[2].trim(), category: categorize(v[1]) });
    }
    if (vars.length > 0) {
      blocks.push({ selector, vars });
    }
  }

  const allVars = blocks.flatMap((b) => b.vars.map((v) => v.name));
  const uniqueNames = Array.from(new Set(allVars)).sort();
  const byCategory = {};
  for (const block of blocks) {
    for (const v of block.vars) {
      (byCategory[v.category] ||= new Set()).add(v.name);
    }
  }
  const categoryCounts = Object.fromEntries(
    Object.entries(byCategory).map(([k, set]) => [k, set.size]),
  );

  const report = {
    generatedAt: new Date().toISOString(),
    source: path.relative(repoRoot, cssFile),
    summary: {
      uniqueVariables: uniqueNames.length,
      blocks: blocks.length,
      categoryCounts,
    },
    blocks,
    index: uniqueNames,
  };

  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(report, null, 2) + "\n");
  console.log(
    `[extract-css-vars] ${uniqueNames.length} unique vars across ${
      blocks.length
    } blocks → ${path.relative(process.cwd(), outFile)}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
