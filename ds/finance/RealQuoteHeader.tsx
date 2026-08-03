"use client";

import { useEffect, useState } from "react";
import { AppIcon } from "./AppIcon";

interface QuoteData {
  source: "kis" | "yahoo" | "mock";
  name?: string;
  price: number;
  change: number;
  changePct: number;
  open?: number;
  high?: number;
  low?: number;
  prevClose?: number;
  volume?: number;
  marketCap?: number;
  high52?: number;
  low52?: number;
  per?: number;
  pbr?: number;
}

function fmtVolume(v?: number): string {
  if (!v) return "—";
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString("ko-KR");
}

function fmtCap(v?: number): string {
  if (!v) return "—";
  const 억 = v / 100_000_000;
  if (억 >= 10_000) return `${(억 / 10_000).toFixed(2)}조`;
  if (억 >= 1) return `${억.toFixed(0)}억`;
  return v.toLocaleString("ko-KR");
}

export function RealQuoteHeader({ symbol }: { symbol: string }) {
  const [data, setData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`)
      .then(async (r) => {
        const json = await r.json();
        if (cancelled) return;
        if (r.ok) setData(json);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  if (loading || !data) {
    return null;
  }

  const up = data.changePct >= 0;
  const color = up ? "var(--bm-up)" : "var(--bm-down)";

  return (
    <section className="bm-card overflow-hidden" style={{ border: "1px solid var(--bm-border)" }}>
      <header
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--bm-border)" }}
      >
        <div className="flex items-center gap-2">
          <AppIcon name="activity" size={16} strokeWidth={2.2} color="var(--bm-accent-strong)" />
          <h2 className="font-extrabold text-[14px]">실시간 시세</h2>
          {data.source === "kis" ? (
            <span
              className="inline-flex items-center gap-1.5 text-[12px] font-extrabold rounded-full px-2.5 py-1"
              style={{
                background: "rgba(20, 184, 166, 0.14)",
                color: "var(--bm-accent-strong)",
                border: "1.5px solid rgba(20, 184, 166, 0.45)",
                letterSpacing: "0.02em",
              }}
              title="한국투자증권 KIS Open API"
            >
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{
                  background: "var(--bm-accent)",
                  boxShadow: "0 0 0 4px rgba(20, 184, 166, 0.18)",
                }}
              />
              KIS · 실시간
            </span>
          ) : data.source === "yahoo" ? (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-1.5 py-0.5 opacity-80"
              style={{
                background: "var(--bm-soft-100)",
                color: "var(--bm-muted)",
                border: "1px solid var(--bm-border)",
              }}
              title="KIS 응답 실패 — Yahoo Finance 백업 사용"
            >
              <span className="size-1 rounded-full" style={{ background: "var(--bm-muted)" }} />
              Yahoo · 백업
            </span>
          ) : null}
        </div>
        <span className="text-[11px] font-semibold" style={{ color: "var(--bm-muted)" }}>
          {data.source === "kis" ? "약 15분 지연" : "15분 지연"}
        </span>
      </header>

      <div className="px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-3 bm-num">
        <KV
          label="현재가"
          value={data.price.toLocaleString("ko-KR")}
          unit="원"
          tone={up ? "up" : "down"}
          large
        />
        <KV
          label="전일대비"
          value={`${up ? "+" : ""}${data.change.toFixed(0)}`}
          unit={`${up ? "+" : ""}${data.changePct.toFixed(2)}%`}
          tone={up ? "up" : "down"}
          large
        />
        <KV label="거래량" value={fmtVolume(data.volume)} unit="주" />
        <KV label="시가총액" value={fmtCap(data.marketCap)} />
      </div>

      <div
        className="px-4 py-2.5 grid grid-cols-3 md:grid-cols-6 gap-3 text-[11.5px]"
        style={{ background: "var(--bm-soft-100)", borderTop: "1px solid var(--bm-border)" }}
      >
        <Mini label="시가" value={data.open?.toLocaleString("ko-KR")} />
        <Mini label="고가" value={data.high?.toLocaleString("ko-KR")} tone="up" />
        <Mini label="저가" value={data.low?.toLocaleString("ko-KR")} tone="down" />
        <Mini label="전일종가" value={data.prevClose?.toLocaleString("ko-KR")} />
        <Mini label="52주 최고" value={data.high52?.toLocaleString("ko-KR")} tone="up" />
        <Mini label="52주 최저" value={data.low52?.toLocaleString("ko-KR")} tone="down" />
      </div>

      {data.per != null || data.pbr != null ? (
        <div
          className="px-4 py-2 grid grid-cols-2 gap-3 text-[11.5px]"
          style={{ borderTop: "1px solid var(--bm-border)" }}
        >
          <Mini label="PER" value={data.per ? data.per.toFixed(1) : "—"} />
          <Mini label="PBR" value={data.pbr ? data.pbr.toFixed(2) : "—"} />
        </div>
      ) : null}
    </section>
  );
}

function KV({
  label,
  value,
  unit,
  tone,
  large,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: "up" | "down";
  large?: boolean;
}) {
  const color =
    tone === "up" ? "var(--bm-up)" : tone === "down" ? "var(--bm-down)" : "var(--bm-text)";
  return (
    <div>
      <div className="text-[10.5px] font-bold" style={{ color: "var(--bm-muted)" }}>
        {label}
      </div>
      <div className="bm-num font-extrabold mt-0.5" style={{ color, fontSize: large ? 18 : 14 }}>
        {value}
        {unit ? <span className="text-[10.5px] ml-1 font-semibold opacity-80">{unit}</span> : null}
      </div>
    </div>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | undefined;
  tone?: "up" | "down";
}) {
  const color =
    tone === "up" ? "var(--bm-up)" : tone === "down" ? "var(--bm-down)" : "var(--bm-text)";
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10.5px] font-bold" style={{ color: "var(--bm-muted)" }}>
        {label}
      </span>
      <span className="bm-num font-extrabold" style={{ color }}>
        {value ?? "—"}
      </span>
    </div>
  );
}
