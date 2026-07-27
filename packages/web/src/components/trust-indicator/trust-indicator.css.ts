import { css } from "../../core/styles.js";

/**
 * jd-trust-indicator CSS — v2 composites/TrustIndicator.
 *
 * v2 값: 카드 `bg-white border border-border rounded-xl overflow-hidden`,
 * 헤더 `px-4 py-3 border-b border-border-light bg-gray-50/50` + 제목 sm semibold +
 * 점수 lg bold tabular-nums + 개수 10px muted, 행 `flex items-center gap-3 px-4 py-2.5`
 * (divide-y border-light), 라벨 sm medium, 설명 xs muted, 상태 10px semibold uppercase.
 *
 * 상태색은 의미축이라 토큰(success/danger/warning/muted)을 쓰고, 아이콘 원의 옅은
 * 채움만 v2 리터럴(dcfce7·fef2f2·fef3c7·f3f4f6)을 승계한다 — 토큰에 없는 톤이다.
 */
export default css`
@layer junds.components {
  jd-trust-indicator {
    display: block; box-sizing: border-box; overflow: hidden;
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    background: var(--jd-color-card);
    font-family: var(--jd-font-sans);
  }

  .jd-trust-indicator__header {
    display: flex; align-items: center; justify-content: space-between;
    gap: var(--jd-space-3);
    padding: var(--jd-space-3) var(--jd-space-4);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border-light);
    background: var(--jd-color-card-hover);
  }
  .jd-trust-indicator__header[hidden] { display: none; }
  .jd-trust-indicator__title {
    font-size: var(--jd-text-sm); font-weight: var(--jd-weight-semibold);
    color: var(--jd-color-foreground);
  }
  .jd-trust-indicator__score-box {
    display: inline-flex; align-items: center; gap: var(--jd-space-2);
  }
  .jd-trust-indicator__score {
    font-size: var(--jd-text-lg); font-weight: var(--jd-weight-bold);
    font-variant-numeric: tabular-nums;
    color: var(--_jd-trust-score, var(--jd-color-danger));
  }
  .jd-trust-indicator__count { font-size: 10px; color: var(--jd-color-muted); }
  jd-trust-indicator[data-score="high"] { --_jd-trust-score: var(--jd-color-success); }
  jd-trust-indicator[data-score="mid"] { --_jd-trust-score: var(--jd-color-warning); }

  .jd-trust-indicator__list { margin: 0; padding: 0; list-style: none; }

  .jd-trust-indicator__item {
    display: flex; align-items: center; gap: var(--jd-space-3);
    padding: var(--jd-space-2-5) var(--jd-space-4);
    /* v2 divide-y — 첫 행 위에는 선이 없다 */
    --_jd-trust-color: var(--jd-color-muted);
    --_jd-trust-tint: var(--jd-color-neutral-100);
  }
  .jd-trust-indicator__item + .jd-trust-indicator__item {
    border-block-start: var(--jd-border-thin) solid var(--jd-color-border-light);
  }
  .jd-trust-indicator__item[data-status="pass"] {
    --_jd-trust-color: var(--jd-color-success); --_jd-trust-tint: #dcfce7;
  }
  .jd-trust-indicator__item[data-status="fail"] {
    --_jd-trust-color: var(--jd-color-danger); --_jd-trust-tint: #fef2f2;
  }
  .jd-trust-indicator__item[data-status="warning"] {
    --_jd-trust-color: var(--jd-color-warning); --_jd-trust-tint: #fef3c7;
  }

  .jd-trust-indicator__icon {
    display: inline-flex; flex-shrink: 0; width: 16px; height: 16px;
    color: var(--_jd-trust-color);
  }
  .jd-trust-indicator__icon > svg { width: 100%; height: 100%; }
  .jd-trust-indicator__icon circle {
    fill: var(--_jd-trust-tint); stroke: currentColor; stroke-width: 1;
  }
  .jd-trust-indicator__icon path {
    fill: none; stroke: currentColor; stroke-width: 1.5;
    stroke-linecap: round; stroke-linejoin: round;
  }

  .jd-trust-indicator__body {
    display: flex; flex-direction: column; flex: 1 1 auto; min-width: 0;
  }
  .jd-trust-indicator__label {
    font-size: var(--jd-text-sm); font-weight: var(--jd-weight-medium);
    color: var(--jd-color-foreground);
  }
  .jd-trust-indicator__desc { font-size: var(--jd-text-xs); color: var(--jd-color-muted); }
  .jd-trust-indicator__desc[hidden] { display: none; }

  .jd-trust-indicator__status {
    flex-shrink: 0; font-size: 10px; font-weight: var(--jd-weight-semibold);
    text-transform: uppercase; color: var(--_jd-trust-color);
  }

  .jd-trust-indicator__sr {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }
}`;
