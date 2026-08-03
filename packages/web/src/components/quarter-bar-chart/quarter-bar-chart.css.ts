/**
 * jd-quarter-bar-chart CSS — 공용 CHART_CSS + 호스트 display.
 * 막대 두 색은 시리즈 그룹의 `--jd-series-color`가 나른다(element의 #aColor/#bColor).
 * 소비자는 `jd-quarter-bar-chart { --jd-qbar-revenue / --jd-qbar-op / --jd-qbar-net }`로
 * 팔레트를 갈아끼운다 — 기본값을 **여기서** 정의하므로 element.ts의 폴백은 시트를 함께
 * 싣지 않은 경로에서만 발화한다. 그 폴백도 같은 hue 토큰으로 맞춰 두었다(§8).
 */
import { css } from "../../core/styles.js";
import { CHART_CSS } from "../../core/chart.styles.js";

export default css`
  @layer junds.components {
    ${CHART_CSS}
    jd-quarter-bar-chart {
      /* v2 승계 리터럴은 민트(#5cdcd0)·형광 보라(#a855f7)라 팔레트 밖이었다(§8).
       계열색은 hue 토큰에서만 뽑는다 — 매출/이익은 등락이 아니라 **범주**이므로
       success·danger 같은 의미색을 빌려 쓰지 않는다. */
      --jd-qbar-revenue: var(--jd-color-hue-violet);
      --jd-qbar-op: var(--jd-color-hue-teal);
      --jd-qbar-net: var(--jd-color-hue-blue);
      /* 380px 뷰박스가 카드보다 넓으면 오른쪽 끝 분기 라벨이 잘린 채 끝났다(§6) */
      max-width: 100%;
      flex-wrap: wrap;
    }
    /* width/height는 표시 속성이라 CSS가 이긴다. height:auto면 viewBox가 비율을
     대신 말한다. min-width는 플렉스 자식의 min-width:auto(=내용 폭) 바닥을 풀되,
     범례 옆에서 뭉개지지 않게 컨테이너가 더 좁을 때만 양보하도록 잡는다. */
    jd-quarter-bar-chart > .jd-chart__svg {
      max-width: 100%;
      height: auto;
      min-width: min(100%, 15rem);
    }
    /* rx는 SVG2에서 CSS 기하 속성이다 — 표시 속성 rx="2"를 이겨 값을 토큰으로 말한다.
     CSS rx를 모르는 브라우저에선 그 속성이 그대로 폴백이 된다. */
    jd-quarter-bar-chart .jd-chart__bar {
      rx: var(--jd-radius-sm);
    }
    jd-quarter-bar-chart:not(:defined) {
      display: inline-block;
    }
  }
`;
