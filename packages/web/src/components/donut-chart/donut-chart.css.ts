/**
 * jd-donut-chart CSS — 공용 CHART_CSS + 도넛 고유값.
 * v2 값: 배경 트랙 stroke=var(--bm-grid)·두께=thickness, 조각은 stroke-linecap butt,
 * 가운데 라벨 fill=var(--bm-axis) 700 / 값 fill=var(--bm-text) 800.
 *
 * 색은 CHART_CSS 규약대로 --jd-series-color 경유로만 건다(stroke 속성에 박지 않는다).
 */
import { css } from "../../core/styles.js";
import { CHART_CSS } from "../../core/chart.styles.js";

export default css`
@layer junds.components {
${CHART_CSS}
  jd-donut-chart:not(:defined) { display: inline-flex; }

  .jd-donut-chart__track {
    fill: none; stroke: var(--jd-color-border); stroke-opacity: .5;
  }
  .jd-donut-chart__seg {
    fill: none; stroke: var(--jd-series-color); stroke-linecap: butt;
  }
  .jd-donut-chart__center-label {
    fill: var(--jd-color-muted); font-weight: var(--jd-weight-bold);
    font-variant-numeric: tabular-nums;
  }
  .jd-donut-chart__center-value {
    fill: var(--jd-color-foreground); font-weight: var(--jd-weight-bold);
    font-variant-numeric: tabular-nums;
  }
}`;
