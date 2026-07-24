/**
 * jd-bookmark-button CSS — v2 primitives/BookmarkButton(고스트 아이콘 버튼 ·
 * 활성 시 amber-500 채움)의 토큰 번역. amber는 의미축 없음 → v2 리터럴 승계(DEC-025-1).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-bookmark-button { display: inline-flex; --_jd-bookmark-size: 18px; }

  .jd-bookmark-button {
    display: inline-flex; align-items: center; justify-content: center;
    padding: var(--jd-space-1-5); border: 0; background: none; cursor: pointer;
    color: var(--jd-color-muted); border-radius: var(--jd-radius-md);
    transition: color var(--jd-duration-fast) var(--jd-easing-ease-out),
                background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-bookmark-button:hover:not(:disabled) { background: var(--jd-color-card-hover); }
  .jd-bookmark-button:active:not(:disabled) { transform: scale(0.95); }
  .jd-bookmark-button:disabled { opacity: var(--jd-opacity-50); cursor: not-allowed; }
  .jd-bookmark-button:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring);
  }

  .jd-bookmark-button__icon {
    width: var(--_jd-bookmark-size); height: var(--_jd-bookmark-size);
    fill: none; stroke: currentColor; stroke-width: 2;
  }
  jd-bookmark-button[bookmarked] .jd-bookmark-button { color: #f59e0b; } /* v2 amber-500 */
  jd-bookmark-button[bookmarked] .jd-bookmark-button__icon { fill: currentColor; }

  @media (prefers-reduced-motion: reduce) {
    .jd-bookmark-button { transition: none; }
    .jd-bookmark-button:active:not(:disabled) { transform: none; }
  }
}`;
