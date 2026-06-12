"use client";

import { useMemo, useRef, useState } from "react";
import type { Candle } from "./lib/mock";
import {
  computeATR,
  computeBollinger,
  computeCCI,
  computeIchimoku,
  computeMACD,
  computeOBV,
  computePivot,
  computeRegression,
  computeRSI,
  computeStochastic,
  computeVolumeProfile,
  computeVWAP,
  computeWilliamsR,
  detectPatterns,
  toHeikinAshi,
} from "./lib/chartIndicators";

export interface MarkerLine {
  label: string;
  price: number;
  color: string;
  /** dashed line + pulsing edge dot — KIS 실시간 체결가 등 변동 라인용. */
  live?: boolean;
}

export interface EventMarker {
  /** 캔들 index */
  index: number;
  /** "E"=실적, "D"=배당, "S"=분할 등 짧은 라벨 */
  label: string;
  color: string;
  /** Hover 시 표시할 풀 텍스트 */
  title?: string;
}

export type ChartType = "candle" | "heikin" | "line" | "area";

export interface ChartIndicators {
  /** Bollinger Bands. true → period=20, stdDev=2 default. */
  bollinger?: boolean | { period?: number; stdDev?: number };
  /** RSI. true → period=14 default. */
  rsi?: boolean | { period?: number };
  /** MACD. true → 12/26/9 default. */
  macd?: boolean | { fast?: number; slow?: number; signal?: number };
  /** Stochastic %K/%D. true → 14/3 */
  stochastic?: boolean | { period?: number; smooth?: number };
  /** Williams %R. true → 14 */
  williamsR?: boolean | { period?: number };
  /** CCI. true → 20 */
  cci?: boolean | { period?: number };
  /** ATR. true → 14 (변동성 — subpanel) */
  atr?: boolean | { period?: number };
  /** OBV. true → on (subpanel) */
  obv?: boolean;
  /** VWAP. true → on (main chart overlay) */
  vwap?: boolean;
  /** Ichimoku Cloud. true → 9/26/52 */
  ichimoku?: boolean;
  /** 우측 Volume Profile sidebar */
  volumeProfile?: boolean | { bins?: number };
  /** 자동 패턴 감지 (golden/dead cross, 쌍봉/쌍바닥). 차트에 ▲▼ 마커. */
  patterns?: boolean;
  /** Pivot Points (전일 OHLC 기반 P/R1~R3/S1~S3). */
  pivots?: boolean;
  /** Linear Regression Channel — 가시 영역 추세선 + ±2σ */
  regression?: boolean;
  /** Volume heatmap — 거래량 큰 봉을 진하게, 작은 봉을 옅게 */
  volumeHeatmap?: boolean;
  /** 시간대 음영 — intraday 차트에서 09:00~09:30, 14:30~15:30 같은 특수 시간대 표시 */
  sessionShading?: boolean;
}

export interface CompareLine {
  /** 같은 길이 배열 — index i 가 candles[i] 와 동일 시점 */
  values: (number | null)[];
  /** "KOSPI", "삼성전자" 등 */
  label: string;
  /** stroke 색 */
  color: string;
}

interface CandleChartProps {
  candles: Candle[];
  width?: number;
  height?: number;
  markers?: MarkerLine[];
  events?: EventMarker[];
  showCurrent?: boolean;
  separatorIndex?: number;
  xLabels?: { index: number; label: string; bold?: boolean }[];
  showVolume?: boolean;
  /** Moving averages overlay; if omitted defaults to [5,10,20,60,120] */
  movingAverages?: number[];
  /** Candle 표현 변형 — heikin/line/area */
  chartType?: ChartType;
  /** Y축 로그 스케일 (장기 차트에 유리). 기본 false */
  logScale?: boolean;
  /** 활성 지표 — 미지정 시 전부 off */
  indicators?: ChartIndicators;
  /**
   * 비교 라인 — 다른 종목/지수의 close 시리즈를 같은 y축에 정규화해 오버레이.
   * 호출부에서 candles[0].c 기준으로 스케일링한 후 넘기는 게 일반적이다.
   */
  compareLine?: CompareLine;
}

const MA_PALETTE: Record<number, string> = {
  5: "var(--bm-cat-2)",
  10: "var(--bm-cat-1)",
  20: "var(--bm-cat-4)",
  60: "var(--bm-cat-6)",
  120: "var(--bm-cat-7)",
};

function computeMA(candles: Candle[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].c;
    if (i >= period) sum -= candles[i - period].c;
    out.push(i >= period - 1 ? sum / period : null);
  }
  return out;
}

export function CandleChart({
  candles,
  width = 380,
  height = 380,
  markers = [],
  events = [],
  showCurrent = true,
  separatorIndex,
  xLabels,
  showVolume = true,
  movingAverages = [5, 10, 20, 60, 120],
  chartType = "candle",
  logScale = false,
  indicators = {},
  compareLine,
}: CandleChartProps) {
  // ── 데이터 변환: 차트 타입에 따라 캔들 OHLC 재구성 ──
  const displayCandles = useMemo<Candle[]>(() => {
    if (chartType === "heikin") {
      return toHeikinAshi(candles).map((b, i) => ({ ...candles[i], ...b }));
    }
    return candles;
  }, [candles, chartType]);

  // ── 지표 활성 플래그 정규화 ──
  const ind = useMemo(() => {
    const bb = indicators.bollinger;
    const rsi = indicators.rsi;
    const macd = indicators.macd;
    const stoch = indicators.stochastic;
    const wr = indicators.williamsR;
    const cci = indicators.cci;
    const atr = indicators.atr;
    const vp = indicators.volumeProfile;
    return {
      bb: bb
        ? {
            period: typeof bb === "object" ? (bb.period ?? 20) : 20,
            stdDev: typeof bb === "object" ? (bb.stdDev ?? 2) : 2,
          }
        : null,
      rsi: rsi ? { period: typeof rsi === "object" ? (rsi.period ?? 14) : 14 } : null,
      macd: macd
        ? {
            fast: typeof macd === "object" ? (macd.fast ?? 12) : 12,
            slow: typeof macd === "object" ? (macd.slow ?? 26) : 26,
            signal: typeof macd === "object" ? (macd.signal ?? 9) : 9,
          }
        : null,
      stoch: stoch
        ? {
            period: typeof stoch === "object" ? (stoch.period ?? 14) : 14,
            smooth: typeof stoch === "object" ? (stoch.smooth ?? 3) : 3,
          }
        : null,
      wr: wr ? { period: typeof wr === "object" ? (wr.period ?? 14) : 14 } : null,
      cci: cci ? { period: typeof cci === "object" ? (cci.period ?? 20) : 20 } : null,
      atr: atr ? { period: typeof atr === "object" ? (atr.period ?? 14) : 14 } : null,
      obv: !!indicators.obv,
      vwap: !!indicators.vwap,
      ichimoku: !!indicators.ichimoku,
      patterns: !!indicators.patterns,
      pivots: !!indicators.pivots,
      regression: !!indicators.regression,
      volumeHeatmap: !!indicators.volumeHeatmap,
      sessionShading: !!indicators.sessionShading,
      vp: vp ? { bins: typeof vp === "object" ? (vp.bins ?? 24) : 24 } : null,
    };
  }, [indicators]);

  const rsiData = useMemo(
    () => (ind.rsi ? computeRSI(candles.map((c) => c.c), ind.rsi.period) : null),
    [candles, ind.rsi],
  );
  const macdData = useMemo(
    () =>
      ind.macd
        ? computeMACD(
            candles.map((c) => c.c),
            ind.macd.fast,
            ind.macd.slow,
            ind.macd.signal,
          )
        : null,
    [candles, ind.macd],
  );
  const bbData = useMemo(
    () =>
      ind.bb ? computeBollinger(displayCandles.map((c) => c.c), ind.bb.period, ind.bb.stdDev) : null,
    [displayCandles, ind.bb],
  );
  const stochData = useMemo(
    () => (ind.stoch ? computeStochastic(candles, ind.stoch.period, ind.stoch.smooth) : null),
    [candles, ind.stoch],
  );
  const wrData = useMemo(
    () => (ind.wr ? computeWilliamsR(candles, ind.wr.period) : null),
    [candles, ind.wr],
  );
  const cciData = useMemo(
    () => (ind.cci ? computeCCI(candles, ind.cci.period) : null),
    [candles, ind.cci],
  );
  const atrData = useMemo(
    () => (ind.atr ? computeATR(candles, ind.atr.period) : null),
    [candles, ind.atr],
  );
  const obvData = useMemo(() => (ind.obv ? computeOBV(candles) : null), [candles, ind.obv]);
  const vwapData = useMemo(() => (ind.vwap ? computeVWAP(candles) : null), [candles, ind.vwap]);
  const ichimokuData = useMemo(
    () => (ind.ichimoku ? computeIchimoku(candles) : null),
    [candles, ind.ichimoku],
  );
  const patternHits = useMemo(
    () => (ind.patterns ? detectPatterns(candles) : []),
    [candles, ind.patterns],
  );
  const pivot = useMemo(() => {
    if (!ind.pivots || candles.length < 2) return null;
    return computePivot(candles[candles.length - 2]);
  }, [candles, ind.pivots]);
  const regression = useMemo(
    () => (ind.regression ? computeRegression(candles.map((c) => c.c)) : null),
    [candles, ind.regression],
  );

  // ── 레이아웃 (subpanel 높이 누적) ──
  const layout = useMemo(() => {
    const padL = 8;
    const padR = 64;
    const padT = 6;
    const padB = 22;
    const volH = showVolume ? 70 : 0;
    const rsiH = ind.rsi ? 80 : 0;
    const macdH = ind.macd ? 80 : 0;
    const stochH = ind.stoch ? 70 : 0;
    const wrH = ind.wr ? 60 : 0;
    const cciH = ind.cci ? 70 : 0;
    const atrH = ind.atr ? 60 : 0;
    const obvH = ind.obv ? 60 : 0;
    const subPanels = [rsiH, macdH, stochH, wrH, cciH, atrH, obvH].filter((h) => h > 0);
    const subpanelGap = subPanels.length * 6;
    const subpanelTotal = subPanels.reduce((s, h) => s + h, 0);
    const candleH = height - padT - padB - volH - subpanelTotal - subpanelGap;
    const innerW = width - padL - padR;
    const slot = innerW / Math.max(1, candles.length);
    const bodyW = Math.max(2, slot * 0.7);

    let min = Infinity;
    let max = -Infinity;
    for (const c of displayCandles) {
      if (c.l < min) min = c.l;
      if (c.h > max) max = c.h;
    }
    // 정적 마커(SF/B1/B2 등)는 y축 범위에 포함시켜야 의미가 있다.
    // 단, `live: true` 마커는 캔들 범위와 동떨어진 값으로 들어와 차트를 쏠리게 할 수 있어 제외.
    for (const m of markers) {
      if (m.live) continue;
      if (m.price < min) min = m.price;
      if (m.price > max) max = m.price;
    }
    // Bollinger 가 있으면 범위에 포함 (밴드가 화면 밖으로 잘리지 않게)
    if (bbData) {
      for (const v of bbData.upper) if (v != null && v > max) max = v;
      for (const v of bbData.lower) if (v != null && v < min) min = v;
    }
    // 비교 라인이 있으면 그것도 범위에 포함 (잘리지 않도록)
    if (compareLine) {
      for (const v of compareLine.values) {
        if (v == null) continue;
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      min = 0;
      max = 1;
    }
    const padPrice = (max - min) * 0.04 || 1;
    min -= padPrice;
    max += padPrice;

    // 로그 스케일 — 양수 범위에서만 의미. min<=0 이면 자동 폴백.
    const useLog = logScale && min > 0;
    const logMin = useLog ? Math.log10(min) : min;
    const logMax = useLog ? Math.log10(max) : max;

    const yPrice = (p: number) => {
      const v = useLog && p > 0 ? Math.log10(p) : useLog ? logMin : p;
      return padT + ((logMax - v) / (logMax - logMin || 1)) * candleH;
    };
    const yPriceClamped = (p: number) => {
      const y = yPrice(p);
      const top = padT + 10;
      const bottom = padT + candleH - 10;
      return Math.max(top, Math.min(bottom, y));
    };

    const maxVol = Math.max(1, ...candles.map((c) => c.v));
    const volTop = padT + candleH + 6;
    const volBottom = volTop + volH;
    // Subpanel cursor — 활성 지표를 순서대로 쌓는다 (RSI → MACD → Stoch → WR → CCI → ATR → OBV).
    let cursor = volBottom;
    const rsiTop = rsiH > 0 ? (cursor += 6, cursor) : 0;
    if (rsiH > 0) cursor += rsiH;
    const rsiBottom = rsiTop + rsiH;
    const macdTop = macdH > 0 ? (cursor += 6, cursor) : 0;
    if (macdH > 0) cursor += macdH;
    const macdBottom = macdTop + macdH;
    const stochTop = stochH > 0 ? (cursor += 6, cursor) : 0;
    if (stochH > 0) cursor += stochH;
    const stochBottom = stochTop + stochH;
    const wrTop = wrH > 0 ? (cursor += 6, cursor) : 0;
    if (wrH > 0) cursor += wrH;
    const wrBottom = wrTop + wrH;
    const cciTop = cciH > 0 ? (cursor += 6, cursor) : 0;
    if (cciH > 0) cursor += cciH;
    const cciBottom = cciTop + cciH;
    const atrTop = atrH > 0 ? (cursor += 6, cursor) : 0;
    if (atrH > 0) cursor += atrH;
    const atrBottom = atrTop + atrH;
    const obvTop = obvH > 0 ? (cursor += 6, cursor) : 0;
    if (obvH > 0) cursor += obvH;
    const obvBottom = obvTop + obvH;

    return {
      padL,
      padR,
      padT,
      padB,
      innerW,
      slot,
      bodyW,
      min,
      max,
      candleH,
      volH,
      rsiH,
      macdH,
      stochH,
      wrH,
      cciH,
      atrH,
      obvH,
      yPrice,
      yPriceClamped,
      maxVol,
      volTop,
      volBottom,
      rsiTop,
      rsiBottom,
      macdTop,
      macdBottom,
      stochTop,
      stochBottom,
      wrTop,
      wrBottom,
      cciTop,
      cciBottom,
      atrTop,
      atrBottom,
      obvTop,
      obvBottom,
      useLog,
    };
  }, [
    candles,
    displayCandles,
    width,
    height,
    markers,
    showVolume,
    bbData,
    compareLine,
    ind.rsi,
    ind.macd,
    ind.stoch,
    ind.wr,
    ind.cci,
    ind.atr,
    ind.obv,
    logScale,
  ]);

  const last = displayCandles[displayCandles.length - 1];

  const ticks = useMemo(() => {
    const t: number[] = [];
    if (layout.useLog) {
      // 1, 2, 5, 10 자릿 스타일
      const minExp = Math.floor(Math.log10(Math.max(1e-6, layout.min)));
      const maxExp = Math.ceil(Math.log10(Math.max(1e-6, layout.max)));
      for (let exp = minExp; exp <= maxExp; exp++) {
        for (const m of [1, 2, 5]) {
          const v = m * Math.pow(10, exp);
          if (v >= layout.min && v <= layout.max) t.push(v);
        }
      }
    } else {
      const step = niceStep((layout.max - layout.min) / 6);
      let v = Math.ceil(layout.min / step) * step;
      while (v < layout.max) {
        t.push(v);
        v += step;
      }
    }
    return t;
  }, [layout]);

  const maSeries = useMemo(
    () =>
      movingAverages
        .filter((p) => p > 1 && p < displayCandles.length)
        .map((p) => ({
          period: p,
          values: computeMA(displayCandles, p),
          color: MA_PALETTE[p] ?? "#94a3b8",
        })),
    [displayCandles, movingAverages],
  );

  const volumeProfile = useMemo(
    () => (ind.vp ? computeVolumeProfile(displayCandles, ind.vp.bins) : null),
    [displayCandles, ind.vp],
  );
  const vpMaxVol = useMemo(
    () => (volumeProfile ? Math.max(1, ...volumeProfile.map((b) => b.volume)) : 1),
    [volumeProfile],
  );

  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ x: number; idx: number } | null>(null);

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());
    const x = local.x;
    const idx = Math.max(
      0,
      Math.min(candles.length - 1, Math.round((x - layout.padL) / layout.slot - 0.5)),
    );
    if (x < layout.padL || x > width - layout.padR) {
      setHover(null);
      return;
    }
    setHover({ x: layout.padL + idx * layout.slot + layout.slot / 2, idx });
  }

  function onLeave() {
    setHover(null);
  }

  const hovered = hover ? displayCandles[hover.idx] : null;

  // ── 메인 가격 시리즈 (line/area 표현용) ──
  const closeLinePoints = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i < displayCandles.length; i++) {
      const c = displayCandles[i];
      const cx = layout.padL + i * layout.slot + layout.slot / 2;
      const cy = layout.yPrice(c.c);
      pts.push(`${cx.toFixed(1)},${cy.toFixed(1)}`);
    }
    return pts;
  }, [displayCandles, layout]);

  const areaPath = useMemo(() => {
    if (closeLinePoints.length < 2) return "";
    const start = `M${layout.padL},${layout.padT + layout.candleH}`;
    const line = closeLinePoints.map((p, i) => (i === 0 ? `L${p}` : `L${p}`)).join("");
    const end = `L${(width - layout.padR).toFixed(1)},${(layout.padT + layout.candleH).toFixed(1)} Z`;
    return start + line + end;
  }, [closeLinePoints, layout, width]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="bm-num"
      style={{ display: "block", maxWidth: "100%", cursor: "crosshair" }}
    >
      {ticks.map((t) => (
        <line
          key={`g-${t}`}
          x1={layout.padL}
          x2={width - layout.padR}
          y1={layout.yPrice(t)}
          y2={layout.yPrice(t)}
          stroke="var(--bm-grid)"
          strokeDasharray="2 4"
          shapeRendering="crispEdges"
        />
      ))}
      {ticks.map((t) => (
        <text
          key={`l-${t}`}
          x={width - layout.padR + 6}
          y={layout.yPrice(t) + 3}
          fontSize={10}
          fill="var(--bm-axis)"
        >
          {t >= 1000 ? t.toLocaleString("ko-KR") : t.toFixed(2)}
        </text>
      ))}

      {/* 시간대 음영 — intraday 차트에서 09:00~09:30 (opening), 14:30~15:30 (closing) 강조 */}
      {ind.sessionShading
        ? (() => {
            const SHADING_RANGES: { fromHour: number; fromMin: number; toHour: number; toMin: number; color: string; label: string }[] = [
              { fromHour: 9, fromMin: 0, toHour: 9, toMin: 30, color: "rgba(34, 197, 94, 0.06)", label: "opening" },
              { fromHour: 14, fromMin: 30, toHour: 15, toMin: 30, color: "rgba(239, 68, 68, 0.06)", label: "closing" },
            ];
            const tToHourMin = (t: string): { h: number; m: number } | null => {
              const n = Number(t);
              if (Number.isFinite(n) && n > 1e9) {
                const d = new Date(n);
                return { h: d.getHours(), m: d.getMinutes() };
              }
              return null;
            };
            const shaded: React.ReactElement[] = [];
            for (const r of SHADING_RANGES) {
              let start = -1;
              for (let i = 0; i < displayCandles.length; i++) {
                const hm = tToHourMin(displayCandles[i].t);
                if (!hm) continue;
                const inRange =
                  (hm.h > r.fromHour || (hm.h === r.fromHour && hm.m >= r.fromMin)) &&
                  (hm.h < r.toHour || (hm.h === r.toHour && hm.m < r.toMin));
                if (inRange && start < 0) start = i;
                else if (!inRange && start >= 0) {
                  const x = layout.padL + start * layout.slot;
                  const w = (i - start) * layout.slot;
                  shaded.push(
                    <rect
                      key={`sh-${r.label}-${start}`}
                      x={x}
                      y={layout.padT}
                      width={w}
                      height={layout.candleH}
                      fill={r.color}
                    />,
                  );
                  start = -1;
                }
              }
              if (start >= 0) {
                const x = layout.padL + start * layout.slot;
                const w = (displayCandles.length - start) * layout.slot;
                shaded.push(
                  <rect
                    key={`sh-${r.label}-tail`}
                    x={x}
                    y={layout.padT}
                    width={w}
                    height={layout.candleH}
                    fill={r.color}
                  />,
                );
              }
            }
            return <g>{shaded}</g>;
          })()
        : null}

      {separatorIndex != null ? (
        <g>
          <line
            x1={layout.padL + separatorIndex * layout.slot}
            x2={layout.padL + separatorIndex * layout.slot}
            y1={layout.padT}
            y2={layout.padT + layout.candleH + layout.volH + 6}
            stroke="var(--bm-axis)"
          />
          <text
            x={layout.padL + separatorIndex * layout.slot + 4}
            y={layout.padT + 12}
            fontSize={10}
            fill="var(--bm-axis)"
          >
            05/06
          </text>
        </g>
      ) : null}

      {/* Bollinger Bands (배경에 깔기 위해 캔들/선보다 먼저) */}
      {bbData ? (
        <g>
          <polyline
            points={bbData.upper
              .map((v, i) =>
                v == null
                  ? null
                  : `${(layout.padL + i * layout.slot + layout.slot / 2).toFixed(1)},${layout.yPrice(v).toFixed(1)}`,
              )
              .filter(Boolean)
              .join(" ")}
            fill="none"
            stroke="var(--bm-success)"
            strokeWidth={1}
            strokeDasharray="2 3"
            opacity={0.7}
          />
          <polyline
            points={bbData.middle
              .map((v, i) =>
                v == null
                  ? null
                  : `${(layout.padL + i * layout.slot + layout.slot / 2).toFixed(1)},${layout.yPrice(v).toFixed(1)}`,
              )
              .filter(Boolean)
              .join(" ")}
            fill="none"
            stroke="var(--bm-success)"
            strokeWidth={1}
            opacity={0.5}
          />
          <polyline
            points={bbData.lower
              .map((v, i) =>
                v == null
                  ? null
                  : `${(layout.padL + i * layout.slot + layout.slot / 2).toFixed(1)},${layout.yPrice(v).toFixed(1)}`,
              )
              .filter(Boolean)
              .join(" ")}
            fill="none"
            stroke="var(--bm-success)"
            strokeWidth={1}
            strokeDasharray="2 3"
            opacity={0.7}
          />
        </g>
      ) : null}

      {/* 메인 가격 표현 — chartType 별 분기 */}
      {chartType === "line" || chartType === "area" ? (
        <g>
          {chartType === "area" ? (
            <path d={areaPath} fill="url(#bm-area-grad)" opacity={0.4} />
          ) : null}
          <defs>
            <linearGradient id="bm-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--bm-up)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--bm-up)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <polyline
            points={closeLinePoints.join(" ")}
            fill="none"
            stroke="var(--bm-up)"
            strokeWidth={1.6}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>
      ) : (
        displayCandles.map((c, i) => {
          const cx = layout.padL + i * layout.slot + layout.slot / 2;
          const up = c.c >= c.o;
          const color = up ? "var(--bm-up)" : "var(--bm-down)";
          const yOpen = layout.yPrice(c.o);
          const yClose = layout.yPrice(c.c);
          const yHigh = layout.yPrice(c.h);
          const yLow = layout.yPrice(c.l);
          const top = Math.min(yOpen, yClose);
          const bottom = Math.max(yOpen, yClose);
          const isLast = i === displayCandles.length - 1;
          // Volume heatmap — 평균 대비 거래량 비율로 opacity 결정 (0.35~1.0).
          // 의미있는 거래량 봉이 시각적으로 강조됨.
          let op = isLast ? 1 : 0.92;
          if (ind.volumeHeatmap && layout.maxVol > 0) {
            const avgVol = displayCandles.reduce((s, x) => s + x.v, 0) / Math.max(1, displayCandles.length);
            const ratio = avgVol > 0 ? c.v / avgVol : 1;
            op = Math.max(0.3, Math.min(1, 0.35 + 0.45 * Math.tanh(ratio - 0.5)));
            if (isLast) op = Math.max(op, 0.95);
          }
          return (
            <g key={i} opacity={op}>
              <line x1={cx} x2={cx} y1={yHigh} y2={yLow} stroke={color} strokeWidth={1} />
              <rect
                x={cx - layout.bodyW / 2}
                y={top}
                width={layout.bodyW}
                height={Math.max(1, bottom - top)}
                fill={color}
                stroke={isLast ? color : "none"}
                strokeWidth={isLast ? 1.2 : 0}
              />
            </g>
          );
        })
      )}

      {/* MA lines */}
      {maSeries.map((s) => {
        const pts: string[] = [];
        for (let i = 0; i < s.values.length; i++) {
          const v = s.values[i];
          if (v == null) continue;
          const cx = layout.padL + i * layout.slot + layout.slot / 2;
          const cy = layout.yPrice(v);
          pts.push(`${cx.toFixed(1)},${cy.toFixed(1)}`);
        }
        if (pts.length < 2) return null;
        return (
          <polyline
            key={`ma-${s.period}`}
            points={pts.join(" ")}
            fill="none"
            stroke={s.color}
            strokeWidth={1.4}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.85}
          />
        );
      })}

      {markers.map((m) => {
        const rawY = layout.yPrice(m.price);
        const y = m.live ? layout.yPriceClamped(m.price) : rawY;
        const offTop = m.live && rawY < layout.padT + 10;
        const offBottom = m.live && rawY > layout.padT + layout.candleH - 10;
        const offRange = offTop || offBottom;
        const dash = m.live ? "5 4" : undefined;
        return (
          <g key={m.label}>
            {!offRange ? (
              <line
                x1={layout.padL}
                x2={width - layout.padR}
                y1={y}
                y2={y}
                stroke={m.color}
                strokeWidth={1.5}
                strokeDasharray={dash}
                opacity={m.live ? 0.85 : 1}
              />
            ) : null}
            {m.live ? (
              <g>
                <circle cx={width - layout.padR} cy={y} r={5} fill={m.color} opacity={0.25}>
                  <animate attributeName="r" values="4;9;4" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.35;0;0.35" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx={width - layout.padR} cy={y} r={3.2} fill={m.color} />
                {offTop ? (
                  <text x={width - layout.padR} y={y - 8} fontSize={9} fontWeight={700} fill={m.color} textAnchor="middle">▲</text>
                ) : null}
                {offBottom ? (
                  <text x={width - layout.padR} y={y + 14} fontSize={9} fontWeight={700} fill={m.color} textAnchor="middle">▼</text>
                ) : null}
              </g>
            ) : null}
            {!(m.live && offRange) ? (
              <>
                <rect x={width - layout.padR - 36} y={y - 9} width={32} height={18} rx={4} fill={m.color} />
                <text x={width - layout.padR - 20} y={y + 4} fontSize={10.5} fontWeight={700} fill="white" textAnchor="middle">
                  {m.label}
                </text>
              </>
            ) : null}
            <rect x={width - layout.padR + 2} y={y - 9} width={layout.padR - 6} height={18} rx={4} fill={m.color} />
            <text x={width - 6} y={y + 4} fontSize={10.5} fontWeight={700} fill="white" textAnchor="end">
              {m.price.toLocaleString("ko-KR")}
            </text>
          </g>
        );
      })}

      {/* 이벤트 마커 (실적/배당 등) — 세로 점선 + 위쪽 작은 배지 */}
      {events.map((ev, i) => {
        if (ev.index < 0 || ev.index >= displayCandles.length) return null;
        const cx = layout.padL + ev.index * layout.slot + layout.slot / 2;
        return (
          <g key={`ev-${i}-${ev.index}`}>
            <line
              x1={cx}
              x2={cx}
              y1={layout.padT}
              y2={layout.padT + layout.candleH}
              stroke={ev.color}
              strokeDasharray="3 3"
              opacity={0.55}
            />
            <circle cx={cx} cy={layout.padT + 4} r={7} fill={ev.color} />
            <text x={cx} y={layout.padT + 7.5} fontSize={9} fontWeight={800} fill="white" textAnchor="middle">
              {ev.label}
            </text>
            {ev.title ? <title>{ev.title}</title> : null}
          </g>
        );
      })}

      {showCurrent && last ? (
        (() => {
          const y = layout.yPrice(last.c);
          const up = last.c >= last.o;
          const color = up ? "var(--bm-up)" : "var(--bm-down)";
          return (
            <g>
              <line
                x1={layout.padL}
                x2={width - layout.padR}
                y1={y}
                y2={y}
                stroke={color}
                strokeWidth={1}
                strokeDasharray="2 3"
                opacity={0.6}
              />
              <rect x={width - layout.padR + 2} y={y - 9} width={layout.padR - 6} height={18} rx={4} fill={color} />
              <text x={width - 6} y={y + 4} fontSize={10.5} fontWeight={700} fill="white" textAnchor="end">
                {Math.round(last.c).toLocaleString("ko-KR")}
              </text>
            </g>
          );
        })()
      ) : null}

      {/* Volume bars */}
      {showVolume
        ? candles.map((c, i) => {
            const cx = layout.padL + i * layout.slot + layout.slot / 2;
            const up = c.c >= c.o;
            const color = up ? "rgba(239,68,68,0.55)" : "rgba(59,130,246,0.55)";
            const h = ((c.v / layout.maxVol) * (layout.volH - 8)) | 0;
            return (
              <rect
                key={`v-${i}`}
                x={cx - layout.bodyW / 2}
                y={layout.volBottom - h}
                width={layout.bodyW}
                height={Math.max(1, h)}
                fill={color}
              />
            );
          })
        : null}

      {/* Volume Profile (가격대별 누적 거래량 — 우측 가로 바) */}
      {volumeProfile ? (
        <g opacity={0.55}>
          {volumeProfile.map((bin, i) => {
            const yTop = layout.yPrice(bin.priceMax);
            const yBot = layout.yPrice(bin.priceMin);
            const h = Math.max(1, yBot - yTop - 1);
            const w = (bin.volume / vpMaxVol) * (layout.padR - 8);
            return (
              <rect
                key={`vp-${i}`}
                x={width - layout.padR - w}
                y={yTop}
                width={w}
                height={h}
                fill="#94a3b8"
              />
            );
          })}
        </g>
      ) : null}

      {/* RSI subpanel */}
      {rsiData && ind.rsi ? (
        <g>
          <rect
            x={layout.padL}
            y={layout.rsiTop}
            width={width - layout.padL - layout.padR}
            height={layout.rsiH}
            fill="var(--bm-soft-100)"
            opacity={0.35}
          />
          {[30, 70].map((lev) => {
            const y = layout.rsiTop + ((100 - lev) / 100) * layout.rsiH;
            return (
              <g key={`rsi-g-${lev}`}>
                <line
                  x1={layout.padL}
                  x2={width - layout.padR}
                  y1={y}
                  y2={y}
                  stroke={lev === 30 ? "var(--bm-down)" : "var(--bm-up)"}
                  strokeDasharray="3 3"
                  opacity={0.5}
                />
                <text x={width - layout.padR + 4} y={y + 3} fontSize={9} fill="var(--bm-axis)">
                  {lev}
                </text>
              </g>
            );
          })}
          <polyline
            points={rsiData
              .map((v, i) => {
                if (v == null) return null;
                const cx = layout.padL + i * layout.slot + layout.slot / 2;
                const cy = layout.rsiTop + ((100 - v) / 100) * layout.rsiH;
                return `${cx.toFixed(1)},${cy.toFixed(1)}`;
              })
              .filter(Boolean)
              .join(" ")}
            fill="none"
            stroke="#a855f7"
            strokeWidth={1.4}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <text x={layout.padL + 4} y={layout.rsiTop + 11} fontSize={9.5} fontWeight={800} fill="var(--bm-muted)">
            RSI({ind.rsi.period})
          </text>
        </g>
      ) : null}

      {/* MACD subpanel */}
      {macdData && ind.macd ? (
        (() => {
          // MACD y 범위
          const all: number[] = [];
          for (const v of macdData.macd) if (v != null) all.push(v);
          for (const v of macdData.signal) if (v != null) all.push(v);
          for (const v of macdData.histogram) if (v != null) all.push(v);
          if (all.length === 0) return null;
          const m = Math.max(...all.map((v) => Math.abs(v)));
          const range = m || 1;
          const mid = layout.macdTop + layout.macdH / 2;
          const yMacd = (v: number) => mid - (v / range) * (layout.macdH / 2 - 4);
          return (
            <g>
              <rect
                x={layout.padL}
                y={layout.macdTop}
                width={width - layout.padL - layout.padR}
                height={layout.macdH}
                fill="var(--bm-soft-100)"
                opacity={0.35}
              />
              <line
                x1={layout.padL}
                x2={width - layout.padR}
                y1={mid}
                y2={mid}
                stroke="var(--bm-axis)"
                strokeDasharray="3 3"
                opacity={0.4}
              />
              {/* histogram */}
              {macdData.histogram.map((v, i) => {
                if (v == null) return null;
                const cx = layout.padL + i * layout.slot + layout.slot / 2;
                const yTop = v >= 0 ? yMacd(v) : mid;
                const yBot = v >= 0 ? mid : yMacd(v);
                return (
                  <rect
                    key={`h-${i}`}
                    x={cx - layout.bodyW / 2}
                    y={yTop}
                    width={layout.bodyW}
                    height={Math.max(1, yBot - yTop)}
                    fill={v >= 0 ? "rgba(34,197,94,0.55)" : "rgba(244,63,94,0.55)"}
                  />
                );
              })}
              <polyline
                points={macdData.macd
                  .map((v, i) => {
                    if (v == null) return null;
                    const cx = layout.padL + i * layout.slot + layout.slot / 2;
                    return `${cx.toFixed(1)},${yMacd(v).toFixed(1)}`;
                  })
                  .filter(Boolean)
                  .join(" ")}
                fill="none"
                stroke="#1d4ed8"
                strokeWidth={1.4}
                strokeLinejoin="round"
              />
              <polyline
                points={macdData.signal
                  .map((v, i) => {
                    if (v == null) return null;
                    const cx = layout.padL + i * layout.slot + layout.slot / 2;
                    return `${cx.toFixed(1)},${yMacd(v).toFixed(1)}`;
                  })
                  .filter(Boolean)
                  .join(" ")}
                fill="none"
                stroke="var(--bm-warning)"
                strokeWidth={1.4}
                strokeLinejoin="round"
              />
              <text x={layout.padL + 4} y={layout.macdTop + 11} fontSize={9.5} fontWeight={800} fill="var(--bm-muted)">
                MACD({ind.macd.fast},{ind.macd.slow},{ind.macd.signal})
              </text>
            </g>
          );
        })()
      ) : null}

      {/* Stochastic subpanel — %K + %D, 0~100 */}
      {stochData && ind.stoch ? (
        <g>
          <rect
            x={layout.padL}
            y={layout.stochTop}
            width={width - layout.padL - layout.padR}
            height={layout.stochH}
            fill="var(--bm-soft-100)"
            opacity={0.35}
          />
          {[20, 80].map((lev) => {
            const y = layout.stochTop + ((100 - lev) / 100) * layout.stochH;
            return (
              <g key={`stoch-g-${lev}`}>
                <line
                  x1={layout.padL}
                  x2={width - layout.padR}
                  y1={y}
                  y2={y}
                  stroke={lev === 20 ? "var(--bm-down)" : "var(--bm-up)"}
                  strokeDasharray="3 3"
                  opacity={0.5}
                />
                <text x={width - layout.padR + 4} y={y + 3} fontSize={9} fill="var(--bm-axis)">
                  {lev}
                </text>
              </g>
            );
          })}
          <polyline
            points={stochData.k
              .map((v, i) => {
                if (v == null) return null;
                const cx = layout.padL + i * layout.slot + layout.slot / 2;
                const cy = layout.stochTop + ((100 - v) / 100) * layout.stochH;
                return `${cx.toFixed(1)},${cy.toFixed(1)}`;
              })
              .filter(Boolean)
              .join(" ")}
            fill="none"
            stroke="#06b6d4"
            strokeWidth={1.3}
          />
          <polyline
            points={stochData.d
              .map((v, i) => {
                if (v == null) return null;
                const cx = layout.padL + i * layout.slot + layout.slot / 2;
                const cy = layout.stochTop + ((100 - v) / 100) * layout.stochH;
                return `${cx.toFixed(1)},${cy.toFixed(1)}`;
              })
              .filter(Boolean)
              .join(" ")}
            fill="none"
            stroke="#f97316"
            strokeWidth={1.3}
          />
          <text x={layout.padL + 4} y={layout.stochTop + 11} fontSize={9.5} fontWeight={800} fill="var(--bm-muted)">
            Stoch({ind.stoch.period},{ind.stoch.smooth})
          </text>
        </g>
      ) : null}

      {/* Williams %R — -100~0 범위 */}
      {wrData && ind.wr ? (
        <g>
          <rect
            x={layout.padL}
            y={layout.wrTop}
            width={width - layout.padL - layout.padR}
            height={layout.wrH}
            fill="var(--bm-soft-100)"
            opacity={0.35}
          />
          {[-20, -80].map((lev) => {
            const y = layout.wrTop + ((lev + 100) / 100) * layout.wrH;
            return (
              <line
                key={`wr-g-${lev}`}
                x1={layout.padL}
                x2={width - layout.padR}
                y1={y}
                y2={y}
                stroke={lev === -80 ? "var(--bm-down)" : "var(--bm-up)"}
                strokeDasharray="3 3"
                opacity={0.5}
              />
            );
          })}
          <polyline
            points={wrData
              .map((v, i) => {
                if (v == null) return null;
                const cx = layout.padL + i * layout.slot + layout.slot / 2;
                const cy = layout.wrTop + ((v + 100) / 100) * layout.wrH;
                return `${cx.toFixed(1)},${cy.toFixed(1)}`;
              })
              .filter(Boolean)
              .join(" ")}
            fill="none"
            stroke="#ec4899"
            strokeWidth={1.3}
          />
          <text x={layout.padL + 4} y={layout.wrTop + 11} fontSize={9.5} fontWeight={800} fill="var(--bm-muted)">
            Williams%R({ind.wr.period})
          </text>
        </g>
      ) : null}

      {/* CCI — 가변 범위, ±100 가이드 */}
      {cciData && ind.cci ? (
        (() => {
          const maxAbs = Math.max(200, ...cciData.filter((v): v is number => v != null).map((v) => Math.abs(v)));
          const mid = layout.cciTop + layout.cciH / 2;
          const yCci = (v: number) => mid - (v / maxAbs) * (layout.cciH / 2 - 4);
          return (
            <g>
              <rect
                x={layout.padL}
                y={layout.cciTop}
                width={width - layout.padL - layout.padR}
                height={layout.cciH}
                fill="var(--bm-soft-100)"
                opacity={0.35}
              />
              {[100, -100].map((lev) => (
                <line
                  key={`cci-g-${lev}`}
                  x1={layout.padL}
                  x2={width - layout.padR}
                  y1={yCci(lev)}
                  y2={yCci(lev)}
                  stroke={lev === 100 ? "var(--bm-up)" : "var(--bm-down)"}
                  strokeDasharray="3 3"
                  opacity={0.45}
                />
              ))}
              <line
                x1={layout.padL}
                x2={width - layout.padR}
                y1={mid}
                y2={mid}
                stroke="var(--bm-axis)"
                strokeDasharray="2 4"
                opacity={0.3}
              />
              <polyline
                points={cciData
                  .map((v, i) => {
                    if (v == null) return null;
                    const cx = layout.padL + i * layout.slot + layout.slot / 2;
                    return `${cx.toFixed(1)},${yCci(v).toFixed(1)}`;
                  })
                  .filter(Boolean)
                  .join(" ")}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth={1.3}
              />
              <text x={layout.padL + 4} y={layout.cciTop + 11} fontSize={9.5} fontWeight={800} fill="var(--bm-muted)">
                CCI({ind.cci.period})
              </text>
            </g>
          );
        })()
      ) : null}

      {/* ATR — 변동성 */}
      {atrData && ind.atr ? (
        (() => {
          const max = Math.max(0.0001, ...atrData.filter((v): v is number => v != null));
          const yAtr = (v: number) => layout.atrTop + layout.atrH - (v / max) * (layout.atrH - 8);
          return (
            <g>
              <rect
                x={layout.padL}
                y={layout.atrTop}
                width={width - layout.padL - layout.padR}
                height={layout.atrH}
                fill="var(--bm-soft-100)"
                opacity={0.35}
              />
              <polyline
                points={atrData
                  .map((v, i) => {
                    if (v == null) return null;
                    const cx = layout.padL + i * layout.slot + layout.slot / 2;
                    return `${cx.toFixed(1)},${yAtr(v).toFixed(1)}`;
                  })
                  .filter(Boolean)
                  .join(" ")}
                fill="none"
                stroke="var(--bm-warning)"
                strokeWidth={1.3}
              />
              <text x={layout.padL + 4} y={layout.atrTop + 11} fontSize={9.5} fontWeight={800} fill="var(--bm-muted)">
                ATR({ind.atr.period})
              </text>
            </g>
          );
        })()
      ) : null}

      {/* OBV — 절대값보다 추세가 핵심, 정규화해 보여줌 */}
      {obvData && ind.obv ? (
        (() => {
          const min = Math.min(...obvData);
          const max = Math.max(...obvData);
          const range = max - min || 1;
          const yObv = (v: number) =>
            layout.obvTop + layout.obvH - ((v - min) / range) * (layout.obvH - 8);
          return (
            <g>
              <rect
                x={layout.padL}
                y={layout.obvTop}
                width={width - layout.padL - layout.padR}
                height={layout.obvH}
                fill="var(--bm-soft-100)"
                opacity={0.35}
              />
              <polyline
                points={obvData
                  .map((v, i) => {
                    const cx = layout.padL + i * layout.slot + layout.slot / 2;
                    return `${cx.toFixed(1)},${yObv(v).toFixed(1)}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="var(--bm-success)"
                strokeWidth={1.3}
              />
              <text x={layout.padL + 4} y={layout.obvTop + 11} fontSize={9.5} fontWeight={800} fill="var(--bm-muted)">
                OBV
              </text>
            </g>
          );
        })()
      ) : null}

      {/* Pivot Points — 전일 H/L/C 기준 S/R 자동 표시 */}
      {pivot ? (
        <g opacity={0.75}>
          {(
            [
              ["R3", pivot.r3, "var(--bm-up)"],
              ["R2", pivot.r2, "#f87171"],
              ["R1", pivot.r1, "#fb923c"],
              ["P",  pivot.pivot, "#94a3b8"],
              ["S1", pivot.s1, "#60a5fa"],
              ["S2", pivot.s2, "var(--bm-down)"],
              ["S3", pivot.s3, "#1d4ed8"],
            ] as const
          ).map(([label, price, color]) => {
            if (price <= 0) return null;
            const y = layout.yPrice(price);
            if (y < layout.padT || y > layout.padT + layout.candleH) return null;
            return (
              <g key={`pv-${label}`}>
                <line
                  x1={layout.padL}
                  x2={width - layout.padR}
                  y1={y}
                  y2={y}
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray="3 5"
                  opacity={0.6}
                />
                <rect
                  x={width - layout.padR + 2}
                  y={y - 8}
                  width={26}
                  height={16}
                  rx={3}
                  fill={color}
                  opacity={0.85}
                />
                <text
                  x={width - layout.padR + 15}
                  y={y + 4}
                  fontSize={9.5}
                  fontWeight={800}
                  fill="white"
                  textAnchor="middle"
                >
                  {label}
                </text>
              </g>
            );
          })}
        </g>
      ) : null}

      {/* Linear Regression Channel — 가시 영역 자동 회귀 + ±2σ */}
      {regression ? (
        (() => {
          const x1 = layout.padL + layout.slot / 2;
          const x2 = width - layout.padR - layout.slot / 2;
          const yMid1 = layout.yPrice(regression.startY);
          const yMid2 = layout.yPrice(regression.endY);
          const yU1 = layout.yPrice(regression.startY + 2 * regression.stdDev);
          const yU2 = layout.yPrice(regression.endY + 2 * regression.stdDev);
          const yL1 = layout.yPrice(regression.startY - 2 * regression.stdDev);
          const yL2 = layout.yPrice(regression.endY - 2 * regression.stdDev);
          return (
            <g opacity={0.8}>
              {/* 채널 영역 음영 */}
              <path
                d={`M${x1},${yU1} L${x2},${yU2} L${x2},${yL2} L${x1},${yL1} Z`}
                fill="rgba(14, 165, 233, 0.08)"
                stroke="none"
              />
              {/* 중심선 */}
              <line
                x1={x1}
                y1={yMid1}
                x2={x2}
                y2={yMid2}
                stroke="#0ea5e9"
                strokeWidth={1.4}
              />
              {/* 상/하 채널선 */}
              <line x1={x1} y1={yU1} x2={x2} y2={yU2} stroke="#0ea5e9" strokeWidth={1} strokeDasharray="3 3" />
              <line x1={x1} y1={yL1} x2={x2} y2={yL2} stroke="#0ea5e9" strokeWidth={1} strokeDasharray="3 3" />
              {/* R² 라벨 */}
              <rect
                x={layout.padL + 4}
                y={layout.padT + (compareLine ? 32 : 4)}
                width={66}
                height={16}
                rx={4}
                fill="rgba(14, 165, 233, 0.85)"
              />
              <text
                x={layout.padL + 37}
                y={layout.padT + (compareLine ? 44 : 16)}
                fontSize={10}
                fontWeight={800}
                fill="white"
                textAnchor="middle"
              >
                R² {regression.r2.toFixed(2)}
              </text>
            </g>
          );
        })()
      ) : null}

      {/* 비교 라인 — KOSPI/타종목을 정규화해서 같은 y축에 오버레이 */}
      {compareLine ? (
        <g>
          <polyline
            points={compareLine.values
              .map((v, i) => {
                if (v == null) return null;
                const cx = layout.padL + i * layout.slot + layout.slot / 2;
                return `${cx.toFixed(1)},${layout.yPrice(v).toFixed(1)}`;
              })
              .filter(Boolean)
              .join(" ")}
            fill="none"
            stroke={compareLine.color}
            strokeWidth={1.6}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.85}
          />
          {/* 좌상단에 라벨 */}
          <g transform={`translate(${layout.padL + 8}, ${layout.padT + 14})`}>
            <rect
              x={-4}
              y={-9}
              width={Math.max(40, compareLine.label.length * 7 + 16)}
              height={16}
              rx={4}
              fill={compareLine.color}
              opacity={0.95}
            />
            <text
              x={4}
              y={3}
              fontSize={10}
              fontWeight={800}
              fill="white"
            >
              vs {compareLine.label}
            </text>
          </g>
        </g>
      ) : null}

      {/* VWAP — 메인 차트 위 오버레이 */}
      {vwapData && ind.vwap ? (
        <polyline
          points={vwapData
            .map((v, i) => {
              if (v == null) return null;
              const cx = layout.padL + i * layout.slot + layout.slot / 2;
              return `${cx.toFixed(1)},${layout.yPrice(v).toFixed(1)}`;
            })
            .filter(Boolean)
            .join(" ")}
          fill="none"
          stroke="var(--bm-warning)"
          strokeWidth={1.5}
          strokeDasharray="4 2"
          opacity={0.85}
        />
      ) : null}

      {/* Ichimoku Cloud (간단 버전) — 메인 차트 위 오버레이 */}
      {ichimokuData && ind.ichimoku ? (
        <g opacity={0.85}>
          {/* Cloud — spanA vs spanB 사이를 채움 */}
          {(() => {
            const aPts: string[] = [];
            const bPts: string[] = [];
            for (let i = 0; i < ichimokuData.spanA.length; i++) {
              const a = ichimokuData.spanA[i];
              const b = ichimokuData.spanB[i];
              if (a == null || b == null) continue;
              const cx = layout.padL + i * layout.slot + layout.slot / 2;
              aPts.push(`${cx.toFixed(1)},${layout.yPrice(a).toFixed(1)}`);
              bPts.push(`${cx.toFixed(1)},${layout.yPrice(b).toFixed(1)}`);
            }
            if (aPts.length < 2) return null;
            const path = `M${aPts[0]} ${aPts.map((p, i) => (i === 0 ? "" : `L${p}`)).join("")} ${bPts
              .slice()
              .reverse()
              .map((p) => `L${p}`)
              .join("")} Z`;
            return <path d={path} fill="rgba(139, 92, 246, 0.12)" stroke="none" />;
          })()}
          {/* Conversion (Tenkan) */}
          <polyline
            points={ichimokuData.conversion
              .map((v, i) => {
                if (v == null) return null;
                const cx = layout.padL + i * layout.slot + layout.slot / 2;
                return `${cx.toFixed(1)},${layout.yPrice(v).toFixed(1)}`;
              })
              .filter(Boolean)
              .join(" ")}
            fill="none"
            stroke="#06b6d4"
            strokeWidth={1.2}
            opacity={0.85}
          />
          {/* Base (Kijun) */}
          <polyline
            points={ichimokuData.base
              .map((v, i) => {
                if (v == null) return null;
                const cx = layout.padL + i * layout.slot + layout.slot / 2;
                return `${cx.toFixed(1)},${layout.yPrice(v).toFixed(1)}`;
              })
              .filter(Boolean)
              .join(" ")}
            fill="none"
            stroke="#ec4899"
            strokeWidth={1.2}
            opacity={0.85}
          />
        </g>
      ) : null}

      {/* 패턴 감지 마커 — golden/dead cross 는 ▲▼, 쌍봉/쌍바닥은 영역 박스 */}
      {patternHits.map((p, i) => {
        const cx = layout.padL + p.endIndex * layout.slot + layout.slot / 2;
        if (p.kind === "golden-cross" || p.kind === "dead-cross") {
          const isGolden = p.kind === "golden-cross";
          const color = isGolden ? "var(--bm-success)" : "var(--bm-up)";
          const y = layout.padT + layout.candleH - 8;
          return (
            <g key={`pat-${i}`}>
              <text
                x={cx}
                y={y}
                fontSize={11}
                fontWeight={900}
                fill={color}
                textAnchor="middle"
              >
                {isGolden ? "▲" : "▼"}
              </text>
              <title>{isGolden ? "골든크로스" : "데드크로스"} (MA5/MA20)</title>
            </g>
          );
        }
        const isTop = p.kind === "double-top";
        const startCx = layout.padL + p.startIndex * layout.slot + layout.slot / 2;
        const endCx = layout.padL + p.endIndex * layout.slot + layout.slot / 2;
        const w = Math.max(8, endCx - startCx);
        const color = isTop ? "var(--bm-up)" : "var(--bm-success)";
        return (
          <g key={`pat-${i}`} opacity={0.6}>
            <rect
              x={startCx}
              y={layout.padT + 6}
              width={w}
              height={layout.candleH - 12}
              fill={color}
              fillOpacity={0.06}
              stroke={color}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <text
              x={startCx + w / 2}
              y={layout.padT + 16}
              fontSize={10}
              fontWeight={800}
              fill={color}
              textAnchor="middle"
            >
              {isTop ? "쌍봉" : "쌍바닥"}
            </text>
            <title>{p.note}</title>
          </g>
        );
      })}

      {xLabels?.map((lab) => (
        <text
          key={lab.label + lab.index}
          x={layout.padL + lab.index * layout.slot}
          y={height - 6}
          fontSize={10}
          fontWeight={lab.bold ? 700 : 500}
          fill="var(--bm-axis)"
        >
          {lab.label}
        </text>
      ))}

      {/* Crosshair + tooltip */}
      {hover && hovered ? (
        <g pointerEvents="none">
          <line
            x1={hover.x}
            x2={hover.x}
            y1={layout.padT}
            y2={height - layout.padB}
            stroke="var(--bm-axis)"
            strokeDasharray="3 3"
          />
          {(() => {
            const lines: { label: string; value: string; color: string }[] = [
              { label: "시", value: Math.round(hovered.o).toLocaleString("ko-KR"), color: "#cbd5e1" },
              { label: "고", value: Math.round(hovered.h).toLocaleString("ko-KR"), color: "#fda4af" },
              { label: "저", value: Math.round(hovered.l).toLocaleString("ko-KR"), color: "#93c5fd" },
              { label: "종", value: Math.round(hovered.c).toLocaleString("ko-KR"), color: hovered.c >= hovered.o ? "#fda4af" : "#93c5fd" },
              { label: "거래량", value: hovered.v.toLocaleString("ko-KR"), color: "#cbd5e1" },
            ];
            if (rsiData) {
              const v = rsiData[hover.idx];
              if (v != null) lines.push({ label: "RSI", value: v.toFixed(1), color: "#c4b5fd" });
            }
            if (macdData) {
              const v = macdData.macd[hover.idx];
              const s = macdData.signal[hover.idx];
              if (v != null) lines.push({ label: "MACD", value: v.toFixed(2), color: "#93c5fd" });
              if (s != null) lines.push({ label: "Signal", value: s.toFixed(2), color: "#fcd34d" });
            }
            if (bbData) {
              const u = bbData.upper[hover.idx];
              const l = bbData.lower[hover.idx];
              if (u != null) lines.push({ label: "BB↑", value: Math.round(u).toLocaleString("ko-KR"), color: "#6ee7b7" });
              if (l != null) lines.push({ label: "BB↓", value: Math.round(l).toLocaleString("ko-KR"), color: "#6ee7b7" });
            }

            const tooltipW = 170;
            const tooltipH = 26 + lines.length * 15;
            let tx = hover.x + 10;
            if (tx + tooltipW > width - layout.padR) tx = hover.x - tooltipW - 10;
            const ty = layout.padT + 6;
            const up = hovered.c >= hovered.o;
            const tone = up ? "var(--bm-up)" : "var(--bm-down)";
            return (
              <g transform={`translate(${tx}, ${ty})`}>
                <rect
                  width={tooltipW}
                  height={tooltipH}
                  rx={8}
                  fill="var(--bm-tooltip-bg)"
                  stroke="var(--bm-tooltip-border)"
                  strokeWidth={1}
                />
                <text x={10} y={16} fontSize={10.5} fill="var(--bm-tooltip-muted)" fontWeight={700}>
                  #{hover.idx}
                </text>
                <text x={tooltipW - 10} y={16} fontSize={10.5} fill={tone} fontWeight={800} textAnchor="end">
                  {(((hovered.c - hovered.o) / Math.max(1, hovered.o)) * 100).toFixed(2)}%
                </text>
                {lines.map((line, i) => (
                  <g key={line.label} transform={`translate(0, ${26 + i * 15})`}>
                    <text x={10} fontSize={10.5} fill="var(--bm-tooltip-muted)">
                      {line.label}
                    </text>
                    <text x={tooltipW - 10} fontSize={10.5} fill={line.color} fontWeight={700} textAnchor="end">
                      {line.value}
                    </text>
                  </g>
                ))}
              </g>
            );
          })()}
        </g>
      ) : null}
    </svg>
  );
}

function niceStep(raw: number): number {
  const exp = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / exp;
  let nf: number;
  if (f < 1.5) nf = 1;
  else if (f < 3) nf = 2;
  else if (f < 7) nf = 5;
  else nf = 10;
  return nf * exp;
}
