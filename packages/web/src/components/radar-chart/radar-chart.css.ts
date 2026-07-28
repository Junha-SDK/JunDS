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
    jd-radar-chart {
      --jd-chart-fill-opacity: 0.2;
      /* 계열색은 hue 팔레트에서만(§8). 공용 기본값은 success/warning/danger를 계열색으로
       써서 "2번 시리즈"와 "성공"이 한 화면에서 같은 색이 된다 — 계열은 뜻이 없다. */
      --jd-chart-1: var(--jd-color-hue-violet);
      --jd-chart-2: var(--jd-color-hue-teal);
      --jd-chart-3: var(--jd-color-hue-amber);
      --jd-chart-4: var(--jd-color-hue-blue);
      --jd-chart-5: var(--jd-color-hue-rose);
      --jd-chart-6: var(--jd-color-hue-green);
      --jd-chart-7: var(--jd-color-hue-orange);
      /* 정사각 280px + 범례가 카드보다 넓으면 축 라벨이 잘린 채 끝났다(§6) */
      max-width: 100%;
      flex-wrap: wrap;
    }
    /* width/height는 표시 속성이라 CSS가 이긴다. height:auto면 viewBox가 정사각
     비율을 대신 말한다. min-width는 플렉스 자식의 min-width:auto 바닥을 풀되,
     축 라벨이 겹쳐 읽히지 않을 만큼은 남긴다. */
    jd-radar-chart > .jd-chart__svg {
      max-width: 100%;
      height: auto;
      min-width: min(100%, 10rem);
    }

    .jd-radar-chart__grid-ring {
      fill: none;
      stroke: var(--jd-color-border);
      stroke-opacity: 0.4;
      stroke-width: 1;
    }
    .jd-radar-chart__spoke {
      stroke: var(--jd-color-border);
      stroke-opacity: 0.3;
      stroke-width: 1;
    }
    .jd-radar-chart__shape {
      fill: var(--jd-series-color);
      fill-opacity: var(--jd-chart-fill-opacity, 0.2);
      stroke: var(--jd-series-color);
      stroke-width: 1.5;
      stroke-linejoin: round;
    }

    jd-radar-chart:not(:defined) {
      display: inline-flex;
    }
  }
`;
