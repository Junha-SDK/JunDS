"use client";

import { useEffect, useState } from "react";
import { PriceBadge } from "./PriceBadge";
import { Sparkline } from "./Sparkline";
import { useMarketStatus } from "./lib/useMarketStatus";

interface InvestorFlow {
  foreign: number;
  institution: number;
  individual: number;
  asOf: string;
}

/**
 * 외국인 / 기관 / 개인 순매수 카드 — KIS `/api/kis/investor` 10초 폴링.
 * 단위: 억원.
 */
export function LiveInvestorFlowCards({ spark }: { spark?: number[] } = {}) {
  const [flow, setFlow] = useState<InvestorFlow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const status = useMarketStatus();
  const isOpen = status === "장중";

  useEffect(() => {
    let aborted = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const fetchOnce = async () => {
      try {
        const res = await fetch("/api/kis/investor");
        if (!res.ok) throw new Error("status-" + res.status);
        const d = (await res.json()) as InvestorFlow;
        if (!aborted) {
          setFlow(d);
          setError(null);
        }
      } catch (e) {
        if (!aborted) setError((e as Error).message);
      }
    };
    const loop = async () => {
      await fetchOnce();
      if (!aborted && isOpen) timer = setTimeout(loop, 10_000);
    };
    loop();
    return () => {
      aborted = true;
      if (timer) clearTimeout(timer);
    };
  }, [isOpen]);

  return (
    <>
      <FlowCard
        label="외국인 순매수"
        value억={flow?.foreign}
        spark={spark}
        note="코스피 기준"
      />
      <FlowCard
        label="기관 순매수"
        value억={flow?.institution}
        spark={spark}
        note="비차익 포함"
      />
    </>
  );
}

function FlowCard({
  label,
  value억,
  spark,
  note,
}: {
  label: string;
  value억: number | undefined;
  spark?: number[];
  note?: string;
}) {
  const v = value억 ?? 0;
  const up = v >= 0;
  const color = up ? "var(--bm-up)" : "var(--bm-down)";
  const display =
    value억 == null
      ? "—"
      : Math.abs(v) >= 10_000
      ? `${up ? "+" : ""}${(v / 10_000).toFixed(2)}조`
      : `${up ? "+" : ""}${v.toLocaleString("ko-KR")}억`;
  return (
    <article className="bm-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-bold text-[color:var(--bm-muted)]">{label}</span>
        {value억 != null ? (
          <PriceBadge pct={up ? 1 : -1} size="sm" showArrow={false} />
        ) : null}
      </div>
      <div className="mt-1.5 bm-num font-extrabold text-[22px]" style={{ color }}>
        {display}
      </div>
      {note ? <div className="text-[11px] text-[color:var(--bm-muted)]">{note}</div> : null}
      {spark && spark.length > 0 ? (
        <div className="mt-2">
          <Sparkline
            data={spark}
            width={220}
            height={42}
            color={color}
            fill={up ? "rgba(239,68,68,0.6)" : "rgba(37,99,235,0.6)"}
          />
        </div>
      ) : null}
    </article>
  );
}
