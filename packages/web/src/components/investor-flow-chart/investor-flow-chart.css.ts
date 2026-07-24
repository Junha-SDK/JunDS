/**
 * jd-investor-flow-chart CSS — v2 finance/InvestorFlowChart.
 * 공용 CHART_CSS(숨김 데이터 표·figure 골격)를 보간하고 다이버징 막대 고유 규칙을 더한다.
 *
 * 색 규약: 막대 fill은 인라인 `--_c`(양수 pos색 / 음수 neg색)가 나른다 —
 * 표시 속성(fill=)에 색을 박지 않는다(chart.styles.ts 색 규약과 동일). 액터 기본색은
 * 호스트에 :where()로 특이도 0에 두어 소비자가 `jd-investor-flow-chart { --jd-fin-… }`
 * 한 줄로 갈아끼운다. Korean 시장 관례(상승=적, 하락=청)를 v2 그대로 계승.
 */
import { css } from "../../core/styles.js";
import { CHART_CSS } from "../../core/chart.styles.js";

export default css`
@layer junds.components {
${CHART_CSS}
  jd-investor-flow-chart:not(:defined) { display: block; }

  :where(jd-investor-flow-chart) {
    --jd-fin-foreign: var(--jd-color-danger);
    --jd-fin-foreign-neg: var(--jd-color-info);
    --jd-fin-institution: #a855f7;
    --jd-fin-institution-neg: #0ea5e9;
    --jd-fin-individual: var(--jd-color-warning);
    --jd-fin-individual-neg: #64748b;
  }
  /* v2는 svg 단독 블록 — HTML 범례를 옆에 붙이지 않도록 host를 block으로 되돌린다 */
  jd-investor-flow-chart { display: block; }

  .jd-ifc__svg {
    display: block; max-width: 100%; height: auto;
    font-family: var(--jd-font-sans); font-variant-numeric: tabular-nums;
  }
  .jd-ifc__gridline { stroke: var(--jd-color-border); stroke-opacity: .5; }
  .jd-ifc__zero { stroke: var(--jd-color-muted); stroke-opacity: .55; }
  .jd-ifc__bar { fill: var(--_c, var(--jd-color-muted)); }
  .jd-ifc__swatch { fill: var(--_c, var(--jd-color-muted)); }
  .jd-ifc__tick, .jd-ifc__date {
    font-size: 10px; fill: var(--jd-color-muted);
  }
  .jd-ifc__legend-t {
    font-size: 10.5px; font-weight: 700; fill: var(--jd-color-foreground);
  }
}`;
