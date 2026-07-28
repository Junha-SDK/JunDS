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
    jd-pie-chart {
      /* 계열색은 hue 팔레트에서만(§8). 공용 기본값은 success/warning/danger를 조각색으로
       써서 "4번 조각"과 "위험"이 한 화면에서 같은 색이 된다 — 구성비는 뜻이 없다. */
      --jd-chart-1: var(--jd-color-hue-violet);
      --jd-chart-2: var(--jd-color-hue-teal);
      --jd-chart-3: var(--jd-color-hue-amber);
      --jd-chart-4: var(--jd-color-hue-blue);
      --jd-chart-5: var(--jd-color-hue-rose);
      --jd-chart-6: var(--jd-color-hue-green);
      --jd-chart-7: var(--jd-color-hue-orange);
      /* 원 200px + 범례가 카드보다 넓으면 범례가 잘린 채 끝났다(§6) */
      max-width: 100%;
      flex-wrap: wrap;
    }
    /* width/height는 표시 속성이라 CSS가 이긴다. height:auto면 viewBox가 정사각
     비율을 대신 말하므로 폭만 줄여도 원이 타원이 되지 않는다. */
    jd-pie-chart > .jd-chart__svg {
      max-width: 100%;
      height: auto;
      min-width: min(100%, 9rem);
    }

    .jd-pie-chart__slice {
      fill: var(--jd-series-color);
      fill-rule: evenodd;
      /* 인접한 두 조각의 명도가 비슷하면 경계가 사라진다 — 카드색 실선이 조각을
       떼어 놓는다(면과 면 사이를 색으로만 구분하지 않는다). */
      stroke: var(--jd-color-card);
      stroke-width: 1;
      stroke-linejoin: round;
    }
    .jd-pie-chart__center {
      fill: var(--jd-color-foreground);
      font-weight: var(--jd-weight-semibold);
      font-variant-numeric: tabular-nums;
    }

    jd-pie-chart:not(:defined) {
      display: inline-flex;
    }
  }
`;
