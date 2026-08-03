import { css } from "../../core/styles.js";

/**
 * v2 값(기계 번역): bm-card-lg(둥근 카드·테두리), 섹션 헤드/타이틀, bm-chip(pill),
 * bm-table, bm-num(tabular).
 *
 * 강조색은 팔레트 안이다 — v2에서 넘어온 민트(#14b8a6/#0d9488)는 이 디자인 시스템의
 * 어느 브랜드에도 속하지 않아 화면에서 홀로 형광으로 떴다. primary 계열로 되돌린다.
 * 등락색도 직접 칠하지 않고 앱이 1회 덮어쓰는 훅을 경유한다.
 */
export default css`
  @layer junds.components {
    jd-consensus-screener {
      display: block;
      /* 플렉스/그리드 자식으로 놓였을 때 표가 부모를 밀어내지 않게 한다 */
      min-width: 0;
      overflow: hidden;
      border: 1px solid var(--jd-fin-border, var(--jd-color-border));
      border-radius: var(--jd-radius-2xl);
      background: var(--jd-fin-surface, var(--jd-color-card));
      /* 채움만 있는 면은 색종이로 읽힌다 — 얕은 그림자로 면을 띄운다 */
      box-shadow: var(--jd-shadow-xs);
      font-family: var(--jd-font-sans);
      --_accent: var(--jd-fin-accent, var(--jd-color-primary));
      --_accent-strong: var(--jd-fin-accent-strong, var(--jd-color-primary-hover));
      --_accent-soft: var(--jd-fin-accent-soft, var(--jd-color-primary-light));
      --_soft: var(--jd-fin-soft-100, var(--jd-color-neutral-100));
      --_text: var(--jd-fin-text, var(--jd-color-foreground));
      --_muted: var(--jd-fin-muted, var(--jd-color-muted));
      --_border: var(--jd-fin-border, var(--jd-color-border));
      --_up: var(--jd-finance-up, var(--jd-color-success));
      --_down: var(--jd-finance-down, var(--jd-color-danger));
    }

    .jd-consensus-screener__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--jd-space-3);
      padding: var(--jd-space-3) var(--jd-space-4);
      border-block-end: 1px solid var(--_border);
    }
    .jd-consensus-screener__title {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      font-size: var(--jd-text-sm);
      font-weight: 800;
      color: var(--_text);
    }
    .jd-consensus-screener__title-icon {
      display: inline-flex;
      color: var(--_accent-strong);
    }
    /* outline: none은 대체 표시 없이 쓰면 키보드 사용자에게서 커서를 빼앗는다.
     기본 아웃라인은 두되 :focus-visible에서 시스템 링으로 갈아끼운다. */
    .jd-consensus-screener__sort {
      height: 1.75rem;
      padding: 0 var(--jd-space-2);
      font-size: 12px;
      font-weight: var(--jd-weight-bold);
      font-family: inherit;
      white-space: nowrap;
      border-radius: var(--jd-radius-md);
      background: var(--_soft);
      border: 1px solid var(--_border);
      color: var(--_text);
      cursor: pointer;
      transition: border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        background-color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-consensus-screener__sort:hover {
      border-color: color-mix(in srgb, var(--_border) 70%, var(--jd-color-muted-light));
    }
    .jd-consensus-screener__sort:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    .jd-consensus-screener__bulls {
      display: flex;
      align-items: center;
      gap: var(--jd-space-3);
      padding: var(--jd-space-3) var(--jd-space-4);
      border-block-end: 1px solid var(--_border);
    }
    .jd-consensus-screener__bulls-label {
      font-size: 11px;
      font-weight: 800;
      white-space: nowrap;
      letter-spacing: var(--jd-tracking-wide);
      text-transform: uppercase;
      color: var(--_muted);
    }
    .jd-consensus-screener__bull-btns {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
    }
    .jd-consensus-screener__bull-btn {
      height: 1.75rem;
      min-width: 34px;
      padding: 0 var(--jd-space-2);
      font-size: 12px;
      font-weight: 800;
      font-family: inherit;
      white-space: nowrap;
      cursor: pointer;
      border-radius: var(--jd-radius-md);
      background: var(--_soft);
      color: var(--_text);
      border: 1px solid var(--_border);
      /* all 금지 — 레이아웃 속성까지 대상이 되어 매 프레임 리플로우가 생긴다 */
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    /* 호버는 filter: brightness가 아니라 실색 전환 — brightness는 글자까지 밝힌다 */
    .jd-consensus-screener__bull-btn:hover {
      background: color-mix(in srgb, var(--_accent) 10%, var(--_soft));
      border-color: color-mix(in srgb, var(--_border) 70%, var(--jd-color-muted-light));
    }
    .jd-consensus-screener__bull-btn:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-consensus-screener__bull-btn:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }
    .jd-consensus-screener__bull-btn[data-active] {
      background: var(--_accent-strong);
      color: #fff;
      border-color: var(--_accent-strong);
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
    }
    .jd-consensus-screener__bull-btn[data-active]:hover {
      background: var(--_accent);
    }
    .jd-consensus-screener__count {
      margin-inline-start: auto;
      font-size: 11.5px;
      white-space: nowrap;
      color: var(--_muted);
      font-variant-numeric: tabular-nums;
    }

    .jd-consensus-screener__chips {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      padding: var(--jd-space-2-5) var(--jd-space-4);
      overflow-x: auto;
      overscroll-behavior-x: contain;
      scrollbar-width: thin;
      /* 오른쪽 끝을 눅여 "더 있다"를 알린다 — 칩이 다 보이는 폭에서는 빈 공간이라 티가 안 난다 */
      mask-image: linear-gradient(90deg, #000 0 calc(100% - 24px), transparent);
      border-block-end: 1px solid var(--_border);
    }
    .jd-consensus-screener__chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
      padding: 4px var(--jd-space-2-5);
      font-size: 12px;
      font-weight: var(--jd-weight-bold);
      font-family: inherit;
      cursor: pointer;
      white-space: nowrap;
      border-radius: var(--jd-radius-full);
      background: var(--_soft);
      color: var(--_text);
      border: 1px solid transparent;
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-consensus-screener__chip:hover {
      background: color-mix(in srgb, var(--_accent) 10%, var(--_soft));
      border-color: color-mix(in srgb, var(--_accent) 30%, transparent);
    }
    .jd-consensus-screener__chip:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-consensus-screener__chip:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }
    .jd-consensus-screener__chip[data-active] {
      background: var(--_accent-soft);
      /* 원색 글자는 다크에서 틴트 위에 가라앉는다 — 잉크(foreground)를 섞어 두 모드 모두 읽히게 */
      color: color-mix(in srgb, var(--_accent) 45%, var(--jd-color-foreground));
      border-color: var(--_accent);
    }
    .jd-consensus-screener__chip-count {
      font-size: var(--jd-text-2xs);
      font-weight: 800;
      opacity: 0.7;
    }

    /* 잘린 채 끝나는 것과 굴릴 수 있는 것은 다르다 — 표는 스스로 구른다 */
    .jd-consensus-screener__table-wrap {
      overflow-x: auto;
      overscroll-behavior-x: contain;
      scrollbar-width: thin;
    }
    .jd-consensus-screener__table {
      width: 100%;
      /* 아홉 열이 다 읽히는 최소 폭 — 이보다 좁으면 열을 구기지 말고 굴린다 */
      min-width: 44rem;
      border-collapse: collapse;
      font-size: 13px;
    }
    .jd-consensus-screener__table th,
    .jd-consensus-screener__table td {
      padding: var(--jd-space-2) var(--jd-space-3);
      text-align: right;
      white-space: nowrap;
    }
    .jd-consensus-screener__table thead th {
      font-size: 11px;
      font-weight: var(--jd-weight-semibold);
      color: var(--_muted);
      border-block-end: 1px solid var(--_border);
    }
    .jd-consensus-screener__table thead th:first-child,
    .jd-consensus-screener__table tbody th {
      text-align: left;
    }
    .jd-consensus-screener__table tbody tr + tr th,
    .jd-consensus-screener__table tbody tr + tr td {
      border-block-start: 1px solid color-mix(in srgb, var(--_border) 60%, transparent);
    }
    .jd-consensus-screener__table tbody th {
      font-weight: var(--jd-weight-bold);
      color: var(--_text);
    }

    .jd-consensus-screener__num {
      font-variant-numeric: tabular-nums;
      color: var(--_text);
    }
    .jd-consensus-screener__num[data-tone="up"] {
      color: var(--_up);
    }
    .jd-consensus-screener__num[data-tone="down"] {
      color: var(--_down);
    }
    .jd-consensus-screener__num[data-tone="muted"] {
      color: var(--_muted);
    }
    .jd-consensus-screener__strong {
      font-weight: 800;
    }

    .jd-consensus-screener__name {
      appearance: none;
      padding: 0;
      border: 0;
      border-radius: var(--jd-radius-sm);
      background: none;
      cursor: pointer;
      font: inherit;
      font-weight: 800;
      color: var(--_text);
      text-decoration: none;
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-consensus-screener__name:hover {
      color: var(--_accent-strong);
      text-decoration: underline;
    }
    .jd-consensus-screener__name:active {
      color: var(--_accent);
    }
    .jd-consensus-screener__name:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }
    .jd-consensus-screener__sector {
      margin-inline-start: 6px;
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      color: var(--_muted);
    }

    .jd-consensus-screener__supporters {
      display: flex;
      align-items: center;
      gap: 2px;
      justify-content: flex-end;
    }
    .jd-consensus-screener__emoji {
      font-size: 14px;
      line-height: 1;
    }

    .jd-consensus-screener__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--jd-space-2);
      padding: var(--jd-space-10) var(--jd-space-4);
      text-align: center;
    }
    .jd-consensus-screener__empty-icon {
      color: var(--_muted);
    }
    .jd-consensus-screener__empty-title {
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-bold);
      color: var(--_text);
    }
    .jd-consensus-screener__empty-desc {
      font-size: var(--jd-text-xs);
      color: var(--_muted);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-consensus-screener__sort,
      .jd-consensus-screener__bull-btn,
      .jd-consensus-screener__chip,
      .jd-consensus-screener__name {
        transition: none;
      }
    }
  }
`;
