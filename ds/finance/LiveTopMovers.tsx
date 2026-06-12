"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMarketStatus } from "./lib/useMarketStatus";

interface MoverStock {
  rank: number;
  code: string;
  name: string;
  price: number;
  changePct: number;
  amount?: number;
}

interface MoversBucket {
  rise: MoverStock[];
  fall: MoverStock[];
  volume: MoverStock[];
}

const EMPTY: MoversBucket = { rise: [], fall: [], volume: [] };

function fmtAmount(amount: number | undefined): string {
  if (!amount) return "—";
  // Naver returns amount in 원. Convert to 억원.
  const 억 = amount / 100_000_000;
  if (억 >= 10_000) return `${(억 / 10_000).toFixed(2)}조`;
  if (억 >= 1) return `${억.toFixed(0).toLocaleString()}억`;
  return `${(amount / 10_000).toFixed(0)}만`;
}

async function fetchMarket(market: "KOSPI" | "KOSDAQ", limit: number): Promise<MoversBucket> {
  const types = ["RISE", "FALL", "VOLUME"] as const;
  const [rise, fall, volume] = await Promise.all(
    types.map(async (type) => {
      const res = await fetch(`/api/krx/movers?market=${market}&type=${type}&limit=${limit}`);
      if (!res.ok) return [] as MoverStock[];
      const data = (await res.json()) as { items?: MoverStock[] };
      return data.items ?? [];
    }),
  );
  return { rise, fall, volume };
}

export function LiveTopMovers({ rows = 8, market = "KOSPI" as "KOSPI" | "KOSDAQ" }: {
  rows?: number;
  market?: "KOSPI" | "KOSDAQ";
}) {
  const [data, setData] = useState<MoversBucket>(EMPTY);
  const [activeMarket, setActiveMarket] = useState<"KOSPI" | "KOSDAQ">(market);
  const [now, setNow] = useState<string>("");
  const [source, setSource] = useState<"live" | "loading" | "error" | "closed">("loading");
  const marketStatus = useMarketStatus();
  const isOpen = marketStatus === "장중";

  useEffect(() => {
    let aborted = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const tick = async () => {
      try {
        const next = await fetchMarket(activeMarket, rows);
        if (aborted) return;
        if (next.rise.length === 0 && next.fall.length === 0) {
          setSource("error");
        } else {
          setData(next);
          setSource(isOpen ? "live" : "closed");
        }
        const d = new Date();
        setNow(
          `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`,
        );
      } catch {
        if (!aborted) setSource("error");
      } finally {
        // 장중에만 60초 간격으로 폴링한다. 장 외에는 스냅샷만 1회 받고 멈춘다.
        if (!aborted && isOpen) timer = setTimeout(tick, 60_000);
      }
    };
    setSource(isOpen ? "loading" : "closed");
    tick();
    return () => {
      aborted = true;
      if (timer) clearTimeout(timer);
    };
  }, [activeMarket, rows, isOpen]);

  const gainers = useMemo(() => data.rise.slice(0, rows), [data.rise, rows]);
  const losers = useMemo(() => data.fall.slice(0, rows), [data.fall, rows]);
  const volume = useMemo(() => data.volume.slice(0, rows), [data.volume, rows]);

  const dotColor =
    source === "live"
      ? "var(--bm-success)"
      : source === "loading"
      ? "var(--bm-warning)"
      : "var(--bm-muted)";
  const liveLabel =
    source === "live"
      ? "LIVE"
      : source === "loading"
      ? "LOAD"
      : source === "closed"
      ? marketStatus === "휴장"
        ? "휴장"
        : "장마감"
      : "OFFLINE";
  return (
    <div className="bm-card overflow-hidden">
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: "1px solid var(--bm-border)" }}
      >
        <span className="relative flex size-2.5">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ background: dotColor, animation: source === "live" ? "bm-pulse 1.4s ease-out infinite" : "none" }}
          />
          <span className="relative inline-flex rounded-full size-2.5" style={{ background: dotColor }} />
        </span>
        <span className="text-[11px] font-extrabold tracking-[0.06em]" style={{ color: dotColor }}>
          {liveLabel}
        </span>
        <span className="text-[12.5px] font-extrabold">
          {activeMarket === "KOSPI" ? "코스피" : "코스닥"}{" "}
          {isOpen ? "실시간 순위" : "장 마감 순위"}
        </span>

        <div
          className="ml-2 inline-flex items-center rounded-md overflow-hidden"
          style={{ border: "1px solid var(--bm-border)" }}
        >
          {(["KOSPI", "KOSDAQ"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setActiveMarket(m)}
              className="px-2 py-0.5 text-[10.5px] font-extrabold"
              style={{
                background: activeMarket === m ? "var(--bm-accent-strong)" : "transparent",
                color: activeMarket === m ? "var(--bm-card)" : "var(--bm-muted)",
              }}
            >
              {m === "KOSPI" ? "코스피" : "코스닥"}
            </button>
          ))}
        </div>

        <span
          className="ml-auto bm-num text-[11.5px] font-bold"
          style={{ color: "var(--bm-muted)" }}
        >
          {isOpen ? `${now || "—"} · 네이버` : "정규장 종료 시점 스냅샷 · 네이버"}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3">
        <Column title="급등 TOP" tone="up" rows={gainers} metric="pct" />
        <Column title="급락 TOP" tone="down" rows={losers} metric="pct" isMid />
        <Column title="거래대금 TOP" tone="neutral" rows={volume} metric="amount" isLast />
      </div>
      {source === "error" ? (
        <div
          className="px-3 py-2 text-[11.5px] font-bold"
          style={{ background: "var(--bm-soft-100)", color: "var(--bm-muted)" }}
        >
          데이터를 불러오지 못했습니다 — 잠시 후 다시 시도됩니다.
        </div>
      ) : null}
    </div>
  );
}

function Column({
  title,
  tone,
  rows,
  metric,
  isMid,
  isLast,
}: {
  title: string;
  tone: "up" | "down" | "neutral";
  rows: MoverStock[];
  metric: "pct" | "amount";
  isMid?: boolean;
  isLast?: boolean;
}) {
  const accent =
    tone === "up" ? "var(--bm-up)" : tone === "down" ? "var(--bm-down)" : "#9333ea";
  return (
    <div
      style={{
        borderRight: isLast ? "none" : "1px solid var(--bm-border)",
        borderLeft: isMid ? "1px solid var(--bm-border)" : undefined,
      }}
    >
      <div
        className="flex items-center gap-1.5 px-3 py-1.5"
        style={{
          borderBottom: "1px solid var(--bm-border)",
          background: "var(--bm-soft-100)",
        }}
      >
        <span className="size-2 rounded-full" style={{ background: accent }} />
        <span className="text-[11.5px] font-extrabold">{title}</span>
      </div>
      <ul>
        {rows.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <li
              key={`sk-${i}`}
              className="px-3 py-2"
              style={{
                borderBottom: i === 4 ? "none" : "1px solid var(--bm-border)",
              }}
            >
              <div className="h-3 rounded bm-shine" style={{ background: "var(--bm-soft-100)" }} />
            </li>
          ))
        ) : (
          rows.map((s, i) => (
            <li
              key={`${s.code}-${i}`}
              className="grid items-center px-3 py-1.5"
              style={{
                gridTemplateColumns: "16px 1fr auto",
                borderBottom: i === rows.length - 1 ? "none" : "1px solid var(--bm-border)",
                gap: 8,
              }}
            >
              <span
                className="bm-num text-[10px] font-extrabold inline-flex items-center justify-center rounded-full"
                style={{
                  width: 16,
                  height: 16,
                  background: i === 0 ? accent : "var(--bm-soft-100)",
                  color: i === 0 ? "white" : "var(--bm-muted)",
                }}
              >
                {i + 1}
              </span>
              <Link href={`/stock/${encodeURIComponent(s.name)}`} className="min-w-0">
                <div
                  className="text-[11.5px] font-extrabold truncate"
                  style={{ color: "var(--bm-text)" }}
                >
                  {s.name}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="bm-num text-[10px] font-bold"
                    style={{ color: "var(--bm-muted)" }}
                  >
                    {s.price.toLocaleString("ko-KR")}
                  </span>
                  <span
                    className="text-[9px] font-bold rounded-full px-1"
                    style={{ background: "var(--bm-soft-100)", color: "var(--bm-muted)" }}
                  >
                    {s.code}
                  </span>
                </div>
              </Link>
              {metric === "pct" ? (
                <span
                  className="bm-num font-extrabold text-[12px] whitespace-nowrap"
                  style={{ color: tone === "up" ? "var(--bm-up)" : "var(--bm-down)" }}
                >
                  {s.changePct >= 0 ? "+" : ""}
                  {s.changePct.toFixed(2)}%
                </span>
              ) : (
                <span
                  className="bm-num font-extrabold text-[12px] whitespace-nowrap"
                  style={{ color: "#9333ea" }}
                >
                  {fmtAmount(s.amount)}
                </span>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
