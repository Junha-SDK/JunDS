/**
 * Position derivation from the trade journal.
 *
 * The holdings store keeps only weighted-average cost — meaning the original
 * purchase price for a stock bought years ago is destroyed the moment the
 * user buys more. This module reconstructs lot-level history by replaying the
 * trade journal under FIFO accounting, so the UI can show "샀던 그 가격"
 * for each tranche that is still open.
 */

import type { Holding } from "./holdings";
import type { TradeEntry } from "./tradeJournal";

export interface PositionLot {
  /** Trade journal entry id, or "manual:<name>" when synthesized from a manual holding. */
  sourceId: string;
  /** ISO date string of the original buy (empty when synthesized from a manual holding). */
  at: string;
  /** Original price per share. */
  price: number;
  /** Remaining qty after FIFO sells consumed earlier lots. */
  qty: number;
  /** Free-form note carried over from the trade entry. */
  note?: string;
}

export interface RealizedSell {
  at: string;
  qty: number;
  price: number;
  /** Cost basis consumed (sum of price*qty across the FIFO-consumed lots). */
  cost: number;
  /** Sale proceeds minus cost basis. */
  profit: number;
}

export interface DerivedPosition {
  name: string;
  qty: number;
  /** Weighted-average price over the still-open lots. */
  avgCost: number;
  /** Open lots, oldest first. Each represents shares still held with their original buy price. */
  lots: PositionLot[];
  /** Earliest open lot date, useful for "보유 기간". */
  firstBuyAt?: string;
  /** True when no trade journal entries exist for this name and we fell back to the manual holding. */
  fromManual: boolean;
  /** Closed sell events (for realized P&L). */
  realizedSells: RealizedSell[];
  /** 사용자 색 태그 — Holding 에서 그대로 propagate. */
  color?: string;
}

interface FifoState {
  lots: PositionLot[];
  realizedSells: RealizedSell[];
}

/**
 * Replay the trade journal in chronological order under FIFO and return the
 * remaining open lots per symbol. Sell events that exceed available qty are
 * partially consumed — the surplus is silently dropped (treated as a data
 * entry error rather than a short position).
 */
export function derivePositionsFromTrades(trades: TradeEntry[]): DerivedPosition[] {
  const sorted = [...trades].sort((a, b) => a.at.localeCompare(b.at));
  const byName = new Map<string, FifoState>();

  for (const t of sorted) {
    const state = byName.get(t.name) ?? { lots: [], realizedSells: [] };
    if (t.side === "buy") {
      state.lots.push({
        sourceId: t.id,
        at: t.at,
        price: t.price,
        qty: t.qty,
        note: t.note,
      });
    } else {
      let remaining = t.qty;
      let consumedCost = 0;
      while (remaining > 0 && state.lots.length > 0) {
        const lot = state.lots[0];
        const take = Math.min(lot.qty, remaining);
        consumedCost += take * lot.price;
        lot.qty -= take;
        remaining -= take;
        if (lot.qty === 0) state.lots.shift();
      }
      const soldQty = t.qty - remaining;
      if (soldQty > 0) {
        state.realizedSells.push({
          at: t.at,
          qty: soldQty,
          price: t.price,
          cost: consumedCost,
          profit: soldQty * t.price - consumedCost,
        });
      }
    }
    byName.set(t.name, state);
  }

  const out: DerivedPosition[] = [];
  for (const [name, state] of byName.entries()) {
    const totalQty = state.lots.reduce((s, l) => s + l.qty, 0);
    const totalCost = state.lots.reduce((s, l) => s + l.qty * l.price, 0);
    const avgCost = totalQty === 0 ? 0 : totalCost / totalQty;
    out.push({
      name,
      qty: totalQty,
      avgCost,
      lots: state.lots,
      firstBuyAt: state.lots[0]?.at,
      fromManual: false,
      realizedSells: state.realizedSells,
    });
  }
  return out;
}

/**
 * Combine trade-derived positions with manual holdings. Trade-derived data
 * wins per symbol — manual holdings are only used as a fallback for symbols
 * that have no journal entries yet (preserving the existing seed UX).
 *
 * Positions with zero remaining qty are dropped from the result.
 */
export function mergePositions(
  derived: DerivedPosition[],
  manual: Holding[],
): DerivedPosition[] {
  const map = new Map<string, DerivedPosition>();
  for (const p of derived) map.set(p.name, p);
  for (const h of manual) {
    const existing = map.get(h.name);
    if (existing) {
      // 매매 일지에서 derive 된 포지션이 우선이지만, 색 태그는 Holding 에서 propagate.
      if (h.color && !existing.color) existing.color = h.color;
      continue;
    }
    map.set(h.name, {
      name: h.name,
      qty: h.qty,
      avgCost: h.avgCost,
      lots:
        h.qty > 0
          ? [
              {
                sourceId: `manual:${h.name}`,
                at: "",
                price: h.avgCost,
                qty: h.qty,
              },
            ]
          : [],
      firstBuyAt: undefined,
      fromManual: true,
      realizedSells: [],
      color: h.color,
    });
  }
  return Array.from(map.values()).filter((p) => p.qty > 0);
}

/** Convenience: trades + holdings → merged positions. Pure, easy to unit test. */
export function buildPositions(trades: TradeEntry[], manual: Holding[]): DerivedPosition[] {
  return mergePositions(derivePositionsFromTrades(trades), manual);
}

export interface RealizedSummary {
  name: string;
  sells: RealizedSell[];
  /** Total realized P&L across all sells of this name. */
  totalProfit: number;
  /** Total qty sold. */
  totalQty: number;
  /** Total cost basis consumed across the sells (for ROI calc). */
  totalCost: number;
  /** Total cash received from these sells. */
  totalProceeds: number;
  /** ROI = profit / cost * 100. */
  pct: number;
  /** ISO date of the most recent sell (for sorting). */
  lastSellAt: string;
}

/**
 * Aggregate realized sells per symbol. Names with no sell history are
 * dropped. Sorted by total profit descending so the biggest realized
 * winners appear first.
 */
export function summarizeRealized(positions: DerivedPosition[]): RealizedSummary[] {
  return positions
    .filter((p) => p.realizedSells.length > 0)
    .map((p) => {
      const totalProfit = p.realizedSells.reduce((s, r) => s + r.profit, 0);
      const totalQty = p.realizedSells.reduce((s, r) => s + r.qty, 0);
      const totalCost = p.realizedSells.reduce((s, r) => s + r.cost, 0);
      const totalProceeds = p.realizedSells.reduce((s, r) => s + r.qty * r.price, 0);
      const pct = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
      const lastSellAt = p.realizedSells
        .map((r) => r.at)
        .sort()
        .at(-1) ?? "";
      return {
        name: p.name,
        sells: p.realizedSells,
        totalProfit,
        totalQty,
        totalCost,
        totalProceeds,
        pct,
        lastSellAt,
      };
    })
    .sort((a, b) => b.totalProfit - a.totalProfit);
}
