"use client";

import { useMemo } from "react";
import Link from "next/link";
import { HEATMAP_GROUPS } from "./lib/heatmapData";
import { useLivePrices } from "./lib/livePrices";
import { heatmapColor } from "./lib/heatmapColor";

const SCALE = 6;

/**
 * 섹터 강도 패널 — 각 섹터별로 멤버 종목들의 KIS 라이브 등락률을 시총 가중 평균.
 * 더 이상 HEATMAP_GROUPS 의 정적 change 가 아니라 실시간 계산 결과.
 */
export function LiveSectorStrength() {
  const allNames = useMemo(
    () => Array.from(new Set(HEATMAP_GROUPS.flatMap((g) => g.cells.map((c) => c.name)))),
    [],
  );
  const liveMap = useLivePrices(allNames);

  const sectors = useMemo(() => {
    return HEATMAP_GROUPS.map((g) => {
      let num = 0;
      let den = 0;
      let upN = 0;
      let downN = 0;
      for (const c of g.cells) {
        const live = liveMap[c.name];
        const change = live && live.change !== 0 ? live.change : c.change;
        num += change * c.size;
        den += c.size;
        if (change > 0.1) upN++;
        else if (change < -0.1) downN++;
      }
      return {
        name: g.name,
        wAvg: den > 0 ? num / den : 0,
        upN,
        downN,
        count: g.cells.length,
      };
    }).sort((a, b) => b.wAvg - a.wAvg);
  }, [liveMap]);

  return (
    <article className="bm-card overflow-hidden">
      <header
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--bm-border)" }}
      >
        <span className="font-extrabold text-[13px]">섹터 강도</span>
        <span className="text-[10.5px] font-bold" style={{ color: "var(--bm-muted)" }}>
          가중 등락률
        </span>
      </header>
      <ul>
        {sectors.map((s, i) => {
          const positive = s.wAvg >= 0;
          return (
            <li
              key={s.name}
              className="px-4 py-2 flex items-center gap-2"
              style={{ borderTop: i === 0 ? "none" : "1px solid var(--bm-border)" }}
            >
              <span
                className="bm-num font-extrabold text-[10.5px] w-4 shrink-0"
                style={{ color: "var(--bm-muted)" }}
              >
                {i + 1}
              </span>
              <Link href="/heatmap" className="font-bold text-[12.5px] truncate flex-1 min-w-0">
                {s.name}
              </Link>
              <div
                className="h-1.5 rounded-full"
                style={{ width: 50, background: "var(--bm-soft-100)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (Math.abs(s.wAvg) / 5) * 100)}%`,
                    background: heatmapColor(s.wAvg, SCALE),
                  }}
                />
              </div>
              <span
                className="bm-num font-extrabold text-[12px] min-w-[52px] text-right"
                style={{ color: positive ? "var(--bm-up)" : "var(--bm-down)" }}
              >
                {positive ? "+" : ""}
                {s.wAvg.toFixed(2)}%
              </span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
