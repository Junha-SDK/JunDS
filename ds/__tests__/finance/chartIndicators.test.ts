import { describe, it, expect } from "vitest";
import {
  computeSMA,
  computeEMA,
  computeBollinger,
  computeRSI,
  computeMACD,
  toHeikinAshi,
  computeStochastic,
  computeOBV,
  computeVWAP,
  computeATR,
  computeWilliamsR,
  computeCCI,
  computeIchimoku,
  computePivot,
  computeRegression,
  detectPatterns,
  computeVolumeProfile,
} from "@/ds/finance/lib/chartIndicators";

interface Bar {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

function bar(o: number, h: number, l: number, c: number, v = 100): Bar {
  return { o, h, l, c, v };
}

/** n개의 동일한 바 — 지표 수렴값 검증용 */
function constantBars(n: number, b: Bar = bar(100, 110, 90, 100)): Bar[] {
  return Array.from({ length: n }, () => ({ ...b }));
}

describe("computeSMA", () => {
  it("computes a simple moving average with null warmup", () => {
    expect(computeSMA([1, 2, 3, 4, 5], 3)).toEqual([null, null, 2, 3, 4]);
  });

  it("returns the values themselves for period=1", () => {
    expect(computeSMA([3, 7, 11], 1)).toEqual([3, 7, 11]);
  });

  it("returns all nulls when period > length", () => {
    expect(computeSMA([1, 2, 3], 10)).toEqual([null, null, null]);
  });

  it("returns an empty array for empty input", () => {
    expect(computeSMA([], 5)).toEqual([]);
  });
});

describe("computeEMA", () => {
  it("seeds with the SMA and then applies k-smoothing", () => {
    // period=3 → k=0.5. seed at i=2: (1+2+3)/3 = 2
    // i=3: 4*0.5 + 2*0.5 = 3 ; i=4: 5*0.5 + 3*0.5 = 4
    expect(computeEMA([1, 2, 3, 4, 5], 3)).toEqual([null, null, 2, 3, 4]);
  });

  it("equals the input for period=1 (k=1)", () => {
    expect(computeEMA([10, 20, 30], 1)).toEqual([10, 20, 30]);
  });

  it("returns all nulls when period > length", () => {
    expect(computeEMA([1, 2], 5)).toEqual([null, null]);
  });

  it("returns an empty array for empty input", () => {
    expect(computeEMA([], 3)).toEqual([]);
  });

  it("stays constant on a constant series", () => {
    const out = computeEMA([7, 7, 7, 7, 7, 7], 3);
    expect(out.slice(2)).toEqual([7, 7, 7, 7]);
  });
});

describe("computeBollinger", () => {
  it("collapses to the middle band on a constant series", () => {
    const { upper, middle, lower } = computeBollinger([5, 5, 5, 5], 3, 2);
    expect(middle).toEqual([null, null, 5, 5]);
    expect(upper).toEqual([null, null, 5, 5]);
    expect(lower).toEqual([null, null, 5, 5]);
  });

  it("puts bands symmetric around the SMA", () => {
    // window [2,4,6]: mean 4, variance ((−2)²+0+2²)/3 = 8/3
    const sd = Math.sqrt(8 / 3);
    const { upper, middle, lower } = computeBollinger([2, 4, 6], 3, 2);
    expect(middle[2]).toBeCloseTo(4, 10);
    expect(upper[2]).toBeCloseTo(4 + 2 * sd, 10);
    expect(lower[2]).toBeCloseTo(4 - 2 * sd, 10);
  });

  it("handles empty input", () => {
    const { upper, middle, lower } = computeBollinger([], 20, 2);
    expect(upper).toEqual([]);
    expect(middle).toEqual([]);
    expect(lower).toEqual([]);
  });
});

describe("computeRSI", () => {
  it("returns all nulls when closes.length <= period", () => {
    expect(computeRSI([1, 2, 3], 14)).toEqual([null, null, null]);
    expect(computeRSI([], 14)).toEqual([]);
  });

  it("is 100 for a monotonically rising series (no losses)", () => {
    const out = computeRSI([1, 2, 3, 4, 5, 6], 3);
    expect(out.slice(0, 3)).toEqual([null, null, null]);
    for (const v of out.slice(3)) expect(v).toBe(100);
  });

  it("is 0 for a monotonically falling series (no gains)", () => {
    const out = computeRSI([6, 5, 4, 3, 2, 1], 3);
    for (const v of out.slice(3)) expect(v).toBe(0);
  });

  it("matches a hand-computed Wilder smoothing example", () => {
    // period=2, closes [10, 11, 10, 11]
    // warmup: gain=0.5 loss=0.5 → RSI[2] = 50
    // i=3: diff +1 → gain=(0.5+1)/2=0.75, loss=0.25 → RS=3 → RSI = 75
    const out = computeRSI([10, 11, 10, 11], 2);
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBeCloseTo(50, 10);
    expect(out[3]).toBeCloseTo(75, 10);
  });

  it("stays within [0, 100]", () => {
    const closes = Array.from({ length: 60 }, (_, i) => 100 + Math.sin(i) * 10);
    for (const v of computeRSI(closes, 14)) {
      if (v != null) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe("computeMACD", () => {
  it("is zero everywhere (after warmup) on a constant series", () => {
    const closes = new Array(20).fill(10);
    const { macd, signal, histogram } = computeMACD(closes, 3, 5, 3);
    // macd starts when slow EMA (period 5) is ready → index 4
    expect(macd.slice(0, 4)).toEqual([null, null, null, null]);
    for (const v of macd.slice(4)) expect(v).toBeCloseTo(0, 10);
    // signal seeds after 3 macd values → index 6
    expect(signal[5]).toBeNull();
    for (const v of signal.slice(6)) expect(v).toBeCloseTo(0, 10);
    for (const v of histogram.slice(6)) expect(v).toBeCloseTo(0, 10);
  });

  it("keeps all three series aligned to input length", () => {
    const closes = Array.from({ length: 50 }, (_, i) => 100 + i);
    const { macd, signal, histogram } = computeMACD(closes);
    expect(macd).toHaveLength(50);
    expect(signal).toHaveLength(50);
    expect(histogram).toHaveLength(50);
  });

  it("has positive macd in a sustained uptrend", () => {
    const closes = Array.from({ length: 60 }, (_, i) => 100 * Math.pow(1.01, i));
    const { macd } = computeMACD(closes, 12, 26, 9);
    const last = macd[macd.length - 1];
    expect(last).not.toBeNull();
    expect(last as number).toBeGreaterThan(0);
  });
});

describe("toHeikinAshi", () => {
  it("returns [] for empty input", () => {
    expect(toHeikinAshi([])).toEqual([]);
  });

  it("computes the first HA candle from its own O/C", () => {
    const [ha] = toHeikinAshi([bar(10, 12, 8, 11, 500)]);
    expect(ha.c).toBeCloseTo((10 + 12 + 8 + 11) / 4, 10); // 10.25
    expect(ha.o).toBeCloseTo((10 + 11) / 2, 10); // 10.5
    expect(ha.h).toBe(12);
    expect(ha.l).toBe(8);
    expect(ha.v).toBe(500);
  });

  it("chains HA-Open from the previous HA candle", () => {
    const bars = [bar(10, 12, 8, 11), bar(11, 14, 10, 13)];
    const out = toHeikinAshi(bars);
    const prevO = 10.5;
    const prevC = 10.25;
    expect(out[1].o).toBeCloseTo((prevO + prevC) / 2, 10); // 10.375
    expect(out[1].c).toBeCloseTo((11 + 14 + 10 + 13) / 4, 10); // 12
    expect(out[1].h).toBe(14);
    expect(out[1].l).toBe(10);
  });

  it("preserves length", () => {
    expect(toHeikinAshi(constantBars(7))).toHaveLength(7);
  });
});

describe("computeStochastic", () => {
  it("computes %K from the rolling high/low window", () => {
    // bar_i: l=i, h=i+4, c=i+1 → window(3) ending at i: hi=i+4, lo=i-2, span=6
    // %K = ((i+1)-(i-2))/6*100 = 50
    const bars = Array.from({ length: 6 }, (_, i) => bar(i, i + 4, i, i + 1));
    const { k, d } = computeStochastic(bars, 3, 3);
    expect(k[0]).toBeNull();
    expect(k[1]).toBeNull();
    for (const v of k.slice(2)) expect(v).toBeCloseTo(50, 10);
    // %D needs 3 k-values → first at index 4
    expect(d[3]).toBeNull();
    expect(d[4]).toBeCloseTo(50, 10);
    expect(d[5]).toBeCloseTo(50, 10);
  });

  it("falls back to 50 when the window has zero span", () => {
    const flat = Array.from({ length: 5 }, () => bar(10, 10, 10, 10));
    const { k } = computeStochastic(flat, 3, 3);
    for (const v of k.slice(2)) expect(v).toBe(50);
  });

  it("is 100 when close sits at the window high", () => {
    const bars = [bar(1, 2, 1, 1), bar(1, 3, 1, 2), bar(2, 5, 1, 5)];
    const { k } = computeStochastic(bars, 3, 3);
    expect(k[2]).toBe(100);
  });
});

describe("computeOBV", () => {
  it("accumulates volume by close direction", () => {
    const bars = [
      bar(0, 0, 0, 10, 100),
      bar(0, 0, 0, 12, 200), // up → +200
      bar(0, 0, 0, 11, 300), // down → -300
      bar(0, 0, 0, 11, 400), // flat → unchanged
      bar(0, 0, 0, 15, 500), // up → +500
    ];
    expect(computeOBV(bars)).toEqual([0, 200, -100, -100, 400]);
  });

  it("returns [] for empty input", () => {
    expect(computeOBV([])).toEqual([]);
  });
});

describe("computeVWAP", () => {
  it("equals the typical price for a single bar", () => {
    const out = computeVWAP([bar(10, 12, 8, 10, 100)]);
    expect(out[0]).toBeCloseTo((12 + 8 + 10) / 3, 10);
  });

  it("volume-weights across bars in one session", () => {
    // typical prices 10 and 20, equal volume → 15
    const out = computeVWAP([bar(0, 12, 8, 10, 100), bar(0, 22, 18, 20, 100)]);
    expect(out[1]).toBeCloseTo(15, 10);
  });

  it("resets accumulation at a session boundary", () => {
    const bars = [bar(0, 12, 8, 10, 100), bar(0, 22, 18, 20, 100)];
    const out = computeVWAP(bars, (_prev, _cur, i) => i === 1);
    expect(out[0]).toBeCloseTo(10, 10);
    expect(out[1]).toBeCloseTo(20, 10); // new session → only bar 2
  });

  it("returns null when cumulative volume is zero", () => {
    const out = computeVWAP([bar(0, 12, 8, 10, 0)]);
    expect(out[0]).toBeNull();
  });
});

describe("computeATR", () => {
  it("returns all nulls when bars.length < period + 1", () => {
    expect(computeATR(constantBars(3), 3)).toEqual([null, null, null]);
  });

  it("equals the constant true range on uniform bars", () => {
    // every bar h=11 l=9 c=10 → TR = 2 everywhere
    const bars = constantBars(5, bar(10, 11, 9, 10));
    const out = computeATR(bars, 3);
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBeCloseTo(2, 10);
    expect(out[3]).toBeCloseTo(2, 10);
    expect(out[4]).toBeCloseTo(2, 10);
  });

  it("includes gap moves via |H - prevClose|", () => {
    // bar1 closes at 10, bar2 gaps to h=20 l=15 → TR2 = max(5, 10, 5) = 10
    const bars = [bar(10, 11, 9, 10), bar(18, 20, 15, 19), bar(18, 20, 15, 19)];
    const out = computeATR(bars, 2);
    // trs = [2, 10, 5] → ATR[1] = 6, ATR[2] = (6 + 5)/2 = 5.5
    expect(out[1]).toBeCloseTo(6, 10);
    expect(out[2]).toBeCloseTo(5.5, 10);
  });
});

describe("computeWilliamsR", () => {
  it("is 0 at the window high and -100 at the window low", () => {
    const atHigh = [bar(1, 2, 1, 1), bar(1, 3, 1, 2), bar(2, 5, 1, 5)];
    expect(computeWilliamsR(atHigh, 3)[2]).toBe(-0); // (hi-c)=0
    const atLow = [bar(5, 5, 3, 4), bar(4, 4, 2, 3), bar(3, 3, 1, 1)];
    expect(computeWilliamsR(atLow, 3)[2]).toBe(-100);
  });

  it("falls back to -50 on zero span", () => {
    const flat = constantBars(4, bar(10, 10, 10, 10));
    expect(computeWilliamsR(flat, 3)[3]).toBe(-50);
  });

  it("keeps warmup nulls", () => {
    const out = computeWilliamsR(constantBars(5), 3);
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
  });
});

describe("computeCCI", () => {
  it("is 0 on a constant series (zero mean deviation)", () => {
    const out = computeCCI(constantBars(6), 3);
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    for (const v of out.slice(2)) expect(v).toBe(0);
  });

  it("matches a hand-computed value", () => {
    // typical prices: bar(0, 3, 0, 0) → 1 ; bar(0, 6, 0, 0) → 2 ; bar(0, 9, 0, 0) → 3
    // mean = 2, MD = (1+0+1)/3 = 2/3 → CCI = (3-2)/(0.015*2/3) = 100
    const bars = [bar(0, 3, 0, 0), bar(0, 6, 0, 0), bar(0, 9, 0, 0)];
    expect(computeCCI(bars, 3)[2]).toBeCloseTo(100, 10);
  });
});

describe("computeIchimoku", () => {
  const bars = constantBars(80, bar(100, 110, 90, 100)); // (110+90)/2 = 100

  it("computes conversion/base after their warmups", () => {
    const { conversion, base } = computeIchimoku(bars);
    expect(conversion[7]).toBeNull();
    expect(conversion[8]).toBe(100);
    expect(base[24]).toBeNull();
    expect(base[25]).toBe(100);
  });

  it("shifts spanA and spanB forward by the base period", () => {
    const { spanA, spanB } = computeIchimoku(bars);
    // spanA raw ready at 25, shifted +26 → first non-null at 51
    expect(spanA[50]).toBeNull();
    expect(spanA[51]).toBe(100);
    // spanB raw ready at 51, shifted +26 → first non-null at 77
    expect(spanB[76]).toBeNull();
    expect(spanB[77]).toBe(100);
  });

  it("keeps every series aligned to input length", () => {
    const { conversion, base, spanA, spanB } = computeIchimoku(bars);
    for (const s of [conversion, base, spanA, spanB]) expect(s).toHaveLength(80);
  });
});

describe("computePivot", () => {
  it("computes standard pivot levels from prev H/L/C", () => {
    const p = computePivot(bar(0, 110, 90, 100));
    expect(p.pivot).toBeCloseTo(100, 10);
    expect(p.r1).toBeCloseTo(110, 10);
    expect(p.s1).toBeCloseTo(90, 10);
    expect(p.r2).toBeCloseTo(120, 10);
    expect(p.s2).toBeCloseTo(80, 10);
    expect(p.r3).toBeCloseTo(130, 10);
    expect(p.s3).toBeCloseTo(70, 10);
  });
});

describe("computeRegression", () => {
  it("returns null for fewer than 4 points", () => {
    expect(computeRegression([1, 2, 3])).toBeNull();
    expect(computeRegression([])).toBeNull();
  });

  it("fits a perfect line exactly (r2=1, stdDev=0)", () => {
    const r = computeRegression([1, 2, 3, 4, 5]);
    expect(r).not.toBeNull();
    expect(r!.startY).toBeCloseTo(1, 10);
    expect(r!.endY).toBeCloseTo(5, 10);
    expect(r!.stdDev).toBeCloseTo(0, 10);
    expect(r!.r2).toBeCloseTo(1, 10);
  });

  it("returns a flat line with r2=0 on a constant series", () => {
    const r = computeRegression([5, 5, 5, 5, 5]);
    expect(r).not.toBeNull();
    expect(r!.startY).toBeCloseTo(5, 10);
    expect(r!.endY).toBeCloseTo(5, 10);
    expect(r!.r2).toBe(0);
  });
});

describe("detectPatterns", () => {
  it("returns [] for fewer than 25 bars", () => {
    expect(detectPatterns(constantBars(24))).toEqual([]);
  });

  it("detects a golden cross when MA5 crosses above MA20", () => {
    // 20 declining closes then a sharp 15-bar rally
    const closes = [
      ...Array.from({ length: 20 }, (_, i) => 120 - i),
      ...Array.from({ length: 15 }, (_, i) => 101 + (i + 1) * 3),
    ];
    const bars = closes.map((c) => bar(c, c + 1, c - 1, c));
    const hits = detectPatterns(bars);
    expect(hits.some((h) => h.kind === "golden-cross")).toBe(true);
    expect(hits.some((h) => h.kind === "dead-cross")).toBe(false);
  });

  it("detects a dead cross when MA5 crosses below MA20", () => {
    const closes = [
      ...Array.from({ length: 20 }, (_, i) => 100 + i),
      ...Array.from({ length: 15 }, (_, i) => 119 - (i + 1) * 3),
    ];
    const bars = closes.map((c) => bar(c, c + 1, c - 1, c));
    const hits = detectPatterns(bars);
    expect(hits.some((h) => h.kind === "dead-cross")).toBe(true);
  });
});

describe("computeVolumeProfile", () => {
  it("returns [] for empty bars or non-positive bins", () => {
    expect(computeVolumeProfile([], 24)).toEqual([]);
    expect(computeVolumeProfile(constantBars(3), 0)).toEqual([]);
  });

  it("returns [] when all bars share a single price (min >= max)", () => {
    expect(computeVolumeProfile(constantBars(3, bar(10, 10, 10, 10)))).toEqual([]);
  });

  it("distributes one bar's volume proportionally across bins", () => {
    const out = computeVolumeProfile([bar(5, 10, 0, 5, 100)], 2);
    expect(out).toHaveLength(2);
    expect(out[0].priceMin).toBeCloseTo(0, 10);
    expect(out[1].priceMax).toBeCloseTo(10, 10);
    expect(out[0].volume).toBeCloseTo(50, 6);
    expect(out[1].volume).toBeCloseTo(50, 6);
  });

  it("conserves total volume", () => {
    const bars = [bar(5, 10, 0, 5, 100), bar(6, 8, 2, 7, 60)];
    const out = computeVolumeProfile(bars, 8);
    const total = out.reduce((s, b) => s + b.volume, 0);
    expect(total).toBeCloseTo(160, 4);
  });
});
