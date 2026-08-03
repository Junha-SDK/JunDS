import { css } from "../../core/styles.js";

/**
 * jd-my-position-panel CSS — v2 MyPositionPanel(포지션 카드 + 빈 상태 유도).
 * 손익 방향(수익=상승, 손실=하락)은 data-dir로 칠한다. 값 폰트는 tabular-nums(bm-num).
 *
 * 4열 전환은 뷰포트가 아니라 **패널 폭**으로 판단한다 — 뷰포트만 보면 좁은 자리에 놓인
 * 패널도 4열이 되어 "보유/수량", "68,400/원"으로 쪼개졌다. 라벨과 값+단위는 한 덩어리다.
 */
export default css`
  @layer junds.components {
    jd-my-position-panel {
      /* 등락색은 직접 칠하지 않고 앱이 1회 덮어쓰는 훅을 경유한다 — 직접 칠하면 한국 관례
       override가 이 컴포넌트만 비껴가 한 화면에서 등락색이 갈라진다. */
      --jd-fin-up: var(--jd-finance-up, var(--jd-color-success));
      --jd-fin-down: var(--jd-finance-down, var(--jd-color-danger));
      --jd-fin-up-soft: color-mix(in srgb, var(--jd-fin-up) 14%, transparent);
      --jd-fin-down-soft: color-mix(in srgb, var(--jd-fin-down) 14%, transparent);
      --jd-fin-accent: var(--bm-accent-strong, var(--jd-color-primary));
      --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
      --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
      --jd-fin-border: var(--bm-border, var(--jd-color-border));
      --jd-fin-card: var(--bm-card, var(--jd-color-card));
      --jd-fin-soft: var(
        --bm-soft-100,
        color-mix(in srgb, var(--jd-color-foreground) 6%, transparent)
      );

      display: block;
      box-sizing: border-box;
      /* 열 배분의 기준은 뷰포트가 아니라 이 패널이 실제로 받은 폭이다 */
      /* inline-size 컨테이너는 **내용이 폭을 정하지 못한다**. 부모가 준 폭을 명시적으로
         받지 않으면 flex·inline 문맥에서 호스트가 0으로 접혀 카드가 통째로 사라진다(실측). */
      width: 100%;
      container: jd-mpp / inline-size;
      font-family: var(--jd-font-sans);
      color: var(--jd-fin-text);
    }
    jd-my-position-panel * {
      box-sizing: border-box;
    }
    .jd-my-position-panel__icon {
      flex-shrink: 0;
    }

    /* ── 포지션 카드 ── */
    .jd-my-position-panel__holding {
      display: block;
      overflow: hidden;
      background: var(--jd-fin-card);
      border: var(--jd-border-thin) solid var(--jd-fin-border);
      border-radius: var(--jd-radius-xl);
      /* 채움만 있는 면은 색종이로 읽힌다 — 얕은 그림자로 면을 띄운다 */
      box-shadow: var(--jd-shadow-xs);
    }
    .jd-my-position-panel__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--jd-space-1) var(--jd-space-2);
      min-width: 0;
      padding: var(--jd-space-3) var(--jd-space-4);
      border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    .jd-my-position-panel__titlewrap {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-2);
      color: var(--jd-fin-accent);
    }
    .jd-my-position-panel__heading {
      margin: 0;
      font-size: 14px;
      font-weight: 800;
      white-space: nowrap;
      color: var(--jd-fin-text);
    }
    .jd-my-position-panel__tag {
      display: inline-flex;
      align-items: center;
      padding: 2px var(--jd-space-2);
      border-radius: var(--jd-radius-full);
      font-size: 11px;
      font-weight: 800;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      background: var(--jd-fin-soft);
      color: var(--jd-fin-muted);
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out),
        background-color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-my-position-panel__tag[data-dir="up"] {
      background: var(--jd-fin-up-soft);
      color: var(--jd-fin-up);
    }
    .jd-my-position-panel__tag[data-dir="down"] {
      background: var(--jd-fin-down-soft);
      color: var(--jd-fin-down);
    }

    .jd-my-position-panel__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--jd-space-3);
      padding: var(--jd-space-4);
    }
    /* 30rem = 네 칸 모두 "평균 단가 / 68,400원"을 한 줄로 담는 최소 패널 폭 */
    @container jd-mpp (min-width: 30rem) {
      .jd-my-position-panel__grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }
    .jd-my-position-panel__cell {
      min-width: 0;
      padding: var(--jd-space-2-5) var(--jd-space-3);
      border-radius: var(--jd-radius-xl);
      background: var(--jd-fin-soft);
    }
    /* 라벨은 두 줄로 접히면 안 된다 — "보유/수량"은 라벨이 아니라 파편이다 */
    .jd-my-position-panel__cell-label {
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      white-space: nowrap;
      color: var(--jd-fin-muted);
    }
    /* 값 + 단위는 한 덩어리 — "42"와 "주"가 갈라지면 수가 아니라 낱말이 된다 */
    .jd-my-position-panel__cell-value {
      margin-block-start: 2px;
      font-size: 15px;
      font-weight: 800;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      color: var(--jd-fin-text);
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-my-position-panel__cell-value[data-tone="up"] {
      color: var(--jd-fin-up);
    }
    .jd-my-position-panel__cell-value[data-tone="down"] {
      color: var(--jd-fin-down);
    }
    .jd-my-position-panel__cell-unit {
      margin-inline-start: 2px;
      font-size: var(--jd-text-2xs);
      font-weight: 600;
      opacity: 0.7;
    }

    .jd-my-position-panel__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--jd-space-3) var(--jd-space-4);
      background: var(--jd-fin-soft);
      border-block-start: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    .jd-my-position-panel__foot-right {
      text-align: end;
    }
    .jd-my-position-panel__foot-label {
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      white-space: nowrap;
      color: var(--jd-fin-muted);
    }
    .jd-my-position-panel__profit-value {
      font-size: 20px;
      font-weight: 800;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      color: var(--jd-fin-text);
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-my-position-panel__profit-value[data-dir="up"] {
      color: var(--jd-fin-up);
    }
    .jd-my-position-panel__profit-value[data-dir="down"] {
      color: var(--jd-fin-down);
    }
    .jd-my-position-panel__cost-value {
      font-size: 16px;
      font-weight: 800;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      color: var(--jd-fin-text);
    }

    /* ── 빈 상태 ── */
    .jd-my-position-panel__empty {
      display: flex;
      align-items: center;
      gap: var(--jd-space-3);
      padding: var(--jd-space-2-5) var(--jd-space-3-5);
      border-radius: var(--jd-radius-xl);
      background: var(--jd-fin-soft);
      border: var(--jd-border-thin) dashed var(--jd-fin-border);
      color: var(--jd-fin-muted);
    }
    .jd-my-position-panel__empty-text {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: baseline;
      gap: var(--jd-space-2);
      flex-wrap: wrap;
    }
    .jd-my-position-panel__empty-title {
      font-size: 12.5px;
      font-weight: 700;
      color: var(--jd-fin-text);
    }
    .jd-my-position-panel__empty-sub {
      font-size: 11.5px;
      color: var(--jd-fin-muted);
    }
    .jd-my-position-panel__register {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1);
      height: 28px;
      padding: 0 var(--jd-space-2-5);
      border: none;
      border-radius: var(--jd-radius-lg);
      cursor: pointer;
      font-family: inherit;
      font-size: 12px;
      font-weight: 800;
      white-space: nowrap;
      background: var(--jd-fin-accent);
      /* 카드색은 다크에서 어두워져 accent 위에서 읽히지 않는다 — 흰 글자로 고정 */
      color: #fff;
      /* 채움만 있는 면은 색종이로 읽힌다 — 위에서 받는 빛을 얹는다 */
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
      /* all 금지 — 레이아웃 속성까지 대상이 되어 매 프레임 리플로우가 생긴다 */
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    /* brightness는 글자·아이콘까지 밝혀 흰 글자가 배경에 녹는다 — 실색 전환으로 바꾼다 */
    .jd-my-position-panel__register:hover {
      background: var(--jd-color-primary-hover);
      box-shadow: 0 4px 12px var(--jd-color-primary-glow), var(--jd-shadow-xs),
        inset 0 1px 0 var(--jd-color-highlight);
    }
    .jd-my-position-panel__register:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-my-position-panel__register:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }
    .jd-my-position-panel__all {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
      border-radius: var(--jd-radius-sm);
      text-decoration: none;
      color: var(--jd-fin-accent);
    }
    .jd-my-position-panel__all:hover {
      text-decoration: underline;
    }
    .jd-my-position-panel__all:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-my-position-panel__tag,
      .jd-my-position-panel__cell-value,
      .jd-my-position-panel__profit-value,
      .jd-my-position-panel__register {
        transition: none;
      }
    }
  }
`;
