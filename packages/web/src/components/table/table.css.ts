/**
 * jd-table CSS — v2 composites/Table 토큰 번역.
 *
 * v2 값: 래퍼 `overflow-x-auto border border-border rounded-xl`, 표 `w-full text-sm`,
 * 헤더 행 `border-b border-border bg-gray-50` + th `font-medium text-muted`,
 * 본문 행 `border-b border-border last:border-b-0 transition-colors`,
 * striped = 홀수 인덱스 `bg-gray-50/50`, hoverable = `hover:bg-gray-50`,
 * bordered = th/td 전부 `border border-border`,
 * sticky = th `sticky top-0 z-[2] bg-gray-50`,
 * 빈 상태 `px-4 py-8 text-center text-muted`,
 * 패딩 sm(th 12/8 · td 12/6) · md(16/12) · lg(20/16).
 *
 * 번역 규칙: Tailwind text-sm = 0.875rem = --jd-text-md, gray-50 = --jd-color-card-hover
 * (DEC-025-4 선례), z-[2] = --jd-z-sticky.
 *
 * **파생 주의**: jd-data-grid가 이 시트의 `.jd-table__*` 클래스 골격을 공유한다
 * (jd-drawer가 .jd-modal__panel을 공유하는 것과 같은 구조). 그래서 **크기·모디파이어
 * 규칙만** 호스트 셀렉터(`jd-table[...]`)로 두고, 구조 규칙은 클래스만으로 쓴다 —
 * 파생 태그에서도 그대로 먹히도록.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-table {
      display: block;
      overflow: hidden; /* 모서리 반경 안쪽으로 스크롤러를 자른다 */
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      font-family: var(--jd-font-sans);
    }

    /* 스크롤러 — max-height는 프로퍼티가 넣는 CSS 변수로 받는다(호스트 무관, 파생 공유) */
    .jd-table__scroll {
      overflow: auto;
      max-height: var(--_jd-table-max-height, none);
    }

    .jd-table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--jd-text-md);
      color: var(--jd-color-foreground);
    }

    .jd-table__caption {
      caption-side: top;
      padding: var(--jd-space-3) var(--jd-space-4);
      text-align: start;
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-medium);
      color: var(--jd-color-foreground);
    }
    .jd-table__caption[hidden] {
      display: none;
    }
    /* 접근 이름만 남기고 시각적으로 감춤 — v2에는 표 이름 자체가 없었다 */
    .jd-table__caption--hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    .jd-table__th {
      font-weight: var(--jd-weight-medium);
      color: var(--jd-color-muted);
      text-align: start;
      background: var(--jd-color-card-hover);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-table__td {
      color: var(--jd-color-foreground);
      text-align: start;
    }

    .jd-table__th[data-align="left"],
    .jd-table__td[data-align="left"] {
      text-align: left;
    }
    .jd-table__th[data-align="center"],
    .jd-table__td[data-align="center"] {
      text-align: center;
    }
    .jd-table__th[data-align="right"],
    .jd-table__td[data-align="right"] {
      text-align: right;
    }

    .jd-table__row {
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-table__body > .jd-table__row:last-child {
      border-block-end: 0;
    }

    .jd-table__empty {
      padding: var(--jd-space-8) var(--jd-space-4);
      text-align: center;
      color: var(--jd-color-muted);
    }

    /* 행 크기 — resolvedSize(size ?? compact)가 data-size로 온다 */
    jd-table[data-size="sm"] .jd-table__th {
      padding: var(--jd-space-2) var(--jd-space-3);
    }
    jd-table[data-size="sm"] .jd-table__td {
      padding: var(--jd-space-1-5) var(--jd-space-3);
    }
    jd-table[data-size="md"] .jd-table__th,
    jd-table[data-size="md"] .jd-table__td {
      padding: var(--jd-space-3) var(--jd-space-4);
    }
    jd-table[data-size="lg"] .jd-table__th,
    jd-table[data-size="lg"] .jd-table__td {
      padding: var(--jd-space-4) var(--jd-space-5);
    }

    /* 모디파이어 — v2 striped는 rowIndex % 2 === 1(=두 번째 행부터) */
    jd-table[striped] .jd-table__body > .jd-table__row:nth-child(even) {
      background: color-mix(in srgb, var(--jd-color-card-hover) 50%, transparent);
    }
    jd-table[hoverable] .jd-table__body > .jd-table__row:hover {
      background: var(--jd-color-card-hover);
    }
    jd-table[bordered] .jd-table__th,
    jd-table[bordered] .jd-table__td {
      border: var(--jd-border-thin) solid var(--jd-color-border);
    }
    jd-table[sticky-header] .jd-table__th {
      position: sticky;
      inset-block-start: 0;
      z-index: var(--jd-z-sticky);
    }

    /* 행 활성화 — v2는 마우스 전용이었다. 포커스 링은 토큰 통일(§8) */
    jd-table[row-clickable] .jd-table__body > .jd-table__row {
      cursor: pointer;
    }
    .jd-table__body > .jd-table__row:focus-visible {
      outline: var(--jd-border-medium) solid var(--jd-color-primary);
      outline-offset: -2px;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-table__row {
        transition: none;
      }
    }
  }
`;
