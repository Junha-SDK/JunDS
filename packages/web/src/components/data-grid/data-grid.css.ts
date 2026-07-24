/**
 * jd-data-grid CSS — v2 composites/DataGrid 토큰 번역.
 * 표 골격(.jd-table__*)은 jd-table 시트를 그대로 쓰고 **기하·머리 타이포·푸터만** 덮는다
 * (jd-drawer가 .jd-modal__panel을 덮는 것과 같은 구조).
 *
 * v2 값: 컨테이너 `rounded-xl border border-border overflow-hidden`,
 * 스크롤러 `overflow-x-auto`, 표 `w-full text-sm`,
 * th `px-3 py-2.5 text-left text-xs font-semibold text-muted uppercase tracking-wider`
 * (+ sortable `cursor-pointer hover:text-foreground select-none`),
 * td `px-3 py-2`, 행 `border-b border-border last:border-0`,
 * 선택 행 `bg-primary/5` · 그 외 `hover:bg-gray-50`,
 * 푸터 `flex justify-between px-4 py-2 bg-gray-50 border-t text-xs text-muted`,
 * 푸터 버튼 `px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30`.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-data-grid {
    display: block;
    overflow: hidden;
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    font-family: var(--jd-font-sans);
  }

  /* v2 헤더 — 작은 대문자 캡션. 크기 토큰은 jd-table의 data-size 규칙을 대신한다 */
  jd-data-grid .jd-table__th {
    padding: var(--jd-space-2-5) var(--jd-space-3);
    font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-semibold);
    text-transform: uppercase;
    letter-spacing: var(--jd-tracking-wide);
  }
  jd-data-grid .jd-table__td { padding: var(--jd-space-2) var(--jd-space-3); }

  /* 베이스의 호스트 셀렉터(jd-table[...])는 파생 태그에 닿지 않는다 — 필요한 것만 재선언 */
  jd-data-grid[sticky-header] .jd-table__th {
    position: sticky; inset-block-start: 0; z-index: var(--jd-z-sticky);
  }
  jd-data-grid[row-clickable] .jd-table__body > .jd-table__row { cursor: pointer; }
  jd-data-grid[bordered] .jd-table__th,
  jd-data-grid[bordered] .jd-table__td {
    border: var(--jd-border-thin) solid var(--jd-color-border);
  }

  /* 정렬 머리 — v2는 th onClick이라 탭이 닿지 않았다. 여기서는 진짜 버튼 */
  .jd-data-grid__sort {
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    margin: 0; padding: 0; border: 0; background: none;
    font: inherit; letter-spacing: inherit; text-transform: inherit;
    color: inherit; cursor: pointer; user-select: none;
    transition: color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-data-grid__sort:hover { color: var(--jd-color-foreground); }
  .jd-data-grid__sort:focus-visible {
    outline: var(--jd-border-medium) solid var(--jd-color-primary);
    outline-offset: 2px; border-radius: var(--jd-radius-sm);
  }
  .jd-data-grid__sort-icon { display: inline-flex; width: 10px; height: 10px; }
  .jd-data-grid__sort-icon > svg { width: 10px; height: 10px; }

  /* 선택 열 — v2 w-10 */
  .jd-data-grid__select-cell { width: 2.5rem; }
  .jd-data-grid__check {
    margin: 0; width: 1rem; height: 1rem;
    cursor: pointer; accent-color: var(--jd-color-primary);
  }
  .jd-data-grid__check:disabled { cursor: not-allowed; opacity: var(--jd-opacity-40); }
  .jd-data-grid__check:focus-visible {
    outline: var(--jd-border-medium) solid
      color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    outline-offset: 1px;
  }

  jd-data-grid .jd-table__body > .jd-table__row:hover {
    background: var(--jd-color-card-hover);
  }
  /* v2 bg-primary/5 — 선택이 hover를 이긴다 */
  jd-data-grid .jd-table__body > .jd-table__row[data-selected],
  jd-data-grid .jd-table__body > .jd-table__row[data-selected]:hover {
    background: color-mix(in srgb, var(--jd-color-primary) 5%, transparent);
  }

  .jd-data-grid__footer {
    display: flex; align-items: center; justify-content: space-between;
    gap: var(--jd-space-3);
    padding: var(--jd-space-2) var(--jd-space-4);
    background: var(--jd-color-card-hover);
    border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
    font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
  }
  .jd-data-grid__footer[hidden] { display: none; }

  .jd-data-grid__pager { display: flex; gap: var(--jd-space-1); }
  .jd-data-grid__pager-button {
    padding: var(--jd-space-1) var(--jd-space-2);
    font: inherit; color: inherit;
    background: none; border: 0; border-radius: var(--jd-radius-md);
    cursor: pointer;
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-data-grid__pager-button:hover:not(:disabled) { background: var(--jd-color-border-light); }
  .jd-data-grid__pager-button:disabled { opacity: var(--jd-opacity-30); cursor: not-allowed; }
  .jd-data-grid__pager-button:focus-visible {
    outline: var(--jd-border-medium) solid var(--jd-color-primary); outline-offset: 1px;
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-data-grid__sort,
    .jd-data-grid__pager-button { transition: none; }
  }
}`;
