import { css } from "../../core/styles.js";

/**
 * jd-sortable-list CSS — v2 patterns/SortableList 번역.
 * v2 값: 컨테이너 `flex flex-col gap-1`, 행 `flex items-center gap-2 transition-all`,
 * 드래그 중 `opacity-40`, 드롭 대상 `border-t-2 border-primary`,
 * 핸들 `cursor-grab active:cursor-grabbing text-muted hover:text-foreground`,
 * 내용 `flex-1 min-w-0`.
 */
export default css`
@layer junds.components {
  jd-sortable-list {
    display: flex;
    flex-direction: column;
    gap: var(--jd-space-1);
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
  }

  .jd-sortable-list__item {
    display: flex;
    align-items: center;
    gap: var(--jd-space-2);
    /* 드롭 표시선 자리 — 실제 표시는 위 테두리로 */
    border-block-start: var(--jd-border-medium) solid transparent;
    transition:
      opacity var(--jd-duration-fast) var(--jd-easing-ease-out),
      border-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-sortable-list__item[data-grabbed] { opacity: var(--jd-opacity-40); }
  .jd-sortable-list__item[data-drop-target] { border-block-start-color: var(--jd-color-primary); }
  .jd-sortable-list__item:focus-visible {
    outline: var(--jd-border-medium) solid var(--jd-color-primary);
    outline-offset: 2px;
    border-radius: var(--jd-radius-sm);
  }

  .jd-sortable-list__handle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
    margin: 0;
    padding: 0;
    color: var(--jd-color-muted);
    background: none;
    border: 0;
    border-radius: var(--jd-radius-sm);
    cursor: grab;
    touch-action: none;
    transition: color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-sortable-list__handle:hover { color: var(--jd-color-foreground); }
  .jd-sortable-list__handle:active { cursor: grabbing; }
  .jd-sortable-list__handle:focus-visible {
    outline: var(--jd-border-medium) solid var(--jd-color-primary);
    outline-offset: 2px;
  }
  .jd-sortable-list__handle > svg { width: 0.875rem; height: 0.875rem; }

  .jd-sortable-list__content { flex: 1 1 0; min-width: 0; }

  /* 시각적 숨김 — 이동 결과 공지용 */
  .jd-sortable-list__live {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-sortable-list__item,
    .jd-sortable-list__handle { transition: none; }
  }
}`;
