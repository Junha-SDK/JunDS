/**
 * 콘텐츠 게이트(08-mcp §7-2·DEC-026) — 정본은 루트 docs-content/(콘텐츠 트랙 DEC-021).
 * 스키마·전단사·실물 대조는 정본의 build-index.mjs가 강제하므로 여기서는
 *   1) build-index 실행이 성공하는지(검증기 위임 — 로직 중복 저작 금지)
 *   2) MCP 보완 게이트: web done* 행은 web 스니펫이 저작돼 있어야 한다
 *      (build-index의 게이트는 ¬done ⇒ null 방향만 — 역방향 커버리지는 MCP 계약)
 * 만 본다.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { beforeAll, describe, expect, it } from "vitest";

import { findRepoRoot, loadLive } from "../src/data.mjs";
import { contentFor, normStatus } from "../src/tools/common.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const root = findRepoRoot({ startDir: HERE, env: {} });

let data;
beforeAll(async () => {
  data = await loadLive(root);
});

describe("docs-content 게이트", () => {
  it("정본 검증기(build-index.mjs) 통과", () => {
    const res = spawnSync(
      process.execPath,
      [join(root, "docs-content", "build-index.mjs")],
      { encoding: "utf8" },
    );
    expect(res.status, res.stderr || res.stdout).toBe(0);
  });

  it("전단사 — 콘텐츠 엔트리 수 = 원장 행 수", () => {
    expect(Object.keys(data.content).length).toBe(data.ledger.rows.length);
  });

  it("보완 게이트 — web done* 행 전수에 web 스니펫 저작", () => {
    const missing = data.ledger.rows
      .filter((r) => normStatus(r.web) === "done")
      .filter((r) => !contentFor(data, r)?.snippets?.web)
      .map((r) => r.id);
    expect(
      missing,
      `web:done인데 web 스니펫 미저작: ${missing.join(", ")} — ` +
        "docs-content/<id>.json 저작이 배치 DoD다(DEC-016-2·DEC-026)",
    ).toEqual([]);
  });
});
