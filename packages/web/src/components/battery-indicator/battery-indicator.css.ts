import { css } from "../../core/styles.js";

/**
 * v2 값: body sm 40×16 / md 56×24 / lg 80×32 + 캡, 보더 gray-400(다크 gray-500),
 * 채움 green/amber/red/blue 500 리터럴(v2 Tailwind 승계), 호버 scale 1.05,
 * % 텍스트는 lg만(mix-blend-difference).
 */
export default css`
@layer junds.components {
  jd-battery-indicator {
    display: inline-flex; align-items: center; gap: var(--jd-space-1-5);
    font-family: var(--jd-font-sans);
    transition: transform var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  jd-battery-indicator:hover { transform: scale(1.05); }

  .jd-battery__label {
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-medium); color: #4b5563;
  }
  [data-jd-theme="dark"] .jd-battery__label,
  [data-theme="dark"] .jd-battery__label { color: #9ca3af; }

  .jd-battery__body {
    position: relative; overflow: hidden;
    border: 2px solid #9ca3af; border-radius: var(--jd-radius-sm);
    width: 3.5rem; height: 1.5rem; /* md 기본 56×24 */
  }
  [data-jd-theme="dark"] .jd-battery__body,
  [data-theme="dark"] .jd-battery__body { border-color: #6b7280; }
  jd-battery-indicator[size="sm"] .jd-battery__body { width: 2.5rem; height: 1rem; }
  jd-battery-indicator[size="lg"] .jd-battery__body { width: 5rem; height: 2rem; }

  .jd-battery__fill {
    position: absolute; inset-block: 0; left: 0;
    background: #3b82f6; /* primary 기본 (v2 blue-500) */
    transition: all var(--jd-duration-slower) var(--jd-easing-ease-out);
  }
  jd-battery-indicator[data-fill="success"] .jd-battery__fill { background: #22c55e; }
  jd-battery-indicator[data-fill="warning"] .jd-battery__fill { background: #f59e0b; }
  jd-battery-indicator[data-fill="danger"] .jd-battery__fill { background: #ef4444; }

  .jd-battery__pct {
    display: none;
    position: absolute; inset: 0;
    align-items: center; justify-content: center;
    font-size: 10px; font-weight: var(--jd-weight-bold);
    color: #fff; mix-blend-mode: difference;
  }
  jd-battery-indicator[size="lg"] .jd-battery__pct { display: flex; }

  .jd-battery__cap {
    border-start-end-radius: var(--jd-radius-sm);
    border-end-end-radius: var(--jd-radius-sm);
    background: #9ca3af;
    width: 6px; height: 12px; /* md */
  }
  [data-jd-theme="dark"] .jd-battery__cap,
  [data-theme="dark"] .jd-battery__cap { background: #6b7280; }
  jd-battery-indicator[size="sm"] .jd-battery__cap { width: 4px; height: 8px; }
  jd-battery-indicator[size="lg"] .jd-battery__cap { width: 8px; height: 16px; }

  @media (prefers-reduced-motion: reduce) {
    jd-battery-indicator, .jd-battery__fill { transition: none; }
    jd-battery-indicator:hover { transform: none; }
  }
}`;
