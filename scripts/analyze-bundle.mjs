#!/usr/bin/env node
import { readdir, stat } from "fs/promises";
import { join, relative } from "path";

const DIST = join(process.cwd(), "dist");

async function getSize(path) {
  try {
    const s = await stat(path);
    return s.size;
  } catch {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function walk(dir) {
  const entries = [];
  try {
    const items = await readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const full = join(dir, item.name);
      if (item.isDirectory()) {
        entries.push(...(await walk(full)));
      } else {
        entries.push({ path: relative(DIST, full), size: await getSize(full) });
      }
    }
  } catch {
    /* dist doesn't exist yet */
  }
  return entries;
}

async function main() {
  console.log("\n📦 JunDS Bundle Analysis\n");
  const files = await walk(DIST);
  if (files.length === 0) {
    console.log("  No dist/ found. Run `npm run build:lib` first.\n");
    return;
  }

  files.sort((a, b) => b.size - a.size);
  const total = files.reduce((s, f) => s + f.size, 0);

  console.log("  File                                Size");
  console.log("  " + "─".repeat(50));
  files.forEach((f) => {
    console.log(`  ${f.path.padEnd(38)} ${formatBytes(f.size).padStart(10)}`);
  });
  console.log("  " + "─".repeat(50));
  console.log(`  ${"Total".padEnd(38)} ${formatBytes(total).padStart(10)}`);
  console.log();
}

main();
