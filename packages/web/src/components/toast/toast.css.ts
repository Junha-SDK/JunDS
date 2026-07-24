/**
 * jd-toast CSS — 토스트 스택(모서리 고정) + 개별 카드.
 * 카드 표면은 jd-notification과 같은 어휘(30% 테두리 + 틴트)를 쓴다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-toast {
    position: fixed; z-index: var(--jd-z-toast);
    display: flex; flex-direction: column; gap: var(--jd-space-2);
    width: min(22rem, calc(100vw - 2rem));
    pointer-events: none; /* 빈 영역이 아래 UI를 막지 않는다 */
    /* position 기본 top-right */
    inset-block-start: var(--jd-space-6); inset-inline-end: var(--jd-space-6);
  }
  jd-toast[position="top-left"] { inset-inline-end: auto; inset-inline-start: var(--jd-space-6); }
  jd-toast[position="bottom-right"] {
    inset-block-start: auto; inset-block-end: var(--jd-space-6);
    flex-direction: column-reverse;
  }
  jd-toast[position="bottom-left"] {
    inset-block-start: auto; inset-block-end: var(--jd-space-6);
    inset-inline-end: auto; inset-inline-start: var(--jd-space-6);
    flex-direction: column-reverse;
  }
  jd-toast[position="top"] {
    inset-inline: 0; margin-inline: auto;
  }
  jd-toast[position="bottom"] {
    inset-block-start: auto; inset-block-end: var(--jd-space-6);
    inset-inline: 0; margin-inline: auto; flex-direction: column-reverse;
  }

  .jd-toast__item {
    position: relative; pointer-events: auto; box-sizing: border-box;
    padding: var(--jd-space-3-5) var(--jd-space-8) var(--jd-space-3-5) var(--jd-space-4);
    font-family: var(--jd-font-sans);
    background: color-mix(in srgb, var(--_jd-toast-color) 5%, var(--jd-color-card));
    border: var(--jd-border-thin) solid color-mix(in srgb, var(--_jd-toast-color) 30%, transparent);
    border-radius: var(--jd-radius-xl); box-shadow: var(--jd-shadow-lg);
    animation: jd-toast-in var(--jd-duration-normal) var(--jd-easing-ease-out);
    --_jd-toast-color: var(--jd-color-info);
  }
  .jd-toast__item[data-variant="success"] { --_jd-toast-color: var(--jd-color-success); }
  .jd-toast__item[data-variant="warning"] { --_jd-toast-color: var(--jd-color-warning); }
  .jd-toast__item[data-variant="danger"] { --_jd-toast-color: var(--jd-color-danger); }

  .jd-toast__title {
    margin: 0; font-size: var(--jd-text-sm); font-weight: var(--jd-weight-semibold);
    color: var(--jd-color-foreground);
  }
  .jd-toast__desc {
    margin: var(--jd-space-0-5) 0 0; font-size: var(--jd-text-sm);
    color: var(--jd-color-muted);
  }
  .jd-toast__close {
    position: absolute; inset-block-start: var(--jd-space-2);
    inset-inline-end: var(--jd-space-2);
    width: 1.5rem; height: 1.5rem; padding: 0;
    display: flex; align-items: center; justify-content: center;
    border: 0; background: none; cursor: pointer;
    font-size: var(--jd-text-md); line-height: 1;
    color: var(--jd-color-muted); border-radius: var(--jd-radius-md);
  }
  .jd-toast__close:hover { color: var(--jd-color-foreground); background: var(--jd-color-card-hover); }
  .jd-toast__close:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  @keyframes jd-toast-in { from { opacity: 0; transform: translateY(-0.5rem); } }

  @media (prefers-reduced-motion: reduce) {
    .jd-toast__item { animation: none; }
  }
}`;
