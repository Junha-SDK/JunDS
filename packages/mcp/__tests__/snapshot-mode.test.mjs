/**
 * 스냅샷 모드 동일성(08-mcp §7-4) — build-data 스냅샷을 강제 로드해 라이브 모드와
 * 도구 응답이 동일한지 비교. npx 소비자 경로가 2급 시민이 되지 않게 한다.
 */
import { unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { loadData } from "../src/data.mjs";
import { buildSnapshot } from "../scripts/build-data.mjs";
import { searchComponents } from "../src/tools/search-components.mjs";
import { getComponent } from "../src/tools/get-component.mjs";
import { getUsage } from "../src/tools/get-usage.mjs";
import { getTokens } from "../src/tools/get-tokens.mjs";
import { getStatus } from "../src/tools/get-status.mjs";

const SNAP = join(tmpdir(), `junds-mcp-snap-${process.pid}.json`);

/** 모드 메타만 제거하고 비교 — 본문 데이터는 완전 동일해야 한다. */
const strip = ({ mode, snapshotAt, ...rest }) => rest;

let live;
let snap;

beforeAll(async () => {
  await buildSnapshot(SNAP);
  live = await loadData({ env: {} });
  snap = await loadData({ forceSnapshot: true, snapshotPath: SNAP });
});

afterAll(() => {
  try { unlinkSync(SNAP); } catch { /* 없으면 무시 */ }
});

describe("라이브 ↔ 스냅샷 응답 동일성", () => {
  it("모드 표기", () => {
    expect(live.mode).toBe("live");
    expect(snap.mode).toBe("snapshot");
    expect(snap.snapshotAt).toBeTruthy();
  });

  const CASES = [
    ["search_components", searchComponents, { query: "modal" }],
    ["search_components 필터", searchComponents, { platform: "ios", status: "done" }],
    ["get_component", getComponent, { id: "Button" }],
    ["get_usage", getUsage, { id: "Modal", platform: "uikit" }],
    ["get_tokens", getTokens, { group: "space" }],
    ["get_status", getStatus, {}],
  ];

  for (const [label, fn, input] of CASES) {
    it(label, () => {
      expect(strip(fn(snap, input))).toEqual(strip(fn(live, input)));
    });
  }
});
