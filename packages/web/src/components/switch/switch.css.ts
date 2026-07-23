import { css } from "../../core/styles.js";

/**
 * v2 값: 트랙 sm 36×20 / md 44×24 / lg 56×28, 썸 14/18/22px(수직 중앙·left 3px),
 * 이동 16/20/28px, shadow-md, 호버 brightness 1.1.
 */
export default css`
@layer junds.components {
  jd-switch { display: inline-flex; }

  .jd-switch {
    display: inline-flex; align-items: center; gap: var(--jd-space-2);
    cursor: pointer; user-select: none; font-family: var(--jd-font-sans);
  }
  jd-switch[disabled] > .jd-switch { opacity: var(--jd-opacity-50); cursor: not-allowed; }

  .jd-switch__track {
    position: relative; display: inline-flex; flex-shrink: 0;
    border: 0; margin: 0; padding: 0; cursor: inherit;
    border-radius: var(--jd-radius-full);
    background: #d1d5db;
    transition: background-color var(--jd-duration-normal) var(--jd-easing-ease-out);
    width: 2.75rem; height: 1.5rem; /* md 기본 44×24 */
  }
  jd-switch[checked] .jd-switch__track { background: var(--jd-color-primary); }
  .jd-switch__track:hover { filter: brightness(1.1); }
  .jd-switch__track:focus-visible {
    outline: var(--jd-border-medium) solid
      color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    outline-offset: 2px;
  }

  .jd-switch__thumb {
    position: absolute; top: 50%; left: 3px; translate: 0 -50%;
    width: 1.125rem; height: 1.125rem; /* md 18px */
    border-radius: var(--jd-radius-full);
    background: #fff; box-shadow: var(--jd-shadow-md);
    transition: transform var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  jd-switch[checked] .jd-switch__thumb { transform: translateX(20px); }

  jd-switch[size="sm"] .jd-switch__track { width: 2.25rem; height: 1.25rem; } /* 36×20 */
  jd-switch[size="sm"] .jd-switch__thumb { width: 0.875rem; height: 0.875rem; } /* 14px */
  jd-switch[size="sm"][checked] .jd-switch__thumb { transform: translateX(16px); }

  jd-switch[size="lg"] .jd-switch__track { width: 3.5rem; height: 1.75rem; } /* 56×28 */
  jd-switch[size="lg"] .jd-switch__thumb { width: 1.375rem; height: 1.375rem; } /* 22px */
  jd-switch[size="lg"][checked] .jd-switch__thumb { transform: translateX(28px); }

  .jd-switch__text { font-size: var(--jd-text-md); color: var(--jd-color-foreground); }
  .jd-switch__text[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .jd-switch__track, .jd-switch__thumb { transition: none; }
  }
}`;
