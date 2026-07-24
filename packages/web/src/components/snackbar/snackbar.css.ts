/**
 * jd-snackbar CSS — v2 composites/Snackbar(어두운 알약 + 위치 4종 + 슬라이드 인).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-snackbar { display: none; }
  jd-snackbar[open] {
    display: flex; align-items: center; gap: var(--jd-space-3);
    position: fixed; z-index: var(--jd-z-toast); box-sizing: border-box;
    max-width: min(28rem, calc(100vw - 2rem));
    padding: var(--jd-space-3) var(--jd-space-4);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-sm);
    color: #ffffff; background: var(--jd-color-surface-overlay);
    border-radius: var(--jd-radius-xl); box-shadow: var(--jd-shadow-lg);
    animation: jd-snackbar-in var(--jd-duration-normal) var(--jd-easing-ease-out);
    /* position 기본 bottom(중앙) */
    inset-block-end: var(--jd-space-6); inset-inline-start: 50%;
    transform: translateX(-50%);
  }
  jd-snackbar[position="top"][open] {
    inset-block-end: auto; inset-block-start: var(--jd-space-6);
    animation-name: jd-snackbar-in-top;
  }
  jd-snackbar[position="bottom-left"][open] {
    inset-inline-start: var(--jd-space-6); transform: none;
  }
  jd-snackbar[position="bottom-right"][open] {
    inset-inline-start: auto; inset-inline-end: var(--jd-space-6); transform: none;
  }

  jd-snackbar[variant="success"][open] { background: var(--jd-color-success); }
  jd-snackbar[variant="error"][open] { background: var(--jd-color-danger); }
  jd-snackbar[variant="warning"][open] { background: var(--jd-color-warning); }
  jd-snackbar[variant="info"][open] { background: var(--jd-color-info); }

  .jd-snackbar__message { flex: 1; min-width: 0; }
  jd-snackbar > [slot="action"] { flex-shrink: 0; }

  @keyframes jd-snackbar-in { from { opacity: 0; transform: translate(-50%, 1rem); } }
  @keyframes jd-snackbar-in-top { from { opacity: 0; transform: translate(-50%, -1rem); } }

  @media (prefers-reduced-motion: reduce) {
    jd-snackbar[open] { animation: none; }
  }
}`;
