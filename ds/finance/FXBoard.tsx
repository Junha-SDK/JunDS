"use client";

import { useEffect, useState } from "react";

type Cat = "fx" | "commodity" | "crypto";

interface FXItem {
  symbol: string;
  label: string;
  unit: string;
  /** Current value */
  value: number;
  /** Daily change % */
  pct: number;
  /** Decimal places to render */
  decimals: number;
  cat: Cat;
}

const SEED: FXItem[] = [
  // Korea-relevant FX (per 1 unit foreign currency in 원)
  { symbol: "USD/KRW", label: "달러", unit: "원", value: 1382.40, pct: -0.32, decimals: 2, cat: "fx" },
  { symbol: "JPY/KRW", label: "엔(100)", unit: "원", value: 902.18, pct: 0.21, decimals: 2, cat: "fx" },
  { symbol: "EUR/KRW", label: "유로", unit: "원", value: 1495.62, pct: -0.12, decimals: 2, cat: "fx" },
  { symbol: "CNY/KRW", label: "위안", unit: "원", value: 191.07, pct: 0.05, decimals: 2, cat: "fx" },
  // Commodities
  { symbol: "WTI", label: "WTI 유가", unit: "$/bbl", value: 78.42, pct: 1.18, decimals: 2, cat: "commodity" },
  { symbol: "GOLD", label: "금", unit: "$/oz", value: 2_654.30, pct: 0.62, decimals: 2, cat: "commodity" },
  // Crypto (24h Korean traders watch closely)
  { symbol: "BTC/USD", label: "비트코인", unit: "$", value: 96_842, pct: 2.14, decimals: 0, cat: "crypto" },
];

function tickAll(prev: FXItem[], jitter: () => number): FXItem[] {
  return prev.map((it) => {
    const mag = it.cat === "crypto" ? 0.012 : it.cat === "commodity" ? 0.005 : 0.002;
    const dv = it.value * jitter() * mag;
    const newValue = +(it.value + dv).toFixed(it.decimals);
    const newPct = +(it.pct + jitter() * 0.15).toFixed(2);
    return { ...it, value: newValue, pct: newPct };
  });
}

const CAT_LABEL: Record<Cat, string> = {
  fx: "환율",
  commodity: "원자재",
  crypto: "암호화폐",
};

const CAT_COLOR: Record<Cat, string> = {
  fx: "var(--bm-accent-strong)",
  commodity: "var(--bm-warning)",
  crypto: "#a855f7",
};

export function FXBoard() {
  const [items, setItems] = useState<FXItem[]>(SEED);
  const [prev, setPrev] = useState<FXItem[]>(SEED);
  const [source, setSource] = useState<"loading" | "yahoo" | "error">("loading");

  // Yahoo Finance 실데이터로 30초마다 갱신 (서버 캐시 30s)
  useEffect(() => {
    let aborted = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const fetchOnce = async () => {
      try {
        const res = await fetch("/api/fx");
        if (!res.ok) throw new Error("status-" + res.status);
        const d = (await res.json()) as { items?: FXItem[] };
        if (!aborted && d.items && d.items.length > 0) {
          setPrev((p) => p);
          setItems((p) => {
            setPrev(p);
            return d.items as FXItem[];
          });
          setSource("yahoo");
        }
      } catch {
        if (!aborted) setSource("error");
      }
    };
    const loop = async () => {
      await fetchOnce();
      if (!aborted) timer = setTimeout(loop, 30_000);
    };
    loop();
    return () => {
      aborted = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div className="bm-card overflow-hidden">
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: "1px solid var(--bm-border)" }}
      >
        <span className="relative flex size-2.5">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ background: "var(--bm-success)", animation: "bm-pulse 1.4s ease-out infinite" }}
          />
          <span
            className="relative inline-flex rounded-full size-2.5"
            style={{ background: "var(--bm-success)" }}
          />
        </span>
        <span
          className="text-[11px] font-extrabold tracking-[0.06em]"
          style={{ color: "var(--bm-success)" }}
        >
          LIVE
        </span>
        <span className="text-[12.5px] font-extrabold">환율 · 원자재 · 암호화폐</span>
        <span
          className="ml-auto bm-num text-[11px] font-bold"
          style={{ color: "var(--bm-muted)" }}
        >
          {source === "yahoo" ? "Yahoo · 30초 갱신" : source === "loading" ? "연결 중…" : "데이터 없음"}
        </span>
      </div>
      <div
        className="grid overflow-x-auto"
        style={{
          // minmax(110px,…): 넓으면 1fr 로 균등 분배(데스크톱 그대로), 좁으면 셀이
          // 110px 를 유지하며 가로 스크롤 — 모바일에서 라벨·숫자가 세로로 쪼개지고
          // 겹치던 현상(390px 에 9칸 욱여넣기) 해소.
          gridTemplateColumns: `repeat(${items.length}, minmax(110px, 1fr))`,
        }}
      >
        {items.map((it, i) => {
          const ref = prev[i];
          const trend = ref ? (it.value > ref.value ? "up" : it.value < ref.value ? "down" : "flat") : "flat";
          return (
            <FXCell
              key={it.symbol}
              item={it}
              trend={trend}
              isLast={i === items.length - 1}
            />
          );
        })}
      </div>
    </div>
  );
}

function FXCell({
  item,
  trend,
  isLast,
}: {
  item: FXItem;
  trend: "up" | "down" | "flat";
  isLast: boolean;
}) {
  const up = item.pct >= 0;
  const tickColor =
    trend === "up" ? "var(--bm-up)" : trend === "down" ? "var(--bm-down)" : "var(--bm-text)";
  return (
    <div
      className="px-3 py-2 flex flex-col gap-0.5"
      style={{
        borderRight: isLast ? "none" : "1px solid var(--bm-border)",
      }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="size-1.5 rounded-full"
          style={{ background: CAT_COLOR[item.cat] }}
        />
        <span className="text-[10.5px] font-extrabold" style={{ color: "var(--bm-muted)" }}>
          {item.label}
        </span>
        <span
          className="text-[8.5px] font-bold ml-auto rounded-full px-1.5 py-[1px]"
          style={{
            background: `color-mix(in srgb, ${CAT_COLOR[item.cat]} 10%, transparent)`,
            color: CAT_COLOR[item.cat],
          }}
        >
          {CAT_LABEL[item.cat]}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className="bm-num font-extrabold text-[14px]"
          style={{ color: tickColor }}
        >
          {trend === "up" ? "▲" : trend === "down" ? "▼" : ""}
          {item.value.toLocaleString("ko-KR", {
            minimumFractionDigits: item.decimals,
            maximumFractionDigits: item.decimals,
          })}
        </span>
        <span className="bm-num text-[9.5px] font-bold" style={{ color: "var(--bm-muted)" }}>
          {item.unit}
        </span>
      </div>
      <span
        className="bm-num font-extrabold text-[10.5px]"
        style={{ color: up ? "var(--bm-up)" : "var(--bm-down)" }}
      >
        {up ? "+" : ""}
        {item.pct.toFixed(2)}%
      </span>
      <span className="text-[9px] font-bold" style={{ color: "var(--bm-muted)" }}>
        {item.symbol}
      </span>
    </div>
  );
}
