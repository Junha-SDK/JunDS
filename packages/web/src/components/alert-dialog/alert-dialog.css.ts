/**
 * jd-alert-dialog CSS — v2 AlertDialog/ConfirmDialog(중앙 카드 + 제목·설명 + 우측 정렬
 * 액션 2개, danger면 확인 버튼 위험색)의 토큰 번역.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-alert-dialog {
      display: none;
    }
    jd-alert-dialog[open] {
      display: flex;
      position: fixed;
      inset: 0;
      z-index: var(--jd-z-modal);
      align-items: center;
      justify-content: center;
      padding: var(--jd-space-4);
    }

    jd-alert-dialog .jd-modal__panel {
      max-width: min(26rem, calc(100vw - 2rem));
      padding: var(--jd-space-6);
      gap: var(--jd-space-2);
    }

    .jd-alert-dialog__title {
      margin: 0;
      font-size: var(--jd-text-lg);
      font-weight: var(--jd-weight-semibold);
    }
    .jd-alert-dialog__title[hidden] {
      display: none;
    }
    .jd-alert-dialog__desc {
      margin: 0;
      font-size: var(--jd-text-sm);
      color: var(--jd-color-muted);
      line-height: var(--jd-leading-relaxed);
    }
    .jd-alert-dialog__desc[hidden] {
      display: none;
    }

    .jd-alert-dialog__actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--jd-space-2);
      margin-block-start: var(--jd-space-4);
    }

    .jd-alert-dialog__cancel,
    .jd-alert-dialog__confirm {
      padding: var(--jd-space-2) var(--jd-space-4);
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-medium);
      border-radius: var(--jd-radius-lg);
      cursor: pointer;
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-alert-dialog__cancel {
      color: var(--jd-color-foreground);
      background: transparent;
      border: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-alert-dialog__cancel:hover {
      background: var(--jd-color-card-hover);
    }
    .jd-alert-dialog__cancel[hidden] {
      display: none;
    }
    .jd-alert-dialog__confirm {
      color: #ffffff;
      background: var(--jd-color-primary);
      border: 0;
    }
    .jd-alert-dialog__confirm:hover {
      background: var(--jd-color-primary-hover);
    }
    jd-alert-dialog[danger] .jd-alert-dialog__confirm {
      background: var(--jd-color-danger);
    }
    jd-alert-dialog[danger] .jd-alert-dialog__confirm:hover {
      background: var(--jd-color-danger-hover);
    }
    .jd-alert-dialog__cancel:focus-visible,
    .jd-alert-dialog__confirm:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-alert-dialog__cancel,
      .jd-alert-dialog__confirm {
        transition: none;
      }
    }
  }
`;
