/**
 * jd-fx-board CSS — v2 finance/FXBoard 토큰 번역.
 * v2 값: bm-card 컨테이너, 헤더 하단 보더, LIVE 점 pulse(1.4s), 셀은 세로 스택에
 * 우측 보더 구분, tick 색은 상승=up/하락=down. 색 규약: 상승/하락은 앱이 재틴트할 수
 * 있게 --jd-finance-up/down 폴백 체인(alert-header-button 선례).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-fx-board {
    display: block; font-family: var(--jd-font-sans);
    background: var(--jd-color-card); color: var(--jd-color-foreground);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl); overflow: hidden;
  }
  jd-fx-board:not(:defined) { display: block; }

  .jd-fx-board__head {
    display: flex; align-items: center; gap: var(--jd-space-2);
    padding: var(--jd-space-2) var(--jd-space-3);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-fx-board__pulse {
    position: relative; width: 0.625rem; height: 0.625rem; flex-shrink: 0;
    border-radius: var(--jd-radius-full);
    background: var(--jd-finance-up, var(--jd-color-success));
  }
  .jd-fx-board__pulse::after {
    content: ""; position: absolute; inset: 0; border-radius: inherit;
    background: inherit; opacity: .75;
  }
  @media (prefers-reduced-motion: no-preference) {
    .jd-fx-board__pulse::after { animation: jd-fx-pulse 1.4s var(--jd-easing-ease-out) infinite; }
  }
  @keyframes jd-fx-pulse { to { transform: scale(2.2); opacity: 0; } }

  .jd-fx-board__live {
    font-size: 11px; font-weight: var(--jd-weight-bold); letter-spacing: 0.06em;
    color: var(--jd-finance-up, var(--jd-color-success));
  }
  .jd-fx-board__title { font-size: 12.5px; font-weight: var(--jd-weight-bold); }
  .jd-fx-board__status {
    margin-inline-start: auto; font-size: 11px; font-weight: var(--jd-weight-bold);
    color: var(--jd-color-muted); font-variant-numeric: tabular-nums;
  }

  .jd-fx-board__grid { display: grid; }

  .jd-fx-cell {
    display: flex; flex-direction: column; gap: 2px;
    padding: var(--jd-space-2) var(--jd-space-3);
    border-inline-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-fx-cell[data-last] { border-inline-end: 0; }

  .jd-fx-cell__top { display: flex; align-items: center; gap: 6px; }
  .jd-fx-cell__dot {
    width: 6px; height: 6px; border-radius: var(--jd-radius-full);
    background: var(--jd-fx-cat, var(--jd-color-accent)); flex-shrink: 0;
  }
  .jd-fx-cell__label {
    font-size: 10.5px; font-weight: var(--jd-weight-bold); color: var(--jd-color-muted);
  }
  .jd-fx-cell__cat {
    margin-inline-start: auto; font-size: 8.5px; font-weight: var(--jd-weight-bold);
    padding: 1px 6px; border-radius: var(--jd-radius-full);
    /* 틴트 위 글자는 원색이 아니라 foreground 쪽으로 섞어 대비 확보(jd-tag 700레벨 관행) */
    color: color-mix(in srgb, var(--jd-fx-cat, var(--jd-color-accent)) 65%, var(--jd-color-foreground));
    background: color-mix(in srgb, var(--jd-fx-cat, var(--jd-color-accent)) 10%, transparent);
  }

  .jd-fx-cell__value-row { display: flex; align-items: baseline; gap: 4px; }
  .jd-fx-cell__arrow, .jd-fx-cell__value {
    font-size: 14px; font-weight: var(--jd-weight-bold);
    font-variant-numeric: tabular-nums; color: var(--jd-color-foreground);
  }
  .jd-fx-cell[data-trend="up"] .jd-fx-cell__arrow,
  .jd-fx-cell[data-trend="up"] .jd-fx-cell__value {
    color: var(--jd-finance-up, var(--jd-color-success));
  }
  .jd-fx-cell[data-trend="down"] .jd-fx-cell__arrow,
  .jd-fx-cell[data-trend="down"] .jd-fx-cell__value {
    color: var(--jd-finance-down, var(--jd-color-danger));
  }
  .jd-fx-cell__unit {
    font-size: 9.5px; font-weight: var(--jd-weight-bold); color: var(--jd-color-muted);
    font-variant-numeric: tabular-nums;
  }
  .jd-fx-cell__pct {
    font-size: 10.5px; font-weight: var(--jd-weight-bold);
    font-variant-numeric: tabular-nums;
  }
  .jd-fx-cell__pct[data-dir="up"] { color: var(--jd-finance-up, var(--jd-color-success)); }
  .jd-fx-cell__pct[data-dir="down"] { color: var(--jd-finance-down, var(--jd-color-danger)); }
  .jd-fx-cell__symbol {
    font-size: 9px; font-weight: var(--jd-weight-bold); color: var(--jd-color-muted);
  }

  /* 화살표 방향의 낱말은 시각적으로만 숨긴다(색·글리프뿐이던 방향을 AT에 싣는다) */
  .jd-fx-cell__sr {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }
}`;
