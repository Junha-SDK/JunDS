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
    jd-scatter-plot {
      /* 계열색은 hue 팔레트에서만(§8). 공용 기본값은 success/warning/danger를 계열색으로
       써서 "4번 시리즈"와 "위험"이 한 화면에서 같은 색이 된다 — 계열은 뜻이 없다. */
      --jd-chart-1: var(--jd-color-hue-violet);
      --jd-chart-2: var(--jd-color-hue-teal);
      --jd-chart-3: var(--jd-color-hue-amber);
      --jd-chart-4: var(--jd-color-hue-blue);
      --jd-chart-5: var(--jd-color-hue-rose);
      --jd-chart-6: var(--jd-color-hue-green);
      --jd-chart-7: var(--jd-color-hue-orange);
      /* 480px 뷰박스가 카드보다 넓으면 오른쪽 끝 x축 라벨이 잘린 채 끝났다(§6) */
      max-width: 100%;
      flex-wrap: wrap;
    }
    /* width/height는 표시 속성이라 CSS가 이긴다. height:auto면 viewBox가 비율을
     대신 말한다. min-width는 플렉스 자식의 min-width:auto(=내용 폭 480) 바닥을 풀되,
     범례 옆에서 뭉개지지 않게 컨테이너가 더 좁을 때만 양보하도록 잡는다. */
    jd-scatter-plot > .jd-chart__svg {
      max-width: 100%;
      height: auto;
      min-width: min(100%, 15rem);
    }

    .jd-chart__point {
      fill: var(--jd-series-color);
      fill-opacity: 0.8;
      stroke: var(--jd-series-color);
      stroke-width: 1;
    }
    .jd-chart__point[data-bubble] {
      fill-opacity: 0.5;
    }

    jd-scatter-plot:not(:defined) {
      display: inline-flex;
    }
  }
`;
