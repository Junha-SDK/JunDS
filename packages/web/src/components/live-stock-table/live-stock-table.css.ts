import { css } from "../../core/styles.js";

/**
 * v2 값: 카드(bm-card overflow hidden), 컨트롤 바 px-3 py-2 wrap + 하단 보더, 검색·셀렉트
 * bm-soft-100, 시장 세그먼트(활성 accent), 표 11.5px 스크롤(maxHeight), sticky thead
 * bm-soft-100, 짝수행 zebra, 가격 trend 착색 + ▲/▼, 등락률 up/down.
 *
 * 표는 좁아지면 셀 안에서 접혔다 — "SK하이/닉스", "342.00/조", 헤더 "섹/터". 셀은 접히지
 * 않게 못 박고(수치는 tabular-nums), 대신 **표 전체가 가로로 구른다**. 잘린 채 끝나는 것과
 * 굴릴 수 있는 것은 다르다.
 */
export default css`
  @layer junds.components {
    jd-live-stock-table {
      /* 등락색은 직접 칠하지 않고 앱이 1회 덮어쓰는 훅을 경유한다 — 직접 칠하면 한국 관례
       override가 이 컴포넌트만 비껴가 한 화면에서 등락색이 갈라진다. */
      --jd-fin-up: var(--jd-finance-up, var(--jd-color-success));
      --jd-fin-down: var(--jd-finance-down, var(--jd-color-danger));
      /* 거래대금은 등락이 아니라 제3의 계열 — 팔레트 안의 hue에서 뽑는다 */
      --jd-fin-neutral: var(--jd-color-hue-purple);
      --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
      --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
      --jd-fin-border: var(--bm-border, var(--jd-color-border));
      --jd-fin-card: var(--bm-card, var(--jd-color-card));
      --jd-fin-soft: var(
        --bm-soft-100,
        color-mix(in srgb, var(--jd-color-foreground) 6%, transparent)
      );
      --jd-fin-accent: var(--bm-accent-strong, var(--jd-color-primary));

      display: block;
      font-family: var(--jd-font-sans);
      color: var(--jd-fin-text);
    }
    jd-live-stock-table * {
      box-sizing: border-box;
    }

    .jd-lst__card {
      overflow: hidden;
      background: var(--jd-fin-card);
      border: var(--jd-border-thin) solid var(--jd-fin-border);
      border-radius: var(--jd-radius-xl);
      /* 채움만 있는 면은 색종이로 읽힌다 — 얕은 그림자로 면을 띄운다 */
      box-shadow: var(--jd-shadow-xs);
    }

    .jd-lst__bar {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      flex-wrap: wrap;
      padding: var(--jd-space-2) var(--jd-space-3);
      border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    .jd-lst__count {
      font-size: 12.5px;
      font-weight: 800;
      white-space: nowrap;
    }

    .jd-lst__search,
    .jd-lst__select {
      transition: border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        background-color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-lst__search:hover,
    .jd-lst__select:hover {
      border-color: color-mix(in srgb, var(--jd-fin-border) 70%, var(--jd-color-muted-light));
    }
    .jd-lst__search:focus-visible,
    .jd-lst__select:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }
    .jd-lst__search {
      flex: 1 1 200px;
      min-width: 160px;
      padding: 4px var(--jd-space-2-5);
      font: inherit;
      font-size: 11.5px;
      color: var(--jd-fin-text);
      background: var(--jd-fin-soft);
      border: var(--jd-border-thin) solid var(--jd-fin-border);
      border-radius: var(--jd-radius-md);
    }

    .jd-lst__toggle {
      display: inline-flex;
      overflow: hidden;
      border: var(--jd-border-thin) solid var(--jd-fin-border);
      border-radius: var(--jd-radius-md);
    }
    .jd-lst__toggle-btn {
      padding: 2px var(--jd-space-2);
      font: inherit;
      font-size: var(--jd-text-2xs);
      font-weight: 800;
      white-space: nowrap;
      background: transparent;
      color: var(--jd-fin-muted);
      border: 0;
      cursor: pointer;
      /* all 금지 — 레이아웃 속성까지 대상이 되어 매 프레임 리플로우가 생긴다 */
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    /* 호버는 filter: brightness가 아니라 실색 전환 — brightness는 글자까지 밝힌다 */
    .jd-lst__toggle-btn:hover {
      background: color-mix(in srgb, var(--jd-fin-accent) 10%, transparent);
      color: var(--jd-fin-text);
    }
    .jd-lst__toggle-btn:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-lst__toggle-btn:focus-visible {
      outline: var(--jd-focus-ring);
      /* 세그먼트가 overflow:hidden 안이라 바깥 offset은 잘린다 — 안쪽으로 접는다 */
      outline-offset: calc(-1 * var(--jd-focus-ring-offset));
    }
    .jd-lst__toggle-btn[data-active] {
      background: var(--jd-fin-accent);
      /* 카드색은 다크에서 어두워져 accent 위에서 읽히지 않는다 — 흰 글자로 고정 */
      color: #fff;
    }
    .jd-lst__toggle-btn[data-active]:hover {
      background: var(--jd-color-primary-hover);
      color: #fff;
    }

    .jd-lst__select {
      padding: 4px var(--jd-space-2);
      font: inherit;
      font-size: 11px;
      color: var(--jd-fin-text);
      background: var(--jd-fin-soft);
      border: var(--jd-border-thin) solid var(--jd-fin-border);
      border-radius: var(--jd-radius-md);
    }

    /* 잘린 채 끝나는 것과 굴릴 수 있는 것은 다르다 — 표는 스스로 구른다 */
    .jd-lst__scroll {
      overflow-y: auto;
      overflow-x: auto;
      overscroll-behavior-x: contain;
      scrollbar-width: thin;
    }
    .jd-lst__table {
      width: 100%;
      /* 여섯 열이 다 읽히는 최소 폭 — 이보다 좁으면 셀을 구기지 말고 굴린다 */
      min-width: 34rem;
      border-collapse: collapse;
      font-size: 11.5px;
      font-variant-numeric: tabular-nums;
    }
    /* 헤더 셀이 접히면 "섹/터"가 된다 — 열 이름은 한 줄이다 */
    .jd-lst__th {
      position: sticky;
      top: 0;
      z-index: 1;
      padding: var(--jd-space-1-5) var(--jd-space-3);
      text-align: left;
      white-space: nowrap;
      font-size: var(--jd-text-2xs);
      font-weight: 800;
      color: var(--jd-fin-muted);
      background: var(--jd-fin-soft);
      border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    .jd-lst__th[data-right] {
      text-align: right;
    }

    .jd-lst__row {
      border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
      cursor: pointer;
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-lst__row:nth-child(even) {
      background: var(--jd-fin-soft);
    }
    .jd-lst__row:hover {
      background: color-mix(in srgb, var(--jd-fin-accent) 6%, transparent);
    }
    /* 눌린 면은 빛을 잃는다. <tr>은 scale이 표 레이아웃을 깨므로 눌림을 색으로 말한다 */
    .jd-lst__row:active {
      background: color-mix(in srgb, var(--jd-fin-accent) 14%, transparent);
    }
    .jd-lst__row:focus-visible {
      outline: var(--jd-focus-ring);
      /* 스크롤 컨테이너 안이라 바깥 offset은 잘린다 — 안쪽으로 접는다 */
      outline-offset: calc(-1 * var(--jd-focus-ring-offset));
    }

    .jd-lst__num,
    .jd-lst__name-cell,
    .jd-lst__sector,
    .jd-lst__price,
    .jd-lst__pct,
    .jd-lst__vol {
      padding: var(--jd-space-1-5) var(--jd-space-3);
    }
    .jd-lst__num {
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      white-space: nowrap;
      color: var(--jd-fin-muted);
    }

    .jd-lst__name-cell {
      display: flex;
      flex-direction: column;
      line-height: 1.25;
    }
    /* 종목명은 접히면 "SK하이/닉스"가 된다 — 한 줄로 두고, 정 모자라면 표가 구른다 */
    .jd-lst__name {
      font-weight: 800;
      white-space: nowrap;
      color: var(--jd-fin-text);
    }
    .jd-lst__sub {
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      white-space: nowrap;
      color: var(--jd-fin-muted);
      font-variant-numeric: tabular-nums;
    }

    .jd-lst__sector {
      color: var(--jd-fin-muted);
    }
    .jd-lst__tag {
      display: inline-block;
      font-size: var(--jd-text-2xs);
      font-weight: 800;
      white-space: nowrap;
      color: var(--jd-fin-muted);
      background: var(--jd-fin-soft);
      border: var(--jd-border-thin) solid var(--jd-fin-border);
      border-radius: var(--jd-radius-full);
      padding: 1px var(--jd-space-1-5);
    }

    /* 수치 열: 자릿수가 흔들리지 않게 tabular, 단위가 다음 줄로 떨어지지 않게 nowrap */
    .jd-lst__price,
    .jd-lst__pct,
    .jd-lst__vol {
      font-weight: 800;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-lst__price[data-right],
    .jd-lst__pct[data-right],
    .jd-lst__vol[data-right] {
      text-align: right;
    }
    .jd-lst__price[data-trend="up"] {
      color: var(--jd-fin-up);
    }
    .jd-lst__price[data-trend="down"] {
      color: var(--jd-fin-down);
    }
    .jd-lst__price[data-trend="flat"] {
      color: var(--jd-fin-text);
    }
    .jd-lst__pct[data-dir="up"] {
      color: var(--jd-fin-up);
    }
    .jd-lst__pct[data-dir="down"] {
      color: var(--jd-fin-down);
    }
    .jd-lst__vol {
      color: var(--jd-fin-neutral);
      font-weight: 700;
    }

    .jd-lst__empty {
      padding: var(--jd-space-6) var(--jd-space-3);
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      color: var(--jd-fin-muted);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-lst__search,
      .jd-lst__select,
      .jd-lst__toggle-btn,
      .jd-lst__row,
      .jd-lst__price,
      .jd-lst__pct,
      .jd-lst__vol {
        transition: none;
      }
    }
  }
`;
