/**
 * jd-context-menu CSS — v2 ContextMenu 표면.
 * v2 값: 래퍼는 그냥 블록 div, 메뉴 `fixed z-50 min-w-[180px] py-1 bg-card rounded-xl
 * shadow-lg border border-border animate-fade-in`, 항목 `px-3 py-2`,
 * 구분선 `my-1 border-t border-border-light`.
 *
 * 항목·아이콘·단축키 스타일은 jd-dropdown 시트가 소유한다(상속으로 함께 채택됨).
 * 따라서 dist/css/context-menu.css 단독 로드는 불완전하다 — Drawer가 modal 시트에
 * 의존하는 것과 같은 구조다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.base {
    jd-context-menu:not(:defined) {
      display: block;
    }
    jd-context-menu:not(:defined) > script {
      display: none;
    }
  }
  @layer junds.components {
    /* 우클릭 영역을 감싸는 블록 — v2의 <div onContextMenu> 자리 */
    jd-context-menu {
      display: block;
      position: relative;
    }
    jd-context-menu > .jd-popover__trigger {
      display: block;
    }
    jd-context-menu > .jd-popover__trigger[tabindex] {
      display: block;
    }

    /* 포인터 좌표 고정 — left/top은 인라인 스타일이 채운다(#place) */
    jd-context-menu > .jd-popover__panel {
      position: fixed;
      top: 0;
      left: 0;
      right: auto;
      bottom: auto;
      margin: 0;
      --jd-popover-tx: 0;
      --jd-popover-ty: 0;
      min-width: 11.25rem;
      padding: var(--jd-space-1) 0;
      border-radius: var(--jd-radius-xl);
      box-shadow: var(--jd-shadow-lg);
      backdrop-filter: none;
    }
    jd-context-menu .jd-dropdown__item {
      padding-block: var(--jd-space-2);
    }
    jd-context-menu .jd-dropdown__divider {
      background: var(--jd-color-border-light);
    }
  }
`;
