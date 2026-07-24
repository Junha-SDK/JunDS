/**
 * jd-live-investor-board CSS — v2 finance/LiveInvestorBoard.
 * v2의 인라인 <style>(pulse·flash 키프레임)을 컴포넌트 시트로 옮긴다. 투자자색·상승/하락색은
 * 호스트 :where() 기본값(특이도 0)으로 두어 소비자가 태그 셀렉터로 재정의한다.
 * 시장 관례: 상승/매수=적(danger), 하락/매도=청(info). 셀 색은 인라인 --_c가 나른다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-live-investor-board:not(:defined) { display: block; }

  :where(jd-live-investor-board) {
    --jd-fin-foreign: var(--jd-color-danger);
    --jd-fin-institution: #a855f7;
    --jd-fin-individual: var(--jd-color-warning);
    --jd-fin-up: var(--jd-color-danger);
    --jd-fin-down: var(--jd-color-info);
    --jd-fin-open: var(--jd-color-success);
  }
  jd-live-investor-board {
    display: block; font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
  }

  .jd-lib__card {
    overflow: hidden;
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
  }

  /* 헤더 */
  .jd-lib__head {
    display: flex; align-items: center; gap: var(--jd-space-2);
    padding: var(--jd-space-2) var(--jd-space-3);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-lib__live { position: relative; display: inline-flex; width: 10px; height: 10px; flex-shrink: 0; }
  .jd-lib__ping {
    position: absolute; inset: 0; border-radius: var(--jd-radius-full);
    background: var(--jd-color-muted); opacity: .75;
  }
  .jd-lib__dot {
    position: relative; display: inline-flex; width: 10px; height: 10px;
    border-radius: var(--jd-radius-full); background: var(--jd-color-muted);
  }
  .jd-lib__live[data-open] .jd-lib__ping, .jd-lib__live[data-open] .jd-lib__dot {
    background: var(--jd-fin-open);
  }
  @media (prefers-reduced-motion: no-preference) {
    .jd-lib__live[data-open] .jd-lib__ping { animation: jd-lib-pulse 1.4s var(--jd-easing-ease-out) infinite; }
  }
  @keyframes jd-lib-pulse {
    0% { transform: scale(1); opacity: .8; }
    80%, 100% { transform: scale(2.4); opacity: 0; }
  }
  .jd-lib__live-word {
    font-size: 11px; font-weight: 800; letter-spacing: .06em; color: var(--jd-color-muted);
  }
  .jd-lib__live-word[data-open] { color: var(--jd-fin-open); }
  .jd-lib__title { font-size: 12.5px; font-weight: 800; }
  .jd-lib__clock {
    margin-inline-start: auto; font-size: 11.5px; font-weight: 700;
    color: var(--jd-color-muted); font-variant-numeric: tabular-nums;
  }

  /* 시장 합계 요약 */
  .jd-lib__totals {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--jd-space-2);
    padding: var(--jd-space-2) var(--jd-space-3);
    background: var(--jd-color-card-hover);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-lib__total { display: flex; align-items: center; gap: var(--jd-space-2); }
  .jd-lib__total-dot {
    width: 8px; height: 8px; border-radius: var(--jd-radius-full); flex-shrink: 0;
    background: var(--_c, var(--jd-color-muted));
  }
  .jd-lib__total-label { font-size: 11px; font-weight: 700; color: var(--jd-color-muted); }
  .jd-lib__total-value {
    margin-inline-start: auto; font-size: 13px; font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
  .jd-lib__total-value[data-dir="up"] { color: var(--jd-fin-up); }
  .jd-lib__total-value[data-dir="down"] { color: var(--jd-fin-down); }

  /* 격자 */
  .jd-lib__grid {
    display: grid;
    grid-template-columns: minmax(108px, 1fr) repeat(3, minmax(0, 1.4fr));
  }
  .jd-lib__headcell {
    padding: 6px var(--jd-space-2); font-size: 12px; font-weight: 800;
    color: var(--jd-color-foreground);
    background: var(--jd-color-card-hover);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    border-inline-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-lib__headcell[data-variant="center"] { text-align: center; }
  .jd-lib__headcell[data-variant="muted"] {
    color: var(--jd-color-muted); border-block-end: none;
    border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
  }

  .jd-lib__rowhead {
    display: flex; align-items: center; gap: var(--jd-space-1-5);
    padding: var(--jd-space-2); font-size: 12px; font-weight: 800;
    border-inline-end: var(--jd-border-thin) solid var(--jd-color-border);
    border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-lib__rowhead-dot {
    width: 8px; height: 8px; border-radius: var(--jd-radius-full);
    background: var(--_c, var(--jd-color-muted));
  }

  .jd-lib__cell {
    padding: 6px var(--jd-space-2);
    border-inline-end: var(--jd-border-thin) solid var(--jd-color-border);
    border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
    font-variant-numeric: tabular-nums;
  }
  @media (prefers-reduced-motion: no-preference) {
    .jd-lib__cell[data-flash="up"] { animation: jd-lib-flash-up 1.6s var(--jd-easing-ease-out); }
    .jd-lib__cell[data-flash="down"] { animation: jd-lib-flash-down 1.6s var(--jd-easing-ease-out); }
  }
  @keyframes jd-lib-flash-up {
    0% { background-color: color-mix(in srgb, var(--jd-fin-up) 18%, transparent); }
    100% { background-color: transparent; }
  }
  @keyframes jd-lib-flash-down {
    0% { background-color: color-mix(in srgb, var(--jd-fin-down) 18%, transparent); }
    100% { background-color: transparent; }
  }

  .jd-lib__spark { display: block; width: 100%; height: 22px; }
  .jd-lib__spark-zero { stroke: var(--jd-color-border); stroke-width: 1; }
  .jd-lib__spark-area { fill: var(--_c, var(--jd-color-muted)); fill-opacity: .12; stroke: none; }
  .jd-lib__spark-line {
    fill: none; stroke: var(--_c, var(--jd-color-muted)); stroke-width: 1.5;
    stroke-linejoin: round; stroke-linecap: round;
  }
  .jd-lib__spark-head { fill: var(--_c, var(--jd-color-muted)); }

  .jd-lib__netrow {
    display: flex; align-items: baseline; justify-content: space-between; gap: var(--jd-space-1);
    margin-block-start: 2px;
  }
  .jd-lib__net { font-size: 12.5px; font-weight: 800; white-space: nowrap; }
  .jd-lib__net[data-dir="up"] { color: var(--jd-fin-up); }
  .jd-lib__net[data-dir="down"] { color: var(--jd-fin-down); }
  .jd-lib__net[data-dir="flat"] { color: var(--jd-color-foreground); }
  .jd-lib__delta {
    font-size: 9px; font-weight: 800; display: inline-flex; align-items: center; gap: 1px;
  }
  .jd-lib__delta[data-dir="up"] { color: var(--jd-fin-up); }
  .jd-lib__delta[data-dir="down"] { color: var(--jd-fin-down); }
  .jd-lib__delta[data-dir="flat"] { color: var(--jd-color-muted); font-weight: 700; }

  .jd-lib__bsrow {
    display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-1);
    margin-block-start: var(--jd-space-1);
  }
  .jd-lib__buy { font-size: 10.5px; font-weight: 700; color: var(--jd-fin-up); }
  .jd-lib__sell { font-size: 10.5px; font-weight: 700; color: var(--jd-fin-down); }

  .jd-lib__bar {
    display: flex; overflow: hidden; height: 6px; margin-block-start: var(--jd-space-1);
    border-radius: var(--jd-radius-full); background: var(--jd-color-card-hover);
  }
  .jd-lib__bar-buy { background: var(--jd-fin-up); }
  .jd-lib__bar-sell { background: var(--jd-fin-down); }

  .jd-lib__raterow {
    display: flex; align-items: center; justify-content: space-between;
    margin-block-start: 2px;
  }
  .jd-lib__rate-buy { font-size: 9.5px; font-weight: 700; color: var(--jd-fin-up); }
  .jd-lib__rate-sell { font-size: 9.5px; font-weight: 700; color: var(--jd-fin-down); }

  .jd-lib__volume {
    padding: 6px var(--jd-space-2); text-align: center;
    font-size: 12px; font-weight: 700; color: var(--jd-color-foreground);
    background: var(--jd-color-card-hover);
    border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
    border-inline-end: var(--jd-border-thin) solid var(--jd-color-border);
    font-variant-numeric: tabular-nums;
  }
}`;
