/**
 * jd-filter-button-group 컴포넌트 CSS.
 * v2 ds/composites/FilterButtonGroup 시각을 --jd-* 토큰으로 의미 번역:
 *   h-9 px-4 text-sm font-medium border / 첫·끝만 rounded-l|r-lg / 비첫 -ml-px 겹침 /
 *   active = bg-primary·text-white·z-10 / inactive = bg-card·hover gray-50 /
 *   count = ml-1.5 · 10px · font-semibold · tabular-nums · active면 white/80.
 *
 * 안쪽은 네이티브 radio다(시각적으로만 감춤) — 선택 상태는 update()가 붙이는
 * data-active가 CSS 훅이고, 포커스 링은 :has(:focus-visible)로 버튼 면에 그린다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-filter-button-group {
    display: inline-flex;
    align-items: center;
    font-family: var(--jd-font-sans);
  }

  .jd-filter-button-group__item {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--jd-space-1-5);
    box-sizing: border-box;
    height: 2.25rem;
    padding-inline: var(--jd-space-4);
    background: var(--jd-color-card);
    color: var(--jd-color-foreground);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: 0;
    font-size: var(--jd-text-md);
    font-weight: var(--jd-weight-medium);
    line-height: var(--jd-leading-none);
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out),
      border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
      color var(--jd-duration-fast) var(--jd-easing-ease-out),
      box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out),
      opacity var(--jd-duration-fast) var(--jd-easing-ease-out),
      scale var(--jd-duration-fast) var(--jd-easing-ease-out),
      transform var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-filter-button-group__item:hover { background: var(--jd-color-card-hover); }

  /* v2 -ml-px: 인접 테두리를 한 겹으로 겹친다 */
  .jd-filter-button-group__item + .jd-filter-button-group__item {
    margin-inline-start: calc(var(--jd-space-px) * -1);
  }
  .jd-filter-button-group__item:first-of-type {
    border-start-start-radius: var(--jd-radius-lg);
    border-end-start-radius: var(--jd-radius-lg);
  }
  .jd-filter-button-group__item:last-of-type {
    border-start-end-radius: var(--jd-radius-lg);
    border-end-end-radius: var(--jd-radius-lg);
  }

  .jd-filter-button-group__item[data-active] {
    z-index: 1;
    background: var(--jd-color-primary);
    border-color: var(--jd-color-primary);
    color: #fff;
  }
  .jd-filter-button-group__item[data-active]:hover { background: var(--jd-color-primary-hover); }

  .jd-filter-button-group__item[data-disabled] {
    opacity: var(--jd-opacity-50);
    cursor: not-allowed;
  }
  .jd-filter-button-group__item[data-disabled]:hover { background: var(--jd-color-card); }

  /* 라디오는 시각적으로만 감춘다 (star-rating 관용구) */
  .jd-filter-button-group__input {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }
  .jd-filter-button-group__item:has(.jd-filter-button-group__input:focus-visible) {
    z-index: 2;
    outline: var(--jd-border-medium) solid var(--jd-color-primary);
    outline-offset: 2px;
  }

  .jd-filter-button-group__count {
    font-size: 10px; /* v2 text-[10px] — 대응 토큰 없음(badge 선례) */
    font-weight: var(--jd-weight-semibold);
    font-variant-numeric: tabular-nums;
    color: var(--jd-color-muted);
  }
  .jd-filter-button-group__item[data-active] .jd-filter-button-group__count {
    color: color-mix(in srgb, #fff 80%, transparent);
  }
  .jd-filter-button-group__count[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .jd-filter-button-group__item { transition: none; }
  }
}`;
