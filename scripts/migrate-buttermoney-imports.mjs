#!/usr/bin/env node
/**
 * Rewrites every @/components/* and @/lib/* import in ButterMoney to use
 * the new JunDS finance subpath. After this runs, ButterMoney consumes its
 * own design system entirely through @junds/ui — no local components/ or
 * lib/ are referenced any more.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const BM = "/Users/junha/develop/ButterMoney";
const ROOTS = [path.join(BM, "app")];

const IMPORT_RE =
  /(\bimport\s+(?:type\s+)?(?:[^'"]*?)from\s+|\bexport\s+(?:type\s+)?(?:\*|\{[^}]*\})\s+from\s+|\brequire\s*\(\s*|\bimport\s*\(\s*)(['"])([^'"]+)(\2)/g;

function rewriteSpec(spec) {
  if (spec.startsWith("@/components/") || spec === "@/components") return "@junds/ui/finance";
  if (spec.startsWith("@/lib/") || spec === "@/lib") return "@junds/ui/finance";
  return spec;
}

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      yield* walk(full);
    } else if (e.isFile() && (full.endsWith(".ts") || full.endsWith(".tsx"))) {
      yield full;
    }
  }
}

async function main() {
  let touched = 0;
  let scanned = 0;

  for (const root of ROOTS) {
    for await (const file of walk(root)) {
      scanned++;
      const src = await fs.readFile(file, "utf8");
      const next = src.replace(IMPORT_RE, (m, prefix, q1, spec, q2) => {
        const rewritten = rewriteSpec(spec);
        if (rewritten === spec) return m;
        return `${prefix}${q1}${rewritten}${q2}`;
      });
      if (next !== src) {
        await fs.writeFile(file, next, "utf8");
        touched++;
      }
    }
  }

  console.log(`Scanned ${scanned} files, rewrote imports in ${touched}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
