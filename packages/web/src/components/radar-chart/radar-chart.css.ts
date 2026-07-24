/**
 * jd-radar-chart CSS — 공용 CHART_CSS + 레이더 고유값.
 * v2 값: 루트 `inline-flex items-center gap-4`(범례 동반), 격자 폴리곤
 * stroke=var(--border) strokeOpacity=.4 strokeWidth=1, 축선 strokeOpacity=.3,
 * 데이터 폴리곤 fillOpacity=0.2(프롭) · strokeWidth=1.5 · linejoin=round,
 * 축 라벨 10px `fill-muted` 중앙정렬, 꼭짓점 점 r=2.5.
 */
import { css } from "../../core/styles.js";
import { CHART_CSS } from "../../core/chart.styles.js";

export default css`
@layer junds.components {
${CHART_CSS}
  jd-radar-chart { --jd-chart-fill-opacity: .2; }

  .jd-radar-chart__grid-ring {
    fill: none; stroke: var(--jd-color-border);
    stroke-opacity: .4; stroke-width: 1;
  }
  .jd-radar-chart__spoke {
    stroke: var(--jd-color-border); stroke-opacity: .3; stroke-width: 1;
  }
  .jd-radar-chart__shape {
    fill: var(--jd-series-color);
    fill-opacity: var(--jd-chart-fill-opacity, .2);
    stroke: var(--jd-series-color); stroke-width: 1.5; stroke-linejoin: round;
  }

  jd-radar-chart:not(:defined) { display: inline-flex; }
}`;
