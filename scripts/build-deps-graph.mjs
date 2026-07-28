#!/usr/bin/env node
/**
 * Internal dependency graph for JunDS components.
 *
 * For each `ds/<kind>/<Name>/<Name>.tsx`, parses internal lib imports
 * (those targeting `../../primitives/`, `../../composites/`,
 * `../../patterns/`, `../../core/`, `../../layout/`, `../../hooks/`,
 * `../../tokens/`, `../../utils/`) and builds a forward + reverse graph.
 *
 * Output: `.ai/deps.json`
 */
import { readdir, readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DS = join(ROOT, "ds");
const OUT = join(ROOT, ".ai", "deps.json");

const KINDS = [
  { dir: "primitives", kind: "primitive" },
  { dir: "composites", kind: "composite" },
  { dir: "patterns", kind: "pattern" },
];

// Map dir-segment (after `../../`) → kind label
const KIND_BY_SEGMENT = {
  primitives: "primitive",
  composites: "composite",
  patterns: "pattern",
  core: "core",
  layout: "layout",
  hooks: "hook",
  tokens: "token",
  utils: "util",
};

// Spec regex (allow type-only and side-effect-style is not parsed; only named bindings).
const IMPORT_RE = /import\s+(?:type\s+)?{[^}]*}\s+from\s+["']([^"']+)["']/g;
// Also catch default + namespace imports because they are common in tsx files.
const DEFAULT_IMPORT_RE =
  /import\s+(?:type\s+)?(?:[A-Za-z_$][\w$]*\s*,\s*)?(?:[A-Za-z_$][\w$]*|\*\s+as\s+[A-Za-z_$][\w$]*)\s+from\s+["']([^"']+)["']/g;

async function listEntries() {
  const lists = await Promise.all(
    KINDS.map(async ({ dir, kind }) => {
      const root = join(DS, dir);
      if (!existsSync(root)) return [];
      const names = await readdir(root, { withFileTypes: true });
      const candidates = names
        .filter((d) => d.isDirectory())
        .map((d) => ({ name: d.name, kind, file: join(root, d.name, `${d.name}.tsx`) }))
        .filter((e) => !e.file.includes(".stories.") && !e.file.includes(".test."));
      const stats = await Promise.all(
        candidates.map((c) =>
          stat(c.file)
            .then(() => c)
            .catch(() => null),
        ),
      );
      return stats.filter(Boolean);
    }),
  );
  return lists.flat();
}

function extractImportPaths(source) {
  const paths = new Set();
  for (const re of [IMPORT_RE, DEFAULT_IMPORT_RE]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(source)) !== null) {
      paths.add(m[1]);
    }
  }
  return [...paths];
}

function classifyImport(spec) {
  // Must be a relative `../../<segment>/...` import inside ds/.
  if (!spec.startsWith("../../")) return null;
  const rest = spec.slice("../../".length);
  const slash = rest.indexOf("/");
  if (slash < 0) return null;
  const segment = rest.slice(0, slash);
  const kind = KIND_BY_SEGMENT[segment];
  if (!kind) return null;
  const tail = rest.slice(slash + 1);
  // Take the first path segment after the kind dir as the component name.
  // e.g. "Foo" or "Foo/Foo" or "Foo/index".
  const name = tail.split("/")[0];
  if (!name) return null;
  return { kind, name };
}

async function main() {
  const entries = await listEntries();
  console.log(`[deps-graph] Found ${entries.length} components.`);

  const graph = {};
  const knownNames = new Set(entries.map((e) => e.name));

  // First pass: forward edges.
  for (const entry of entries) {
    const source = await readFile(entry.file, "utf8");
    const importSpecs = extractImportPaths(source);
    const seen = new Map();
    for (const spec of importSpecs) {
      const ref = classifyImport(spec);
      if (!ref) continue;
      // Don't self-reference (e.g. Foo importing from itself via barrel).
      if (ref.name === entry.name && ref.kind === entry.kind) continue;
      const key = `${ref.kind}::${ref.name}`;
      if (!seen.has(key)) seen.set(key, ref);
    }
    graph[entry.name] = {
      kind: entry.kind,
      file: relative(ROOT, entry.file).replace(/\\/g, "/"),
      imports: [...seen.values()].sort((a, b) =>
        a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind.localeCompare(b.kind),
      ),
      importedBy: [],
    };
  }

  // Second pass: reverse edges (only when target is a known component).
  for (const [name, node] of Object.entries(graph)) {
    for (const dep of node.imports) {
      if (!knownNames.has(dep.name)) continue;
      const target = graph[dep.name];
      if (!target) continue;
      if (!target.importedBy.includes(name)) target.importedBy.push(name);
    }
  }
  for (const node of Object.values(graph)) {
    node.importedBy.sort((a, b) => a.localeCompare(b));
  }

  // Stats
  const mostDependedOn = Object.entries(graph)
    .map(([name, n]) => ({ name, kind: n.kind, count: n.importedBy.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const heaviestImporters = Object.entries(graph)
    .map(([name, n]) => ({
      name,
      kind: n.kind,
      count: n.imports.filter((d) => knownNames.has(d.name)).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Cycle detection (DFS over component-to-component edges)
  const cycles = detectCycles(graph, knownNames);

  const payload = {
    generatedAt: new Date().toISOString(),
    componentCount: entries.length,
    graph,
    stats: {
      mostDependedOn,
      heaviestImporters,
      cycles,
    },
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(payload, null, 2) + "\n", "utf8");

  console.log(`[deps-graph] Wrote ${relative(ROOT, OUT)}: ${entries.length} nodes.`);
  console.log("[deps-graph] Top 5 most-depended-on:");
  for (const r of mostDependedOn.slice(0, 5)) {
    console.log(`  - ${r.name.padEnd(24)} ${r.kind.padEnd(10)} importedBy=${r.count}`);
  }
  if (cycles.length === 0) {
    console.log("[deps-graph] No circular dependencies detected.");
  } else {
    console.warn(`[deps-graph] WARNING: ${cycles.length} cycle(s) detected:`);
    for (const cyc of cycles.slice(0, 10)) {
      console.warn("  - " + cyc.join(" -> "));
    }
  }
}

function detectCycles(graph, knownNames) {
  const cycles = [];
  const seen = new Set();
  const stack = new Set();
  const path = [];

  function dfs(name) {
    if (stack.has(name)) {
      // Extract cycle from path
      const idx = path.indexOf(name);
      if (idx >= 0) {
        const cyc = [...path.slice(idx), name];
        const key = canonicalCycleKey(cyc);
        if (!seenCycles.has(key)) {
          seenCycles.add(key);
          cycles.push(cyc);
        }
      }
      return;
    }
    if (seen.has(name)) return;
    seen.add(name);
    stack.add(name);
    path.push(name);
    const node = graph[name];
    if (node) {
      for (const dep of node.imports) {
        if (!knownNames.has(dep.name)) continue;
        dfs(dep.name);
      }
    }
    stack.delete(name);
    path.pop();
  }

  const seenCycles = new Set();
  for (const name of Object.keys(graph)) {
    dfs(name);
  }
  return cycles;
}

function canonicalCycleKey(cyc) {
  // Cycle is [a, b, c, a] — drop the trailing repeat, then rotate to start at min.
  const ring = cyc.slice(0, -1);
  let minIdx = 0;
  for (let i = 1; i < ring.length; i++) {
    if (ring[i] < ring[minIdx]) minIdx = i;
  }
  const rot = ring.slice(minIdx).concat(ring.slice(0, minIdx));
  return rot.join("->");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
