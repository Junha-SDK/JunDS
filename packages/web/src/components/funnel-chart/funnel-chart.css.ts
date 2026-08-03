/**
 * jd-funnel-chart CSS — 공용 CHART_CSS + 퍼널 고유값.
 *
 * v2 값: 루트 `w-full`, 행 `flex items-center gap-3` + 인라인 height=stepH,
 * 막대 `rounded-lg transition-all duration-500 flex items-center justify-center
 * text-white text-sm font-bold` + minWidth 60px, 우측 `w-32 shrink-0 text-right`
 * (라벨 text-sm font-medium, 전환율 text-[10px] text-muted).
 *
 * 팔레트는 v2의 [primary, info, success, warning, danger]를 버렸다 — 아래 주석 참조.
 */
import { css } from "../../core/styles.js";
import { CHART_CSS } from "../../core/chart.styles.js";

export default css`
  @layer junds.components {
    ${CHART_CSS}
    jd-funnel-chart {
      display: block;
      width: 100%;
      /* 퍼널은 **양의 감소**를 말하지 범주를 말하지 않는다. v2의 보라·파랑·초록·주황·
       빨강 계단은 단계마다 다른 뜻이 있다고 읽히고(info=안내, success=성공,
       danger=위험) 한 화면에서 팔레트가 흔들렸다 — 한 색상의 명도 계단으로 바꾼다.
       계단이 **어두워지는** 방향인 이유는 두 가지다: 막대 위 글자가 #fff라 밝히는
       쪽으로 가면 4.5:1 아래로 떨어지고, 아래로 갈수록 좁아지는 면은 같은 무게로
       읽히려면 더 진해야 한다. primary는 모드 간에 불변이라 계단도 불변이다. */
      --jd-chart-1: var(--jd-color-primary);
      --jd-chart-2: color-mix(in srgb, var(--jd-color-primary) 90%, #000);
      --jd-chart-3: color-mix(in srgb, var(--jd-color-primary) 80%, #000);
      --jd-chart-4: color-mix(in srgb, var(--jd-color-primary) 71%, #000);
      --jd-chart-5: color-mix(in srgb, var(--jd-color-primary) 63%, #000);
      --jd-chart-6: color-mix(in srgb, var(--jd-color-primary) 56%, #000);
      --jd-chart-7: color-mix(in srgb, var(--jd-color-primary) 50%, #000);
    }
    jd-funnel-chart:not(:defined) {
      display: block;
    }

    .jd-funnel-chart__steps {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .jd-funnel-chart__step {
      display: flex;
      align-items: center;
      gap: var(--jd-space-3);
    }
    .jd-funnel-chart__track {
      flex: 1;
      display: flex;
      justify-content: center;
      min-width: 0;
    }
    .jd-funnel-chart__bar {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 60px;
      box-sizing: border-box;
      border-radius: var(--jd-radius-lg);
      background: var(--jd-series-color);
      color: #fff;
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-bold);
      font-variant-numeric: tabular-nums;
      /* 채움만 있는 면은 색종이로 읽힌다(§2) — 상단 인셋 하이라이트가 '위에서 빛을
       받는 면'을 만든다. 명도 계단만으로는 단계들이 한 장의 색지처럼 붙어 보인다. */
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
      transition: width var(--jd-duration-slower) var(--jd-easing-default);
    }
    .jd-funnel-chart__meta {
      width: 8rem;
      flex-shrink: 0;
      text-align: right;
    }
    .jd-funnel-chart__label {
      margin: 0;
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-medium);
      /* 8rem 고정 칸이라 긴 단계 이름은 넘친다 — 끊을 자리가 없어도 끊는다(§5) */
      overflow-wrap: anywhere;
    }
    .jd-funnel-chart__rate {
      margin: 0;
      /* v2는 10px였다 — 2xs(11px) 아래로는 내려가지 않는다(§9) */
      font-size: var(--jd-text-2xs);
      color: var(--jd-color-muted);
      font-variant-numeric: tabular-nums;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-funnel-chart__bar {
        transition: none;
      }
    }
  }
`;
