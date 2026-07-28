import { css } from "../../core/styles.js";

/**
 * jd-modal 위에 얹는 콘텐츠 스타일. 패널 기하(560/95vw/85vh)만 modal 기본값을 이긴다
 * (`jd-theme-drill-down > .jd-modal__panel` = 0,1,1 > modal `.jd-modal__panel` 0,1,0).
 *
 * v2 값: 헤더 sticky(card 배경·하단 테두리), 테마 알약(accent 12% + accent-strong 글자 +
 * accent 32% 테두리), 통계 4칸(soft 카드), 등장일/왕관 목록(테두리 rounded, zebra, 마지막
 * 행 테두리 제거), pct/평균 up·down 색. finance --bm-* → jd 폴백(daily-themes-calendar 동형).
 */
export default css`
  @layer junds.components {
    jd-theme-drill-down {
      --jd-fin-up: var(--bm-up, var(--jd-color-success));
      --jd-fin-down: var(--bm-down, var(--jd-color-danger));
      --jd-fin-accent: var(--bm-accent, #14b8a6);
      --jd-fin-accent-strong: var(--bm-accent-strong, #0d9488);
      --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
      --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
      --jd-fin-border: var(--bm-border, var(--jd-color-border));
      --jd-fin-card: var(--bm-card, var(--jd-color-card));
      --jd-fin-soft: var(
        --bm-soft-100,
        color-mix(in srgb, var(--jd-color-foreground) 6%, transparent)
      );
      --jd-fin-warning: var(--bm-warning, var(--jd-color-warning));
    }

    jd-theme-drill-down > .jd-modal__panel {
      width: 560px;
      max-width: 95vw;
      max-height: 85vh;
      color: var(--jd-fin-text);
      font-variant-numeric: tabular-nums;
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28);
    }
    jd-theme-drill-down .jd-modal__panel * {
      box-sizing: border-box;
    }

    /* 헤더 */
    .jd-theme-drill-down__header {
      position: sticky;
      top: 0;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      padding: var(--jd-space-3) var(--jd-space-4);
      background: var(--jd-fin-card);
      border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    .jd-theme-drill-down__pill {
      font-size: 14px;
      font-weight: 800;
      padding: var(--jd-space-1) var(--jd-space-3);
      border-radius: var(--jd-radius-full);
      background: color-mix(in srgb, var(--jd-fin-accent) 12%, transparent);
      color: var(--jd-fin-accent-strong);
      border: var(--jd-border-thin) solid color-mix(in srgb, var(--jd-fin-accent) 32%, transparent);
    }
    .jd-theme-drill-down__title {
      font-size: 13px;
      font-weight: 800;
      margin-inline-start: var(--jd-space-1);
    }
    .jd-theme-drill-down__close {
      margin-inline-start: auto;
      width: 32px;
      height: 32px;
      padding: 0;
      display: inline-grid;
      place-items: center;
      border: 0;
      border-radius: var(--jd-radius-full);
      background: var(--jd-fin-soft);
      color: var(--jd-fin-muted);
      cursor: pointer;
      transition: filter var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-theme-drill-down__close:hover {
      filter: brightness(0.94);
    }
    .jd-theme-drill-down__close:focus-visible {
      outline: var(--jd-border-medium) solid var(--jd-fin-accent-strong);
      outline-offset: 1px;
    }

    .jd-theme-drill-down__empty {
      padding: var(--jd-space-6);
      text-align: center;
      font-size: 12px;
      color: var(--jd-fin-muted);
    }

    /* 통계 4칸 */
    .jd-theme-drill-down__stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--jd-space-2);
      padding: var(--jd-space-4);
    }
    .jd-theme-drill-down__stat {
      padding: var(--jd-space-2) var(--jd-space-2-5);
      border-radius: var(--jd-radius-xl);
      background: var(--jd-fin-soft);
      border: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    .jd-theme-drill-down__stat-label {
      font-size: 10px;
      font-weight: 800;
      color: var(--jd-fin-muted);
    }
    .jd-theme-drill-down__stat-value {
      margin-top: var(--jd-space-0-5);
      font-size: 13px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: var(--jd-fin-text);
    }
    .jd-theme-drill-down__stat-value[data-dir="up"] {
      color: var(--jd-fin-up);
    }
    .jd-theme-drill-down__stat-value[data-dir="down"] {
      color: var(--jd-fin-down);
    }

    /* 섹션 */
    .jd-theme-drill-down__section {
      padding: 0 var(--jd-space-4) var(--jd-space-4);
    }
    .jd-theme-drill-down__section-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.05em;
      margin-block-end: var(--jd-space-2);
      color: var(--jd-fin-muted);
    }
    .jd-theme-drill-down__list {
      list-style: none;
      margin: 0;
      padding: 0;
      border: var(--jd-border-thin) solid var(--jd-fin-border);
      border-radius: var(--jd-radius-xl);
      overflow: hidden;
    }

    /* 등장 일자 행 */
    .jd-theme-drill-down__day {
      display: grid;
      grid-template-columns: 70px 1fr auto;
      align-items: center;
      gap: var(--jd-space-2);
      padding: var(--jd-space-2) var(--jd-space-3);
      border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    .jd-theme-drill-down__day:nth-child(even) {
      background: var(--jd-fin-soft);
    }
    .jd-theme-drill-down__day:last-child {
      border-block-end: 0;
    }
    .jd-theme-drill-down__date {
      font-size: 12px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }
    .jd-theme-drill-down__chips {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--jd-space-1);
      min-width: 0;
    }
    .jd-theme-drill-down__chip {
      font-size: 9.5px;
      font-weight: 800;
      padding: 1px var(--jd-space-1-5);
      border-radius: var(--jd-radius-full);
      background: var(--jd-fin-soft);
      color: var(--jd-fin-muted);
      border: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    .jd-theme-drill-down__chip[data-current] {
      background: color-mix(in srgb, var(--jd-fin-accent) 18%, transparent);
      color: var(--jd-fin-accent-strong);
      border-color: color-mix(in srgb, var(--jd-fin-accent) 36%, transparent);
    }
    .jd-theme-drill-down__pct {
      font-size: 12px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }
    .jd-theme-drill-down__pct[data-dir="up"] {
      color: var(--jd-fin-up);
    }
    .jd-theme-drill-down__pct[data-dir="down"] {
      color: var(--jd-fin-down);
    }

    /* 왕관 종목 행 */
    .jd-theme-drill-down__leader {
      display: grid;
      grid-template-columns: auto 1fr auto auto;
      align-items: center;
      gap: var(--jd-space-2-5);
      padding: var(--jd-space-2) var(--jd-space-3);
      border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    .jd-theme-drill-down__leader:nth-child(even) {
      background: var(--jd-fin-soft);
    }
    .jd-theme-drill-down__leader:last-child {
      border-block-end: 0;
    }
    .jd-theme-drill-down__crown {
      color: var(--jd-fin-warning);
      flex-shrink: 0;
    }
    .jd-theme-drill-down__leader-name {
      font-size: 12.5px;
      font-weight: 800;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-theme-drill-down__leader-count {
      font-size: 10.5px;
      font-weight: var(--jd-weight-bold);
      color: var(--jd-fin-muted);
      font-variant-numeric: tabular-nums;
    }
    .jd-theme-drill-down__leader-nums {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      line-height: var(--jd-leading-tight);
    }
    .jd-theme-drill-down__leader-close {
      font-size: 12px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }
    .jd-theme-drill-down__leader-avg {
      font-size: 10.5px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }
    .jd-theme-drill-down__leader-avg[data-dir="up"] {
      color: var(--jd-fin-up);
    }
    .jd-theme-drill-down__leader-avg[data-dir="down"] {
      color: var(--jd-fin-down);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-theme-drill-down__close {
        transition: none;
      }
    }
  }
`;
