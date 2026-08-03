/**
 * jd-date-input 컴포넌트 CSS.
 * v2 ds/composites/DateInput의 relative 래퍼 + `w-full h-9 px-3 text-sm border bg-white
 * rounded-lg` 입력 + focus 글로우 + error border + 우측 8 지우기 버튼을 --jd-* 토큰으로
 * 의미 번역. 지우기 버튼의 right:2rem은 네이티브 달력 아이콘을 비켜 앉히는 v2 기하 그대로.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-date-input {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-1-5);
    }

    .jd-date-input__label {
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-medium);
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }
    .jd-date-input__label[hidden] {
      display: none;
    }
    jd-date-input[required] > .jd-date-input__label::after {
      content: "*";
      margin-inline-start: var(--jd-space-0-5);
      color: var(--jd-color-danger);
    }

    .jd-date-input__input {
      width: 100%;
      box-sizing: border-box;
      margin: 0;
      height: 2.25rem;
      padding-inline: var(--jd-space-3);
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-md);
      color: var(--jd-color-foreground);
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-lg);
      transition: border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-date-input__input:focus {
      outline: none;
      border-color: var(--jd-color-primary);
      box-shadow: var(--jd-shadow-focus-ring);
    }
    .jd-date-input__input:disabled {
      opacity: var(--jd-opacity-50);
      cursor: not-allowed;
      background: var(--jd-color-card-hover);
    }
    /* 네이티브 달력 아이콘 — 다크 테마에서 검은 아이콘이 묻히는 것만 보정 */
    .jd-date-input__input::-webkit-calendar-picker-indicator {
      cursor: pointer;
    }

    jd-date-input[error] > .jd-date-input__input {
      border-color: var(--jd-color-danger);
    }
    jd-date-input[error] > .jd-date-input__input:focus {
      border-color: var(--jd-color-danger);
      box-shadow: var(--jd-shadow-focus-ring-danger);
    }

    .jd-date-input__clear {
      position: absolute;
      inset-inline-end: 2rem;
      bottom: 0.5rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      padding: 0;
      color: var(--jd-color-muted);
      background: none;
      border: 0;
      border-radius: var(--jd-radius-sm);
      cursor: pointer;
      transition: color var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-date-input__clear:hover {
      color: var(--jd-color-foreground);
    }
    .jd-date-input__clear:focus-visible {
      outline: none;
      color: var(--jd-color-foreground);
      box-shadow: var(--jd-shadow-focus-ring);
    }
    .jd-date-input__clear[hidden] {
      display: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-date-input__input,
      .jd-date-input__clear {
        transition: none;
      }
    }
  }
`;
