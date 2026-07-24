/**
 * jd-transfer CSS — v2 composites/Transfer 토큰 번역.
 *
 * v2 값: 루트 flex gap-3, 패널 flex-1 border rounded-lg overflow-hidden min-w-180px,
 * 헤더 px-3 py-2 bg-gray-50 + 아래 테두리, 제목 text-sm medium / 카운트 text-xs muted,
 * 검색 행 px-3 py-2 + 아래 테두리, 목록 max-h-240px overflow-y-auto,
 * 항목 px-3 py-1.5 text-sm hover:bg-gray-50 · disabled 40%,
 * 빈 상태 px-3 py-4 text-xs muted, 이동 버튼 p-1.5 rounded-md border · disabled 40%.
 * v2의 gray-50/gray-100은 테마 토큰(card-hover / border-light)으로 번역한다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-transfer {
    display: flex; align-items: center; gap: var(--jd-space-3);
    font-family: var(--jd-font-sans);
  }

  .jd-transfer__panel {
    display: flex; flex-direction: column;
    flex: 1; min-width: 11.25rem; /* v2 min-w-[180px] */
    overflow: hidden;
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
  }

  .jd-transfer__head {
    display: flex; align-items: center; justify-content: space-between;
    gap: var(--jd-space-2);
    padding: var(--jd-space-2) var(--jd-space-3);
    background: var(--jd-color-card-hover);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-transfer__title {
    font-size: var(--jd-text-md); font-weight: var(--jd-weight-medium);
    color: var(--jd-color-foreground);
  }
  .jd-transfer__count { font-size: var(--jd-text-xs); color: var(--jd-color-muted); }

  .jd-transfer__search {
    padding: var(--jd-space-2) var(--jd-space-3);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-transfer__search[hidden] { display: none; }
  .jd-transfer__search-input {
    width: 100%; box-sizing: border-box; margin: 0;
    padding: var(--jd-space-1) var(--jd-space-2);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-md);
    color: var(--jd-color-foreground); background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-md);
  }
  .jd-transfer__search-input:focus {
    outline: none; border-color: var(--jd-color-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--jd-color-primary) 30%, transparent);
  }
  .jd-transfer__search-input::placeholder { color: var(--jd-color-muted-light); }

  .jd-transfer__list { max-height: 15rem; overflow-y: auto; }

  .jd-transfer__item {
    display: flex; align-items: center; gap: var(--jd-space-2);
    padding: var(--jd-space-1-5) var(--jd-space-3);
    font-size: var(--jd-text-md); color: var(--jd-color-foreground);
    cursor: pointer;
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-transfer__item:hover { background: var(--jd-color-card-hover); }
  .jd-transfer__item[data-disabled] {
    opacity: var(--jd-opacity-40); cursor: not-allowed;
  }
  .jd-transfer__item[data-disabled]:hover { background: none; }

  .jd-transfer__check {
    margin: 0; flex-shrink: 0; cursor: inherit;
    width: 1rem; height: 1rem;
    accent-color: var(--jd-color-primary);
  }
  .jd-transfer__check:focus-visible {
    outline: var(--jd-border-medium) solid
      color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    outline-offset: 1px;
  }
  .jd-transfer__item-label {
    min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .jd-transfer__empty {
    margin: 0; padding: var(--jd-space-4) var(--jd-space-3);
    font-size: var(--jd-text-xs); color: var(--jd-color-muted); text-align: center;
  }
  .jd-transfer__empty[hidden] { display: none; }

  .jd-transfer__actions {
    display: flex; flex-direction: column; gap: var(--jd-space-2); flex-shrink: 0;
  }
  .jd-transfer__move {
    display: inline-flex; align-items: center; justify-content: center;
    padding: var(--jd-space-1-5);
    color: var(--jd-color-foreground); background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-md);
    cursor: pointer;
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-transfer__move:hover:not(:disabled) { background: var(--jd-color-border-light); }
  .jd-transfer__move:disabled { opacity: var(--jd-opacity-40); cursor: not-allowed; }
  .jd-transfer__move:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }
  .jd-transfer__move > svg { width: 1rem; height: 1rem; }

  @media (max-width: 40rem) {
    jd-transfer { flex-direction: column; align-items: stretch; }
    .jd-transfer__actions { flex-direction: row; justify-content: center; }
    /* 세로 배치에서는 화살표도 세로로 — →는 아래, ←는 위를 가리킨다 */
    .jd-transfer__move > svg { transform: rotate(90deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-transfer__item,
    .jd-transfer__move { transition: none; }
  }
}`;
