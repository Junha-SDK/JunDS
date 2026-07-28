/** SSE 와이어 계약 파서 테스트 — malformed 페이로드 방어 검증. */
import { describe, it, expect } from "vitest";
import {
  parseStreamTickEvent,
  parseIndexTickEvent,
  parseOrderBookTickEvent,
} from "../src/stream.js";

describe("parseStreamTickEvent", () => {
  it("정상 tick 통과 (venue 옵셔널)", () => {
    const t = parseStreamTickEvent(
      JSON.stringify({
        symbol: "삼성전자",
        code: "005930",
        price: 71200,
        change: 1200,
        changePct: 1.71,
      }),
    );
    expect(t).not.toBeNull();
    expect(t!.symbol).toBe("삼성전자");
    expect(t!.venue).toBeUndefined();
    const t2 = parseStreamTickEvent(
      JSON.stringify({ symbol: "s", code: "c", price: 1, change: 0, changePct: 0, venue: "NXT" }),
    );
    expect(t2!.venue).toBe("NXT");
  });

  it("symbol 없음/price 비수치/비JSON/null 은 전부 null", () => {
    expect(parseStreamTickEvent(JSON.stringify({ code: "005930", price: 1 }))).toBeNull();
    expect(parseStreamTickEvent(JSON.stringify({ symbol: "s", price: "abc" }))).toBeNull();
    expect(parseStreamTickEvent("not-json{")).toBeNull();
    expect(parseStreamTickEvent("null")).toBeNull();
  });
});

describe("parseIndexTickEvent", () => {
  it("정상 통과 + receivedAt 누락 시 현재 시각 보충", () => {
    const before = Date.now();
    const t = parseIndexTickEvent(
      JSON.stringify({ name: "KOSPI", value: 7402.77, change: -12.3, changePct: -0.17 }),
    );
    expect(t).not.toBeNull();
    expect(t!.name).toBe("KOSPI");
    expect(t!.receivedAt).toBeGreaterThanOrEqual(before);
    const explicit = parseIndexTickEvent(
      JSON.stringify({ name: "KOSDAQ", value: 1, change: 0, changePct: 0, receivedAt: 123 }),
    );
    expect(explicit!.receivedAt).toBe(123);
  });

  it("name 없음/비JSON 은 null", () => {
    expect(parseIndexTickEvent(JSON.stringify({ value: 1 }))).toBeNull();
    expect(parseIndexTickEvent("{{")).toBeNull();
  });
});

describe("parseOrderBookTickEvent", () => {
  it("정상 통과", () => {
    const t = parseOrderBookTickEvent(
      JSON.stringify({
        symbol: "삼성전자",
        asks: [{ price: 71300, qty: 10 }],
        bids: [{ price: 71200, qty: 20 }],
        totalAskQty: 10,
        totalBidQty: 20,
        receivedAt: 1,
      }),
    );
    expect(t).not.toBeNull();
    expect(t!.asks[0]!.price).toBe(71300);
  });

  it("symbol 없음/비JSON 은 null", () => {
    expect(parseOrderBookTickEvent(JSON.stringify({ asks: [] }))).toBeNull();
    expect(parseOrderBookTickEvent("]")).toBeNull();
  });
});
