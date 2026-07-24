/**
 * jd-like-button CSS — v2 primitives/LikeButton(알약 고스트 버튼 · 활성 시 rose-500
 * 채움 하트 + 살짝 확대)의 토큰 번역. rose는 의미축이 없어 v2 리터럴 승계(DEC-025-1).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-like-button { display: inline-flex; }

  .jd-like-button {
    display: inline-flex; align-items: center; gap: var(--jd-space-1-5);
    box-sizing: border-box; border: 0; background: none; cursor: pointer;
    user-select: none; font-family: var(--jd-font-sans);
    font-weight: var(--jd-weight-medium); color: var(--jd-color-muted);
    border-radius: var(--jd-radius-full);
    transition: color var(--jd-duration-fast) var(--jd-easing-ease-out),
                background var(--jd-duration-fast) var(--jd-easing-ease-out);
    /* size 기본 md */
    height: 2.25rem; padding-inline: var(--jd-space-3); font-size: var(--jd-text-sm);
  }
  .jd-like-button:hover:not(:disabled) { background: var(--jd-color-card-hover); }
  .jd-like-button:active:not(:disabled) { transform: scale(0.95); }
  .jd-like-button:disabled { opacity: var(--jd-opacity-50); cursor: not-allowed; }
  .jd-like-button:focus-visible {
    outline: var(--jd-border-medium) solid #f43f5e; outline-offset: 2px; /* v2 rose-500 */
  }

  jd-like-button[size="sm"] .jd-like-button {
    height: 1.75rem; padding-inline: var(--jd-space-2); font-size: var(--jd-text-xs);
  }
  jd-like-button[size="lg"] .jd-like-button {
    height: 2.75rem; padding-inline: var(--jd-space-4); font-size: var(--jd-text-md);
  }

  .jd-like-button__icon {
    width: 1rem; height: 1rem; flex-shrink: 0;
    fill: none; stroke: currentColor; stroke-width: 2;
    transition: transform var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  jd-like-button[size="sm"] .jd-like-button__icon { width: 0.875rem; height: 0.875rem; }
  jd-like-button[size="lg"] .jd-like-button__icon { width: 1.25rem; height: 1.25rem; }

  jd-like-button[liked] .jd-like-button { color: #f43f5e; } /* v2 rose-500 */
  jd-like-button[liked] .jd-like-button__icon { fill: currentColor; transform: scale(1.1); }
  /* 하트는 그래픽(3:1)이라 rose 원색이 충분하지만 **숫자는 텍스트**라 3.3:1로 AA 미달이다
     (axe 게이트 실측). 글자만 foreground와 섞는다 — DEC-030-7과 같은 처방. */
  jd-like-button[liked] .jd-like-button__count {
    color: color-mix(in srgb, #f43f5e 65%, var(--jd-color-foreground));
  }

  .jd-like-button__count { font-variant-numeric: tabular-nums; }
  .jd-like-button__count[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .jd-like-button, .jd-like-button__icon { transition: none; }
    .jd-like-button:active:not(:disabled) { transform: none; }
    jd-like-button[liked] .jd-like-button__icon { transform: none; }
  }
}`;
