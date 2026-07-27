import { css } from "../../core/styles.js";

/**
 * v2 값: pill(px-3 h-9 rounded-full), gap 1.5, font-bold 12px. 비활성(count 0)은
 * bg var(--bm-soft-100)·글자 var(--bm-text-soft)·테두리 var(--bm-border);
 * 활성(count>0)은 bg var(--bm-accent-soft-bg)·글자 var(--bm-accent-strong)·
 * 테두리 var(--bm-accent). 카운트는 Badge size=sm variant=danger(틴트 red pill).
 *
 * 토큰 번역: accent 계열→--jd-color-primary(+glow soft), soft-100→muted 12% 틴트,
 * text-soft→--jd-color-muted, border→--jd-color-border, danger 배지→--jd-color-danger.
 */
export default css`
@layer junds.components {
  jd-alert-button { display: inline-flex; }
  button.jd-alert-button {
    position: relative; display: inline-flex; align-items: center;
    gap: var(--jd-space-1-5); height: 2.25rem; padding: 0 var(--jd-space-3);
    border-radius: var(--jd-radius-full);
    font-family: var(--jd-font-sans); font-weight: var(--jd-weight-bold);
    font-size: 12px; line-height: 1; white-space: nowrap; cursor: pointer;
    background: color-mix(in srgb, var(--jd-color-muted) 12%, transparent);
    color: var(--jd-color-muted);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    transition: background-color var(--jd-duration-fast) var(--jd-easing-default),
                color var(--jd-duration-fast) var(--jd-easing-default),
                border-color var(--jd-duration-fast) var(--jd-easing-default);
  }
  button.jd-alert-button[data-active] {
    background: color-mix(in srgb, var(--jd-color-primary) 12%, transparent);
    color: var(--jd-color-primary-ink);
    border-color: var(--jd-color-primary);
  }
  button.jd-alert-button:disabled { opacity: var(--jd-opacity-50); cursor: not-allowed; }
  button.jd-alert-button:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  .jd-alert-button__bell { font-size: 13px; line-height: 1; }

  /* Badge size=sm variant=danger 동형 — 틴트 red pill */
  .jd-alert-button__count {
    display: inline-flex; align-items: center; justify-content: center;
    padding: var(--jd-space-0-5) var(--jd-space-2);
    border-radius: var(--jd-radius-md);
    font-size: 10px; font-weight: var(--jd-weight-semibold);
    font-variant-numeric: tabular-nums;
    background: color-mix(in srgb, var(--jd-color-danger) 10%, transparent);
    color: color-mix(in srgb, var(--jd-color-danger) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward));
    box-shadow: 0 0 0 1px inset color-mix(in srgb, var(--jd-color-danger) 15%, transparent);
  }
  .jd-alert-button__count[hidden] { display: none; }
}`;
