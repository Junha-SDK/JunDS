/**
 * jd-sidebar CSS — v2 DsSidebar 표면의 토큰 번역.
 * v2 값: aside `h-full flex flex-col bg-sidebar-bg text-sidebar-text shrink-0
 * transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)] border-r border-white/5`,
 * header `px-3 py-4 border-b border-white/5`, nav `flex-1 overflow-y-auto py-2 px-2`,
 * footer `px-3 py-3 border-t border-white/5`, 토글 `absolute -right-3 top-6 w-6 h-6
 * rounded-full bg-white border border-border shadow-sm`, 아이콘 접힘 시 rotate-180.
 *
 * 접힘 폭·아이콘 회전은 조상 `jd-sidebar-provider[collapsed]` 또는 자신 `[collapsed]`
 * (자립)을 셀렉터 목록으로 함께 처리한다 — 폭 값은 --_jd-sb-w/--_jd-sb-cw 인라인 변수.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-sidebar {
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      box-sizing: border-box;
      position: relative;
      height: 100%;
      width: var(--_jd-sb-w, 264px);
      background: var(--jd-color-sidebar-bg);
      color: var(--jd-color-sidebar-text);
      font-family: var(--jd-font-sans);
      border-inline-end: var(--jd-border-thin) solid rgba(255, 255, 255, 0.05);
      transition: width var(--jd-duration-slow) var(--jd-easing-default);
    }

    .jd-sidebar__header {
      flex-shrink: 0;
      padding: var(--jd-space-4) var(--jd-space-3);
      border-block-end: var(--jd-border-thin) solid rgba(255, 255, 255, 0.05);
    }
    .jd-sidebar__nav {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      padding: var(--jd-space-2);
    }
    .jd-sidebar__footer {
      flex-shrink: 0;
      padding: var(--jd-space-3);
      border-block-start: var(--jd-border-thin) solid rgba(255, 255, 255, 0.05);
    }

    .jd-sidebar__toggle {
      position: absolute;
      inset-block-start: var(--jd-space-6);
      inset-inline-end: -12px;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      cursor: pointer;
      color: var(--jd-color-muted);
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-full);
      box-shadow: var(--jd-shadow-sm);
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-sidebar__toggle:hover {
      background: var(--jd-color-card-hover);
    }
    .jd-sidebar__toggle:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }
    .jd-sidebar__toggle-icon {
      transition: transform var(--jd-duration-normal) var(--jd-easing-default);
    }

    /* ── 접힘: 프로바이더 소유 + 자립 두 경로 ── */
    jd-sidebar-provider[collapsed] jd-sidebar,
    jd-sidebar[collapsed] {
      width: var(--_jd-sb-cw, 68px);
    }
    jd-sidebar-provider[collapsed] .jd-sidebar__toggle-icon,
    jd-sidebar[collapsed] .jd-sidebar__toggle-icon {
      transform: rotate(180deg);
    }

    @media (prefers-reduced-motion: reduce) {
      jd-sidebar,
      .jd-sidebar__toggle-icon {
        transition: none;
      }
    }
  }
`;
