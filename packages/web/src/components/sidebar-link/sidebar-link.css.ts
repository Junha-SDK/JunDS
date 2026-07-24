/**
 * jd-sidebar-link CSS — v2 SidebarLink 표면의 토큰 번역.
 * v2 값: anchor `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
 * hover:bg-sidebar-hover`, active `bg-sidebar-hover text-white border-l-2
 * border-sidebar-active`, icon `w-5 h-5`, label `flex-1 truncate`, badge `bg-danger
 * text-white text-[10px] rounded-full px-1.5 py-0.5 font-semibold`.
 *
 * 활성 좌측 보더는 항상 2px(비활성=투명)이라 전환 시 시프트가 없다(v2 개선).
 * 접힘 시 라벨·badge 숨김 + 아이콘 중앙 정렬은 조상 `[collapsed]`를 셀렉터 목록으로.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-sidebar-link { display: block; }

  .jd-sidebar-link__anchor {
    display: flex; align-items: center; gap: var(--jd-space-3);
    padding: var(--jd-space-2) var(--jd-space-3);
    border-inline-start: 2px solid transparent;
    border-radius: var(--jd-radius-lg);
    font-size: var(--jd-text-sm); font-weight: var(--jd-weight-medium);
    color: var(--jd-color-sidebar-text); text-decoration: none;
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out),
                color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-sidebar-link__anchor:hover { background: var(--jd-color-sidebar-hover); }
  .jd-sidebar-link__anchor:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring);
  }

  jd-sidebar-link[active] .jd-sidebar-link__anchor {
    background: var(--jd-color-sidebar-hover);
    color: #ffffff;
    border-inline-start-color: var(--jd-color-sidebar-active);
  }

  .jd-sidebar-link__icon {
    flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
    width: 1.25rem; height: 1.25rem;
  }
  .jd-sidebar-link__icon:empty { display: none; }
  .jd-sidebar-link__icon > svg { width: 100%; height: 100%; }

  .jd-sidebar-link__label {
    flex: 1 1 auto; min-width: 0;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .jd-sidebar-link__badge {
    flex-shrink: 0;
    padding: var(--jd-space-0-5) var(--jd-space-1-5);
    background: var(--jd-color-danger); color: #ffffff;
    font-size: 10px; font-weight: var(--jd-weight-semibold);
    border-radius: var(--jd-radius-full); font-variant-numeric: tabular-nums;
  }
  .jd-sidebar-link__badge[hidden] { display: none; }

  /* ── 접힘: 라벨·badge 숨김, 아이콘만 중앙 ── */
  jd-sidebar-provider[collapsed] .jd-sidebar-link__label,
  jd-sidebar[collapsed] .jd-sidebar-link__label,
  jd-sidebar-provider[collapsed] .jd-sidebar-link__badge,
  jd-sidebar[collapsed] .jd-sidebar-link__badge {
    display: none;
  }
  jd-sidebar-provider[collapsed] .jd-sidebar-link__anchor,
  jd-sidebar[collapsed] .jd-sidebar-link__anchor {
    justify-content: center;
  }
}`;
