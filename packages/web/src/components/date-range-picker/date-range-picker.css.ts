/**
 * jd-date-range-picker 컴포넌트 CSS.
 * v2 ds/composites/DateRangePicker의 트리거(h-9·border·rounded-lg·focus 글로우),
 * 패널(shadow-lg·p-4·2개월 flex gap-4), 달력(w-64·h-8 셀·grid-cols-7),
 * 범위 표현(bg-primary/10 · 양끝 bg-primary text-white · 오늘 굵은 primary)을
 * --jd-* 토큰으로 의미 번역했다.
 *
 * PICKER_FIELD_CSS 보간 근거는 core/picker-field.styles.ts 주석 참조
 * (컴포넌트별 dist/css/*.css를 자기완결로 유지하기 위한 의도된 중복).
 */
import { css } from "../../core/styles.js";
import { PICKER_FIELD_CSS } from "../../core/picker-field.styles.js";

export default css`
@layer junds.components {
${PICKER_FIELD_CSS}

  jd-date-range-picker > .jd-picker-field__panel { padding: var(--jd-space-4); }

  .jd-date-range-picker__nav {
    display: flex; align-items: center; margin-bottom: var(--jd-space-3);
  }
  .jd-date-range-picker__nav-spacer { flex: 1; }
  .jd-date-range-picker__nav-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 1.75rem; height: 1.75rem; padding: 0;
    color: var(--jd-color-foreground); background: none; border: 0;
    border-radius: var(--jd-radius-sm); cursor: pointer;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-date-range-picker__nav-btn:hover { background: var(--jd-color-card-hover); }
  .jd-date-range-picker__nav-btn:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring);
  }

  .jd-date-range-picker__months { display: flex; gap: var(--jd-space-4); }

  .jd-date-range-picker__calendar {
    border-collapse: collapse; table-layout: fixed; width: 16rem;
  }
  .jd-date-range-picker__caption {
    caption-side: top; margin-bottom: var(--jd-space-2);
    font-size: var(--jd-text-md); font-weight: var(--jd-weight-medium);
    color: var(--jd-color-foreground); text-align: center;
  }
  .jd-date-range-picker__calendar th {
    height: 1.75rem; padding: 0; font-weight: var(--jd-weight-normal);
    font-size: var(--jd-text-xs); color: var(--jd-color-muted);
  }
  .jd-date-range-picker__calendar th abbr {
    text-decoration: none; border: 0; cursor: default;
  }
  .jd-date-range-picker__calendar td { padding: 0; }

  .jd-date-range-picker__day {
    display: block; width: 100%; height: 2rem; padding: 0;
    font-family: inherit; font-size: var(--jd-text-md);
    color: var(--jd-color-foreground); background: none; border: 0;
    border-radius: var(--jd-radius-md); cursor: pointer;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-date-range-picker__day:hover:not(:disabled) { background: var(--jd-color-card-hover); }
  .jd-date-range-picker__day:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-date-range-picker__day:disabled {
    opacity: var(--jd-opacity-30); cursor: not-allowed;
  }

  /* v2: 오늘 = font-bold text-primary (양끝일 때는 양끝 표현이 이긴다) */
  .jd-date-range-picker__day[data-today] {
    font-weight: var(--jd-weight-bold); color: var(--jd-color-primary);
  }
  /* v2: 범위 안 = bg-primary/10 — 사이 날짜는 모서리를 붙여 띠로 읽히게 한다 */
  .jd-date-range-picker__day[data-in-range] {
    background: color-mix(in srgb, var(--jd-color-primary) 10%, transparent);
    border-radius: 0;
  }
  .jd-date-range-picker__day[data-range-start],
  .jd-date-range-picker__day[data-range-end] {
    font-weight: var(--jd-weight-medium);
    color: #fff; background: var(--jd-color-primary);
  }
  .jd-date-range-picker__day[data-range-start]:hover,
  .jd-date-range-picker__day[data-range-end]:hover {
    background: var(--jd-color-primary-hover);
  }

  /* 달 이동 통지 — 시각적으로만 숨긴다(디스플레이 none은 읽히지 않는다) */
  .jd-date-range-picker__status {
    position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  @media (max-width: 480px) {
    .jd-date-range-picker__months { flex-direction: column; }
  }
  @media (prefers-reduced-motion: reduce) {
    .jd-date-range-picker__day,
    .jd-date-range-picker__nav-btn { transition: none; }
  }
}`;
