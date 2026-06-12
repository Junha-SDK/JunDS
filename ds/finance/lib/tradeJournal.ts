"use client";

/**
 * Trade journal — local-first trade log with retrospective P&L computation.
 * Stored in browser LocalStorage; intentionally device-bound so the user can
 * journal candidly without server persistence.
 */
import { useCallback, useEffect, useState } from "react";

export type TradeSide = "buy" | "sell";

export interface TradeEntry {
  id: string;
  /** Stock display name (e.g. 삼성전자). */
  name: string;
  side: TradeSide;
  qty: number;
  /** Execution price per share. */
  price: number;
  /** ISO date string. */
  at: string;
  /** Free-form note — why this trade. */
  note?: string;
  /** Optional tags ("실적기대", "급등주", "장기보유" ...). */
  tags?: string[];
  /**
   * Behavior/emotion preset at record time
   * ("계획매매", "뇌동", "물타기", "익절", "손절지연" ...). Additive — old
   * entries without this field remain valid.
   */
  emotion?: string;
  /** IDs of trading rules the user marked as violated for this trade. */
  violations?: string[];
}

export interface TradeReview {
  entry: TradeEntry;
  /** Realized return for sells; unrealized for buys (vs. current price). */
  pctVsCurrent: number;
  /** "유지", "수익실현", "손절", "추격매수" inferred. */
  classification: "유지" | "수익실현" | "손절" | "추격매수" | "물타기";
}

const KEY = "buttermoney.tradejournal.v1";
const EVENT = "tradejournal:change";

function read(): TradeEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is TradeEntry =>
        x &&
        typeof x === "object" &&
        typeof x.id === "string" &&
        typeof x.name === "string" &&
        (x.side === "buy" || x.side === "sell") &&
        typeof x.qty === "number" &&
        typeof x.price === "number" &&
        typeof x.at === "string",
    );
  } catch {
    return [];
  }
}

function write(items: TradeEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    // ignore
  }
}

function genId(): string {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useTradeJournal() {
  const [items, setItems] = useState<TradeEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(read());
    setHydrated(true);
    const handler = () => setItems(read());
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const add = useCallback((entry: Omit<TradeEntry, "id" | "at"> & { at?: string }) => {
    const cur = read();
    const next: TradeEntry = {
      id: genId(),
      at: entry.at ?? new Date().toISOString(),
      name: entry.name,
      side: entry.side,
      qty: entry.qty,
      price: entry.price,
      note: entry.note,
      tags: entry.tags,
      emotion: entry.emotion,
      violations: entry.violations,
    };
    const all = [next, ...cur];
    write(all);
    setItems(all);
    return next.id;
  }, []);

  const remove = useCallback((id: string) => {
    const next = read().filter((t) => t.id !== id);
    write(next);
    setItems(next);
  }, []);

  const update = useCallback(
    (
      id: string,
      patch: Partial<Pick<TradeEntry, "note" | "tags" | "emotion" | "violations">>,
    ) => {
      const next = read().map((t) => (t.id === id ? { ...t, ...patch } : t));
      write(next);
      setItems(next);
    },
    [],
  );

  return { items, add, update, remove, hydrated };
}

/**
 * Classify a trade retrospectively given current price.
 * - buy at price A, current = A*(1+x): unrealized x%
 * - sell at price A, current ≤ A: 손절 (loss-realized) — actually sell side
 *   classification depends on holder's avg cost; we use heuristics here.
 */
export function reviewTrade(entry: TradeEntry, currentPrice: number): TradeReview {
  const pct = entry.price > 0 ? (currentPrice - entry.price) / entry.price : 0;
  let classification: TradeReview["classification"] = "유지";
  if (entry.side === "buy") {
    classification = pct >= 0.05 ? "유지" : pct <= -0.07 ? "물타기" : "추격매수";
  } else {
    classification = pct >= 0.03 ? "수익실현" : pct <= -0.03 ? "손절" : "유지";
  }
  return { entry, pctVsCurrent: pct, classification };
}

/** Aggregate stats. */
export interface JournalStats {
  totalTrades: number;
  buys: number;
  sells: number;
  /** Names with most trades. */
  hotNames: { name: string; count: number }[];
  /** ISO month → trade count, ascending. */
  byMonth: { month: string; count: number }[];
}

export function journalStats(items: TradeEntry[]): JournalStats {
  const buys = items.filter((t) => t.side === "buy").length;
  const sells = items.filter((t) => t.side === "sell").length;
  const counts = new Map<string, number>();
  for (const t of items) counts.set(t.name, (counts.get(t.name) ?? 0) + 1);
  const hotNames = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
  const monthCounts = new Map<string, number>();
  for (const t of items) {
    const m = t.at.slice(0, 7);
    monthCounts.set(m, (monthCounts.get(m) ?? 0) + 1);
  }
  const byMonth = [...monthCounts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({ month, count }));
  return { totalTrades: items.length, buys, sells, hotNames, byMonth };
}
