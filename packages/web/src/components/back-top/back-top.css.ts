/**
 * jd-back-top CSS — v2 primitives/BackTop(우하단 고정 원형 · shadow-lg ·
 * 호버 시 primary 테두리)의 토큰 번역. 미노출은 display:none(v2 null 반환 동형).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-back-top {
    position: fixed; inset-block-end: var(--jd-space-6); inset-inline-end: var(--jd-space-6);
    z-index: var(--jd-z-sticky);
  }
  jd-back-top:not([visible]) { display: none; }

  .jd-back-top__button {
    display: flex; align-items: center; justify-content: center;
    width: 2.5rem; height: 2.5rem; padding: 0;
    background: var(--jd-color-card); color: var(--jd-color-muted);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-full); box-shadow: var(--jd-shadow-lg);
    cursor: pointer;
    transition: background-color var(--jd-duration-normal) var(--jd-easing-ease-out),
      border-color var(--jd-duration-normal) var(--jd-easing-ease-out),
      color var(--jd-duration-normal) var(--jd-easing-ease-out),
      box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out),
      opacity var(--jd-duration-normal) var(--jd-easing-ease-out),
      scale var(--jd-duration-normal) var(--jd-easing-ease-out),
      transform var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-back-top__button:hover {
    color: var(--jd-color-primary-ink); box-shadow: var(--jd-shadow-xl);
    border-color: color-mix(in srgb, var(--jd-color-primary) 30%, transparent);
  }
  .jd-back-top__button:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring), var(--jd-shadow-lg);
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-back-top__button { transition: none; }
  }
}`;
