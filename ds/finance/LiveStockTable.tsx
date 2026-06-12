"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { HEATMAP_FLAT } from "./lib/heatmapData";
import { TICKER_MAP } from "./lib/tickers";

type SortKey = "pctDesc" | "pctAsc" | "volumeDesc" | "priceDesc" | "name";

interface LiveStock {
  name: string;
  code: string;
  market: "KOSPI" | "KOSDAQ" | "—";
  group?: string;
  price: number;
  pct: number;
  /** 거래대금 in 억원 */
  volume: number;
}

function seedVolume(price: number, size: number): number {
  return Math.max(40, Math.round(size * 4 + Math.sqrt(price) * 3));
}

const SEED: LiveStock[] = HEATMAP_FLAT
  .filter((c) => (c.price ?? 0) > 0)
  .map((c) => {
    const ticker = TICKER_MAP[c.name] ?? "";
    const market: LiveStock["market"] = ticker.endsWith(".KQ")
      ? "KOSDAQ"
      : ticker.endsWith(".KS")
        ? "KOSPI"
        : "—";
    return {
      name: c.name,
      code: ticker.replace(/\.K[SQ]$/, ""),
      market,
      group: c.group,
      price: c.price ?? 0,
      pct: c.change,
      volume: seedVolume(c.price ?? 0, c.size),
    };
  });

function tick(prev: LiveStock[], jitter: () => number): LiveStock[] {
  return prev.map((s) => {
    const newPct = +(s.pct + jitter() * 0.45).toFixed(2);
    const newPrice = Math.max(100, Math.round(s.price * (1 + jitter() * 0.005)));
    const newVol = Math.max(20, Math.round(s.volume * (1 + jitter() * 0.06)));
    return { ...s, pct: newPct, price: newPrice, volume: newVol };
  });
}

function fmt억(억: number): string {
  if (억 >= 10_000) return `${(억 / 10_000).toFixed(2)}조`;
  return `${Math.round(억).toLocaleString("ko-KR")}억`;
}

const GROUPS = Array.from(
  new Set(SEED.map((s) => s.group).filter((g): g is string => Boolean(g))),
);

export function LiveStockTable() {
  const [stocks, setStocks] = useState<LiveStock[]>(SEED);
  const [prev, setPrev] = useState<LiveStock[]>(SEED);
  const [sort, setSort] = useState<SortKey>("pctDesc");
  const [marketFilter, setMarketFilter] = useState<"ALL" | "KOSPI" | "KOSDAQ">("ALL");
  const [groupFilter, setGroupFilter] = useState<string>("ALL");
  const [query, setQuery] = useState<string>("");
  const seedRef = useRef(19);

  useEffect(() => {
    const id = setInterval(() => {
      setStocks((p) => {
        setPrev(p);
        return tick(p, () => {
          seedRef.current = (seedRef.current * 1103515245 + 12345) & 0x7fffffff;
          return (seedRef.current % 1000) / 1000 - 0.5;
        });
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    let out = stocks;
    if (marketFilter !== "ALL") out = out.filter((s) => s.market === marketFilter);
    if (groupFilter !== "ALL") out = out.filter((s) => s.group === groupFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter(
        (s) => s.name.toLowerCase().includes(q) || s.code.includes(q),
      );
    }
    const sorted = [...out];
    if (sort === "pctDesc") sorted.sort((a, b) => b.pct - a.pct);
    else if (sort === "pctAsc") sorted.sort((a, b) => a.pct - b.pct);
    else if (sort === "volumeDesc") sorted.sort((a, b) => b.volume - a.volume);
    else if (sort === "priceDesc") sorted.sort((a, b) => b.price - a.price);
    else sorted.sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));
    return sorted;
  }, [stocks, sort, marketFilter, groupFilter, query]);

  return (
    <div className="bm-card overflow-hidden">
      <div
        className="px-3 py-2 flex items-center gap-2 flex-wrap"
        style={{ borderBottom: "1px solid var(--bm-border)" }}
      >
        <span className="relative flex size-2.5">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ background: "var(--bm-success)", animation: "bm-pulse 1.4s ease-out infinite" }}
          />
          <span
            className="relative inline-flex rounded-full size-2.5"
            style={{ background: "var(--bm-success)" }}
          />
        </span>
        <span
          className="text-[11px] font-extrabold tracking-[0.06em]"
          style={{ color: "var(--bm-success)" }}
        >
          LIVE
        </span>
        <span className="text-[12.5px] font-extrabold">전 종목 실시간 ({stocks.length})</span>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="종목명·코드 검색 (예: 제주반도체, 제룡전기, 080220)"
          className="ml-2 px-2.5 py-1 text-[11.5px] rounded-md flex-1 min-w-[200px]"
          style={{
            background: "var(--bm-soft-100)",
            border: "1px solid var(--bm-border)",
            color: "var(--bm-text)",
          }}
        />

        <div
          className="inline-flex rounded-md overflow-hidden"
          style={{ border: "1px solid var(--bm-border)" }}
        >
          {(["ALL", "KOSPI", "KOSDAQ"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMarketFilter(m)}
              className="px-2 py-0.5 text-[10.5px] font-extrabold"
              style={{
                background: marketFilter === m ? "var(--bm-accent-strong)" : "transparent",
                color: marketFilter === m ? "var(--bm-card)" : "var(--bm-muted)",
              }}
            >
              {m === "ALL" ? "전체" : m === "KOSPI" ? "코스피" : "코스닥"}
            </button>
          ))}
        </div>

        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="px-2 py-1 text-[11px] rounded-md"
          style={{
            background: "var(--bm-soft-100)",
            border: "1px solid var(--bm-border)",
            color: "var(--bm-text)",
          }}
        >
          <option value="ALL">섹터: 전체</option>
          {GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="px-2 py-1 text-[11px] rounded-md"
          style={{
            background: "var(--bm-soft-100)",
            border: "1px solid var(--bm-border)",
            color: "var(--bm-text)",
          }}
        >
          <option value="pctDesc">등락률 ↓</option>
          <option value="pctAsc">등락률 ↑</option>
          <option value="volumeDesc">거래대금 ↓</option>
          <option value="priceDesc">주가 ↓</option>
          <option value="name">이름순</option>
        </select>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 480 }}>
        <table className="w-full text-[11.5px]">
          <thead
            className="sticky top-0"
            style={{ background: "var(--bm-soft-100)", zIndex: 1 }}
          >
            <tr style={{ borderBottom: "1px solid var(--bm-border)" }}>
              <Th>#</Th>
              <Th>종목</Th>
              <Th>섹터</Th>
              <Th right>현재가</Th>
              <Th right>등락률</Th>
              <Th right>거래대금</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-[12px] font-bold" style={{ color: "var(--bm-muted)" }}>
                  결과 없음
                </td>
              </tr>
            ) : (
              filtered.map((s, i) => {
                const ref = prev.find((p) => p.name === s.name);
                const trend = ref ? (s.price > ref.price ? "up" : s.price < ref.price ? "down" : "flat") : "flat";
                const tickColor =
                  trend === "up" ? "var(--bm-up)" : trend === "down" ? "var(--bm-down)" : "var(--bm-text)";
                return (
                  <tr
                    key={s.name}
                    style={{
                      borderBottom: "1px solid var(--bm-border)",
                      background: i % 2 === 0 ? "transparent" : "var(--bm-soft-100)",
                    }}
                  >
                    <td className="px-3 py-1.5 bm-num text-[10.5px] font-bold" style={{ color: "var(--bm-muted)" }}>
                      {i + 1}
                    </td>
                    <td className="px-3 py-1.5">
                      <Link
                        href={`/stock/${encodeURIComponent(s.name)}`}
                        className="flex flex-col leading-tight"
                      >
                        <span className="font-extrabold" style={{ color: "var(--bm-text)" }}>
                          {s.name}
                        </span>
                        <span className="bm-num text-[9.5px] font-bold" style={{ color: "var(--bm-muted)" }}>
                          {s.code || "—"} · {s.market}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-1.5">
                      {s.group ? (
                        <span
                          className="text-[9.5px] font-extrabold rounded-full px-1.5 py-[1px]"
                          style={{
                            background: "var(--bm-soft-100)",
                            color: "var(--bm-muted)",
                            border: "1px solid var(--bm-border)",
                          }}
                        >
                          {s.group}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      className="px-3 py-1.5 text-right bm-num font-extrabold"
                      style={{ color: tickColor }}
                    >
                      {trend === "up" ? "▲" : trend === "down" ? "▼" : ""}
                      {s.price.toLocaleString("ko-KR")}
                    </td>
                    <td
                      className="px-3 py-1.5 text-right bm-num font-extrabold"
                      style={{ color: s.pct >= 0 ? "var(--bm-up)" : "var(--bm-down)" }}
                    >
                      {s.pct >= 0 ? "+" : ""}
                      {s.pct.toFixed(2)}%
                    </td>
                    <td
                      className="px-3 py-1.5 text-right bm-num font-bold"
                      style={{ color: "#9333ea" }}
                    >
                      {fmt억(s.volume)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className="px-3 py-1.5 text-[10.5px] font-extrabold"
      style={{
        textAlign: right ? "right" : "left",
        color: "var(--bm-muted)",
        fontWeight: 800,
      }}
    >
      {children}
    </th>
  );
}
