/**
 * jd-accordion CSS — v2 composites/Accordion의 크롬만. 개폐 관용구(패널 grid 0fr↔1fr,
 * 트리거 리셋)는 원형 jd-disclosure 시트가 담당한다.
 *
 * v2 값: 컨테이너 `divide-y divide-border border border-border rounded-xl overflow-hidden`,
 * 트리거 `w-full flex items-center justify-between px-4 py-3 text-sm font-medium
 * text-foreground hover:bg-gray-50 transition-colors text-left`, 셰브런
 * `w-4 h-4 text-muted transition-transform duration-200` + 열림 시 `rotate-180`,
 * 본문 `px-4 pb-3 text-sm text-muted`.
 * (Tailwind text-sm = 0.875rem = --jd-text-md · hover:bg-gray-50 = --jd-color-card-hover)
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-accordion:not(:defined) { display: block; }
  jd-accordion:not(:defined) > script { display: none; }
}
@layer junds.components {
  jd-accordion {
    display: block; box-sizing: border-box; overflow: hidden;
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    font-family: var(--jd-font-sans);
  }
  /* v2 divide-y — 첫 행 위에는 선이 없다 */
  jd-accordion > jd-disclosure + jd-disclosure {
    border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
  }

  .jd-accordion__trigger {
    padding: var(--jd-space-3) var(--jd-space-4);
    font-size: var(--jd-text-md); font-weight: var(--jd-weight-medium);
    transition: background-color var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-accordion__trigger:hover:not(:disabled) { background: var(--jd-color-card-hover); }

  .jd-accordion__icon { display: inline-flex; flex-shrink: 0; }
  .jd-accordion__icon[hidden] { display: none; }
  .jd-accordion__icon > svg { width: 1em; height: 1em; }

  .jd-accordion__title { flex: 1 1 auto; min-width: 0; }

  /* justify-between의 자리 — 아이콘·제목은 왼쪽, 셰브런은 오른쪽 */
  .jd-accordion__chevron {
    display: inline-flex; flex-shrink: 0; margin-inline-start: auto;
    color: var(--jd-color-muted);
    transition: transform var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-accordion__chevron > svg { width: 1rem; height: 1rem; }
  .jd-accordion__trigger[data-state="open"] > .jd-accordion__chevron { transform: rotate(180deg); }

  .jd-accordion__content {
    padding: 0 var(--jd-space-4) var(--jd-space-3);
    font-size: var(--jd-text-md); color: var(--jd-color-muted);
    line-height: var(--jd-leading-relaxed);
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-accordion__trigger, .jd-accordion__chevron { transition: none; }
  }
}`;
