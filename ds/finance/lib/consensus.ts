/**
 * Consensus screener — apply the multi-investor scoring engine across many
 * stocks at once and rank by agreement.
 *
 * Server-safe: pure functions. UI calls this at request time.
 */
import { STOCKS, findStock } from "./stocks";
import { metricsFor } from "./compareData";
import { quarterlyFor } from "./financials";
import {
  INVESTORS,
  INVESTOR_LIST,
  scoreAllInvestors,
  type FundamentalSnapshot,
  type InvestorId,
  type InvestorScoreCard,
} from "./investors";

export interface ConsensusRow {
  name: string;
  sector?: string;
  price: number;
  change: number;
  per?: number;
  pbr?: number;
  roe?: number;
  /** Number of investors with verdict 매수 or 강력매수 */
  bullCount: number;
  /** Number with 매도 or 강력매도 */
  bearCount: number;
  /** Average score across all 8 investors (-1..+1) */
  avgScore: number;
  /** Highest single score */
  topScore: number;
  /** Investor ids who issued ≥매수 */
  bulls: InvestorId[];
  /** Investor ids who issued ≤매도 */
  bears: InvestorId[];
  /** Cards verbatim — for hover/expand UI */
  cards: InvestorScoreCard[];
}

export interface ConsensusFilter {
  /** Minimum bull count (0..8). Default 0. */
  minBulls?: number;
  /** Maximum bear count (0..8). Default 8. */
  maxBears?: number;
  /** Restrict to specific investor IDs — row is included only if these IDs are bullish. */
  requireBulls?: InvestorId[];
  /** Restrict to specific investor IDs — row is included only if these IDs are bearish. */
  requireBears?: InvestorId[];
  /** Sort key. Default `avgScore`. */
  sortBy?: "avgScore" | "bullCount" | "topScore" | "change";
  /** Limit. Default 50. */
  limit?: number;
}

/** Build a fundamental snapshot from the deterministic mock dataset. */
export function snapshotForName(name: string): FundamentalSnapshot {
  const stock = findStock(name);
  const metrics = metricsFor(name);
  const quarters = quarterlyFor(name);
  const last = quarters[quarters.length - 1];
  const prev = quarters[quarters.length - 5] ?? quarters[0];
  const revenueGrowthYoY =
    prev.revenue > 0 ? (last.revenue - prev.revenue) / prev.revenue : 0;
  const opMargin = (last.operatingIncome / Math.max(1, last.revenue)) * 100;

  const price = stock?.price ?? 0;
  const high52 = metrics.high52 ?? price;
  const low52 = metrics.low52 ?? price;
  const pricePosition52w =
    high52 - low52 > 0
      ? Math.max(0, Math.min(1, (price - low52) / (high52 - low52)))
      : 0.5;

  return {
    price,
    marketCap: undefined,
    per: metrics.per,
    pbr: metrics.pbr,
    roe: metrics.roe,
    divYield: metrics.div,
    changePct: stock?.change ?? 0,
    pricePosition52w,
    revenueGrowthYoY,
    opMargin,
  };
}

function isBullish(verdict: InvestorScoreCard["verdict"]): boolean {
  return verdict === "매수" || verdict === "강력매수";
}
function isBearish(verdict: InvestorScoreCard["verdict"]): boolean {
  return verdict === "매도" || verdict === "강력매도";
}

/** Score a single name across all investors → ConsensusRow. */
export function scoreConsensusRow(name: string): ConsensusRow {
  const stock = findStock(name);
  const metrics = metricsFor(name);
  const snap = snapshotForName(name);
  const cards = scoreAllInvestors(snap, name);
  const bulls = cards.filter((c) => isBullish(c.verdict));
  const bears = cards.filter((c) => isBearish(c.verdict));
  const avgScore =
    cards.reduce((s, c) => s + c.score, 0) / Math.max(1, cards.length);
  const topScore = cards.reduce((m, c) => Math.max(m, c.score), -Infinity);
  return {
    name,
    sector: stock?.sector,
    price: stock?.price ?? 0,
    change: stock?.change ?? 0,
    per: metrics.per,
    pbr: metrics.pbr,
    roe: metrics.roe,
    bullCount: bulls.length,
    bearCount: bears.length,
    avgScore,
    topScore,
    bulls: bulls.map((c) => c.investor),
    bears: bears.map((c) => c.investor),
    cards,
  };
}

/** Score all known stocks. Sorted/filtered per `opts`. */
export function scoreUniverse(opts: ConsensusFilter = {}): ConsensusRow[] {
  const minBulls = opts.minBulls ?? 0;
  const maxBears = opts.maxBears ?? INVESTOR_LIST.length;
  const sortBy = opts.sortBy ?? "avgScore";
  const limit = opts.limit ?? 50;

  let rows = STOCKS.map((s) => scoreConsensusRow(s.name));

  rows = rows.filter((r) => r.bullCount >= minBulls && r.bearCount <= maxBears);

  if (opts.requireBulls?.length) {
    const need = new Set(opts.requireBulls);
    rows = rows.filter((r) => r.bulls.some((id) => need.has(id)));
  }
  if (opts.requireBears?.length) {
    const need = new Set(opts.requireBears);
    rows = rows.filter((r) => r.bears.some((id) => need.has(id)));
  }

  rows.sort((a, b) => {
    if (sortBy === "bullCount") return b.bullCount - a.bullCount || b.avgScore - a.avgScore;
    if (sortBy === "topScore") return b.topScore - a.topScore;
    if (sortBy === "change") return b.change - a.change;
    return b.avgScore - a.avgScore;
  });

  return rows.slice(0, limit);
}

/** Quick aggregate stats for the screener header. */
export function consensusOverview(rows: ConsensusRow[]): {
  total: number;
  meanBulls: number;
  topPick?: ConsensusRow;
  worstPick?: ConsensusRow;
  /** Investor → count of names where they were bullish */
  bullishness: Record<InvestorId, number>;
} {
  const total = rows.length;
  const meanBulls =
    total === 0 ? 0 : rows.reduce((s, r) => s + r.bullCount, 0) / total;
  const sorted = [...rows].sort((a, b) => b.avgScore - a.avgScore);
  const topPick = sorted[0];
  const worstPick = sorted[sorted.length - 1];
  const bullishness = Object.fromEntries(
    Object.keys(INVESTORS).map((id) => [id, 0]),
  ) as Record<InvestorId, number>;
  for (const r of rows) {
    for (const id of r.bulls) bullishness[id]++;
  }
  return { total, meanBulls, topPick, worstPick, bullishness };
}
