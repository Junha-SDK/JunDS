import { css } from "../../core/styles.js";

/**
 * jd-mini-candle CSS — v2는 stroke/fill을 표시 속성에 인라인 var()로 박았다.
 * v3는 상승/하락을 data-dir로 옮겨 CSS가 칠하고(테마·상태 오버라이드가 열린다),
 * 색은 finance 토큰 --jd-fin-up/down(한국 관례: 상승=적, 하락=청)으로 노출한다.
 * tone=up|down은 host에서 --_c를 덮어 모든 캔들을 한 색으로 강제한다.
 */
export default css`
@layer junds.components {
  jd-mini-candle {
    --jd-fin-up: var(--bm-up, var(--jd-color-danger));
    --jd-fin-down: var(--bm-down, var(--jd-color-info));
    --_up: var(--jd-fin-up, #e11d48);
    --_down: var(--jd-fin-down, #2563eb);
    display: inline-block; line-height: 0;
  }

  .jd-mini-candle__svg { display: block; overflow: visible; }

  .jd-mini-candle__candle[data-dir="up"] { --_c: var(--_up); }
  .jd-mini-candle__candle[data-dir="down"] { --_c: var(--_down); }
  jd-mini-candle[tone="up"] .jd-mini-candle__candle { --_c: var(--_up); }
  jd-mini-candle[tone="down"] .jd-mini-candle__candle { --_c: var(--_down); }

  .jd-mini-candle__wick { stroke: var(--_c); stroke-width: 1; }
  .jd-mini-candle__body { fill: var(--_c); stroke: none; }
}`;
