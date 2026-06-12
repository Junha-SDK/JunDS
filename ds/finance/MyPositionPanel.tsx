"use client";

import Link from "next/link";
import { useState } from "react";
import { Tag, useDsToast } from "@junds/ui";
import { useLivePrice } from "./lib/livePrices";
import { useHoldings, type Holding } from "./lib/holdings";
import { fmtSigned, fmtSignedPct } from "./lib/format";
import { AppIcon } from "./AppIcon";
import { HoldingFormModal } from "./HoldingFormModal";

interface MyPositionPanelProps {
  name: string;
}

export function MyPositionPanel({ name }: MyPositionPanelProps) {
  const { items: holdings, add } = useHoldings();
  const holding = holdings.find((h) => h.name === name);
  const { price } = useLivePrice(name);
  const [addOpen, setAddOpen] = useState(false);
  const toast = useDsToast();

  function handleAdd(h: Holding) {
    add(h);
    toast.success(`‘${h.name}’이(가) 보유 종목에 추가되었습니다.`);
  }

  if (!holding) {
    return (
      <>
        <section
          className="rounded-xl px-3.5 py-2.5 flex items-center gap-3"
          style={{
            background: "var(--bm-soft-100)",
            border: "1px dashed var(--bm-border)",
          }}
        >
          <AppIcon name="wallet" size={16} strokeWidth={2} color="var(--bm-muted)" />
          <div className="flex-1 min-w-0 flex items-baseline gap-2 flex-wrap">
            <span className="text-[12.5px] font-bold">보유 중이지 않은 종목입니다.</span>
            <span className="text-[11.5px] text-[color:var(--bm-muted)]">
              지금 가격으로 보유 등록하거나 가격 알림을 설정해 보세요.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="shrink-0 inline-flex items-center gap-1 px-2.5 h-7 rounded-lg text-[12px] font-extrabold"
            style={{ background: "var(--bm-accent-strong)", color: "var(--bm-card)" }}
          >
            <AppIcon name="plus" size={12} strokeWidth={2.6} />
            보유 등록
          </button>
          <Link
            href={`/portfolio/holdings`}
            className="shrink-0 inline-flex items-center gap-0.5 text-[12px] font-bold"
            style={{ color: "var(--bm-accent-strong)" }}
          >
            전체
            <AppIcon name="chevronRight" size={12} strokeWidth={2.5} />
          </Link>
        </section>
        <HoldingFormModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onSubmit={handleAdd}
          presetName={name}
        />
      </>
    );
  }

  const market = price * holding.qty;
  const cost = holding.avgCost * holding.qty;
  const profit = market - cost;
  const pct = cost === 0 ? 0 : (profit / cost) * 100;
  const profitColor = profit >= 0 ? "var(--bm-up)" : "var(--bm-down)";

  return (
    <section
      className="bm-card overflow-hidden"
      style={{ border: "1px solid var(--bm-border)" }}
    >
      <header
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--bm-border)" }}
      >
        <div className="flex items-center gap-2">
          <AppIcon name="wallet" size={16} strokeWidth={2.2} color="var(--bm-accent-strong)" />
          <h2 className="font-extrabold text-[14px]">내 포지션</h2>
        </div>
        <Tag color={profit >= 0 ? "red" : "blue"}>
          {profit >= 0 ? "수익" : "손실"} {fmtSignedPct(pct)}
        </Tag>
      </header>

      <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Cell label="보유 수량" value={`${holding.qty.toLocaleString("ko-KR")}주`} />
        <Cell
          label="평균 단가"
          value={holding.avgCost.toLocaleString("ko-KR")}
          unit="원"
        />
        <Cell
          label="현재가"
          value={price.toLocaleString("ko-KR")}
          unit="원"
          tone={price >= holding.avgCost ? "up" : "down"}
        />
        <Cell
          label="평가금액"
          value={Math.round(market).toLocaleString("ko-KR")}
          unit="원"
        />
      </div>

      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: "var(--bm-soft-100)", borderTop: "1px solid var(--bm-border)" }}
      >
        <div>
          <div className="text-[10.5px] font-bold" style={{ color: "var(--bm-muted)" }}>
            평가손익
          </div>
          <div className="bm-num font-extrabold text-[20px]" style={{ color: profitColor }}>
            {fmtSigned(Math.round(profit))}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10.5px] font-bold" style={{ color: "var(--bm-muted)" }}>
            매입금액
          </div>
          <div className="bm-num font-extrabold text-[16px]">
            {Math.round(cost).toLocaleString("ko-KR")}
          </div>
        </div>
      </div>
    </section>
  );
}

function Cell({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: "up" | "down";
}) {
  const color = tone === "up" ? "var(--bm-up)" : tone === "down" ? "var(--bm-down)" : "var(--bm-text)";
  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{ background: "var(--bm-soft-100)" }}
    >
      <div className="text-[10.5px] font-bold" style={{ color: "var(--bm-muted)" }}>
        {label}
      </div>
      <div className="bm-num font-extrabold text-[15px] mt-0.5" style={{ color }}>
        {value}
        {unit ? <span className="text-[10.5px] ml-0.5 font-semibold opacity-70">{unit}</span> : null}
      </div>
    </div>
  );
}
