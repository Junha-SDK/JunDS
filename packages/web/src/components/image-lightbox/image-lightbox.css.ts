import { css } from "../../core/styles.js";

/**
 * jd-image-lightbox CSS — v2 composites/ImageLightbox의 토큰 번역.
 * v2 값: 배경 `bg-black/80 backdrop-blur-sm`, 컨트롤 `top-4 right-4 w-10 h-10
 * rounded-full bg-white/10 hover:bg-white/20 text-white`, 이미지 `max-w-[90vw]
 * max-h-[90vh] object-contain transition-transform duration-200`, 트리거 `cursor-zoom-in`.
 *
 * 골격은 jd-modal의 것을 물려받되 **기하는 전혀 다르다**: 호스트는 문서 흐름 안의
 * 썸네일 자리(inline-block)이고, 백드롭·패널만 뷰포트에 고정된다. jd-modal의
 * `jd-modal { display:none }`류 규칙은 태그 셀렉터라 여기까지 오지 않고,
 * `.jd-modal__*` 클래스 규칙만 상속되므로 그것들만 덮어쓴다.
 */
export default css`
@layer junds.components {
  jd-image-lightbox {
    display: inline-block; box-sizing: border-box;
    font-family: var(--jd-font-sans);
  }

  .jd-image-lightbox__trigger {
    display: inline-block; padding: 0; border: 0; background: none;
    color: inherit; font: inherit; cursor: zoom-in;
    border-radius: var(--jd-radius-md);
  }
  .jd-image-lightbox__trigger:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }
  .jd-image-lightbox__thumb { display: block; max-width: 100%; border-radius: var(--jd-radius-md); }

  /* 닫혀 있을 때 오버레이는 없는 것과 같다 */
  jd-image-lightbox:not([open]) > .jd-modal__backdrop,
  jd-image-lightbox:not([open]) > .jd-modal__panel { display: none; }

  jd-image-lightbox > .jd-modal__backdrop {
    position: fixed; inset: 0; z-index: var(--jd-z-modal);
    background: rgba(0, 0, 0, .8); backdrop-filter: blur(4px);
  }

  /* 패널이 곧 오버레이 무대다 — 카드 표면(배경·그림자·max-width)을 전부 벗긴다 */
  jd-image-lightbox > .jd-modal__panel {
    position: fixed; inset: 0; z-index: var(--jd-z-modal);
    display: flex; align-items: center; justify-content: center;
    width: auto; max-width: none; max-height: none;
    padding: 0; overflow: visible;
    background: transparent; box-shadow: none; border-radius: 0;
  }

  .jd-image-lightbox__zoom {
    position: absolute;
    inset-block-start: var(--jd-space-4); inset-inline-end: var(--jd-space-4);
    display: flex; gap: var(--jd-space-2);
  }

  .jd-image-lightbox__button {
    display: flex; align-items: center; justify-content: center;
    width: 2.5rem; height: 2.5rem; padding: 0; border: 0;
    border-radius: var(--jd-radius-full);
    background: rgba(255, 255, 255, .1); color: #fff;
    font-size: var(--jd-text-lg); line-height: 1; cursor: pointer;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-image-lightbox__button:hover:not(:disabled) { background: rgba(255, 255, 255, .2); }
  .jd-image-lightbox__button:disabled { opacity: var(--jd-opacity-40); cursor: default; }
  .jd-image-lightbox__button:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }
  .jd-image-lightbox__close { font-size: var(--jd-text-2xl); }

  .jd-image-lightbox__figure {
    max-width: 90vw; max-height: 90vh; object-fit: contain;
    transform: scale(var(--_jd-lightbox-scale, 1));
    transition: transform var(--jd-duration-normal) var(--jd-easing-ease-out);
  }

  @media (prefers-reduced-motion: no-preference) {
    jd-image-lightbox[open] > .jd-modal__backdrop {
      animation: jd-image-lightbox-fade var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    jd-image-lightbox[open] > .jd-modal__panel > .jd-image-lightbox__figure {
      animation: jd-image-lightbox-pop var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
  }
  @keyframes jd-image-lightbox-fade { from { opacity: 0; } }
  @keyframes jd-image-lightbox-pop { from { opacity: 0; transform: scale(.94); } }

  @media (prefers-reduced-motion: reduce) {
    .jd-image-lightbox__figure { transition: none; }
    .jd-image-lightbox__button { transition: none; }
  }
}`;
