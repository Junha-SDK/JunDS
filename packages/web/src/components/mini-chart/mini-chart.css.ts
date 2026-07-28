import { css } from "../../core/styles.js";

/**
 * v2 값: 호스트 `inline-block`, svg width×height(기본 120×32),
 * line stroke 1.5 · linecap/linejoin round, area fill 색 opacity .1,
 * 마지막 점 circle r=2, bar rx=1 opacity .8.
 *
 * 색은 v2처럼 요소마다 `fill`/`stroke` 속성으로 박지 않고 **호스트 color 경유**로
 * 바꿨다(progress-ring 선례의 강화판): 도형은 전부 `currentColor`를 쓰고 호스트가
 * `color: var(--jd-mini-chart-color, var(--jd-color-primary))`를 잡는다. 덕분에
 * (1) 소비자가 `jd-mini-chart { color: … }` 한 줄로 색을 바꿀 수 있고,
 * (2) 카드 안에 놓였을 때 상속 색을 그대로 태우는 것도 가능하며,
 * (3) 우리 규칙은 레이어 안이라 소비자 CSS가 항상 이긴다(속성으로 박으면 못 이긴다).
 *
 * `overflow: visible` — v2는 마지막 점(circle r=2)의 중심이 x=width라서 뷰박스
 * 경계에서 절반이 잘렸다. 지오메트리를 건드리지 않고 잘림만 없앤다.
 */
export default css`
  @layer junds.base {
    jd-mini-chart:not(:defined) {
      display: inline-block;
    }
  }
  @layer junds.components {
    jd-mini-chart {
      display: inline-block;
      line-height: 0; /* svg 아래 baseline 여백 제거 */
      color: var(--jd-mini-chart-color, var(--jd-color-primary));
    }

    .jd-mini-chart__svg {
      display: block;
      overflow: visible;
    }

    .jd-mini-chart__area {
      fill: currentColor;
      opacity: var(--jd-opacity-10);
    }
    .jd-mini-chart__line {
      fill: none;
      stroke: currentColor;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .jd-mini-chart__head {
      fill: currentColor;
    }
    .jd-mini-chart__bar {
      fill: currentColor;
      opacity: var(--jd-opacity-80);
    }
  }
`;
