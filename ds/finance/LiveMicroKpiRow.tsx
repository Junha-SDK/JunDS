"use client";

import { useEffect, useState } from "react";

interface FxItem {
  symbol: string;
  value: number;
  pct: number;
  decimals: number;
}

interface InvestorFlow {
  foreign: number;
  institution: number;
  individual: number;
}

/**
 * 펄스 페이지의 보조 KPI 4종 — USD/KRW, 외국인 순매수, 기관 순매수, WTI.
 * /api/fx (Yahoo) + /api/kis/investor (KIS) 실데이터.
 */
export function LiveMicroKpiRow() {
  const [fx, setFx] = useState<FxItem[]>([]);
  const [flow, setFlow] = useState<InvestorFlow | null>(null);

  useEffect(() => {
    let aborted = false;
    const run = async () => {
      try {
        const [fxRes, flowRes] = await Promise.all([
          fetch("/api/fx").then((r) => r.json()),
          fetch("/api/kis/investor")
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
        ]);
        if (!aborted) {
          setFx(fxRes?.items ?? []);
          if (flowRes && !flowRes.error) setFlow(flowRes);
        }
      } catch {
        /* skip */
      }
    };
    run();
    const id = setInterval(run, 30_000);
    return () => {
      aborted = true;
      clearInterval(id);
    };
  }, []);

  const usd = fx.find((f) => f.symbol === "USD/KRW");
  const wti = fx.find((f) => f.symbol === "WTI");

  return (
    <>
      <Cell
        label="USD/KRW"
        value={usd ? usd.value.toLocaleString("ko-KR", { maximumFractionDigits: 0 }) : "—"}
        pct={usd?.pct ?? 0}
        unit="원"
      />
      <Cell
        label="외국인"
        value={flow ? fmtFlow(flow.foreign) : "—"}
        pct={flow ? (flow.foreign >= 0 ? 1 : -1) : 0}
        hint={flow && flow.foreign >= 0 ? "순매수" : "순매도"}
      />
      <Cell
        label="기관"
        value={flow ? fmtFlow(flow.institution) : "—"}
        pct={flow ? (flow.institution >= 0 ? 1 : -1) : 0}
        hint={flow && flow.institution >= 0 ? "순매수" : "순매도"}
      />
      <Cell label="WTI" value={wti ? wti.value.toFixed(2) : "—"} pct={wti?.pct ?? 0} unit="$" />
    </>
  );
}

function fmtFlow(억: number): string {
  if (억 === 0) return "—";
  const abs = Math.abs(억);
  const sign = 억 > 0 ? "+" : "-";
  if (abs >= 10_000) return `${sign}${(abs / 10_000).toFixed(1)}조`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}천억`;
  return `${sign}${abs.toLocaleString("ko-KR")}억`;
}

function Cell({
  label,
  value,
  pct,
  unit,
  hint,
}: {
  label: string;
  value: string;
  pct: number;
  unit?: string;
  hint?: string;
}) {
  const up = pct >= 0;
  const color = up ? "var(--bm-up)" : "var(--bm-down)";
  return (
    <article className="bm-card overflow-hidden">
      <div className="px-3 py-2.5">
        <div className="text-[10.5px] font-bold" style={{ color: "var(--bm-muted)" }}>
          {label}
        </div>
        <div className="bm-num font-extrabold text-[16px]">
          {value}
          {unit ? <span className="ml-0.5 text-[10.5px] font-semibold">{unit}</span> : null}
        </div>
        {hint ? (
          <div className="text-[10px] font-bold mt-0.5" style={{ color }}>
            {hint}
          </div>
        ) : (
          <div className="text-[10px] font-bold mt-0.5" style={{ color }}>
            {up ? "+" : ""}
            {pct.toFixed(2)}%
          </div>
        )}
      </div>
    </article>
  );
}
