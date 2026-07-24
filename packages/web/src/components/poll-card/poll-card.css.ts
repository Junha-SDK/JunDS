import { css } from "../../core/styles.js";

/**
 * v2 값: 카드 `rounded-xl border border-border bg-surface p-4`, 질문 text-sm semibold,
 * 옵션 `rounded-md border px-3 py-2`(선택=border-primary bg-primary/5, 미선택 hover=
 * border-primary/40), 결과 막대 absolute inset-y-0 left-0 transition-[width] 500ms
 * (내=primary/15 · 선두=amber-200/50 · 그외=gray-100), 수치 text-xs muted tabular,
 * 푸터 11px muted. gray/amber 리터럴은 border·warning 토큰으로 기계 번역(다크도 성립).
 */
export default css`
@layer junds.components {
  jd-poll-card {
    display: block; box-sizing: border-box;
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    background: var(--jd-color-card);
    padding: var(--jd-space-4);
    font-family: var(--jd-font-sans);
  }

  .jd-poll-card__question {
    margin: 0; font-size: var(--jd-text-md);
    font-weight: var(--jd-weight-semibold); color: var(--jd-color-foreground);
  }

  .jd-poll-card__options {
    list-style: none; margin: var(--jd-space-3) 0 0; padding: 0;
    display: flex; flex-direction: column; gap: var(--jd-space-2);
  }

  .jd-poll-card__option {
    position: relative; width: 100%; overflow: hidden;
    box-sizing: border-box; text-align: left; cursor: pointer;
    padding: var(--jd-space-2) var(--jd-space-3);
    font-family: inherit; font-size: var(--jd-text-md);
    color: var(--jd-color-foreground);
    background: transparent;
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-md);
    transition:
      border-color var(--jd-duration-normal) var(--jd-easing-default),
      background-color var(--jd-duration-normal) var(--jd-easing-default);
  }
  .jd-poll-card__option:hover:not(:disabled) {
    border-color: color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
  }
  .jd-poll-card__option:disabled { cursor: default; }
  .jd-poll-card__option[aria-pressed="true"] {
    border-color: var(--jd-color-primary);
    background: color-mix(in srgb, var(--jd-color-primary) 5%, transparent);
  }
  .jd-poll-card__option:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring);
  }

  .jd-poll-card__bar {
    position: absolute; inset-block: 0; inset-inline-start: 0;
    background: color-mix(in srgb, var(--jd-color-border) 60%, transparent);
    transition: width var(--jd-duration-slower) var(--jd-easing-default);
  }
  .jd-poll-card__bar[hidden] { display: none; }
  .jd-poll-card__option[data-top] .jd-poll-card__bar {
    background: color-mix(in srgb, var(--jd-color-warning) 25%, transparent);
  }
  .jd-poll-card__option[aria-pressed="true"] .jd-poll-card__bar {
    background: color-mix(in srgb, var(--jd-color-primary) 15%, transparent);
  }

  .jd-poll-card__row {
    position: relative; display: flex; align-items: center;
    justify-content: space-between; gap: var(--jd-space-2);
  }
  .jd-poll-card__label {
    display: inline-flex; align-items: center; gap: var(--jd-space-2); min-width: 0;
  }
  .jd-poll-card__label-text { min-width: 0; }
  .jd-poll-card__check { flex-shrink: 0; color: var(--jd-color-primary); }
  .jd-poll-card__check[hidden] { display: none; }
  .jd-poll-card__pct {
    flex-shrink: 0; font-size: var(--jd-text-xs);
    color: var(--jd-color-muted); font-variant-numeric: tabular-nums;
  }
  .jd-poll-card__pct[hidden] { display: none; }

  .jd-poll-card__footer {
    display: flex; align-items: center; justify-content: space-between;
    margin-block-start: var(--jd-space-3);
    font-size: 11px; color: var(--jd-color-muted);
  }
  .jd-poll-card__closes[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .jd-poll-card__option, .jd-poll-card__bar { transition: none; }
  }
}`;
