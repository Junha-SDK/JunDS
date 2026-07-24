/**
 * jd-pie-chart CSS — 공용 CHART_CSS + 파이/도넛 고유값.
 * v2 값: 루트 `inline-flex items-center gap-4`(범례 동반), 가운데 라벨은
 * `fill-foreground font-semibold` + fontSize = size*0.12(JS 계산이라 속성 유지),
 * 범례는 `text-xs`에 라벨 foreground · 비율 muted tabular-nums.
 *
 * fill-rule: evenodd — 100% 도넛의 안쪽 원이 구멍이 되게 한다(조각이 하나뿐일 때의
 * 전체 원 경로. 일반 호 경로는 자기교차가 없어 규칙 차이가 결과에 영향을 주지 않는다).
 */
import { css } from "../../core/styles.js";
import { CHART_CSS } from "../../core/chart.styles.js";

export default css`
@layer junds.components {
${CHART_CSS}
  .jd-pie-chart__slice { fill: var(--jd-series-color); fill-rule: evenodd; }
  .jd-pie-chart__center {
    fill: var(--jd-color-foreground); font-weight: var(--jd-weight-semibold);
    font-variant-numeric: tabular-nums;
  }

  jd-pie-chart:not(:defined) { display: inline-flex; }
}`;
