/**
 * jd-navigation-menu CSS — v2 composites/NavigationMenu(surface 바 + border + rounded-xl,
 * 280px 최소폭 드롭 패널, 셰브론 180° 회전)의 의미 번역.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-navigation-menu {
    display: inline-flex; position: relative;
    padding: var(--jd-space-1) var(--jd-space-2);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
  }

  .jd-navigation-menu__list {
    display: flex; align-items: center; gap: var(--jd-space-1);
    margin: 0; padding: 0; list-style: none;
  }

  .jd-navigation-menu__item { position: relative; display: flex; }

  .jd-navigation-menu__link,
  .jd-navigation-menu__trigger {
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    padding: var(--jd-space-2) var(--jd-space-3);
    margin: 0; border: 0; background: transparent; cursor: pointer;
    border-radius: var(--jd-radius-lg);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-md);
    font-weight: var(--jd-weight-medium); line-height: var(--jd-leading-none);
    color: var(--jd-color-muted); text-decoration: none; white-space: nowrap;
    transition: background var(--jd-duration-normal) var(--jd-easing-ease-out),
      color var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-navigation-menu__link:hover,
  .jd-navigation-menu__trigger:hover {
    background: var(--jd-color-card-hover); color: var(--jd-color-foreground);
  }
  .jd-navigation-menu__link:focus-visible,
  .jd-navigation-menu__trigger:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-navigation-menu__item[data-open] > .jd-navigation-menu__trigger {
    background: color-mix(in srgb, var(--jd-color-muted) 10%, transparent);
    color: var(--jd-color-foreground);
  }

  .jd-navigation-menu__chevron {
    inline-size: .875rem; block-size: .875rem; flex-shrink: 0;
    transition: rotate var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-navigation-menu__item[data-open] .jd-navigation-menu__chevron { rotate: 180deg; }

  .jd-navigation-menu__panel {
    position: absolute; inset-block-start: 100%; inset-inline-start: 0;
    margin-block-start: var(--jd-space-1); min-inline-size: 17.5rem;
    z-index: var(--jd-z-dropdown);
    display: flex; flex-direction: column;
    padding: var(--jd-space-2);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    box-shadow: var(--jd-shadow-lg);
  }
  .jd-navigation-menu__panel[hidden] { display: none; }

  .jd-navigation-menu__child {
    display: flex; align-items: flex-start; gap: var(--jd-space-3);
    padding: var(--jd-space-2-5) var(--jd-space-3);
    border-radius: var(--jd-radius-lg);
    text-decoration: none;
    transition: background var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-navigation-menu__child:hover { background: var(--jd-color-card-hover); }
  .jd-navigation-menu__child:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring);
  }

  .jd-navigation-menu__child-icon {
    display: inline-flex; flex-shrink: 0;
    margin-block-start: var(--jd-space-0-5); color: var(--jd-color-muted);
  }
  .jd-navigation-menu__child-icon[hidden] { display: none; }
  .jd-navigation-menu__child-icon > svg { inline-size: 1rem; block-size: 1rem; }

  .jd-navigation-menu__child-body {
    display: flex; flex-direction: column; gap: var(--jd-space-0-5);
    flex: 1 1 auto; min-inline-size: 0;
  }
  .jd-navigation-menu__child-label {
    font-family: var(--jd-font-sans); font-size: var(--jd-text-md);
    font-weight: var(--jd-weight-medium); color: var(--jd-color-foreground);
  }
  .jd-navigation-menu__child-description {
    font-size: var(--jd-text-xs); color: var(--jd-color-muted);
    line-height: var(--jd-leading-snug);
    display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2;
    overflow: hidden;
  }
  .jd-navigation-menu__child-description[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .jd-navigation-menu__link,
    .jd-navigation-menu__trigger,
    .jd-navigation-menu__child,
    .jd-navigation-menu__chevron { transition: none; }
  }
}`;
