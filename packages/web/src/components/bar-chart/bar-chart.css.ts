/**
 * jd-bar-chart CSS — 공용 CHART_CSS + 막대 고유값.
 * v2 값: 루트 `inline-block`, 막대 rx=2 · 두께 barSize*0.8, 값 라벨 10px `fill-muted`.
 * 막대 색은 시리즈 그룹의 `--jd-series-color`가 나른다(CHART_CSS의 .jd-chart__bar).
 * 보간 근거는 core/chart.styles.ts 주석 참조.
 */
import { css } from "../../core/styles.js";
import { CHART_CSS } from "../../core/chart.styles.js";

export default css`
  @layer junds.components {
    ${CHART_CSS}
    jd-bar-chart {
      /* 계열색은 hue 팔레트에서만(§8). 공용 기본값은 success/warning/danger를 계열색으로
       써서 "3번 시리즈"와 "경고"가 한 화면에서 같은 색이 된다 — 계열은 뜻이 없다. */
      --jd-chart-1: var(--jd-color-hue-violet);
      --jd-chart-2: var(--jd-color-hue-teal);
      --jd-chart-3: var(--jd-color-hue-amber);
      --jd-chart-4: var(--jd-color-hue-blue);
      --jd-chart-5: var(--jd-color-hue-rose);
      --jd-chart-6: var(--jd-color-hue-green);
      --jd-chart-7: var(--jd-color-hue-orange);
      /* 480px 뷰박스가 카드보다 넓으면 오른쪽 끝 축 라벨이 잘린 채 끝났다(§6) */
      max-width: 100%;
      flex-wrap: wrap;
    }
    /* width/height는 표시 속성이라 CSS가 이긴다. height:auto면 viewBox가 비율을
     대신 말하므로 폭만 줄여도 그림이 찌그러지지 않는다. min-width는 플렉스 자식의
     min-width:auto(=내용 폭 480) 바닥을 풀되, 범례 옆에서 뭉개지지 않게 컨테이너가
     더 좁을 때만 양보하도록 잡는다. */
    jd-bar-chart > .jd-chart__svg {
      max-width: 100%;
      height: auto;
      min-width: min(100%, 15rem);
    }

    /* 채움만 있는 면은 색종이로 읽힌다(§2) — 위에서 빛을 받는 세로 그라데이션.
     페인트 서버(element.ts의 시리즈별 defs)는 url()만 넘기고 색은 여기서 정한다.
     지원하지 않는 환경이면 폴백으로 기존 단색이 그대로 남는다. */
    jd-bar-chart .jd-chart__bar {
      fill: var(--jd-bar-fill, var(--jd-series-color));
      /* rx는 SVG2에서 CSS 기하 속성이다 — 표시 속성 rx="2"를 이겨 값을 토큰으로
       말한다. CSS rx를 모르는 브라우저에선 그 속성이 그대로 폴백이 된다. */
      rx: var(--jd-radius-sm);
    }
    .jd-chart__bar-stop-top {
      stop-color: color-mix(in srgb, var(--jd-series-color) 84%, #fff);
    }
    .jd-chart__bar-stop-bottom {
      stop-color: var(--jd-series-color);
    }

    jd-bar-chart:not(:defined) {
      display: inline-block;
    }
  }
`;
