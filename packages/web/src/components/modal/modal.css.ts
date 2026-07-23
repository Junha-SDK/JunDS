/**
 * jd-modal 컴포넌트 CSS.
 * v2 ds/composites/Modal의 백드롭(black/30 + blur 2px)·패널(white·radius 2xl·
 * 층 그림자·max-h 90vh)·size 5종(sm/md/lg/xl/full)을 --jd-* 토큰으로 의미 번역.
 * top layer(<dialog>) 미사용 — --jd-z-modal 토큰 체계로 쌓임 제어(DECISIONS 참조).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-modal { display: none; }
  jd-modal[open] {
    display: flex; position: fixed; inset: 0; z-index: var(--jd-z-modal);
    align-items: center; justify-content: center; padding: var(--jd-space-4);
  }

  .jd-modal__backdrop {
    position: absolute; inset: 0;
    background: rgba(0, 0, 0, .3);
    backdrop-filter: blur(2px);
  }

  .jd-modal__panel {
    position: relative; width: 100%;
    display: flex; flex-direction: column;
    max-height: 90vh; overflow: auto;
    background: var(--jd-color-card); color: var(--jd-color-foreground);
    font-family: var(--jd-font-sans);
    border-radius: var(--jd-radius-2xl);
    box-shadow: 0 25px 60px rgba(0,0,0,.15), 0 10px 20px rgba(0,0,0,.06);
    /* size 기본 md(32rem) — 디폴트는 attribute 미반영(§1.3)이라 base가 담당 */
    max-width: min(32rem, calc(100vw - 2rem));
  }

  /* size — v2: sm 28rem / lg 42rem / xl 56rem / full 뷰포트 (md는 base) */
  jd-modal[size="sm"] > .jd-modal__panel { max-width: min(28rem, calc(100vw - 2rem)); }
  jd-modal[size="lg"] > .jd-modal__panel { max-width: min(42rem, calc(100vw - 2rem)); }
  jd-modal[size="xl"] > .jd-modal__panel { max-width: min(56rem, calc(100vw - 2rem)); }
  jd-modal[size="full"] > .jd-modal__panel {
    max-width: calc(100vw - 2rem); max-height: calc(100vh - 2rem);
  }

  @media (prefers-reduced-motion: no-preference) {
    jd-modal[open] > .jd-modal__backdrop { animation: jd-modal-fade var(--jd-duration-normal) var(--jd-easing-ease-out); }
    jd-modal[open] > .jd-modal__panel { animation: jd-modal-pop var(--jd-duration-normal) var(--jd-easing-default); }
  }
  @keyframes jd-modal-fade { from { opacity: 0; } }
  @keyframes jd-modal-pop { from { opacity: 0; transform: scale(.96); } }
}`;
