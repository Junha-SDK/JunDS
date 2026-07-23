import { css } from "../../core/styles.js";

/**
 * v2 값: 점 sm 6 / md 8 / lg 10px, 색 success/warning/danger/info(=primary)/
 * neutral(gray-400)/pulse(success+펄스), 라벨 xs.
 */
export default css`
@layer junds.components {
  jd-status-dot {
    display: inline-flex; align-items: center; gap: var(--jd-space-1-5);
    font-family: var(--jd-font-sans);
  }
  jd-status-dot::before {
    content: ""; flex-shrink: 0;
    width: 8px; height: 8px; border-radius: var(--jd-radius-full);
    background: #9ca3af; /* neutral 기본 */
  }
  jd-status-dot[size="sm"]::before { width: 6px; height: 6px; }
  jd-status-dot[size="lg"]::before { width: 10px; height: 10px; }

  jd-status-dot[status="success"]::before { background: var(--jd-color-success); }
  jd-status-dot[status="warning"]::before { background: var(--jd-color-warning); }
  jd-status-dot[status="danger"]::before { background: var(--jd-color-danger); }
  jd-status-dot[status="info"]::before { background: var(--jd-color-primary); } /* v2 동형 */
  jd-status-dot[status="pulse"]::before {
    background: var(--jd-color-success);
    animation: jd-status-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .jd-status-dot__label { font-size: var(--jd-text-xs); color: var(--jd-color-foreground); }

  @keyframes jd-status-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
  }
  @media (prefers-reduced-motion: reduce) {
    jd-status-dot[status="pulse"]::before { animation: none; }
  }
}`;
