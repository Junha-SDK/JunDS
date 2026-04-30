#!/usr/bin/env node
//
// Reads `coverage/coverage-summary.json` (vitest v8 reporter) and emits a
// trimmed `.ai/coverage.json` agents can consume without parsing the full
// per-file detail. Run AFTER `npm run test -- --coverage` (or wire the test
// script to always emit coverage in CI).

import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inFile = path.join(repoRoot, "coverage", "coverage-summary.json");
const outFile = path.join(repoRoot, ".ai", "coverage.json");

async function exists(p) {
  try {
    await access(p, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(inFile))) {
    console.error(
      `[coverage-summary] missing ${path.relative(process.cwd(), inFile)}`,
    );
    console.error(
      `  run: npx vitest run --coverage --coverage.reporter=json-summary`,
    );
    process.exit(1);
  }

  const raw = JSON.parse(await readFile(inFile, "utf8"));
  const total = raw.total ?? {};

  // Per-file: keep only ds/ files, drop the absolute path prefix.
  const perFile = [];
  for (const [file, data] of Object.entries(raw)) {
    if (file === "total") continue;
    const rel = path.relative(repoRoot, file);
    if (!rel.startsWith("ds" + path.sep) && !rel.startsWith("ds/")) continue;
    perFile.push({
      file: rel,
      lines: data.lines?.pct ?? 0,
      statements: data.statements?.pct ?? 0,
      functions: data.functions?.pct ?? 0,
      branches: data.branches?.pct ?? 0,
    });
  }
  perFile.sort((a, b) => a.lines - b.lines);

  const lowest = perFile.slice(0, 10);

  const report = {
    generatedAt: new Date().toISOString(),
    total: {
      lines: total.lines?.pct ?? 0,
      statements: total.statements?.pct ?? 0,
      functions: total.functions?.pct ?? 0,
      branches: total.branches?.pct ?? 0,
    },
    fileCount: perFile.length,
    lowestCovered: lowest,
  };

  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(report, null, 2) + "\n");
  console.log(
    `[coverage-summary] total lines=${report.total.lines}% functions=${report.total.functions}% → ${path.relative(process.cwd(), outFile)}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
