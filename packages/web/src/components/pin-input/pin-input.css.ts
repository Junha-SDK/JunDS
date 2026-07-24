/**
 * jd-pin-input CSS — v2 primitives/PinInput(w-10 h-12 · text-lg bold · rounded-lg)의
 * 시각을 --jd-* 토큰으로 번역. 채워진 칸 테두리는 v2 border-primary/40 →
 * color-mix 40%. 에러 흔들림은 v2 전역 .shake 대신 컴포넌트 로컬 keyframes.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-pin-input { display: inline-flex; align-items: center; gap: var(--jd-space-2); }

  .jd-pin-input__cell {
    box-sizing: border-box; width: 2.5rem; height: 3rem; margin: 0; padding: 0;
    text-align: center; font-family: var(--jd-font-sans);
    font-size: var(--jd-text-lg); font-weight: var(--jd-weight-bold);
    color: var(--jd-color-foreground); background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg); outline: none;
    transition: border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
                box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-pin-input__cell[data-filled] {
    border-color: color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
  }
  .jd-pin-input__cell:focus {
    border-color: var(--jd-color-primary); box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-pin-input__cell:disabled { opacity: var(--jd-opacity-50); cursor: not-allowed; }

  jd-pin-input[error] .jd-pin-input__cell {
    border-color: var(--jd-color-danger);
    animation: jd-pin-shake var(--jd-duration-slow) var(--jd-easing-ease-in-out);
  }
  jd-pin-input[error] .jd-pin-input__cell:focus { box-shadow: var(--jd-shadow-focus-ring-danger); }

  @keyframes jd-pin-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-3px); }
    75% { transform: translateX(3px); }
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-pin-input__cell { transition: none; }
    jd-pin-input[error] .jd-pin-input__cell { animation: none; }
  }
}`;
