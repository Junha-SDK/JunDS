/**
 * jd-photo-grid CSS — v2 composites/PhotoGrid 토큰 번역.
 *
 * v2 값(Tailwind 브레이크포인트 sm=640px · lg=1024px, --jd-breakpoint-* 와 동일):
 *   uniform  2 → grid-cols-1 sm:2 · 3 → 2 sm:3 · 4 → 2 sm:3 lg:4 · 5 → 2 sm:3 lg:5
 *   masonry  같은 사다리를 columns-*로 · 자식 `mb-2 break-inside-avoid`
 *   mosaic   grid-cols-4 grid-rows-2 · 첫 자식 col-span-2 row-span-2
 *   gap      1|2|3|4 = 0.25|0.5|0.75|1rem — **스타일 프롭 gap이 담당**(기본 gap-2)
 *
 * 미디어 쿼리는 var()를 받지 못하므로 브레이크포인트만 리터럴이다(토큰과 값 동일).
 * columns 기본값 3은 attribute로 반영되지 않으므로(§1.3) base 규칙이 3을 그린다.
 *
 * masonry의 세로 간격: multicol은 row-gap을 무시한다 — v2도 gap 프롭과 무관하게
 * `mb-2` 고정이었다. 같은 값을 기본으로 두되 --jd-photo-grid-masonry-gap으로 연다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-photo-grid:not(:defined) { display: grid; }
}
@layer junds.components {
  /* ── 기본 = uniform · columns 3 ─────────────────────────────── */
  jd-photo-grid {
    display: grid;
    gap: var(--jd-space-2);
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  jd-photo-grid[columns="2"] { grid-template-columns: repeat(1, minmax(0, 1fr)); }

  @media (min-width: 640px) {
    jd-photo-grid,
    jd-photo-grid[columns="3"],
    jd-photo-grid[columns="4"],
    jd-photo-grid[columns="5"] { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    jd-photo-grid[columns="2"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (min-width: 1024px) {
    jd-photo-grid[columns="4"] { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    jd-photo-grid[columns="5"] { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  }

  /* ── masonry — 폭만 같고 높이는 자유(multicol) ────────────────── */
  jd-photo-grid[layout="masonry"] {
    display: block;
    column-count: 2;
  }
  jd-photo-grid[layout="masonry"][columns="2"] { column-count: 1; }
  jd-photo-grid[layout="masonry"] > * {
    break-inside: avoid;
    margin-block-end: var(--jd-photo-grid-masonry-gap, var(--jd-space-2));
  }
  @media (min-width: 640px) {
    jd-photo-grid[layout="masonry"],
    jd-photo-grid[layout="masonry"][columns="3"],
    jd-photo-grid[layout="masonry"][columns="4"],
    jd-photo-grid[layout="masonry"][columns="5"] { column-count: 3; }
    jd-photo-grid[layout="masonry"][columns="2"] { column-count: 2; }
  }
  @media (min-width: 1024px) {
    jd-photo-grid[layout="masonry"][columns="4"] { column-count: 4; }
    jd-photo-grid[layout="masonry"][columns="5"] { column-count: 5; }
  }

  /* ── mosaic — 첫 항목이 2×2, 나머지는 자동 배치 (columns 무시, v2 동형) ── */
  jd-photo-grid[layout="mosaic"] {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: repeat(2, minmax(0, 1fr));
  }
  jd-photo-grid[layout="mosaic"] > :first-child {
    grid-column: span 2;
    grid-row: span 2;
  }
}`;
