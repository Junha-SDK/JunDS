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
    jd-line-chart {
      /* 계열색은 hue 팔레트에서만 뽑는다(§8). 공용 기본값은 success/warning/danger를
       계열색으로 쓰고 있어, 같은 화면에서 "3번 시리즈"와 "경고"가 같은 색이 된다 —
       계열은 범주일 뿐 뜻이 없다. */
      --jd-chart-1: var(--jd-color-hue-violet);
      --jd-chart-2: var(--jd-color-hue-teal);
      --jd-chart-3: var(--jd-color-hue-amber);
      --jd-chart-4: var(--jd-color-hue-blue);
      --jd-chart-5: var(--jd-color-hue-rose);
      --jd-chart-6: var(--jd-color-hue-green);
      --jd-chart-7: var(--jd-color-hue-orange);
      /* 480px 뷰박스가 카드보다 넓으면 오른쪽 끝 x축 라벨이 잘린 채 끝났다(§6).
       범례까지 한 줄에 못 들어가면 줄을 바꾼다 — 눌러 담으면 둘 다 못 읽는다. */
      max-width: 100%;
      flex-wrap: wrap;
    }
    /* SVG의 width/height는 표시 속성이라 CSS가 이긴다. height:auto면 viewBox가
     비율을 대신 말하므로 폭만 줄여도 그림이 찌그러지지 않는다. */
    jd-line-chart > .jd-chart__svg {
      max-width: 100%;
      height: auto;
      /* 플렉스 자식의 min-width:auto는 내용 폭(480)이 바닥이라 실제로는 줄지 않는다.
       그렇다고 0까지 풀면 범례 옆에서 실선 한 줄로 뭉개진다 — 컨테이너가 이보다
       좁을 때만 양보한다. */
      min-width: min(100%, 15rem);
    }
    jd-line-chart:not(:defined) {
      display: inline-block;
    }
  }
`;
