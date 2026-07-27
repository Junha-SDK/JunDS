import { css } from "../../core/styles.js";

/**
 * v2 값: emerald/amber/red/blue/gray 50·700 리터럴 승계, rounded-full·medium,
 * dot 8px(500 계), size sm 10px / md xs.
 */
export default css`
@layer junds.components {
  jd-severity-badge {
    display: inline-flex; align-items: center; gap: var(--jd-space-1-5);
    border-radius: var(--jd-radius-full);
    font-family: var(--jd-font-sans); font-weight: var(--jd-weight-medium);
    white-space: nowrap;
    padding: var(--jd-space-1) var(--jd-space-2-5); font-size: var(--jd-text-xs);
    background: var(--jd-color-neutral-100); color: #4b5563; /* neutral 기본 */
  }
  jd-severity-badge[size="sm"] {
    padding: var(--jd-space-0-5) var(--jd-space-2); font-size: 10px;
  }

  jd-severity-badge[severity="ok"] { background: #ecfdf5; color: #047857; }
  jd-severity-badge[severity="warn"] { background: #fffbeb; color: #b45309; }
  jd-severity-badge[severity="danger"] { background: #fef2f2; color: #b91c1c; }
  jd-severity-badge[severity="info"] { background: #eff6ff; color: #1d4ed8; }

  jd-severity-badge[dot]::before {
    content: ""; flex-shrink: 0;
    width: 8px; height: 8px; border-radius: var(--jd-radius-full);
    background: var(--jd-color-neutral-400);
  }
  jd-severity-badge[dot][severity="ok"]::before { background: #10b981; }
  jd-severity-badge[dot][severity="warn"]::before { background: #f59e0b; }
  jd-severity-badge[dot][severity="danger"]::before { background: #ef4444; }
  jd-severity-badge[dot][severity="info"]::before { background: #3b82f6; }
}`;
