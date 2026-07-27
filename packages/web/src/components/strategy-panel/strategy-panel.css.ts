import { css } from "../../core/styles.js";

/**
 * jd-strategy-panel CSS — v2 finance/StrategyPanel 토큰 번역.
 * 톤(추천 5단계) 색/배경은 호스트 CSS 변수 --_jd-sp-color/-bg로 실려 .jd-strategy-panel__tone
 * 계열이 소비한다. 존(buy/sell/stop) 액센트는 data-tone → --_z, 칩·KPI·산식 값은
 * data-tone/data-trend로 색을 고른다(§3.1 결정적 렌더 — JS 색 분기 없음).
 * 토큰: --bm-up→success, --bm-down→danger, --bm-accent-strong→primary,
 * --bm-soft-100→border-light, --bm-info→info, --bm-muted→muted.
 */
export default css`
@layer junds.base {
  jd-strategy-panel:not(:defined) { display: block; }
}
@layer junds.components {
  jd-strategy-panel {
    display: block;
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    overflow: hidden;
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
  }
  .jd-strategy-panel__body { display: block; }

  .jd-strategy-panel__tone { color: var(--_jd-sp-color, var(--jd-color-muted)); }
  .jd-strategy-panel__accent-icon { color: var(--jd-color-primary-ink); }
  .jd-strategy-panel__tone-icon { color: var(--_jd-sp-color, var(--jd-color-muted)); }

  /* ── 헤더 ── */
  .jd-strategy-panel__header {
    display: flex; align-items: center; justify-content: space-between;
    gap: var(--jd-space-2);
    padding: var(--jd-space-3) var(--jd-space-4);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-strategy-panel__header-left { display: flex; align-items: center; gap: var(--jd-space-2); }
  .jd-strategy-panel__header-right {
    display: flex; align-items: center; gap: var(--jd-space-2);
    font-size: var(--jd-text-xs); color: var(--jd-color-muted);
  }
  .jd-strategy-panel__title { margin: 0; font-weight: 800; font-size: var(--jd-text-md); }
  .jd-strategy-panel__num { font-variant-numeric: tabular-nums; }

  /* ── 상단 그리드: 추천 카드 + KPI ── */
  .jd-strategy-panel__top {
    display: grid; grid-template-columns: 1fr; gap: var(--jd-space-4);
    padding: var(--jd-space-4);
  }
  .jd-strategy-panel__rec {
    display: flex; align-items: center; gap: var(--jd-space-3);
    border-radius: var(--jd-radius-xl);
    padding: var(--jd-space-3) var(--jd-space-4);
    background: var(--_jd-sp-bg, var(--jd-color-border-light));
  }
  .jd-strategy-panel__rec-icon {
    width: 40px; height: 40px; flex-shrink: 0;
    border-radius: var(--jd-radius-full);
    display: grid; place-items: center;
    background: var(--_jd-sp-strong, var(--_jd-sp-color, var(--jd-color-muted))); color: #fff;
  }
  .jd-strategy-panel__rec-main { flex: 1; min-width: 0; }
  .jd-strategy-panel__rec-caption { font-size: 0.6875rem; font-weight: var(--jd-weight-bold); }
  .jd-strategy-panel__rec-label { font-size: var(--jd-text-xl); font-weight: 800; }
  .jd-strategy-panel__rec-metric { text-align: right; }
  .jd-strategy-panel__rec-metric--divider {
    padding-inline-end: var(--jd-space-3);
    border-inline-end: var(--jd-border-thin) solid color-mix(in srgb, var(--jd-color-foreground) 8%, transparent);
  }
  .jd-strategy-panel__rec-metric-label {
    font-size: 0.65625rem; font-weight: var(--jd-weight-bold); color: var(--jd-color-muted);
  }
  .jd-strategy-panel__rec-metric-value {
    font-variant-numeric: tabular-nums; font-weight: 800; font-size: var(--jd-text-lg);
  }
  .jd-strategy-panel__rec-metric-unit {
    font-size: 0.65625rem; font-weight: var(--jd-weight-semibold);
    margin-inline-start: 2px; color: var(--jd-color-muted);
  }

  .jd-strategy-panel__kpis {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--jd-space-2);
  }
  .jd-strategy-panel__kpi {
    border-radius: var(--jd-radius-xl); text-align: center;
    padding: var(--jd-space-2) var(--jd-space-3);
    background: var(--jd-color-border-light);
  }
  .jd-strategy-panel__kpi-label { font-size: 0.65625rem; font-weight: var(--jd-weight-bold); color: var(--jd-color-muted); }
  .jd-strategy-panel__kpi-value {
    font-variant-numeric: tabular-nums; font-weight: 800;
    font-size: var(--jd-text-md); margin-top: var(--jd-space-0-5);
    color: var(--jd-color-foreground);
  }
  .jd-strategy-panel__kpi[data-tone="buy"] .jd-strategy-panel__kpi-value { color: var(--jd-color-success-ink); }
  .jd-strategy-panel__kpi[data-tone="stop"] .jd-strategy-panel__kpi-value { color: var(--jd-color-danger-ink); }
  .jd-strategy-panel__kpi-unit { font-size: 0.65625rem; font-weight: var(--jd-weight-semibold); margin-inline-start: 2px; }

  /* ── 근거 패널 (details) ── */
  .jd-strategy-panel__reason {
    padding: 0 var(--jd-space-4) var(--jd-space-3);
    border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-strategy-panel__reason-summary {
    cursor: pointer; list-style: none; user-select: none;
    padding-block: var(--jd-space-3);
    display: flex; align-items: center; gap: var(--jd-space-2);
    font-size: 0.78125rem; font-weight: 800;
  }
  .jd-strategy-panel__reason-summary::-webkit-details-marker { display: none; }
  .jd-strategy-panel__reason-chip {
    margin-inline-start: auto;
    font-size: 0.65625rem; font-weight: var(--jd-weight-bold);
    padding: var(--jd-space-0-5) var(--jd-space-2);
    border-radius: var(--jd-radius-full);
    background: var(--_jd-sp-bg, var(--jd-color-border-light));
    color: var(--_jd-sp-color, var(--jd-color-muted));
    white-space: nowrap;
  }
  .jd-strategy-panel__reason-body {
    display: grid; grid-template-columns: 1fr; gap: var(--jd-space-3);
    margin-top: var(--jd-space-1);
  }
  .jd-strategy-panel__reason-card {
    border-radius: var(--jd-radius-xl); padding: var(--jd-space-3);
    font-size: var(--jd-text-xs); line-height: var(--jd-leading-relaxed);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-strategy-panel__reason-card--soft { background: var(--jd-color-border-light); }
  .jd-strategy-panel__reason-heading {
    font-size: 0.6875rem; font-weight: 800; color: var(--jd-color-muted);
    margin-block-end: var(--jd-space-2);
  }
  .jd-strategy-panel__reason-p { margin: 0 0 var(--jd-space-2-5); }

  .jd-strategy-panel__breakdown { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--jd-space-1-5); }
  .jd-strategy-panel__breakdown-row { display: flex; align-items: baseline; justify-content: space-between; gap: var(--jd-space-2); }
  .jd-strategy-panel__breakdown-main { min-width: 0; flex: 1; }
  .jd-strategy-panel__breakdown-label { font-weight: var(--jd-weight-bold); }
  .jd-strategy-panel__breakdown-detail { font-size: 0.65625rem; color: var(--jd-color-muted); }
  .jd-strategy-panel__breakdown-value {
    font-variant-numeric: tabular-nums; font-weight: 800;
    font-size: 0.78125rem; flex-shrink: 0;
  }
  .jd-strategy-panel__breakdown-value[data-trend="up"] { color: var(--jd-color-success-ink); }
  .jd-strategy-panel__breakdown-value[data-trend="down"] { color: var(--jd-color-danger-ink); }
  .jd-strategy-panel__breakdown-value[data-trend="text"] { color: var(--jd-color-foreground); }
  .jd-strategy-panel__breakdown-total {
    display: flex; align-items: baseline; justify-content: space-between; gap: var(--jd-space-2);
    padding-block-start: var(--jd-space-1-5); margin-block-start: var(--jd-space-1);
    border-block-start: var(--jd-border-thin) dashed var(--jd-color-border);
  }
  .jd-strategy-panel__breakdown-total-label { font-weight: 800; }
  .jd-strategy-panel__breakdown-total-value { font-variant-numeric: tabular-nums; font-weight: 800; font-size: var(--jd-text-md); }

  .jd-strategy-panel__reason-criteria {
    margin-block-start: var(--jd-space-2); padding-block-start: var(--jd-space-2);
    font-size: 0.6875rem; line-height: var(--jd-leading-relaxed);
    border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
    color: var(--jd-color-muted);
  }
  .jd-strategy-panel__reason-criteria strong { font-weight: 800; color: var(--jd-color-foreground); }

  .jd-strategy-panel__reasons { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--jd-space-1); }
  .jd-strategy-panel__reason-item { display: flex; align-items: flex-start; gap: var(--jd-space-2); }
  .jd-strategy-panel__reason-dot {
    margin-top: 5px; flex-shrink: 0; width: 6px; height: 6px;
    border-radius: var(--jd-radius-full);
  }
  .jd-strategy-panel__tone-bgdot { background: var(--_jd-sp-color, var(--jd-color-muted)); }
  .jd-strategy-panel__reason-disclaimer {
    margin-block-start: var(--jd-space-3); padding-block-start: var(--jd-space-2);
    font-size: 0.65625rem; line-height: var(--jd-leading-relaxed);
    border-block-start: var(--jd-border-thin) dashed var(--jd-color-border);
    color: var(--jd-color-muted);
  }

  /* ── 존 (매수/익절/손절) ── */
  .jd-strategy-panel__zones {
    display: grid; grid-template-columns: 1fr; gap: var(--jd-space-4);
    padding: 0 var(--jd-space-4) var(--jd-space-4);
  }
  .jd-strategy-panel__zone { display: flex; flex-direction: column; gap: var(--jd-space-2); }
  .jd-strategy-panel__zone[data-tone="buy"] { --_z: var(--jd-color-success); }
  .jd-strategy-panel__zone[data-tone="sell"] { --_z: var(--jd-color-primary); }
  .jd-strategy-panel__zone[data-tone="stop"] { --_z: var(--jd-color-danger); }
  .jd-strategy-panel__zone-head { display: flex; align-items: center; gap: var(--jd-space-1-5); padding-inline: var(--jd-space-1); }
  .jd-strategy-panel__zone-icon { color: var(--_z); }
  .jd-strategy-panel__zone-title { margin: 0; font-size: 0.78125rem; font-weight: 800; color: var(--_z); }

  .jd-strategy-panel__level {
    display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-2);
    border-radius: var(--jd-radius-xl); padding: var(--jd-space-2-5) var(--jd-space-3);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    background: var(--jd-color-card);
  }
  .jd-strategy-panel__level-left { display: flex; align-items: center; gap: var(--jd-space-2); min-width: 0; }
  .jd-strategy-panel__level-desc { font-size: 0.71875rem; font-weight: var(--jd-weight-bold); line-height: var(--jd-leading-tight); }
  .jd-strategy-panel__level-right { text-align: right; font-variant-numeric: tabular-nums; }
  .jd-strategy-panel__level-price { font-weight: 800; font-size: var(--jd-text-md); color: var(--_z); }
  .jd-strategy-panel__level-dist { font-size: 0.65625rem; font-weight: var(--jd-weight-semibold); color: var(--jd-color-muted); }

  .jd-strategy-panel__stop {
    border-radius: var(--jd-radius-xl); padding: var(--jd-space-3-5) var(--jd-space-3);
    border: var(--jd-border-thin) solid color-mix(in srgb, var(--jd-color-danger) 30%, transparent);
    background: color-mix(in srgb, var(--jd-color-danger) 5%, transparent);
  }
  .jd-strategy-panel__stop-top { display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-2); }
  .jd-strategy-panel__stop-right { text-align: right; font-variant-numeric: tabular-nums; }
  .jd-strategy-panel__stop-price { font-weight: 800; font-size: var(--jd-text-xl); color: var(--jd-color-danger-ink); }
  .jd-strategy-panel__stop-dist { font-size: 0.65625rem; font-weight: var(--jd-weight-semibold); color: var(--jd-color-muted); }
  .jd-strategy-panel__stop-desc {
    margin: var(--jd-space-2) 0 0; font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-semibold); line-height: var(--jd-leading-relaxed);
    color: var(--jd-color-danger-ink);
  }

  .jd-strategy-panel__chip {
    display: inline-flex; align-items: center; flex-shrink: 0;
    padding: 1px var(--jd-space-2); border-radius: var(--jd-radius-full);
    font-size: 0.6875rem; font-weight: var(--jd-weight-bold);
  }
  .jd-strategy-panel__chip[data-tone="buy"] {
    background: color-mix(in srgb, var(--jd-color-success) 14%, transparent);
    color: color-mix(in srgb, var(--jd-color-success) 78%, var(--jd-color-foreground));
  }
  .jd-strategy-panel__chip[data-tone="sell"] {
    background: color-mix(in srgb, var(--jd-color-primary) 14%, transparent);
    color: var(--jd-color-primary-ink);
  }
  .jd-strategy-panel__chip[data-tone="stop"] {
    background: color-mix(in srgb, var(--jd-color-info) 14%, transparent);
    color: var(--jd-color-info-ink);
  }

  /* ── 포지션 ── */
  .jd-strategy-panel__positions {
    display: grid; grid-template-columns: 1fr; gap: var(--jd-space-3);
    padding: var(--jd-space-3) var(--jd-space-4);
    background: var(--jd-color-border-light);
    border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-strategy-panel__position {
    display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-2);
    border-radius: var(--jd-radius-xl); padding: var(--jd-space-2) var(--jd-space-3);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-strategy-panel__position-label { font-size: 0.65625rem; font-weight: var(--jd-weight-bold); color: var(--jd-color-muted); }
  .jd-strategy-panel__position-value { font-variant-numeric: tabular-nums; font-weight: 800; font-size: var(--jd-text-lg); color: var(--jd-color-foreground); }
  .jd-strategy-panel__position[data-tone="info"] .jd-strategy-panel__position-value { color: var(--jd-color-info-ink); }
  .jd-strategy-panel__position[data-tone="primary"] .jd-strategy-panel__position-value { color: var(--jd-color-primary-ink); }
  .jd-strategy-panel__position[data-tone="up"] .jd-strategy-panel__position-value { color: var(--jd-color-success-ink); }
  .jd-strategy-panel__position-note { font-size: 0.65625rem; font-weight: var(--jd-weight-semibold); color: var(--jd-color-muted); }

  /* ── 노트 ── */
  .jd-strategy-panel__notes {
    display: flex; flex-direction: column; gap: var(--jd-space-1-5);
    padding: var(--jd-space-3) var(--jd-space-4);
    font-size: 0.78125rem;
    border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-strategy-panel__note { display: flex; align-items: flex-start; gap: var(--jd-space-2); line-height: var(--jd-leading-relaxed); }
  .jd-strategy-panel__note-icon { margin-top: 3px; flex-shrink: 0; color: var(--jd-color-muted); }

  /* ── 반응형 ── */
  @media (min-width: 768px) {
    .jd-strategy-panel__top { grid-template-columns: 1fr auto; }
    .jd-strategy-panel__kpis { gap: var(--jd-space-3); }
    .jd-strategy-panel__positions { grid-template-columns: repeat(3, 1fr); }
  }
  @media (min-width: 1024px) {
    .jd-strategy-panel__reason-body { grid-template-columns: 1fr 1fr; }
    .jd-strategy-panel__zones { grid-template-columns: repeat(3, 1fr); }
  }
}`;
