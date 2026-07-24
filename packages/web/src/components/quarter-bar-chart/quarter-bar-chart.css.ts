/**
 * jd-quarter-bar-chart CSS — 공용 CHART_CSS + 호스트 display.
 * 막대 두 색은 시리즈 그룹의 `--jd-series-color`가 나른다(element의 #aColor/#bColor).
 * 소비자는 `jd-quarter-bar-chart { --jd-qbar-revenue / --jd-qbar-op / --jd-qbar-net }`로
 * 팔레트를 갈아끼운다(기본은 v2 리터럴 승계).
 */
import { css } from "../../core/styles.js";
import { CHART_CSS } from "../../core/chart.styles.js";

export default css`
@layer junds.components {
${CHART_CSS}
  jd-quarter-bar-chart:not(:defined) { display: inline-block; }
}`;
