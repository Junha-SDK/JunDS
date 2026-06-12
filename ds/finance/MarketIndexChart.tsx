"use client";

import { useMemo, useState } from "react";
import { CandleChart } from "./CandleChart";
import { seedCandles, type Candle } from "./lib/mock";

type Tf = "월" | "주" | "일" | "분";

interface MarketIndexChartProps {
  baseSeed?: number;
  base?: number;
}

const TFS: Tf[] = ["월", "주", "일", "분"];
const TF_CONFIG: Record<Tf, { seed: number; count: number; vol: number }> = {
  월: { seed: 311, count: 60, vol: 0.018 },
  주: { seed: 137, count: 80, vol: 0.012 },
  일: { seed: 101, count: 100, vol: 0.008 },
  분: { seed: 209, count: 110, vol: 0.005 },
};

export function MarketIndexChart({
  baseSeed,
  base = 6500,
}: MarketIndexChartProps) {
  const [tf, setTf] = useState<Tf>("일");

  const candles = useMemo<Candle[]>(() => {
    const cfg = TF_CONFIG[tf];
    const seed = (baseSeed ?? 0) + cfg.seed;
    const raw = seedCandles(seed, cfg.count, base, cfg.vol);
    const sep = Math.round(cfg.count * 0.4);
    return raw.map((c, i) => {
      if (i <= sep) return c;
      const k = tf === "분" ? 1.025 : tf === "일" ? 1.08 : tf === "주" ? 1.14 : 1.22;
      return { ...c, c: c.c * k, h: c.h * k, l: c.l * k, o: c.o * k };
    });
  }, [tf, baseSeed, base]);

  const sep = Math.round(TF_CONFIG[tf].count * 0.4);

  return (
    <div className="bm-card p-3">
      <div className="flex items-center gap-2 text-[11px] mb-1">
        {TFS.map((t) => {
          const active = t === tf;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTf(t)}
              className="bm-pill"
              style={{
                background: active ? "rgba(20,184,166,0.12)" : "var(--bm-soft-100)",
                color: active ? "#0d9488" : "var(--bm-muted)",
                fontWeight: active ? 700 : 500,
              }}
            >
              {t}
              {t === "분" ? " 15분" : ""}
            </button>
          );
        })}
        <span className="ml-auto flex items-center gap-2 text-[11px]">
          {(
            [
              ["#a855f7", "5"],
              ["#1d4ed8", "10"],
              ["#f59e0b", "20"],
              ["#22c55e", "60"],
              ["#475569", "120"],
            ] as const
          ).map(([color, label]) => (
            <span key={label} className="flex items-center gap-1">
              <span className="size-3 rounded-sm" style={{ background: color }} />
              {label}
            </span>
          ))}
        </span>
      </div>
      <CandleChart
        candles={candles}
        height={360}
        width={1000}
        separatorIndex={sep}
        xLabels={[
          { index: 1, label: tf === "분" ? "09:00" : "1/2" },
          { index: sep + 1, label: tf === "분" ? "10:30" : "3/4" },
          { index: Math.round(TF_CONFIG[tf].count * 0.75), label: tf === "분" ? "13:00" : "오늘" },
        ]}
        showVolume
      />
    </div>
  );
}
