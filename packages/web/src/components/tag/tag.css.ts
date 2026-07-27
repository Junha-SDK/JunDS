import { css } from "../../core/styles.js";

/**
 * v2 값: 8색(gray/primary/blue/green/red/orange/purple/teal — Tailwind 50/700 계
 * 리터럴 승계, primary만 토큰), rounded-md·xs·medium, 닫기 버튼 hover 70%.
 */
export default css`
@layer junds.components {
  jd-tag {
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    padding: var(--jd-space-0-5) var(--jd-space-2);
    border-radius: var(--jd-radius-md);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-medium); white-space: nowrap;
    background: var(--jd-color-neutral-100); color: #374151; /* gray 기본 */
  }
  jd-tag[color="primary"] { background: var(--jd-color-primary-light); color: var(--jd-color-primary); }
  jd-tag[color="blue"] { background: #eff6ff; color: #1d4ed8; }
  jd-tag[color="green"] { background: #ecfdf5; color: #047857; }
  jd-tag[color="red"] { background: #fef2f2; color: #b91c1c; }
  jd-tag[color="orange"] { background: #fff7ed; color: #c2410c; }
  jd-tag[color="purple"] { background: #faf5ff; color: #7e22ce; }
  jd-tag[color="teal"] { background: #f0fdfa; color: #0f766e; }

  .jd-tag__close {
    display: inline-flex; align-items: center; justify-content: center;
    margin-inline-start: var(--jd-space-0-5); padding: 0; border: 0;
    background: transparent; color: inherit; cursor: pointer;
    transition: opacity var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-tag__close:hover { opacity: 0.7; }
  .jd-tag__close:focus-visible {
    outline: var(--jd-border-medium) solid
      color-mix(in srgb, currentColor 40%, transparent);
    outline-offset: 1px; border-radius: var(--jd-radius-sm);
  }
}`;
