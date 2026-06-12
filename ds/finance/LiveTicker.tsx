"use client";

import { useEffect, useRef, useState } from "react";
import { HEATMAP_FLAT } from "./lib/heatmapData";
import { useMarketStatus } from "./lib/useMarketStatus";

interface TickerStock {
  name: string;
  close: number;
  pct: number;
  /** Volume in 억원 */
  volume: number;
  group?: string;
}

// Volume seeding: large caps get larger volumes; small caps proportional
function seedVolume(price: number, size: number): number {
  // size is float-shares-billions-ish; scaled to 거래대금 in 억원
  const base = Math.max(40, size * 4 + Math.sqrt(price) * 3);
  return Math.round(base);
}

const SEED: TickerStock[] = HEATMAP_FLAT
  .filter((c) => (c.price ?? 0) > 0)
  .map((c) => ({
    name: c.name,
    close: c.price ?? 0,
    pct: c.change,
    volume: seedVolume(c.price ?? 0, c.size),
    group: c.group,
  }));

function tickStocks(prev: TickerStock[], jitter: () => number): TickerStock[] {
  return prev.map((s) => {
    const pctDelta = jitter() * 0.6;
    const newPct = +(s.pct + pctDelta).toFixed(2);
    const newClose = Math.max(100, Math.round(s.close * (1 + jitter() * 0.004)));
    return {
      ...s,
      pct: newPct,
      close: newClose,
      volume: Math.max(20, Math.round(s.volume * (1 + jitter() * 0.05))),
    };
  });
}

function fmtVol(억: number): string {
  if (억 >= 10_000) return `${(억 / 10_000).toFixed(2)}조`;
  return `${Math.round(억).toLocaleString("ko-KR")}억`;
}

export function LiveTicker() {
  const [stocks, setStocks] = useState<TickerStock[]>(SEED);
  const [prev, setPrev] = useState<TickerStock[]>(SEED);
  const seedRef = useRef(7);
  const marketStatus = useMarketStatus();
  // NXT 프리/애프터 세션도 라이브로 인정.
  const isOpen =
    marketStatus === "장중" || marketStatus === "프리장" || marketStatus === "애프터장";

  useEffect(() => {
    if (!isOpen) return;
    const id = setInterval(() => {
      setStocks((p) => {
        setPrev(p);
        return tickStocks(p, () => {
          seedRef.current = (seedRef.current * 1103515245 + 12345) & 0x7fffffff;
          return (seedRef.current % 1000) / 1000 - 0.5;
        });
      });
    }, 3000);
    return () => clearInterval(id);
  }, [isOpen]);

  // Sort: big movers first (abs pct desc), so 급등/급락 small caps surface
  const sorted = [...stocks].sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
  const stream = [...sorted, ...sorted];

  // Pause-on-hover via CSS; speed proportional to stream length
  const speedSec = Math.max(60, sorted.length * 2.5);

  return (
    <div
      className="bm-card overflow-hidden"
      style={{
        background: "var(--bm-card)",
        border: "1px solid var(--bm-border)",
      }}
    >
      <style>{`
        @keyframes bm-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .bm-marquee {
          animation: bm-marquee ${speedSec}s linear infinite;
          animation-play-state: ${isOpen ? "running" : "paused"};
        }
        .bm-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="flex items-stretch">
        <div
          className="flex items-center gap-1.5 px-3 shrink-0 z-10"
          style={{
            background: "linear-gradient(90deg, var(--bm-card) 80%, transparent)",
            borderRight: "1px solid var(--bm-border)",
          }}
        >
          <span className="relative flex size-2">
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{
                background: isOpen ? "var(--bm-success)" : "var(--bm-muted)",
                animation: isOpen ? "bm-pulse 1.4s ease-out infinite" : "none",
              }}
            />
            <span
              className="relative inline-flex rounded-full size-2"
              style={{ background: isOpen ? "var(--bm-success)" : "var(--bm-muted)" }}
            />
          </span>
          <span
            className="text-[10.5px] font-extrabold tracking-[0.06em]"
            style={{ color: isOpen ? "var(--bm-success)" : "var(--bm-muted)" }}
          >
            {isOpen ? "LIVE" : marketStatus === "휴장" ? "휴장" : "장마감"}
          </span>
          <span className="text-[10.5px] font-extrabold" style={{ color: "var(--bm-muted)" }}>
            {isOpen ? `실시간 시세 · ${sorted.length}종목` : `${sorted.length}종목 · 정규장 09:00–15:30 KST`}
          </span>
        </div>
        <div className="overflow-hidden flex-1 relative">
          <div className="bm-marquee flex items-center gap-6 py-2 whitespace-nowrap" style={{ width: "200%" }}>
            {stream.map((s, i) => {
              const ref = prev[i % prev.length];
              const priceUp = ref ? s.close > ref.close : false;
              const priceDown = ref ? s.close < ref.close : false;
              return (
                <span key={`${s.name}-${i}`} className="inline-flex items-center gap-1.5 text-[12px]">
                  <span className="font-extrabold" style={{ color: "var(--bm-text)" }}>
                    {s.name}
                  </span>
                  <span
                    className="bm-num font-extrabold"
                    style={{
                      color: priceUp ? "var(--bm-up)" : priceDown ? "var(--bm-down)" : "var(--bm-text)",
                    }}
                  >
                    {priceUp ? "▲" : priceDown ? "▼" : ""}
                    {s.close.toLocaleString("ko-KR")}
                  </span>
                  <span
                    className="bm-num font-extrabold"
                    style={{ color: s.pct >= 0 ? "var(--bm-up)" : "var(--bm-down)" }}
                  >
                    {s.pct >= 0 ? "+" : ""}
                    {s.pct.toFixed(2)}%
                  </span>
                  <span className="bm-num text-[10.5px]" style={{ color: "var(--bm-muted)" }}>
                    {fmtVol(s.volume)}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
