/**
 * 라이브 데이터 정합(08-mcp §7-2) — 파생 이름을 실제 생성물과 전수 대조:
 *   cssVar ↔ packages/web/src/styles/tokens.css 선언 전수 일치
 *   swift  ↔ JdToken.swift accessor 전수 포함
 * 로더의 그룹 목록·Swift enum 매핑이 생성기와 어긋나면 여기서 무조건 잡힌다.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { beforeAll, describe, expect, it } from "vitest";

import { findRepoRoot, loadLive } from "../src/data.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const root = findRepoRoot({ startDir: HERE, env: {} });

let data;
beforeAll(async () => {
  data = await loadLive(root);
});

describe("loadLive", () => {
  it("원장 행 수 = counts.total", () => {
    expect(data.ledger.rows.length).toBe(data.ledger.counts.total);
  });

  it("원장 전 행에 docs-content 엔트리 조인 — (ledgerId, category) 키", () => {
    const missing = data.ledger.rows
      .filter((r) => !data.content[`${r.id}::${r.category}`])
      .map((r) => `${r.id}(${r.category})`);
    expect(missing).toEqual([]);
  });

  it("토큰 cssVar ↔ tokens.css 선언 전수 일치", () => {
    const css = readFileSync(
      join(root, "packages", "web", "src", "styles", "tokens.css"),
      "utf8",
    );
    const declared = new Set(
      [...css.matchAll(/^\s*(--jd-[a-z0-9-]+)\s*:/gm)].map((m) => m[1]),
    );
    const mine = new Set(data.tokens.filter((t) => t.cssVar).map((t) => t.cssVar));
    const notInCss = [...mine].filter((v) => !declared.has(v));
    const notInMine = [...declared].filter((v) => !mine.has(v));
    expect(notInCss, "로더가 계산했지만 tokens.css에 없는 변수").toEqual([]);
    expect(notInMine, "tokens.css에 있지만 로더가 놓친 변수").toEqual([]);
  });

  it("토큰 swift 접근자 ↔ JdToken.swift 전수 포함", () => {
    const swift = readFileSync(
      join(root, "packages", "ios", "Sources", "JunDSCore", "Generated", "JdToken.swift"),
      "utf8",
    );
    const missing = data.tokens
      .filter((t) => t.swift)
      .filter((t) => {
        const name = t.swift.split(".").pop();
        return !swift.includes(`static let ${name}`);
      })
      .map((t) => t.swift);
    expect(missing).toEqual([]);
  });

  it("파일럿 3종 사이즈 매핑 — 스니펫 파생 tag(kebab)가 size-baseline에 해소", () => {
    const byId = (id) =>
      Object.values(data.content).find((c) => c.ledgerId === id);
    for (const id of ["Button", "Input", "Modal"]) {
      const c = byId(id);
      expect(c?.tag, `${id}의 파생 tag`).toBeTruthy();
      const key = c.tag.replace(/^jd-/, "");
      expect(
        data.sizeBaseline.components[key],
        `${id} → size-baseline.components["${key}"]`,
      ).toBeTypeOf("number");
    }
  });
});
