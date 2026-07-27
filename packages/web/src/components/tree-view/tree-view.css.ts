/**
 * jd-tree-view CSS — v2 composites/TreeView(px-2 py-1 · rounded-md · 선택=primary-light,
 * 깊이 16px 들여쓰기 · 셰브론 90° 회전)의 의미 번역.
 * 들여쓰기는 인라인 `--jd-tree-depth`(정수) × 1rem — 계산은 CSS가 한다.
 * jd-tree-nav가 같은 클래스를 상속해 색만 재정의한다(§6 R12).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-tree-view { display: block; padding-block: var(--jd-space-1); }

  .jd-tree-view__tree,
  .jd-tree-view__group {
    display: flex; flex-direction: column; gap: var(--jd-space-0-5);
    margin: 0; padding: 0; list-style: none;
  }
  .jd-tree-view__group[hidden] { display: none; }

  .jd-tree-view__item { display: block; outline: none; }

  .jd-tree-view__row {
    display: flex; align-items: center; gap: var(--jd-space-1-5);
    /* v2: paddingLeft = depth*16 + 8 */
    padding-block: var(--jd-space-1);
    padding-inline: calc(var(--jd-tree-depth, 0) * 1rem + var(--jd-space-2)) var(--jd-space-2);
    border-radius: var(--jd-radius-md); cursor: pointer;
    font-family: var(--jd-font-sans); font-size: var(--jd-text-md);
    color: var(--jd-color-foreground);
    transition: background var(--jd-duration-normal) var(--jd-easing-ease-out),
      color var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-tree-view__row:hover {
    background: color-mix(in srgb, var(--jd-color-muted) 10%, transparent);
  }
  .jd-tree-view__item:focus-visible > .jd-tree-view__row {
    box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-tree-view__item[aria-selected="true"] > .jd-tree-view__row {
    background: var(--jd-color-primary-light); color: var(--jd-color-primary-ink);
    font-weight: var(--jd-weight-medium);
  }
  .jd-tree-view__item[aria-disabled="true"] > .jd-tree-view__row {
    opacity: var(--jd-opacity-40); cursor: not-allowed;
  }

  /* 잎 노드에서는 비어 있는 채 자리만 지킨다 (v2의 w-4 스페이서) */
  .jd-tree-view__chevron {
    display: inline-flex; flex-shrink: 0; align-items: center; justify-content: center;
    inline-size: 1rem; block-size: 1rem; color: var(--jd-color-muted);
    transition: rotate var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-tree-view__chevron > svg { inline-size: 1rem; block-size: 1rem; }
  .jd-tree-view__item[aria-expanded="true"] > .jd-tree-view__row > .jd-tree-view__chevron {
    rotate: 90deg;
  }

  .jd-tree-view__icon { display: inline-flex; flex-shrink: 0; }
  .jd-tree-view__icon[hidden] { display: none; }
  .jd-tree-view__icon > svg { inline-size: 1rem; block-size: 1rem; }

  .jd-tree-view__label {
    flex: 1 1 auto; min-inline-size: 0;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .jd-tree-view__badge {
    display: inline-flex; align-items: center; justify-content: center;
    margin-inline-start: auto; flex-shrink: 0;
    min-inline-size: 1.25rem; block-size: 1.25rem;
    padding-inline: var(--jd-space-1-5); border-radius: var(--jd-radius-full);
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-medium);
    background: var(--jd-color-border); color: var(--jd-color-muted);
  }
  .jd-tree-view__badge[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .jd-tree-view__row, .jd-tree-view__chevron { transition: none; }
  }
}`;
