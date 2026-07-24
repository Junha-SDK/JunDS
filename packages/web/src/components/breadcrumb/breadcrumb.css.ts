/**
 * jd-breadcrumb CSS — v2 composites/Breadcrumb(gap-1.5 · text-sm · muted→foreground)의
 * 의미 번역. `<ol>` 기본 목록 표식·패딩은 컴포넌트가 직접 지운다(리셋 의존 금지).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-breadcrumb { display: block; font-size: var(--jd-text-md); }

  .jd-breadcrumb__list {
    display: flex; flex-wrap: wrap; align-items: center;
    gap: var(--jd-space-1-5);
    margin: 0; padding: 0; list-style: none;
  }

  .jd-breadcrumb__item {
    display: inline-flex; align-items: center; gap: var(--jd-space-1-5);
    min-width: 0;
  }

  .jd-breadcrumb__separator {
    display: inline-flex; flex-shrink: 0; align-items: center;
    color: var(--jd-color-muted-light);
  }
  .jd-breadcrumb__separator > svg { width: 14px; height: 14px; }

  .jd-breadcrumb__content {
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    min-width: 0; color: var(--jd-color-muted); text-decoration: none;
    transition: color var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  a.jd-breadcrumb__content:hover { color: var(--jd-color-foreground); }
  a.jd-breadcrumb__content:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring);
    border-radius: var(--jd-radius-sm);
  }
  .jd-breadcrumb__content[aria-current="page"] {
    color: var(--jd-color-foreground); font-weight: var(--jd-weight-medium);
  }

  .jd-breadcrumb__icon { display: inline-flex; flex-shrink: 0; }
  .jd-breadcrumb__icon[hidden] { display: none; }
  .jd-breadcrumb__icon > svg { width: 1em; height: 1em; }

  .jd-breadcrumb__label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  @media (prefers-reduced-motion: reduce) {
    .jd-breadcrumb__content { transition: none; }
  }
}`;
