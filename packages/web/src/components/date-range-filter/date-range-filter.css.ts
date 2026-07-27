/**
 * jd-date-range-filter 컴포넌트 CSS.
 * v2 ds/composites/DateRangeFilter의 `space-y-2` 세로 간격, `flex flex-wrap items-center
 * gap-2` 입력 행, `h-9 px-3 border rounded-lg` 날짜 입력, `h-9 px-4 bg-primary text-white`
 * 조회 버튼, 고스트 초기화 버튼, `h-7 px-3 text-xs rounded-full` 프리셋 칩(활성 =
 * bg-primary text-white)을 --jd-* 토큰으로 의미 번역.
 * v2의 gray-100/gray-600은 v3 토큰에서 border-light / muted가 의미상 등가다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-date-range-filter {
    display: flex; flex-direction: column; gap: var(--jd-space-2);
    font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
  }

  .jd-date-range-filter__row {
    display: flex; flex-wrap: wrap; align-items: center; gap: var(--jd-space-2);
  }

  .jd-date-range-filter__input {
    box-sizing: border-box; height: 2.25rem; margin: 0;
    padding-inline: var(--jd-space-3);
    font-family: inherit; font-size: var(--jd-text-md); color: inherit;
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    transition: border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
                box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-date-range-filter__input:focus {
    outline: none; border-color: var(--jd-color-primary);
    box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-date-range-filter__input:disabled {
    opacity: var(--jd-opacity-50); cursor: not-allowed;
    background: var(--jd-color-card-hover);
  }

  .jd-date-range-filter__sep {
    font-size: var(--jd-text-md); color: var(--jd-color-muted);
  }

  .jd-date-range-filter__apply,
  .jd-date-range-filter__reset {
    box-sizing: border-box; height: 2.25rem; margin: 0;
    padding-inline: var(--jd-space-4);
    font-family: inherit; font-size: var(--jd-text-md);
    font-weight: var(--jd-weight-medium);
    border: 0; border-radius: var(--jd-radius-lg); cursor: pointer;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out),
                color var(--jd-duration-fast) var(--jd-easing-ease-out),
                scale var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-date-range-filter__apply {
    color: #fff; background: var(--jd-color-primary);
  }
  .jd-date-range-filter__apply:hover:not(:disabled) { background: var(--jd-color-primary-hover); }
  .jd-date-range-filter__apply:active:not(:disabled) { scale: .97; }

  .jd-date-range-filter__reset {
    color: var(--jd-color-muted); background: transparent;
  }
  .jd-date-range-filter__reset:hover:not(:disabled) {
    color: var(--jd-color-foreground); background: var(--jd-color-border-light);
  }
  .jd-date-range-filter__reset[hidden] { display: none; }

  .jd-date-range-filter__apply:focus-visible,
  .jd-date-range-filter__reset:focus-visible,
  .jd-date-range-filter__preset:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-date-range-filter__apply:disabled,
  .jd-date-range-filter__reset:disabled,
  .jd-date-range-filter__preset:disabled {
    opacity: var(--jd-opacity-50); cursor: not-allowed;
  }

  .jd-date-range-filter__presets {
    display: flex; flex-wrap: wrap; gap: var(--jd-space-1-5);
  }
  .jd-date-range-filter__presets[hidden] { display: none; }

  .jd-date-range-filter__preset {
    box-sizing: border-box; height: 1.75rem; margin: 0;
    padding-inline: var(--jd-space-3);
    font-family: inherit; font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-medium);
    color: var(--jd-color-muted); background: var(--jd-color-border-light);
    border: 0; border-radius: var(--jd-radius-full); cursor: pointer;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out),
                color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-date-range-filter__preset:hover:not(:disabled) {
    color: var(--jd-color-primary-ink); background: var(--jd-color-primary-light);
  }
  .jd-date-range-filter__preset[aria-pressed="true"] {
    color: #fff; background: var(--jd-color-primary);
  }
  .jd-date-range-filter__preset[aria-pressed="true"]:hover:not(:disabled) {
    color: #fff; background: var(--jd-color-primary-hover);
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-date-range-filter__input,
    .jd-date-range-filter__apply,
    .jd-date-range-filter__reset,
    .jd-date-range-filter__preset { transition: none; }
    .jd-date-range-filter__apply:active:not(:disabled) { scale: 1; }
  }
}`;
