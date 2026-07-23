import { css } from "../../core/styles.js";

/**
 * v2 값: gap 8px, 세로 기본/가로 wrap, 라디오 sm 14px / md 16px accent primary,
 * 라벨 xs/sm(→--jd-text-xs·md), 행 disabled 50%.
 */
export default css`
@layer junds.components {
  jd-radio-group { display: flex; flex-direction: column; gap: var(--jd-space-2); }
  jd-radio-group[direction="horizontal"] { flex-direction: row; flex-wrap: wrap; }

  .jd-radio-group__item {
    display: inline-flex; align-items: center; gap: var(--jd-space-2);
    cursor: pointer; user-select: none;
    font-family: var(--jd-font-sans);
  }
  .jd-radio-group__item[data-disabled] {
    opacity: var(--jd-opacity-50); cursor: not-allowed;
  }

  .jd-radio-group__input {
    appearance: auto; margin: 0; cursor: inherit;
    width: 1rem; height: 1rem;
    accent-color: var(--jd-color-primary);
  }
  .jd-radio-group__input:focus-visible {
    outline: var(--jd-border-medium) solid
      color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    outline-offset: 1px;
  }
  jd-radio-group[size="sm"] .jd-radio-group__input { width: 0.875rem; height: 0.875rem; }

  .jd-radio-group__label { color: var(--jd-color-foreground); font-size: var(--jd-text-md); }
  jd-radio-group[size="sm"] .jd-radio-group__label { font-size: var(--jd-text-xs); }
}`;
