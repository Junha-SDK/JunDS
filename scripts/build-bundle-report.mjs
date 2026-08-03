#!/usr/bin/env node
/**
 * Per-component bundle size report.
 *
 * Bundles each `ds/<kind>/<Name>/<Name>.tsx` with esbuild in tree-shaking
 * mode (React/clsx/tailwind-merge marked external) and records raw +
 * gzipped output bytes. Falls back to a raw-source size estimate if
 * esbuild is unavailable.
 *
 * Output: `.ai/bundle.json`
 */
import { readdir, stat, mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { cpus } from "node:os";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DS = join(ROOT, "ds");
const OUT = join(ROOT, ".ai", "bundle.json");
const CACHE = join(ROOT, ".ai", ".bundle-cache.json");
const CONCURRENCY = Math.max(2, Math.min(8, cpus()?.length || 4));

const KINDS = [
  { dir: "primitives", kind: "primitive" },
  { dir: "composites", kind: "composite" },
  { dir: "patterns", kind: "pattern" },
];

const EXTERNAL = ["react", "react-dom", "react/jsx-runtime", "clsx", "tailwind-merge"];

async function listEntries() {
  const tasks = KINDS.map(async ({ dir, kind }) => {
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
          .then((s) => ({ ...c, mtimeMs: s.mtimeMs }))
          .catch(() => null),
      ),
    );
    return stats.filter(Boolean);
  });
  const lists = await Promise.all(tasks);
  return lists.flat();
}

async function tryLoadEsbuild() {
  try {
    const mod = await import("esbuild");
    return mod;
  } catch {
    return null;
  }
}

async function bundleWithEsbuild(esbuild, file) {
  const result = await esbuild.build({
    entryPoints: [file],
    bundle: true,
    format: "esm",
    platform: "neutral",
    target: "es2020",
    jsx: "automatic",
    treeShaking: true,
    minify: false,
    sourcemap: false,
    write: false,
    logLevel: "silent",
    external: EXTERNAL,
    loader: { ".tsx": "tsx", ".ts": "ts" },
    absWorkingDir: ROOT,
    metafile: false,
  });
  if (!result.outputFiles || result.outputFiles.length === 0) {
    throw new Error("no output produced");
  }
  // Use the JS output (esbuild may produce additional CSS files etc.)
  const jsOut = result.outputFiles.find((f) => f.path.endsWith(".js")) || result.outputFiles[0];
  const text = jsOut.text;
  const raw = Buffer.byteLength(text, "utf8");
  const gz = gzipSync(text).length;
  return { rawBytes: raw, gzipBytes: gz };
}

async function fallbackSize(file) {
  // Crude fallback: source bytes + bytes of resolvable internal deps.
  // We don't recursively walk; this is purely defensive.
  const buf = await readFile(file);
  const raw = buf.byteLength;
  const gz = gzipSync(buf).length;
  return { rawBytes: raw, gzipBytes: gz };
}

function aggregate(components) {
  const totals = { byKind: {}, all: { rawBytes: 0, gzipBytes: 0, count: 0 } };
  for (const c of components) {
    if (!totals.byKind[c.kind]) {
      totals.byKind[c.kind] = { rawBytes: 0, gzipBytes: 0, count: 0 };
    }
    totals.byKind[c.kind].rawBytes += c.rawBytes;
    totals.byKind[c.kind].gzipBytes += c.gzipBytes;
    totals.byKind[c.kind].count += 1;
    totals.all.rawBytes += c.rawBytes;
    totals.all.gzipBytes += c.gzipBytes;
    totals.all.count += 1;
  }
  return totals;
}

async function loadCache() {
  try {
    return JSON.parse(await readFile(CACHE, "utf8"));
  } catch {
    return { entries: {} };
  }
}

async function main() {
  const [entries, esbuild, cache] = await Promise.all([
    listEntries(),
    tryLoadEsbuild(),
    loadCache(),
  ]);
  const mode = esbuild ? "esbuild" : "fallback";
  console.log(
    `[bundle-report] Found ${entries.length} components. Mode: ${mode}. Concurrency: ${CONCURRENCY}.`,
  );

  const components = new Array(entries.length);
  let failed = 0;
  let cached = 0;
  let cursor = 0;
  const cacheKey = (e) => `${mode}:${e.kind}:${e.name}`;

  async function worker() {
    while (true) {
      const idx = cursor++;
      if (idx >= entries.length) return;
      const entry = entries[idx];
      const key = cacheKey(entry);
      const prev = cache.entries[key];
      let sizes;
      if (prev && prev.mtimeMs === entry.mtimeMs) {
        sizes = { rawBytes: prev.rawBytes, gzipBytes: prev.gzipBytes };
        cached += 1;
      } else {
        try {
          sizes = esbuild
            ? await bundleWithEsbuild(esbuild, entry.file)
            : await fallbackSize(entry.file);
        } catch (err) {
          failed += 1;
          console.warn(
            `[bundle-report] (${idx + 1}/${entries.length}) ${entry.name} failed: ${
              err.message
            }. Falling back to source size.`,
          );
          sizes = await fallbackSize(entry.file);
        }
        cache.entries[key] = { ...sizes, mtimeMs: entry.mtimeMs };
      }
      components[idx] = {
        name: entry.name,
        kind: entry.kind,
        file: relative(ROOT, entry.file).replace(/\\/g, "/"),
        rawBytes: sizes.rawBytes,
        gzipBytes: sizes.gzipBytes,
      };
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  components.sort((a, b) => b.gzipBytes - a.gzipBytes);

  const payload = {
    generatedAt: new Date().toISOString(),
    mode,
    external: EXTERNAL,
    components,
    totals: aggregate(components),
  };

  await mkdir(dirname(OUT), { recursive: true });
  await Promise.all([
    writeFile(OUT, JSON.stringify(payload, null, 2) + "\n", "utf8"),
    writeFile(CACHE, JSON.stringify(cache), "utf8"),
  ]);

  console.log(
    `[bundle-report] Wrote ${relative(ROOT, OUT)}: ${components.length} components, ` +
      `${cached} cached, ${failed} fell back. Total raw=${payload.totals.all.rawBytes}B, gzip=${payload.totals.all.gzipBytes}B.`,
  );
  console.log("[bundle-report] Top 5 by gzipBytes:");
  for (const c of components.slice(0, 5)) {
    console.log(
      `  - ${c.name.padEnd(24)} ${c.kind.padEnd(10)} raw=${c.rawBytes
        .toString()
        .padStart(7)}B gzip=${c.gzipBytes.toString().padStart(6)}B`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
