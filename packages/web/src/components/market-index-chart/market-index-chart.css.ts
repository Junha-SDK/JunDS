import { css } from "../../core/styles.js";

/**
 * jd-market-index-chart CSS — v2 finance/MarketIndexChart.
 * 카드 + 시간대 알약(활성 = accent 틴트) + MA 범례. 실제 차트는 중첩 <jd-candle-chart>.
 * 알약은 클래스 셀렉터(0,1,0)라 전역 :where() 버튼 리셋(0,0,0)을 이긴다.
 */
export default css`
@layer junds.components {
  :where(jd-market-index-chart) {
    --jd-fin-accent: var(--jd-color-primary);
    --jd-fin-accent-strong: var(--jd-color-primary);
  }
  jd-market-index-chart { display: block; font-family: var(--jd-font-sans); }
  jd-market-index-chart:not(:defined) { display: block; }

  .jd-mic {
    padding: var(--jd-space-3);
    border-radius: var(--jd-radius-xl);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    background: var(--jd-color-card);
  }

  .jd-mic__toolbar {
    display: flex; align-items: center; gap: var(--jd-space-2);
    margin-block-end: var(--jd-space-1); flex-wrap: wrap; font-size: 11px;
  }
  .jd-mic__tabs { display: flex; align-items: center; gap: var(--jd-space-1-5); }
  .jd-mic__pill {
    cursor: pointer; border: 0; font-family: inherit;
    padding: 3px var(--jd-space-2-5); border-radius: var(--jd-radius-full);
    font-size: 11px; font-weight: 500;
    background: color-mix(in srgb, var(--jd-color-muted) 10%, transparent);
    color: var(--jd-color-muted);
  }
  .jd-mic__pill[data-active] {
    background: color-mix(in srgb, var(--jd-fin-accent) 14%, transparent);
    color: var(--jd-fin-accent-strong); font-weight: 700;
  }
  .jd-mic__pill:focus-visible {
    outline: var(--jd-border-medium) solid var(--jd-color-primary); outline-offset: 2px;
  }

  .jd-mic__legend {
    margin: 0 0 0 auto; padding: 0; list-style: none;
    display: flex; align-items: center; gap: var(--jd-space-2);
    font-size: 11px; color: var(--jd-color-muted); font-variant-numeric: tabular-nums;
  }
  .jd-mic__legend-item { display: flex; align-items: center; gap: var(--jd-space-1); }
  .jd-mic__swatch { width: 12px; height: 12px; border-radius: var(--jd-radius-sm); }

  .jd-mic__chart { display: block; width: 100%; }
}`;
