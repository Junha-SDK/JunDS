import { css } from "../../core/styles.js";

/**
 * v2 값(기계 번역): pill = px-3 py-1.5 rounded-full text-[12px] font-extrabold.
 * 활성 = accent-soft 배경 + accent-strong 글자 + accent 30% 테두리.
 * 비활성 = soft-100 배경 + text 글자 + border 테두리.
 */
export default css`
@layer junds.components {
  jd-chart-range-picker {
    display: flex; align-items: center; flex-wrap: wrap; gap: 6px;
    font-family: var(--jd-font-sans);
    --_accent: var(--jd-fin-accent, #14b8a6);
    --_accent-strong: var(--jd-fin-accent-strong, #0d9488);
    --_soft: var(--jd-fin-soft-100, var(--jd-color-neutral-100));
    --_text: var(--jd-fin-text, var(--jd-color-foreground));
    --_border: var(--jd-fin-border, var(--jd-color-border));
  }

  .jd-chart-range-picker__pill {
    appearance: none; margin: 0;
    padding: 6px 12px;
    border-radius: var(--jd-radius-full);
    font-size: 12px; font-weight: 800; line-height: 1;
    font-family: inherit; cursor: pointer;
    background: var(--_soft);
    color: var(--_text);
    border: 1px solid var(--_border);
    transition:
      background var(--jd-duration-fast, 150ms) var(--jd-easing-ease-out),
      color var(--jd-duration-fast, 150ms) var(--jd-easing-ease-out),
      border-color var(--jd-duration-fast, 150ms) var(--jd-easing-ease-out);
  }
  .jd-chart-range-picker__pill:hover {
    background: color-mix(in srgb, var(--_accent) 8%, var(--_soft));
  }
  .jd-chart-range-picker__pill[data-active] {
    background: color-mix(in srgb, var(--_accent) 12%, transparent);
    color: var(--_accent-strong);
    border-color: color-mix(in srgb, var(--_accent) 30%, transparent);
  }
  .jd-chart-range-picker__pill:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--_accent) 55%, transparent);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-chart-range-picker__pill { transition: none; }
  }
}`;
