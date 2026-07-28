import { css } from "../../core/styles.js";

/**
 * jd-mini-candle CSS — v2는 stroke/fill을 표시 속성에 인라인 var()로 박았다.
 * v3는 상승/하락을 data-dir로 옮겨 CSS가 칠하고(테마·상태 오버라이드가 열린다).
 * tone=up|down은 host에서 --_c를 덮어 모든 캔들을 한 색으로 강제한다.
 *
 * 양봉·음봉도 등락이다 — v2가 박아 둔 리터럴(#e11d48/#2563eb) 대신 --jd-finance-* 훅을
 * 경유한다. 한국 관례(적상승·청하락)는 앱이 그 변수를 시작 시 1회 덮어써서 얻는 전환이라
 * (DECISIONS "색 기본값은 웹을 따르고, 관례 전환은 앱에 남겼다"), 여기에 색을 박으면
 * 같은 화면의 price-badge는 뒤집히고 캔들만 옛 색으로 남는다.
 */
export default css`
  @layer junds.components {
    jd-mini-candle {
      --jd-fin-up: var(--jd-finance-up, var(--jd-color-success));
      --jd-fin-down: var(--jd-finance-down, var(--jd-color-danger));
      --_up: var(--jd-fin-up);
      --_down: var(--jd-fin-down);
      display: inline-block;
      line-height: 0;
    }

    .jd-mini-candle__svg {
      display: block;
      overflow: visible;
    }

    .jd-mini-candle__candle[data-dir="up"] {
      --_c: var(--_up);
    }
    .jd-mini-candle__candle[data-dir="down"] {
      --_c: var(--_down);
    }
    jd-mini-candle[tone="up"] .jd-mini-candle__candle {
      --_c: var(--_up);
    }
    jd-mini-candle[tone="down"] .jd-mini-candle__candle {
      --_c: var(--_down);
    }

    .jd-mini-candle__wick {
      stroke: var(--_c);
      stroke-width: 1;
    }
    .jd-mini-candle__body {
      fill: var(--_c);
      stroke: none;
    }
  }
`;
