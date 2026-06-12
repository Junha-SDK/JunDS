#!/usr/bin/env node
/**
 * validate-search-dictionary — every primitive/composite/pattern with a
 * showcase page must have an entry in app/design-system/_data/search-dictionary.ts.
 *
 * Source of truth: filesystem scan of app/design-system/<kind>/<slug>/page.tsx.
 * Compares against entries in `sections[].items[].href` of the dictionary.
 *
 * Exit codes: 0 = in sync, 1 = drift (missing or stale entries).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const DICT_PATH = path.join(
  ROOT,
  "app",
  "design-system",
  "_data",
  "search-dictionary.ts",
);
const SHOWCASE_BASE = path.join(ROOT, "app", "design-system");

const KINDS = ["primitives", "composites", "patterns"];

function readShowcaseSlugs() {
  const out = new Set();
  for (const kind of KINDS) {
    const dir = path.join(SHOWCASE_BASE, kind);
    if (!fs.existsSync(dir)) continue;
    for (const slug of fs.readdirSync(dir)) {
      if (slug.startsWith("_")) continue;
      const pageFile = path.join(dir, slug, "page.tsx");
      if (fs.existsSync(pageFile)) {
        out.add(`/design-system/${kind}/${slug}`);
      }
    }
  }
  return out;
}

function readDictionaryHrefs() {
  const src = fs.readFileSync(DICT_PATH, "utf8");
  const out = new Set();
  const re = /href:\s*"(\/design-system\/[^"]+)"/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    out.add(m[1]);
  }
  return out;
}

const showcase = readShowcaseSlugs();
const dict = readDictionaryHrefs();

const missing = [...showcase].filter((h) => !dict.has(h)).sort();
const stale = [...dict]
  .filter(
    (h) =>
      h.match(/^\/design-system\/(primitives|composites|patterns)\//) &&
      !showcase.has(h),
  )
  .sort();

if (missing.length === 0 && stale.length === 0) {
  console.log(
    `[validate-search-dictionary] ✓ ${showcase.size} showcase pages match ${dict.size} dictionary hrefs.`,
  );
  process.exit(0);
}

if (missing.length > 0) {
  console.error(
    `[validate-search-dictionary] ✗ ${missing.length} showcase page(s) missing from search-dictionary.ts:`,
  );
  for (const h of missing) console.error(`  - ${h}`);
}
if (stale.length > 0) {
  console.error(
    `[validate-search-dictionary] ✗ ${stale.length} dictionary entr(ies) point to non-existent showcase pages:`,
  );
  for (const h of stale) console.error(`  - ${h}`);
}
console.error(
  `\nTo fix: add the missing entries (or remove stale ones) in app/design-system/_data/search-dictionary.ts.`,
);
process.exit(1);
