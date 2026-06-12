"use client";

import { useEffect, useState } from "react";
import { useLiveIndex } from "./lib/liveIndices";
import { useMarketStatus } from "./lib/useMarketStatus";

interface IndexSnapshot {
  code: string;
  value: number;
  change: number;
  changePct: number;
  asOf: string;
}

interface LiveIndexCardProps {
  /** "KOSPI" | "KOSDAQ" | "KOSPI200" */
  code: "KOSPI" | "KOSDAQ" | "KOSPI200";
  label: string;
  /** SSR fallback (mock seed) */
  fallbackValue?: number;
  fallbackDiff?: number;
  fallbackPct?: number;
  spark?: number[];
  large?: boolean;
}

/**
 * 코스피/코스닥 지수 카드 — KIS `/api/kis/index?code=...` 5초 폴링.
 * 장 외에는 마지막 스냅샷 유지.
 */
export function LiveIndexCard({
  code,
  label,
  fallbackValue,
  fallbackDiff,
  fallbackPct,
  spark,
  large,
}: LiveIndexCardProps) {
  const status = useMarketStatus();
  const isOpen = status === "장중";
  // 첫 paint 정확도 — REST 한 번 받아 fallback 위에 덮어쓴다.
  // 장중에는 그 다음부터 SSE(`useLiveIndex`) tick이 모든 갱신을 가져간다.
  const [snap, setSnap] = useState<IndexSnapshot | null>(null);
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch(`/api/kis/index?code=${code}`);
        if (!res.ok || aborted) return;
        const d = (await res.json()) as IndexSnapshot;
        if (!aborted) setSnap(d);
      } catch {
        /* 폴백값 사용 */
      }
    })();
    return () => {
      aborted = true;
    };
  }, [code]);

  const liveTick = useLiveIndex(code);

  const value = liveTick?.value ?? snap?.value ?? fallbackValue ?? 0;
  const diff = liveTick?.change ?? snap?.change ?? fallbackDiff ?? 0;
  const pct = liveTick?.changePct ?? snap?.changePct ?? fallbackPct ?? 0;
  void isOpen; // 향후 장 외 상태 표시 추가 시 사용
  const up = pct >= 0;
  const color = up ? "var(--bm-up)" : "var(--bm-down)";
  const titleSize = large ? 17 : 14;
  const valueSize = large ? 28 : 18;

  const tipTime = liveTick
    ? new Date(liveTick.receivedAt).toLocaleTimeString("ko-KR")
    : snap
      ? new Date(snap.asOf).toLocaleTimeString("ko-KR")
      : null;

  return (
    <article
      className="bm-card overflow-hidden"
      title={
        liveTick
          ? `KIS 소켓 · ${tipTime}`
          : snap
            ? `KIS REST · ${tipTime}`
            : "KIS 연결 중"
      }
    >
      <header
        className="px-3.5 py-2.5 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--bm-border)" }}
      >
        <span className="font-extrabold" style={{ color: "var(--bm-text)", fontSize: titleSize - 4 }}>
          {label}
        </span>
        <span
          className="bm-num text-[11px] font-extrabold inline-flex items-center"
          style={{ color }}
        >
          {up ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
        </span>
      </header>
      <div className="px-3.5 pt-2.5 pb-3">
        {/* 큰 지수 값은 본문색 고정 — 등락 착색은 diff/pct 라인만 (가격색 도배 방지) */}
        <div
          className="bm-num font-extrabold leading-tight"
          style={{ color: "var(--bm-text)", fontSize: valueSize }}
        >
          {value.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}
        </div>
        <div
          className="bm-num font-bold mt-0.5"
          style={{ color, fontSize: 12 }}
        >
          {up ? "+" : ""}
          {diff.toFixed(2)}
        </div>
        {spark && spark.length > 0 ? (
          <Spark values={spark} color={up ? "var(--bm-up)" : "var(--bm-down)"} />
        ) : null}
      </div>
    </article>
  );
}

function Spark({ values, color }: { values: number[]; color: string }) {
  const w = 200;
  const h = 36;
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const yOf = (v: number) => h - ((v - min) / range) * h;
  const path = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${yOf(v).toFixed(1)}`)
    .join(" ");
  const fillPath = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="mt-2" preserveAspectRatio="none">
      <path d={fillPath} fill={color} fillOpacity={0.12} />
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}
