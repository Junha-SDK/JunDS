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
    /* text-field와 동일 계약: 입력면은 불투명, 흐림 없음 (DEC-039) */
    background: var(--jd-color-control-surface);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    caret-color: var(--jd-color-primary);
    border-radius: var(--jd-radius-xl);
    /* 카운터(우하단 절대배치)와 글자가 겹치지 않도록 아래 여백을 카운터 높이만큼 준다 */
    padding: var(--jd-space-2-5) var(--jd-space-3-5);
    transition:
      border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
      background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
      box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out);
  }
  /* show-count는 maxLength>0일 때만 실제로 배지가 뜨므로(element.ts) 속성이 아니라
     '배지가 보이는가'로 판정한다 — :has (DEC-004 에버그린 전제) */
  jd-textarea:has(> .jd-textarea__count:not([hidden])) > .jd-textarea__input {
    padding-bottom: var(--jd-space-6);
  }
  .jd-textarea__input::placeholder { color: var(--jd-color-neutral-400); }
  .jd-textarea__input::selection {
    background: color-mix(in srgb, var(--jd-color-primary) 26%, transparent);
  }
  .jd-textarea__input:hover:not(:disabled):not(:focus) {
    border-color: var(--jd-color-neutral-300);
    background: var(--jd-color-control-surface-hover);
  }
  .jd-textarea__input:focus {
    outline: var(--jd-focus-ring); outline-offset: var(--jd-focus-ring-offset);
    border-color: var(--jd-color-primary);
    background: var(--jd-color-control-surface);
  }
  .jd-textarea__input:disabled {
    cursor: not-allowed;
    background: var(--jd-color-control-surface-muted);
    border-color: var(--jd-color-border-light);
    color: var(--jd-color-neutral-500);
  }

  jd-textarea[auto-resize] > .jd-textarea__input { resize: none; overflow: hidden; }

  jd-textarea[error] > .jd-textarea__input { border-color: var(--jd-color-danger); }
  jd-textarea[error] > .jd-textarea__input:focus {
    border-color: var(--jd-color-danger);
    outline: var(--jd-focus-ring-danger); outline-offset: var(--jd-focus-ring-offset);
  }

  .jd-textarea__count {
    position: absolute; bottom: var(--jd-space-2); right: var(--jd-space-3);
    /* muted-light는 AA 미달 → muted (DEC-027) */
    font-size: var(--jd-text-xs); color: var(--jd-color-muted);
    pointer-events: none;
  }
  .jd-textarea__count[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .jd-textarea__input { transition: none; }
  }
}`;
