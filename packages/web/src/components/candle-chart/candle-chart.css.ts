import { css } from "../../core/styles.js";
import { CHART_CSS } from "../../core/chart.styles.js";

/**
 * jd-candle-chart CSS — 공용 CHART_CSS(숨김 데이터 표·범례) + 캔들 고유값.
 *
 * v2는 fill/stroke를 표시 속성에 인라인 var()로 박았다 — v3는 data-dir(up/down)로 옮겨
 * CSS가 칠한다(테마·상태 오버라이드가 열린다). host display는 tag 셀렉터(0,0,1)가
 * CHART_CSS의 :where([data-jd-chart])(0,0,0)를 이겨 block로 되찾는다.
 *
 * 상승/하락 리터럴(#e11d48/#2563eb)은 걷어내고 --jd-finance-* 훅을 경유한다
 * (mini-candle과 동일 배선). 한국 관례(적상승·청하락)는 앱이 그 변수를 시작 시 1회
 * 덮어써서 얻는 전환이라, 여기에 색을 박으면 같은 화면의 price-badge는 뒤집히고
 * 캔들만 옛 색으로 남는다.
 */
export default css`
  @layer junds.components {
    ${CHART_CSS}

    jd-candle-chart {
      display: inline-block;
      --jd-fin-up: var(--jd-finance-up, var(--jd-color-success));
      --jd-fin-down: var(--jd-finance-down, var(--jd-color-danger));
      --_up: var(--jd-fin-up);
      --_down: var(--jd-fin-down);
      --_grid: var(--jd-fin-grid, color-mix(in srgb, var(--jd-color-border) 70%, transparent));
      --_axis: var(--jd-fin-muted, var(--jd-color-muted));
      /* 마커·현재가 배지는 등락이 아니라 강조다 — 민트 리터럴은 팔레트 밖이었다(§8) */
      --_accent: var(--jd-fin-accent, var(--jd-color-primary));
      /* 이동평균 선색은 element의 MA_COLOR가 --jd-fin-cat-*로 참조한다. 그 변수를 아무도
       정의하지 않아 v2 승계 리터럴(#22c55e·#f59e0b·#ef4444·#a855f7·#ec4899)이 그대로
       발화했다 — 형광 다섯 줄이 캔들 위에서 서로 싸운다(§8). 기본값을 여기서 hue 램프로
       정의하면 리터럴은 더 이상 발화하지 않고, 소비자는 이 변수만 바꿔 갈아끼운다
       (jd-quarter-bar-chart의 --jd-qbar-* 선례). */
      --jd-fin-cat-1: var(--jd-color-hue-amber);
      --jd-fin-cat-2: var(--jd-color-hue-teal);
      --jd-fin-cat-4: var(--jd-color-hue-rose);
      --jd-fin-cat-6: var(--jd-color-hue-violet);
      --jd-fin-cat-7: var(--jd-color-hue-blue);
      /* DEFAULT_MA 밖의 기간은 element가 var(--jd-fin-muted, #94a3b8)로 떨어진다 —
       그 슬레이트 리터럴도 발화하지 않게 여기서 muted를 잡아 준다 */
      --jd-fin-muted: var(--jd-color-muted);
    }

    /* viewBox가 비율을 말하므로 height:auto면 좁은 카드 안에서도 잘리지 않고 줄어든다(§6) */
    .jd-candle-chart__svg {
      display: block;
      max-width: 100%;
      height: auto;
      cursor: crosshair;
      font-family: var(--jd-font-sans);
      font-variant-numeric: tabular-nums;
    }

    /* 격자·축 */
    .jd-candle-chart__gridline {
      stroke: var(--_grid);
      stroke-dasharray: 2 4;
      shape-rendering: crispEdges;
    }
    .jd-candle-chart__axis-label {
      font-size: 10px;
      fill: var(--_axis);
    }

    /* 캔들 */
    .jd-candle-chart__candle[data-dir="up"] {
      --_c: var(--_up);
    }
    .jd-candle-chart__candle[data-dir="down"] {
      --_c: var(--_down);
    }
    .jd-candle-chart__wick {
      stroke: var(--_c);
      stroke-width: 1;
    }
    .jd-candle-chart__body {
      fill: var(--_c);
      stroke: none;
    }
    .jd-candle-chart__candle[data-last] .jd-candle-chart__body {
      stroke: var(--_c);
      stroke-width: 1.2;
    }

    /* 라인/에어리어 표현 */
    .jd-candle-chart__price-line {
      fill: none;
      stroke: var(--_up);
      stroke-width: 1.6;
      stroke-linejoin: round;
      stroke-linecap: round;
    }
    .jd-candle-chart__area {
      stroke: none;
      opacity: 0.4;
    }
    .jd-candle-chart__area-stop0 {
      stop-color: var(--_up);
      stop-opacity: 0.45;
    }
    .jd-candle-chart__area-stop1 {
      stop-color: var(--_up);
      stop-opacity: 0;
    }

    /* 이동평균 — 색은 인라인 --_ma */
    .jd-candle-chart__ma {
      fill: none;
      stroke: var(--_ma, var(--jd-fin-muted, var(--jd-color-neutral-400)));
      stroke-width: 1.4;
      stroke-linejoin: round;
      stroke-linecap: round;
      opacity: 0.85;
    }

    /* 오버레이 지표 */
    /* 지표 오버레이(BB·VWAP)는 등락이 아니라 계열이다 — 형광 초록/주황 리터럴 대신
     팔레트 안에서 뽑아 캔들과 색이 싸우지 않게 한다(§8) */
    .jd-candle-chart__bb {
      fill: none;
      stroke: var(--jd-fin-success, var(--jd-color-hue-teal));
      stroke-width: 1;
    }
    .jd-candle-chart__bb--band {
      stroke-dasharray: 2 3;
      opacity: 0.7;
    }
    .jd-candle-chart__bb--mid {
      opacity: 0.5;
    }
    .jd-candle-chart__vwap {
      fill: none;
      stroke: var(--jd-fin-warning, var(--jd-color-hue-amber));
      stroke-width: 1.2;
      stroke-dasharray: 4 3;
      opacity: 0.8;
    }
    .jd-candle-chart__compare {
      fill: none;
      stroke: var(--_line, var(--jd-fin-muted, var(--jd-color-neutral-400)));
      stroke-width: 1.4;
      stroke-dasharray: 5 3;
      opacity: 0.85;
    }
    .jd-candle-chart__separator {
      stroke: var(--_axis);
      stroke-width: 1;
    }

    /* 거래량 */
    .jd-candle-chart__vol[data-dir="up"] {
      fill: color-mix(in srgb, var(--_up) 55%, transparent);
    }
    .jd-candle-chart__vol[data-dir="down"] {
      fill: color-mix(in srgb, var(--_down) 55%, transparent);
    }

    /* 마커 */
    .jd-candle-chart__marker {
      --_mk: var(--_accent);
    }
    .jd-candle-chart__marker-line {
      stroke: var(--_mk);
      stroke-width: 1.5;
    }
    .jd-candle-chart__marker[data-live] .jd-candle-chart__marker-line {
      stroke-dasharray: 5 4;
      opacity: 0.85;
    }
    .jd-candle-chart__marker-pulse {
      fill: var(--_mk);
      opacity: 0.25;
    }
    .jd-candle-chart__marker-dot {
      fill: var(--_mk);
    }
    .jd-candle-chart__marker-badge,
    .jd-candle-chart__marker-price-bg {
      fill: var(--_mk);
    }
    .jd-candle-chart__marker-label,
    .jd-candle-chart__marker-price {
      fill: #fff;
      font-size: 10.5px;
      font-weight: 700;
    }
    .jd-candle-chart__marker-label {
      text-anchor: middle;
    }
    .jd-candle-chart__marker-price {
      text-anchor: end;
    }

    /* 이벤트 */
    .jd-candle-chart__event {
      --_ev: var(--_axis);
    }
    .jd-candle-chart__event-line {
      stroke: var(--_ev);
      stroke-dasharray: 3 3;
      opacity: 0.55;
    }
    .jd-candle-chart__event-dot {
      fill: var(--_ev);
    }
    .jd-candle-chart__event-label {
      fill: #fff;
      font-size: 9px;
      font-weight: 800;
      text-anchor: middle;
    }

    /* 현재가 */
    .jd-candle-chart__current[data-dir="up"] {
      --_c: var(--_up);
    }
    .jd-candle-chart__current[data-dir="down"] {
      --_c: var(--_down);
    }
    .jd-candle-chart__current-line {
      stroke: var(--_c);
      stroke-width: 1;
      stroke-dasharray: 2 3;
      opacity: 0.6;
    }
    .jd-candle-chart__current-bg {
      fill: var(--_c);
    }
    .jd-candle-chart__current-text {
      fill: #fff;
      font-size: 10.5px;
      font-weight: 700;
      text-anchor: end;
    }

    /* x라벨 */
    .jd-candle-chart__xlabel {
      font-size: 10px;
      font-weight: 500;
      fill: var(--_axis);
    }
    .jd-candle-chart__xlabel[data-bold] {
      font-weight: 700;
    }

    /* 크로스헤어 + 툴팁 */
    .jd-candle-chart__crosshair-line {
      stroke: var(--_axis);
      stroke-dasharray: 3 3;
    }
    /* 툴팁 면은 라이트에서도 어두운 surface다 — 그 위의 잉크는 모드를 따라가면 안 된다.
     neutral-200/400은 다크에서 뒤집혀 어두운 면에 어두운 글자를 얹었다(§4, DEC-044).
     등락 틴트도 리터럴 대신 훅에서 파생해 앱의 관례 전환을 그대로 따른다. */
    .jd-candle-chart__tooltip {
      --_tt-up: color-mix(in srgb, var(--_up) 55%, #fff);
      --_tt-down: color-mix(in srgb, var(--_down) 55%, #fff);
    }
    .jd-candle-chart__tooltip-bg {
      fill: var(--jd-fin-tooltip-bg, var(--jd-color-surface-overlay));
      stroke: var(
        --jd-fin-tooltip-border,
        color-mix(in srgb, var(--jd-color-on-surface) 22%, transparent)
      );
      stroke-width: 1;
    }
    .jd-candle-chart__tooltip-idx {
      fill: var(--jd-fin-tooltip-muted, var(--jd-color-on-surface-muted));
      font-size: 10.5px;
      font-weight: 700;
    }
    /* 원색 등락색은 어두운 툴팁 면 위에서 대비가 3:1을 못 넘긴다 — 같은 색의 밝은 틴트로
     올린다(아래 tooltip-row와 같은 값). */
    .jd-candle-chart__tooltip[data-dir="up"] .jd-candle-chart__tooltip-pct {
      fill: var(--_tt-up);
    }
    .jd-candle-chart__tooltip[data-dir="down"] .jd-candle-chart__tooltip-pct {
      fill: var(--_tt-down);
    }
    .jd-candle-chart__tooltip-pct {
      font-size: 10.5px;
      font-weight: 800;
      text-anchor: end;
    }
    .jd-candle-chart__tooltip-key {
      fill: var(--jd-fin-tooltip-muted, var(--jd-color-on-surface-muted));
      font-size: 10.5px;
    }
    .jd-candle-chart__tooltip-val {
      fill: var(--jd-fin-tooltip-fg, var(--jd-color-on-surface));
      font-size: 10.5px;
      font-weight: 700;
      text-anchor: end;
    }
    .jd-candle-chart__tooltip-row[data-tone="up"] .jd-candle-chart__tooltip-val {
      fill: var(--_tt-up);
    }
    .jd-candle-chart__tooltip-row[data-tone="down"] .jd-candle-chart__tooltip-val {
      fill: var(--_tt-down);
    }
  }
`;
