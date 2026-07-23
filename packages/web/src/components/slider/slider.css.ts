import { css } from "../../core/styles.js";

/**
 * 네이티브 range의 크로스 브라우저 재도색: appearance:none + 트랙 그라디언트 채움
 * (--_jd-slider-pct는 update()가 공급, 색은 [color] attr → --_jd-slider-color).
 * v2 값: 트랙 sm 4px / md 6px, 썸 sm 14px / md 18px(white + 2px 컬러 보더 + shadow-sm),
 * 미채움 gray-200(#e5e7eb — G2 gray 어휘), 마크 틱 2×6px + 10px 라벨.
 */
export default css`
@layer junds.components {
  jd-slider {
    display: block; width: 100%;
    --_jd-slider-color: var(--jd-color-primary);
  }
  jd-slider[color="success"] { --_jd-slider-color: var(--jd-color-success); }
  jd-slider[color="warning"] { --_jd-slider-color: var(--jd-color-warning); }
  jd-slider[color="danger"] { --_jd-slider-color: var(--jd-color-danger); }
  jd-slider[disabled] { opacity: var(--jd-opacity-50); }

  .jd-slider__header {
    display: flex; justify-content: space-between; align-items: baseline;
    margin-bottom: var(--jd-space-1-5);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
  }
  .jd-slider__header[hidden] { display: none; }
  .jd-slider__display { font-weight: var(--jd-weight-semibold); color: var(--jd-color-foreground); }

  .jd-slider__input {
    appearance: none; -webkit-appearance: none;
    display: block; width: 100%; margin: 0; padding: 0;
    background: transparent; cursor: pointer;
    height: 1.25rem; /* 썸 히트 영역 */
  }
  jd-slider[disabled] .jd-slider__input { cursor: not-allowed; }

  /* 트랙 — 채움은 그라디언트 % (v2 fill div 등가) */
  .jd-slider__input::-webkit-slider-runnable-track {
    height: 6px; border-radius: var(--jd-radius-full);
    background: linear-gradient(
      to right,
      var(--_jd-slider-color) var(--_jd-slider-pct, 0%),
      #e5e7eb var(--_jd-slider-pct, 0%)
    );
  }
  .jd-slider__input::-moz-range-track {
    height: 6px; border-radius: var(--jd-radius-full); background: #e5e7eb;
  }
  .jd-slider__input::-moz-range-progress {
    height: 6px; border-radius: var(--jd-radius-full); background: var(--_jd-slider-color);
  }

  /* 썸 — white + 2px 컬러 보더 (v2 동형) */
  .jd-slider__input::-webkit-slider-thumb {
    appearance: none; -webkit-appearance: none;
    width: 1.125rem; height: 1.125rem; margin-top: -6px; /* (18-6)/2 */
    border-radius: var(--jd-radius-full);
    background: #fff; border: 2px solid var(--_jd-slider-color);
    box-shadow: var(--jd-shadow-sm);
    transition: box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-slider__input::-moz-range-thumb {
    width: 1.125rem; height: 1.125rem; box-sizing: border-box;
    border-radius: var(--jd-radius-full);
    background: #fff; border: 2px solid var(--_jd-slider-color);
    box-shadow: var(--jd-shadow-sm);
  }
  .jd-slider__input:hover::-webkit-slider-thumb { box-shadow: var(--jd-shadow-md); }
  .jd-slider__input:focus-visible {
    outline: var(--jd-border-medium) solid
      color-mix(in srgb, var(--_jd-slider-color) 40%, transparent);
    outline-offset: 2px;
  }

  jd-slider[size="sm"] .jd-slider__input::-webkit-slider-runnable-track { height: 4px; }
  jd-slider[size="sm"] .jd-slider__input::-moz-range-track { height: 4px; }
  jd-slider[size="sm"] .jd-slider__input::-moz-range-progress { height: 4px; }
  jd-slider[size="sm"] .jd-slider__input::-webkit-slider-thumb {
    width: 0.875rem; height: 0.875rem; margin-top: -5px; /* (14-4)/2 */
  }
  jd-slider[size="sm"] .jd-slider__input::-moz-range-thumb {
    width: 0.875rem; height: 0.875rem;
  }

  /* 마크 — 트랙 아래 틱+라벨 (v2 동형) */
  .jd-slider__marks { position: relative; height: 0; }
  .jd-slider__marks[hidden] { display: none; }
  .jd-slider__mark {
    position: absolute; top: 0; transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center;
  }
  .jd-slider__tick {
    width: 2px; height: 6px; margin-top: 2px;
    background: #d1d5db;
  }
  .jd-slider__mark-label {
    margin-top: 2px; font-size: 10px; white-space: nowrap;
    font-family: var(--jd-font-sans); color: var(--jd-color-muted);
  }
  jd-slider:has(.jd-slider__mark-label) { margin-bottom: var(--jd-space-6); }

  @media (prefers-reduced-motion: reduce) {
    .jd-slider__input::-webkit-slider-thumb { transition: none; }
  }
}`;
