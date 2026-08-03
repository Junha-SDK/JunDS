import { css } from "../../core/styles.js";

/**
 * jd-sparkline CSS — v2 finance/Sparkline 토큰 번역.
 * v2 값: svg width×height(기본 80×24), 선 stroke color(기본 --bm-up) width 1.6
 * linecap/linejoin round · vector-effect non-scaling-stroke, 마지막 점 후광 r3.4
 * opacity .18 + 코어 r1.8, 기준선 opacity .25 dash "2 2".
 *
 * 색은 mini-chart 선례대로 요소마다 stroke/fill 속성으로 박지 않고 **호스트 color
 * 경유**로 흐른다: 선·점은 currentColor를 쓰고 호스트가
 * `color: var(--jd-sparkline-color, var(--jd-color-success))`를 잡는다. 소비자가
 * `jd-sparkline { color: … }` 한 줄로 색을 바꿀 수 있고, 레이어 안이라 항상 이긴다.
 * 채움 그라디언트만은 v2처럼 `fill` 프롭 색을 defs에 직접 싣는다(2색 정지값이 필요).
 *
 * `overflow: visible` — 마지막 점(후광 r3.4)의 중심이 x=width라 뷰박스 경계에서
 * 잘리는 것을 지오메트리를 건드리지 않고 없앤다(mini-chart 선례).
 *
 * 기본색은 success를 **직접** 잡지 않는다. 스파크라인의 기본 의미는 "오르는 추세"라
 * 등락색이고, 등락색은 앱이 시작 시 1회 덮어쓰는 --jd-finance-up 훅을 경유해야 한다
 * (DECISIONS "색 기본값은 웹을 따르고, 관례 전환은 앱에 남겼다"). 직접 칠하면 한국
 * 관례(적상승)로 전환한 앱에서 price-badge만 빨개지고 스파크라인만 초록으로 남는다.
 */
export default css`
  @layer junds.base {
    jd-sparkline:not(:defined) {
      display: inline-block;
    }
  }
  @layer junds.components {
    jd-sparkline {
      display: inline-block;
      line-height: 0; /* svg 아래 baseline 여백 제거 */
      color: var(--jd-sparkline-color, var(--jd-finance-up, var(--jd-color-success)));
    }

    .jd-sparkline__svg {
      display: block;
      overflow: visible;
    }

    .jd-sparkline__line {
      fill: none;
      stroke: currentColor;
      stroke-linejoin: round;
      stroke-linecap: round;
    }
    .jd-sparkline__baseline {
      stroke: currentColor;
      opacity: var(--jd-opacity-25);
    }
    .jd-sparkline__dot-halo {
      fill: currentColor;
      opacity: var(--jd-opacity-20);
    }
    .jd-sparkline__dot {
      fill: currentColor;
    }
  }
`;
