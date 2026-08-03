import { css } from "../../core/styles.js";

/**
 * jd-nav-sidebar CSS — v2 finance/Sidebar 토큰 번역.
 * v2 값: width 248 · h-dvh sticky top-0 · bg --bm-card · border-r --bm-border.
 * 섹션 타이틀 10.5px extrabold tracking .08em muted uppercase, 링크 13.5px semibold
 * rounded-lg gap-2.5 px-3 py-2, 활성 bg --bm-accent-soft-bg / color --bm-accent-strong
 * + 좌측 2×16 레일, 비활성 hover bg --bm-soft-100. 아이콘 grid w-5, 활성 accent-strong.
 * 토큰: accent-soft-bg → primary-light, accent-strong → primary, soft-100 → border-light.
 *
 * v2의 `hidden lg:flex`(작은 화면 숨김)는 앱 레이아웃 관심사라 굽지 않는다 — 소비자가
 * 미디어쿼리로 제어한다.
 */
export default css`
  @layer junds.base {
    jd-nav-sidebar:not(:defined) {
      display: none;
    }
  }
  @layer junds.components {
    jd-nav-sidebar {
      display: flex;
      flex-direction: column;
      box-sizing: border-box; /* 명시 width + border-inline-end 병용 — 폭에 테두리 포함 */
      width: var(--jd-nav-sidebar-width, 248px);
      height: 100dvh;
      position: sticky;
      top: 0;
      background: var(--jd-color-card);
      border-inline-end: var(--jd-border-thin) solid var(--jd-color-border);
      font-family: var(--jd-font-sans);
    }

    .jd-nav-sidebar__header {
      padding: var(--jd-space-5);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-nav-sidebar__header[hidden] {
      display: none;
    }

    .jd-nav-sidebar__nav {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding-block: var(--jd-space-4);
    }
    .jd-nav-sidebar__top[hidden] {
      display: none;
    }

    .jd-nav-sidebar__section {
      padding: 0 var(--jd-space-3) var(--jd-space-4);
    }
    .jd-nav-sidebar__section-title {
      font-size: 0.65625rem; /* v2 10.5px */
      font-weight: 800;
      letter-spacing: 0.08em;
      padding: 0 var(--jd-space-3);
      margin-block-end: var(--jd-space-1-5);
      color: var(--jd-color-muted);
    }
    .jd-nav-sidebar__section-title[hidden] {
      display: none;
    }

    .jd-nav-sidebar__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-0-5);
    }

    .jd-nav-sidebar__link {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--jd-space-2-5);
      padding: var(--jd-space-2) var(--jd-space-3);
      border-radius: var(--jd-radius-lg);
      font-size: 0.84375rem; /* v2 13.5px */
      font-weight: var(--jd-weight-semibold);
      color: var(--jd-color-foreground);
      text-decoration: none;
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out),
        color var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-nav-sidebar__link:hover:not([data-active]) {
      background: var(--jd-color-border-light);
    }
    .jd-nav-sidebar__link:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }
    .jd-nav-sidebar__link[data-active] {
      background: var(--jd-color-primary-light);
      color: var(--jd-color-primary-ink);
    }

    .jd-nav-sidebar__rail {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 2px;
      height: 16px;
      border-radius: 2px;
      background: var(--jd-color-primary);
      opacity: 0;
    }
    .jd-nav-sidebar__link[data-active] .jd-nav-sidebar__rail {
      opacity: 1;
    }

    .jd-nav-sidebar__icon {
      display: grid;
      place-items: center;
      width: 1.25rem;
      flex-shrink: 0;
      color: var(--jd-color-muted);
    }
    .jd-nav-sidebar__link[data-active] .jd-nav-sidebar__icon {
      color: var(--jd-color-primary-ink);
    }

    .jd-nav-sidebar__label {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .jd-nav-sidebar__footer {
      padding: var(--jd-space-3) var(--jd-space-5);
      border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
      font-size: 0.6875rem; /* 11px */
      color: var(--jd-color-muted);
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    .jd-nav-sidebar__footer[hidden] {
      display: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-nav-sidebar__link {
        transition: none;
      }
    }
  }
`;
