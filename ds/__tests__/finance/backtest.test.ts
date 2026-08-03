import { describe, it, expect } from "vitest";
import { backtestInvestor } from "@/ds/finance/lib/backtest";

describe("backtestInvestor", () => {
  const result = backtestInvestor("buffett", "삼성전자", { bars: 60, rebalanceEvery: 5 });

  it("produces one point per bar with aligned metadata", () => {
    expect(result.investor).toBe("buffett");
    expect(result.symbol).toBe("삼성전자");
    expect(result.bars).toBe(60);
    expect(result.points).toHaveLength(60);
    for (const p of result.points) {
      expect(p.price).toBeGreaterThan(0);
      expect(p.weight).toBeGreaterThanOrEqual(0);
      expect(p.weight).toBeLessThanOrEqual(1);
      expect(p.equity).toBeGreaterThan(0);
      expect(p.buyHold).toBeGreaterThan(0);
    }
  });

  it("counts one verdict per rebalance", () => {
    // rebalances at i = 0, 5, ..., 55 → 12 evaluations
    const total = Object.values(result.verdictHist).reduce((s, n) => s + n, 0);
    expect(total).toBe(12);
  });

  it("computes buy & hold from first to last close", () => {
    const first = result.points[0].price;
    const last = result.points[result.points.length - 1].price;
    expect(result.points[result.points.length - 1].buyHold).toBeCloseTo(last / first, 10);
    expect(result.buyHoldReturn).toBeCloseTo(last / first - 1, 10);
  });

  it("reports drawdown as a non-positive fraction", () => {
    expect(result.maxDrawdown).toBeLessThanOrEqual(0);
    expect(result.maxDrawdown).toBeGreaterThanOrEqual(-1);
  });

  it("ties totalReturn/cagr to the final equity", () => {
    const finalEquity = result.points[result.points.length - 1].equity;
    expect(result.totalReturn).toBeCloseTo(finalEquity - 1, 10);
    const years = 60 / 252;
    expect(result.cagr).toBeCloseTo(Math.pow(finalEquity, 1 / years) - 1, 10);
  });

  it("is deterministic for the same inputs", () => {
    const again = backtestInvestor("buffett", "삼성전자", { bars: 60, rebalanceEvery: 5 });
    expect(again).toEqual(result);
  });

  it("still runs for an unknown symbol (fallback seed)", () => {
    const r = backtestInvestor("lynch", "존재하지않는종목", { bars: 30 });
    expect(r.points).toHaveLength(30);
    expect(r.bars).toBe(30);
  });
});
