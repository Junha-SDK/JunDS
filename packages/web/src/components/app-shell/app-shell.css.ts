import { css } from "../../core/styles.js";

/**
 * v2 값 그대로: 사이드바·헤더·푸터 bg는 white 리터럴(v2 bg="white" — 다크 대응 부재도
 * v2 실태, 개선은 G2 심의), 보더 --jd-color-border, 레일 전환 300ms spring,
 * 오버레이 z 1300/드로어 1400(v2 styleProps Z_INDICES 리터럴).
 * 폭은 호스트 CSS 변수(--_jd-shell-rail/--_jd-shell-drawer) — update()가 반영.
 */
export default css`
@layer junds.components {
  jd-app-shell {
    display: flex;
    height: 100vh;
    overflow: hidden;
    background: var(--jd-color-background);
  }

  .jd-app-shell__sidebar {
    flex-shrink: 0;
    box-sizing: border-box; /* width+border-right 병용 — 레일 총폭=지정폭 (DEC-014-9) */
    overflow: auto;
    width: var(--_jd-shell-rail, 260px);
    background: #ffffff;
    border-right: 1px solid var(--jd-color-border);
    transition: width 300ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  /* 모바일: 레일 → 고정 드로어 (닫힘 = 미표시, v2 조건부 렌더 동형) */
  jd-app-shell[data-mobile] .jd-app-shell__sidebar {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 1400;
    width: var(--_jd-shell-drawer, 260px);
    box-shadow: 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04);
    transition: none;
  }
  jd-app-shell[data-mobile][mobile-open] .jd-app-shell__sidebar { display: block; }

  .jd-app-shell__backdrop { display: none; }
  jd-app-shell[data-mobile][mobile-open] .jd-app-shell__backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 1300;
    background: #000000;
    opacity: 0.3;
  }

  .jd-app-shell__main {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-width: 0;
  }

  .jd-app-shell__header {
    flex-shrink: 0;
    position: relative;
    background: #ffffff;
    border-bottom: 1px solid var(--jd-color-border);
  }
  jd-app-shell[sticky-header] .jd-app-shell__header {
    position: sticky;
    top: 0;
    z-index: 1100;
  }

  .jd-app-shell__menu {
    display: none;
    position: absolute;
    left: var(--jd-space-3);
    top: 50%;
    translate: 0 -50%;
    z-index: 10;
    padding: var(--jd-space-2);
    border: 0;
    background: transparent;
    color: var(--jd-color-muted);
    cursor: pointer;
  }
  .jd-app-shell__menu:hover { color: var(--jd-color-foreground); }
  .jd-app-shell__menu:focus-visible {
    outline: 2px solid var(--jd-color-primary);
    outline-offset: 2px;
  }
  jd-app-shell[data-mobile] .jd-app-shell__menu { display: block; }

  .jd-app-shell__content {
    flex-grow: 1;
    overflow: auto;
  }

  .jd-app-shell__footer {
    flex-shrink: 0;
    background: #ffffff;
    border-top: 1px solid var(--jd-color-border);
  }
}`;
