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
    jd-area-chart {
      --jd-chart-fill-opacity: 0.25;
      /* 계열색은 hue 팔레트에서만(§8) — 공용 기본값은 success/warning/danger를 계열색
       으로 써서 "2번 시리즈"와 "성공"이 같은 색이 된다. 계열은 범주일 뿐 뜻이 없다. */
      --jd-chart-1: var(--jd-color-hue-violet);
      --jd-chart-2: var(--jd-color-hue-teal);
      --jd-chart-3: var(--jd-color-hue-amber);
      --jd-chart-4: var(--jd-color-hue-blue);
      --jd-chart-5: var(--jd-color-hue-rose);
      --jd-chart-6: var(--jd-color-hue-green);
      --jd-chart-7: var(--jd-color-hue-orange);
      /* 480px 뷰박스가 카드보다 넓으면 오른쪽 끝 x축 라벨("6월")이 잘린 채 끝났다(§6) */
      max-width: 100%;
      flex-wrap: wrap;
    }
    /* width/height는 표시 속성이라 CSS가 이긴다. height:auto면 viewBox가 비율을
     대신 말하므로 폭만 줄여도 그림이 찌그러지지 않는다. min-width는 플렉스 자식의
     min-width:auto(=내용 폭 480) 바닥을 풀되, 범례 옆에서 한 줄로 뭉개지지 않게
     컨테이너가 더 좁을 때만 양보하도록 잡는다. */
    jd-area-chart > .jd-chart__svg {
      max-width: 100%;
      height: auto;
      min-width: min(100%, 15rem);
    }
    jd-area-chart:not(:defined) {
      display: inline-block;
    }
  }
`;
