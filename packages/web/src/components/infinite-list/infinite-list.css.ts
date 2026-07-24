import { css } from "../../core/styles.js";

/**
 * jd-infinite-list CSS — v2 patterns/InfiniteList 번역.
 * v2 값: 컨테이너 `flex flex-col`, 센티넬 `h-1`, 스피너 래퍼 `flex justify-center py-4`,
 * 완료 문구 `py-4 text-center text-xs text-muted-light`, 빈 상태 `py-12 text-center text-sm text-muted`.
 */
export default css`
@layer junds.components {
  jd-infinite-list {
    display: flex;
    flex-direction: column;
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
  }
  jd-infinite-list > [hidden] { display: none; }

  .jd-infinite-list__items { display: flex; flex-direction: column; }
  .jd-infinite-list__sentinel { height: var(--jd-space-px); }

  .jd-infinite-list__spinner {
    display: flex;
    justify-content: center;
    padding-block: var(--jd-space-4);
    color: var(--jd-color-muted);
  }
  .jd-infinite-list__spinner-svg {
    width: 1.25rem;
    height: 1.25rem;
    animation: jd-infinite-list-spin var(--jd-duration-slower, 0.7s) linear infinite;
  }
  @keyframes jd-infinite-list-spin { to { transform: rotate(360deg); } }

  .jd-infinite-list__end {
    margin: 0;
    padding-block: var(--jd-space-4);
    text-align: center;
    font-size: var(--jd-text-xs);
    color: var(--jd-color-muted-light);
  }

  .jd-infinite-list__empty {
    margin: 0;
    padding-block: var(--jd-space-12);
    text-align: center;
    font-size: var(--jd-text-sm);
    color: var(--jd-color-muted);
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-infinite-list__spinner-svg { animation-duration: 1.6s; }
  }
}`;
