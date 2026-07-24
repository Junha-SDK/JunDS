import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역). 카드 셸은 jd-card와 같은 토큰(card 배경·border·radius).
 * 막대/트랙 배경(bg-gray-100)은 --jd-cc-track(muted 15% 믹스)로 다크 대응. 값 색·치수는
 * JS 인라인 style(§4.3의 예외 — 데이터포인트 색은 본질적으로 동적). SVG 색은 표시 속성이
 * 아니라 인라인 style로 넣어 var() 토큰이 먹는다(core/chart 교정 #2).
 */
export default css`
@layer junds.base {
  jd-chart-card:not(:defined) { display: block; }
}
@layer junds.components {
  jd-chart-card {
    display: block; box-sizing: border-box; width: 100%;
    --jd-cc-track: color-mix(in srgb, var(--jd-color-muted) 15%, transparent);
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
    transition: border-color var(--jd-duration-normal) var(--jd-easing-default);
  }
  jd-chart-card[variant="card"] {
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    padding: var(--jd-space-4);
    box-shadow: var(--jd-shadow-xs);
  }

  /* 헤더 */
  .jd-chart-card__head {
    display: flex; align-items: flex-start; justify-content: space-between; gap: var(--jd-space-3);
  }
  .jd-chart-card__heading { min-width: 0; }
  .jd-chart-card__title-row { display: flex; align-items: center; gap: var(--jd-space-2); }
  .jd-chart-card__title {
    margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    font-size: var(--jd-text-sm); font-weight: var(--jd-weight-semibold);
    color: var(--jd-color-foreground);
  }
  .jd-chart-card__badge { flex-shrink: 0; }
  .jd-chart-card__badge:empty, .jd-chart-card__actions:empty { display: none; }
  .jd-chart-card__desc {
    margin: var(--jd-space-1) 0 0; font-size: var(--jd-text-xs); color: var(--jd-color-muted);
  }
  .jd-chart-card__desc[hidden] { display: none; }
  .jd-chart-card__actions { flex-shrink: 0; }

  /* KPI */
  .jd-chart-card__kpi {
    display: flex; align-items: flex-end; justify-content: space-between; gap: var(--jd-space-3);
    margin-block-start: var(--jd-space-4);
  }
  .jd-chart-card__kpi[hidden] { display: none; }
  .jd-chart-card__value {
    font-size: var(--jd-text-2xl); font-weight: var(--jd-weight-bold);
    letter-spacing: var(--jd-tracking-tight); color: var(--jd-color-foreground);
  }
  .jd-chart-card__value[hidden] { display: none; }

  .jd-chart-card__trend {
    display: inline-flex; flex-shrink: 0; align-items: center; gap: var(--jd-space-1);
    border-radius: var(--jd-radius-full); padding: var(--jd-space-1) var(--jd-space-2);
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-semibold);
  }
  .jd-chart-card__trend[hidden] { display: none; }
  .jd-chart-card__trend[data-direction="up"] {
    background: color-mix(in srgb, var(--jd-color-success) 14%, transparent);
    color: color-mix(in srgb, var(--jd-color-success) 65%, var(--jd-color-foreground));
  }
  .jd-chart-card__trend[data-direction="down"] {
    background: color-mix(in srgb, var(--jd-color-danger) 14%, transparent);
    color: color-mix(in srgb, var(--jd-color-danger) 65%, var(--jd-color-foreground));
  }
  .jd-chart-card__trend[data-direction="neutral"] {
    background: var(--jd-cc-track); color: var(--jd-color-muted);
  }
  .jd-chart-card__trend-icon[data-flip] { transform: rotate(180deg); }
  .jd-chart-card__trend-label { font-weight: var(--jd-weight-normal); opacity: 0.8; }

  /* 차트 영역 */
  .jd-chart-card__chart { margin-block-start: var(--jd-space-3); }
  .jd-chart-card__kpi:not([hidden]) + .jd-chart-card__chart { margin-block-start: var(--jd-space-4); }

  /* 푸터 */
  .jd-chart-card__footer {
    margin-block-start: var(--jd-space-4); padding-block-start: var(--jd-space-3);
    border-block-start: var(--jd-border-thin) solid var(--jd-color-border-light);
  }
  .jd-chart-card__footer:empty { display: none; }

  /* ── bar (세로) ── */
  .jd-chart-card__bar-wrap { position: relative; }
  .jd-chart-card__grid {
    pointer-events: none; position: absolute; inset-inline: 0; top: 20px; bottom: 20px;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .jd-chart-card__gridline { border-block-start: var(--jd-border-thin) solid var(--jd-color-border-light); }
  .jd-chart-card__bars {
    position: relative; z-index: 1; display: flex; height: 100%;
    align-items: flex-end; gap: var(--jd-space-2); padding-block-start: var(--jd-space-5);
  }
  .jd-chart-card__bar-col {
    display: flex; height: 100%; min-width: 0; flex: 1 1 0;
    flex-direction: column; align-items: center; gap: var(--jd-space-1);
  }
  .jd-chart-card__bar-val {
    font-size: 10px; font-weight: var(--jd-weight-semibold);
    font-variant-numeric: tabular-nums; color: var(--jd-color-foreground);
  }
  .jd-chart-card__bar-track { display: flex; width: 100%; flex: 1 1 0; align-items: flex-end; }
  .jd-chart-card__bar {
    width: 100%; border-radius: var(--jd-radius-md) var(--jd-radius-md) 0 0;
    transition: height var(--jd-duration-slow) var(--jd-easing-ease-out);
  }
  .jd-chart-card__bar-label {
    width: 100%; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    font-size: 10px; color: var(--jd-color-muted);
  }

  /* ── horizontal-bar ── */
  .jd-chart-card__hbars {
    display: flex; flex-direction: column; justify-content: center; gap: var(--jd-space-3);
  }
  .jd-chart-card__hrow {
    display: grid; grid-template-columns: minmax(4rem, 7rem) 1fr auto;
    align-items: center; gap: var(--jd-space-3);
  }
  .jd-chart-card__hlabel {
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-medium); color: var(--jd-color-muted);
  }
  .jd-chart-card__htrack {
    height: 0.625rem; overflow: hidden; border-radius: var(--jd-radius-full); background: var(--jd-cc-track);
  }
  .jd-chart-card__hfill {
    height: 100%; border-radius: var(--jd-radius-full);
    transition: width var(--jd-duration-slow) var(--jd-easing-ease-out);
  }
  .jd-chart-card__hval {
    min-width: 2rem; text-align: right;
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-semibold);
    font-variant-numeric: tabular-nums; color: var(--jd-color-foreground);
  }

  /* ── stacked-bar ── */
  .jd-chart-card__stacked {
    display: flex; flex-direction: column; justify-content: center; gap: var(--jd-space-3);
  }
  .jd-chart-card__srows { display: flex; flex-direction: column; gap: var(--jd-space-3); }
  .jd-chart-card__srow {
    display: grid; grid-template-columns: minmax(4rem, 6rem) 1fr auto;
    align-items: center; gap: var(--jd-space-3);
  }
  .jd-chart-card__slabel {
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-medium); color: var(--jd-color-muted);
  }
  .jd-chart-card__strack {
    display: flex; height: 0.75rem; overflow: hidden;
    border-radius: var(--jd-radius-full); background: var(--jd-cc-track);
  }
  .jd-chart-card__sseg { height: 100%; transition: width var(--jd-duration-slow) var(--jd-easing-ease-out); }
  .jd-chart-card__stotal {
    min-width: 2rem; text-align: right;
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-semibold);
    font-variant-numeric: tabular-nums; color: var(--jd-color-foreground);
  }

  /* ── line / area / sparkline (SVG) ── */
  .jd-chart-card__svg { display: block; width: 100%; overflow: visible; }
  .jd-chart-card__svg-gridline { stroke: var(--jd-color-border-light); stroke-width: 1; }
  .jd-chart-card__area { fill-opacity: 0.16; stroke: none; }
  .jd-chart-card__line { fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
  .jd-chart-card__dot { fill: var(--jd-color-card); stroke-width: 2; }
  .jd-chart-card__spark-end { stroke: none; }
  .jd-chart-card__axis {
    display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-3);
    margin-block-start: var(--jd-space-1); font-size: 10px; color: var(--jd-color-muted);
  }
  .jd-chart-card__axis span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .jd-chart-card__axis-max {
    font-weight: var(--jd-weight-semibold); font-variant-numeric: tabular-nums;
    color: var(--jd-color-foreground);
  }
  .jd-chart-card__spark-meta {
    display: flex; align-items: center; justify-content: space-between;
    margin-block-start: var(--jd-space-1); font-size: 10px; color: var(--jd-color-muted);
  }
  .jd-chart-card__spark-val {
    font-weight: var(--jd-weight-semibold); font-variant-numeric: tabular-nums;
    color: var(--jd-color-foreground);
  }

  /* ── donut / radial (ring) ── */
  .jd-chart-card__donut, .jd-chart-card__radial {
    display: flex; align-items: center; gap: var(--jd-space-5);
  }
  .jd-chart-card__ring { flex-shrink: 0; }
  .jd-chart-card__ring-bg { stroke: var(--jd-color-border-light); }
  .jd-chart-card__arc {
    transform-box: view-box; transform-origin: center; transform: rotate(-90deg);
    transition: stroke-dasharray var(--jd-duration-slow) var(--jd-easing-ease-out);
  }
  .jd-chart-card__ring-total { fill: var(--jd-color-foreground); font-weight: var(--jd-weight-bold); }
  .jd-chart-card__donut .jd-chart-card__ring-total { font-size: 6px; }
  .jd-chart-card__radial .jd-chart-card__ring-total { font-size: 7px; }
  .jd-chart-card__ring-sub { fill: var(--jd-color-muted); font-size: 3px; }
  .jd-chart-card__radial-detail { min-width: 0; flex: 1 1 auto; }
  .jd-chart-card__radial-name {
    font-size: var(--jd-text-sm); font-weight: var(--jd-weight-semibold); color: var(--jd-color-foreground);
  }
  .jd-chart-card__radial-sub {
    margin-block-start: var(--jd-space-1); font-size: var(--jd-text-xs); color: var(--jd-color-muted);
  }
  .jd-chart-card__radial-track {
    margin-block-start: var(--jd-space-3); height: 0.375rem; overflow: hidden;
    border-radius: var(--jd-radius-full); background: var(--jd-cc-track);
  }
  .jd-chart-card__radial-fill { height: 100%; border-radius: var(--jd-radius-full); }

  /* ── progress ── */
  .jd-chart-card__progress {
    display: flex; flex-direction: column; justify-content: center; gap: var(--jd-space-4);
  }
  .jd-chart-card__prog-head {
    display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-3);
    margin-block-end: var(--jd-space-1-5);
  }
  .jd-chart-card__prog-label {
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-medium); color: var(--jd-color-foreground);
  }
  .jd-chart-card__prog-val {
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-semibold);
    font-variant-numeric: tabular-nums; color: var(--jd-color-muted);
  }
  .jd-chart-card__prog-track {
    height: 0.5rem; overflow: hidden; border-radius: var(--jd-radius-full); background: var(--jd-cc-track);
  }
  .jd-chart-card__prog-fill {
    height: 100%; border-radius: var(--jd-radius-full);
    transition: width var(--jd-duration-slow) var(--jd-easing-ease-out);
  }

  /* ── 범례 ── */
  .jd-chart-card__legend {
    list-style: none; margin: 0; padding: 0;
    display: flex; flex-direction: column; gap: var(--jd-space-1-5);
  }
  .jd-chart-card__legend--flex { flex: 1 1 auto; }
  .jd-chart-card__legend-item {
    display: flex; min-width: 0; align-items: center; gap: var(--jd-space-2); font-size: var(--jd-text-xs);
  }
  .jd-chart-card__legend-swatch {
    width: 0.5rem; height: 0.5rem; flex-shrink: 0; border-radius: var(--jd-radius-full);
  }
  .jd-chart-card__legend-label {
    min-width: 0; flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    color: var(--jd-color-muted);
  }
  .jd-chart-card__legend-val {
    font-weight: var(--jd-weight-semibold); font-variant-numeric: tabular-nums;
    color: var(--jd-color-foreground);
  }

  /* ── skeleton / empty ── */
  .jd-chart-card__skeleton { display: flex; align-items: flex-end; gap: var(--jd-space-2); }
  .jd-chart-card__skeleton-bar {
    flex: 1 1 0; border-radius: var(--jd-radius-md) var(--jd-radius-md) 0 0;
    background: color-mix(in srgb, var(--jd-color-muted) 22%, transparent);
    animation: jd-chart-card-pulse 1.4s var(--jd-easing-ease-in-out) infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .jd-chart-card__skeleton-bar { animation: none; }
  }
  @keyframes jd-chart-card-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
  .jd-chart-card__empty {
    display: flex; align-items: center; justify-content: center;
    border-radius: var(--jd-radius-lg);
    border: var(--jd-border-thin) dashed var(--jd-color-border);
    background: color-mix(in srgb, var(--jd-color-muted) 6%, transparent);
    font-size: var(--jd-text-sm); color: var(--jd-color-muted);
  }
}`;
