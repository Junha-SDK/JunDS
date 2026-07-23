import { css } from "../../core/styles.js";

/**
 * v2 값: 트랙 sm 32×18 / md 40×22, 썸 14/16px(top·left 2px), 이동 14/18px,
 * 체크 primary / 미체크 gray-300(#d1d5db — v2 Tailwind gray, G2 gray 어휘 재심의).
 */
export default css`
@layer junds.components {
  jd-toggle { display: inline-flex; }

  .jd-toggle {
    display: inline-flex; align-items: center; gap: var(--jd-space-2);
    cursor: pointer; user-select: none; font-family: var(--jd-font-sans);
  }
  /* disabled — 반투명은 트랙·썸만, 라벨은 muted 실색 (AA, DEC-027) */
  jd-toggle[disabled] > .jd-toggle { cursor: not-allowed; }
  jd-toggle[disabled] .jd-toggle__track { opacity: var(--jd-opacity-50); }
  jd-toggle[disabled] .jd-toggle__text { color: var(--jd-color-muted); }

  .jd-toggle__track {
    position: relative; display: inline-flex; flex-shrink: 0;
    border: 0; margin: 0; padding: 0; cursor: inherit;
    border-radius: var(--jd-radius-full);
    background: #d1d5db;
    transition: background-color var(--jd-duration-normal) var(--jd-easing-ease-out);
    width: 2.5rem; height: 1.375rem; /* md 기본 40×22 */
  }
  jd-toggle[checked] .jd-toggle__track { background: var(--jd-color-primary); }
  .jd-toggle__track:focus-visible {
    outline: var(--jd-border-medium) solid
      color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    outline-offset: 1px;
  }

  .jd-toggle__thumb {
    position: absolute; top: 2px; left: 2px;
    width: 1rem; height: 1rem; /* md 16px */
    border-radius: var(--jd-radius-full);
    background: #fff; box-shadow: var(--jd-shadow-sm);
    transition: transform var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  jd-toggle[checked] .jd-toggle__thumb { transform: translateX(18px); }

  jd-toggle[size="sm"] .jd-toggle__track { width: 2rem; height: 1.125rem; } /* 32×18 */
  jd-toggle[size="sm"] .jd-toggle__thumb { width: 0.875rem; height: 0.875rem; } /* 14px */
  jd-toggle[size="sm"][checked] .jd-toggle__thumb { transform: translateX(14px); }

  .jd-toggle__text { font-size: var(--jd-text-md); color: var(--jd-color-foreground); }
  .jd-toggle__text[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .jd-toggle__track, .jd-toggle__thumb { transition: none; }
  }
}`;
