/**
 * jd-scatter-plot CSS — 공용 CHART_CSS + 점 고유값.
 * v2 값: 루트 `inline-flex items-center gap-4`(범례 동반), 점 fillOpacity 0.8 /
 * 버블(size 지정) 0.5, stroke=색 strokeWidth=1, 범례 견본은 `rounded-full`.
 * 색은 시리즈 그룹의 `--jd-series-color` 경유 — 표시 속성에 박지 않는다.
 */
import { css } from "../../core/styles.js";
import { CHART_CSS } from "../../core/chart.styles.js";

export default css`
@layer junds.components {
${CHART_CSS}
  .jd-chart__point {
    fill: var(--jd-series-color); fill-opacity: .8;
    stroke: var(--jd-series-color); stroke-width: 1;
  }
  .jd-chart__point[data-bubble] { fill-opacity: .5; }

  jd-scatter-plot:not(:defined) { display: inline-flex; }
}`;
