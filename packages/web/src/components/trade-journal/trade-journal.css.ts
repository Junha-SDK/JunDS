import { css } from "../../core/styles.js";

/**
 * v2 값: bm-card-lg + section-head, 스탯 4칸(gap:1px border 배경, 타일 label 10.5px/value 800),
 * 폼(soft 배경·상단선, 입력 h40 rounded-lg border, 그리드 1fr/120/140/140), 액션 pill 버튼,
 * 행(side 배지 up/down soft, name 800, spec muted, pct 800, class 색, 삭제 원형). finance 색은
 * --bm-* → jd 폴백. classification 5색: 유지 muted·수익실현 up·손절 down·추격매수 보라·물타기 warning.
 */
export default css`
@layer junds.components {
  jd-trade-journal {
    --jd-fin-up: var(--bm-up, var(--jd-color-success));
    --jd-fin-down: var(--bm-down, var(--jd-color-danger));
    --jd-fin-up-soft: var(--bm-up-soft, color-mix(in srgb, var(--jd-color-success) 14%, transparent));
    --jd-fin-down-soft: var(--bm-down-soft, color-mix(in srgb, var(--jd-color-danger) 14%, transparent));
    --jd-fin-accent: var(--bm-accent-strong, var(--jd-color-primary));
    --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
    --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
    --jd-fin-border: var(--bm-border, var(--jd-color-border));
    --jd-fin-card: var(--bm-card, var(--jd-color-card));
    --jd-fin-soft: var(--bm-soft-100, color-mix(in srgb, var(--jd-color-foreground) 6%, transparent));
    --jd-fin-warning: var(--bm-warning, var(--jd-color-warning));

    display: block; box-sizing: border-box;
    background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-2xl); overflow: hidden;
    box-shadow: var(--jd-shadow-sm);
    font-family: var(--jd-font-sans); color: var(--jd-fin-text);
  }
  jd-trade-journal * { box-sizing: border-box; }

  jd-trade-journal .jd-trade-journal__skeleton {
    height: 128px; margin: var(--jd-space-5);
    border-radius: var(--jd-radius-lg);
    background: linear-gradient(90deg,
      var(--jd-fin-soft) 25%,
      color-mix(in srgb, var(--jd-fin-muted) 14%, transparent) 37%,
      var(--jd-fin-soft) 63%);
    background-size: 400% 100%; animation: jd-tj-shimmer 1.4s ease infinite;
  }
  @keyframes jd-tj-shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
  @media (prefers-reduced-motion: reduce) {
    jd-trade-journal .jd-trade-journal__skeleton { animation: none; }
  }

  /* 헤더 */
  jd-trade-journal .jd-trade-journal__head {
    display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-3);
    padding: var(--jd-space-3-5) var(--jd-space-5);
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  jd-trade-journal .jd-trade-journal__title {
    display: inline-flex; align-items: center; gap: var(--jd-space-2);
    font-size: var(--jd-text-sm); font-weight: 800; letter-spacing: var(--jd-tracking-tight);
  }
  jd-trade-journal .jd-trade-journal__icon { color: var(--jd-fin-accent); }
  jd-trade-journal .jd-trade-journal__toggle {
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    height: 28px; padding: 0 var(--jd-space-3); border-radius: var(--jd-radius-full);
    font: inherit; font-size: var(--jd-text-xs); font-weight: 800; cursor: pointer;
    background: var(--jd-fin-soft); color: var(--jd-fin-text);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    transition: background var(--jd-duration-fast) var(--jd-easing-default);
  }
  jd-trade-journal .jd-trade-journal__toggle[data-active="true"] {
    background: var(--jd-fin-accent); color: #fff; border-color: var(--jd-fin-accent);
  }
  jd-trade-journal .jd-trade-journal__toggle:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring);
  }

  /* 스탯 바 */
  jd-trade-journal .jd-trade-journal__stats {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--jd-border-thin);
    background: var(--jd-fin-border);
  }
  jd-trade-journal .jd-trade-journal__stat {
    display: flex; flex-direction: column; gap: var(--jd-space-1);
    padding: var(--jd-space-3) var(--jd-space-4); background: var(--jd-fin-card);
  }
  jd-trade-journal .jd-trade-journal__stat-label {
    font-size: 10.5px; font-weight: 700; letter-spacing: var(--jd-tracking-wide);
    text-transform: uppercase; color: var(--jd-fin-muted);
  }
  jd-trade-journal .jd-trade-journal__stat-value {
    font-size: var(--jd-text-lg); font-weight: 800; font-variant-numeric: tabular-nums;
    color: var(--jd-fin-text);
  }
  jd-trade-journal .jd-trade-journal__stat-value[data-tone="up"] { color: var(--jd-fin-up); }
  jd-trade-journal .jd-trade-journal__stat-value[data-tone="down"] { color: var(--jd-fin-down); }
  @media (min-width: 768px) {
    jd-trade-journal .jd-trade-journal__stats { grid-template-columns: repeat(4, 1fr); }
  }

  /* 폼 */
  jd-trade-journal .jd-trade-journal__form {
    display: flex; flex-direction: column; gap: var(--jd-space-3);
    padding: var(--jd-space-4);
    background: var(--jd-fin-soft);
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  jd-trade-journal .jd-trade-journal__form-grid {
    display: grid; grid-template-columns: 1fr; gap: var(--jd-space-2);
  }
  @media (min-width: 768px) {
    jd-trade-journal .jd-trade-journal__form-grid {
      grid-template-columns: 1fr 120px 140px 140px;
    }
  }
  jd-trade-journal .jd-trade-journal__input {
    height: 40px; padding: 0 var(--jd-space-3); width: 100%;
    border-radius: var(--jd-radius-lg); font: inherit; font-size: var(--jd-text-sm);
    font-weight: 700; color: var(--jd-fin-text);
    background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    outline: none;
  }
  jd-trade-journal .jd-trade-journal__input:focus-visible {
    border-color: var(--jd-fin-accent); box-shadow: var(--jd-shadow-focus-ring);
  }
  jd-trade-journal .jd-trade-journal__num { font-variant-numeric: tabular-nums; }
  jd-trade-journal .jd-trade-journal__note { font-weight: var(--jd-weight-normal); }

  jd-trade-journal .jd-trade-journal__name-field { position: relative; }
  jd-trade-journal .jd-trade-journal__suggest {
    position: absolute; z-index: var(--jd-z-dropdown); inset-inline: 0; inset-block-start: calc(100% + var(--jd-space-1));
    list-style: none; margin: 0; padding: 0; max-height: 192px; overflow-y: auto;
    background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-lg); box-shadow: var(--jd-shadow-lg); overflow-x: hidden;
  }
  jd-trade-journal .jd-trade-journal__suggest-item {
    display: block; width: 100%; text-align: start; cursor: pointer;
    padding: var(--jd-space-2) var(--jd-space-3); font: inherit; font-size: var(--jd-text-sm);
    font-weight: 700; color: var(--jd-fin-text); background: none; border: 0;
  }
  jd-trade-journal .jd-trade-journal__suggest-item:hover,
  jd-trade-journal .jd-trade-journal__suggest-item:focus-visible {
    background: var(--jd-fin-soft); outline: none;
  }
  jd-trade-journal .jd-trade-journal__suggest-sector {
    margin-inline-start: var(--jd-space-2); font-size: 11px; font-weight: 400;
    color: var(--jd-fin-muted);
  }

  jd-trade-journal .jd-trade-journal__form-actions {
    display: flex; align-items: center; justify-content: flex-end; gap: var(--jd-space-2);
  }
  jd-trade-journal .jd-trade-journal__btn {
    height: 36px; padding: 0 var(--jd-space-4); border-radius: var(--jd-radius-full);
    font: inherit; font-size: var(--jd-text-xs); font-weight: 800; cursor: pointer;
  }
  jd-trade-journal .jd-trade-journal__btn--ghost {
    background: var(--jd-fin-card); color: var(--jd-fin-text);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  jd-trade-journal .jd-trade-journal__btn--primary {
    background: var(--jd-fin-accent); color: #fff; border: 0;
  }
  jd-trade-journal .jd-trade-journal__btn--primary:disabled { opacity: .5; cursor: not-allowed; }
  jd-trade-journal .jd-trade-journal__btn:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring);
  }

  /* 빈 상태 */
  jd-trade-journal .jd-trade-journal__empty {
    display: flex; flex-direction: column; align-items: center; text-align: center;
    gap: var(--jd-space-2); padding: var(--jd-space-12) var(--jd-space-6);
  }
  jd-trade-journal .jd-trade-journal__empty-icon { color: var(--jd-fin-muted); margin-block-end: var(--jd-space-1); }
  jd-trade-journal .jd-trade-journal__empty-title { font-size: var(--jd-text-md); font-weight: 800; }
  jd-trade-journal .jd-trade-journal__empty-desc { font-size: var(--jd-text-xs); color: var(--jd-fin-muted); max-width: 34ch; }

  /* 목록 */
  jd-trade-journal .jd-trade-journal__list { list-style: none; margin: 0; padding: 0; }
  jd-trade-journal .jd-trade-journal__row {
    display: flex; align-items: center; gap: var(--jd-space-3);
    padding: var(--jd-space-3) var(--jd-space-4);
    border-block-start: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  jd-trade-journal .jd-trade-journal__list > .jd-trade-journal__row:first-child { border-block-start: none; }
  jd-trade-journal .jd-trade-journal__side {
    display: grid; place-items: center; flex-shrink: 0;
    height: 24px; padding: 0 var(--jd-space-2); border-radius: var(--jd-radius-md);
    font-size: 10.5px; font-weight: 800;
  }
  jd-trade-journal .jd-trade-journal__side[data-side="buy"] { color: color-mix(in srgb, var(--jd-fin-up) 65%, var(--jd-color-foreground)); background: var(--jd-fin-up-soft); }
  jd-trade-journal .jd-trade-journal__side[data-side="sell"] { color: color-mix(in srgb, var(--jd-fin-down) 65%, var(--jd-color-foreground)); background: var(--jd-fin-down-soft); }

  jd-trade-journal .jd-trade-journal__row-main { min-width: 0; flex: 1; }
  jd-trade-journal .jd-trade-journal__row-top { display: flex; align-items: baseline; gap: var(--jd-space-2); }
  jd-trade-journal .jd-trade-journal__row-name {
    font-weight: 800; font-size: 13.5px; color: var(--jd-fin-text);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  jd-trade-journal .jd-trade-journal__row-spec {
    font-size: 11px; font-variant-numeric: tabular-nums; color: var(--jd-fin-muted); white-space: nowrap;
  }
  jd-trade-journal .jd-trade-journal__row-meta {
    display: flex; align-items: center; gap: var(--jd-space-2); margin-block-start: 2px;
    font-size: 11px; color: var(--jd-fin-muted); min-width: 0;
  }
  jd-trade-journal .jd-trade-journal__row-date { font-variant-numeric: tabular-nums; flex-shrink: 0; }
  jd-trade-journal .jd-trade-journal__row-note { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  jd-trade-journal .jd-trade-journal__review { text-align: end; flex-shrink: 0; }
  jd-trade-journal .jd-trade-journal__pct {
    display: block; font-weight: 800; font-size: 13px; font-variant-numeric: tabular-nums;
  }
  jd-trade-journal .jd-trade-journal__pct[data-tone="up"] { color: var(--jd-fin-up); }
  jd-trade-journal .jd-trade-journal__pct[data-tone="down"] { color: var(--jd-fin-down); }
  jd-trade-journal .jd-trade-journal__class {
    display: block; font-size: 10.5px; font-weight: 800; margin-block-start: 2px;
    color: var(--jd-fin-muted);
  }
  jd-trade-journal .jd-trade-journal__class[data-class="수익실현"] { color: var(--jd-fin-up); }
  jd-trade-journal .jd-trade-journal__class[data-class="손절"] { color: var(--jd-fin-down); }
  jd-trade-journal .jd-trade-journal__class[data-class="추격매수"] { color: #a855f7; }
  jd-trade-journal .jd-trade-journal__class[data-class="물타기"] { color: var(--jd-fin-warning); }

  jd-trade-journal .jd-trade-journal__delete {
    display: grid; place-items: center; flex-shrink: 0;
    width: 28px; height: 28px; border-radius: var(--jd-radius-full);
    background: none; border: 0; cursor: pointer; color: var(--jd-fin-muted);
    transition: background var(--jd-duration-fast) var(--jd-easing-default);
  }
  jd-trade-journal .jd-trade-journal__delete:hover { background: var(--jd-fin-soft); }
  jd-trade-journal .jd-trade-journal__delete:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }
}`;
