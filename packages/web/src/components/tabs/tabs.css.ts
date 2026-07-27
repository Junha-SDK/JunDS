/**
 * jd-tabs CSS — v2 composites/Tabs의 variant 3종(underline/pills/segment) ×
 * size 2종(sm/md) 시각을 --jd-* 토큰으로 의미 번역(Tailwind 기계 이식 금지 §4.3).
 * v2가 variant마다 복제했던 JSX 3벌은 여기 호스트 속성 셀렉터로 접힌다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  /* 기본 variant=underline — v2: flex border-b border-border gap-0 */
  jd-tabs {
    display: flex; align-items: flex-end; gap: 0;
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }

  .jd-tabs__tab {
    display: inline-flex; align-items: center; justify-content: center;
    gap: var(--jd-space-1-5);
    margin: 0; border: 0; background: transparent; cursor: pointer;
    font-family: var(--jd-font-sans); font-weight: var(--jd-weight-medium);
    line-height: var(--jd-leading-none); white-space: nowrap;
    color: var(--jd-color-muted);
    transition: background-color var(--jd-duration-normal) var(--jd-easing-ease-out),
      border-color var(--jd-duration-normal) var(--jd-easing-ease-out),
      color var(--jd-duration-normal) var(--jd-easing-ease-out),
      box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out),
      opacity var(--jd-duration-normal) var(--jd-easing-ease-out),
      scale var(--jd-duration-normal) var(--jd-easing-ease-out),
      transform var(--jd-duration-normal) var(--jd-easing-ease-out);
    /* size 기본 md — v2 underline: px-4 py-2.5 text-sm */
    padding: var(--jd-space-2-5) var(--jd-space-4); font-size: var(--jd-text-md);
    /* underline 고유: 3px 밑줄 + 컨테이너 경계선과 겹치기 */
    border-block-end: var(--jd-border-thick) solid transparent;
    margin-block-end: calc(-1 * var(--jd-border-thin));
  }
  .jd-tabs__tab:hover:not(:disabled) {
    color: color-mix(in srgb, var(--jd-color-foreground) 80%, transparent);
    border-block-end-color: var(--jd-color-border);
  }
  .jd-tabs__tab:active:not(:disabled) { scale: .95; }
  .jd-tabs__tab:disabled { opacity: var(--jd-opacity-40); cursor: not-allowed; }
  .jd-tabs__tab:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }
  .jd-tabs__tab[aria-selected="true"] {
    color: var(--jd-color-foreground);
    border-block-end-color: var(--jd-color-primary);
  }

  .jd-tabs__icon { display: inline-flex; flex-shrink: 0; }
  .jd-tabs__icon[hidden] { display: none; }
  .jd-tabs__icon > svg { width: 1em; height: 1em; }

  /* 배지 — v2: rounded-full px-1.5 text-[10px] font-semibold */
  .jd-tabs__badge {
    display: inline-flex; align-items: center; justify-content: center;
    padding-inline: var(--jd-space-1-5); border-radius: var(--jd-radius-full);
    font-size: .625rem; font-weight: var(--jd-weight-semibold);
    line-height: var(--jd-leading-normal);
    background: var(--jd-color-border-light); color: var(--jd-color-muted);
  }
  .jd-tabs__badge[hidden] { display: none; }
  .jd-tabs__tab[aria-selected="true"] > .jd-tabs__badge {
    background: var(--jd-color-primary-light); color: var(--jd-color-primary);
  }

  /* size=sm — v2 underline: px-3 py-2 text-xs */
  jd-tabs[size="sm"] > .jd-tabs__tab {
    padding: var(--jd-space-2) var(--jd-space-3); font-size: var(--jd-text-xs);
  }

  /* ── variant=pills — v2: inline-flex gap-1, 경계선 없음 ───────────── */
  jd-tabs[variant="pills"] {
    display: inline-flex; align-items: center;
    gap: var(--jd-space-1); border-block-end: 0;
  }
  jd-tabs[variant="pills"] > .jd-tabs__tab {
    border-block-end: 0; margin-block-end: 0;
    border-radius: var(--jd-radius-full);
    padding: var(--jd-space-1-5) var(--jd-space-3-5);
  }
  jd-tabs[variant="pills"][size="sm"] > .jd-tabs__tab {
    padding: var(--jd-space-1) var(--jd-space-2-5);
  }
  jd-tabs[variant="pills"] > .jd-tabs__tab:hover:not(:disabled) {
    background: color-mix(in srgb, var(--jd-color-muted) 10%, transparent);
  }
  jd-tabs[variant="pills"] > .jd-tabs__tab[aria-selected="true"] {
    background: var(--jd-color-primary); color: #fff;
    box-shadow: var(--jd-shadow-md);
  }
  jd-tabs[variant="pills"] > .jd-tabs__tab[aria-selected="true"] > .jd-tabs__badge {
    background: color-mix(in srgb, #fff 20%, transparent); color: #fff;
  }

  /* ── variant=segment — v2: 회색 트랙 안의 흰 알약 ─────────────────── */
  jd-tabs[variant="segment"] {
    display: inline-flex; align-items: center;
    gap: var(--jd-space-0-5); border-block-end: 0;
    padding: var(--jd-space-1); border-radius: var(--jd-radius-lg);
    background: var(--jd-color-border-light);
  }
  jd-tabs[variant="segment"] > .jd-tabs__tab {
    border-block-end: 0; margin-block-end: 0;
    border-radius: var(--jd-radius-md);
    padding: var(--jd-space-1-5) var(--jd-space-3);
  }
  jd-tabs[variant="segment"][size="sm"] > .jd-tabs__tab {
    padding: var(--jd-space-1) var(--jd-space-2-5);
  }
  jd-tabs[variant="segment"] > .jd-tabs__tab:hover:not(:disabled) {
    color: color-mix(in srgb, var(--jd-color-foreground) 80%, transparent);
  }
  jd-tabs[variant="segment"] > .jd-tabs__tab[aria-selected="true"] {
    background: var(--jd-color-card); color: var(--jd-color-foreground);
    box-shadow: var(--jd-shadow-sm);
  }
  jd-tabs[variant="segment"] > .jd-tabs__tab[aria-selected="true"] > .jd-tabs__badge {
    background: var(--jd-color-primary); color: #fff;
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-tabs__tab { transition: none; }
    .jd-tabs__tab:active:not(:disabled) { scale: none; }
  }
}`;
