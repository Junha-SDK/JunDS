/**
 * jd-number-input CSS — v2 primitives/NumberInput의 시각을 --jd-* 토큰으로 번역.
 * v2: inline-flex 테두리 박스 + 좌우 27px 스텝 버튼, focus-within 글로우.
 * size는 v2 NumberInput 고유 스케일(h-8/h-9/h-11) — Input(32/40/48)과 다르다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-number-input {
    display: inline-flex; box-sizing: border-box; overflow: hidden;
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
  }
  jd-number-input:focus-within {
    border-color: var(--jd-color-primary); box-shadow: var(--jd-shadow-focus-ring);
  }
  jd-number-input[error] { border-color: var(--jd-color-danger); }
  jd-number-input[error]:focus-within { box-shadow: var(--jd-shadow-focus-ring-danger); }
  jd-number-input[disabled] { opacity: var(--jd-opacity-50); }

  .jd-number-input__step {
    display: flex; align-items: center; justify-content: center;
    width: 1.75rem; padding: 0; border: 0; background: none;
    color: var(--jd-color-muted); cursor: pointer;
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out),
                color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-number-input__step[hidden] { display: none; }
  .jd-number-input__step:hover:not(:disabled) {
    background: var(--jd-color-card-hover); color: var(--jd-color-foreground);
  }
  .jd-number-input__step:disabled { opacity: var(--jd-opacity-30); cursor: not-allowed; }
  /* v2: 좌 버튼은 오른쪽 구분선, 우 버튼은 왼쪽 구분선 */
  .jd-number-input__step[data-dir="-1"] { border-inline-end: var(--jd-border-thin) solid var(--jd-color-border); }
  .jd-number-input__step[data-dir="1"] { border-inline-start: var(--jd-border-thin) solid var(--jd-color-border); }

  .jd-number-input__input {
    width: 4rem; min-width: 0; margin: 0; padding: 0;
    border: 0; outline: none; background: transparent;
    text-align: center; font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground); font-variant-numeric: tabular-nums;
    /* 네이티브 스피너 제거 — 증감은 자체 버튼 (v2 [appearance:textfield]) */
    appearance: textfield; -moz-appearance: textfield;
    height: 2.25rem; font-size: var(--jd-text-sm);
  }
  .jd-number-input__input::-webkit-outer-spin-button,
  .jd-number-input__input::-webkit-inner-spin-button { appearance: none; margin: 0; }
  .jd-number-input__input:disabled { cursor: not-allowed; }

  jd-number-input[size="sm"] .jd-number-input__input { height: 2rem; font-size: var(--jd-text-xs); }
  jd-number-input[size="lg"] .jd-number-input__input { height: 2.75rem; font-size: var(--jd-text-md); }

  @media (prefers-reduced-motion: reduce) {
    .jd-number-input__step { transition: none; }
  }
}`;
