import { css } from "../../core/styles.js";

/**
 * v2 값: `grid grid-cols-2 md:grid-cols-4 gap-3`, 타일 `rounded-xl border border-border
 * bg-surface p-4`, 라벨 11px uppercase tracking-wider muted, 값 text-2xl bold foreground
 * tabular mt-1, 단위 text-sm normal muted, 오늘 바 mt-2 h-1 track gray-200/dark-800
 * 채움 primary. bg-surface→card, gray track→border 토큰(두 테마 성립). md=768.
 */
export default css`
@layer junds.components {
  jd-reading-stats {
    display: grid; box-sizing: border-box;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--jd-space-3);
    font-family: var(--jd-font-sans);
  }
  @media (min-width: 768px) {
    jd-reading-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }

  .jd-reading-stats__tile {
    box-sizing: border-box;
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    background: var(--jd-color-card);
    padding: var(--jd-space-4);
  }

  .jd-reading-stats__label {
    margin: 0; font-size: 11px;
    text-transform: uppercase; letter-spacing: 0.05em;
    color: var(--jd-color-muted);
  }
  .jd-reading-stats__value {
    margin: var(--jd-space-1) 0 0;
    font-size: var(--jd-text-2xl); font-weight: var(--jd-weight-bold);
    color: var(--jd-color-foreground); font-variant-numeric: tabular-nums;
    line-height: var(--jd-leading-tight);
  }
  .jd-reading-stats__unit {
    font-size: var(--jd-text-md); font-weight: var(--jd-weight-normal);
    color: var(--jd-color-muted);
  }

  .jd-reading-stats__track {
    margin-block-start: var(--jd-space-2);
    height: 0.25rem; overflow: hidden;
    background: var(--jd-color-border);
    border-radius: var(--jd-radius-full);
  }
  .jd-reading-stats__track[hidden] { display: none; }
  .jd-reading-stats__bar {
    height: 100%; border-radius: var(--jd-radius-full);
    background: var(--jd-color-primary);
    transition: width var(--jd-duration-slow) var(--jd-easing-default);
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-reading-stats__bar { transition: none; }
  }
}`;
