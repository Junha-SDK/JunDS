import { css } from "../../core/styles.js";

/**
 * jd-data-table CSS — v2 patterns/DataTable 번역.
 *
 * 골격(.jd-table__*)·정렬 머리/선택 열/푸터(.jd-data-grid__*)는 table.css·data-grid.css가
 * 이미 깔았다(둘 다 파생 시점에 채택). 다만 **호스트 셀렉터는 태그별이라 상속되지 않으므로**
 * (jd-data-grid[...] 규칙은 jd-data-table에 닿지 않는다) 박스·th/td·모디파이어를 이 태그로
 * 다시 쓴다 — DataGrid가 Table 크롬을 다시 쓴 것과 같은 구조. 클래스 규칙(.jd-data-grid__sort
 * 등)은 그대로 먹으므로 재선언하지 않는다.
 *
 * v2 값: 컨테이너 `rounded-lg border`, 툴바 `px-4 py-2.5 border-b bg-white`,
 * 검색 `h-8 pl-8 pr-8 text-xs border rounded-lg`, 밀도 `px3 py1.5 text-xs`,
 * th `text-xs font-semibold uppercase tracking-wide text-muted`,
 * 밀도 패딩 compact(px3 py1.5)·normal(px4 py3)·comfortable(px5 py4),
 * 선택 행 `bg-primary-light/50`, hover `bg-gray-50/90`, striped `bg-gray-50/45`.
 */
export default css`
  @layer junds.components {
    jd-data-table {
      display: block;
      overflow: hidden;
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      font-family: var(--jd-font-sans);
    }

    /* ── 툴바 ── */
    .jd-data-table__toolbar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--jd-space-2);
      padding: var(--jd-space-2-5) var(--jd-space-4);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
      background: var(--jd-color-card);
    }
    .jd-data-table__toolbar[hidden] {
      display: none;
    }
    .jd-data-table__toolbar > [hidden] {
      display: none;
    }
    .jd-data-table__toolbar-spacer {
      flex: 1 1 var(--jd-space-4);
    }

    /* 검색 (v2 h-8 pl-8 pr-8) */
    .jd-data-table__search {
      position: relative;
      display: inline-flex;
      align-items: center;
      flex: 1 1 12.5rem;
      min-width: 12.5rem;
      max-width: 24rem;
      color: var(--jd-color-muted);
    }
    .jd-data-table__search-icon {
      position: absolute;
      inset-inline-start: var(--jd-space-2-5);
      pointer-events: none;
    }
    .jd-data-table__search-input {
      width: 100%;
      box-sizing: border-box;
      height: var(--jd-space-8);
      padding-inline: calc(var(--jd-space-2-5) + 14px + var(--jd-space-2)) var(--jd-space-8);
      font-size: var(--jd-text-sm);
      color: var(--jd-color-foreground);
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-lg);
      outline: none;
      transition: border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-data-table__search-input::placeholder {
      color: var(--jd-color-muted-light);
    }
    .jd-data-table__search-input:focus-visible {
      border-color: var(--jd-color-primary);
      box-shadow: 0 0 0 var(--jd-border-medium)
        color-mix(in srgb, var(--jd-color-primary) 35%, transparent);
    }
    .jd-data-table__search-clear {
      position: absolute;
      inset-inline-end: var(--jd-space-2);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--jd-space-0-5);
      color: var(--jd-color-muted);
      background: none;
      border: 0;
      border-radius: var(--jd-radius-sm);
      cursor: pointer;
    }
    .jd-data-table__search-clear[hidden] {
      display: none;
    }
    .jd-data-table__search-clear:hover {
      color: var(--jd-color-foreground);
    }
    .jd-data-table__search-clear:focus-visible {
      outline: var(--jd-border-medium) solid var(--jd-color-primary);
      outline-offset: 1px;
    }

    /* 밀도 세그먼트 + 내보내기 */
    .jd-data-table__density,
    .jd-data-table__export {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-0-5);
    }
    .jd-data-table__density-button,
    .jd-data-table__export-button {
      height: var(--jd-space-8);
      padding-inline: var(--jd-space-2-5);
      font: inherit;
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-medium);
      color: var(--jd-color-muted);
      background: none;
      border: var(--jd-border-thin) solid transparent;
      border-radius: var(--jd-radius-md);
      cursor: pointer;
      transition: color var(--jd-duration-fast) var(--jd-easing-ease-out),
        background var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-data-table__density-button:hover,
    .jd-data-table__export-button:hover {
      color: var(--jd-color-foreground);
      background: var(--jd-color-card-hover);
    }
    .jd-data-table__density-button[data-active] {
      color: var(--jd-color-primary-ink);
      border-color: color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
      background: color-mix(in srgb, var(--jd-color-primary) 8%, transparent);
    }
    .jd-data-table__density-button:focus-visible,
    .jd-data-table__export-button:focus-visible {
      outline: var(--jd-border-medium) solid var(--jd-color-primary);
      outline-offset: 1px;
    }

    /* ── 표 머리 타이포 (v2 대문자 캡션) ── */
    jd-data-table .jd-table__th {
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-semibold);
      text-transform: uppercase;
      letter-spacing: var(--jd-tracking-wide);
    }

    /* ── 밀도 패딩 (normal 기본 → compact/comfortable 오버라이드) ── */
    jd-data-table .jd-table__th,
    jd-data-table .jd-table__td {
      padding: var(--jd-space-3) var(--jd-space-4);
    }
    jd-data-table[density="compact"] .jd-table__th,
    jd-data-table[density="compact"] .jd-table__td {
      padding: var(--jd-space-1-5) var(--jd-space-3);
    }
    jd-data-table[density="comfortable"] .jd-table__th,
    jd-data-table[density="comfortable"] .jd-table__td {
      padding: var(--jd-space-4) var(--jd-space-5);
    }

    /* ── 모디파이어 (호스트 셀렉터라 파생 태그로 재선언) ── */
    jd-data-table[sticky-header] .jd-table__th {
      position: sticky;
      inset-block-start: 0;
      z-index: var(--jd-z-sticky);
    }
    jd-data-table[bordered] .jd-table__th,
    jd-data-table[bordered] .jd-table__td {
      border: var(--jd-border-thin) solid var(--jd-color-border);
    }
    jd-data-table[striped] .jd-table__body > .jd-table__row:nth-child(even) {
      background: color-mix(in srgb, var(--jd-color-card-hover) 45%, transparent);
    }
    jd-data-table[row-clickable] .jd-table__body > .jd-table__row {
      cursor: pointer;
    }
    jd-data-table .jd-table__body > .jd-table__row:hover {
      background: var(--jd-color-card-hover);
    }
    /* 선택이 hover·striped를 이긴다 (v2 bg-primary-light) */
    jd-data-table .jd-table__body > .jd-table__row[data-selected],
    jd-data-table .jd-table__body > .jd-table__row[data-selected]:hover {
      background: color-mix(in srgb, var(--jd-color-primary) 8%, transparent);
    }

    /* ── 행 번호 열 ── */
    .jd-data-table__num-cell {
      width: 3rem;
      text-align: center;
      color: var(--jd-color-muted-light);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    /* ── 로딩 스켈레톤 (.jd-table__row 없이 — 구분선을 직접 준다) ── */
    .jd-data-table__skeleton-row {
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-data-table__skeleton {
      display: block;
      width: 70%;
      height: 0.75rem;
      border-radius: var(--jd-radius-sm);
      background: linear-gradient(
        90deg,
        var(--jd-color-border-light) 25%,
        var(--jd-color-card-hover) 37%,
        var(--jd-color-border-light) 63%
      );
      background-size: 400% 100%;
      animation: jd-data-table-shimmer 1.4s ease infinite;
    }
    @keyframes jd-data-table-shimmer {
      0% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0 50%;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-data-table__search-input,
      .jd-data-table__density-button,
      .jd-data-table__export-button {
        transition: none;
      }
      .jd-data-table__skeleton {
        animation: none;
      }
    }
  }
`;
