/**
 * 차트 지표 계산 유틸 — 순수 함수, SSR/Client 양쪽 안전.
 *
 * 모든 함수는 같은 길이의 배열을 반환한다. 계산 불가 구간은 `null` 로 채워서
 * 인덱스 정렬이 깨지지 않게 한다.
 */

interface Bar {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

/* ─────────────────────────── Moving Averages ─────────────────────────── */

export function computeSMA(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    out.push(i >= period - 1 ? sum / period : null);
  }
  return out;
}

export function computeEMA(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  const k = 2 / (period + 1);
  let prev: number | null = null;
  let smaSum = 0;
  for (let i = 0; i < values.length; i++) {
    smaSum += values[i];
    if (i < period - 1) {
      out.push(null);
      continue;
    }
    if (i === period - 1) {
      prev = smaSum / period; // seed with SMA
      out.push(prev);
      continue;
    }
    const cur = values[i] * k + (prev as number) * (1 - k);
    out.push(cur);
    prev = cur;
  }
  return out;
}

/* ─────────────────────────── Bollinger Bands ─────────────────────────── */

export interface BollingerSeries {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
}

export function computeBollinger(
  closes: number[],
  period = 20,
  stdDev = 2,
): BollingerSeries {
  const mid = computeSMA(closes, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      lower.push(null);
      continue;
    }
    let s = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const diff = closes[j] - (mid[i] as number);
      s += diff * diff;
    }
    const sd = Math.sqrt(s / period);
    upper.push((mid[i] as number) + stdDev * sd);
    lower.push((mid[i] as number) - stdDev * sd);
  }
  return { upper, middle: mid, lower };
}

/* ─────────────────────────── RSI ─────────────────────────── */

export function computeRSI(closes: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = new Array(closes.length).fill(null);
  if (closes.length <= period) return out;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gain += diff;
    else loss -= diff;
  }
  gain /= period;
  loss /= period;
  out[period] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const g = diff > 0 ? diff : 0;
    const l = diff < 0 ? -diff : 0;
    // Wilder's smoothing
    gain = (gain * (period - 1) + g) / period;
    loss = (loss * (period - 1) + l) / period;
    out[i] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
  }
  return out;
}

/* ─────────────────────────── MACD ─────────────────────────── */

export interface MacdSeries {
  macd: (number | null)[];     // EMA(fast) - EMA(slow)
  signal: (number | null)[];   // EMA(macd, signal)
  histogram: (number | null)[];// macd - signal
}

export function computeMACD(
  closes: number[],
  fast = 12,
  slow = 26,
  signalPeriod = 9,
): MacdSeries {
  const emaFast = computeEMA(closes, fast);
  const emaSlow = computeEMA(closes, slow);
  const macd: (number | null)[] = closes.map((_, i) => {
    const a = emaFast[i];
    const b = emaSlow[i];
    if (a == null || b == null) return null;
    return a - b;
  });
  // Signal EMA on the macd line (skipping nulls)
  const signal: (number | null)[] = new Array(closes.length).fill(null);
  let started = false;
  let prev = 0;
  let warmup = 0;
  const k = 2 / (signalPeriod + 1);
  for (let i = 0; i < macd.length; i++) {
    const m = macd[i];
    if (m == null) continue;
    if (!started) {
      // accumulate sma for first `signalPeriod` macd values
      prev += m;
      warmup++;
      if (warmup >= signalPeriod) {
        const seed = prev / signalPeriod;
        signal[i] = seed;
        prev = seed;
        started = true;
      }
      continue;
    }
    const next = m * k + prev * (1 - k);
    signal[i] = next;
    prev = next;
  }
  const histogram: (number | null)[] = macd.map((m, i) => {
    const s = signal[i];
    if (m == null || s == null) return null;
    return m - s;
  });
  return { macd, signal, histogram };
}

/* ─────────────────────────── Heikin Ashi ─────────────────────────── */

/**
 * 일반 캔들을 Heikin Ashi 캔들로 변환.
 * HA 캔들은 추세를 더 부드럽게 보여줘 노이즈가 적다는 장점.
 *
 *   HA-Close  = (O + H + L + C) / 4
 *   HA-Open   = (이전 HA-Open + 이전 HA-Close) / 2
 *   HA-High   = max(H, HA-Open, HA-Close)
 *   HA-Low    = min(L, HA-Open, HA-Close)
 */
export function toHeikinAshi(bars: Bar[]): Bar[] {
  if (bars.length === 0) return [];
  const out: Bar[] = [];
  let prevO = bars[0].o;
  let prevC = (bars[0].o + bars[0].h + bars[0].l + bars[0].c) / 4;
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    const haClose = (b.o + b.h + b.l + b.c) / 4;
    const haOpen = i === 0 ? (b.o + b.c) / 2 : (prevO + prevC) / 2;
    const haHigh = Math.max(b.h, haOpen, haClose);
    const haLow = Math.min(b.l, haOpen, haClose);
    out.push({ o: haOpen, h: haHigh, l: haLow, c: haClose, v: b.v });
    prevO = haOpen;
    prevC = haClose;
  }
  return out;
}

/* ─────────────────────────── Stochastic ─────────────────────────── */

export interface StochasticSeries {
  k: (number | null)[]; // Fast %K
  d: (number | null)[]; // %D = SMA(k, dPeriod)
}

/**
 * Stochastic Oscillator. 일반적인 (14, 3) 설정.
 *   %K = (Close - LowestLow_n) / (HighestHigh_n - LowestLow_n) * 100
 *   %D = SMA(%K, smoothPeriod)
 */
export function computeStochastic(
  bars: Bar[],
  period = 14,
  smoothPeriod = 3,
): StochasticSeries {
  const k: (number | null)[] = new Array(bars.length).fill(null);
  for (let i = period - 1; i < bars.length; i++) {
    let hi = -Infinity;
    let lo = Infinity;
    for (let j = i - period + 1; j <= i; j++) {
      if (bars[j].h > hi) hi = bars[j].h;
      if (bars[j].l < lo) lo = bars[j].l;
    }
    const span = hi - lo;
    k[i] = span > 0 ? ((bars[i].c - lo) / span) * 100 : 50;
  }
  const kNumeric = k.map((v) => (v == null ? NaN : v));
  const d: (number | null)[] = [];
  let sum = 0;
  let count = 0;
  for (let i = 0; i < kNumeric.length; i++) {
    if (!Number.isNaN(kNumeric[i])) {
      sum += kNumeric[i];
      count++;
      if (count > smoothPeriod) {
        const old = kNumeric[i - smoothPeriod];
        if (!Number.isNaN(old)) sum -= old;
        else count--;
      }
    }
    d.push(count >= smoothPeriod ? sum / smoothPeriod : null);
  }
  return { k, d };
}

/* ─────────────────────────── OBV ─────────────────────────── */

/**
 * On-Balance Volume. 종가가 오르면 거래량을 더하고, 내리면 뺀다.
 * 추세 확인 — 가격이 새 고점인데 OBV는 못 따라오면 약세 다이버전스.
 */
export function computeOBV(bars: Bar[]): number[] {
  const out: number[] = [];
  let total = 0;
  for (let i = 0; i < bars.length; i++) {
    if (i === 0) {
      out.push(0);
      continue;
    }
    const prev = bars[i - 1].c;
    const cur = bars[i].c;
    if (cur > prev) total += bars[i].v;
    else if (cur < prev) total -= bars[i].v;
    out.push(total);
  }
  return out;
}

/* ─────────────────────────── VWAP ─────────────────────────── */

/**
 * Volume Weighted Average Price — intraday 용. 일중 누적 (price × volume) / 누적 volume.
 * 멀티데이 차트에서는 매일 첫 봉에서 reset 되도록 `sessionBoundary` callback 으로 분리.
 *
 * sessionBoundary(prev, cur) → true 면 cur 부터 새 세션 누적 시작.
 * 미지정 시 전체 단일 세션으로 계산.
 */
export function computeVWAP(
  bars: Bar[],
  sessionBoundary?: (prev: Bar, cur: Bar, index: number) => boolean,
): (number | null)[] {
  const out: (number | null)[] = [];
  let cumPV = 0;
  let cumV = 0;
  for (let i = 0; i < bars.length; i++) {
    if (i > 0 && sessionBoundary?.(bars[i - 1], bars[i], i)) {
      cumPV = 0;
      cumV = 0;
    }
    const typical = (bars[i].h + bars[i].l + bars[i].c) / 3;
    cumPV += typical * bars[i].v;
    cumV += bars[i].v;
    out.push(cumV > 0 ? cumPV / cumV : null);
  }
  return out;
}

/* ─────────────────────────── ATR (Average True Range) ─────────────────────────── */

/**
 * Average True Range — 변동성. Wilder's smoothing.
 * TR = max(H-L, |H-prevC|, |L-prevC|)
 * ATR = EMA-ish average of TR with period.
 */
export function computeATR(bars: Bar[], period = 14): (number | null)[] {
  if (bars.length < period + 1) return new Array(bars.length).fill(null);
  const trs: number[] = [];
  for (let i = 0; i < bars.length; i++) {
    if (i === 0) {
      trs.push(bars[i].h - bars[i].l);
      continue;
    }
    const tr = Math.max(
      bars[i].h - bars[i].l,
      Math.abs(bars[i].h - bars[i - 1].c),
      Math.abs(bars[i].l - bars[i - 1].c),
    );
    trs.push(tr);
  }
  const out: (number | null)[] = new Array(bars.length).fill(null);
  let atr = 0;
  for (let i = 0; i < period; i++) atr += trs[i];
  atr /= period;
  out[period - 1] = atr;
  for (let i = period; i < bars.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period;
    out[i] = atr;
  }
  return out;
}

/* ─────────────────────────── Williams %R ─────────────────────────── */

/**
 * Williams %R — Stochastic 의 역방향. -100~0 범위, -80 이하 과매도 / -20 이상 과매수.
 */
export function computeWilliamsR(
  bars: Bar[],
  period = 14,
): (number | null)[] {
  const out: (number | null)[] = new Array(bars.length).fill(null);
  for (let i = period - 1; i < bars.length; i++) {
    let hi = -Infinity;
    let lo = Infinity;
    for (let j = i - period + 1; j <= i; j++) {
      if (bars[j].h > hi) hi = bars[j].h;
      if (bars[j].l < lo) lo = bars[j].l;
    }
    const span = hi - lo;
    out[i] = span > 0 ? ((hi - bars[i].c) / span) * -100 : -50;
  }
  return out;
}

/* ─────────────────────────── CCI ─────────────────────────── */

/**
 * Commodity Channel Index. 100 이상 / -100 이하가 추세 강세/약세 시그널.
 *   typical price = (H + L + C) / 3
 *   CCI = (TP - SMA(TP, n)) / (0.015 * MeanDeviation)
 */
export function computeCCI(bars: Bar[], period = 20): (number | null)[] {
  const tp = bars.map((b) => (b.h + b.l + b.c) / 3);
  const sma = computeSMA(tp, period);
  const out: (number | null)[] = new Array(bars.length).fill(null);
  for (let i = period - 1; i < bars.length; i++) {
    const mean = sma[i] as number;
    let md = 0;
    for (let j = i - period + 1; j <= i; j++) md += Math.abs(tp[j] - mean);
    md /= period;
    out[i] = md > 0 ? (tp[i] - mean) / (0.015 * md) : 0;
  }
  return out;
}

/* ─────────────────────────── Ichimoku Cloud (간이) ─────────────────────────── */

export interface IchimokuSeries {
  /** Tenkan-sen (전환선) — (9 high + 9 low) / 2 */
  conversion: (number | null)[];
  /** Kijun-sen (기준선) — (26 high + 26 low) / 2 */
  base: (number | null)[];
  /** Senkou Span A (선행스팬1) — (Tenkan + Kijun) / 2, 26 ahead */
  spanA: (number | null)[];
  /** Senkou Span B (선행스팬2) — (52 high + 52 low) / 2, 26 ahead */
  spanB: (number | null)[];
}

export function computeIchimoku(
  bars: Bar[],
  conv = 9,
  baseP = 26,
  spanBP = 52,
): IchimokuSeries {
  const hl = (period: number, end: number): number | null => {
    if (end < period - 1) return null;
    let hi = -Infinity;
    let lo = Infinity;
    for (let j = end - period + 1; j <= end; j++) {
      if (bars[j].h > hi) hi = bars[j].h;
      if (bars[j].l < lo) lo = bars[j].l;
    }
    return (hi + lo) / 2;
  };
  const conversion: (number | null)[] = bars.map((_, i) => hl(conv, i));
  const base: (number | null)[] = bars.map((_, i) => hl(baseP, i));
  const spanARaw: (number | null)[] = bars.map((_, i) => {
    if (conversion[i] == null || base[i] == null) return null;
    return ((conversion[i] as number) + (base[i] as number)) / 2;
  });
  const spanBRaw: (number | null)[] = bars.map((_, i) => hl(spanBP, i));
  // 선행스팬은 26 봉 앞으로 그려지므로 인덱스 시프트.
  const shift = baseP;
  const spanA: (number | null)[] = new Array(bars.length).fill(null);
  const spanB: (number | null)[] = new Array(bars.length).fill(null);
  for (let i = 0; i < bars.length; i++) {
    if (i - shift >= 0) {
      spanA[i] = spanARaw[i - shift];
      spanB[i] = spanBRaw[i - shift];
    }
  }
  return { conversion, base, spanA, spanB };
}

/* ─────────────────────────── Pivot Points ─────────────────────────── */

export interface PivotLevels {
  pivot: number;
  r1: number;
  r2: number;
  r3: number;
  s1: number;
  s2: number;
  s3: number;
}

/**
 * 표준 피봇 포인트. 전일 H/L/C 로 다음 거래일의 지지·저항 추정.
 *   P  = (H + L + C) / 3
 *   R1 = 2P − L     S1 = 2P − H
 *   R2 = P + (H − L) S2 = P − (H − L)
 *   R3 = H + 2(P − L) S3 = L − 2(H − P)
 */
export function computePivot(prev: Bar): PivotLevels {
  const p = (prev.h + prev.l + prev.c) / 3;
  return {
    pivot: p,
    r1: 2 * p - prev.l,
    r2: p + (prev.h - prev.l),
    r3: prev.h + 2 * (p - prev.l),
    s1: 2 * p - prev.h,
    s2: p - (prev.h - prev.l),
    s3: prev.l - 2 * (prev.h - p),
  };
}

/* ─────────────────────────── Linear Regression ─────────────────────────── */

export interface RegressionChannel {
  /** 시작점 y 좌표 — 회귀 직선 값 */
  startY: number;
  /** 끝점 y 좌표 */
  endY: number;
  /** ±N σ 채널 폭 (절대값) */
  stdDev: number;
  /** R² (적합도) */
  r2: number;
}

/**
 * 가시 영역 종가 시리즈로 선형 회귀 + ±2σ 채널.
 * 추세선이 통계적으로 얼마나 강한지(R²)도 같이 반환.
 */
export function computeRegression(closes: number[]): RegressionChannel | null {
  const n = closes.length;
  if (n < 4) return null;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += closes[i];
    sumXY += i * closes[i];
    sumXX += i * i;
  }
  const meanX = sumX / n;
  const meanY = sumY / n;
  const denom = sumXX - n * meanX * meanX;
  if (denom === 0) return null;
  const slope = (sumXY - n * meanX * meanY) / denom;
  const intercept = meanY - slope * meanX;
  // residual std
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i++) {
    const predicted = slope * i + intercept;
    ssRes += (closes[i] - predicted) ** 2;
    ssTot += (closes[i] - meanY) ** 2;
  }
  const stdDev = Math.sqrt(ssRes / n);
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;
  return {
    startY: intercept,
    endY: slope * (n - 1) + intercept,
    stdDev,
    r2,
  };
}

/* ─────────────────────────── 패턴 감지 ─────────────────────────── */

export interface PatternHit {
  kind:
    | "double-top"
    | "double-bottom"
    | "golden-cross"
    | "dead-cross"
    | "higher-high"
    | "lower-low";
  startIndex: number;
  endIndex: number;
  /** 0.0~1.0 — confidence */
  strength: number;
  note?: string;
}

/**
 * 룰베이스 패턴 감지 — 노이즈가 많아 sparingly 사용.
 * golden/dead cross 는 MA(5) 와 MA(20) 교차로 정의 — 단기/중기 모멘텀 전환 신호.
 */
export function detectPatterns(bars: Bar[]): PatternHit[] {
  const hits: PatternHit[] = [];
  if (bars.length < 25) return hits;
  const closes = bars.map((b) => b.c);
  const ma5 = computeSMA(closes, 5);
  const ma20 = computeSMA(closes, 20);
  // Golden/Dead cross
  for (let i = 21; i < bars.length; i++) {
    const a0 = ma5[i - 1];
    const a1 = ma5[i];
    const b0 = ma20[i - 1];
    const b1 = ma20[i];
    if (a0 == null || a1 == null || b0 == null || b1 == null) continue;
    if (a0 <= b0 && a1 > b1) {
      hits.push({ kind: "golden-cross", startIndex: i, endIndex: i, strength: 0.7, note: "MA5↑MA20" });
    } else if (a0 >= b0 && a1 < b1) {
      hits.push({ kind: "dead-cross", startIndex: i, endIndex: i, strength: 0.7, note: "MA5↓MA20" });
    }
  }
  // Double top/bottom — pivot 비교 (가장 단순한 룰)
  const window = 8;
  for (let i = window * 2; i < bars.length - window; i++) {
    const left = bars.slice(i - window * 2, i - window);
    const center = bars[i];
    const right = bars.slice(i, i + window);
    const leftMaxIdx = left.reduce((acc, b, k) => (b.h > left[acc].h ? k : acc), 0);
    const rightMaxIdx = right.reduce((acc, b, k) => (b.h > right[acc].h ? k : acc), 0);
    const leftMax = left[leftMaxIdx].h;
    const rightMax = right[rightMaxIdx].h;
    if (
      Math.abs(leftMax - center.h) / center.h < 0.02 &&
      Math.abs(rightMax - center.h) / center.h < 0.02 &&
      leftMax > center.l * 1.05
    ) {
      hits.push({
        kind: "double-top",
        startIndex: i - window * 2 + leftMaxIdx,
        endIndex: i + rightMaxIdx,
        strength: 0.55,
        note: "쌍봉",
      });
    }
    const leftMinIdx = left.reduce((acc, b, k) => (b.l < left[acc].l ? k : acc), 0);
    const rightMinIdx = right.reduce((acc, b, k) => (b.l < right[acc].l ? k : acc), 0);
    const leftMin = left[leftMinIdx].l;
    const rightMin = right[rightMinIdx].l;
    if (
      Math.abs(leftMin - center.l) / center.l < 0.02 &&
      Math.abs(rightMin - center.l) / center.l < 0.02 &&
      leftMin < center.h * 0.95
    ) {
      hits.push({
        kind: "double-bottom",
        startIndex: i - window * 2 + leftMinIdx,
        endIndex: i + rightMinIdx,
        strength: 0.55,
        note: "쌍바닥",
      });
    }
  }
  return hits;
}

/* ─────────────────────────── Volume Profile ─────────────────────────── */

export interface VolumeProfileBin {
  priceMin: number;
  priceMax: number;
  volume: number;
}

/**
 * 가격대별 누적 거래량 분포. 차트 우측에 가로 바로 그려 지지·저항 시각화.
 */
export function computeVolumeProfile(
  bars: Bar[],
  bins = 24,
): VolumeProfileBin[] {
  if (bars.length === 0 || bins <= 0) return [];
  let min = Infinity;
  let max = -Infinity;
  for (const b of bars) {
    if (b.l < min) min = b.l;
    if (b.h > max) max = b.h;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return [];
  const step = (max - min) / bins;
  const out: VolumeProfileBin[] = [];
  for (let i = 0; i < bins; i++) {
    out.push({ priceMin: min + step * i, priceMax: min + step * (i + 1), volume: 0 });
  }
  for (const b of bars) {
    // bar가 걸치는 모든 bin에 거래량을 균등 분배 (h-l 비례)
    const span = Math.max(0.0001, b.h - b.l);
    const startIdx = Math.max(0, Math.floor((b.l - min) / step));
    const endIdx = Math.min(bins - 1, Math.floor((b.h - min) / step));
    for (let k = startIdx; k <= endIdx; k++) {
      const bin = out[k];
      const lo = Math.max(b.l, bin.priceMin);
      const hi = Math.min(b.h, bin.priceMax);
      const overlap = Math.max(0, hi - lo);
      bin.volume += (overlap / span) * b.v;
    }
  }
  return out;
}
