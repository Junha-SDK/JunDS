import { css } from "../../core/styles.js";

/**
 * jd-close-picks-card CSS — v2 finance/MarketSignals `PicksCard`.
 * 카드 크롬(.jd-cpc__*)은 <jd-limit-hits-card>가 상속해 재사용한다 — 행 색만 파생이 더한다.
 * 행 구분선은 인접 형제 규칙 하나로.
 */
export default css`
  @layer junds.components {
    /* 등락색을 직접 칠하지 않고 --jd-finance-* 훅을 경유한다: 한국 관례(적상승·청하락)는
     앱이 시작 시 그 변수를 1회 덮어써서 얻는 전환이라(DECISIONS "색 기본값은 웹을 따르고,
     관례 전환은 앱에 남겼다"), danger/info를 여기 박으면 앱의 override가 이 카드만 비껴가
     한 화면 안에서 등락색이 갈라진다. --jd-fin-*는 파생(limit-hits)이 함께 읽는 지역 별칭. */
    :where(jd-close-picks-card),
    :where(jd-limit-hits-card) {
      --jd-fin-up: var(--jd-finance-up, var(--jd-color-success));
      --jd-fin-down: var(--jd-finance-down, var(--jd-color-danger));
    }
    jd-close-picks-card,
    jd-limit-hits-card {
      display: block;
      font-family: var(--jd-font-sans);
    }
    jd-close-picks-card:not(:defined),
    jd-limit-hits-card:not(:defined) {
      display: block;
    }

    /* 테두리만 두른 면은 배경에 눌러 붙어 색종이로 읽힌다 — 얕은 그림자로 카드를 띄운다 */
    .jd-cpc__card {
      overflow: hidden;
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      color: var(--jd-color-foreground);
      box-shadow: var(--jd-shadow-xs);
    }

    .jd-cpc__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-2);
      padding: var(--jd-space-2-5) var(--jd-space-4);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-cpc__title-wrap {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      min-width: 0;
    }
    .jd-cpc__emoji {
      font-size: 14px;
      line-height: 1;
    }
    .jd-cpc__emoji[hidden] {
      display: none;
    }
    .jd-cpc__title {
      margin: 0;
      font-size: 13.5px;
      font-weight: 800;
      color: var(--jd-color-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-cpc__summary {
      flex-shrink: 0;
      font-size: 11px;
      font-weight: 700;
      color: var(--jd-color-muted);
      font-variant-numeric: tabular-nums;
    }

    .jd-cpc__list {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .jd-cpc__list > li + li {
      border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
    }

    /* ── picks 행 ─────────────────────────────────────────── */
    .jd-cpc__row {
      display: flex;
      align-items: center;
      gap: var(--jd-space-3);
      padding: var(--jd-space-2-5) var(--jd-space-4);
    }
    .jd-cpc__badge {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: var(--jd-radius-md);
      font-size: 10.5px;
      font-weight: 800;
    }
    .jd-cpc__badge[data-strength="high"] {
      background: var(--jd-fin-up);
      color: #fff;
    }
    .jd-cpc__badge[data-strength="medium"] {
      background: var(--jd-color-warning);
      color: #17141f;
    } /* 원색 채움 위 잉크 — 모드 무관 */
    .jd-cpc__badge[data-strength="low"] {
      background: color-mix(in srgb, var(--jd-color-muted) 16%, transparent);
      color: var(--jd-color-muted);
      border: var(--jd-border-thin) solid var(--jd-color-border);
    }

    .jd-cpc__meta {
      flex: 1;
      min-width: 0;
    }
    .jd-cpc__name {
      display: block;
      font-size: 13.5px;
      font-weight: 800;
      color: var(--jd-color-foreground);
      text-decoration: none;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-cpc__name:hover {
      color: var(--jd-color-primary-ink);
      text-decoration: underline;
    }
    /* 링크가 눌린 순간을 색으로 알린다 — 행 전체가 아니라 이름만 누를 수 있기 때문 */
    .jd-cpc__name:active {
      color: var(--jd-color-primary-hover);
    }
    .jd-cpc__name:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
      border-radius: var(--jd-radius-sm);
    }
    .jd-cpc__reason {
      margin-block-start: 2px;
      font-size: 11px;
      color: var(--jd-color-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-cpc__val {
      flex-shrink: 0;
      font-size: 13.5px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }
    .jd-cpc__val[data-dir="up"] {
      color: var(--jd-fin-up);
    }
    .jd-cpc__val[data-dir="down"] {
      color: var(--jd-fin-down);
    }

    .jd-cpc__footer {
      padding: var(--jd-space-2) var(--jd-space-4);
      font-size: 10.5px;
      color: var(--jd-color-muted);
      border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
      background: color-mix(in srgb, var(--jd-color-muted) 6%, transparent);
    }
    .jd-cpc__footer[hidden] {
      display: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-cpc__name {
        transition: none;
      }
    }
  }
`;
