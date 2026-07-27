import { css } from "../../core/styles.js";

/** v2 값: xs 14 / sm 16 / md 20 / lg 28px, 색 primary/white/muted (currentColor 경유) */
export default css`
@layer junds.components {
  jd-spinner {
    display: inline-flex;
    color: var(--jd-color-primary-ink);
    width: 20px; height: 20px; /* md 기본 */
  }
  jd-spinner[size="xs"] { width: 14px; height: 14px; }
  jd-spinner[size="sm"] { width: 16px; height: 16px; }
  jd-spinner[size="lg"] { width: 28px; height: 28px; }
  jd-spinner[color="white"] { color: #fff; }
  jd-spinner[color="muted"] { color: var(--jd-color-muted); }

  .jd-spinner__svg {
    width: 100%; height: 100%;
    animation: jd-spin 1s linear infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .jd-spinner__svg { animation-duration: 1.6s; }
  }
}`;
