#!/usr/bin/env node
/**
 * build-data.mjs — 4계열(원장·docs-content·토큰·사이즈)을 data/snapshot.json 1파일로
 * 스냅샷(08-mcp §3.3). prepublishOnly에서 실행 — npx 소비자는 레포 없이 이 스냅샷을
 * 읽는다. 커밋하지 않는 생성물이다(레포 내 실행은 항상 라이브 직독).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { findRepoRoot, loadLive } from "../src/data.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUT = join(HERE, "..", "data", "snapshot.json");

export async function buildSnapshot(outPath = DEFAULT_OUT) {
  const root = findRepoRoot({ startDir: HERE });
  if (!root) {
    throw new Error("JunDS 레포를 찾을 수 없음 — 레포 체크아웃 안에서 실행해야 한다.");
  }
  const live = await loadLive(root);
  const snapshot = {
    snapshotAt: new Date().toISOString(),
    generatedAt: live.generatedAt,
    ledger: live.ledger,
    content: live.content,
    tokens: live.tokens,
    sizeBaseline: live.sizeBaseline,
  };
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(snapshot));
  return {
    outPath,
    rows: live.ledger.rows.length,
    content: Object.keys(live.content).length,
    tokens: live.tokens.length,
  };
}

const isMain = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMain) {
  buildSnapshot()
    .then((r) => {
      console.log(
        `[mcp] snapshot → ${r.outPath} (rows ${r.rows} · content ${r.content} · tokens ${r.tokens})`,
      );
    })
    .catch((err) => {
      console.error(`[mcp] snapshot 실패: ${err.message}`);
      process.exit(1);
    });
}
