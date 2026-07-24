/**
 * jd-bar-chart CSS — 공용 CHART_CSS + 막대 고유값.
 * v2 값: 루트 `inline-block`, 막대 rx=2 · 두께 barSize*0.8, 값 라벨 10px `fill-muted`.
 * 막대 색은 시리즈 그룹의 `--jd-series-color`가 나른다(CHART_CSS의 .jd-chart__bar).
 * 보간 근거는 core/chart.styles.ts 주석 참조.
 */
import { css } from "../../core/styles.js";
import { CHART_CSS } from "../../core/chart.styles.js";

export default css`
@layer junds.components {
${CHART_CSS}
  jd-bar-chart:not(:defined) { display: inline-block; }
}`;
