/**
 * jd-kanban CSS — v2 patterns/Kanban 표면 의미 번역.
 * v2 값: 보드 `flex gap-4 overflow-x-auto pb-4`, 컬럼 `w-72 shrink-0 rounded-xl
 * bg-gray-50/80 border border-border/50`, 드롭 대상 `ring-2 ring-primary/30
 * bg-primary-light/20`, 헤더 `px-3 py-2.5 border-b`, 점 `w-2 h-2 rounded-full`,
 * 제목 `text-sm font-semibold`, 카운트 = Badge(default·sm), 카드영역 `gap-2 p-2
 * min-h-[100px]`, 카드 `cursor-grab`, 드래그 중 `opacity-40`.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-kanban:not(:defined) { display: none; }
}
@layer junds.components {
  jd-kanban {
    display: block;
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
  }

  /* 카드 이동 지시문 — 시각적으로만 숨긴다(AT에는 남긴다) */
  .jd-kanban__hint {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  .jd-kanban__board {
    display: flex;
    gap: var(--jd-space-4);
    overflow-x: auto;
    padding-bottom: var(--jd-space-4);
  }

  .jd-kanban__column {
    display: flex;
    flex-direction: column;
    width: 18rem;
    flex-shrink: 0;
    border-radius: var(--jd-radius-xl);
    background: var(--jd-color-surface);
    border: var(--jd-border-thin) solid var(--jd-color-border-light);
    transition:
      background var(--jd-duration-fast) var(--jd-easing-ease-out),
      box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  /* 드롭 대상 강조 — v2 ring-2 ring-primary/30 + bg-primary-light/20 */
  .jd-kanban__column[data-drop-target] {
    background: color-mix(in srgb, var(--jd-color-primary-light) 20%, var(--jd-color-surface));
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--jd-color-primary) 30%, transparent);
  }

  .jd-kanban__column-header {
    display: flex;
    align-items: center;
    gap: var(--jd-space-2);
    padding: var(--jd-space-2-5) var(--jd-space-3);
    border-bottom: var(--jd-border-thin) solid var(--jd-color-border-light);
  }
  .jd-kanban__column-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: var(--jd-radius-full);
    flex-shrink: 0;
  }
  .jd-kanban__column-dot[hidden] { display: none; }
  .jd-kanban__column-title {
    font-size: var(--jd-text-sm);
    font-weight: var(--jd-weight-semibold);
    color: var(--jd-color-foreground);
  }
  /* 카운트 배지 — jd-badge default·sm 표면 */
  .jd-kanban__column-count {
    margin-left: auto;
    min-width: 1.25rem;
    padding: 0 var(--jd-space-1-5);
    height: 1.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--jd-radius-full);
    background: color-mix(in srgb, var(--jd-color-muted) 15%, transparent);
    color: var(--jd-color-muted);
    font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-medium);
    font-variant-numeric: tabular-nums;
  }

  .jd-kanban__list {
    list-style: none;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--jd-space-2);
    padding: var(--jd-space-2);
    flex: 1;
    min-height: 100px;
  }

  .jd-kanban__card {
    cursor: grab;
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border-light);
    border-radius: var(--jd-radius-lg);
    padding: var(--jd-space-3);
    box-shadow: var(--jd-shadow-xs);
    transition:
      box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out),
      opacity var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-kanban__card:hover { box-shadow: var(--jd-shadow-sm); }
  .jd-kanban__card:focus-visible {
    outline: none;
    box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-kanban__card:active { cursor: grabbing; }
  .jd-kanban__card--dragging { opacity: var(--jd-opacity-40); }

  .jd-kanban__card-title {
    margin: 0;
    font-size: var(--jd-text-sm);
    font-weight: var(--jd-weight-medium);
    color: var(--jd-color-foreground);
  }
  .jd-kanban__card-desc {
    margin: var(--jd-space-1) 0 0;
    font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
  }
}`;
