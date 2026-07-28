/**
 * 틱 스토어 + SSE 풀 계약 테스트.
 * 모듈 상태 격리를 위해 vi.resetModules + 동적 import 패턴 사용.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { jsonResponse, stubFetchByUrl, stubBrowserGlobals, FakeEventSource } from "./helpers.js";

async function importStore() {
  return import("../src/livePrices.js");
}
async function importConfig() {
  return import("../src/config.js");
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("subscribe / currentTick / seedTick (v2 시그니처)", () => {
  it("구독 즉시 현재값 1회 콜백, 시드 전 기본값 0/flat", async () => {
    const { subscribe } = await importStore();
    const seen: unknown[] = [];
    const off = subscribe("삼성전자", (t) => seen.push(t));
    expect(seen).toEqual([{ price: 0, change: 0, trend: "flat" }]);
    off();
  });

  it("configureFinanceData({ seedLookup }) 로 초기 시드 주입 (v2 findStock 대체)", async () => {
    const { configureFinanceData } = await importConfig();
    configureFinanceData({
      seedLookup: (name) => (name === "삼성전자" ? { price: 71200, change: 1.7 } : undefined),
    });
    const { currentTick } = await importStore();
    expect(currentTick("삼성전자")).toEqual({ price: 71200, change: 1.7, trend: "flat" });
    expect(currentTick("모르는종목").price).toBe(0);
  });

  it("seedTick: trend 자동 계산 + 구독자 방송", async () => {
    const { subscribe, seedTick } = await importStore();
    const seen: Array<{ price: number; trend: string }> = [];
    subscribe("A", (t) => seen.push({ price: t.price, trend: t.trend }));
    seedTick("A", 100, 1.0);
    seedTick("A", 110, 2.0);
    seedTick("A", 105, 1.5);
    expect(seen).toEqual([
      { price: 0, trend: "flat" }, // 구독 즉시 (시드 전 기본값)
      { price: 100, trend: "up" }, // prev 는 0-시드 → 100 > 0
      { price: 110, trend: "up" },
      { price: 105, trend: "down" },
    ]);
  });

  it("seedTick: 무효값(0/음수/NaN) 무시", async () => {
    const { seedTick, currentTick } = await importStore();
    seedTick("B", 0, 1);
    seedTick("B", -5, 1);
    seedTick("B", Number.NaN, 1);
    expect(currentTick("B").price).toBe(0); // 여전히 기본 시드
  });

  it("seedTick: 동일 tick dedup — 구독자 재호출 없음", async () => {
    const { subscribe, seedTick } = await importStore();
    const cb = vi.fn();
    subscribe("C", cb);
    seedTick("C", 100, 1.0, "KRX");
    seedTick("C", 100, 1.0, "KRX"); // 완전 동일 → skip
    seedTick("C", 100, 1.0); // venue undefined 도 동일 취급 → skip
    expect(cb).toHaveBeenCalledTimes(2); // 구독 즉시 1 + 첫 시드 1
  });

  it("venue: 새 tick에 venue 없으면 직전 venue 유지", async () => {
    const { seedTick, currentTick } = await importStore();
    seedTick("D", 100, 1.0, "NXT");
    seedTick("D", 101, 1.1);
    expect(currentTick("D").venue).toBe("NXT");
  });

  it("구독 해지 후 방송 중단, 재해지는 무해", async () => {
    const { subscribe, seedTick } = await importStore();
    const cb = vi.fn();
    const off = subscribe("E", cb);
    off();
    off();
    seedTick("E", 100, 1);
    expect(cb).toHaveBeenCalledTimes(1); // 구독 즉시 1회뿐
  });
});

describe("seedSnapshotOnce (v2 useRealPricesSnapshot 페치부)", () => {
  it("KIS 프록시 성공 → 'kis' + 시드", async () => {
    stubFetchByUrl([
      [
        "/api/kis/quotes",
        () => jsonResponse({ items: [{ symbol: "삼성전자", price: 71200, changePct: 1.7 }] }),
      ],
    ]);
    const { seedSnapshotOnce, currentTick } = await importStore();
    expect(await seedSnapshotOnce(["삼성전자"])).toBe("kis");
    expect(currentTick("삼성전자").price).toBe(71200);
  });

  it("KIS 실패 → Yahoo 폴백 'yahoo' (source:'missing' 항목 제외)", async () => {
    stubFetchByUrl([
      ["/api/kis/quotes", () => jsonResponse({}, 500)],
      [
        "/api/quotes",
        () =>
          jsonResponse({
            items: [
              { symbol: "삼성전자", price: 71000, changePct: 1.5, source: "yahoo" },
              { symbol: "미지종목", source: "missing" },
            ],
          }),
      ],
    ]);
    const { seedSnapshotOnce, currentTick } = await importStore();
    expect(await seedSnapshotOnce(["삼성전자", "미지종목"])).toBe("yahoo");
    expect(currentTick("삼성전자").price).toBe(71000);
    expect(currentTick("미지종목").price).toBe(0);
  });

  it("양쪽 모두 실패 → 'error', 빈 입력 → 'error'", async () => {
    stubFetchByUrl([
      ["/api/kis/quotes", () => jsonResponse({}, 500)],
      ["/api/quotes", () => jsonResponse({}, 500)],
    ]);
    const { seedSnapshotOnce } = await importStore();
    expect(await seedSnapshotOnce(["A"])).toBe("error");
    expect(await seedSnapshotOnce([])).toBe("error");
  });

  it("configureFinanceData 로 엔드포인트 교체 가능", async () => {
    const fetchMock = stubFetchByUrl([
      [
        "https://data.junha.dev/kis",
        () => jsonResponse({ items: [{ symbol: "A", price: 10, changePct: 0 }] }),
      ],
    ]);
    const { configureFinanceData } = await importConfig();
    configureFinanceData({ kisQuotesUrl: "https://data.junha.dev/kis" });
    const { seedSnapshotOnce } = await importStore();
    expect(await seedSnapshotOnce(["A"])).toBe("kis");
    expect(String(fetchMock.mock.calls[0]![0])).toContain("https://data.junha.dev/kis?codes=A");
  });
});

describe("SSE 풀 (registerPoolCodes / subscribePoolStatus / getPoolStatus)", () => {
  it("SSR(window 부재)에서는 no-op", async () => {
    const { registerPoolCodes, getPoolStatus } = await importStore();
    const off = registerPoolCodes(["A"]);
    expect(getPoolStatus()).toEqual({ lastSyncAt: null, source: "pending" });
    off(); // 무해
  });

  it("등록 → 60ms debounce 후 SSE 오픈, 50개 단위 chunk", async () => {
    stubBrowserGlobals();
    vi.useFakeTimers();
    stubFetchByUrl([
      ["/api/kis/quotes", () => jsonResponse({ items: [] })],
      ["/api/quotes", () => jsonResponse({ items: [] })],
    ]);
    const { registerPoolCodes } = await importStore();
    const names = Array.from({ length: 60 }, (_, i) => `종목${i}`);
    registerPoolCodes(names);
    expect(FakeEventSource.instances).toHaveLength(0); // debounce 전
    await vi.advanceTimersByTimeAsync(61);
    expect(FakeEventSource.instances).toHaveLength(2); // 50 + 10
    expect(FakeEventSource.instances[0]!.url).toContain("/api/kis/stream?codes=");
    expect(FakeEventSource.instances[0]!.withCredentials).toBe(true);
  });

  it("tick 이벤트 → seedTick 반영 + 풀 소스 'kis' 통지", async () => {
    stubBrowserGlobals();
    vi.useFakeTimers();
    stubFetchByUrl([
      ["/api/kis/quotes", () => jsonResponse({ items: [] })],
      ["/api/quotes", () => jsonResponse({ items: [] })],
    ]);
    const { registerPoolCodes, subscribePoolStatus, currentTick, getPoolStatus } =
      await importStore();
    const statuses: string[] = [];
    subscribePoolStatus((s) => statuses.push(s.source));
    registerPoolCodes(["삼성전자"]);
    await vi.advanceTimersByTimeAsync(61);
    const es = FakeEventSource.instances[0]!;
    es.emit("tick", {
      symbol: "삼성전자",
      code: "005930",
      price: 71200,
      change: 1200,
      changePct: 1.71,
      venue: "KRX",
    });
    // 직전 tick 이 없는 첫 시드 → trend 는 "flat" (v2 동작)
    expect(currentTick("삼성전자")).toEqual({
      price: 71200,
      change: 1.71,
      trend: "flat",
      venue: "KRX",
    });
    expect(getPoolStatus().source).toBe("kis");
    expect(statuses).toEqual(["kis"]); // source 변경 즉시 통지
  });

  it("malformed tick 은 무시", async () => {
    stubBrowserGlobals();
    vi.useFakeTimers();
    stubFetchByUrl([
      ["/api/kis/quotes", () => jsonResponse({ items: [] })],
      ["/api/quotes", () => jsonResponse({ items: [] })],
    ]);
    const { registerPoolCodes, getPoolStatus } = await importStore();
    registerPoolCodes(["A"]);
    await vi.advanceTimersByTimeAsync(61);
    FakeEventSource.instances[0]!.emit("tick", "not-json{");
    expect(getPoolStatus().source).toBe("pending");
  });

  it("통지 스로틀: 같은 source 연속 tick 은 1초 1회, source 변경은 즉시", async () => {
    stubBrowserGlobals();
    vi.useFakeTimers();
    stubFetchByUrl([
      ["/api/kis/quotes", () => jsonResponse({ items: [] })],
      ["/api/quotes", () => jsonResponse({ items: [] })],
    ]);
    const { registerPoolCodes, subscribePoolStatus } = await importStore();
    const cb = vi.fn();
    subscribePoolStatus(cb);
    registerPoolCodes(["A"]);
    await vi.advanceTimersByTimeAsync(61);
    const es = FakeEventSource.instances[0]!;
    es.emit("tick", { symbol: "A", price: 1, code: "", change: 0, changePct: 0 }); // source 변경 → 즉시
    es.emit("tick", { symbol: "A", price: 2, code: "", change: 0, changePct: 0 }); // 1초 내 → 스로틀
    es.emit("tick", { symbol: "A", price: 3, code: "", change: 0, changePct: 0 }); // 1초 내 → 스로틀
    expect(cb).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1001);
    es.emit("tick", { symbol: "A", price: 4, code: "", change: 0, changePct: 0 }); // 1초 경과 → 통지
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it("ref-count: 마지막 해지 시 스트림 닫힘, 재등록 시 재오픈", async () => {
    stubBrowserGlobals();
    vi.useFakeTimers();
    stubFetchByUrl([
      ["/api/kis/quotes", () => jsonResponse({ items: [] })],
      ["/api/quotes", () => jsonResponse({ items: [] })],
    ]);
    const { registerPoolCodes } = await importStore();
    const off1 = registerPoolCodes(["A"]);
    const off2 = registerPoolCodes(["A"]);
    await vi.advanceTimersByTimeAsync(61);
    expect(FakeEventSource.instances).toHaveLength(1);
    off1();
    await vi.advanceTimersByTimeAsync(61);
    expect(FakeEventSource.instances[0]!.closed).toBe(false); // 아직 1명 남음 (키 불변 → 재구성 skip)
    off2();
    await vi.advanceTimersByTimeAsync(61);
    expect(FakeEventSource.instances[0]!.closed).toBe(true); // 전원 이탈 → 닫힘
  });

  it("스냅샷: KIS 시드 + 미시드 종목만 Yahoo 폴백, 종목당 1회", async () => {
    stubBrowserGlobals();
    vi.useFakeTimers();
    const fetchMock = stubFetchByUrl([
      [
        "/api/kis/quotes",
        () => jsonResponse({ items: [{ symbol: "A", price: 10, changePct: 1 }] }),
      ],
      [
        "/api/quotes",
        () =>
          jsonResponse({
            items: [
              { symbol: "A", price: 99, changePct: 9, source: "yahoo" }, // 이미 KIS 시드 → skip
              { symbol: "B", price: 20, changePct: 2, source: "yahoo" },
            ],
          }),
      ],
    ]);
    const { registerPoolCodes, currentTick } = await importStore();
    registerPoolCodes(["A", "B"]);
    await vi.advanceTimersByTimeAsync(100);
    expect(currentTick("A").price).toBe(10); // KIS 값 유지 (yahoo 가 덮지 않음)
    expect(currentTick("B").price).toBe(20); // yahoo 폴백
    // 같은 종목 재등록 → 스냅샷 재발사 없음
    const before = fetchMock.mock.calls.length;
    registerPoolCodes(["A"]);
    await vi.advanceTimersByTimeAsync(100);
    expect(fetchMock.mock.calls.length).toBe(before);
  });
});
