/**
 * jd-action-bar CSS — v2 ActionBar 표면의 토큰 번역.
 * v2 값: `fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4
 * py-2.5 rounded-xl bg-foreground text-white shadow-2xl animate-slide-up`, count
 * `text-sm font-medium tabular-nums`, divider `w-px h-5 bg-white/20`, clear
 * `text-xs text-white/70 hover:text-white`.
 *
 * 참고: v2가 bg-foreground를 그대로 썼으므로(다크 반전 표면) 값 패리티를 위해
 * --jd-color-foreground를 유지한다 — 다크 테마에서 밝아지는 v2 동작을 그대로 재현한다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-action-bar { display: none; }
  jd-action-bar[open] {
    position: fixed; z-index: var(--jd-z-toast); box-sizing: border-box;
    inset-block-end: var(--jd-space-6); inset-inline-start: 50%;
    transform: translateX(-50%);
    display: inline-flex; align-items: center; gap: var(--jd-space-3);
    max-width: calc(100vw - 2rem);
    padding: var(--jd-space-2-5) var(--jd-space-4);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-sm);
    color: #ffffff; background: var(--jd-color-foreground);
    border-radius: var(--jd-radius-xl); box-shadow: var(--jd-shadow-2xl);
    animation: jd-action-bar-in var(--jd-duration-normal) var(--jd-easing-ease-out);
  }

  .jd-action-bar__count {
    font-weight: var(--jd-weight-medium); font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .jd-action-bar__divider {
    flex-shrink: 0; width: 1px; height: 1.25rem; background: rgba(255, 255, 255, 0.2);
  }
  .jd-action-bar__divider[hidden] { display: none; }
  .jd-action-bar__actions { display: flex; align-items: center; gap: var(--jd-space-2); }

  .jd-action-bar__clear {
    border: 0; background: none; cursor: pointer; padding: 0;
    font-family: inherit; font-size: var(--jd-text-xs);
    color: rgba(255, 255, 255, 0.7);
    transition: color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-action-bar__clear:hover { color: #ffffff; }
  .jd-action-bar__clear:focus-visible {
    outline: none; color: #ffffff;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5); border-radius: var(--jd-radius-sm);
  }
  .jd-action-bar__clear[hidden] { display: none; }

  @keyframes jd-action-bar-in { from { opacity: 0; transform: translate(-50%, 1rem); } }
  @media (prefers-reduced-motion: reduce) {
    jd-action-bar[open] { animation: none; }
  }
}`;
