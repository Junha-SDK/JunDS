#!/usr/bin/env node
/**
 * Server-side files (Edge middleware, route handlers) must import from the
 * granular `@junds/ui/finance/lib/<module>` subpath instead of the
 * top-level `@junds/ui/finance` barrel — otherwise the bundle drags in
 * client hooks and trips Next.js's RSC/Edge restrictions.
 *
 * This script walks middleware.ts + app/api/** + any other file we detect
 * to be server-only, parses each `from "@junds/ui/finance"` import, and
 * splits the named imports across the matching lib modules.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const BM = "/Users/junha/develop/ButterMoney";
const JUNDS_LIB = "/Users/junha/develop/jjunhaa/JunDS/ds/finance/lib";

const SERVER_FILES = [path.join(BM, "middleware.ts")];

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

// Build a lookup of every named export → its source module (auth, format, …)
async function buildSymbolIndex() {
  const files = (await fs.readdir(JUNDS_LIB)).filter((f) => /\.ts$/.test(f) && f !== "index.ts");
  const index = new Map();
  const VALUE = /^export\s+(?:async\s+)?(?:function|const|let|var|class|enum)\s+([\p{ID_Start}_$][\p{ID_Continue}$]*)/gmu;
  const TYPE = /^export\s+(?:type|interface)\s+([\p{ID_Start}_$][\p{ID_Continue}$]*)/gmu;
  const LIST = /^(export(?:\s+type)?)\s+\{([^}]+)\}\s*(?:from\s+['"][^'"]+['"])?\s*;?/gm;
  for (const f of files) {
    const mod = f.replace(/\.ts$/, "");
    const src = await fs.readFile(path.join(JUNDS_LIB, f), "utf8");
    let m;
    while ((m = VALUE.exec(src))) index.set(m[1], mod);
    while ((m = TYPE.exec(src))) index.set(m[1], mod);
    while ((m = LIST.exec(src))) {
      for (const part of m[2].split(",")) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const stripped = trimmed.replace(/^type\s+/, "");
        const asMatch = stripped.match(/(\S+)\s+as\s+(\S+)/);
        const name = asMatch ? asMatch[2] : stripped;
        if (/^[\p{ID_Start}_$][\p{ID_Continue}$]*$/u.test(name) && !index.has(name)) {
          index.set(name, mod);
        }
      }
    }
  }
  return index;
}

const IMPORT_FROM_FINANCE = /import\s+(type\s+)?\{([^}]*)\}\s*from\s+["']@junds\/ui\/finance["'];?/g;

function parseImportList(body, fileLevelType) {
  return body
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((part) => {
      const isType = fileLevelType || /^type\s+/.test(part);
      const stripped = part.replace(/^type\s+/, "");
      const asMatch = stripped.match(/^(\S+)\s+as\s+(\S+)$/);
      return {
        original: stripped,
        local: asMatch ? asMatch[2] : stripped,
        imported: asMatch ? asMatch[1] : stripped,
        isType,
      };
    });
}

function rewriteServerFile(src, symbolIndex) {
  let changed = false;
  const next = src.replace(IMPORT_FROM_FINANCE, (m, typeKw, body) => {
    const items = parseImportList(body, !!typeKw);
    const groups = new Map(); // mod -> { values: [...], types: [...] }
    const unmapped = [];
    for (const it of items) {
      const mod = symbolIndex.get(it.imported);
      if (!mod) {
        unmapped.push(it);
        continue;
      }
      if (!groups.has(mod)) groups.set(mod, { values: [], types: [] });
      const renderItem = it.local === it.imported ? it.imported : `${it.imported} as ${it.local}`;
      groups.get(mod)[it.isType ? "types" : "values"].push(renderItem);
    }
    const lines = [];
    for (const [mod, { values, types }] of [...groups.entries()].sort()) {
      if (values.length) lines.push(`import { ${values.join(", ")} } from "@junds/ui/finance/lib/${mod}";`);
      if (types.length) lines.push(`import type { ${types.join(", ")} } from "@junds/ui/finance/lib/${mod}";`);
    }
    if (unmapped.length) {
      const v = unmapped.filter((i) => !i.isType).map((i) => i.local === i.imported ? i.imported : `${i.imported} as ${i.local}`);
      const t = unmapped.filter((i) => i.isType).map((i) => i.local === i.imported ? i.imported : `${i.imported} as ${i.local}`);
      if (v.length) lines.push(`import { ${v.join(", ")} } from "@junds/ui/finance";`);
      if (t.length) lines.push(`import type { ${t.join(", ")} } from "@junds/ui/finance";`);
    }
    changed = true;
    return lines.join("\n");
  });
  return { src: next, changed };
}

async function main() {
  const symbolIndex = await buildSymbolIndex();

  const targets = new Set(SERVER_FILES);
  for await (const f of walk(path.join(BM, "app", "api"))) targets.add(f);

  let touched = 0;
  for (const file of targets) {
    let src;
    try { src = await fs.readFile(file, "utf8"); } catch { continue; }
    const { src: next, changed } = rewriteServerFile(src, symbolIndex);
    if (changed && next !== src) {
      await fs.writeFile(file, next, "utf8");
      touched++;
      console.log("rewrote", path.relative(BM, file));
    }
  }
  console.log(`Done. ${touched} server file(s) updated.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
