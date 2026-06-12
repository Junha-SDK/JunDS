"use client";

import Link from "next/link";
import type { FZoneCard as TFZoneCard, ZoneKind } from "./lib/mock";
import { PriceBadge } from "./PriceBadge";
import { useLivePrice } from "./lib/livePrices";

const LEVEL_PREFIX: Record<ZoneKind, string> = {
  F: "B",
  SF: "SF",
  G: "G",
  J: "J",
};

const HEADER_BG: Record<ZoneKind, string> = {
  F: "#dffaf5",
  SF: "#ffe9c2",
  G: "#fff3b0",
  J: "#fcd5ce",
};

export function FZoneCard({ card }: { card: TFZoneCard }) {
  const kind: ZoneKind = card.kind ?? "F";
  const prefix = LEVEL_PREFIX[kind];
  const headerBg = HEADER_BG[kind];
  const l1Label = `${prefix}1`;
  const l2Label = `${prefix}2`;
  const l3Label = `${prefix}3`;
  // KIS 시드 라이브 가격 overlay
  const { price: livePrice, change: liveChange } = useLivePrice(card.name);
  const price = livePrice > 0 ? livePrice : card.price;
  const pct = liveChange !== 0 ? liveChange : card.pct;
  // 라이브 가격 기준 status 재산출 (B1/B2/B3 임박 자동 분류)
  const liveStatus =
    price <= card.b3 + (card.b2 - card.b3) * 0.2
      ? l3Label
      : price <= card.b2 + (card.b1 - card.b2) * 0.2
      ? l2Label
      : price <= card.b1 + (card.resistance - card.b1) * 0.2
      ? l1Label
      : `${prefix}존임박`;

  return (
    <Link
      href={`/stock/${encodeURIComponent(card.name)}`}
      className="bm-card overflow-hidden block"
    >
      <header
        className="px-3 py-2 flex items-center justify-between gap-2"
        style={{ background: headerBg }}
      >
        <span className="font-extrabold text-[14px]" style={{ color: "#0f172a" }}>
          {card.name}
        </span>
        <span
          className="bm-pill text-white"
          style={{ background: "#ef4444", fontSize: 12 }}
        >
          {liveStatus}
        </span>
      </header>

      <div className="px-3 pt-3 pb-2 grid grid-cols-[1fr_18px] gap-2">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[color:var(--bm-muted)]">현재가</span>
            <span className="bm-num font-extrabold text-[14px]" style={{ color: pct > 0 ? "var(--bm-up)" : "var(--bm-down)" }}>
              {price.toLocaleString("ko-KR")}
            </span>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="bm-num text-[12px] text-[color:var(--bm-muted)]">시총 {card.cap조}조</span>
            <PriceBadge pct={pct} size="sm" showArrow={false} />
          </div>
          <div className="flex items-center justify-between mt-0.5 text-[12px] text-[color:var(--bm-muted)]">
            <span>대금 {card.amount억.toLocaleString("ko-KR")}억</span>
          </div>

          <div className="mt-2 space-y-[4px] text-[12.5px]">
            <Row label="저항선" value={card.resistance} muted />
            <Row label={l1Label} value={card.b1} highlight={liveStatus === l1Label} />
            <Row label={l2Label} value={card.b2} highlight={liveStatus === l2Label} />
            <Row label={l3Label} value={card.b3} highlight={liveStatus === l3Label} />
          </div>
        </div>

        <MarkerColumn marker={card.marker} />
      </div>
    </Link>
  );
}

function Row({
  label,
  value,
  muted,
  highlight,
}: {
  label: string;
  value: number;
  muted?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className="font-bold"
        style={{
          background: highlight ? "rgba(239,68,68,0.12)" : "transparent",
          border: highlight ? "1px solid rgba(239,68,68,0.6)" : "none",
          color: highlight ? "var(--bm-up)" : muted ? "var(--bm-muted)" : "var(--bm-text)",
          padding: highlight ? "1px 8px" : "1px 4px",
          borderRadius: 6,
          fontSize: highlight ? 11 : 12,
        }}
      >
        {label}
      </span>
      <span className="bm-num font-semibold" style={{ color: muted ? "var(--bm-muted)" : "var(--bm-text)" }}>
        {value.toLocaleString("ko-KR")}
      </span>
    </div>
  );
}

function MarkerColumn({ marker }: { marker: "high" | "mid" | "low" }) {
  const top = marker === "high" ? "var(--bm-up)" : "transparent";
  const mid = marker === "mid" ? "var(--bm-down)" : "transparent";
  const bot = marker === "low" ? "var(--bm-down)" : "transparent";
  return (
    <svg width={18} height={108} viewBox="0 0 18 108">
      <line x1={9} x2={9} y1={2} y2={106} stroke="rgba(15,23,42,0.15)" />
      <rect x={5} y={4} width={8} height={20} fill={top} rx={2} />
      <rect x={5} y={42} width={8} height={28} fill={mid} rx={2} />
      <rect x={5} y={84} width={8} height={20} fill={bot} rx={2} />
    </svg>
  );
}
