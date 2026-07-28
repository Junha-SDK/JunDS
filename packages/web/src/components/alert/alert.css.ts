/**
 * jd-alert CSS — v2 composites/Alert(좌측 4px 강조선 + 5% 틴트 배경 + 20% 테두리).
 * 본문 글자는 foreground(대비), 아이콘·제목만 variant 색 — semantic 원색을 본문
 * 텍스트에 쓰면 AA에 걸린다(DEC-030-7).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-alert {
      display: flex;
      align-items: flex-start;
      gap: var(--jd-space-3);
      box-sizing: border-box;
      padding: var(--jd-space-4);
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
      border: var(--jd-border-thin) solid
        color-mix(in srgb, var(--_jd-alert-color) 20%, transparent);
      border-inline-start: var(--jd-border-thick) solid var(--_jd-alert-color);
      border-radius: var(--jd-radius-lg);
      background: color-mix(in srgb, var(--_jd-alert-color) 5%, transparent);
      --_jd-alert-color: var(--jd-color-primary); /* variant 기본 info */
    }
    jd-alert[hidden] {
      display: none;
    }
    jd-alert[variant="success"] {
      --_jd-alert-color: var(--jd-color-success);
    }
    jd-alert[variant="warning"] {
      --_jd-alert-color: var(--jd-color-warning);
    }
    jd-alert[variant="danger"] {
      --_jd-alert-color: var(--jd-color-danger);
    }

    .jd-alert__icon {
      display: flex;
      flex-shrink: 0;
      margin-block-start: var(--jd-space-px);
      color: var(--_jd-alert-color);
    }
    .jd-alert__body {
      flex: 1;
      min-width: 0;
    }
    .jd-alert__title {
      margin: 0 0 var(--jd-space-1);
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-semibold);
      /* 제목도 텍스트라 원색 대신 혼합값(AA) */
      color: color-mix(in srgb, var(--_jd-alert-color) 65%, var(--jd-color-foreground));
    }
    .jd-alert__title[hidden] {
      display: none;
    }
    .jd-alert__content {
      font-size: var(--jd-text-sm);
      line-height: var(--jd-leading-relaxed);
    }

    .jd-alert__close {
      display: flex;
      flex-shrink: 0;
      padding: var(--jd-space-1);
      border: 0;
      background: none;
      cursor: pointer;
      color: var(--jd-color-muted);
      border-radius: var(--jd-radius-md);
      transition: color var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-alert__close:hover {
      color: var(--jd-color-foreground);
    }
    .jd-alert__close[hidden] {
      display: none;
    }
    .jd-alert__close:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-alert__close {
        transition: none;
      }
    }
  }
`;
