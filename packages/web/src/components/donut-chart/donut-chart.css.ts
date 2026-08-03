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
    jd-donut-chart {
      /* 계열색은 hue 팔레트에서만(§8). 공용 기본값은 success/warning/danger를 조각색으로
       써서 "3번 조각"과 "경고"가 한 화면에서 같은 색이 된다 — 구성비는 뜻이 없다. */
      --jd-chart-1: var(--jd-color-hue-violet);
      --jd-chart-2: var(--jd-color-hue-teal);
      --jd-chart-3: var(--jd-color-hue-amber);
      --jd-chart-4: var(--jd-color-hue-blue);
      --jd-chart-5: var(--jd-color-hue-rose);
      --jd-chart-6: var(--jd-color-hue-green);
      --jd-chart-7: var(--jd-color-hue-orange);
      /* 링 220px + 범례가 카드보다 넓으면 범례가 잘린 채 끝났다(§6) */
      max-width: 100%;
      flex-wrap: wrap;
    }
    /* width/height는 표시 속성이라 CSS가 이긴다. height:auto면 viewBox가 정사각
     비율을 대신 말하므로 폭만 줄여도 링이 타원이 되지 않는다. */
    jd-donut-chart > .jd-chart__svg {
      max-width: 100%;
      height: auto;
      min-width: min(100%, 9rem);
    }
    jd-donut-chart:not(:defined) {
      display: inline-flex;
    }

    .jd-donut-chart__track {
      fill: none;
      stroke: var(--jd-color-border);
      stroke-opacity: 0.5;
    }
    .jd-donut-chart__seg {
      fill: none;
      stroke: var(--jd-series-color);
      stroke-linecap: butt;
    }
    .jd-donut-chart__center-label {
      fill: var(--jd-color-muted);
      font-weight: var(--jd-weight-bold);
      font-variant-numeric: tabular-nums;
    }
    .jd-donut-chart__center-value {
      fill: var(--jd-color-foreground);
      font-weight: var(--jd-weight-bold);
      font-variant-numeric: tabular-nums;
    }
  }
`;
