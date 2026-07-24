/**
 * jd-funnel-chart CSS — 공용 CHART_CSS + 퍼널 고유값.
 *
 * v2 값: 루트 `w-full`, 행 `flex items-center gap-3` + 인라인 height=stepH,
 * 막대 `rounded-lg transition-all duration-500 flex items-center justify-center
 * text-white text-sm font-bold` + minWidth 60px, 우측 `w-32 shrink-0 text-right`
 * (라벨 text-sm font-medium, 전환율 text-[10px] text-muted).
 *
 * 팔레트 순서만 v2 FunnelChart 고유다 — [primary, info, success, warning, danger].
 * 공용 슬롯 위에 2~5번만 덮어써서 같은 메커니즘을 유지한다.
 */
import { css } from "../../core/styles.js";
import { CHART_CSS } from "../../core/chart.styles.js";

export default css`
@layer junds.components {
${CHART_CSS}
  jd-funnel-chart {
    display: block; width: 100%;
    --jd-chart-2: var(--jd-color-info);
    --jd-chart-3: var(--jd-color-success);
    --jd-chart-4: var(--jd-color-warning);
    --jd-chart-5: var(--jd-color-danger);
  }
  jd-funnel-chart:not(:defined) { display: block; }

  .jd-funnel-chart__steps {
    margin: 0; padding: 0; list-style: none;
  }
  .jd-funnel-chart__step {
    display: flex; align-items: center; gap: var(--jd-space-3);
  }
  .jd-funnel-chart__track {
    flex: 1; display: flex; justify-content: center; min-width: 0;
  }
  .jd-funnel-chart__bar {
    display: flex; align-items: center; justify-content: center;
    min-width: 60px; box-sizing: border-box;
    border-radius: var(--jd-radius-lg);
    background: var(--jd-series-color); color: #fff;
    font-size: var(--jd-text-md); font-weight: var(--jd-weight-bold);
    font-variant-numeric: tabular-nums;
    transition: width var(--jd-duration-slower) var(--jd-easing-default);
  }
  .jd-funnel-chart__meta {
    width: 8rem; flex-shrink: 0; text-align: right;
  }
  .jd-funnel-chart__label {
    margin: 0; font-size: var(--jd-text-md); font-weight: var(--jd-weight-medium);
  }
  .jd-funnel-chart__rate {
    margin: 0; font-size: 10px; color: var(--jd-color-muted);
    font-variant-numeric: tabular-nums;
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-funnel-chart__bar { transition: none; }
  }
}`;
