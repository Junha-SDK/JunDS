/**
 * jd-line-chart CSS.
 * 축·격자·시리즈·범례·데이터 표는 CHART_CSS(공용)가 담고, 여기서는 라인 차트
 * 고유값만 얹는다. v2 값: 루트 `inline-block`, 선 strokeWidth=2 · linecap/join=round,
 * 점 r=2.5, 영역 fillOpacity=0.15, 축 텍스트 10px `fill-muted`.
 * 보간 근거는 core/chart.styles.ts 주석 참조.
 */
import { css } from "../../core/styles.js";
import { CHART_CSS } from "../../core/chart.styles.js";

export default css`
@layer junds.components {
${CHART_CSS}
  jd-line-chart:not(:defined) { display: inline-block; }
}`;
