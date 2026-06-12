"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CandleChart, type MarkerLine } from "./CandleChart";
import { AppIcon } from "./AppIcon";
import type { Candle } from "./lib/mock";
import { seedSurgeCandles } from "./lib/mock";
import { useMarketStatus } from "./lib/useMarketStatus";

const INTRADAY_INTERVALS = new Set(["5m", "15m", "30m", "1h"]);

function pollMsFor(interval: string): number {
  if (interval === "5m" || interval === "15m") return 20_000;
  if (interval === "30m") return 30_000;
  if (interval === "1h") return 45_000;
  return 0;
}

interface CandleApiBar {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

interface RealCandleChartProps {
  symbol: string;
  range?: string;
  interval?: string;
  width?: number;
  height?: number;
  markers?: MarkerLine[];
  fallbackSeed?: number;
  fallbackBase?: number;
}

interface FetchState {
  loading: boolean;
  source: "yahoo" | "mock" | null;
  candles: Candle[];
  error?: string;
  prevClose?: number;
  asOf?: number;
}

export function RealCandleChart({
  symbol,
  range = "3mo",
  interval = "1d",
  width = 1280,
  height = 540,
  markers,
  fallbackSeed = 7,
  fallbackBase = 60_000,
}: RealCandleChartProps) {
  const [state, setState] = useState<FetchState>({
    loading: true,
    source: null,
    candles: [],
  });
  const marketStatus = useMarketStatus();
  const cancelledRef = useRef(false);

  const fetchCandles = useCallback(
    async (showLoading: boolean) => {
      if (showLoading) {
        setState((prev) => ({ ...prev, loading: true }));
      }
      const url = `/api/candles?symbol=${encodeURIComponent(symbol)}&range=${range}&interval=${interval}&_=${Date.now()}`;
      try {
        const r = await fetch(url, { cache: "no-store" });
        const data = await r.json();
        if (cancelledRef.current) return;
        if (r.ok && data.bars?.length) {
          const candles: Candle[] = data.bars.map((b: CandleApiBar) => ({
            t: String(b.t),
            o: b.o,
            h: b.h,
            l: b.l,
            c: b.c,
            v: b.v,
          }));
          setState({
            loading: false,
            source: data.source,
            candles,
            prevClose: data.meta?.prevClose,
            asOf: Date.now(),
          });
        } else {
          setState({
            loading: false,
            source: "mock",
            candles: seedSurgeCandles(fallbackSeed, 88, fallbackBase, 50, 0.27),
            error: data.error,
            asOf: Date.now(),
          });
        }
      } catch {
        if (cancelledRef.current) return;
        setState({
          loading: false,
          source: "mock",
          candles: seedSurgeCandles(fallbackSeed, 88, fallbackBase, 50, 0.27),
          asOf: Date.now(),
        });
      }
    },
    [symbol, range, interval, fallbackSeed, fallbackBase],
  );

  useEffect(() => {
    cancelledRef.current = false;
    setState({ loading: true, source: null, candles: [] });
    fetchCandles(true);
    return () => {
      cancelledRef.current = true;
    };
  }, [fetchCandles]);

  useEffect(() => {
    const intradayMs = pollMsFor(interval);
    if (!intradayMs) return;
    if (marketStatus !== "장중") return;
    const id = setInterval(() => fetchCandles(false), intradayMs);
    return () => clearInterval(id);
  }, [fetchCandles, interval, marketStatus]);

  useEffect(() => {
    if (!INTRADAY_INTERVALS.has(interval)) return;
    const onFocus = () => {
      if (document.visibilityState === "visible") fetchCandles(false);
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [fetchCandles, interval]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2 text-[11.5px]">
          <span
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-extrabold"
            style={{
              background: state.source === "yahoo" ? "rgba(34,197,94,0.12)" : "var(--bm-soft-100)",
              color: state.source === "yahoo" ? "#16a34a" : "var(--bm-muted)",
            }}
          >
            <span
              className="size-1.5 rounded-full"
              style={{ background: state.source === "yahoo" ? "var(--bm-success)" : "var(--bm-muted)" }}
            />
            {state.source === "yahoo"
              ? "Yahoo Finance · 실시간"
              : state.loading
                ? "데이터 불러오는 중…"
                : "샘플 데이터"}
          </span>
          {state.source === "yahoo" ? (
            <span className="bm-num text-[11px]" style={{ color: "var(--bm-muted)" }}>
              {state.candles.length}봉 · {range} {interval}
            </span>
          ) : null}
          {state.asOf && pollMsFor(interval) ? (
            <FreshnessBadge asOf={state.asOf} marketStatus={marketStatus} />
          ) : null}
        </div>
        {state.source === "yahoo" ? (
          <a
            href={`https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold flex items-center gap-1"
            style={{ color: "var(--bm-muted)" }}
          >
            Yahoo에서 보기
            <AppIcon name="external" size={11} strokeWidth={2.2} />
          </a>
        ) : null}
      </div>
      <CandleChart
        candles={state.candles}
        width={width}
        height={height}
        markers={markers}
        showVolume
      />
    </div>
  );
}

function FreshnessBadge({
  asOf,
  marketStatus,
}: {
  asOf: number;
  marketStatus: "장중" | "프리장" | "애프터장" | "장마감" | "휴장";
}) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 5_000);
    return () => clearInterval(id);
  }, []);
  const sec = Math.max(0, Math.floor((Date.now() - asOf) / 1000));
  const label = sec < 5 ? "방금" : sec < 60 ? `${sec}초 전` : `${Math.floor(sec / 60)}분 전`;
  const live = marketStatus === "장중" || marketStatus === "프리장" || marketStatus === "애프터장";
  return (
    <span
      className="text-[11px] font-bold inline-flex items-center gap-1"
      style={{ color: "var(--bm-muted)" }}
      title={new Date(asOf).toLocaleTimeString("ko-KR")}
    >
      <span
        aria-hidden
        className="size-1.5 rounded-full"
        style={{
          background: live ? "var(--bm-live-bright)" : "var(--bm-muted)",
        }}
      />
      {label} 갱신
    </span>
  );
}
