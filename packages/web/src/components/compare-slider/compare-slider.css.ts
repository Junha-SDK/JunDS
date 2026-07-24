import { css } from "../../core/styles.js";

/**
 * jd-compare-slider CSS — v2 composites/CompareSlider의 토큰 번역.
 * v2 값: 컨테이너 `relative select-none overflow-hidden rounded-xl cursor-ew-resize`,
 * 라벨 `top-3 left/right-3 px-2 py-0.5 text-xs bg-black/50 text-white rounded-md
 * backdrop-blur-sm`, 분할선 `w-1 bg-white shadow-lg`, 손잡이 `w-8 h-8 bg-white
 * rounded-full shadow-lg border border-border`.
 *
 * 분할 위치는 `--_jd-compare-pos`(update()가 공급) 하나로 클립과 손잡이가 함께 움직인다.
 */
export default css`
@layer junds.components {
  jd-compare-slider {
    display: block; position: relative; box-sizing: border-box;
    overflow: hidden; border-radius: var(--jd-radius-xl);
    font-family: var(--jd-font-sans);
    user-select: none; -webkit-user-select: none;
    cursor: ew-resize;
  }

  .jd-compare-slider__image {
    display: block; width: 100%; height: auto;
    -webkit-user-drag: none;
  }

  /* 잘리는 쪽 — 오른쪽에서 (100 - pos)만큼 잘라낸다 */
  .jd-compare-slider__clip {
    position: absolute; inset: 0;
    clip-path: inset(0 calc(100% - var(--_jd-compare-pos, 50%)) 0 0);
  }

  .jd-compare-slider__label {
    position: absolute; inset-block-start: var(--jd-space-3);
    padding: var(--jd-space-0-5) var(--jd-space-2);
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-medium);
    color: #fff; background: rgba(0, 0, 0, .5);
    border-radius: var(--jd-radius-md);
    backdrop-filter: blur(4px);
    pointer-events: none; /* 라벨을 눌러도 분할선이 움직인다 */
  }
  .jd-compare-slider__label--start { inset-inline-start: var(--jd-space-3); }
  .jd-compare-slider__label--end { inset-inline-end: var(--jd-space-3); }
  .jd-compare-slider__label[hidden] { display: none; }

  .jd-compare-slider__handle {
    position: absolute; inset-block: 0;
    inset-inline-start: var(--_jd-compare-pos, 50%);
    width: 4px; margin-inline-start: -2px;
    background: #fff; box-shadow: var(--jd-shadow-lg);
    cursor: ew-resize;
    touch-action: none; /* 손잡이 위에서는 페이지가 스크롤되지 않는다 */
  }
  .jd-compare-slider__handle:focus-visible {
    outline: none;
    box-shadow: var(--jd-shadow-lg), var(--jd-shadow-focus-ring);
  }

  .jd-compare-slider__grip {
    position: absolute; inset-block-start: 50%; inset-inline-start: 50%;
    transform: translate(-50%, -50%);
    display: flex; align-items: center; justify-content: center;
    width: 2rem; height: 2rem;
    border-radius: var(--jd-radius-full);
    background: #fff; color: var(--jd-color-foreground);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    box-shadow: var(--jd-shadow-lg);
  }
}`;
