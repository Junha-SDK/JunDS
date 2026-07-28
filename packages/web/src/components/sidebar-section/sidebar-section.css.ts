/**
 * jd-sidebar-section CSS — v2 SidebarSection 표면의 토큰 번역.
 * v2 값: wrapper `mb-2`, title `px-3 py-1.5 text-[10px] font-semibold
 * text-sidebar-text/50 uppercase tracking-wider`, items `flex flex-col gap-0.5`.
 * 접힘 시 title 숨김은 조상 `[collapsed]` 셀렉터 목록으로.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-sidebar-section {
      display: block;
      margin-block-end: var(--jd-space-2);
    }

    .jd-sidebar-section__title {
      padding: var(--jd-space-1-5) var(--jd-space-3);
      font-size: 10px;
      font-weight: var(--jd-weight-semibold);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: color-mix(in srgb, var(--jd-color-sidebar-text) 50%, transparent);
    }
    .jd-sidebar-section__title[hidden] {
      display: none;
    }

    .jd-sidebar-section__items {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-0-5);
    }

    jd-sidebar-provider[collapsed] .jd-sidebar-section__title,
    jd-sidebar[collapsed] .jd-sidebar-section__title {
      display: none;
    }
  }
`;
