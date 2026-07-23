import { css } from "../../core/styles.js";

/**
 * jd-text-field 입력 표면과 동일 어휘(card 80% 유리 배경·글로우 포커스·radius xl).
 * v2 고유값: min-height 80px, resize-y(세로만), auto-resize 시 resize 차단.
 */
export default css`
@layer junds.components {
  jd-textarea { display: block; position: relative; }

  .jd-textarea__input {
    display: block; width: 100%; box-sizing: border-box; margin: 0;
    min-height: 80px; resize: vertical;
    font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
    font-size: var(--jd-text-md); line-height: var(--jd-leading-normal);
    background: color-mix(in srgb, var(--jd-color-card) 80%, transparent);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    backdrop-filter: blur(4px);
    border-radius: var(--jd-radius-xl);
    padding: var(--jd-space-2-5) var(--jd-space-3-5);
    transition: all var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-textarea__input::placeholder {
    color: color-mix(in srgb, var(--jd-color-muted-light) 60%, transparent);
  }
  .jd-textarea__input:focus {
    outline: none; border-color: var(--jd-color-primary);
    background: var(--jd-color-card);
    box-shadow: var(--jd-shadow-focus-ring), var(--jd-shadow-xs);
  }
  .jd-textarea__input:disabled {
    opacity: var(--jd-opacity-40); cursor: not-allowed;
    background: var(--jd-color-card-hover);
  }

  jd-textarea[auto-resize] > .jd-textarea__input { resize: none; overflow: hidden; }

  jd-textarea[error] > .jd-textarea__input { border-color: var(--jd-color-danger); }
  jd-textarea[error] > .jd-textarea__input:focus {
    border-color: var(--jd-color-danger);
    box-shadow: var(--jd-shadow-focus-ring-danger), var(--jd-shadow-xs);
  }

  .jd-textarea__count {
    position: absolute; bottom: var(--jd-space-2); right: var(--jd-space-3);
    /* muted-light(2.8:1)는 유리 배경 위 AA 미달 — muted로 보정 (DEC-025 web-a11y) */
    font-size: var(--jd-text-xs); color: var(--jd-color-muted);
    pointer-events: none;
  }
  .jd-textarea__count[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .jd-textarea__input { transition: none; }
  }
}`;
