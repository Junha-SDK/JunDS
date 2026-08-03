import { css } from "../../core/styles.js";

/**
 * jd-image-zoom CSS — v2 composites/ImageZoom의 토큰 번역.
 * v2 값: `relative overflow-hidden rounded-xl bg-black cursor-zoom-in select-none` +
 * `aspectRatio` 인라인, 이미지 `absolute inset-0 object-contain transition-transform
 * duration-150`, 컨트롤 `bottom-3 right-3 rounded-full bg-black/60 backdrop-blur
 * text-white text-xs px-2 py-1`.
 *
 * 배율·이동은 변수 3개(--_jd-zoom-scale / -x / -y)로만 흐른다 — update()도
 * 드래그 경로도 같은 자리에 쓴다.
 */
export default css`
  @layer junds.components {
    jd-image-zoom {
      display: block;
      position: relative;
      box-sizing: border-box;
      overflow: hidden;
      border-radius: var(--jd-radius-xl);
      aspect-ratio: var(--_jd-zoom-ratio, 16 / 9);
      background: #000;
      font-family: var(--jd-font-sans);
      user-select: none;
      -webkit-user-select: none;
      cursor: zoom-in;
      /* 확대되지 않았으면 이동할 것이 없다 — 세로 스크롤을 페이지에 돌려준다.
       확대된 뒤에만 드래그를 이동으로 삼킨다(전 구간 none이면 모바일에서
       이미지가 스크롤 블랙홀이 된다). */
      touch-action: pan-y;
    }
    jd-image-zoom[data-zoomed] {
      cursor: grab;
      touch-action: none;
    }
    jd-image-zoom:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    .jd-image-zoom__image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      -webkit-user-drag: none;
      transform: translate(var(--_jd-zoom-x, 0px), var(--_jd-zoom-y, 0px))
        scale(var(--_jd-zoom-scale, 1));
      transition: transform var(--jd-duration-fast) var(--jd-easing-ease-out);
    }

    .jd-image-zoom__controls {
      position: absolute;
      inset-block-end: var(--jd-space-3);
      inset-inline-end: var(--jd-space-3);
      display: flex;
      align-items: center;
      gap: var(--jd-space-1);
      padding: var(--jd-space-1) var(--jd-space-2);
      border-radius: var(--jd-radius-full);
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      color: #fff;
      font-size: var(--jd-text-xs);
    }

    .jd-image-zoom__button {
      padding: 0 var(--jd-space-2);
      border: 0;
      background: none;
      color: inherit;
      font: inherit;
      line-height: 1.5;
      cursor: pointer;
      border-radius: var(--jd-radius-sm);
    }
    .jd-image-zoom__button:hover:not(:disabled) {
      opacity: var(--jd-opacity-80);
    }
    .jd-image-zoom__button:disabled {
      opacity: var(--jd-opacity-40);
      cursor: default;
    }
    .jd-image-zoom__button:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    .jd-image-zoom__value {
      width: 2.5rem;
      text-align: center;
      font-variant-numeric: tabular-nums;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-image-zoom__image {
        transition: none;
      }
    }
  }
`;
