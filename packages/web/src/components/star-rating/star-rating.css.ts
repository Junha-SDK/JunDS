/**
 * jd-star-rating CSS — v2 primitives/StarRating(size 3종 · 채움 yellow-400 ·
 * 빈 별 gray-300 · 호버 확대)의 토큰 번역.
 * 별 금색은 semantic 축이 없어 v2 Tailwind 리터럴 승계(DEC-025-1).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-star-rating { display: inline-flex; align-items: center; gap: var(--jd-space-1); }
  jd-star-rating[size="sm"] { gap: var(--jd-space-0-5); }
  jd-star-rating[size="lg"] { gap: var(--jd-space-1-5); }

  .jd-star-rating__item {
    display: inline-flex; align-items: center; justify-content: center;
    cursor: pointer; color: #d1d5db; /* v2 gray-300 — 빈 별 */
    transition: color var(--jd-duration-fast) var(--jd-easing-ease-out),
                transform var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-star-rating__item[data-filled] { color: #facc15; } /* v2 yellow-400 */
  jd-star-rating:not([readonly]) .jd-star-rating__item:hover { transform: scale(1.1); }
  jd-star-rating[readonly] .jd-star-rating__item { cursor: default; }

  /* 라디오는 시각적으로만 감춘다 — 포커스 링은 아래 :has로 별에 그린다 */
  .jd-star-rating__radio {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }
  .jd-star-rating__item:has(.jd-star-rating__radio:focus-visible) {
    outline: var(--jd-border-medium) solid var(--jd-color-primary);
    outline-offset: 2px; border-radius: var(--jd-radius-sm);
  }

  .jd-star-rating__icon {
    width: 1.5rem; height: 1.5rem;
    fill: none; stroke: currentColor; stroke-width: 1.5;
  }
  .jd-star-rating__item[data-filled] .jd-star-rating__icon { fill: currentColor; stroke-width: 0; }
  jd-star-rating[size="sm"] .jd-star-rating__icon { width: 1rem; height: 1rem; }
  jd-star-rating[size="lg"] .jd-star-rating__icon { width: 2rem; height: 2rem; }

  @media (prefers-reduced-motion: reduce) {
    .jd-star-rating__item { transition: none; }
    jd-star-rating:not([readonly]) .jd-star-rating__item:hover { transform: none; }
  }
}`;
