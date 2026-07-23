/** 티커 매핑 계약 테스트. */
import { describe, it, expect } from "vitest";
import { TICKER_MAP, INDEX_TICKERS, tickerFor } from "../src/tickers.js";

describe("tickers", () => {
  it("tickerFor: 매핑 조회, 미지 종목 null", () => {
    expect(tickerFor("삼성전자")).toBe("005930.KS");
    expect(tickerFor("리노공업")).toBe("058470.KQ");
    expect(tickerFor("없는종목")).toBeNull();
  });

  it("모든 항목이 6자리.KS|KQ 형식 (kisCodeFor 호환 보장)", () => {
    for (const [name, ticker] of Object.entries(TICKER_MAP)) {
      expect(ticker, `${name} → ${ticker}`).toMatch(/^\d{6}\.(KS|KQ)$/);
    }
  });

  it("지수 티커 보존 (v2 데이터)", () => {
    expect(INDEX_TICKERS.kospi).toBe("^KS11");
    expect(INDEX_TICKERS.kosdaq).toBe("^KQ11");
  });
});
