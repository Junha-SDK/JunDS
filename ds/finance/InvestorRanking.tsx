"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HEATMAP_FLAT } from "./lib/heatmapData";

type InvestorKey = "foreign" | "institution" | "individual";

interface RankingStock {
  name: string;
  /** Close price in won */
  close: number;
  /** Daily change % */
  pct: number;
  /** Net buy amount in 억원 (per investor) */
  net: Record<InvestorKey, number>;
  group?: string;
}

const INVESTOR_LABEL: Record<InvestorKey, string> = {
  foreign: "외국인",
  institution: "기관",
  individual: "개인",
};

const INVESTOR_COLOR: Record<InvestorKey, string> = {
  foreign: "var(--bm-up)",
  institution: "#a855f7",
  individual: "var(--bm-warning)",
};

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

// Build deterministic per-stock investor seeds from HEATMAP_FLAT.
// Net buy magnitudes scale roughly with `size` (market cap proxy) and pct.
const SEED: RankingStock[] = HEATMAP_FLAT
  .filter((c) => (c.price ?? 0) > 0)
  .map((c) => {
    const seed = hashSeed(c.name);
    const r1 = ((seed * 13) % 1000) / 1000 - 0.5;
    const r2 = ((seed * 29) % 1000) / 1000 - 0.5;
    const sizeFactor = Math.max(8, c.size * 0.6);
    // Up-trending stocks tend to have positive foreign+institution flow
    const trend = c.change > 0 ? 1 : -1;
    const fNet = Math.round(trend * sizeFactor * (0.6 + Math.abs(r1) * 0.8));
    const iNet = Math.round(trend * sizeFactor * 0.4 * (0.4 + Math.abs(r2) * 0.8));
    return {
      name: c.name,
      close: c.price ?? 0,
      pct: c.change,
      group: c.group,
      net: {
        foreign: fNet,
        institution: iNet,
        individual: -(fNet + iNet),
      },
    };
  });

function tickAll(prev: RankingStock[], jitter: () => number): RankingStock[] {
  return prev.map((s) => {
    const next: RankingStock = {
      ...s,
      pct: +(s.pct + jitter() * 0.4).toFixed(2),
      close: Math.max(100, Math.round(s.close * (1 + jitter() * 0.005))),
      net: {
        foreign: Math.round(s.net.foreign + jitter() * Math.max(40, Math.abs(s.net.foreign) * 0.18)),
        institution: Math.round(s.net.institution + jitter() * Math.max(30, Math.abs(s.net.institution) * 0.20)),
        individual: 0,
      },
    };
    next.net.individual = -(next.net.foreign + next.net.institution) + Math.round(jitter() * 60);
    return next;
  });
}

function fmt억(억원: number): string {
  if (Math.abs(억원) >= 10_000) return `${(억원 / 10_000).toFixed(2)}조`;
  return `${억원.toLocaleString("ko-KR")}억`;
}

export function InvestorRanking() {
  const [stocks, setStocks] = useState<RankingStock[]>(SEED);
  const seedRef = useRef(2);

  useEffect(() => {
    const id = setInterval(() => {
      setStocks((prev) =>
        tickAll(prev, () => {
          seedRef.current = (seedRef.current * 1103515245 + 12345) & 0x7fffffff;
          return (seedRef.current % 1000) / 1000 - 0.5;
        }),
      );
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const ranks = useMemo(() => {
    const out: Record<InvestorKey, RankingStock[]> = {
      foreign: [],
      institution: [],
      individual: [],
    };
    (Object.keys(out) as InvestorKey[]).forEach((ik) => {
      out[ik] = [...stocks].sort((a, b) => b.net[ik] - a.net[ik]).slice(0, 5);
    });
    return out;
  }, [stocks]);

  return (
    <div className="bm-card overflow-hidden">
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: "1px solid var(--bm-border)" }}
      >
        <span className="text-[12.5px] font-extrabold">투자자별 순매수 TOP 5</span>
        <span
          className="text-[10.5px] font-bold ml-2"
          style={{ color: "var(--bm-muted)" }}
        >
          전 종목({stocks.length}) 누적 · 3초마다 갱신
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3">
        {(Object.keys(INVESTOR_LABEL) as InvestorKey[]).map((ik, idx) => (
          <RankingColumn
            key={ik}
            ik={ik}
            rows={ranks[ik]}
            isLast={idx === 2}
          />
        ))}
      </div>
    </div>
  );
}

function RankingColumn({
  ik,
  rows,
  isLast,
}: {
  ik: InvestorKey;
  rows: RankingStock[];
  isLast: boolean;
}) {
  return (
    <div
      style={{
        borderRight: isLast ? "none" : "1px solid var(--bm-border)",
      }}
    >
      <div
        className="flex items-center gap-1.5 px-3 py-1.5"
        style={{
          borderBottom: "1px solid var(--bm-border)",
          background: "var(--bm-soft-100)",
        }}
      >
        <span
          className="size-2 rounded-full"
          style={{ background: INVESTOR_COLOR[ik] }}
        />
        <span className="text-[11.5px] font-extrabold">
          {INVESTOR_LABEL[ik]} 순매수
        </span>
      </div>
      <ul>
        {rows.map((s, i) => {
          const v = s.net[ik];
          const up = v >= 0;
          return (
            <li
              key={s.name + i}
              className="grid items-center px-3 py-1.5"
              style={{
                gridTemplateColumns: "16px 1fr auto",
                borderBottom: i === rows.length - 1 ? "none" : "1px solid var(--bm-border)",
                gap: 6,
              }}
            >
              <span
                className="bm-num text-[10px] font-extrabold inline-flex items-center justify-center rounded-full"
                style={{
                  width: 16,
                  height: 16,
                  background: i === 0 ? INVESTOR_COLOR[ik] : "var(--bm-soft-100)",
                  color: i === 0 ? "white" : "var(--bm-muted)",
                }}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <div className="text-[11.5px] font-extrabold truncate" style={{ color: "var(--bm-text)" }}>
                  {s.name}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="bm-num text-[10px] font-bold" style={{ color: "var(--bm-muted)" }}>
                    {s.close.toLocaleString("ko-KR")}
                  </span>
                  <span
                    className="bm-num text-[10px] font-extrabold"
                    style={{ color: s.pct >= 0 ? "var(--bm-up)" : "var(--bm-down)" }}
                  >
                    {s.pct >= 0 ? "+" : ""}
                    {s.pct.toFixed(2)}%
                  </span>
                </div>
              </div>
              <span
                className="bm-num font-extrabold text-[11.5px] whitespace-nowrap"
                style={{ color: up ? "var(--bm-up)" : "var(--bm-down)" }}
              >
                {up ? "+" : ""}
                {fmt억(v)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
