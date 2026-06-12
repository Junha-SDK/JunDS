"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MarketHeatmap, type HeatmapCell } from "./MarketHeatmap";

interface Holding {
  name: string;
  qty: number;
  /** Average buy price */
  avg: number;
  /** Current close price */
  current: number;
  /** Daily change % */
  pct: number;
}

const SEED: Holding[] = [
  { name: "삼성전자",       qty: 220,  avg: 88_400,  current: 98_400,  pct: 6.5 },
  { name: "SK하이닉스",    qty: 35,   avg: 245_000, current: 281_500, pct: 7.4 },
  { name: "삼성SDI",        qty: 18,   avg: 470_000, current: 498_000, pct: 6.8 },
  { name: "LG에너지솔루션", qty: 22,   avg: 380_000, current: 376_393, pct: -1.2 },
  { name: "에코프로비엠",   qty: 28,   avg: 195_000, current: 183_890, pct: -2.7 },
  { name: "한미반도체",    qty: 40,   avg: 102_000, current: 118_500, pct: 9.6 },
  { name: "SKC",             qty: 25,   avg: 138_000, current: 152_300, pct: 7.8 },
  { name: "현대차",          qty: 30,   avg: 232_000, current: 248_500, pct: 4.2 },
  { name: "POSCO홀딩스",     qty: 12,   avg: 398_000, current: 412_000, pct: 3.6 },
  { name: "카카오",          qty: 60,   avg: 60_500,  current: 64_800,  pct: 4.8 },
  { name: "두산에너빌리티",  qty: 80,   avg: 35_400,  current: 38_400,  pct: 5.9 },
  { name: "유안타증권",      qty: 200,  avg: 6_700,   current: 7_762,   pct: 28.9 },
  { name: "KBI메탈",         qty: 350,  avg: 7_400,   current: 8_603,   pct: 29.8 },
];

function tickHoldings(prev: Holding[], jitter: () => number): Holding[] {
  return prev.map((h) => {
    const newPct = +(h.pct + jitter() * 0.4).toFixed(2);
    const newCurrent = Math.max(100, Math.round(h.current * (1 + jitter() * 0.004)));
    return { ...h, pct: newPct, current: newCurrent };
  });
}

function fmtMoney(won: number): string {
  if (Math.abs(won) >= 100_000_000) return `${(won / 100_000_000).toFixed(2)}억`;
  if (Math.abs(won) >= 10_000) return `${Math.round(won / 10_000).toLocaleString("ko-KR")}만`;
  return won.toLocaleString("ko-KR");
}

export function PortfolioHeatmap({
  width = 880,
  height = 360,
}: {
  width?: number;
  height?: number;
}) {
  const [holdings, setHoldings] = useState<Holding[]>(SEED);
  const seedRef = useRef(11);

  useEffect(() => {
    const id = setInterval(() => {
      setHoldings((p) =>
        tickHoldings(p, () => {
          seedRef.current = (seedRef.current * 1103515245 + 12345) & 0x7fffffff;
          return (seedRef.current % 1000) / 1000 - 0.5;
        }),
      );
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const totalEval = useMemo(
    () => holdings.reduce((s, h) => s + h.qty * h.current, 0),
    [holdings],
  );
  const totalCost = useMemo(
    () => holdings.reduce((s, h) => s + h.qty * h.avg, 0),
    [holdings],
  );
  const dayPnL = useMemo(
    () =>
      holdings.reduce((s, h) => {
        const prevClose = h.current / (1 + h.pct / 100);
        return s + h.qty * (h.current - prevClose);
      }, 0),
    [holdings],
  );
  const totalPnL = totalEval - totalCost;
  const totalPct = totalCost ? (totalPnL / totalCost) * 100 : 0;
  const dayPct = totalEval ? (dayPnL / (totalEval - dayPnL)) * 100 : 0;

  const cells: HeatmapCell[] = useMemo(
    () =>
      holdings.map((h) => ({
        name: h.name,
        size: h.qty * h.current,
        change: h.pct,
        price: h.current,
      })),
    [holdings],
  );

  return (
    <article className="bm-card p-4 overflow-hidden">
      <header className="flex items-center gap-3 mb-3 flex-wrap">
        <h2 className="font-extrabold text-[15px]">보유 종목 히트맵</h2>
        <span className="text-[11px] font-bold" style={{ color: "var(--bm-muted)" }}>
          크기 = 평가금액 · 색 = 일간 등락률 · 3초마다 갱신
        </span>
        <div className="ml-auto grid grid-cols-3 gap-3 text-[11.5px]">
          <Stat label="총 평가금액" value={fmtMoney(totalEval)} />
          <Stat
            label="평가손익"
            value={`${totalPnL >= 0 ? "+" : ""}${fmtMoney(totalPnL)}`}
            sub={`${totalPct >= 0 ? "+" : ""}${totalPct.toFixed(2)}%`}
            tone={totalPnL >= 0 ? "up" : "down"}
          />
          <Stat
            label="일간 손익"
            value={`${dayPnL >= 0 ? "+" : ""}${fmtMoney(dayPnL)}`}
            sub={`${dayPct >= 0 ? "+" : ""}${dayPct.toFixed(2)}%`}
            tone={dayPnL >= 0 ? "up" : "down"}
          />
        </div>
      </header>
      <div
        className="rounded-xl overflow-hidden"
        style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06)" }}
      >
        <MarketHeatmap data={cells} width={width} height={height} />
      </div>
    </article>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "up" | "down";
}) {
  const color = tone === "up" ? "var(--bm-up)" : tone === "down" ? "var(--bm-down)" : "var(--bm-text)";
  return (
    <div className="flex flex-col items-end leading-tight">
      <span className="text-[10px] font-extrabold" style={{ color: "var(--bm-muted)" }}>
        {label}
      </span>
      <span className="bm-num font-extrabold text-[13px]" style={{ color }}>
        {value}
      </span>
      {sub ? (
        <span className="bm-num font-bold text-[10.5px]" style={{ color }}>
          {sub}
        </span>
      ) : null}
    </div>
  );
}
