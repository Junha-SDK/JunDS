import { css } from "../../core/styles.js";

/**
 * v2 매핑: space-y-4, 헤더 flex(제목 + N장), 태그 칩 rounded-full(active=primary),
 * PhotoGrid masonry(column-count)/grid(repeat) gap-2, 셀 rounded-xl overflow,
 * 라이트박스 = 전체 화면 backdrop + 중앙 이미지 + prev/next/close/counter.
 *
 * 반응형 열 수: 인라인 --cols-desktop만 받고, --cols는 여기서 결정한다
 * (인라인 커스텀 프로퍼티가 미디어 override를 이기는 함정 회피 — 모바일 2열 고정).
 */
export default css`
@layer junds.components {
  jd-photo-album {
    display: block; font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
  }

  .jd-photo-album__header {
    display: flex; align-items: center; justify-content: space-between;
    gap: var(--jd-space-3); margin-bottom: var(--jd-space-4);
  }
  .jd-photo-album__title { margin: 0; font-size: var(--jd-text-lg); font-weight: var(--jd-weight-semibold); }
  .jd-photo-album__count { margin: 0; font-size: var(--jd-text-xs); color: var(--jd-color-muted); }

  .jd-photo-album__filters {
    display: flex; flex-wrap: wrap; gap: var(--jd-space-2); margin-bottom: var(--jd-space-4);
  }
  .jd-photo-album__chip {
    display: inline-flex; align-items: center;
    padding: var(--jd-space-1) var(--jd-space-3);
    border: 0; border-radius: var(--jd-radius-full);
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-medium);
    background: var(--jd-color-surface-raised); color: var(--jd-color-foreground);
    cursor: pointer;
    transition: background var(--jd-duration-fast) var(--jd-easing-default),
      color var(--jd-duration-fast) var(--jd-easing-default);
  }
  .jd-photo-album__chip:hover { background: var(--jd-color-surface); }
  .jd-photo-album__chip[aria-checked="true"] {
    background: var(--jd-color-primary); color: #fff;
  }
  .jd-photo-album__chip:focus-visible { outline: 2px solid var(--jd-color-primary); outline-offset: 2px; }

  /* 열 수: 모바일 2, 640+에서 인라인 --cols-desktop 채택 */
  .jd-photo-album__grid { --cols: 2; }
  @media (min-width: 640px) { .jd-photo-album__grid { --cols: var(--cols-desktop, 4); } }

  /* grid 레이아웃(기본 아님 — 호스트 attr로 승격) */
  .jd-photo-album__grid {
    display: grid;
    grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
    gap: var(--jd-space-2);
  }
  /* masonry — 호스트 속성 셀렉터가 특이도 우위(§4.3) */
  jd-photo-album[layout="masonry"] .jd-photo-album__grid {
    display: block; column-count: var(--cols); column-gap: var(--jd-space-2);
  }
  jd-photo-album[layout="masonry"] .jd-photo-album__cell {
    break-inside: avoid; margin-bottom: var(--jd-space-2); width: 100%;
  }

  .jd-photo-album__cell {
    display: block; padding: 0; border: 0; background: transparent; cursor: pointer;
    border-radius: var(--jd-radius-xl); overflow: hidden;
    text-align: left;
  }
  .jd-photo-album__cell:focus-visible { outline: 2px solid var(--jd-color-primary); outline-offset: 2px; }
  .jd-photo-album__figure { margin: 0; position: relative; }
  .jd-photo-album__img {
    display: block; width: 100%; height: auto; object-fit: cover;
    background: var(--jd-color-surface-raised);
    transition: transform var(--jd-duration-normal) var(--jd-easing-default);
  }
  .jd-photo-album__cell:hover .jd-photo-album__img { transform: scale(1.03); }
  .jd-photo-album__caption {
    position: absolute; inset-inline: 0; inset-block-end: 0;
    display: flex; align-items: flex-end; justify-content: space-between; gap: var(--jd-space-2);
    padding: var(--jd-space-6) var(--jd-space-3) var(--jd-space-2);
    background: linear-gradient(to top, rgba(0,0,0,.6), transparent);
    color: #fff; font-size: var(--jd-text-xs);
    opacity: 0; transition: opacity var(--jd-duration-fast) var(--jd-easing-default);
  }
  .jd-photo-album__cell:hover .jd-photo-album__caption,
  .jd-photo-album__cell:focus-visible .jd-photo-album__caption { opacity: 1; }
  .jd-photo-album__caption-title { font-weight: var(--jd-weight-medium); }
  .jd-photo-album__caption-meta { font-variant-numeric: tabular-nums; white-space: nowrap; }

  .jd-photo-album__empty {
    display: flex; flex-direction: column; align-items: center; text-align: center;
    gap: var(--jd-space-2); padding: var(--jd-space-16) var(--jd-space-4);
  }
  .jd-photo-album__empty-icon { font-size: var(--jd-text-4xl); }
  .jd-photo-album__empty-title { margin: 0; font-weight: var(--jd-weight-semibold); }

  /* 라이트박스 */
  .jd-photo-album__lightbox {
    position: fixed; inset: 0; z-index: var(--jd-z-modal);
    display: flex; align-items: center; justify-content: center;
  }
  .jd-photo-album__lightbox[hidden] { display: none; }
  .jd-photo-album__lb-backdrop {
    position: absolute; inset: 0; background: rgba(0,0,0,.85);
  }
  .jd-photo-album__lb-panel {
    position: relative; z-index: 1;
    width: min(92vw, 72rem); max-height: 92vh;
    display: flex; align-items: center; justify-content: center;
  }
  .jd-photo-album__lb-figure {
    margin: 0; max-height: 92vh; display: flex; flex-direction: column;
    align-items: center; gap: var(--jd-space-2);
  }
  .jd-photo-album__lb-img {
    max-width: 100%; max-height: 82vh; object-fit: contain;
    border-radius: var(--jd-radius-md);
  }
  .jd-photo-album__lb-cap { margin: 0; color: rgba(255,255,255,.85); font-size: var(--jd-text-sm); text-align: center; }
  .jd-photo-album__lb-close {
    position: absolute; inset-block-start: calc(-1 * var(--jd-space-10)); inset-inline-end: 0;
    width: 2.5rem; height: 2.5rem; border: 0; cursor: pointer;
    border-radius: var(--jd-radius-full);
    background: rgba(255,255,255,.12); color: #fff; font-size: var(--jd-text-lg);
  }
  .jd-photo-album__lb-nav {
    position: absolute; inset-block-start: 50%; transform: translateY(-50%);
    width: 2.75rem; height: 2.75rem; border: 0; cursor: pointer;
    border-radius: var(--jd-radius-full);
    background: rgba(255,255,255,.12); color: #fff; font-size: var(--jd-text-2xl);
    display: inline-flex; align-items: center; justify-content: center;
  }
  .jd-photo-album__lb-prev { inset-inline-start: calc(-1 * var(--jd-space-12)); }
  .jd-photo-album__lb-next { inset-inline-end: calc(-1 * var(--jd-space-12)); }
  .jd-photo-album__lb-close:hover,
  .jd-photo-album__lb-nav:hover { background: rgba(255,255,255,.24); }
  .jd-photo-album__lb-close:focus-visible,
  .jd-photo-album__lb-nav:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
  .jd-photo-album__lb-counter {
    position: absolute; inset-block-end: calc(-1 * var(--jd-space-8)); inset-inline: 0;
    margin: 0; text-align: center; color: rgba(255,255,255,.7);
    font-size: var(--jd-text-xs); font-variant-numeric: tabular-nums;
  }
  @media (max-width: 640px) {
    .jd-photo-album__lb-prev { inset-inline-start: var(--jd-space-1); }
    .jd-photo-album__lb-next { inset-inline-end: var(--jd-space-1); }
    .jd-photo-album__lb-close { inset-block-start: var(--jd-space-1); inset-inline-end: var(--jd-space-1); background: rgba(0,0,0,.4); }
  }
  @media (prefers-reduced-motion: reduce) {
    .jd-photo-album__img, .jd-photo-album__caption { transition: none; }
    .jd-photo-album__cell:hover .jd-photo-album__img { transform: none; }
  }
}`;
