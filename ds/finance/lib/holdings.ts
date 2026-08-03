"use client";

import { useCallback, useEffect, useState } from "react";
import { findStock } from "./stocks";

export interface Holding {
  name: string;
  qty: number;
  avgCost: number;
  sector?: string;
  /** 사용자 색 태그 — 보유 리스트 시각 그룹핑용. HEX (e.g. "var(--bm-success)") 또는 토큰. */
  color?: string;
}

const SEED: Holding[] = [
  { name: "삼성전자", qty: 120, avgCost: 235000 },
  { name: "SK하이닉스", qty: 8, avgCost: 1450000 },
  { name: "현대차", qty: 30, avgCost: 510000 },
  { name: "LS ELECTRIC", qty: 12, avgCost: 285000 },
  { name: "필옵틱스", qty: 25, avgCost: 49000 },
  { name: "KBI메탈", qty: 200, avgCost: 6800 },
  { name: "삼성SDI", qty: 6, avgCost: 720000 },
  { name: "NAVER", qty: 18, avgCost: 215000 },
];

const KEY = "buttermoney.holdings.v1";
const EVENT = "holdings:change";

function withSector(h: Holding): Holding {
  const stock = findStock(h.name);
  return { ...h, sector: stock?.sector };
}

function read(): Holding[] {
  if (typeof window === "undefined") return SEED.map(withSector);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return SEED.map(withSector);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return SEED.map(withSector);
    return parsed
      .filter(
        (x): x is Holding =>
          x &&
          typeof x === "object" &&
          typeof x.name === "string" &&
          typeof x.qty === "number" &&
          typeof x.avgCost === "number",
      )
      .map((h) => ({
        name: h.name,
        qty: h.qty,
        avgCost: h.avgCost,
        color: typeof h.color === "string" ? h.color : undefined,
      }))
      .map(withSector);
  } catch {
    return SEED.map(withSector);
  }
}

function write(items: Holding[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify(items.map(({ name, qty, avgCost, color }) => ({ name, qty, avgCost, color }))),
    );
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    // ignore
  }
}

export function useHoldings() {
  const [items, setItems] = useState<Holding[]>(() => SEED.map(withSector));
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

  const add = useCallback((h: Holding) => {
    const cur = read();
    const idx = cur.findIndex((x) => x.name === h.name);
    let next: Holding[];
    if (idx >= 0) {
      // Merge: weighted average cost. 색은 새로 들어온 값이 있으면 덮어쓰고, 없으면 기존 유지.
      const prev = cur[idx];
      const totalQty = prev.qty + h.qty;
      const merged: Holding = {
        name: h.name,
        qty: totalQty,
        avgCost:
          totalQty === 0 ? h.avgCost : (prev.qty * prev.avgCost + h.qty * h.avgCost) / totalQty,
        color: h.color ?? prev.color,
      };
      next = [...cur];
      next[idx] = withSector(merged);
    } else {
      next = [withSector(h), ...cur];
    }
    write(next);
    setItems(next);
  }, []);

  const update = useCallback(
    (name: string, patch: Partial<Pick<Holding, "qty" | "avgCost" | "color">>) => {
      const cur = read();
      const next = cur.map((h) => (h.name === name ? withSector({ ...h, ...patch }) : h));
      write(next);
      setItems(next);
    },
    [],
  );

  const remove = useCallback((name: string) => {
    const next = read().filter((h) => h.name !== name);
    write(next);
    setItems(next);
  }, []);

  const reset = useCallback(() => {
    write(SEED.map(withSector));
    setItems(SEED.map(withSector));
  }, []);

  return { items, add, update, remove, reset, hydrated };
}
