import { css } from "../../core/styles.js";
import { CHART_CSS } from "../../core/chart.styles.js";

/**
 * jd-candle-chart CSS — 공용 CHART_CSS(숨김 데이터 표·범례) + 캔들 고유값.
 *
 * v2는 fill/stroke를 표시 속성에 인라인 var()로 박았다 — v3는 data-dir(up/down)로 옮겨
 * CSS가 칠하고(테마·상태 오버라이드가 열린다), 상승/하락은 finance 토큰
 * --jd-fin-up/down(한국 관례: 상승=적, 하락=청)으로 노출한다. host display는 tag
 * 셀렉터(0,0,1)가 CHART_CSS의 :where([data-jd-chart])(0,0,0)를 이겨 block로 되찾는다.
 */
export default css`
@layer junds.components {
${CHART_CSS}

  jd-candle-chart {
    display: inline-block;
    --_up: var(--jd-fin-up, #e11d48);
    --_down: var(--jd-fin-down, #2563eb);
    --_grid: var(--jd-fin-grid, color-mix(in srgb, var(--jd-color-border) 70%, transparent));
    --_axis: var(--jd-fin-muted, var(--jd-color-muted));
    --_accent: var(--jd-fin-accent, #14b8a6);
  }

  .jd-candle-chart__svg {
    display: block; max-width: 100%; cursor: crosshair;
    font-family: var(--jd-font-sans); font-variant-numeric: tabular-nums;
  }

  /* 격자·축 */
  .jd-candle-chart__gridline {
    stroke: var(--_grid); stroke-dasharray: 2 4; shape-rendering: crispEdges;
  }
  .jd-candle-chart__axis-label { font-size: 10px; fill: var(--_axis); }

  /* 캔들 */
  .jd-candle-chart__candle[data-dir="up"] { --_c: var(--_up); }
  .jd-candle-chart__candle[data-dir="down"] { --_c: var(--_down); }
  .jd-candle-chart__wick { stroke: var(--_c); stroke-width: 1; }
  .jd-candle-chart__body { fill: var(--_c); stroke: none; }
  .jd-candle-chart__candle[data-last] .jd-candle-chart__body {
    stroke: var(--_c); stroke-width: 1.2;
  }

  /* 라인/에어리어 표현 */
  .jd-candle-chart__price-line {
    fill: none; stroke: var(--_up); stroke-width: 1.6;
    stroke-linejoin: round; stroke-linecap: round;
  }
  .jd-candle-chart__area { stroke: none; opacity: 0.4; }
  .jd-candle-chart__area-stop0 { stop-color: var(--_up); stop-opacity: 0.45; }
  .jd-candle-chart__area-stop1 { stop-color: var(--_up); stop-opacity: 0; }

  /* 이동평균 — 색은 인라인 --_ma */
  .jd-candle-chart__ma {
    fill: none; stroke: var(--_ma, var(--jd-fin-muted, var(--jd-color-neutral-400))); stroke-width: 1.4;
    stroke-linejoin: round; stroke-linecap: round; opacity: 0.85;
  }

  /* 오버레이 지표 */
  .jd-candle-chart__bb { fill: none; stroke: var(--jd-fin-success, #22c55e); stroke-width: 1; }
  .jd-candle-chart__bb--band { stroke-dasharray: 2 3; opacity: 0.7; }
  .jd-candle-chart__bb--mid { opacity: 0.5; }
  .jd-candle-chart__vwap {
    fill: none; stroke: var(--jd-fin-warning, #f59e0b); stroke-width: 1.2;
    stroke-dasharray: 4 3; opacity: 0.8;
  }
  .jd-candle-chart__compare {
    fill: none; stroke: var(--_line, var(--jd-fin-muted, var(--jd-color-neutral-400))); stroke-width: 1.4;
    stroke-dasharray: 5 3; opacity: 0.85;
  }
  .jd-candle-chart__separator { stroke: var(--_axis); stroke-width: 1; }

  /* 거래량 */
  .jd-candle-chart__vol[data-dir="up"] { fill: color-mix(in srgb, var(--_up) 55%, transparent); }
  .jd-candle-chart__vol[data-dir="down"] { fill: color-mix(in srgb, var(--_down) 55%, transparent); }

  /* 마커 */
  .jd-candle-chart__marker { --_mk: var(--_accent); }
  .jd-candle-chart__marker-line { stroke: var(--_mk); stroke-width: 1.5; }
  .jd-candle-chart__marker[data-live] .jd-candle-chart__marker-line {
    stroke-dasharray: 5 4; opacity: 0.85;
  }
  .jd-candle-chart__marker-pulse { fill: var(--_mk); opacity: 0.25; }
  .jd-candle-chart__marker-dot { fill: var(--_mk); }
  .jd-candle-chart__marker-badge,
  .jd-candle-chart__marker-price-bg { fill: var(--_mk); }
  .jd-candle-chart__marker-label,
  .jd-candle-chart__marker-price {
    fill: #fff; font-size: 10.5px; font-weight: 700;
  }
  .jd-candle-chart__marker-label { text-anchor: middle; }
  .jd-candle-chart__marker-price { text-anchor: end; }

  /* 이벤트 */
  .jd-candle-chart__event { --_ev: var(--_axis); }
  .jd-candle-chart__event-line { stroke: var(--_ev); stroke-dasharray: 3 3; opacity: 0.55; }
  .jd-candle-chart__event-dot { fill: var(--_ev); }
  .jd-candle-chart__event-label {
    fill: #fff; font-size: 9px; font-weight: 800; text-anchor: middle;
  }

  /* 현재가 */
  .jd-candle-chart__current[data-dir="up"] { --_c: var(--_up); }
  .jd-candle-chart__current[data-dir="down"] { --_c: var(--_down); }
  .jd-candle-chart__current-line {
    stroke: var(--_c); stroke-width: 1; stroke-dasharray: 2 3; opacity: 0.6;
  }
  .jd-candle-chart__current-bg { fill: var(--_c); }
  .jd-candle-chart__current-text {
    fill: #fff; font-size: 10.5px; font-weight: 700; text-anchor: end;
  }

  /* x라벨 */
  .jd-candle-chart__xlabel { font-size: 10px; font-weight: 500; fill: var(--_axis); }
  .jd-candle-chart__xlabel[data-bold] { font-weight: 700; }

  /* 크로스헤어 + 툴팁 */
  .jd-candle-chart__crosshair-line { stroke: var(--_axis); stroke-dasharray: 3 3; }
  .jd-candle-chart__tooltip {
    --_tt-up: #fda4af; --_tt-down: #93c5fd;
  }
  .jd-candle-chart__tooltip-bg {
    fill: var(--jd-fin-tooltip-bg, #1e293b);
    stroke: var(--jd-fin-tooltip-border, rgba(148, 163, 184, 0.25));
    stroke-width: 1;
  }
  .jd-candle-chart__tooltip-idx {
    fill: var(--jd-fin-tooltip-muted, var(--jd-color-neutral-400)); font-size: 10.5px; font-weight: 700;
  }
  .jd-candle-chart__tooltip[data-dir="up"] .jd-candle-chart__tooltip-pct { fill: var(--_up); }
  .jd-candle-chart__tooltip[data-dir="down"] .jd-candle-chart__tooltip-pct { fill: var(--_down); }
  .jd-candle-chart__tooltip-pct { font-size: 10.5px; font-weight: 800; text-anchor: end; }
  .jd-candle-chart__tooltip-key {
    fill: var(--jd-fin-tooltip-muted, var(--jd-color-neutral-400)); font-size: 10.5px;
  }
  .jd-candle-chart__tooltip-val {
    fill: var(--jd-fin-tooltip-fg, var(--jd-color-neutral-200)); font-size: 10.5px; font-weight: 700; text-anchor: end;
  }
  .jd-candle-chart__tooltip-row[data-tone="up"] .jd-candle-chart__tooltip-val { fill: var(--_tt-up); }
  .jd-candle-chart__tooltip-row[data-tone="down"] .jd-candle-chart__tooltip-val { fill: var(--_tt-down); }
}`;
