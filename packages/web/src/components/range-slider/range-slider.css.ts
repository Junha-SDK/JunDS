import { css } from "../../core/styles.js";

/**
 * v2 값: 트랙 히트 20px·레일 6px gray-200, 채움 primary, 썸 20px white+primary 2px 보더,
 * 호버·드래그 scale 1.1, grab/grabbing 커서, 값 라벨 xs muted tabular-nums.
 */
export default css`
  @layer junds.components {
    jd-range-slider {
      display: block;
      width: 100%;
    }
    jd-range-slider[disabled] {
      opacity: var(--jd-opacity-50);
    }

    .jd-range-slider__values {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--jd-space-1);
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
      font-variant-numeric: tabular-nums;
    }
    .jd-range-slider__values[hidden] {
      display: none;
    }

    .jd-range-slider__track {
      position: relative;
      height: 1.25rem;
      display: flex;
      align-items: center;
      cursor: pointer;
      touch-action: none;
    }
    jd-range-slider[disabled] .jd-range-slider__track {
      cursor: not-allowed;
    }

    .jd-range-slider__rail {
      position: absolute;
      inset-inline: 0;
      height: 6px;
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-neutral-200);
    }
    .jd-range-slider__fill {
      position: absolute;
      height: 6px;
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-primary);
    }

    .jd-range-slider__thumb {
      position: absolute;
      width: 1.25rem;
      height: 1.25rem;
      transform: translateX(-50%);
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-control-knob);
      border: 2px solid var(--jd-color-primary);
      box-sizing: border-box;
      box-shadow: var(--jd-shadow-sm);
      cursor: grab;
      transition: scale var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-range-slider__thumb:hover {
      scale: 1.1;
    }
    jd-range-slider[data-dragging] .jd-range-slider__thumb {
      cursor: grabbing;
    }
    .jd-range-slider__thumb:focus-visible {
      outline: var(--jd-border-medium) solid
        color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
      outline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-range-slider__thumb {
        transition: none;
      }
    }
  }
`;
