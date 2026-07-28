/**
 * jd-action-sheet CSS — v2 ActionSheet(하단 정렬 카드 + 구분선 목록 + 분리된 취소 버튼).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-action-sheet {
      display: none;
    }
    jd-action-sheet[open] {
      display: flex;
      position: fixed;
      inset: 0;
      z-index: var(--jd-z-modal);
      align-items: flex-end;
      justify-content: center;
      padding: var(--jd-space-4);
    }

    jd-action-sheet .jd-modal__panel {
      max-width: min(32rem, 100%);
      background: none;
      box-shadow: none;
      gap: var(--jd-space-2);
      overflow: visible;
      animation: jd-action-sheet-in var(--jd-duration-normal) cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes jd-action-sheet-in {
      from {
        transform: translateY(1rem);
        opacity: 0;
      }
    }

    .jd-action-sheet__title {
      margin: 0;
      padding: var(--jd-space-3) var(--jd-space-4);
      text-align: center;
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
      background: var(--jd-color-card);
      border-radius: var(--jd-radius-2xl) var(--jd-radius-2xl) 0 0;
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-action-sheet__title[hidden] {
      display: none;
    }
    /* 제목이 없으면 목록이 위 모서리를 둥글게 받는다 */
    .jd-action-sheet__title[hidden] + .jd-action-sheet__list {
      border-start-start-radius: var(--jd-radius-2xl);
      border-start-end-radius: var(--jd-radius-2xl);
    }

    .jd-action-sheet__list {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--jd-color-card);
      border-end-start-radius: var(--jd-radius-2xl);
      border-end-end-radius: var(--jd-radius-2xl);
    }

    .jd-action-sheet__item,
    .jd-action-sheet__cancel {
      width: 100%;
      padding: var(--jd-space-3-5) var(--jd-space-4);
      border: 0;
      background: var(--jd-color-card);
      cursor: pointer;
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-sm);
      text-align: center;
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-action-sheet__item {
      color: var(--jd-color-primary-ink);
      font-weight: var(--jd-weight-medium);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-action-sheet__item:last-child {
      border-block-end: 0;
    }
    .jd-action-sheet__item[data-danger] {
      color: var(--jd-color-danger);
    }
    .jd-action-sheet__item:hover:not(:disabled),
    .jd-action-sheet__cancel:hover {
      background: var(--jd-color-card-hover);
    }
    .jd-action-sheet__item:disabled {
      opacity: var(--jd-opacity-40);
      cursor: not-allowed;
    }
    .jd-action-sheet__item:focus-visible,
    .jd-action-sheet__cancel:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    .jd-action-sheet__cancel {
      color: var(--jd-color-foreground);
      font-weight: var(--jd-weight-semibold);
      border-radius: var(--jd-radius-2xl);
    }

    @media (prefers-reduced-motion: reduce) {
      jd-action-sheet .jd-modal__panel {
        animation: none;
      }
    }
  }
`;
