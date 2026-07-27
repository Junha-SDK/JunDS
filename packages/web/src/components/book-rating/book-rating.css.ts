/**
 * jd-book-rating CSS — v2 composites/BookRating의 토큰 번역.
 * 원본: flex-col gap-2 · 값 text-2xl font-bold tabular · 별 w-4 h-4(20px viewBox) ·
 * 채움 amber-400 위에 gray-300/700 바탕 · 분포 행 grid[20px 1fr 42px] · 막대 h-1.5
 * bg-gray-200/800 채움 amber-400. 금색·회색은 semantic 축이 없어 v2 리터럴 승계(DEC-025-1).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-book-rating { display: flex; flex-direction: column; gap: var(--jd-space-2); }

  .jd-book-rating__summary { display: flex; align-items: center; gap: var(--jd-space-2); }

  .jd-book-rating__value {
    font-size: var(--jd-text-2xl); font-weight: var(--jd-weight-bold);
    color: var(--jd-color-foreground); font-variant-numeric: tabular-nums;
  }

  .jd-book-rating__stars { display: inline-flex; align-items: center; }
  .jd-book-rating__star {
    position: relative; display: inline-block; width: 1rem; height: 1rem;
  }
  .jd-book-rating__star-base,
  .jd-book-rating__star-fill { position: absolute; inset: 0; width: 100%; height: 100%; }
  .jd-book-rating__star-base > path { fill: var(--jd-color-neutral-300); }  /* v2 gray-300 — 빈 별 */
  .jd-book-rating__star-fill > path { fill: #fbbf24; }  /* v2 amber-400 — 채움 */

  .jd-book-rating__reviews { font-size: var(--jd-text-xs); color: var(--jd-color-muted); }
  .jd-book-rating__reviews[hidden] { display: none; }

  /* 점수 분포 */
  .jd-book-rating__dist {
    display: flex; flex-direction: column; gap: var(--jd-space-0-5);
    margin-top: var(--jd-space-1);
  }
  .jd-book-rating__dist[hidden] { display: none; }
  .jd-book-rating__row {
    display: grid; grid-template-columns: 20px 1fr 42px; align-items: center;
    gap: var(--jd-space-2); font-size: 11px; color: var(--jd-color-muted);
  }
  .jd-book-rating__score { text-align: right; font-variant-numeric: tabular-nums; }
  .jd-book-rating__track {
    height: var(--jd-space-1-5); border-radius: var(--jd-radius-full);
    background: var(--jd-color-neutral-200); overflow: hidden;      /* v2 gray-200 */
  }
  .jd-book-rating__bar {
    height: 100%; border-radius: var(--jd-radius-full); background: #fbbf24;  /* amber-400 */
  }
  .jd-book-rating__count { text-align: right; font-variant-numeric: tabular-nums; }

  /* 다크 — 빈 별·트랙만 어둡게(채움 금색은 유지, badge 선례) */
  [data-jd-theme="dark"] .jd-book-rating__star-base > path,
  [data-theme="dark"] .jd-book-rating__star-base > path { fill: var(--jd-color-neutral-800); }  /* gray-700 */
  [data-jd-theme="dark"] .jd-book-rating__track,
  [data-theme="dark"] .jd-book-rating__track { background: var(--jd-color-neutral-800); }       /* gray-800 */
}`;
