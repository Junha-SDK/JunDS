/**
 * jd-key-value-grid CSS — 원형(jd-descriptions) 시트 위에 v2 KeyValueGrid의 스킨만 얹는다.
 *
 * v2 값: 격자 `gap-4`(비bordered) / `gap-px`(bordered), 열
 * `grid-cols-1 sm:grid-cols-2 md:grid-cols-{2|3|4}`, span
 * `col-span-1 sm:col-span-2 md:col-span-{3|4}`, 항목 `space-y-1` + bordered `bg-white p-3`,
 * dt `text-[10px] font-medium text-muted uppercase tracking-wider`,
 * dd `text-sm font-medium text-foreground rounded px-1 -mx-1 hover:bg-gray-50`.
 *
 * 기본 columns=3은 attribute로 반영되지 않으므로(§1.3 · DEC-012-2) md 기본 규칙이
 * 3열을 담당하고 호스트 속성 셀렉터는 2·4만 맡는다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-key-value-grid:not(:defined) { display: block; }
  jd-key-value-grid:not(:defined) > script { display: none; }
}
@layer junds.components {
  jd-key-value-grid { display: block; }

  /* 모바일 1열 — v2 grid-cols-1 */
  jd-key-value-grid .jd-descriptions__list {
    grid-template-columns: minmax(0, 1fr);
    column-gap: var(--jd-space-4); row-gap: var(--jd-space-4);
  }
  jd-key-value-grid .jd-descriptions__item { grid-column: span 1; }

  @media (min-width: 640px) {
    jd-key-value-grid .jd-descriptions__list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    jd-key-value-grid .jd-descriptions__item[data-span="2"],
    jd-key-value-grid .jd-descriptions__item[data-span="3"],
    jd-key-value-grid .jd-descriptions__item[data-span="4"] { grid-column: span 2; }
  }
  @media (min-width: 768px) {
    jd-key-value-grid .jd-descriptions__list {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    jd-key-value-grid[columns="2"] .jd-descriptions__list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    jd-key-value-grid[columns="4"] .jd-descriptions__list {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    jd-key-value-grid .jd-descriptions__item[data-span="3"] { grid-column: span 3; }
    jd-key-value-grid .jd-descriptions__item[data-span="4"] { grid-column: span 4; }
  }

  /* 타이포 — 원형의 vertical 규칙(0,2,0)을 이겨야 하므로 box를 함께 건다 */
  jd-key-value-grid .jd-descriptions__box .jd-descriptions__label {
    margin-block-end: var(--jd-space-1);
    font-size: .625rem; font-weight: var(--jd-weight-medium);
    text-transform: uppercase; letter-spacing: .05em;
    color: var(--jd-color-muted);
  }
  jd-key-value-grid .jd-descriptions__box .jd-descriptions__value {
    font-size: var(--jd-text-md); font-weight: var(--jd-weight-medium);
    color: var(--jd-color-foreground);
    border-radius: var(--jd-radius-sm);
    padding-inline: var(--jd-space-1);
    margin-inline: calc(-1 * var(--jd-space-1));
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  jd-key-value-grid .jd-descriptions__box .jd-descriptions__value:hover {
    background: var(--jd-color-card-hover);
  }

  /* bordered — 라벨 셀 틴트 대신 항목 전체가 카드다 (v2 bg-white p-3) */
  jd-key-value-grid .jd-descriptions__box[data-bordered] .jd-descriptions__item {
    padding: var(--jd-space-3);
    background: var(--jd-color-card);
  }
  jd-key-value-grid .jd-descriptions__box[data-bordered] .jd-descriptions__label {
    padding: 0; background: none; border: 0;
  }
  jd-key-value-grid .jd-descriptions__box[data-bordered] .jd-descriptions__value {
    padding-block: 0; padding-inline: var(--jd-space-1);
  }

  @media (prefers-reduced-motion: reduce) {
    jd-key-value-grid .jd-descriptions__box .jd-descriptions__value { transition: none; }
  }
}`;
