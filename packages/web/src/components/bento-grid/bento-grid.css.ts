import { css } from "../../core/styles.js";

/**
 * v2 값: 격자 `grid auto-rows-[180px] grid-cols-4` + `gap: gap*4px`(기본 4 → 16px),
 * 아이템 `rounded-2xl border border-border bg-white p-5 overflow-hidden
 * transition-shadow duration-300 hover:shadow-lg`.
 * 기본값은 전부 base 규칙이 담당한다 — 프롭을 주면 인라인 스타일이 이긴다(§4.3).
 */
export default css`
@layer junds.base {
  jd-bento-grid:not(:defined) { display: grid; }
  jd-bento-grid-item:not(:defined) { display: block; }
}
@layer junds.components {
  jd-bento-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: 180px;
    gap: var(--jd-space-4);
  }

  jd-bento-grid-item {
    display: block;
    box-sizing: border-box;
    padding: var(--jd-space-5);
    overflow: hidden;
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-2xl);
    transition: box-shadow var(--jd-duration-slow) var(--jd-easing-ease-out);
  }
  jd-bento-grid-item:hover,
  jd-bento-grid-item:focus-within { box-shadow: var(--jd-shadow-lg); }

  @media (prefers-reduced-motion: reduce) {
    jd-bento-grid-item { transition: none; }
  }
}`;
