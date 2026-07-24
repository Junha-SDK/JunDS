/**
 * jd-recently-viewed CSS — v2 finance/RecentlyViewed의 Tailwind를 토큰으로 의미 번역.
 *
 * v2 값: 바깥 px-3 pb-4, 헤더 px-3 mb-1.5(제목 10.5px extrabold tracking .08em muted,
 * 지우기 10px semibold muted), 목록 space-y-0.5, 행 px-3 py-1.5 rounded-lg 12.5px
 * hover:bg-soft, 이름 flex-1 truncate bold, 시세 bm-num 11px, 등락 10.5px bold
 * min-w-38 우측정렬 · 상승/하락 색. 상승=적/하락=청(한국 관례, candle-chart와 동일 토큰).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-recently-viewed {
    display: block;
    padding-inline: var(--jd-space-3);
    padding-block-end: var(--jd-space-4);
    font-family: var(--jd-font-sans);
    --_up: var(--jd-fin-up, #e11d48);
    --_down: var(--jd-fin-down, #2563eb);
    --_muted: var(--jd-fin-muted, var(--jd-color-muted));
    --_hover: var(--jd-fin-soft-100, var(--jd-color-card-hover));
  }
  jd-recently-viewed[hidden],
  jd-recently-viewed:not(:defined) { display: none; }

  .jd-recently-viewed__head {
    display: flex; align-items: center; justify-content: space-between;
    padding-inline: var(--jd-space-3);
    margin-block-end: var(--jd-space-1);
  }
  .jd-recently-viewed__title {
    font-size: 10.5px; font-weight: 800; letter-spacing: 0.08em;
    color: var(--_muted);
  }
  .jd-recently-viewed__clear {
    appearance: none; margin: 0; padding: 0; border: 0; background: none;
    font-family: inherit; font-size: 10px; font-weight: 600;
    color: var(--_muted); cursor: pointer;
  }
  .jd-recently-viewed__clear:hover { color: var(--jd-color-foreground); }
  .jd-recently-viewed__clear:focus-visible {
    outline: 2px solid var(--jd-color-focus); outline-offset: 2px;
    border-radius: var(--jd-radius-sm);
  }

  .jd-recently-viewed__list {
    list-style: none; margin: 0; padding: 0;
    display: flex; flex-direction: column; gap: 2px;
  }
  .jd-recently-viewed__row {
    display: flex; align-items: center; gap: var(--jd-space-2);
    padding: 6px var(--jd-space-3);
    border-radius: var(--jd-radius-lg);
    font-size: 12.5px; color: var(--jd-color-foreground);
    text-decoration: none;
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-recently-viewed__row:hover { background: var(--_hover); }
  .jd-recently-viewed__row:focus-visible {
    outline: 2px solid var(--jd-color-focus); outline-offset: -2px;
  }
  .jd-recently-viewed__name {
    flex: 1; min-width: 0; font-weight: 700;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-recently-viewed__price {
    font-size: 11px; font-variant-numeric: tabular-nums;
    color: var(--jd-color-foreground);
  }
  .jd-recently-viewed__change {
    min-width: 38px; text-align: right;
    font-size: 10.5px; font-weight: 700; font-variant-numeric: tabular-nums;
    color: var(--_muted);
  }
  .jd-recently-viewed__change[data-dir="up"] { color: var(--_up); }
  .jd-recently-viewed__change[data-dir="down"] { color: var(--_down); }

  @media (prefers-reduced-motion: reduce) {
    .jd-recently-viewed__row { transition: none; }
  }
}`;
