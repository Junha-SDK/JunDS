/**
 * jd-investor-flow-chart CSS — v2 finance/InvestorFlowChart.
 * 공용 CHART_CSS(숨김 데이터 표·figure 골격)를 보간하고 다이버징 막대 고유 규칙을 더한다.
 *
 * 색 규약: 막대 fill은 인라인 `--_c`(양수 pos색 / 음수 neg색)가 나른다 —
 * 표시 속성(fill=)에 색을 박지 않는다(chart.styles.ts 색 규약과 동일). 액터 기본색은
 * 호스트에 :where()로 특이도 0에 두어 소비자가 `jd-investor-flow-chart { --jd-fin-… }`
 * 한 줄로 갈아끼운다.
 *
 * v2는 외국인 양수를 danger(적), 음수를 info(청)로 칠했다 — 등락색을 컴포넌트가 직접
 * 칠한 셈이라, 앱이 `--jd-finance-*`를 뒤집어도 이 차트만 옛 색으로 남았다. 게다가
 * 기관·개인의 `#a855f7`·`#0ea5e9`·`#64748b`는 팔레트 밖 리터럴이었다(§8).
 *
 * 이 차트에서 색이 말해야 하는 것은 **액터**지 부호가 아니다 — 순매수/순매도는 0선
 * 위/아래라는 위치가 이미 말한다. 그래서 액터마다 hue 하나를 주고, 음수 쪽은 같은 hue를
 * 카드색으로 눅인 **한 색상의 명도 계단**으로 둔다. 범례 스와치(양수색)도 액터마다 달라
 * 제 역할을 지킨다.
 */
import { css } from "../../core/styles.js";
import { CHART_CSS } from "../../core/chart.styles.js";

export default css`
  @layer junds.components {
    ${CHART_CSS}
    jd-investor-flow-chart:not(:defined) {
      display: block;
    }

    :where(jd-investor-flow-chart) {
      --jd-fin-foreign: var(--jd-color-hue-blue);
      --jd-fin-foreign-neg: color-mix(in srgb, var(--jd-color-hue-blue) 42%, var(--jd-color-card));
      --jd-fin-institution: var(--jd-color-hue-violet);
      --jd-fin-institution-neg: color-mix(
        in srgb,
        var(--jd-color-hue-violet) 42%,
        var(--jd-color-card)
      );
      --jd-fin-individual: var(--jd-color-hue-amber);
      --jd-fin-individual-neg: color-mix(
        in srgb,
        var(--jd-color-hue-amber) 42%,
        var(--jd-color-card)
      );
    }
    /* v2는 svg 단독 블록 — HTML 범례를 옆에 붙이지 않도록 host를 block으로 되돌린다 */
    jd-investor-flow-chart {
      display: block;
    }

    .jd-ifc__svg {
      display: block;
      max-width: 100%;
      height: auto;
      font-family: var(--jd-font-sans);
      font-variant-numeric: tabular-nums;
    }
    .jd-ifc__gridline {
      stroke: var(--jd-color-border);
      stroke-opacity: 0.5;
    }
    .jd-ifc__zero {
      stroke: var(--jd-color-muted);
      stroke-opacity: 0.55;
    }
    .jd-ifc__bar {
      fill: var(--_c, var(--jd-color-muted));
    }
    .jd-ifc__swatch {
      fill: var(--_c, var(--jd-color-muted));
    }
    .jd-ifc__tick,
    .jd-ifc__date {
      font-size: 10px;
      fill: var(--jd-color-muted);
    }
    .jd-ifc__legend-t {
      font-size: 10.5px;
      font-weight: 700;
      fill: var(--jd-color-foreground);
    }
  }
`;
