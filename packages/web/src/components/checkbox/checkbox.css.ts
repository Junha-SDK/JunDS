import { css } from "../../core/styles.js";

/**
 * v2 값: 박스 sm 14px / md 16px, 라벨 xs/sm(→--jd-text-xs·md), accent primary,
 * disabled 50% + not-allowed.
 */
export default css`
@layer junds.components {
  jd-checkbox { display: inline-flex; }

  .jd-checkbox {
    display: inline-flex; align-items: center; gap: var(--jd-space-2);
    cursor: pointer; user-select: none;
    font-family: var(--jd-font-sans);
  }
  jd-checkbox[disabled] > .jd-checkbox {
    opacity: var(--jd-opacity-50); cursor: not-allowed;
  }

  .jd-checkbox__input {
    appearance: auto; margin: 0; cursor: inherit;
    width: 1rem; height: 1rem; /* md 기본 */
    accent-color: var(--jd-color-primary);
    border-radius: var(--jd-radius-sm);
  }
  .jd-checkbox__input:focus-visible {
    outline: var(--jd-border-medium) solid
      color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    outline-offset: 1px;
  }
  jd-checkbox[size="sm"] .jd-checkbox__input { width: 0.875rem; height: 0.875rem; }

  .jd-checkbox__label { color: var(--jd-color-foreground); font-size: var(--jd-text-md); }
  .jd-checkbox__label[hidden] { display: none; }
  jd-checkbox[size="sm"] .jd-checkbox__label { font-size: var(--jd-text-xs); }
}`;
