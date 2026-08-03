import { css } from "../../core/styles.js";

/**
 * jd-stock-top-bar CSS — v2 finance/StockTopBar 토큰 번역.
 * v2 값: sticky z-20 backdrop-blur, top --bm-topbar-h(53), bg bg/92% mix, border-b.
 * 이름 h1 17px extrabold tracking-tight truncate, 섹터 칩 10.5px bold soft-100,
 * 시세 20px extrabold + diff 12px bold + PriceBadge. 탭 밑줄(bm-tab).
 * 토큰: soft-100→border-light, muted-strong→foreground/muted mix,
 * --bm-topbar-h→--jd-stock-top-bar-top.
 * 색은 data-trend 속성으로 블록에 실어 자식이 currentColor로 상속받는다(§3.1).
 * 등락색은 success/danger를 직접 칠하지 않고 --jd-finance-* 훅을 경유한다 — 한국 관례
 * (적상승·청하락)는 앱이 그 변수를 시작 시 1회 덮어써서 얻는 전환이라(DECISIONS "색
 * 기본값은 웹을 따르고, 관례 전환은 앱에 남겼다"), 직접 칠하면 같은 화면의 price-badge와
 * 상단바의 등락색이 갈라진다.
 */
export default css`
  @layer junds.base {
    jd-stock-top-bar:not(:defined) {
      display: block;
    }
  }
  @layer junds.components {
    jd-stock-top-bar {
      display: block;
      position: sticky;
      z-index: var(--jd-z-sticky);
      top: var(--jd-stock-top-bar-top, 53px);
      background: color-mix(in srgb, var(--jd-color-background) 92%, transparent);
      backdrop-filter: blur(12px);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }

    .jd-stock-top-bar__inner {
      max-width: 1600px;
      margin-inline: auto;
      padding: var(--jd-space-2-5) var(--jd-space-3) 0;
    }

    .jd-stock-top-bar__row {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
    }

    .jd-stock-top-bar__back {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      border: 0;
      background: none;
      cursor: pointer;
      border-radius: var(--jd-radius-full);
      display: grid;
      place-items: center;
      color: color-mix(in srgb, var(--jd-color-foreground) 60%, var(--jd-color-muted));
      /* background 단축이 아니라 색만 — 그리고 누름은 scale이라 전이 대상에 함께 적는다 */
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-stock-top-bar__back:hover {
      background-color: var(--jd-color-border-light);
      color: var(--jd-color-foreground);
    }
    /* 눌린 면은 빛을 잃는다 — hover 색만으로는 클릭이 먹었는지 알 수 없다 */
    .jd-stock-top-bar__back:active {
      scale: 0.97;
      background-color: color-mix(in srgb, var(--jd-color-muted) 16%, transparent);
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-stock-top-bar__back:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    .jd-stock-top-bar__title-wrap {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      min-width: 0;
      flex: 1;
    }
    .jd-stock-top-bar__names {
      min-width: 0;
      flex: 1;
    }
    .jd-stock-top-bar__name-row {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      min-width: 0;
    }
    .jd-stock-top-bar__name {
      margin: 0;
      font-weight: 800;
      font-size: 1.0625rem; /* 17px */
      letter-spacing: var(--jd-tracking-tight);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-stock-top-bar__sector {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      padding: 0 var(--jd-space-2);
      height: 20px;
      border-radius: var(--jd-radius-md);
      font-size: 0.65625rem; /* 10.5px */
      font-weight: var(--jd-weight-bold);
      background: var(--jd-color-border-light);
      color: color-mix(in srgb, var(--jd-color-foreground) 65%, var(--jd-color-muted));
    }
    .jd-stock-top-bar__sector[hidden] {
      display: none;
    }
    .jd-stock-top-bar__amount {
      margin-top: 1px;
      font-size: 0.6875rem; /* 11px */
      color: var(--jd-color-muted);
      font-variant-numeric: tabular-nums;
    }
    .jd-stock-top-bar__amount[hidden] {
      display: none;
    }

    .jd-stock-top-bar__price-wrap {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      flex-shrink: 0;
    }
    .jd-stock-top-bar__price-block {
      text-align: right;
    }
    .jd-stock-top-bar__price-block[data-trend="up"] {
      color: var(--jd-finance-up, var(--jd-color-success));
    }
    .jd-stock-top-bar__price-block[data-trend="down"] {
      color: var(--jd-finance-down, var(--jd-color-danger));
    }
    /* 시세는 숫자 한 덩어리다 — 좁은 상단바에서 "71,200"이 접히면 자릿수가 두 줄로 갈린다 */
    .jd-stock-top-bar__price {
      display: block;
      color: inherit;
      font-variant-numeric: tabular-nums;
      font-weight: 800;
      font-size: var(--jd-text-2xl); /* 20px */
      line-height: 1;
      white-space: nowrap;
      letter-spacing: var(--jd-tracking-tight);
    }
    .jd-stock-top-bar__change {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--jd-space-1);
      margin-top: var(--jd-space-0-5);
    }
    .jd-stock-top-bar__diff {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      color: inherit;
      font-variant-numeric: tabular-nums;
      font-weight: var(--jd-weight-bold);
      font-size: var(--jd-text-xs);
      white-space: nowrap;
    }
    .jd-stock-top-bar__pct {
      color: inherit;
      font-variant-numeric: tabular-nums;
      font-weight: var(--jd-weight-bold);
      font-size: var(--jd-text-xs);
      white-space: nowrap;
    }

    .jd-stock-top-bar__trailing {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1-5);
    }
    .jd-stock-top-bar__trailing[hidden] {
      display: none;
    }

    /* 탭 — v2 bm-tabs/bm-tab 밑줄 스크롤 행 */
    .jd-stock-top-bar__tabs {
      display: flex;
      gap: var(--jd-space-1);
      margin-top: var(--jd-space-2-5);
      overflow-x: auto;
      scrollbar-width: none;
    }
    .jd-stock-top-bar__tabs::-webkit-scrollbar {
      display: none;
    }
    .jd-stock-top-bar__tab {
      flex-shrink: 0;
      padding: var(--jd-space-2) var(--jd-space-1);
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-semibold);
      color: var(--jd-color-muted);
      text-decoration: none;
      white-space: nowrap;
      border-block-end: var(--jd-border-medium) solid transparent;
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-stock-top-bar__tab:hover {
      color: var(--jd-color-foreground);
      /* 밑줄이 미리 옅게 뜨면 "여길 누르면 여기가 선택된다"가 보인다 */
      border-block-end-color: color-mix(in srgb, var(--jd-color-primary) 35%, transparent);
    }
    .jd-stock-top-bar__tab:active {
      color: var(--jd-color-primary-ink);
      border-block-end-color: var(--jd-color-primary);
    }
    /* 탭 행이 overflow-x 스크롤 컨테이너라 바깥쪽 offset은 잘린다 — 링을 안쪽에 그린다 */
    .jd-stock-top-bar__tab:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: calc(var(--jd-focus-ring-offset) * -1);
      border-radius: var(--jd-radius-sm);
    }
    .jd-stock-top-bar__tab[data-active] {
      color: var(--jd-color-foreground);
      border-block-end-color: var(--jd-color-primary);
    }

    @media (min-width: 640px) {
      .jd-stock-top-bar__inner {
        padding-inline: var(--jd-space-4);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .jd-stock-top-bar__back,
      .jd-stock-top-bar__tab {
        transition: none;
      }
    }
  }
`;
