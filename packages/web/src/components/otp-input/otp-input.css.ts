/**
 * jd-otp-input CSS — v2 primitives/OTPInput(w-11 h-13 · text-xl · border-2 ·
 * rounded-xl · focus scale-105 · 중앙 구분 막대)의 토큰 번역.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-otp-input {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1-5);
    }

    .jd-otp-input__separator {
      width: 0.75rem;
      height: 2px;
      margin-inline: var(--jd-space-1);
      background: var(--jd-color-border);
      border-radius: var(--jd-radius-full);
    }

    .jd-otp-input__cell {
      box-sizing: border-box;
      width: 2.75rem;
      height: 3.25rem;
      margin: 0;
      padding: 0;
      text-align: center;
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-xl);
      font-weight: var(--jd-weight-bold);
      color: var(--jd-color-foreground);
      background: var(--jd-color-card);
      border: var(--jd-border-medium) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      outline: none;
      transition: border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out),
        transform var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-otp-input__cell[data-filled] {
      border-color: color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    }
    .jd-otp-input__cell:focus {
      border-color: var(--jd-color-primary);
      box-shadow: var(--jd-shadow-focus-ring);
      transform: scale(1.05);
    }
    .jd-otp-input__cell:disabled {
      opacity: var(--jd-opacity-50);
      cursor: not-allowed;
    }

    jd-otp-input[error] .jd-otp-input__cell {
      border-color: var(--jd-color-danger);
      animation: jd-otp-shake var(--jd-duration-slow) var(--jd-easing-ease-in-out);
    }
    jd-otp-input[error] .jd-otp-input__cell:focus {
      box-shadow: var(--jd-shadow-focus-ring-danger);
    }

    @keyframes jd-otp-shake {
      0%,
      100% {
        transform: translateX(0);
      }
      25% {
        transform: translateX(-3px);
      }
      75% {
        transform: translateX(3px);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-otp-input__cell {
        transition: none;
      }
      .jd-otp-input__cell:focus {
        transform: none;
      }
      jd-otp-input[error] .jd-otp-input__cell {
        animation: none;
      }
    }
  }
`;
