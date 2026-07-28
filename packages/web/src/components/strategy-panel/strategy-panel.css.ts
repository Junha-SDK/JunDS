import { css } from "../../core/styles.js";

/**
 * jd-strategy-panel CSS — v2 finance/StrategyPanel 토큰 번역.
 * 톤(추천 5단계) 색/배경은 호스트 CSS 변수 --_jd-sp-color/-bg로 실려 .jd-strategy-panel__tone
 * 계열이 소비한다. 존(buy/sell/stop) 액센트는 data-tone → --_z, 칩·KPI·산식 값은
 * data-tone/data-trend로 색을 고른다(§3.1 결정적 렌더 — JS 색 분기 없음).
 * 토큰: --bm-accent-strong→primary, --bm-soft-100→border-light, --bm-info→info,
 * --bm-muted→muted. v2의 --bm-up/--bm-down은 아래 --jd-fin-up/down 훅이 이어받는다.
 */
export default css`
  @layer junds.base {
    jd-strategy-panel:not(:defined) {
      display: block;
    }
  }
  @layer junds.components {
    jd-strategy-panel {
      /* 등락색은 직접 칠하지 않고 앱이 1회 덮어쓰는 훅을 경유한다 — success/danger를 박아
       두면 한국 관례 override가 이 패널만 비껴가 한 화면에서 매수·상승색이 갈라진다.
       매수 존·손절선도 v2에서 --bm-up/--bm-down이었으므로 같은 훅을 탄다. */
      --jd-fin-up: var(--jd-finance-up, var(--jd-color-success));
      --jd-fin-down: var(--jd-finance-down, var(--jd-color-danger));

      display: block;
      /* 열 배분의 기준은 뷰포트가 아니라 이 패널이 실제로 받은 폭이다 */
      /* inline-size 컨테이너는 **내용이 폭을 정하지 못한다**. 부모가 준 폭을 명시적으로
         받지 않으면 flex·inline 문맥에서 호스트가 0으로 접혀 카드가 통째로 사라진다(실측). */
      width: 100%;
      container: jd-sp / inline-size;
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      overflow: hidden;
      /* 채움만 있는 면은 색종이로 읽힌다 — 얕은 그림자로 면을 띄운다 */
      box-shadow: var(--jd-shadow-xs);
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }
    .jd-strategy-panel__body {
      display: block;
    }

    .jd-strategy-panel__tone {
      color: var(--_jd-sp-color, var(--jd-color-muted));
    }
    .jd-strategy-panel__accent-icon {
      color: var(--jd-color-primary-ink);
    }
    .jd-strategy-panel__tone-icon {
      color: var(--_jd-sp-color, var(--jd-color-muted));
    }

    /* ── 헤더 ── */
    .jd-strategy-panel__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--jd-space-2);
      padding: var(--jd-space-3) var(--jd-space-4);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-strategy-panel__header-left {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
    }
    .jd-strategy-panel__header-right {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
    }
    .jd-strategy-panel__title {
      margin: 0;
      font-weight: 800;
      font-size: var(--jd-text-md);
    }
    .jd-strategy-panel__num {
      font-variant-numeric: tabular-nums;
    }

    /* ── 상단 그리드: 추천 카드 + KPI ── */
    .jd-strategy-panel__top {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--jd-space-4);
      padding: var(--jd-space-4);
    }
    .jd-strategy-panel__rec {
      display: flex;
      align-items: center;
      gap: var(--jd-space-3);
      border-radius: var(--jd-radius-xl);
      padding: var(--jd-space-3) var(--jd-space-4);
      background: var(--_jd-sp-bg, var(--jd-color-border-light));
    }
    .jd-strategy-panel__rec-icon {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      border-radius: var(--jd-radius-full);
      display: grid;
      place-items: center;
      background: var(--_jd-sp-strong, var(--_jd-sp-color, var(--jd-color-muted)));
      color: #fff;
    }
    .jd-strategy-panel__rec-main {
      flex: 1;
      min-width: 0;
    }
    .jd-strategy-panel__rec-caption {
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
    }
    .jd-strategy-panel__rec-label {
      font-size: var(--jd-text-xl);
      font-weight: 800;
    }
    .jd-strategy-panel__rec-metric {
      text-align: right;
    }
    .jd-strategy-panel__rec-metric--divider {
      padding-inline-end: var(--jd-space-3);
      border-inline-end: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-color-foreground) 8%, transparent);
    }
    .jd-strategy-panel__rec-metric-label {
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      color: var(--jd-color-muted);
    }
    .jd-strategy-panel__rec-metric-value {
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      font-weight: 800;
      font-size: var(--jd-text-lg);
    }
    .jd-strategy-panel__rec-metric-unit {
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-semibold);
      margin-inline-start: 2px;
      color: var(--jd-color-muted);
    }

    .jd-strategy-panel__kpis {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--jd-space-2);
    }
    .jd-strategy-panel__kpi {
      min-width: 0;
      border-radius: var(--jd-radius-xl);
      text-align: center;
      padding: var(--jd-space-2) var(--jd-space-3);
      background: var(--jd-color-border-light);
    }
    /* 라벨은 두 줄로 접히면 안 되고, 값 + 단위는 한 덩어리다 */
    .jd-strategy-panel__kpi-label {
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      white-space: nowrap;
      color: var(--jd-color-muted);
    }
    .jd-strategy-panel__kpi-value {
      font-variant-numeric: tabular-nums;
      font-weight: 800;
      font-size: var(--jd-text-md);
      white-space: nowrap;
      margin-top: var(--jd-space-0-5);
      color: var(--jd-color-foreground);
    }
    .jd-strategy-panel__kpi[data-tone="buy"] .jd-strategy-panel__kpi-value {
      color: var(--jd-fin-up);
    }
    .jd-strategy-panel__kpi[data-tone="stop"] .jd-strategy-panel__kpi-value {
      color: var(--jd-fin-down);
    }
    .jd-strategy-panel__kpi-unit {
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-semibold);
      margin-inline-start: 2px;
    }

    /* ── 근거 패널 (details) ── */
    .jd-strategy-panel__reason {
      padding: 0 var(--jd-space-4) var(--jd-space-3);
      border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-strategy-panel__reason-summary {
      cursor: pointer;
      list-style: none;
      user-select: none;
      padding-block: var(--jd-space-3);
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      font-size: 0.78125rem;
      font-weight: 800;
      border-radius: var(--jd-radius-md);
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-strategy-panel__reason-summary::-webkit-details-marker {
      display: none;
    }
    /* 접히는 것에는 셰브런이 있어야 한다 — 마커를 지웠으면 대신 그려 준다.
     기본 마커를 지운 자리에 아무 어포던스도 없으면 이 줄은 그냥 문장으로 읽힌다. */
    .jd-strategy-panel__reason-summary::after {
      content: "";
      flex-shrink: 0;
      width: 7px;
      height: 7px;
      margin-inline-start: var(--jd-space-1);
      border-inline-end: var(--jd-border-medium) solid var(--jd-color-muted);
      border-block-end: var(--jd-border-medium) solid var(--jd-color-muted);
      rotate: 45deg;
      transition: rotate var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-strategy-panel__reason[open] > .jd-strategy-panel__reason-summary::after {
      rotate: -135deg;
    }
    /* 누를 수 있는 것은 세 상태를 전부 가진다 */
    .jd-strategy-panel__reason-summary:hover {
      color: var(--jd-color-primary-ink);
    }
    .jd-strategy-panel__reason-summary:active {
      color: var(--jd-color-primary-hover);
    }
    .jd-strategy-panel__reason-summary:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }
    .jd-strategy-panel__reason-chip {
      margin-inline-start: auto;
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      padding: var(--jd-space-0-5) var(--jd-space-2);
      border-radius: var(--jd-radius-full);
      background: var(--_jd-sp-bg, var(--jd-color-border-light));
      color: var(--_jd-sp-color, var(--jd-color-muted));
      white-space: nowrap;
    }
    .jd-strategy-panel__reason-body {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
      gap: var(--jd-space-3);
      margin-top: var(--jd-space-1);
    }
    .jd-strategy-panel__reason-card {
      min-width: 0;
      border-radius: var(--jd-radius-xl);
      padding: var(--jd-space-3);
      font-size: var(--jd-text-xs);
      line-height: var(--jd-leading-relaxed);
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-strategy-panel__reason-card--soft {
      background: var(--jd-color-border-light);
    }
    .jd-strategy-panel__reason-heading {
      font-size: var(--jd-text-2xs);
      font-weight: 800;
      color: var(--jd-color-muted);
      margin-block-end: var(--jd-space-2);
    }
    .jd-strategy-panel__reason-p {
      margin: 0 0 var(--jd-space-2-5);
    }

    .jd-strategy-panel__breakdown {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-1-5);
    }
    .jd-strategy-panel__breakdown-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--jd-space-2);
    }
    .jd-strategy-panel__breakdown-main {
      min-width: 0;
      flex: 1;
    }
    .jd-strategy-panel__breakdown-label {
      font-weight: var(--jd-weight-bold);
    }
    .jd-strategy-panel__breakdown-detail {
      font-size: var(--jd-text-2xs);
      color: var(--jd-color-muted);
    }
    .jd-strategy-panel__breakdown-value {
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      font-weight: 800;
      font-size: 0.78125rem;
      flex-shrink: 0;
    }
    .jd-strategy-panel__breakdown-value[data-trend="up"] {
      color: var(--jd-fin-up);
    }
    .jd-strategy-panel__breakdown-value[data-trend="down"] {
      color: var(--jd-fin-down);
    }
    .jd-strategy-panel__breakdown-value[data-trend="text"] {
      color: var(--jd-color-foreground);
    }
    .jd-strategy-panel__breakdown-total {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--jd-space-2);
      padding-block-start: var(--jd-space-1-5);
      margin-block-start: var(--jd-space-1);
      border-block-start: var(--jd-border-thin) dashed var(--jd-color-border);
    }
    .jd-strategy-panel__breakdown-total-label {
      font-weight: 800;
    }
    .jd-strategy-panel__breakdown-total-value {
      font-variant-numeric: tabular-nums;
      font-weight: 800;
      font-size: var(--jd-text-md);
    }

    .jd-strategy-panel__reason-criteria {
      margin-block-start: var(--jd-space-2);
      padding-block-start: var(--jd-space-2);
      font-size: var(--jd-text-2xs);
      line-height: var(--jd-leading-relaxed);
      border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
      color: var(--jd-color-muted);
    }
    .jd-strategy-panel__reason-criteria strong {
      font-weight: 800;
      color: var(--jd-color-foreground);
    }

    .jd-strategy-panel__reasons {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-1);
    }
    .jd-strategy-panel__reason-item {
      display: flex;
      align-items: flex-start;
      gap: var(--jd-space-2);
    }
    .jd-strategy-panel__reason-dot {
      margin-top: 5px;
      flex-shrink: 0;
      width: 6px;
      height: 6px;
      border-radius: var(--jd-radius-full);
    }
    .jd-strategy-panel__tone-bgdot {
      background: var(--_jd-sp-color, var(--jd-color-muted));
    }
    .jd-strategy-panel__reason-disclaimer {
      margin-block-start: var(--jd-space-3);
      padding-block-start: var(--jd-space-2);
      font-size: var(--jd-text-2xs);
      line-height: var(--jd-leading-relaxed);
      border-block-start: var(--jd-border-thin) dashed var(--jd-color-border);
      color: var(--jd-color-muted);
    }

    /* ── 존 (매수/익절/손절) ── */
    .jd-strategy-panel__zones {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
      gap: var(--jd-space-4);
      padding: 0 var(--jd-space-4) var(--jd-space-4);
    }
    .jd-strategy-panel__zone {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-2);
      min-width: 0;
    }
    .jd-strategy-panel__zone[data-tone="buy"] {
      --_z: var(--jd-fin-up);
    }
    .jd-strategy-panel__zone[data-tone="sell"] {
      --_z: var(--jd-color-primary);
    }
    .jd-strategy-panel__zone[data-tone="stop"] {
      --_z: var(--jd-fin-down);
    }
    .jd-strategy-panel__zone-head {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      padding-inline: var(--jd-space-1);
    }
    .jd-strategy-panel__zone-icon {
      color: var(--_z);
    }
    .jd-strategy-panel__zone-title {
      margin: 0;
      font-size: 0.78125rem;
      font-weight: 800;
      color: var(--_z);
    }

    .jd-strategy-panel__level {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-2);
      border-radius: var(--jd-radius-xl);
      padding: var(--jd-space-2-5) var(--jd-space-3);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      background: var(--jd-color-card);
    }
    .jd-strategy-panel__level-left {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      min-width: 0;
    }
    .jd-strategy-panel__level-desc {
      font-size: 0.71875rem;
      font-weight: var(--jd-weight-bold);
      line-height: var(--jd-leading-tight);
    }
    .jd-strategy-panel__level-right {
      white-space: nowrap;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
    .jd-strategy-panel__level-price {
      white-space: nowrap;
      font-weight: 800;
      font-size: var(--jd-text-md);
      color: var(--_z);
    }
    .jd-strategy-panel__level-dist {
      white-space: nowrap;
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-semibold);
      color: var(--jd-color-muted);
    }

    .jd-strategy-panel__stop {
      border-radius: var(--jd-radius-xl);
      padding: var(--jd-space-3-5) var(--jd-space-3);
      border: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-fin-down) 30%, transparent);
      background: color-mix(in srgb, var(--jd-fin-down) 5%, transparent);
    }
    .jd-strategy-panel__stop-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-2);
    }
    .jd-strategy-panel__stop-right {
      white-space: nowrap;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
    .jd-strategy-panel__stop-price {
      white-space: nowrap;
      font-weight: 800;
      font-size: var(--jd-text-xl);
      color: var(--jd-fin-down);
    }
    .jd-strategy-panel__stop-dist {
      white-space: nowrap;
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-semibold);
      color: var(--jd-color-muted);
    }
    .jd-strategy-panel__stop-desc {
      margin: var(--jd-space-2) 0 0;
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-semibold);
      line-height: var(--jd-leading-relaxed);
      color: var(--jd-fin-down);
    }

    .jd-strategy-panel__chip {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      padding: 1px var(--jd-space-2);
      border-radius: var(--jd-radius-full);
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
    }
    .jd-strategy-panel__chip[data-tone="buy"] {
      background: color-mix(in srgb, var(--jd-fin-up) 14%, transparent);
      color: color-mix(in srgb, var(--jd-fin-up) 78%, var(--jd-color-foreground));
    }
    .jd-strategy-panel__chip[data-tone="sell"] {
      background: color-mix(in srgb, var(--jd-color-primary) 14%, transparent);
      color: var(--jd-color-primary-ink);
    }
    .jd-strategy-panel__chip[data-tone="stop"] {
      background: color-mix(in srgb, var(--jd-color-info) 14%, transparent);
      color: var(--jd-color-info);
    }

    /* ── 포지션 ── */
    .jd-strategy-panel__positions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
      gap: var(--jd-space-3);
      padding: var(--jd-space-3) var(--jd-space-4);
      background: var(--jd-color-border-light);
      border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-strategy-panel__position {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-2);
      min-width: 0;
      border-radius: var(--jd-radius-xl);
      padding: var(--jd-space-2) var(--jd-space-3);
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-strategy-panel__position-label {
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      white-space: nowrap;
      color: var(--jd-color-muted);
    }
    .jd-strategy-panel__position-value {
      font-variant-numeric: tabular-nums;
      font-weight: 800;
      font-size: var(--jd-text-lg);
      white-space: nowrap;
      color: var(--jd-color-foreground);
    }
    .jd-strategy-panel__position[data-tone="info"] .jd-strategy-panel__position-value {
      color: var(--jd-color-info);
    }
    .jd-strategy-panel__position[data-tone="primary"] .jd-strategy-panel__position-value {
      color: var(--jd-color-primary-ink);
    }
    .jd-strategy-panel__position[data-tone="up"] .jd-strategy-panel__position-value {
      color: var(--jd-fin-up);
    }
    .jd-strategy-panel__position-note {
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-semibold);
      white-space: nowrap;
      color: var(--jd-color-muted);
    }

    /* ── 노트 ── */
    .jd-strategy-panel__notes {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-1-5);
      padding: var(--jd-space-3) var(--jd-space-4);
      font-size: 0.78125rem;
      border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-strategy-panel__note {
      display: flex;
      align-items: flex-start;
      gap: var(--jd-space-2);
      line-height: var(--jd-leading-relaxed);
    }
    .jd-strategy-panel__note-icon {
      margin-top: 3px;
      flex-shrink: 0;
      color: var(--jd-color-muted);
    }

    /* ── 반응형 ──
     기준은 뷰포트가 아니라 이 패널이 실제로 받은 폭이다 — 사이드바나 2열 상세 안에 놓이면
     뷰포트는 1280px인데 패널은 360px이고, 그때 3열을 강제하면 값과 단위가 갈라진다.
     칸 수가 자유로운 곳(존·근거·포지션)은 질의 없이 내재적으로 접는다. */
    @container jd-sp (min-width: 44rem) {
      .jd-strategy-panel__top {
        grid-template-columns: minmax(0, 1fr) auto;
      }
      .jd-strategy-panel__kpis {
        gap: var(--jd-space-3);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-strategy-panel__reason-summary,
      .jd-strategy-panel__reason-summary::after {
        transition: none;
      }
    }
  }
`;
