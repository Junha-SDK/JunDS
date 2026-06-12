"use client";

import { useEffect, useMemo, useState } from "react";
import { CandleChart, type MarkerLine } from "./CandleChart";
import { useLivePrice } from "./lib/livePrices";
import { useMarketStatus } from "./lib/useMarketStatus";
import { strategyFor } from "./lib/strategy";
import type { Candle } from "./lib/mock";

interface KisCandleApi {
  date: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * 종목 상세 메인 캔들 차트 — KIS 일봉 60거래일 + 우측 가격 라더 (B1/B2/B3/SF/현재가).
 *
 * 장중에는 마지막 캔들의 종가를 useLivePrice (KIS 5초 시드) 로 실시간 갱신.
 * 라이브 가격이 high/low를 넘어서면 동적으로 확장.
 */
export function LiveStockHeroChart({
  symbol,
  width = 1100,
  height = 380,
}: {
  symbol: string;
  width?: number;
  height?: number;
}) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const status = useMarketStatus();
  const isOpen = status === "장중";
  const { price: livePrice } = useLivePrice(symbol);

  // 1. 일봉 60거래일 KIS 로 fetch
  useEffect(() => {
    let aborted = false;
    fetch(`/api/kis/chart/${encodeURIComponent(symbol)}?period=D`)
      .then((r) => r.json())
      .then((d) => {
        if (aborted) return;
        if (!d || !Array.isArray(d.candles)) {
          setError("차트 데이터 없음");
          setLoading(false);
          return;
        }
        const last60 = (d.candles as KisCandleApi[]).slice(-60);
        const mapped: Candle[] = last60.map((c) => ({
          o: c.open,
          h: c.high,
          l: c.low,
          c: c.close,
          v: c.volume,
          t: c.date,
        }));
        setCandles(mapped);
        setLoading(false);
      })
      .catch((e) => {
        if (!aborted) {
          setError((e as Error).message);
          setLoading(false);
        }
      });
    return () => {
      aborted = true;
    };
  }, [symbol]);

  // 2. 장중에는 마지막 캔들의 close/high/low를 livePrice로 갱신
  const liveCandles = useMemo<Candle[]>(() => {
    if (!isOpen || livePrice <= 0 || candles.length === 0) return candles;
    const last = candles[candles.length - 1];
    const updated: Candle = {
      ...last,
      c: livePrice,
      h: Math.max(last.h, livePrice),
      l: Math.min(last.l, livePrice),
    };
    return [...candles.slice(0, -1), updated];
  }, [candles, livePrice, isOpen]);

  // 3. 가격 라더 markers — strategyFor 의 B1/B2/B3 + T2 + 현재가
  const markers = useMemo<MarkerLine[]>(() => {
    const s = strategyFor(symbol);
    return [
      {
        label: s.takeProfitZones[1]?.label ?? "T2",
        price: s.takeProfitZones[1]?.price ?? 0,
        color: "#8b5cf6",
      },
      { label: s.buyZones[0].label, price: s.buyZones[0].price, color: "var(--bm-success)" },
      { label: s.buyZones[1].label, price: s.buyZones[1].price, color: "var(--bm-down)" },
      { label: s.buyZones[2].label, price: s.buyZones[2].price, color: "#7c3aed" },
    ];
  }, [symbol]);

  if (loading) {
    return (
      <div
        className="rounded-xl px-4 py-12 text-center text-[12.5px]"
        style={{ background: "var(--bm-soft-100)", color: "var(--bm-muted)" }}
      >
        캔들 차트 로딩 중…
      </div>
    );
  }
  if (error || liveCandles.length === 0) {
    return (
      <div
        className="rounded-xl px-4 py-12 text-center text-[12.5px]"
        style={{ background: "var(--bm-soft-100)", color: "var(--bm-muted)" }}
      >
        차트를 불러오지 못했습니다 ({error ?? "데이터 없음"})
      </div>
    );
  }

  return (
    <div className="relative">
      {/* LIVE 배지 */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full backdrop-blur" style={{ background: "color-mix(in srgb, var(--bm-card) 80%, transparent)" }}>
        <span className="relative flex size-2">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{
              background: isOpen ? "var(--bm-success)" : "var(--bm-muted)",
              animation: isOpen ? "bm-pulse 1.4s ease-out infinite" : "none",
            }}
          />
          <span
            className="relative inline-flex rounded-full size-2"
            style={{ background: isOpen ? "var(--bm-success)" : "var(--bm-muted)" }}
          />
        </span>
        <span
          className="text-[10px] font-extrabold tracking-[0.06em]"
          style={{ color: isOpen ? "var(--bm-success)" : "var(--bm-muted)" }}
        >
          {isOpen ? "LIVE · KIS" : status === "휴장" ? "휴장" : "장마감 스냅샷"}
        </span>
      </div>
      <CandleChart
        candles={liveCandles}
        width={width}
        height={height}
        markers={markers}
        showCurrent={true}
        showVolume={false}
      />
    </div>
  );
}
