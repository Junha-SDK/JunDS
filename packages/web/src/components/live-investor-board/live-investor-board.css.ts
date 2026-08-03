/**
 * jd-live-investor-board CSS — v2 finance/LiveInvestorBoard.
 * v2의 인라인 <style>(pulse·flash 키프레임)을 컴포넌트 시트로 옮긴다. 투자자색·상승/하락색은
 * 호스트 :where() 기본값(특이도 0)으로 두어 소비자가 태그 셀렉터로 재정의한다.
 * 셀 색은 인라인 --_c가 나른다.
 *
 * 격자는 좁아지면 "1.84/조"처럼 단위가 다음 줄로 떨어지고 표가 오른쪽으로 넘쳤다. 열에
 * 최소 폭을 못 박고, 넘치면 **격자 자신이 가로로 구른다** — 잘린 채 끝나는 것과 다르다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-live-investor-board:not(:defined) {
      display: block;
    }

    :where(jd-live-investor-board) {
      /* 투자자 3구분은 의미색이 아니라 **계열색**이다 — hue 팔레트에서 뽑아야 danger가
       '위험'이 아니라 '외국인'을 뜻하는 혼선이 생기지 않는다. */
      --jd-fin-foreign: var(--jd-color-hue-red);
      --jd-fin-institution: var(--jd-color-hue-purple);
      --jd-fin-individual: var(--jd-color-hue-amber);
      /* 등락색은 직접 칠하지 않고 앱이 1회 덮어쓰는 훅을 경유한다 — 직접 칠하면 한국 관례
       override가 이 컴포넌트만 비껴가 한 화면에서 등락색이 갈라진다. */
      --jd-fin-up: var(--jd-finance-up, var(--jd-color-success));
      --jd-fin-down: var(--jd-finance-down, var(--jd-color-danger));
      /* 장 개장 여부는 등락이 아니라 상태다 — 의미색 그대로 */
      --jd-fin-open: var(--jd-color-success);
    }
    jd-live-investor-board {
      display: block;
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }

    .jd-lib__card {
      overflow: hidden;
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      /* 채움만 있는 면은 색종이로 읽힌다 — 얕은 그림자로 면을 띄운다 */
      box-shadow: var(--jd-shadow-xs);
    }

    /* 헤더 */
    .jd-lib__head {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--jd-space-1) var(--jd-space-2);
      min-width: 0;
      padding: var(--jd-space-2) var(--jd-space-3);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-lib__live {
      position: relative;
      display: inline-flex;
      width: 10px;
      height: 10px;
      flex-shrink: 0;
    }
    .jd-lib__ping {
      position: absolute;
      inset: 0;
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-muted);
      opacity: 0.75;
    }
    .jd-lib__dot {
      position: relative;
      display: inline-flex;
      width: 10px;
      height: 10px;
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-muted);
    }
    .jd-lib__live[data-open] .jd-lib__ping,
    .jd-lib__live[data-open] .jd-lib__dot {
      background: var(--jd-fin-open);
    }
    @media (prefers-reduced-motion: no-preference) {
      .jd-lib__live[data-open] .jd-lib__ping {
        animation: jd-lib-pulse 1.4s var(--jd-easing-ease-out) infinite;
      }
    }
    @keyframes jd-lib-pulse {
      0% {
        transform: scale(1);
        opacity: 0.8;
      }
      80%,
      100% {
        transform: scale(2.4);
        opacity: 0;
      }
    }
    .jd-lib__live-word {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: var(--jd-color-muted);
    }
    .jd-lib__live-word[data-open] {
      color: var(--jd-fin-open);
    }
    .jd-lib__title {
      font-size: 12.5px;
      font-weight: 800;
      white-space: nowrap;
    }
    .jd-lib__clock {
      margin-inline-start: auto;
      font-size: 11.5px;
      font-weight: 700;
      white-space: nowrap;
      color: var(--jd-color-muted);
      font-variant-numeric: tabular-nums;
    }

    /* 시장 합계 요약 — 3열을 못 박으면 좁은 자리에서 "외국인 시장합계"가 글자로 흩어진다.
     내재적 auto-fit이라 폭이 나올 때만 3열이 된다. */
    .jd-lib__totals {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
      gap: var(--jd-space-1) var(--jd-space-2);
      padding: var(--jd-space-2) var(--jd-space-3);
      background: var(--jd-color-card-hover);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-lib__total {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      min-width: 0;
    }
    .jd-lib__total-dot {
      width: 8px;
      height: 8px;
      border-radius: var(--jd-radius-full);
      flex-shrink: 0;
      background: var(--_c, var(--jd-color-muted));
    }
    .jd-lib__total-label {
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      color: var(--jd-color-muted);
    }
    /* 값 + 단위는 한 덩어리 — 접히면 "1.84"와 "조"가 다른 줄에 선다 */
    .jd-lib__total-value {
      margin-inline-start: auto;
      font-size: 13px;
      font-weight: 800;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-lib__total-value[data-dir="up"] {
      color: var(--jd-fin-up);
    }
    .jd-lib__total-value[data-dir="down"] {
      color: var(--jd-fin-down);
    }

    /* 격자 — 열이 0까지 줄면 셀 내용이 밖으로 새어 표가 오른쪽으로 넘친다.
     최소 폭을 못 박고, 그 합이 카드보다 넓어지면 격자 자신이 가로로 구른다. */
    .jd-lib__grid {
      display: grid;
      grid-template-columns: minmax(7rem, 1fr) repeat(3, minmax(9rem, 1.4fr));
      overflow-x: auto;
      overscroll-behavior-x: contain;
      scrollbar-width: thin;
    }
    .jd-lib__headcell {
      padding: 6px var(--jd-space-2);
      font-size: 12px;
      font-weight: 800;
      white-space: nowrap;
      color: var(--jd-color-foreground);
      background: var(--jd-color-card-hover);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
      border-inline-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-lib__headcell[data-variant="center"] {
      text-align: center;
    }
    .jd-lib__headcell[data-variant="muted"] {
      color: var(--jd-color-muted);
      border-block-end: none;
      border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
    }

    .jd-lib__rowhead {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      padding: var(--jd-space-2);
      font-size: 12px;
      font-weight: 800;
      white-space: nowrap;
      border-inline-end: var(--jd-border-thin) solid var(--jd-color-border);
      border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-lib__rowhead-dot {
      width: 8px;
      height: 8px;
      flex-shrink: 0;
      border-radius: var(--jd-radius-full);
      background: var(--_c, var(--jd-color-muted));
    }

    .jd-lib__cell {
      min-width: 0;
      padding: 6px var(--jd-space-2);
      border-inline-end: var(--jd-border-thin) solid var(--jd-color-border);
      border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
      font-variant-numeric: tabular-nums;
    }
    @media (prefers-reduced-motion: no-preference) {
      .jd-lib__cell[data-flash="up"] {
        animation: jd-lib-flash-up 1.6s var(--jd-easing-ease-out);
      }
      .jd-lib__cell[data-flash="down"] {
        animation: jd-lib-flash-down 1.6s var(--jd-easing-ease-out);
      }
    }
    @keyframes jd-lib-flash-up {
      0% {
        background-color: color-mix(in srgb, var(--jd-fin-up) 18%, transparent);
      }
      100% {
        background-color: transparent;
      }
    }
    @keyframes jd-lib-flash-down {
      0% {
        background-color: color-mix(in srgb, var(--jd-fin-down) 18%, transparent);
      }
      100% {
        background-color: transparent;
      }
    }

    .jd-lib__spark {
      display: block;
      width: 100%;
      height: 22px;
    }
    .jd-lib__spark-zero {
      stroke: var(--jd-color-border);
      stroke-width: 1;
    }
    .jd-lib__spark-area {
      fill: var(--_c, var(--jd-color-muted));
      fill-opacity: 0.12;
      stroke: none;
    }
    .jd-lib__spark-line {
      fill: none;
      stroke: var(--_c, var(--jd-color-muted));
      stroke-width: 1.5;
      stroke-linejoin: round;
      stroke-linecap: round;
    }
    .jd-lib__spark-head {
      fill: var(--_c, var(--jd-color-muted));
    }

    .jd-lib__netrow {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--jd-space-1);
      min-width: 0;
      margin-block-start: 2px;
    }
    .jd-lib__net {
      font-size: 12.5px;
      font-weight: 800;
      white-space: nowrap;
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-lib__net[data-dir="up"] {
      color: var(--jd-fin-up);
    }
    .jd-lib__net[data-dir="down"] {
      color: var(--jd-fin-down);
    }
    .jd-lib__net[data-dir="flat"] {
      color: var(--jd-color-foreground);
    }
    .jd-lib__delta {
      font-size: var(--jd-text-2xs);
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      gap: 1px;
      white-space: nowrap;
    }
    .jd-lib__delta[data-dir="up"] {
      color: var(--jd-fin-up);
    }
    .jd-lib__delta[data-dir="down"] {
      color: var(--jd-fin-down);
    }
    .jd-lib__delta[data-dir="flat"] {
      color: var(--jd-color-muted);
      font-weight: 700;
    }

    .jd-lib__bsrow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-1);
      min-width: 0;
      margin-block-start: var(--jd-space-1);
    }
    .jd-lib__buy {
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      white-space: nowrap;
      color: var(--jd-fin-up);
    }
    .jd-lib__sell {
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      white-space: nowrap;
      color: var(--jd-fin-down);
    }

    .jd-lib__bar {
      display: flex;
      overflow: hidden;
      height: 6px;
      margin-block-start: var(--jd-space-1);
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-card-hover);
    }
    .jd-lib__bar-buy {
      background: var(--jd-fin-up);
    }
    .jd-lib__bar-sell {
      background: var(--jd-fin-down);
    }

    .jd-lib__raterow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-1);
      min-width: 0;
      margin-block-start: 2px;
    }
    .jd-lib__rate-buy {
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      white-space: nowrap;
      color: var(--jd-fin-up);
    }
    .jd-lib__rate-sell {
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      white-space: nowrap;
      color: var(--jd-fin-down);
    }

    .jd-lib__volume {
      padding: 6px var(--jd-space-2);
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
      color: var(--jd-color-foreground);
      background: var(--jd-color-card-hover);
      border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
      border-inline-end: var(--jd-border-thin) solid var(--jd-color-border);
      font-variant-numeric: tabular-nums;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-lib__total-value,
      .jd-lib__net {
        transition: none;
      }
    }
  }
`;
