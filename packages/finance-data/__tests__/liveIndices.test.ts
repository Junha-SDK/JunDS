/** 지수 SSE 스토어 계약 테스트 — EventSource 스텁. */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { stubBrowserGlobals, FakeEventSource } from "./helpers.js";

async function importIndices() {
  return import("../src/liveIndices.js");
}

beforeEach(() => {
  vi.resetModules();
  stubBrowserGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("subscribeIndex", () => {
  it("첫 구독 시 SSE 오픈 (indices 쿼리), 이벤트 수신 → 콜백", async () => {
    const { subscribeIndex } = await importIndices();
    const seen: unknown[] = [];
    subscribeIndex("KOSPI", (t) => seen.push(t));
    expect(FakeEventSource.instances).toHaveLength(1);
    expect(FakeEventSource.instances[0]!.url).toContain("/api/kis/stream?indices=KOSPI");
    FakeEventSource.instances[0]!.emit("index", {
      name: "KOSPI", value: 7402.77, change: -12.3, changePct: -0.17, receivedAt: 42,
    });
    expect(seen).toEqual([
      { name: "KOSPI", value: 7402.77, change: -12.3, changePct: -0.17, receivedAt: 42 },
    ]);
  });

  it("다른 지수 구독 추가 시 URL 합쳐 재오픈", async () => {
    const { subscribeIndex } = await importIndices();
    subscribeIndex("KOSPI", () => {});
    subscribeIndex("KOSDAQ", () => {});
    expect(FakeEventSource.instances).toHaveLength(2);
    expect(FakeEventSource.instances[0]!.closed).toBe(true); // 기존 스트림 닫힘
    expect(decodeURIComponent(FakeEventSource.instances[1]!.url)).toContain("KOSDAQ,KOSPI");
  });

  it("마지막 tick 캐시 → 신규 구독자에 즉시 재생 + currentIndexTick", async () => {
    const { subscribeIndex, currentIndexTick } = await importIndices();
    subscribeIndex("KOSPI", () => {});
    FakeEventSource.instances[0]!.emit("index", {
      name: "KOSPI", value: 100, change: 1, changePct: 1, receivedAt: 1,
    });
    const seen: unknown[] = [];
    subscribeIndex("KOSPI", (t) => seen.push(t));
    expect(seen).toHaveLength(1); // 캐시 즉시 재생
    expect(currentIndexTick("KOSPI")!.value).toBe(100);
    expect(currentIndexTick("없는지수")).toBeNull();
  });

  it("이름 없는/깨진 이벤트 무시", async () => {
    const { subscribeIndex } = await importIndices();
    const cb = vi.fn();
    subscribeIndex("KOSPI", cb);
    FakeEventSource.instances[0]!.emit("index", { value: 1 });
    FakeEventSource.instances[0]!.emit("index", "{{bad");
    expect(cb).not.toHaveBeenCalled();
  });

  it("전원 해지 시 스트림 닫고 재오픈 안 함", async () => {
    const { subscribeIndex } = await importIndices();
    const off = subscribeIndex("KOSPI", () => {});
    off();
    expect(FakeEventSource.instances).toHaveLength(1);
    expect(FakeEventSource.instances[0]!.closed).toBe(true);
  });
});
