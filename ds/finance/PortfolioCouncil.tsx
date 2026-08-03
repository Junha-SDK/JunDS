"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useHoldings } from "./lib/holdings";
import {
  INVESTORS,
  scoreAllInvestors,
  type FundamentalSnapshot,
  type InvestorScoreCard,
} from "./lib/investors";
import { snapshotForName } from "./lib/consensus";
import { useLivePrice } from "./lib/livePrices";
import { AppIcon } from "./AppIcon";

interface RowData {
  name: string;
  qty: number;
  avgCost: number;
  livePrice: number;
  cards: InvestorScoreCard[];
  bulls: number;
  bears: number;
  avg: number;
  pnlPct: number;
  /** Aggregate verdict from average score */
  verdictTone: "up" | "down" | "flat";
}

export function PortfolioCouncil() {
  const { items, hydrated } = useHoldings();

  if (!hydrated) {
    return (
      <section className="bm-card-lg p-5">
        <div className="bm-skeleton h-32 w-full motion-reduce:animate-none" />
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="bm-card-lg">
        <div className="bm-empty">
          <div className="bm-empty-icon">
            <AppIcon name="wallet" size={22} strokeWidth={2} color="var(--bm-muted)" />
          </div>
          <div className="bm-empty-title">보유 종목이 없습니다</div>
          <div className="bm-empty-desc">
            보유 종목을 등록하면 위원회 의견을 자동으로 매핑해드립니다.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bm-card-lg overflow-hidden">
      <div className="bm-section-head">
        <div className="bm-section-title">
          <AppIcon name="wallet" size={14} strokeWidth={2.4} color="var(--bm-accent-strong)" />내
          포지션 × AI 위원회
        </div>
        <span className="text-[11px] font-bold" style={{ color: "var(--bm-muted)" }}>
          보유 {items.length}종목
        </span>
      </div>
      <div className="overflow-x-auto overscroll-x-contain">
        <table className="bm-table text-[13px]">
          <thead>
            <tr>
              <th>종목</th>
              <th>수량</th>
              <th>평단</th>
              <th>현재</th>
              <th>손익률</th>
              <th>위원회</th>
              <th>의견</th>
            </tr>
          </thead>
          <tbody>
            {items.map((h) => (
              <PortfolioCouncilRow key={h.name} name={h.name} qty={h.qty} avgCost={h.avgCost} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PortfolioCouncilRow({
  name,
  qty,
  avgCost,
}: {
  name: string;
  qty: number;
  avgCost: number;
}) {
  const { price } = useLivePrice(name);
  const data: RowData = useMemo(() => {
    const snap: FundamentalSnapshot = snapshotForName(name);
    // override price with live price for accuracy
    const snapWithLive: FundamentalSnapshot = { ...snap, price: price || snap.price };
    const cards = scoreAllInvestors(snapWithLive, name);
    const bulls = cards.filter((c) => c.verdict === "매수" || c.verdict === "강력매수").length;
    const bears = cards.filter((c) => c.verdict === "매도" || c.verdict === "강력매도").length;
    const avg = cards.reduce((s, c) => s + c.score, 0) / Math.max(1, cards.length);
    const pnlPct = avgCost > 0 ? ((price || snap.price) - avgCost) / avgCost : 0;
    return {
      name,
      qty,
      avgCost,
      livePrice: price || snap.price,
      cards,
      bulls,
      bears,
      avg,
      pnlPct,
      verdictTone: avg > 0.15 ? "up" : avg < -0.05 ? "down" : "flat",
    };
  }, [name, price, qty, avgCost]);

  const verdictColor =
    data.verdictTone === "up"
      ? "var(--bm-up)"
      : data.verdictTone === "down"
      ? "var(--bm-down)"
      : "var(--bm-muted)";
  const verdictLabel =
    data.verdictTone === "up"
      ? "▲ 다수 매수"
      : data.verdictTone === "down"
      ? "▼ 다수 매도"
      : "관망 우세";

  // Detect divergence: position is in profit but committee bearish, or losing but bullish
  const divergence =
    (data.pnlPct > 0.1 && data.verdictTone === "down") ||
    (data.pnlPct < -0.1 && data.verdictTone === "up");

  return (
    <tr
      style={
        // 앰버를 rgba 로 굳혀 두면 다크 팔레트에서 배경이 뜨고 #b45309 글자는 읽히지 않는다.
        // 경고 토큰에서 섞어 만들면 두 모드가 알아서 따라온다.
        divergence
          ? { background: "color-mix(in srgb, var(--bm-warning) 8%, transparent)" }
          : undefined
      }
    >
      <td>
        <Link
          href={`/stock/${encodeURIComponent(name)}/investor`}
          className="font-extrabold hover:underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--bm-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bm-card)]"
        >
          {name}
        </Link>
        {divergence ? (
          <span
            className="ml-1.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md whitespace-nowrap"
            style={{
              background: "color-mix(in srgb, var(--bm-warning) 18%, transparent)",
              color: "color-mix(in srgb, var(--bm-warning) 55%, var(--bm-text))",
            }}
            title="포지션 손익과 위원회 의견이 어긋납니다."
          >
            ⚠ 괴리
          </span>
        ) : null}
      </td>
      <td className="bm-num bm-td-muted">{qty.toLocaleString("ko-KR")}</td>
      <td className="bm-num bm-td-muted">{avgCost.toLocaleString("ko-KR")}</td>
      <td className="bm-num">{Math.round(data.livePrice).toLocaleString("ko-KR")}</td>
      <td
        className="bm-num font-extrabold"
        style={{ color: data.pnlPct >= 0 ? "var(--bm-up)" : "var(--bm-down)" }}
      >
        {data.pnlPct >= 0 ? "+" : ""}
        {(data.pnlPct * 100).toFixed(2)}%
      </td>
      <td>
        <div className="flex items-center justify-end gap-0.5">
          {data.cards
            .filter((c) => c.verdict === "매수" || c.verdict === "강력매수")
            .map((c) => (
              <span
                key={c.investor}
                title={INVESTORS[c.investor].name}
                className="text-[14px] leading-none"
              >
                {INVESTORS[c.investor].emoji}
              </span>
            ))}
        </div>
      </td>
      <td className="font-extrabold" style={{ color: verdictColor }}>
        {verdictLabel}
        <span
          className="ml-1.5 bm-num text-[10.5px] font-bold"
          style={{ color: "var(--bm-muted)" }}
        >
          {data.bulls}▲ / {data.bears}▼
        </span>
      </td>
    </tr>
  );
}
