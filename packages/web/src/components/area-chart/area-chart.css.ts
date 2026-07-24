/**
 * jd-area-chart CSS — 공용 CHART_CSS + 영역 차트 고유값.
 * v2 값: 루트 `inline-block`, 영역 fillOpacity=0.25(프롭), 상단선 strokeWidth=2
 * round cap/join. 투명도는 프롭이 호스트의 `--jd-chart-fill-opacity`로 실린다.
 * 보간 근거는 core/chart.styles.ts 주석 참조.
 */
import { css } from "../../core/styles.js";
import { CHART_CSS } from "../../core/chart.styles.js";

export default css`
@layer junds.components {
${CHART_CSS}
  jd-area-chart { --jd-chart-fill-opacity: .25; }
  jd-area-chart:not(:defined) { display: inline-block; }
}`;
