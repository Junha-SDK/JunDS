import { css } from "../../core/styles.js";

/**
 * v2 시각 의미 번역: variant ghost/outline/filled × size xs 24 / sm 28 / md 32 / lg 40.
 * v2 Tailwind rounded-md/lg/xl(6/8/12px)는 --jd-radius-md/lg/xl과 값 일치 → var 참조.
 * v2 gray-100/200 호버는 jd-button ghost의 muted color-mix 관용구로 통일(G2 gray 어휘).
 */
export default css`
@layer junds.components {
  jd-icon-button { display: inline-flex; }

  .jd-icon-button {
    display: inline-flex; align-items: center; justify-content: center;
    border: 0; margin: 0; padding: 0; background: transparent;
    cursor: pointer; user-select: none;
    color: var(--jd-color-muted);
    transition: all var(--jd-duration-fast) var(--jd-easing-ease-out);
    /* size 기본 md — 32px */
    width: 2rem; height: 2rem; border-radius: var(--jd-radius-lg);
  }
  .jd-icon-button:hover {
    background: color-mix(in srgb, var(--jd-color-muted) 10%, transparent);
    color: var(--jd-color-foreground);
  }
  .jd-icon-button:active {
    background: color-mix(in srgb, var(--jd-color-muted) 16%, transparent);
  }
  .jd-icon-button:disabled { opacity: var(--jd-opacity-50); pointer-events: none; }
  .jd-icon-button:focus-visible {
    outline: var(--jd-border-medium) solid
      color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    outline-offset: 2px;
  }
  .jd-icon-button > svg { flex-shrink: 0; }

  jd-icon-button[size="xs"] > .jd-icon-button {
    width: 1.5rem; height: 1.5rem; border-radius: var(--jd-radius-md);
  }
  jd-icon-button[size="sm"] > .jd-icon-button {
    width: 1.75rem; height: 1.75rem; border-radius: var(--jd-radius-lg);
  }
  jd-icon-button[size="lg"] > .jd-icon-button {
    width: 2.5rem; height: 2.5rem; border-radius: var(--jd-radius-xl);
  }

  jd-icon-button[variant="outline"] > .jd-icon-button {
    border: var(--jd-border-thin) solid var(--jd-color-border);
  }
  jd-icon-button[variant="outline"] > .jd-icon-button:hover {
    background: var(--jd-color-card-hover);
  }

  jd-icon-button[variant="filled"] > .jd-icon-button {
    background: var(--jd-color-primary); color: #fff; box-shadow: var(--jd-shadow-xs);
  }
  jd-icon-button[variant="filled"] > .jd-icon-button:hover {
    background: var(--jd-color-primary-hover); color: #fff;
  }
  jd-icon-button[variant="filled"] > .jd-icon-button:active {
    background: var(--jd-color-primary-hover);
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-icon-button { transition: none; }
  }
}`;
