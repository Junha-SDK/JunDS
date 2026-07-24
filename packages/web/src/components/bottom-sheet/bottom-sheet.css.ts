/**
 * jd-bottom-sheet CSS — v2 BottomSheet(상단 둥근 모서리 + 그래버 + height 3종).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-bottom-sheet { display: none; }
  jd-bottom-sheet[open] {
    display: flex; position: fixed; inset: 0; z-index: var(--jd-z-modal);
    align-items: flex-end; justify-content: center; padding: 0;
  }

  jd-bottom-sheet .jd-modal__panel {
    width: 100%; max-width: 100%;
    border-radius: var(--jd-radius-2xl) var(--jd-radius-2xl) 0 0;
    /* height 기본 auto — v2 max-h 80vh */
    max-height: 80vh;
    animation: jd-sheet-in var(--jd-duration-normal) cubic-bezier(0.16, 1, 0.3, 1);
    transition: transform var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  jd-bottom-sheet[height="half"] .jd-modal__panel { height: 50vh; max-height: 50vh; }
  jd-bottom-sheet[height="full"] .jd-modal__panel { height: 90vh; max-height: 90vh; }

  @keyframes jd-sheet-in { from { transform: translateY(100%); } }

  .jd-bottom-sheet__grabber {
    flex-shrink: 0; width: 2.5rem; height: 0.25rem;
    margin: var(--jd-space-3) auto var(--jd-space-1);
    border-radius: var(--jd-radius-full);
    background: var(--jd-color-border);
  }
  .jd-bottom-sheet__grabber[hidden] { display: none; }
  jd-bottom-sheet[draggable] .jd-bottom-sheet__grabber {
    cursor: grab; touch-action: none; /* 끌 때 브라우저 스크롤과 다투지 않는다 */
    /* 손잡이만으로는 잡기 어렵다 — 히트 영역을 넓힌다 */
    padding-block: var(--jd-space-2); background-clip: content-box;
    height: calc(0.25rem + var(--jd-space-4)); box-sizing: content-box;
  }

  .jd-bottom-sheet__title {
    flex-shrink: 0; margin: 0;
    padding: var(--jd-space-2) var(--jd-space-5) var(--jd-space-3);
    font-size: var(--jd-text-md); font-weight: var(--jd-weight-semibold);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-bottom-sheet__title[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    jd-bottom-sheet .jd-modal__panel { animation: none; transition: none; }
  }
}`;
