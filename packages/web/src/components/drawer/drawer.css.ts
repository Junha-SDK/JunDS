/**
 * jd-drawer CSS — v2 composites/Drawer(side 3종 × size 4종, 가장자리 슬라이드)의
 * 토큰 번역. 패널 표면은 jd-modal 시트를 그대로 쓰고 **기하만** 덮어쓴다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-drawer { display: none; }
  jd-drawer[open] {
    display: flex; position: fixed; inset: 0; z-index: var(--jd-z-modal);
    padding: 0; /* 가장자리에 붙는다 — 모달의 여백 없음 */
  }
  /* side 기본 right */
  jd-drawer[open] { align-items: stretch; justify-content: flex-end; }
  jd-drawer[side="left"][open] { justify-content: flex-start; }
  jd-drawer[side="bottom"][open] { align-items: flex-end; justify-content: stretch; }

  jd-drawer .jd-modal__panel {
    max-height: 100%; height: 100%; border-radius: 0;
    /* size 기본 md — v2 420px */
    max-width: min(420px, 100vw);
    animation: jd-drawer-in var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  jd-drawer[size="sm"] .jd-modal__panel { max-width: min(320px, 100vw); }
  jd-drawer[size="lg"] .jd-modal__panel { max-width: min(560px, 100vw); }
  jd-drawer[size="xl"] .jd-modal__panel { max-width: min(720px, 100vw); }

  jd-drawer[side="left"] .jd-modal__panel { animation-name: jd-drawer-in-left; }
  jd-drawer[side="bottom"] .jd-modal__panel {
    width: 100%; max-width: 100%; height: auto;
    /* v2 bottom size: sm 12rem / md 18rem / lg 24rem / xl 30rem */
    height: 18rem; max-height: 90vh;
    border-radius: var(--jd-radius-2xl) var(--jd-radius-2xl) 0 0;
    animation-name: jd-drawer-in-bottom;
  }
  jd-drawer[side="bottom"][size="sm"] .jd-modal__panel { height: 12rem; }
  jd-drawer[side="bottom"][size="lg"] .jd-modal__panel { height: 24rem; }
  jd-drawer[side="bottom"][size="xl"] .jd-modal__panel { height: 30rem; }

  @keyframes jd-drawer-in { from { transform: translateX(100%); } }
  @keyframes jd-drawer-in-left { from { transform: translateX(-100%); } }
  @keyframes jd-drawer-in-bottom { from { transform: translateY(100%); } }

  .jd-drawer__header {
    display: flex; align-items: center; justify-content: space-between;
    gap: var(--jd-space-3); flex-shrink: 0;
    padding: var(--jd-space-4) var(--jd-space-5);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-drawer__header[hidden] { display: none; }
  .jd-drawer__title {
    margin: 0; font-size: var(--jd-text-lg); font-weight: var(--jd-weight-semibold);
  }
  .jd-drawer__close {
    display: flex; padding: var(--jd-space-1); border: 0; background: none;
    color: var(--jd-color-muted); cursor: pointer; border-radius: var(--jd-radius-md);
  }
  .jd-drawer__close:hover { color: var(--jd-color-foreground); background: var(--jd-color-card-hover); }
  .jd-drawer__close:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  @media (prefers-reduced-motion: reduce) {
    jd-drawer .jd-modal__panel { animation: none; }
  }
}`;
