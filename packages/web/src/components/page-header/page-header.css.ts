/**
 * jd-page-header-bar CSS — v2 composites/PageHeader의 토큰 번역.
 * 원본 Tailwind: flex-col gap-3 px-4 sm:px-6 py-4 · divider border-b border-border ·
 * breadcrumb text-xs muted · title text-xl sm:text-2xl semibold · desc text-sm muted
 * line-clamp-2. sm: 분기는 640px(--jd-breakpoint-sm, 미디어 조건엔 토큰 불가라 리터럴).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-page-header-bar { display: block; }

  .jd-page-header-bar {
    display: flex; flex-direction: column; gap: var(--jd-space-3);
    padding: var(--jd-space-4);
  }
  .jd-page-header-bar[data-divider] {
    border-bottom: var(--jd-border-thin) solid var(--jd-color-border);
  }

  /* breadcrumb */
  .jd-page-header-bar__breadcrumb[hidden] { display: none; }
  .jd-page-header-bar__crumbs {
    display: flex; flex-wrap: wrap; align-items: center; gap: var(--jd-space-1);
    margin: 0; padding: 0; list-style: none;
    font-size: var(--jd-text-xs); color: var(--jd-color-muted);
  }
  .jd-page-header-bar__crumb {
    display: inline-flex; align-items: center; gap: var(--jd-space-1); min-width: 0;
  }
  .jd-page-header-bar__crumb-content {
    color: var(--jd-color-muted); text-decoration: none;
    transition: color var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  a.jd-page-header-bar__crumb-content:hover { color: var(--jd-color-foreground); }
  a.jd-page-header-bar__crumb-content:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring);
    border-radius: var(--jd-radius-sm);
  }
  .jd-page-header-bar__crumb-content[aria-current="page"] { color: var(--jd-color-foreground); }
  .jd-page-header-bar__sep { flex-shrink: 0; opacity: 0.5; }

  /* 본문 행 */
  .jd-page-header-bar__main {
    display: flex; align-items: flex-start; gap: var(--jd-space-3);
  }

  .jd-page-header-bar__back {
    flex-shrink: 0; margin-top: var(--jd-space-1);
    display: inline-flex; align-items: center; justify-content: center;
    width: var(--jd-space-8); height: var(--jd-space-8);
    padding: 0; border: 0; background: transparent;
    border-radius: var(--jd-radius-md);
    color: var(--jd-color-muted); cursor: pointer;
    transition: background var(--jd-duration-normal) var(--jd-easing-ease-out),
                color var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-page-header-bar__back:hover {
    background: color-mix(in srgb, var(--jd-color-muted) 10%, transparent);
    color: var(--jd-color-foreground);
  }
  .jd-page-header-bar__back:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-page-header-bar__back[hidden] { display: none; }

  .jd-page-header-bar__avatar { flex-shrink: 0; }
  .jd-page-header-bar__avatar[hidden] { display: none; }

  .jd-page-header-bar__heading { flex: 1; min-width: 0; }
  .jd-page-header-bar__title {
    margin: 0; font-size: var(--jd-text-xl);
    font-weight: var(--jd-weight-semibold); line-height: var(--jd-leading-tight);
    color: var(--jd-color-foreground);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-page-header-bar__title[hidden] { display: none; }
  .jd-page-header-bar__description {
    margin: var(--jd-space-1) 0 0; font-size: var(--jd-text-sm);
    color: var(--jd-color-muted);
    display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2;
    line-clamp: 2; overflow: hidden;
  }
  .jd-page-header-bar__description[hidden] { display: none; }

  .jd-page-header-bar__actions {
    flex-shrink: 0; display: flex; align-items: center; gap: var(--jd-space-2);
  }
  .jd-page-header-bar__actions[hidden] { display: none; }

  .jd-page-header-bar__footer { padding-top: var(--jd-space-1); }
  .jd-page-header-bar__footer[hidden] { display: none; }

  /* sm 이상 — 좌우 여백·타이틀·간격 확대 (v2 sm:px-6 sm:text-2xl sm:gap-4) */
  @media (min-width: 640px) {
    .jd-page-header-bar { padding-inline: var(--jd-space-6); }
    .jd-page-header-bar__main { gap: var(--jd-space-4); }
    .jd-page-header-bar__title { font-size: var(--jd-text-2xl); }
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-page-header-bar__crumb-content, .jd-page-header-bar__back { transition: none; }
  }
}`;
