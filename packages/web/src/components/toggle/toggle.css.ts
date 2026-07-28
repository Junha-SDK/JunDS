import { css } from "../../core/styles.js";

/**
 * jd-toggle 시각 (DEC-039 — switch와 동일 어휘, 기하만 한 급 작다).
 * 트랙 sm 32×18 / md 40×22, 썸 14/16px(top·left 2px), 이동 14/18px.
 */
export default css`
  @layer junds.components {
    jd-toggle {
      display: inline-flex;
    }

    .jd-toggle {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-2);
      cursor: pointer;
      user-select: none;
      font-family: var(--jd-font-sans);
    }
    /* disabled — 반투명은 트랙·썸만, 라벨은 muted 실색 (AA, DEC-027) */
    jd-toggle[disabled] > .jd-toggle {
      cursor: not-allowed;
    }
    jd-toggle[disabled] .jd-toggle__track {
      opacity: var(--jd-opacity-50);
    }
    jd-toggle[disabled] .jd-toggle__text {
      color: var(--jd-color-muted);
    }

    .jd-toggle__track {
      position: relative;
      display: inline-flex;
      flex-shrink: 0;
      border: 0;
      margin: 0;
      padding: 0;
      cursor: inherit;
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-control-track-strong);
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
      transition: background-color var(--jd-duration-normal) var(--jd-easing-ease-out);
      width: 2.5rem;
      height: 1.375rem; /* md 기본 40×22 */
    }
    jd-toggle[checked] .jd-toggle__track {
      background: var(--jd-color-primary);
      box-shadow: inset 0 1px 0 var(--jd-color-highlight);
    }
    .jd-toggle__track:hover:not(:disabled) {
      background: var(--jd-color-neutral-400);
    }
    jd-toggle[checked] .jd-toggle__track:hover:not(:disabled) {
      background: var(--jd-color-primary-hover);
    }
    .jd-toggle__track:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    .jd-toggle__thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 1rem;
      height: 1rem; /* md 16px */
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-control-knob);
      box-shadow: var(--jd-shadow-knob);
      transition: transform var(--jd-duration-normal) var(--jd-easing-overshoot);
    }
    jd-toggle[checked] .jd-toggle__thumb {
      transform: translateX(18px);
    }

    jd-toggle[size="sm"] .jd-toggle__track {
      width: 2rem;
      height: 1.125rem;
    } /* 32×18 */
    jd-toggle[size="sm"] .jd-toggle__thumb {
      width: 0.875rem;
      height: 0.875rem;
    } /* 14px */
    jd-toggle[size="sm"][checked] .jd-toggle__thumb {
      transform: translateX(14px);
    }

    .jd-toggle__text {
      font-size: var(--jd-text-md);
      color: var(--jd-color-foreground);
    }
    .jd-toggle__text[hidden] {
      display: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-toggle__track,
      .jd-toggle__thumb {
        transition: none;
      }
    }
  }
`;
