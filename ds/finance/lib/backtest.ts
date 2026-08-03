/**
 * Investor-rule backtest engine.
 *
 * Idea: at each historical bar, derive a synthetic FundamentalSnapshot from
 * recent price action (52w position, momentum) blended with the present
 * fundamental metrics (PER/PBR/ROE — held constant; mock data has no
 * historical fundamentals). Run scoreForInvestor; map verdict to position
 * weight; compute equity curve vs. KOSPI baseline.
 *
 * This is intentionally simple — surfaces "what if rule X had run" rather
 * than a full trading system.
 */
import { seedCandles, type Candle } from "./mock";
import { metricsFor } from "./compareData";
import { findStock } from "./stocks";
import {
  INVESTORS,
  scoreForInvestor,
  type FundamentalSnapshot,
  type InvestorId,
  type InvestorScoreCard,
} from "./investors";

export interface BacktestPoint {
  /** Bar index (0..N). */
  i: number;
  /** Close price for the day. */
  price: number;
  /** Investor's verdict on that day. */
  verdict: InvestorScoreCard["verdict"];
  /** Score on that day. */
  score: number;
  /** Position weight 0..1 applied AFTER this bar's close. */
  weight: number;
  /** Strategy equity assuming 1.0 starting capital. */
  equity: number;
  /** Buy & hold equity for comparison. */
  buyHold: number;
}

export interface BacktestResult {
  investor: InvestorId;
  symbol: string;
  bars: number;
  /** Cumulative return as fraction (0.32 = +32%). */
  totalReturn: number;
  buyHoldReturn: number;
  /** Annualized assuming 252 trading days. */
  cagr: number;
  buyHoldCagr: number;
  /** Max drawdown as fraction (negative). */
  maxDrawdown: number;
  /** Number of position changes. */
  trades: number;
  /** Verdict distribution. */
  verdictHist: Record<InvestorScoreCard["verdict"], number>;
  points: BacktestPoint[];
}

/** Map verdict → target position weight. */
function verdictToWeight(v: InvestorScoreCard["verdict"]): number {
  switch (v) {
    case "강력매수":
      return 1.0;
    case "매수":
      return 0.7;
    case "관망":
      return 0.3;
    case "매도":
      return 0.1;
    case "강력매도":
      return 0;
  }
}

/** Build a synthetic snapshot at bar `i` of `candles`. */
function snapshotAtBar(name: string, candles: Candle[], i: number): FundamentalSnapshot {
  const window = candles.slice(0, i + 1);
  const last = window[window.length - 1];
  const lookback = Math.min(window.length, 252); // ~1Y of daily bars
  const recent = window.slice(-lookback);
  const high52 = Math.max(...recent.map((b) => b.h));
  const low52 = Math.min(...recent.map((b) => b.l));
  const pricePosition52w = high52 > low52 ? (last.c - low52) / (high52 - low52) : 0.5;

  // 5-bar momentum
  const m5 =
    window.length > 5 ? (last.c - window[window.length - 6].c) / window[window.length - 6].c : 0;
  const m20 =
    window.length > 20 ? (last.c - window[window.length - 21].c) / window[window.length - 21].c : 0;
  const changePct = m5 * 100;

  const m = metricsFor(name);
  // Approximate growth from recent momentum (m20 → annualized rough proxy)
  const revenueGrowthYoY = m20 * 4;
  const opMargin = (m.roe ?? 8) * 1.5;

  return {
    price: last.c,
    marketCap: undefined,
    per: m.per,
    pbr: m.pbr,
    roe: m.roe,
    divYield: m.div,
    changePct,
    pricePosition52w,
    revenueGrowthYoY,
    opMargin,
  };
}

export interface BacktestOptions {
  /** Default 250 bars. */
  bars?: number;
  /** Re-evaluate position every N bars. Default 5. */
  rebalanceEvery?: number;
}

/** Run a single backtest for `investor` on `symbol`. */
export function backtestInvestor(
  investorId: InvestorId,
  symbol: string,
  opts: BacktestOptions = {},
): BacktestResult {
  const bars = opts.bars ?? 250;
  const rebalanceEvery = Math.max(1, opts.rebalanceEvery ?? 5);
  const stock = findStock(symbol);
  const seed = stock ? hashName(stock.name) : 100;
  const candles = seedCandles(seed, bars, stock?.price ?? 50_000, 0.014);

  const inv = INVESTORS[investorId];
  const points: BacktestPoint[] = [];
  let equity = 1.0;
  let buyHold = 1.0;
  const initialPrice = candles[0].c;
  let weight = 0; // start in cash
  let prevWeight = -1;
  let trades = 0;
  const verdictHist: Record<InvestorScoreCard["verdict"], number> = {
    강력매수: 0,
    매수: 0,
    관망: 0,
    매도: 0,
    강력매도: 0,
  };
  let lastCard: InvestorScoreCard | null = null;

  for (let i = 0; i < candles.length; i++) {
    const today = candles[i];
    const prev = i > 0 ? candles[i - 1] : today;
    // Apply existing weight to today's return
    const ret = (today.c - prev.c) / prev.c;
    equity *= 1 + weight * ret;
    buyHold = today.c / initialPrice;

    // Rebalance
    if (i % rebalanceEvery === 0) {
      const snap = snapshotAtBar(symbol, candles, i);
      lastCard = scoreForInvestor(inv, snap, symbol);
      const newWeight = verdictToWeight(lastCard.verdict);
      if (newWeight !== weight) {
        weight = newWeight;
        if (prevWeight !== -1) trades++;
        prevWeight = weight;
      }
      verdictHist[lastCard.verdict]++;
    }

    points.push({
      i,
      price: today.c,
      verdict: lastCard?.verdict ?? "관망",
      score: lastCard?.score ?? 0,
      weight,
      equity,
      buyHold,
    });
  }

  // Stats
  const years = candles.length / 252;
  const totalReturn = equity - 1;
  const buyHoldReturn = buyHold - 1;
  const cagr = years > 0 ? Math.pow(equity, 1 / years) - 1 : 0;
  const buyHoldCagr = years > 0 ? Math.pow(buyHold, 1 / years) - 1 : 0;
  let peak = points[0]?.equity ?? 1;
  let maxDrawdown = 0;
  for (const p of points) {
    if (p.equity > peak) peak = p.equity;
    const dd = (p.equity - peak) / peak;
    if (dd < maxDrawdown) maxDrawdown = dd;
  }

  return {
    investor: investorId,
    symbol,
    bars: candles.length,
    totalReturn,
    buyHoldReturn,
    cagr,
    buyHoldCagr,
    maxDrawdown,
    trades,
    verdictHist,
    points,
  };
}

/** Stable hash for deterministic seedCandles. */
function hashName(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (Math.abs(h) % 9000) + 100;
}
