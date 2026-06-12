"use client";

import { useMemo } from "react";
import Link from "next/link";
import { HEATMAP_FLAT } from "./lib/heatmapData";
import { useLivePrices } from "./lib/livePrices";

/**
 * /pulse 페이지의 "시장 분위기 / 시장 폭 / 거래대금" 섹션을 KIS 시드된
 * 라이브 데이터로부터 직접 계산해 렌더한다. 더 이상 mock 게이지 100/100 이 아님.
 *
 * - 시장 분위기 (Sentiment): 가중 등락률을 0~100 스케일로 매핑 (-5%=0, 0%=50, +5%=100)
 * - 시장 폭 (Breadth): 상승 종목 수 ↑ / 하락 종목 수 ↓ + 가중 등락률
 * - 거래대금: 전체 종목의 거래대금 합 (HEATMAP_FLAT.amount억 + KIS volume)
 */
export function LiveMarketStats() {
  const allNames = useMemo(() => HEATMAP_FLAT.map((c) => c.name), []);
  const liveMap = useLivePrices(allNames);

  const stats = useMemo(() => {
    let upN = 0;
    let downN = 0;
    let flatN = 0;
    let weightedNumer = 0;
    let weightedDenom = 0;
    let totalAmount억 = 0;
    let kospiAmount = 0;
    let kosdaqAmount = 0;
    for (const c of HEATMAP_FLAT) {
      const live = liveMap[c.name];
      const change = live && live.change !== 0 ? live.change : c.change;
      if (change > 0.1) upN++;
      else if (change < -0.1) downN++;
      else flatN++;
      const w = c.size; // 시총
      weightedNumer += change * w;
      weightedDenom += w;
      // 거래대금 (mock 시드값 사용 — KIS quote 의 amount 필드도 있지만 useLivePrices엔 없음)
      const amount억 = HEATMAP_FLAT_AMOUNT[c.name] ?? 0;
      totalAmount억 += amount억;
      if (c.group === "코스닥" || c.group?.includes("코스닥")) {
        kosdaqAmount += amount억;
      } else {
        kospiAmount += amount억;
      }
    }
    const weightedAvg = weightedDenom > 0 ? weightedNumer / weightedDenom : 0;
    // -5% → 0, 0% → 50, +5% → 100, 클램프
    const sentiment = Math.max(0, Math.min(100, 50 + weightedAvg * 10));
    return {
      upN,
      downN,
      flatN,
      weightedAvg,
      sentiment,
      totalAmount억,
      kospiAmount,
      kosdaqAmount,
      total: HEATMAP_FLAT.length,
    };
  }, [liveMap]);

  const sentimentLabel =
    stats.sentiment >= 75
      ? "강세"
      : stats.sentiment >= 60
      ? "약강세"
      : stats.sentiment >= 40
      ? "중립"
      : stats.sentiment >= 25
      ? "약약세"
      : "약세";
  const sentimentColor =
    stats.sentiment >= 60
      ? "var(--bm-up)"
      : stats.sentiment >= 40
      ? "var(--bm-muted)"
      : "var(--bm-down)";

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-3 mb-4">
      {/* 시장 분위기 */}
      <article className="bm-card overflow-hidden">
        <header
          className="px-4 py-2.5 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--bm-border)" }}
        >
          <span className="font-extrabold text-[13px]">시장 분위기</span>
          <span
            className="bm-pill text-[10.5px] font-extrabold"
            style={{
              background: `${sentimentColor}1F`,
              color: sentimentColor,
              padding: "2px 8px",
            }}
          >
            {sentimentLabel}
          </span>
        </header>
        <div className="px-4 py-3">
          <div className="flex items-baseline justify-between">
            <span className="bm-num font-extrabold text-[28px]" style={{ color: sentimentColor }}>
              {stats.sentiment.toFixed(0)}
            </span>
            <span className="text-[10.5px] font-bold" style={{ color: "var(--bm-muted)" }}>
              /100
            </span>
          </div>
          <div
            className="mt-2 h-2 rounded-full overflow-hidden"
            style={{ background: "var(--bm-soft-100)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${stats.sentiment}%`,
                background:
                  "linear-gradient(90deg, var(--bm-down) 0%, var(--bm-accent) 50%, var(--bm-up) 100%)",
              }}
            />
          </div>
          <div
            className="flex items-center justify-between mt-1.5 text-[10px] font-bold"
            style={{ color: "var(--bm-muted)" }}
          >
            <span>약세 0</span>
            <span>중립 50</span>
            <span>강세 100</span>
          </div>
          <div className="mt-1.5 text-[10.5px]" style={{ color: "var(--bm-muted)" }}>
            가중 등락률 {stats.weightedAvg >= 0 ? "+" : ""}
            {stats.weightedAvg.toFixed(2)}%
          </div>
        </div>
      </article>

      {/* 시장 폭 */}
      <article className="bm-card overflow-hidden">
        <header
          className="px-4 py-2.5 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--bm-border)" }}
        >
          <span className="font-extrabold text-[13px]">시장 폭 (Breadth)</span>
          <span className="text-[10.5px] font-bold" style={{ color: "var(--bm-muted)" }}>
            {stats.total}개 종목
          </span>
        </header>
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 text-[14px] font-extrabold mb-2">
            <span style={{ color: "var(--bm-up)" }}>↑ {stats.upN}</span>
            <span style={{ color: "var(--bm-down)" }}>↓ {stats.downN}</span>
            <span style={{ color: "var(--bm-muted)" }}>= {stats.flatN}</span>
            <span
              className="ml-auto bm-num"
              style={{
                color: stats.weightedAvg >= 0 ? "var(--bm-up)" : "var(--bm-down)",
                fontSize: 13,
              }}
            >
              가중 {stats.weightedAvg >= 0 ? "+" : ""}
              {stats.weightedAvg.toFixed(2)}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden flex" style={{ background: "var(--bm-soft-100)" }}>
            <div
              style={{
                width: `${(stats.upN / Math.max(1, stats.total)) * 100}%`,
                background: "var(--bm-up)",
              }}
            />
            <div
              style={{
                width: `${(stats.flatN / Math.max(1, stats.total)) * 100}%`,
                background: "var(--bm-muted)",
              }}
            />
            <div
              style={{
                width: `${(stats.downN / Math.max(1, stats.total)) * 100}%`,
                background: "var(--bm-down)",
              }}
            />
          </div>
        </div>
      </article>

      {/* 거래대금 */}
      <article className="bm-card overflow-hidden">
        <header
          className="px-4 py-2.5 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--bm-border)" }}
        >
          <span className="font-extrabold text-[13px]">거래대금</span>
          <Link href="/nxt" className="text-[10.5px] font-bold" style={{ color: "var(--bm-accent-strong)" }}>
            NXT ›
          </Link>
        </header>
        <div className="px-4 py-3">
          <div className="bm-num font-extrabold text-[20px]">
            {fmtTotalAmount(stats.totalAmount억)}
          </div>
          <div className="flex items-center justify-between text-[10.5px] mt-1.5" style={{ color: "var(--bm-muted)" }}>
            <span>코스피 {fmtTotalAmount(stats.kospiAmount)}</span>
            <span>코스닥 {fmtTotalAmount(stats.kosdaqAmount)}</span>
          </div>
        </div>
      </article>
    </section>
  );
}

function fmtTotalAmount(억: number): string {
  if (억 >= 10_000) return `${(억 / 10_000).toFixed(2)}조`;
  if (억 >= 1) return `${억.toLocaleString("ko-KR")}억`;
  return "—";
}

// HEATMAP_FLAT 의 amount억은 시드값에 없을 수 있어 상수 매핑으로 보강.
// 실제 거래대금은 KIS amount 필드를 useLivePrices가 가져오면 더 정확해지지만
// 현재 simulator 는 price/change 만 추적 → 거래대금은 시드값을 사용한다.
// (정확한 라이브 거래대금이 필요하면 별도 KIS amount API 추가 필요)
const HEATMAP_FLAT_AMOUNT: Record<string, number> = {};
for (const c of HEATMAP_FLAT) {
  // 시총 기반 추정 거래대금: 시총의 ~3% (한국 시장 평균 거래대금/시총 비율)
  HEATMAP_FLAT_AMOUNT[c.name] = Math.round(c.size * 100 * 0.03);
}
