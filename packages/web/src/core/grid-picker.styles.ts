/**
 * JdGridPicker 공용 CSS 조각 — `css` 태그가 아니라 **평문 문자열**이다.
 * 이유는 core/picker-field.styles.ts 주석과 동일(컴포넌트별 dist/css/*.css 자기완결).
 * 호출부는 `@layer junds.components { ${GRID_PICKER_CSS} … }` 안에 넣는다.
 *
 * v2 MonthPicker/YearPicker의 `inline-block rounded-lg border border-border bg-surface p-3
 * select-none` 카드 + `w-8 h-8 rounded-md hover:bg-surface-soft` 네비 + `grid-cols-3 gap-1
 * w-[200px]` 격자 + `px-2 py-2 text-sm rounded-md` 셀을 --jd-* 토큰으로 의미 번역.
 * v2의 `bg-surface`/`bg-surface-soft`는 v3 토큰에서 다크 표면값이라 그대로 쓰면 라이트
 * 테마에서 검은 카드가 된다 — 의미상 등가인 card/card-hover로 옮겼다(DEC-027 계열 판단).
 */
export const GRID_PICKER_CSS = `
  [data-jd-grid-picker] {
    display: inline-block; box-sizing: border-box;
    padding: var(--jd-space-3);
    font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    user-select: none;
  }

  .jd-grid-picker__header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: var(--jd-space-3);
  }
  .jd-grid-picker__label {
    font-size: var(--jd-text-md); font-weight: var(--jd-weight-semibold);
  }
  .jd-grid-picker__nav {
    display: inline-flex; align-items: center; justify-content: center;
    width: 2rem; height: 2rem; padding: 0;
    color: inherit; background: none; border: 0;
    border-radius: var(--jd-radius-md); cursor: pointer;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-grid-picker__nav:hover:not(:disabled) { background: var(--jd-color-card-hover); }
  .jd-grid-picker__nav:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }
  .jd-grid-picker__nav:disabled { opacity: var(--jd-opacity-40); cursor: not-allowed; }

  .jd-grid-picker__grid {
    display: grid; gap: var(--jd-space-1); width: 12.5rem;
  }
  .jd-grid-picker__cell {
    padding: var(--jd-space-2); margin: 0;
    font-family: inherit; font-size: var(--jd-text-md);
    color: var(--jd-color-foreground); background: none; border: 0;
    border-radius: var(--jd-radius-md); cursor: pointer;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-grid-picker__cell:hover:not(:disabled) { background: var(--jd-color-card-hover); }
  .jd-grid-picker__cell:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }
  .jd-grid-picker__cell[aria-pressed="true"] {
    color: #fff; background: var(--jd-color-primary);
  }
  .jd-grid-picker__cell[aria-pressed="true"]:hover:not(:disabled) {
    background: var(--jd-color-primary-hover);
  }
  .jd-grid-picker__cell:disabled {
    opacity: var(--jd-opacity-30); cursor: not-allowed; background: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-grid-picker__nav, .jd-grid-picker__cell { transition: none; }
  }
`;
