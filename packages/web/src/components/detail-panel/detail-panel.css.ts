import { css } from "../../core/styles.js";

/**
 * v2 값: `fixed top-0 right-0 h-full z-40 bg-white border-l border-gray-200 shadow-xl
 * flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`
 * (= --jd-duration-slow + --jd-easing-default), 닫힘 `translate-x-full`, width 기본 420.
 * 헤더 `px-5 py-4 border-b`, 제목 text-base/semibold, 상태 배지 `rounded-full px-2 py-0.5
 * text-[10px] semibold`, 부제 `mt-0.5 text-sm text-gray-500`,
 * 탭 `px-3 py-2.5 text-sm medium border-b-2 -mb-px`(활성 blue-600 → --jd-color-primary),
 * 탭 배지 `min-w-[18px] h-[18px] rounded-full text-[10px]`, 본문 `flex-1 overflow-y-auto p-5`.
 *
 * gray/green/amber/red/blue 리터럴은 전부 토큰으로 — 다크에서도 성립한다.
 * 상태 배지 글자색은 jd-badge와 같은 대비 보정(원색 + 검정 혼합, 다크는 원색 복원).
 */
export default css`
@layer junds.base {
  /* 업그레이드 전에는 문서 흐름 안에 상세 내용이 통째로 나타난다 — 오버레이류 규칙 적용 */
  jd-detail-panel:not(:defined) { display: none; }
}
@layer junds.components {
  jd-detail-panel {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    position: fixed;
    inset-block: 0;
    inset-inline-end: 0;
    z-index: var(--jd-z-overlay);
    width: var(--jd-detail-panel-width, 420px);
    max-width: 100vw; /* v2는 420px 고정이라 모바일에서 뷰포트를 넘었다 */
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
    background: var(--jd-color-card);
    border-inline-start: var(--jd-border-thin) solid var(--jd-color-border);
    box-shadow: var(--jd-shadow-xl);
    transform: translateX(100%);
    transition: transform var(--jd-duration-slow) var(--jd-easing-default);
  }
  jd-detail-panel[open] { transform: translateX(0); }
  /* 프로그램 포커스 전용 컨테이너(tabindex=-1) — 링을 그리지 않는다 */
  jd-detail-panel:focus { outline: none; }

  .jd-detail-panel__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--jd-space-2);
    flex-shrink: 0;
    padding: var(--jd-space-4) var(--jd-space-5);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-detail-panel__heading { flex: 1 1 auto; min-width: 0; }
  .jd-detail-panel__title-row {
    display: flex;
    align-items: center;
    gap: var(--jd-space-2);
    min-width: 0;
  }
  .jd-detail-panel__title {
    margin: 0;
    font-size: var(--jd-text-lg); /* v2 text-base = 1rem */
    font-weight: var(--jd-weight-semibold);
    line-height: var(--jd-leading-snug);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .jd-detail-panel__subtitle {
    margin: var(--jd-space-0-5) 0 0;
    font-size: var(--jd-text-md); /* v2 text-sm = 0.875rem */
    color: var(--jd-color-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .jd-detail-panel__subtitle[hidden] { display: none; }

  .jd-detail-panel__status {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    padding: var(--jd-space-0-5) var(--jd-space-2);
    border-radius: var(--jd-radius-full);
    font-size: .625rem;
    font-weight: var(--jd-weight-semibold);
    line-height: var(--jd-leading-normal);
    background: var(--jd-color-border-light);
    color: var(--jd-color-muted);
  }
  .jd-detail-panel__status[hidden] { display: none; }
  jd-detail-panel[status="success"] .jd-detail-panel__status {
    background: var(--jd-color-success-light);
    color: color-mix(in srgb, var(--jd-color-success) 80%, #000);
  }
  jd-detail-panel[status="warning"] .jd-detail-panel__status {
    background: var(--jd-color-warning-light);
    color: color-mix(in srgb, var(--jd-color-warning) 75%, #000);
  }
  jd-detail-panel[status="danger"] .jd-detail-panel__status {
    background: var(--jd-color-danger-light);
    color: color-mix(in srgb, var(--jd-color-danger) 90%, #000);
  }
  jd-detail-panel[status="info"] .jd-detail-panel__status {
    background: var(--jd-color-info-light);
    color: color-mix(in srgb, var(--jd-color-info) 75%, #000);
  }
  [data-jd-theme="dark"] jd-detail-panel[status="success"] .jd-detail-panel__status,
  [data-theme="dark"] jd-detail-panel[status="success"] .jd-detail-panel__status {
    color: var(--jd-color-success);
  }
  [data-jd-theme="dark"] jd-detail-panel[status="warning"] .jd-detail-panel__status,
  [data-theme="dark"] jd-detail-panel[status="warning"] .jd-detail-panel__status {
    color: var(--jd-color-warning);
  }
  [data-jd-theme="dark"] jd-detail-panel[status="danger"] .jd-detail-panel__status,
  [data-theme="dark"] jd-detail-panel[status="danger"] .jd-detail-panel__status {
    color: var(--jd-color-danger);
  }
  [data-jd-theme="dark"] jd-detail-panel[status="info"] .jd-detail-panel__status,
  [data-theme="dark"] jd-detail-panel[status="info"] .jd-detail-panel__status {
    color: var(--jd-color-info);
  }

  .jd-detail-panel__close {
    display: flex;
    flex-shrink: 0;
    padding: var(--jd-space-1);
    margin-inline-start: var(--jd-space-2);
    border: 0;
    background: none;
    color: var(--jd-color-muted);
    cursor: pointer;
    border-radius: var(--jd-radius-lg);
    transition: color var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-detail-panel__close:hover {
    color: var(--jd-color-foreground);
    background: var(--jd-color-card-hover);
  }
  .jd-detail-panel__close:focus-visible {
    outline: none;
    box-shadow: var(--jd-shadow-focus-ring);
  }

  .jd-detail-panel__tabs {
    display: flex;
    flex-shrink: 0;
    gap: 0;
    padding-inline: var(--jd-space-5);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-detail-panel__tabs[hidden] { display: none; }

  .jd-detail-panel__tab {
    display: inline-flex;
    align-items: center;
    gap: var(--jd-space-1-5);
    margin: 0 0 calc(-1 * var(--jd-border-thin));
    padding: var(--jd-space-2-5) var(--jd-space-3);
    border: 0;
    border-block-end: var(--jd-border-medium) solid transparent;
    background: transparent;
    cursor: pointer;
    font-family: inherit;
    font-size: var(--jd-text-md);
    font-weight: var(--jd-weight-medium);
    line-height: var(--jd-leading-none);
    white-space: nowrap;
    color: var(--jd-color-muted);
    transition:
      color var(--jd-duration-fast) var(--jd-easing-ease-out),
      border-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-detail-panel__tab:hover {
    color: var(--jd-color-foreground);
    border-block-end-color: var(--jd-color-border);
  }
  .jd-detail-panel__tab:focus-visible {
    outline: none;
    box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-detail-panel__tab[aria-selected="true"] {
    color: var(--jd-color-primary);
    border-block-end-color: var(--jd-color-primary);
  }

  .jd-detail-panel__tab-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding-inline: var(--jd-space-1);
    border-radius: var(--jd-radius-full);
    font-size: .625rem;
    font-weight: var(--jd-weight-semibold);
    font-variant-numeric: tabular-nums;
    background: var(--jd-color-border-light);
    color: var(--jd-color-muted);
  }
  .jd-detail-panel__tab-badge[hidden] { display: none; }
  .jd-detail-panel__tab[aria-selected="true"] > .jd-detail-panel__tab-badge {
    background: var(--jd-color-primary-light);
    color: var(--jd-color-primary);
  }

  .jd-detail-panel__body {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: var(--jd-space-5);
  }
  .jd-detail-panel__body:focus-visible {
    outline: var(--jd-border-medium) solid var(--jd-color-primary);
    outline-offset: calc(-1 * var(--jd-border-medium));
  }
  .jd-detail-panel__body > [data-tab][hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    jd-detail-panel { transition: none; }
    .jd-detail-panel__tab { transition: none; }
  }
}`;
