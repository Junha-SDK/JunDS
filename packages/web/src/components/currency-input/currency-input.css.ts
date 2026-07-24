/**
 * jd-currency-input CSS — v2 primitives/CurrencyInput(size 3종 · focus 글로우)의 토큰 번역.
 * 금액은 자리수 정렬이 읽기 쉬워 tabular-nums 고정(v2 표기 대비 상위집합).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-currency-input { display: block; position: relative; }

  .jd-currency-input__input {
    width: 100%; box-sizing: border-box; margin: 0;
    font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    font-variant-numeric: tabular-nums;
    transition: all var(--jd-duration-fast) var(--jd-easing-ease-out);
    height: 2.25rem; font-size: var(--jd-text-sm);
    padding-inline: var(--jd-space-3); border-radius: var(--jd-radius-lg);
  }
  .jd-currency-input__input::placeholder { color: var(--jd-color-muted); }
  .jd-currency-input__input:focus {
    outline: none; border-color: var(--jd-color-primary);
    box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-currency-input__input:disabled { opacity: var(--jd-opacity-50); cursor: not-allowed; }

  jd-currency-input[error] .jd-currency-input__input { border-color: var(--jd-color-danger); }
  jd-currency-input[error] .jd-currency-input__input:focus {
    box-shadow: var(--jd-shadow-focus-ring-danger);
  }

  jd-currency-input[size="sm"] .jd-currency-input__input {
    height: 2rem; font-size: var(--jd-text-xs);
    padding-inline: var(--jd-space-2-5); border-radius: var(--jd-radius-md);
  }
  jd-currency-input[size="lg"] .jd-currency-input__input {
    height: 2.75rem; font-size: var(--jd-text-md);
    padding-inline: var(--jd-space-4); border-radius: var(--jd-radius-xl);
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-currency-input__input { transition: none; }
  }
}`;
