/**
 * jd-investor-council CSS — v2 finance/InvestorCouncil.
 * bm-card → 카드 크롬, bm-soft-100 → card-hover, bm-accent-strong → primary.
 * 위원 강조색은 상세/버튼 인라인 --_accent가, 결론색은 --_verdict가 나른다
 * (활성 위원마다 달라지므로 인라인 변수가 적합). element.ts의 verdictColor()도
 * 여기 --jd-fin-up/down을 참조하므로 아래 정의 한 줄이 결론색까지 함께 옮긴다.
 *
 * 열 개수는 뷰포트가 아니라 **카드 폭**으로 정한다 — 뷰포트만 보면 좁은 자리에 놓인 카드도
 * 성향 바를 7열로 쪼개 "가치"가 한 글자씩 세로로 섰고, 1fr 트랙이 min-content 아래로
 * 줄지 못해 카드가 오른쪽으로 넘쳤다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-investor-council:not(:defined) {
      display: block;
    }

    :where(jd-investor-council) {
      /* 등락색은 직접 칠하지 않고 앱이 1회 덮어쓰는 훅을 경유한다 — 직접 칠하면 한국 관례
       override가 이 컴포넌트만 비껴가 한 화면에서 등락색이 갈라진다. */
      --jd-fin-up: var(--jd-finance-up, var(--jd-color-success));
      --jd-fin-down: var(--jd-finance-down, var(--jd-color-danger));
    }
    jd-investor-council {
      display: block;
      /* 열 배분의 기준은 뷰포트가 아니라 이 카드가 실제로 받은 폭이다 */
      /* inline-size 컨테이너는 **내용이 폭을 정하지 못한다**. 부모가 준 폭을 명시적으로
         받지 않으면 flex·inline 문맥에서 호스트가 0으로 접혀 카드가 통째로 사라진다(실측). */
      width: 100%;
      container: jd-council / inline-size;
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }

    .jd-council__card {
      overflow: hidden;
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      /* 채움만 있는 면은 색종이로 읽힌다 — 얕은 그림자로 면을 띄운다 */
      box-shadow: var(--jd-shadow-xs);
    }
    .jd-council__card[hidden] {
      display: none;
    }

    /* 상태(로딩/에러) */
    .jd-council__state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--jd-space-2);
      padding: var(--jd-space-6) var(--jd-space-4);
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      font-size: 12px;
      color: var(--jd-color-muted);
    }
    .jd-council__state[hidden] {
      display: none;
    }
    .jd-council__state[data-kind="error"] {
      text-align: center;
    }
    .jd-council__state-text {
      margin: 0;
      font-size: 13px;
    }
    .jd-council__state-dot {
      width: 8px;
      height: 8px;
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-primary);
    }
    @media (prefers-reduced-motion: no-preference) {
      .jd-council__state-dot {
        animation: jd-council-pulse 1.2s ease-in-out infinite;
      }
    }
    @keyframes jd-council-pulse {
      50% {
        opacity: 0.35;
      }
    }

    /* 헤더 */
    .jd-council__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--jd-space-2);
      padding: var(--jd-space-3) var(--jd-space-4);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-council__brand {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
    }
    .jd-council__brand-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: var(--jd-radius-lg);
      background: var(--jd-color-primary-light);
      color: var(--jd-color-primary-ink);
    }
    .jd-council__title {
      margin: 0;
      font-size: 14px;
      font-weight: 800;
    }
    .jd-council__tag {
      font-size: 11px;
      font-weight: 700;
      padding: 2px var(--jd-space-2);
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-card-hover);
      color: var(--jd-color-muted);
    }

    .jd-council__consensus {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-2);
      padding: 6px var(--jd-space-3);
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-card-hover);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .jd-council__consensus-up,
    .jd-council__consensus-down {
      font-size: 11px;
      font-weight: 800;
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-council__consensus-down {
      color: var(--jd-fin-down);
    }
    .jd-council__consensus[data-tone="up"] .jd-council__consensus-up,
    .jd-council__consensus[data-tone="up"] .jd-council__consensus-label {
      color: var(--jd-fin-up);
    }
    .jd-council__consensus[data-tone="down"] .jd-council__consensus-up,
    .jd-council__consensus[data-tone="down"] .jd-council__consensus-label {
      color: var(--jd-fin-down);
    }
    .jd-council__consensus[data-tone="neutral"] .jd-council__consensus-up,
    .jd-council__consensus[data-tone="neutral"] .jd-council__consensus-label {
      color: var(--jd-color-muted);
    }
    .jd-council__consensus-sep {
      color: var(--jd-color-border);
    }
    .jd-council__consensus-div {
      width: 1px;
      height: 12px;
      background: var(--jd-color-border);
    }
    .jd-council__consensus-label {
      font-size: 11px;
      font-weight: 800;
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }

    /* 본문 그리드 — 1fr은 minmax(auto,1fr)이라 min-content 아래로 줄지 않는다.
     상세 열 안의 표·바가 넓어지면 그대로 카드를 밀어냈다. minmax(0,·)로 못 박는다. */
    .jd-council__body {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
    }
    @container jd-council (min-width: 58rem) {
      .jd-council__body {
        grid-template-columns: 260px minmax(0, 1fr);
      }
    }
    .jd-council__aside {
      min-width: 0;
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    @container jd-council (min-width: 58rem) {
      .jd-council__aside {
        border-block-end: none;
        border-inline-end: var(--jd-border-thin) solid var(--jd-color-border);
      }
    }
    .jd-council__list {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .jd-council__list > li + li {
      border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
    }

    .jd-council__investor {
      display: flex;
      align-items: center;
      gap: var(--jd-space-3);
      width: 100%;
      padding: var(--jd-space-3) var(--jd-space-4);
      text-align: start;
      cursor: pointer;
      background: transparent;
      border: none;
      border-inline-start: var(--jd-border-thick) solid transparent;
      font-family: inherit;
      color: inherit;
      transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out),
        border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    /* 누를 수 있는 것은 세 상태를 전부 가진다 — 없으면 마우스도 키보드도 여기가 어디인지 모른다 */
    .jd-council__investor:hover {
      background: var(--jd-color-card-hover);
      border-inline-start-color: color-mix(
        in srgb,
        var(--_accent, var(--jd-color-primary)) 45%,
        transparent
      );
    }
    /* 세로로 긴 행은 scale이 옆 행과 어긋나 보인다 — 눌림은 안쪽 그림자로 말한다 */
    .jd-council__investor:active {
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-council__investor:focus-visible {
      outline: var(--jd-focus-ring);
      /* 카드가 overflow:hidden이라 바깥 offset은 잘린다 — 안쪽으로 접는다 */
      outline-offset: calc(-1 * var(--jd-focus-ring-offset));
    }
    .jd-council__investor[data-active] {
      background: var(--jd-color-card-hover);
      border-inline-start-color: var(--_accent, var(--jd-color-primary));
    }
    .jd-council__investor-emoji {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: var(--jd-radius-xl);
      font-size: 18px;
      background: color-mix(in srgb, var(--_accent, var(--jd-color-primary)) 10%, transparent);
    }
    .jd-council__investor-meta {
      min-width: 0;
      flex: 1;
    }
    .jd-council__investor-name {
      font-size: 13.5px;
      font-weight: 800;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-council__investor-tagline {
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      color: var(--jd-color-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-council__investor-right {
      text-align: end;
      flex-shrink: 0;
    }
    .jd-council__investor-verdict {
      font-size: 12px;
      font-weight: 800;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
    .jd-council__investor-score {
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      white-space: nowrap;
      color: var(--jd-color-muted);
      font-variant-numeric: tabular-nums;
    }

    /* 상세 */
    .jd-council__detail {
      padding: var(--jd-space-5);
    }
    .jd-council__profile {
      display: flex;
      align-items: flex-start;
      gap: var(--jd-space-3);
      margin-block-end: var(--jd-space-4);
    }
    .jd-council__profile-emoji {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      border-radius: var(--jd-radius-2xl);
      font-size: 26px;
      background: color-mix(in srgb, var(--_accent, var(--jd-color-primary)) 10%, transparent);
    }
    .jd-council__profile-meta {
      min-width: 0;
      flex: 1;
    }
    .jd-council__profile-namerow {
      display: flex;
      align-items: baseline;
      gap: var(--jd-space-2);
      flex-wrap: wrap;
    }
    .jd-council__profile-korean {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
      letter-spacing: var(--jd-tracking-tight);
    }
    .jd-council__profile-name {
      font-size: 12px;
      font-weight: 700;
      color: var(--jd-color-muted);
    }
    .jd-council__profile-tagline {
      margin: 2px 0 0;
      font-size: 11.5px;
      font-weight: 700;
      color: var(--_accent, var(--jd-color-primary));
    }
    .jd-council__profile-context {
      margin: var(--jd-space-1) 0 0;
      font-size: 11.5px;
      line-height: 1.625;
      color: var(--jd-color-muted);
    }

    .jd-council__verdict-box {
      display: flex;
      align-items: center;
      gap: var(--jd-space-3);
      padding: var(--jd-space-3) var(--jd-space-4);
      margin-block-end: var(--jd-space-4);
      border-radius: var(--jd-radius-xl);
      background: color-mix(in srgb, var(--_verdict, var(--jd-color-muted)) 8%, transparent);
      border: var(--jd-border-thin) solid
        color-mix(in srgb, var(--_verdict, var(--jd-color-muted)) 25%, transparent);
    }
    .jd-council__verdict-circle {
      display: grid;
      place-items: center;
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      border-radius: var(--jd-radius-full);
      background: var(--_verdict, var(--jd-color-muted));
      color: #fff;
    }
    .jd-council__verdict-main {
      flex: 1;
    }
    .jd-council__verdict-label {
      font-size: var(--jd-text-2xs);
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: var(--jd-tracking-wide);
      color: var(--_verdict, var(--jd-color-muted));
    }
    .jd-council__verdict-big {
      font-size: 20px;
      font-weight: 800;
      line-height: 1.1;
      color: var(--_verdict, var(--jd-color-muted));
    }
    .jd-council__verdict-stats {
      text-align: end;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .jd-council__stat {
      text-align: end;
    }
    .jd-council__stat-label {
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: var(--jd-tracking-wide);
      color: var(--jd-color-muted);
    }
    .jd-council__stat-value {
      font-size: 14px;
      font-weight: 800;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
    .jd-council__stat-value[data-dir="up"] {
      color: var(--jd-fin-up);
    }
    .jd-council__stat-value[data-dir="down"] {
      color: var(--jd-fin-down);
    }

    /* 성향 바 — 7열을 못 박으면 좁은 자리에서 한 칸이 40px가 되어 "가치"가 세로로 선다.
     내재적 auto-fit이라 실제로 7칸이 들어갈 폭에서만 7열이 된다. */
    .jd-council__bars {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 7rem), 1fr));
      gap: var(--jd-space-2);
    }
    .jd-council__bar {
      min-width: 0;
    }
    .jd-council__bar-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-1);
      min-width: 0;
      font-size: var(--jd-text-2xs);
      font-weight: 700;
    }
    .jd-council__bar-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--jd-color-muted);
    }
    .jd-council__bar-value {
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      color: var(--_accent, var(--jd-color-primary));
    }
    .jd-council__bar-value[data-neg] {
      color: var(--jd-color-muted);
    }
    .jd-council__bar-track {
      display: flex;
      height: 6px;
      margin-block-start: var(--jd-space-1);
      border-radius: var(--jd-radius-full);
      overflow: hidden;
      background: var(--jd-color-card-hover);
    }
    .jd-council__bar-spacer {
      width: 50%;
    }
    .jd-council__bar-fill-pos {
      height: 100%;
      background: var(--_accent, var(--jd-color-primary));
      border-start-end-radius: var(--jd-radius-full);
      border-end-end-radius: var(--jd-radius-full);
    }
    .jd-council__bar-half {
      width: 50%;
      height: 100%;
    }
    .jd-council__bar-fill-neg {
      /* v2 음수 성향 바 = slate-400 리터럴(중립 회색). muted 토큰은 보라 기가 있어 부적합 */
      height: 100%;
      background: var(--jd-color-neutral-400);
      border-start-start-radius: var(--jd-radius-full);
      border-end-start-radius: var(--jd-radius-full);
    }

    /* 근거 / 리스크 */
    .jd-council__lists {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
      gap: var(--jd-space-4);
      margin-block-start: var(--jd-space-4);
    }
    .jd-council__reasons {
      min-width: 0;
      padding: var(--jd-space-3) 14px;
      background: var(--jd-color-card-hover);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
    }
    .jd-council__reasons-title {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      margin: 0 0 var(--jd-space-2);
      font-size: 12px;
      font-weight: 800;
      color: var(--_tone, var(--jd-color-foreground));
    }
    .jd-council__reasons-list {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-1-5);
    }
    .jd-council__reasons-item {
      display: flex;
      align-items: flex-start;
      gap: var(--jd-space-1-5);
      font-size: 12.5px;
      line-height: 1.625;
    }
    .jd-council__reasons-bullet {
      flex-shrink: 0;
      margin-block-start: 7px;
      width: 4px;
      height: 4px;
      border-radius: var(--jd-radius-full);
      background: var(--_tone, var(--jd-color-muted));
    }
    .jd-council__reasons-empty {
      font-size: 12px;
      color: var(--jd-color-muted);
    }

    /* 매매 플랜 */
    .jd-council__plan {
      margin-block-start: var(--jd-space-4);
      padding: var(--jd-space-3) var(--jd-space-4);
      background: var(--jd-color-card-hover);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
    }
    .jd-council__plan-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-block-end: var(--jd-space-2);
    }
    .jd-council__plan-title {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      margin: 0;
      font-size: 13px;
      font-weight: 800;
      color: var(--_accent, var(--jd-color-primary));
    }
    .jd-council__plan-horizon {
      font-size: var(--jd-text-2xs);
      font-weight: 800;
      white-space: nowrap;
      padding: 2px var(--jd-space-2);
      border-radius: var(--jd-radius-full);
      background: var(--_accent, var(--jd-color-primary));
      color: #fff;
    }
    .jd-council__plan-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 8rem), 1fr));
      gap: var(--jd-space-3);
      font-variant-numeric: tabular-nums;
    }
    .jd-council__plan-cell {
      min-width: 0;
      padding: var(--jd-space-2) var(--jd-space-3);
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-lg);
    }
    .jd-council__plan-cell-label {
      font-size: var(--jd-text-2xs);
      font-weight: 700;
      white-space: nowrap;
      color: var(--jd-color-muted);
    }
    /* 값 + 단위는 한 덩어리 — 접히면 "68,400"과 "원"이 다른 줄에 선다 */
    .jd-council__plan-cell-value {
      margin-block-start: 2px;
      font-size: 13.5px;
      font-weight: 800;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
    .jd-council__plan-cell-value[data-big] {
      font-size: 16px;
    }
    .jd-council__plan-cell-value[data-dir="up"] {
      color: var(--jd-fin-up);
    }
    .jd-council__plan-cell-value[data-dir="down"] {
      color: var(--jd-fin-down);
    }

    /* 인용 */
    .jd-council__quotes {
      margin-block-start: var(--jd-space-4);
    }
    .jd-council__quotes-summary {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1);
      cursor: pointer;
      font-size: 11.5px;
      font-weight: 700;
      border-radius: var(--jd-radius-sm);
      color: var(--jd-color-muted);
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-council__quotes-summary:hover {
      color: var(--jd-color-foreground);
    }
    .jd-council__quotes-summary:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }
    /* 접히는 것에는 셰브런이 있어야 한다 — inline-flex가 기본 마커를 지웠으므로 대신 그린다 */
    .jd-council__quotes-summary::after {
      content: "";
      flex-shrink: 0;
      width: 6px;
      height: 6px;
      margin-inline-start: 2px;
      border-inline-end: var(--jd-border-medium) solid currentColor;
      border-block-end: var(--jd-border-medium) solid currentColor;
      rotate: 45deg;
      transition: rotate var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-council__quotes[open] > .jd-council__quotes-summary::after {
      rotate: -135deg;
    }
    .jd-council__quotes-list {
      margin: var(--jd-space-2) 0 0;
      padding-inline-start: var(--jd-space-4);
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-1);
    }
    .jd-council__quote {
      font-size: 11.5px;
      line-height: 1.625;
      font-style: italic;
      color: var(--jd-color-muted);
    }
    .jd-council__quotes-source {
      margin-block-start: 6px;
      font-size: var(--jd-text-2xs);
      font-style: normal;
      color: var(--jd-color-muted);
    }

    /* 면책 */
    .jd-council__disclaimer {
      margin-block-start: var(--jd-space-4);
      font-size: var(--jd-text-2xs);
      line-height: 1.625;
      color: var(--jd-color-muted);
    }
    .jd-council__more {
      color: inherit;
      border-radius: var(--jd-radius-sm);
      text-decoration: underline;
    }
    .jd-council__more:hover {
      color: var(--jd-color-primary-ink);
    }
    .jd-council__more:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-council__consensus-up,
      .jd-council__consensus-down,
      .jd-council__consensus-label,
      .jd-council__investor,
      .jd-council__quotes-summary,
      .jd-council__quotes-summary::after {
        transition: none;
      }
    }
  }
`;
