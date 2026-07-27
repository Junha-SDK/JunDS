/**
 * jd-investor-council CSS — v2 finance/InvestorCouncil.
 * bm-card → 카드 크롬, bm-soft-100 → card-hover, bm-accent-strong → primary.
 * 상승/하락(적/청)은 --jd-fin-up/down. 위원 강조색은 상세/버튼 인라인 --_accent가,
 * 결론색은 --_verdict가 나른다(활성 위원마다 달라지므로 인라인 변수가 적합).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-investor-council:not(:defined) { display: block; }

  :where(jd-investor-council) {
    --jd-fin-up: var(--jd-color-danger);
    --jd-fin-down: var(--jd-color-info);
  }
  jd-investor-council {
    display: block; font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
  }

  .jd-council__card {
    overflow: hidden;
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
  }
  .jd-council__card[hidden] { display: none; }

  /* 상태(로딩/에러) */
  .jd-council__state {
    display: flex; align-items: center; justify-content: center; gap: var(--jd-space-2);
    padding: var(--jd-space-6) var(--jd-space-4);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    font-size: 12px; color: var(--jd-color-muted);
  }
  .jd-council__state[hidden] { display: none; }
  .jd-council__state[data-kind="error"] { text-align: center; }
  .jd-council__state-text { margin: 0; font-size: 13px; }
  .jd-council__state-dot {
    width: 8px; height: 8px; border-radius: var(--jd-radius-full);
    background: var(--jd-color-primary);
  }
  @media (prefers-reduced-motion: no-preference) {
    .jd-council__state-dot { animation: jd-council-pulse 1.2s ease-in-out infinite; }
  }
  @keyframes jd-council-pulse { 50% { opacity: .35; } }

  /* 헤더 */
  .jd-council__header {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: var(--jd-space-2);
    padding: var(--jd-space-3) var(--jd-space-4);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-council__brand { display: flex; align-items: center; gap: var(--jd-space-2); }
  .jd-council__brand-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: var(--jd-radius-lg);
    background: var(--jd-color-primary-light); color: var(--jd-color-primary);
  }
  .jd-council__title { margin: 0; font-size: 14px; font-weight: 800; }
  .jd-council__tag {
    font-size: 11px; font-weight: 700; padding: 2px var(--jd-space-2);
    border-radius: var(--jd-radius-full);
    background: var(--jd-color-card-hover); color: var(--jd-color-muted);
  }

  .jd-council__consensus {
    display: inline-flex; align-items: center; gap: var(--jd-space-2);
    padding: 6px var(--jd-space-3); border-radius: var(--jd-radius-full);
    background: var(--jd-color-card-hover);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    font-variant-numeric: tabular-nums;
  }
  .jd-council__consensus-up, .jd-council__consensus-down {
    font-size: 11px; font-weight: 800;
  }
  .jd-council__consensus-down { color: var(--jd-fin-down); }
  .jd-council__consensus[data-tone="up"] .jd-council__consensus-up,
  .jd-council__consensus[data-tone="up"] .jd-council__consensus-label { color: var(--jd-fin-up); }
  .jd-council__consensus[data-tone="down"] .jd-council__consensus-up,
  .jd-council__consensus[data-tone="down"] .jd-council__consensus-label { color: var(--jd-fin-down); }
  .jd-council__consensus[data-tone="neutral"] .jd-council__consensus-up,
  .jd-council__consensus[data-tone="neutral"] .jd-council__consensus-label { color: var(--jd-color-muted); }
  .jd-council__consensus-sep { color: var(--jd-color-border); }
  .jd-council__consensus-div {
    width: 1px; height: 12px; background: var(--jd-color-border);
  }
  .jd-council__consensus-label { font-size: 11px; font-weight: 800; }

  /* 본문 그리드 */
  .jd-council__body { display: grid; grid-template-columns: 1fr; }
  @media (min-width: 1024px) {
    .jd-council__body { grid-template-columns: 260px 1fr; }
  }
  .jd-council__aside { border-block-end: var(--jd-border-thin) solid var(--jd-color-border); }
  @media (min-width: 1024px) {
    .jd-council__aside {
      border-block-end: none; border-inline-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
  }
  .jd-council__list { margin: 0; padding: 0; list-style: none; }
  .jd-council__list > li + li { border-block-start: var(--jd-border-thin) solid var(--jd-color-border); }

  .jd-council__investor {
    display: flex; align-items: center; gap: var(--jd-space-3); width: 100%;
    padding: var(--jd-space-3) var(--jd-space-4); text-align: start; cursor: pointer;
    background: transparent; border: none;
    border-inline-start: var(--jd-border-thick) solid transparent;
    font-family: inherit; color: inherit;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-council__investor[data-active] {
    background: var(--jd-color-card-hover);
    border-inline-start-color: var(--_accent, var(--jd-color-primary));
  }
  .jd-council__investor-emoji {
    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    width: 36px; height: 36px; border-radius: var(--jd-radius-xl); font-size: 18px;
    background: color-mix(in srgb, var(--_accent, var(--jd-color-primary)) 10%, transparent);
  }
  .jd-council__investor-meta { min-width: 0; flex: 1; }
  .jd-council__investor-name {
    font-size: 13.5px; font-weight: 800;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-council__investor-tagline {
    font-size: 10.5px; font-weight: 700; color: var(--jd-color-muted);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-council__investor-right { text-align: end; flex-shrink: 0; }
  .jd-council__investor-verdict { font-size: 12px; font-weight: 800; font-variant-numeric: tabular-nums; }
  .jd-council__investor-score {
    font-size: 10.5px; font-weight: 700; color: var(--jd-color-muted);
    font-variant-numeric: tabular-nums;
  }

  /* 상세 */
  .jd-council__detail { padding: var(--jd-space-5); }
  .jd-council__profile { display: flex; align-items: flex-start; gap: var(--jd-space-3); margin-block-end: var(--jd-space-4); }
  .jd-council__profile-emoji {
    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    width: 48px; height: 48px; border-radius: var(--jd-radius-2xl); font-size: 26px;
    background: color-mix(in srgb, var(--_accent, var(--jd-color-primary)) 10%, transparent);
  }
  .jd-council__profile-meta { min-width: 0; flex: 1; }
  .jd-council__profile-namerow { display: flex; align-items: baseline; gap: var(--jd-space-2); flex-wrap: wrap; }
  .jd-council__profile-korean { margin: 0; font-size: 18px; font-weight: 800; letter-spacing: var(--jd-tracking-tight); }
  .jd-council__profile-name { font-size: 12px; font-weight: 700; color: var(--jd-color-muted); }
  .jd-council__profile-tagline { margin: 2px 0 0; font-size: 11.5px; font-weight: 700; color: var(--_accent, var(--jd-color-primary)); }
  .jd-council__profile-context { margin: var(--jd-space-1) 0 0; font-size: 11.5px; line-height: 1.625; color: var(--jd-color-muted); }

  .jd-council__verdict-box {
    display: flex; align-items: center; gap: var(--jd-space-3);
    padding: var(--jd-space-3) var(--jd-space-4); margin-block-end: var(--jd-space-4);
    border-radius: var(--jd-radius-xl);
    background: color-mix(in srgb, var(--_verdict, var(--jd-color-muted)) 8%, transparent);
    border: var(--jd-border-thin) solid color-mix(in srgb, var(--_verdict, var(--jd-color-muted)) 25%, transparent);
  }
  .jd-council__verdict-circle {
    display: grid; place-items: center; flex-shrink: 0;
    width: 48px; height: 48px; border-radius: var(--jd-radius-full);
    background: var(--_verdict, var(--jd-color-muted)); color: #fff;
  }
  .jd-council__verdict-main { flex: 1; }
  .jd-council__verdict-label {
    font-size: 10.5px; font-weight: 800; text-transform: uppercase;
    letter-spacing: var(--jd-tracking-wide); color: var(--_verdict, var(--jd-color-muted));
  }
  .jd-council__verdict-big {
    font-size: 20px; font-weight: 800; line-height: 1.1; color: var(--_verdict, var(--jd-color-muted));
  }
  .jd-council__verdict-stats { text-align: end; display: flex; flex-direction: column; gap: 2px; }
  .jd-council__stat { text-align: end; }
  .jd-council__stat-label {
    font-size: 9.5px; font-weight: 700; text-transform: uppercase;
    letter-spacing: var(--jd-tracking-wide); color: var(--jd-color-muted);
  }
  .jd-council__stat-value { font-size: 14px; font-weight: 800; font-variant-numeric: tabular-nums; }
  .jd-council__stat-value[data-dir="up"] { color: var(--jd-fin-up); }
  .jd-council__stat-value[data-dir="down"] { color: var(--jd-fin-down); }

  /* 성향 바 */
  .jd-council__bars {
    display: grid; grid-template-columns: 1fr; gap: var(--jd-space-2);
  }
  @media (min-width: 640px) { .jd-council__bars { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1024px) { .jd-council__bars { grid-template-columns: repeat(7, 1fr); } }
  .jd-council__bar-top { display: flex; align-items: center; justify-content: space-between; font-size: 10.5px; font-weight: 700; }
  .jd-council__bar-label { color: var(--jd-color-muted); }
  .jd-council__bar-value { font-variant-numeric: tabular-nums; color: var(--_accent, var(--jd-color-primary)); }
  .jd-council__bar-value[data-neg] { color: var(--jd-color-muted); }
  .jd-council__bar-track {
    display: flex; height: 6px; margin-block-start: var(--jd-space-1);
    border-radius: var(--jd-radius-full); overflow: hidden;
    background: var(--jd-color-card-hover);
  }
  .jd-council__bar-spacer { width: 50%; }
  .jd-council__bar-fill-pos {
    height: 100%; background: var(--_accent, var(--jd-color-primary));
    border-start-end-radius: var(--jd-radius-full); border-end-end-radius: var(--jd-radius-full);
  }
  .jd-council__bar-half { width: 50%; height: 100%; }
  .jd-council__bar-fill-neg {
    /* v2 음수 성향 바 = slate-400 리터럴(중립 회색). muted 토큰은 보라 기가 있어 부적합 */
    height: 100%; background: var(--jd-color-neutral-400);
    border-start-start-radius: var(--jd-radius-full); border-end-start-radius: var(--jd-radius-full);
  }

  /* 근거 / 리스크 */
  .jd-council__lists {
    display: grid; grid-template-columns: 1fr; gap: var(--jd-space-4);
    margin-block-start: var(--jd-space-4);
  }
  @media (min-width: 768px) { .jd-council__lists { grid-template-columns: repeat(2, 1fr); } }
  .jd-council__reasons {
    padding: var(--jd-space-3) 14px;
    background: var(--jd-color-card-hover);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
  }
  .jd-council__reasons-title {
    display: inline-flex; align-items: center; gap: var(--jd-space-1-5);
    margin: 0 0 var(--jd-space-2); font-size: 12px; font-weight: 800;
    color: var(--_tone, var(--jd-color-foreground));
  }
  .jd-council__reasons-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: var(--jd-space-1-5); }
  .jd-council__reasons-item { display: flex; align-items: flex-start; gap: var(--jd-space-1-5); font-size: 12.5px; line-height: 1.625; }
  .jd-council__reasons-bullet {
    flex-shrink: 0; margin-block-start: 7px; width: 4px; height: 4px;
    border-radius: var(--jd-radius-full); background: var(--_tone, var(--jd-color-muted));
  }
  .jd-council__reasons-empty { font-size: 12px; color: var(--jd-color-muted); }

  /* 매매 플랜 */
  .jd-council__plan {
    margin-block-start: var(--jd-space-4); padding: var(--jd-space-3) var(--jd-space-4);
    background: var(--jd-color-card-hover);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
  }
  .jd-council__plan-head { display: flex; align-items: center; justify-content: space-between; margin-block-end: var(--jd-space-2); }
  .jd-council__plan-title {
    display: flex; align-items: center; gap: var(--jd-space-1-5);
    margin: 0; font-size: 13px; font-weight: 800; color: var(--_accent, var(--jd-color-primary));
  }
  .jd-council__plan-horizon {
    font-size: 10.5px; font-weight: 800; padding: 2px var(--jd-space-2);
    border-radius: var(--jd-radius-full); background: var(--_accent, var(--jd-color-primary)); color: #fff;
  }
  .jd-council__plan-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--jd-space-3); font-variant-numeric: tabular-nums; }
  @media (min-width: 768px) { .jd-council__plan-grid { grid-template-columns: repeat(5, 1fr); } }
  .jd-council__plan-cell {
    padding: var(--jd-space-2) var(--jd-space-3);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
  }
  .jd-council__plan-cell-label { font-size: 10px; font-weight: 700; color: var(--jd-color-muted); }
  .jd-council__plan-cell-value { margin-block-start: 2px; font-size: 13.5px; font-weight: 800; font-variant-numeric: tabular-nums; }
  .jd-council__plan-cell-value[data-big] { font-size: 16px; }
  .jd-council__plan-cell-value[data-dir="up"] { color: var(--jd-fin-up); }
  .jd-council__plan-cell-value[data-dir="down"] { color: var(--jd-fin-down); }

  /* 인용 */
  .jd-council__quotes { margin-block-start: var(--jd-space-4); }
  .jd-council__quotes-summary {
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    cursor: pointer; font-size: 11.5px; font-weight: 700; color: var(--jd-color-muted);
  }
  .jd-council__quotes-list { margin: var(--jd-space-2) 0 0; padding-inline-start: var(--jd-space-4); list-style: none; display: flex; flex-direction: column; gap: var(--jd-space-1); }
  .jd-council__quote { font-size: 11.5px; line-height: 1.625; font-style: italic; color: var(--jd-color-muted); }
  .jd-council__quotes-source { margin-block-start: 6px; font-size: 10.5px; font-style: normal; color: var(--jd-color-muted); }

  /* 면책 */
  .jd-council__disclaimer { margin-block-start: var(--jd-space-4); font-size: 10.5px; line-height: 1.625; color: var(--jd-color-muted); }
  .jd-council__more { color: inherit; text-decoration: underline; }
}`;
