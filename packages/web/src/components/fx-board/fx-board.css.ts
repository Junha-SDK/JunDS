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
      display: block;
      font-family: var(--jd-font-sans);
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      overflow: hidden;
    }
    jd-fx-board:not(:defined) {
      display: block;
    }

    .jd-fx-board__head {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      padding: var(--jd-space-2) var(--jd-space-3);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-fx-board__pulse {
      position: relative;
      width: 0.625rem;
      height: 0.625rem;
      flex-shrink: 0;
      border-radius: var(--jd-radius-full);
      background: var(--jd-finance-up, var(--jd-color-success));
    }
    .jd-fx-board__pulse::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: inherit;
      opacity: 0.75;
    }
    @media (prefers-reduced-motion: no-preference) {
      .jd-fx-board__pulse::after {
        animation: jd-fx-pulse 1.4s var(--jd-easing-ease-out) infinite;
      }
    }
    @keyframes jd-fx-pulse {
      to {
        transform: scale(2.2);
        opacity: 0;
      }
    }

    /* v2가 남긴 반픽셀 글자 크기(8.5·9·9.5·10.5·12.5px)는 전부 토큰 계단으로 올렸다 —
     11px(--jd-text-2xs)이 읽기의 바닥이고(§9), 반픽셀은 기기마다 다르게 반올림된다. */
    .jd-fx-board__live {
      flex-shrink: 0;
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      letter-spacing: var(--jd-tracking-wider);
      color: var(--jd-finance-up, var(--jd-color-success));
    }
    .jd-fx-board__title {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-bold);
    }
    .jd-fx-board__status {
      margin-inline-start: auto;
      flex-shrink: 0;
      white-space: nowrap;
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      color: var(--jd-color-muted);
      font-variant-numeric: tabular-nums;
    }

    /* 셀 수만큼 1열씩 나누되(--jd-fx-count는 element.ts가 넣는다) 셀 폭에 하한을 둔다 —
     하한이 없으면 종목이 늘어날수록 칸이 눌려 "비트코인"이 두 줄로 접히고 칩까지
     접힌다(실측). 좁으면 다음 줄로 흘려보내는 편이 읽힌다(§5). */
    .jd-fx-board__grid {
      display: grid;
      grid-template-columns: repeat(
        auto-fit,
        minmax(min(100%, max(9.5rem, 100% / var(--jd-fx-count, 1))), 1fr)
      );
    }

    .jd-fx-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0; /* 격자 자식 기본 min-width:auto가 칸을 밀어내지 못하게(§5) */
      padding: var(--jd-space-2) var(--jd-space-3);
      border-inline-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-fx-cell[data-last] {
      border-inline-end: 0;
    }

    .jd-fx-cell__top {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }
    .jd-fx-cell__dot {
      width: 6px;
      height: 6px;
      border-radius: var(--jd-radius-full);
      background: var(--jd-fx-cat, var(--jd-color-accent));
      flex-shrink: 0;
    }
    /* 종목명은 접히지 않는다 — 두 줄이 되면 셀 높이가 서로 어긋난다. 넘치면 말줄임 */
    .jd-fx-cell__label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      color: var(--jd-color-muted);
    }
    .jd-fx-cell__cat {
      margin-inline-start: auto;
      /* 분류 칩은 낱말 하나짜리 원자다 — 줄이거나 접지 않는다 */
      flex-shrink: 0;
      white-space: nowrap;
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      padding: 1px 6px;
      border-radius: var(--jd-radius-full);
      /* 틴트 위 글자는 원색이 아니라 foreground 쪽으로 섞어 대비 확보(jd-tag 700레벨 관행) */
      color: color-mix(
        in srgb,
        var(--jd-fx-cat, var(--jd-color-accent)) 65%,
        var(--jd-color-foreground)
      );
      background: color-mix(in srgb, var(--jd-fx-cat, var(--jd-color-accent)) 10%, transparent);
    }

    /* 화살표·수치·단위는 한 덩어리다 — 갈라지면 "1,384 / 원"으로 읽힌다(§5) */
    .jd-fx-cell__value-row {
      display: flex;
      align-items: baseline;
      gap: 4px;
      min-width: 0;
      white-space: nowrap;
    }
    .jd-fx-cell__arrow,
    .jd-fx-cell__value {
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-bold);
      font-variant-numeric: tabular-nums;
      color: var(--jd-color-foreground);
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
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      color: var(--jd-color-muted);
      font-variant-numeric: tabular-nums;
    }
    .jd-fx-cell__pct {
      font-size: var(--jd-text-2xs);
      white-space: nowrap;
      font-weight: var(--jd-weight-bold);
      font-variant-numeric: tabular-nums;
    }
    .jd-fx-cell__pct[data-dir="up"] {
      color: var(--jd-finance-up, var(--jd-color-success));
    }
    .jd-fx-cell__pct[data-dir="down"] {
      color: var(--jd-finance-down, var(--jd-color-danger));
    }
    .jd-fx-cell__symbol {
      font-size: var(--jd-text-2xs);
      white-space: nowrap;
      font-weight: var(--jd-weight-bold);
      color: var(--jd-color-muted);
    }

    /* 화살표 방향의 낱말은 시각적으로만 숨긴다(색·글리프뿐이던 방향을 AT에 싣는다) */
    .jd-fx-cell__sr {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }
  }
`;
