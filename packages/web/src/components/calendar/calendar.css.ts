/**
 * jd-calendar CSS — v2 patterns/Calendar(DsCalendar) 표면 의미 번역.
 * v2 값: 컨테이너 `rounded-2xl border bg-white shadow-sm p-4`, 월 버튼 `text-lg
 * font-semibold hover:text-primary`, 오늘 버튼=ghost xs, 뷰토글 `bg-gray-100
 * rounded-lg p-0.5`(활성=bg-white shadow-sm), 화살표 `w-8 h-8`, 요일 `text-xs
 * font-semibold`(일=danger·토=blue-500), 셀 `min-h-[80px] p-1.5 rounded-lg`,
 * 빈칸 `bg-gray-50/30`, 범위밴드 `bg-primary-light`, 숫자 `w-6 h-6 rounded-full`
 * (오늘=primary bold, 선택=bg-primary text-white), 칩 `text-[10px] rounded px-1`,
 * 팝오버 `w-[260px] border rounded-xl shadow-lg p-3`.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.base {
    jd-calendar:not(:defined) {
      display: none;
    }
  }
  @layer junds.components {
    jd-calendar {
      display: block;
      font-family: var(--jd-font-sans);
    }

    .jd-cal {
      box-sizing: border-box; /* width:100% + padding + border — 안 그러면 호스트를 넘쳐 가로 스크롤 */
      width: 100%;
      border-radius: var(--jd-radius-2xl);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
      box-shadow: var(--jd-shadow-sm);
      padding: var(--jd-space-4);
    }

    /* ── 헤더 ── */
    .jd-cal__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--jd-space-3);
      padding: 0 var(--jd-space-1);
    }
    .jd-cal__header-left {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
    }
    .jd-cal__month-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1);
      border: 0;
      background: transparent;
      padding: var(--jd-space-0-5) var(--jd-space-1);
      border-radius: var(--jd-radius-lg);
      font-size: var(--jd-text-lg);
      font-weight: var(--jd-weight-semibold);
      color: var(--jd-color-foreground);
      cursor: pointer;
      transition: color var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-cal__month-btn:hover {
      color: var(--jd-color-primary-ink);
    }
    .jd-cal__month-btn:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }
    .jd-cal__caret {
      width: 0.75rem;
      height: 0.75rem;
      transition: transform var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    .jd-cal__month-btn[aria-expanded="true"] .jd-cal__caret {
      transform: rotate(180deg);
    }

    .jd-cal__today {
      border: 0;
      background: transparent;
      padding: var(--jd-space-1) var(--jd-space-2);
      border-radius: var(--jd-radius-md);
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-medium);
      color: var(--jd-color-muted);
      cursor: pointer;
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-cal__today:hover {
      background: color-mix(in srgb, var(--jd-color-muted) 12%, transparent);
      color: var(--jd-color-foreground);
    }
    .jd-cal__today:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    .jd-cal__header-right {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1);
    }
    .jd-cal__view-toggle {
      display: flex;
      align-items: center;
      gap: var(--jd-space-0-5);
      background: color-mix(in srgb, var(--jd-color-muted) 12%, transparent);
      border-radius: var(--jd-radius-lg);
      padding: var(--jd-space-0-5);
      margin-right: var(--jd-space-2);
    }
    .jd-cal__view-tab {
      border: 0;
      background: transparent;
      padding: var(--jd-space-1) var(--jd-space-2);
      border-radius: var(--jd-radius-md);
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
      cursor: pointer;
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out),
        color var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-cal__view-tab[data-active] {
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
      font-weight: var(--jd-weight-medium);
      box-shadow: var(--jd-shadow-sm);
    }
    .jd-cal__view-tab:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    .jd-cal__arrow {
      width: 2rem;
      height: 2rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      background: transparent;
      border-radius: var(--jd-radius-md);
      color: var(--jd-color-foreground);
      cursor: pointer;
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-cal__arrow > svg {
      width: 0.875rem;
      height: 0.875rem;
    }
    .jd-cal__arrow:hover {
      background: color-mix(in srgb, var(--jd-color-muted) 12%, transparent);
    }
    .jd-cal__arrow:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    /* ── 월 선택 팝오버 ── */
    .jd-cal__picker {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: var(--jd-space-1);
      z-index: var(--jd-z-dropdown);
      width: 16.25rem;
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      box-shadow: var(--jd-shadow-lg);
      padding: var(--jd-space-3);
    }
    .jd-cal__picker[hidden] {
      display: none;
    }
    .jd-cal__picker-yearrow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--jd-space-3);
    }
    .jd-cal__picker-arrow {
      width: 1.75rem;
      height: 1.75rem;
    }
    .jd-cal__picker-year {
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-semibold);
      color: var(--jd-color-foreground);
    }
    .jd-cal__picker-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: var(--jd-space-1);
    }
    .jd-cal__picker-month {
      border: 0;
      background: transparent;
      padding: var(--jd-space-1-5) 0;
      border-radius: var(--jd-radius-lg);
      font-size: var(--jd-text-xs);
      color: var(--jd-color-foreground);
      cursor: pointer;
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-cal__picker-month:hover {
      background: color-mix(in srgb, var(--jd-color-muted) 12%, transparent);
    }
    .jd-cal__picker-month[data-current] {
      background: var(--jd-color-primary);
      color: #fff;
    }
    .jd-cal__picker-month:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    /* ── 요일 헤더 ── */
    .jd-cal__weekdays {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      margin-bottom: var(--jd-space-1);
      border-bottom: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-color-border) 50%, transparent);
      padding-bottom: var(--jd-space-1);
    }
    .jd-cal__weekday {
      text-align: center;
      padding: var(--jd-space-1-5) 0;
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-semibold);
      letter-spacing: var(--jd-tracking-wide);
      color: var(--jd-color-muted);
    }
    .jd-cal__weekday[data-sun] {
      color: var(--jd-color-danger);
    }
    .jd-cal__weekday[data-sat] {
      color: var(--jd-color-info);
    }

    /* ── 그리드 ── */
    .jd-cal__grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: var(--jd-space-px);
    }
    .jd-cal__cell {
      position: relative;
      min-height: 5rem;
      padding: var(--jd-space-1-5);
      border-radius: var(--jd-radius-lg);
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-0-5);
      cursor: pointer;
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-cal__cell:hover {
      box-shadow: var(--jd-shadow-md);
      background: var(--jd-color-card);
    }
    .jd-cal__cell[data-empty] {
      cursor: default;
      background: color-mix(in srgb, var(--jd-color-muted) 6%, transparent);
      box-shadow: none;
    }
    .jd-cal__cell[data-in-range] {
      background: var(--jd-color-primary-light);
    }
    .jd-cal__cell[data-disabled] {
      opacity: var(--jd-opacity-40);
      cursor: not-allowed;
      box-shadow: none;
    }
    .jd-cal__cell[data-focus] {
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    }
    .jd-cal__cell:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    }

    .jd-cal__num {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: var(--jd-radius-full);
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-medium);
      color: var(--jd-color-foreground);
      font-variant-numeric: tabular-nums;
    }
    .jd-cal__cell[data-sun] > .jd-cal__num {
      color: var(--jd-color-danger);
    }
    .jd-cal__cell[data-sat] > .jd-cal__num {
      color: var(--jd-color-info);
    }
    .jd-cal__cell[data-today] > .jd-cal__num {
      color: var(--jd-color-primary-ink);
      font-weight: var(--jd-weight-bold);
    }
    .jd-cal__cell[data-selected] > .jd-cal__num {
      background: var(--jd-color-primary);
      color: #fff;
      font-weight: var(--jd-weight-semibold);
    }

    .jd-cal__cell-events {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-0-5);
      overflow: hidden;
    }
    .jd-cal__chip {
      border-radius: var(--jd-radius-sm);
      padding: 0.0625rem var(--jd-space-1);
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-medium);
      line-height: var(--jd-leading-snug);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      background: var(--jd-color-primary-light);
      color: var(--jd-color-primary-ink);
    }
    .jd-cal__chip-meta {
      opacity: var(--jd-opacity-70);
      margin-right: var(--jd-space-0-5);
    }

    .jd-cal__dots {
      display: flex;
      align-items: center;
      gap: var(--jd-space-0-5);
      flex-wrap: wrap;
    }
    .jd-cal__dot {
      width: 0.375rem;
      height: 0.375rem;
      border-radius: var(--jd-radius-full);
      flex-shrink: 0;
    }
    .jd-cal__dots-more {
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted-light);
    }
  }
`;
