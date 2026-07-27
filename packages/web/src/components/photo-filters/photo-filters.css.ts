/**
 * jd-photo-filters CSS — v2 composites/PhotoFilters 토큰 번역.
 *
 * v2 값: 스트립 `flex gap-2 overflow-x-auto py-2 -mx-2 px-2 snap-x`,
 * 항목 `shrink-0 snap-start flex-col items-center gap-1 rounded-lg p-1.5 transition-all`
 * (활성 `bg-primary/10 text-primary`, 비활성 `hover:bg-surface-soft text-foreground`),
 * 썸네일 `w-14 h-14 rounded-md overflow-hidden border-2`(활성 `border-primary`),
 * 라벨 `text-[11px] font-medium`.
 * (Tailwind bg-surface-soft == `--color-surface-soft: var(--card-hover)` → --jd-color-card-hover)
 *
 * 안쪽은 네이티브 radio다(시각적으로만 감춤) — 포커스 링은 :has(:focus-visible)로
 * 항목 면에 그린다(jd-filter-button-group 관용구).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-photo-filters:not(:defined) { display: flex; }
  jd-photo-filters:not(:defined) > script { display: none; }
}
@layer junds.components {
  jd-photo-filters {
    display: flex;
    gap: var(--jd-space-2);
    overflow-x: auto;
    padding-block: var(--jd-space-2);
    padding-inline: var(--jd-space-2);
    margin-inline: calc(var(--jd-space-2) * -1); /* v2 -mx-2 px-2: 스크롤 여백을 밖으로 뺀다 */
    scroll-snap-type: x proximity;
    font-family: var(--jd-font-sans);
  }

  .jd-photo-filters__item {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    align-items: center;
    gap: var(--jd-space-1);
    padding: var(--jd-space-1-5);
    color: var(--jd-color-foreground);
    border-radius: var(--jd-radius-lg);
    scroll-snap-align: start;
    cursor: pointer;
    user-select: none;
    transition:
      background var(--jd-duration-fast) var(--jd-easing-ease-out),
      color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-photo-filters__item:hover { background: var(--jd-color-card-hover); }
  .jd-photo-filters__item[data-active] {
    color: var(--jd-color-primary-ink);
    background: color-mix(in srgb, var(--jd-color-primary) 10%, transparent);
  }
  .jd-photo-filters__item[data-disabled] {
    opacity: var(--jd-opacity-50);
    cursor: not-allowed;
  }

  /* 라디오는 시각적으로만 감춘다 (jd-filter-button-group 관용구) */
  .jd-photo-filters__input {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
  .jd-photo-filters__item:has(.jd-photo-filters__input:focus-visible) {
    outline: var(--jd-border-medium) solid var(--jd-color-primary);
    outline-offset: 2px;
  }

  .jd-photo-filters__thumb {
    display: block;
    box-sizing: border-box;
    width: 3.5rem; /* v2 w-14 */
    height: 3.5rem;
    overflow: hidden;
    background: var(--jd-color-card-hover);
    border: var(--jd-border-medium) solid transparent;
    border-radius: var(--jd-radius-md);
  }
  .jd-photo-filters__item[data-active] .jd-photo-filters__thumb {
    border-color: var(--jd-color-primary);
  }
  .jd-photo-filters__img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .jd-photo-filters__label {
    font-size: 11px; /* v2 text-[11px] — 대응 토큰 없음 */
    font-weight: var(--jd-weight-medium);
    line-height: var(--jd-leading-normal);
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-photo-filters__item { transition: none; }
  }
}`;
