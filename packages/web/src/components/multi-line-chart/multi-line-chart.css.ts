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
    jd-multi-line-chart:not(:defined) {
      display: inline-block;
    }
    /* width/height 속성(기본 380×220)은 **의도한 비율**이지 최소 폭이 아니다.
     CHART_CSS의 inline-flex를 그대로 두면 좁은 칸에서 SVG가 자기 속성 폭을 우겨
     컨테이너 오른쪽으로 넘친다 — 넘치지 말고 접히고 줄어들어야 한다. */
    jd-multi-line-chart {
      max-width: 100%;
      flex-wrap: wrap;
    }
    jd-multi-line-chart .jd-chart__svg {
      /* viewBox가 비율을 지키므로 폭만 내주면 높이는 따라온다 */
      flex: 1 1 16rem;
      min-width: 0;
      max-width: 100%;
      height: auto;
      font-family: var(--jd-font-sans);
      font-variant-numeric: tabular-nums;
    }
    jd-multi-line-chart .jd-chart__legend:not([hidden]) {
      min-width: 0;
    }

    /* 0% 기준선 */
    .jd-mlc__zero {
      stroke: var(--jd-fin-muted, var(--jd-color-muted));
      stroke-dasharray: 3 3;
      stroke-opacity: 0.6;
    }

    /* 시리즈 끝점 헤드 */
    .jd-mlc__head {
      fill: var(--jd-series-color);
      stroke: var(--jd-color-card, #fff);
      stroke-width: 1.5;
    }

    /* hover */
    .jd-mlc__crosshair {
      stroke: var(--jd-color-muted);
      stroke-dasharray: 3 3;
      stroke-opacity: 0.5;
    }
    .jd-mlc__hoverdot {
      fill: var(--jd-series-color);
      stroke: var(--jd-color-card, #fff);
      stroke-width: 1.5;
    }

    /* 툴팁 — 색은 candle-chart와 공유하는 --jd-fin-tooltip-* 토큰 경유로, 소비자가 두
     차트의 툴팁을 한 번에 리브랜딩할 수 있게 한다.
     폴백은 surface 짝인 on-surface 계열이다: surface-overlay는 라이트에서도 어두운
     면이라, neutral-* 를 얹으면 다크 모드에서 어두운 글자가 어두운 툴팁에 묻힌다
     (실측: 다크에서 neutral-400 대 surface-overlay ≈ 1.9:1). 테두리도 잉크에서 뽑는다. */
    .jd-mlc__tip-bg {
      fill: var(--jd-fin-tooltip-bg, var(--jd-color-surface-overlay));
      stroke: var(
        --jd-fin-tooltip-border,
        color-mix(in srgb, var(--jd-color-on-surface) 20%, transparent)
      );
      stroke-width: 1;
    }
    /* 툴팁 안 글자는 11px 아래로 내려가지 않는다 — 위계는 크기가 아니라 굵기·색이
     맡는다(줄 높이 14px라 11px도 그대로 들어간다) */
    .jd-mlc__tip-label {
      fill: var(--jd-fin-tooltip-muted, var(--jd-color-on-surface-muted));
      font-size: 11px;
      font-weight: 700;
    }
    .jd-mlc__tip-dot {
      fill: var(--jd-series-color);
    }
    .jd-mlc__tip-name {
      fill: var(--jd-fin-tooltip-muted, var(--jd-color-on-surface-muted));
      font-size: 11px;
      font-weight: 600;
    }
    .jd-mlc__tip-val {
      fill: var(--jd-fin-tooltip-fg, var(--jd-color-on-surface));
      font-size: 11px;
      font-weight: 800;
      text-anchor: end;
    }
  }
`;
