import { css } from "../../core/styles.js";

/**
 * v2 값: 카드(bm-card overflow hidden), 헤더 px-3 py-2 + 하단 보더, 3열 그리드, 열 헤더
 * bm-soft-100 + tone 점, 행 grid[16px 이름 순위값], 1위 rank 배지 tone색, 등락률 up/down
 * 착색. 시장 토글 세그먼트(활성 accent 배경). 형제 jd-investor-ranking과 동일 관용구.
 *
 * 3열 전환은 뷰포트가 아니라 **카드 폭**으로 판단한다 — 뷰포트만 보면 좁은 자리에 놓인
 * 카드도 3열이 되어 종목명이 "S…"로 잘렸다. 이름 트랙에는 최소 폭을 준다.
 */
export default css`
  @layer junds.components {
    jd-live-top-movers {
      /* 등락색은 직접 칠하지 않고 앱이 1회 덮어쓰는 훅을 경유한다 — 직접 칠하면 한국 관례
       override가 이 컴포넌트만 비껴가 한 화면에서 등락색이 갈라진다. */
      --jd-fin-up: var(--jd-finance-up, var(--jd-color-success));
      --jd-fin-down: var(--jd-finance-down, var(--jd-color-danger));
      /* 거래대금 열은 등락이 아니라 제3의 계열 — 팔레트 안의 hue에서 뽑는다 */
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
      /* 열 배분의 기준은 뷰포트가 아니라 이 카드가 실제로 받은 폭이다 */
      /* inline-size 컨테이너는 **내용이 폭을 정하지 못한다**. 부모가 준 폭을 명시적으로
         받지 않으면 flex·inline 문맥에서 호스트가 0으로 접혀 카드가 통째로 사라진다(실측). */
      width: 100%;
      container: jd-ltm / inline-size;
      font-family: var(--jd-font-sans);
      color: var(--jd-fin-text);
    }
    jd-live-top-movers * {
      box-sizing: border-box;
    }

    .jd-ltm__card {
      overflow: hidden;
      background: var(--jd-fin-card);
      border: var(--jd-border-thin) solid var(--jd-fin-border);
      border-radius: var(--jd-radius-xl);
      /* 채움만 있는 면은 색종이로 읽힌다 — 얕은 그림자로 면을 띄운다 */
      box-shadow: var(--jd-shadow-xs);
    }

    .jd-ltm__head {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      flex-wrap: wrap;
      padding: var(--jd-space-2) var(--jd-space-3);
      border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    .jd-ltm__title {
      font-size: 12.5px;
      font-weight: 800;
      white-space: nowrap;
    }
    .jd-ltm__source {
      margin-inline-start: auto;
      font-size: 11.5px;
      font-weight: 700;
      white-space: nowrap;
      color: var(--jd-fin-muted);
      font-variant-numeric: tabular-nums;
    }
    .jd-ltm__source[hidden] {
      display: none;
    }

    .jd-ltm__toggle {
      display: inline-flex;
      overflow: hidden;
      border: var(--jd-border-thin) solid var(--jd-fin-border);
      border-radius: var(--jd-radius-md);
    }
    .jd-ltm__toggle-btn {
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
    .jd-ltm__toggle-btn:hover {
      background: color-mix(in srgb, var(--jd-fin-accent) 10%, transparent);
      color: var(--jd-fin-text);
    }
    .jd-ltm__toggle-btn:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-ltm__toggle-btn:focus-visible {
      outline: var(--jd-focus-ring);
      /* 세그먼트가 overflow:hidden 안이라 바깥 offset은 잘린다 — 안쪽으로 접는다 */
      outline-offset: calc(-1 * var(--jd-focus-ring-offset));
    }
    .jd-ltm__toggle-btn[data-active] {
      background: var(--jd-fin-accent);
      /* 카드색은 다크에서 어두워져 accent 위에서 읽히지 않는다 — 흰 글자로 고정 */
      color: #fff;
    }
    .jd-ltm__toggle-btn[data-active]:hover {
      background: var(--jd-color-primary-hover);
      color: #fff;
    }

    .jd-ltm__grid {
      display: grid;
      grid-template-columns: 1fr;
    }
    /* 44rem = 한 열이 (순위 + 이름 최소 6.5rem + 값) 을 감당하는 최소 카드 폭.
     이보다 좁으면 3열로 쪼개는 순간 이름이 남지 않는다 — 세로로 쌓는다. */
    @container jd-ltm (min-width: 44rem) {
      .jd-ltm__grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    .jd-ltm__col {
      --_tone: var(--jd-fin-muted);
      min-width: 0;
      border-inline-end: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    .jd-ltm__col[data-tone="up"] {
      --_tone: var(--jd-fin-up);
    }
    .jd-ltm__col[data-tone="down"] {
      --_tone: var(--jd-fin-down);
    }
    .jd-ltm__col[data-tone="neutral"] {
      --_tone: var(--jd-fin-neutral);
    }
    .jd-ltm__col[data-last] {
      border-inline-end: none;
    }
    @container jd-ltm (max-width: 43.999rem) {
      .jd-ltm__col {
        border-inline-end: none;
        border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
      }
      .jd-ltm__col[data-last] {
        border-block-end: none;
      }
    }

    .jd-ltm__col-head {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      padding: 6px var(--jd-space-3);
      background: var(--jd-fin-soft);
      border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    .jd-ltm__col-dot {
      width: 8px;
      height: 8px;
      flex-shrink: 0;
      border-radius: var(--jd-radius-full);
      background: var(--_tone);
    }
    .jd-ltm__col-label {
      font-size: 11.5px;
      font-weight: 800;
      white-space: nowrap;
    }

    .jd-ltm__list {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    /* 이름 트랙에 바닥을 준다 — 1fr(=minmax(auto,1fr))은 남는 폭을 값 열에 다 내주고
     "S…"처럼 한두 글자만 남긴다. 말줄임은 정보가 남을 때만 말줄임이다. */
    .jd-ltm__row {
      display: grid;
      grid-template-columns: 16px minmax(6.5rem, 1fr) auto;
      gap: var(--jd-space-2);
      align-items: center;
      padding: 6px var(--jd-space-3);
      border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    .jd-ltm__row:last-child {
      border-block-end: none;
    }
    .jd-ltm__empty {
      padding: var(--jd-space-4) var(--jd-space-3);
      font-size: 11.5px;
      font-weight: 700;
      color: var(--jd-fin-muted);
      text-align: center;
    }

    .jd-ltm__rank {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border-radius: var(--jd-radius-full);
      font-size: var(--jd-text-2xs);
      font-weight: 800;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      background: var(--jd-fin-soft);
      color: var(--jd-fin-muted);
    }
    /* 원색 배경 + 흰 글자는 성공색(#2f8f57)에서 4.1:1로 AA에 못 미친다 —
     잉크를 15% 섞어 눅여 세 톤 모두 AA를 넘긴다. */
    .jd-ltm__rank[data-first] {
      background: color-mix(in srgb, var(--_tone) 85%, var(--jd-color-foreground));
      color: #fff;
    }

    .jd-ltm__meta {
      min-width: 0;
    }
    .jd-ltm__name {
      font-size: 11.5px;
      font-weight: 800;
      color: var(--jd-fin-text);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-ltm__row-sub {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      min-width: 0;
      margin-block-start: 2px;
    }
    .jd-ltm__price {
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      white-space: nowrap;
      color: var(--jd-fin-muted);
      font-variant-numeric: tabular-nums;
    }
    /* 코드는 길이가 고정이라 줄어들 이유가 없다 — 이름이 먼저 양보한다 */
    .jd-ltm__code {
      flex-shrink: 0;
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      white-space: nowrap;
      color: var(--jd-fin-muted);
      background: var(--jd-fin-soft);
      border-radius: var(--jd-radius-full);
      padding-inline: var(--jd-space-1);
      font-variant-numeric: tabular-nums;
    }
    .jd-ltm__value {
      font-size: 12px;
      font-weight: 800;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      /* 값이 갱신될 때마다 방향이 바뀐다 — 색이 튀지 않게 짧게 건너간다 */
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-ltm__value[data-dir="up"] {
      color: var(--jd-fin-up);
    }
    .jd-ltm__value[data-dir="down"] {
      color: var(--jd-fin-down);
    }
    .jd-ltm__value[data-dir="neutral"] {
      color: var(--jd-fin-neutral);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-ltm__toggle-btn,
      .jd-ltm__value {
        transition: none;
      }
    }
  }
`;
