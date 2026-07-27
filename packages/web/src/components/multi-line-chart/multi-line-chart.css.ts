import { css } from "../../core/styles.js";
import { CHART_CSS } from "../../core/chart.styles.js";

/**
 * jd-multi-line-chart CSS — 축·격자·시리즈 선·범례·데이터 표는 CHART_CSS(공용)가 담고,
 * 여기서는 비교 차트 고유값만 얹는다: 0% 기준선, 끝점 헤드(흰 테두리), hover 크로스헤어+
 * 시리즈 점, 어두운 툴팁. 색은 시리즈 그룹의 --jd-series-color 경유(표시 속성에 안 박음).
 */
export default css`
@layer junds.components {
${CHART_CSS}
  jd-multi-line-chart:not(:defined) { display: inline-block; }
  jd-multi-line-chart .jd-chart__svg {
    font-family: var(--jd-font-sans); font-variant-numeric: tabular-nums;
  }

  /* 0% 기준선 */
  .jd-mlc__zero {
    stroke: var(--jd-fin-muted, var(--jd-color-muted));
    stroke-dasharray: 3 3; stroke-opacity: .6;
  }

  /* 시리즈 끝점 헤드 */
  .jd-mlc__head {
    fill: var(--jd-series-color);
    stroke: var(--jd-color-card, #fff); stroke-width: 1.5;
  }

  /* hover */
  .jd-mlc__crosshair {
    stroke: var(--jd-color-muted); stroke-dasharray: 3 3; stroke-opacity: .5;
  }
  .jd-mlc__hoverdot {
    fill: var(--jd-series-color);
    stroke: var(--jd-color-card, #fff); stroke-width: 1.5;
  }

  /* 툴팁 — 색은 candle-chart와 공유하는 --jd-fin-tooltip-* 토큰 경유(슬레이트 폴백),
     소비자가 두 차트의 툴팁을 한 번에 리브랜딩할 수 있게 한다 */
  .jd-mlc__tip-bg {
    fill: var(--jd-fin-tooltip-bg, #1e293b);
    stroke: var(--jd-fin-tooltip-border, rgba(148, 163, 184, 0.25));
    stroke-width: 1;
  }
  .jd-mlc__tip-label { fill: var(--jd-fin-tooltip-muted, var(--jd-color-neutral-400)); font-size: 10px; font-weight: 700; }
  .jd-mlc__tip-dot { fill: var(--jd-series-color); }
  .jd-mlc__tip-name { fill: var(--jd-fin-tooltip-muted, var(--jd-color-neutral-400)); font-size: 11px; font-weight: 600; }
  .jd-mlc__tip-val { fill: var(--jd-fin-tooltip-fg, var(--jd-color-neutral-200)); font-size: 11px; font-weight: 800; text-anchor: end; }
}`;
