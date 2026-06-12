"use client";

/**
 * Daily portfolio snapshot store.
 *
 * The holdings page intentionally does not fabricate a historical valuation
 * series (no fake past data). This store starts capturing real snapshots
 * from the moment it is wired up — one per local calendar day. The chart
 * will be empty for a few days, then start showing genuine trajectory.
 */

import { useCallback, useEffect, useState } from "react";

export interface SnapshotHoldingSlice {
  name: string;
  market: number;
  weight: number;
}

export interface PortfolioSnapshot {
  /** YYYY-MM-DD (local). Stable key for "one per day". */
  date: string;
  /** ISO timestamp at capture. */
  at: string;
  totalMarket: number;
  totalCost: number;
  totalProfit: number;
  /** Per-stock breakdown so we can reconstruct historical weight shifts. */
  holdings: SnapshotHoldingSlice[];
}

export interface SnapshotInput {
  totalMarket: number;
  totalCost: number;
  holdings: SnapshotHoldingSlice[];
}

const KEY = "buttermoney.snapshots.v1";
const EVENT = "snapshots:change";
const MAX_DAYS = 365 * 2;

function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function read(): PortfolioSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is PortfolioSnapshot =>
        x &&
        typeof x === "object" &&
        typeof x.date === "string" &&
        typeof x.at === "string" &&
        typeof x.totalMarket === "number" &&
        typeof x.totalCost === "number" &&
        Array.isArray(x.holdings),
    );
  } catch {
    return [];
  }
}

function write(items: PortfolioSnapshot[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = items.slice(-MAX_DAYS);
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    // ignore (quota / private mode)
  }
}

/**
 * Record today's snapshot. If a snapshot already exists for today it is
 * overwritten — the latest valuation of the day wins. Returns null if the
 * input is empty (zero market cap), to avoid polluting history with junk
 * before live prices have hydrated.
 */
export function captureSnapshot(input: SnapshotInput): PortfolioSnapshot | null {
  if (input.totalMarket <= 0) return null;
  const date = todayKey();
  const cur = read();
  const idx = cur.findIndex((s) => s.date === date);
  const snap: PortfolioSnapshot = {
    date,
    at: new Date().toISOString(),
    totalMarket: input.totalMarket,
    totalCost: input.totalCost,
    totalProfit: input.totalMarket - input.totalCost,
    holdings: input.holdings,
  };
  if (idx >= 0) cur[idx] = snap;
  else cur.push(snap);
  cur.sort((a, b) => a.date.localeCompare(b.date));
  write(cur);
  return snap;
}

export function useSnapshots() {
  const [items, setItems] = useState<PortfolioSnapshot[]>([]);
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

  const record = useCallback((input: SnapshotInput) => {
    const snap = captureSnapshot(input);
    if (snap) setItems(read());
    return snap;
  }, []);

  const clear = useCallback(() => {
    write([]);
    setItems([]);
  }, []);

  return { items, hydrated, record, clear };
}
