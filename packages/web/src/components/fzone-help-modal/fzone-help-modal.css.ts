/**
 * jd-fzone-help-modal CSS — v2 finance/FZoneHelpModal 토큰 번역.
 * 패널 표면·백드롭·크기(lg)는 jd-modal 시트를 그대로 쓰고, 여기서는 안내 콘텐츠의
 * 타이포·틴트만 정의한다. 색은 노드별 --tab/--accent 커스텀 프로퍼티 경유(color-mix).
 *
 * 크기는 전부 --jd-text-* 와 --jd-space-* 로 말한다 — v2에서 승계한 px 리터럴
 * (10px·10.5px·12.5px…)은 밀도·글꼴 배율을 따라오지 못했고, 10px 계열은 읽을 수
 * 있는 하한(--jd-text-2xs = 11px) 아래였다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-fzone-help-modal:not(:defined) {
      display: none;
    }

    .jd-fzone-help__header {
      position: sticky;
      top: 0;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-3);
      padding: var(--jd-space-4) var(--jd-space-5);
      flex-shrink: 0;
      background: var(--jd-color-card);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-fzone-help__title {
      margin: 0;
      font-size: var(--jd-text-lg);
      font-weight: var(--jd-weight-bold);
    }
    .jd-fzone-help__close {
      display: flex;
      padding: var(--jd-space-1);
      border: 0;
      background: none;
      color: var(--jd-color-muted);
      cursor: pointer;
      border-radius: var(--jd-radius-md);
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-fzone-help__close:hover {
      color: var(--jd-color-foreground);
      background: color-mix(in srgb, var(--jd-color-muted) 12%, transparent);
    }
    /* 눌린 면은 빛을 잃는다 — 닫기도 누를 수 있는 것이므로 상태 3종을 다 갖는다 */
    .jd-fzone-help__close:active {
      scale: 0.94;
      background: color-mix(in srgb, var(--jd-color-muted) 20%, transparent);
    }
    .jd-fzone-help__close:focus-visible {
      /* 헤더가 sticky + 패널 overflow 안이라 outline이 잘린다 — 링을 그림자로 그린다 */
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    .jd-fzone-help__scroll {
      display: block;
    }

    /* Hero — 패널(card) 안에서 살짝 꺼진 띠다. --jd-color-surface는 라이트에서도
     어두운 크롬이라, 그 위에 foreground/muted 글자를 얹으면 라이트 모드에서 검은
     글자가 검은 띠에 묻힌다. 은은한 recessed 면은 background가 맡는다
     (jd-product-card의 미디어 영역과 같은 번역). */
    .jd-fzone-help__hero {
      padding: var(--jd-space-5) var(--jd-space-6);
      background: var(--jd-color-background);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-fzone-help__hero-row {
      display: flex;
      align-items: flex-start;
      gap: var(--jd-space-4);
    }
    .jd-fzone-help__hero-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 3.5rem;
      height: 3.5rem;
      font-size: var(--jd-text-4xl);
      border-radius: var(--jd-radius-2xl);
      background: var(--jd-color-warning);
      color: #fff;
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
    }
    .jd-fzone-help__hero-text {
      min-width: 0;
    }
    .jd-fzone-help__hero-head {
      margin: 0;
      font-size: var(--jd-text-xl);
      font-weight: var(--jd-weight-bold);
      line-height: var(--jd-leading-tight);
    }
    .jd-fzone-help__hero-sub {
      margin: var(--jd-space-1-5) 0 0;
      font-size: var(--jd-text-sm);
      line-height: var(--jd-leading-relaxed);
      color: var(--jd-color-muted);
    }
    .jd-fzone-help__hero-strong {
      color: var(--jd-color-foreground);
      font-weight: var(--jd-weight-bold);
    }
    .jd-fzone-help__chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--jd-space-2);
      margin-block-start: var(--jd-space-4);
    }
    .jd-fzone-help__chip {
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      white-space: nowrap;
      padding: var(--jd-space-0-5) var(--jd-space-2-5);
      /* 틴트 위 글자는 foreground 쪽으로 섞어 대비 확보 */
      border-radius: var(--jd-radius-full);
      color: color-mix(in srgb, var(--tab, var(--jd-color-accent)) 65%, var(--jd-color-foreground));
      background: color-mix(in srgb, var(--tab, var(--jd-color-accent)) 12%, transparent);
      border: var(--jd-border-thin) solid
        color-mix(in srgb, var(--tab, var(--jd-color-accent)) 20%, transparent);
    }

    .jd-fzone-help__sections {
      padding: var(--jd-space-5);
    }

    .jd-fzone-help__section {
      margin-block-start: var(--jd-space-5);
    }
    .jd-fzone-help__section:first-child {
      margin-block-start: 0;
    }
    .jd-fzone-help__section-title {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      margin: 0 0 var(--jd-space-3);
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-bold);
    }
    .jd-fzone-help__section-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 1.375rem;
      height: 1.375rem;
      font-size: var(--jd-text-xs);
      border-radius: var(--jd-radius-md);
      background: color-mix(in srgb, var(--accent, var(--jd-color-accent)) 12%, transparent);
    }

    /* 카드 읽는 법 */
    .jd-fzone-help__read-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--jd-space-2-5);
    }
    .jd-fzone-help__read-card {
      padding: var(--jd-space-2-5) var(--jd-space-3-5);
      border-radius: var(--jd-radius-xl);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      background: var(--jd-color-card);
    }
    .jd-fzone-help__read-head {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      margin-block-end: var(--jd-space-1);
    }
    .jd-fzone-help__read-dot {
      width: 0.375rem;
      height: 0.375rem;
      border-radius: var(--jd-radius-full);
      background: var(--tab, var(--jd-color-accent));
      flex-shrink: 0;
    }
    .jd-fzone-help__read-title {
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-bold);
    }
    .jd-fzone-help__read-body {
      margin: 0;
      font-size: var(--jd-text-xs);
      line-height: var(--jd-leading-relaxed);
      color: var(--jd-color-muted);
    }

    /* 탭별 의미 */
    .jd-fzone-help__tabs {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-3);
    }
    .jd-fzone-help__tab {
      border-radius: var(--jd-radius-xl);
      overflow: hidden;
      border: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-fzone-help__tab[data-first] {
      border-color: color-mix(in srgb, var(--tab) 33%, transparent);
      box-shadow: 0 4px 14px color-mix(in srgb, var(--tab) 10%, transparent);
    }
    .jd-fzone-help__tab-head {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      padding: var(--jd-space-2-5) var(--jd-space-3-5);
      background: color-mix(in srgb, var(--tab) 6%, transparent);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-fzone-help__tab-emoji {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 1.875rem;
      height: 1.875rem;
      font-size: var(--jd-text-lg);
      border-radius: var(--jd-radius-lg);
      background: var(--tab);
      color: #fff;
      box-shadow: inset 0 1px 0 var(--jd-color-highlight);
    }
    .jd-fzone-help__tab-pill {
      flex-shrink: 0;
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      white-space: nowrap;
      padding: var(--jd-space-0-5) var(--jd-space-2-5);
      /* 원색 배경 + 흰 글자 → 배경을 foreground 쪽 80% 혼합으로 어둡혀 대비 확보 */
      border-radius: var(--jd-radius-full);
      background: color-mix(in srgb, var(--tab) 80%, var(--jd-color-foreground));
      color: #fff;
    }
    .jd-fzone-help__tab-current {
      /* 11px 아래로 내려가지 않는다 — '현재 탭'은 장식이 아니라 위치 정보다 */
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      white-space: nowrap;
      flex-shrink: 0;
      padding: var(--jd-space-px) var(--jd-space-1-5);
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-success-light);
      color: color-mix(in srgb, var(--jd-color-success) 65%, var(--jd-color-foreground));
      display: none;
    }
    .jd-fzone-help__tab[data-first] .jd-fzone-help__tab-current {
      display: inline-block;
    }
    .jd-fzone-help__tab-headline {
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-bold);
      margin-inline-start: var(--jd-space-1);
      /* 플렉스 자식 기본 min-width:auto라 헤드라인이 헤더를 밀어낸다 — 0으로 풀어야
       말줄임이 실제로 걸리고, 배지들이 한 글자씩 세로로 서지 않는다 */
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-fzone-help__tab-body {
      padding: var(--jd-space-3) var(--jd-space-3-5);
    }
    .jd-fzone-help__tab-oneliner {
      margin: 0;
      font-size: var(--jd-text-sm);
      line-height: var(--jd-leading-relaxed);
      color: var(--jd-color-muted);
    }
    .jd-fzone-help__tab-bullets {
      list-style: none;
      margin: var(--jd-space-2) 0 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-1-5);
    }
    .jd-fzone-help__tab-bullet {
      display: flex;
      gap: var(--jd-space-2);
      font-size: var(--jd-text-sm);
      line-height: var(--jd-leading-relaxed);
    }
    .jd-fzone-help__tab-bullet-dot {
      flex-shrink: 0;
      width: 0.375rem;
      height: 0.375rem;
      border-radius: var(--jd-radius-full);
      background: var(--tab);
      /* 첫 줄 가운데에 맞춘다 — relaxed(1.625) × sm 기준 */
      margin-block-start: 0.4375rem;
    }
    .jd-fzone-help__tab-example {
      display: flex;
      gap: var(--jd-space-2);
      margin-block-start: var(--jd-space-3);
      padding: var(--jd-space-2) var(--jd-space-3);
      font-size: var(--jd-text-xs);
      line-height: var(--jd-leading-relaxed);
      border-radius: var(--jd-radius-lg);
      background: color-mix(in srgb, var(--tab) 4%, transparent);
      border: var(--jd-border-thin) dashed color-mix(in srgb, var(--tab) 33%, transparent);
    }
    .jd-fzone-help__tab-example-label {
      flex-shrink: 0;
      min-width: 2rem;
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      color: color-mix(in srgb, var(--tab) 65%, var(--jd-color-foreground));
    }
    .jd-fzone-help__tab-example-text {
      color: var(--jd-color-foreground);
    }

    /* 용어 사전 */
    .jd-fzone-help__term-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--jd-space-2);
    }
    /* 용어 줄도 hero와 같은 이유로 surface가 아니다 — 그 위 meaning이 foreground라
     라이트 모드에서 검은 글자가 검은 줄에 묻혔다 */
    .jd-fzone-help__term {
      display: flex;
      gap: var(--jd-space-2-5);
      padding: var(--jd-space-2) var(--jd-space-3);
      border-radius: var(--jd-radius-lg);
      background: var(--jd-color-background);
      border: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-fzone-help__term-pill {
      align-self: flex-start;
      flex-shrink: 0;
      white-space: nowrap;
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      padding: var(--jd-space-0-5) var(--jd-space-2);
      border-radius: var(--jd-radius-full);
      color: color-mix(in srgb, var(--tab, var(--jd-color-accent)) 65%, var(--jd-color-foreground));
      background: color-mix(in srgb, var(--tab, var(--jd-color-accent)) 12%, transparent);
    }
    .jd-fzone-help__term-meaning {
      /* 플렉스 자식 기본 min-width:auto — 길이를 모르는 뜻풀이가 줄을 밀어낸다 */
      min-width: 0;
      font-size: var(--jd-text-xs);
      line-height: var(--jd-leading-snug);
      color: var(--jd-color-foreground);
    }

    .jd-fzone-help__disclaimer {
      display: flex;
      gap: var(--jd-space-2);
      margin-block-start: var(--jd-space-5);
      padding: var(--jd-space-2-5) var(--jd-space-3);
      font-size: var(--jd-text-xs);
      line-height: var(--jd-leading-relaxed);
      border-radius: var(--jd-radius-lg);
      background: var(--jd-color-warning-light);
      border: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-color-warning) 30%, transparent);
      color: color-mix(in srgb, var(--jd-color-warning) 45%, var(--jd-color-foreground));
    }
    .jd-fzone-help__disclaimer-icon {
      flex-shrink: 0;
    }

    @media (min-width: 40rem) {
      .jd-fzone-help__read-grid,
      .jd-fzone-help__term-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-fzone-help__close {
        transition: none;
      }
      .jd-fzone-help__close:active {
        scale: none;
      }
    }
  }
`;
