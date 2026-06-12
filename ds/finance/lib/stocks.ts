import { THEMES, NXT_ROWS } from "./mock";
import { HEATMAP_FLAT } from "./heatmapData";

export interface StockInfo {
  name: string;
  ticker?: string;
  sector?: string;
  price: number;
  change: number;
  cap천억?: number;
}

const SEEN = new Map<string, StockInfo>();
function add(s: StockInfo) {
  if (SEEN.has(s.name)) return;
  SEEN.set(s.name, s);
}

for (const t of THEMES) {
  for (const s of t.stocks) {
    add({ name: s.name, sector: t.name, price: s.price, change: s.pct });
  }
}
for (const r of NXT_ROWS) {
  add({ name: r.name, price: r.price, change: r.pct, cap천억: r.cap천억 });
}
for (const h of HEATMAP_FLAT) {
  add({
    name: h.name,
    sector: h.group,
    price: h.price ?? 0,
    change: h.change,
  });
}

export const STOCKS: StockInfo[] = Array.from(SEEN.values()).sort(
  (a, b) => (b.cap천억 ?? 0) - (a.cap천억 ?? 0),
);

export function findStock(name: string): StockInfo | undefined {
  return SEEN.get(name);
}

export function searchStocks(query: string, limit = 10): StockInfo[] {
  const q = query.trim().toLowerCase();
  if (!q) return STOCKS.slice(0, limit);
  const scored: { item: StockInfo; score: number }[] = [];
  for (const s of STOCKS) {
    const hay = `${s.name} ${s.sector ?? ""}`.toLowerCase();
    if (hay.includes(q)) {
      let score = 0;
      if (s.name.toLowerCase().startsWith(q)) score += 100;
      if (s.name.toLowerCase().includes(q)) score += 50;
      if (s.sector?.toLowerCase().includes(q)) score += 10;
      score += (s.cap천억 ?? 0) / 1000;
      scored.push({ item: s, score });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((r) => r.item);
}
