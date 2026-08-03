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
 *
 * v2가 비워 둔 것: **닫힌 상태의 치수**. v2 트리거는 폭도 비율도 없어 이미지가
 * 아직 없으면(로딩 전·깨진 링크) 좌상단 몇 px짜리 점으로 접혔다. v3는 호스트가
 * 최소 폭을, 썸네일이 `aspect-ratio: auto <ratio>`로 대체 비율을 갖는다 —
 * 고유 비율이 생기면 그쪽이 이기므로 정상 이미지의 모양은 그대로다.
 */
export default css`
  @layer junds.components {
    jd-image-lightbox {
      display: inline-block;
      /* 자리의 하한은 호스트가 갖는다 — 안쪽 img에 걸면 고유 크기가 없는 이미지에서
       버튼과 이미지가 서로 폭을 물어보다 몇 px로 접힌다 */
      min-width: var(--jd-image-lightbox-thumb-min, 10rem);
      max-width: 100%;
      box-sizing: border-box;
      font-family: var(--jd-font-sans);
    }

    /* 닫힌 상태의 이 컴포넌트는 **썸네일 그 자체**다. v2는 버튼에 아무 치수도 주지
     않아, 이미지가 아직 없거나 고유 크기가 없으면 좌상단에 몇 px짜리 점으로
     박혔다(실측). 자리를 먼저 세우고 그 안을 이미지가 채운다. */
    .jd-image-lightbox__trigger {
      display: block;
      width: 100%;
      padding: 0;
      border: 0;
      overflow: hidden;
      background: var(--jd-color-border-light);
      color: inherit;
      font: inherit;
      cursor: zoom-in;
      border-radius: var(--jd-radius-lg);
      /* 눌리는 면이라는 것을 쉬는 상태에서도 보여야 한다(§7·§2) */
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
      transition: box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-image-lightbox__trigger:hover {
      box-shadow: var(--jd-shadow-md), inset 0 1px 0 var(--jd-color-highlight);
    }
    .jd-image-lightbox__trigger:active {
      scale: 0.98;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-image-lightbox__trigger:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }
    .jd-image-lightbox__thumb {
      display: block;
      width: 100%;
      height: auto;
      /* auto <ratio> — 고유 비율이 있으면 그것이 이기고, 없을 때만(로딩 전·깨진
       링크) 대체 비율이 자리를 잡는다. 소비자는 --jd-image-lightbox-thumb-ratio로 바꾼다. */
      aspect-ratio: auto var(--jd-image-lightbox-thumb-ratio, 4 / 3);
      object-fit: cover;
      border-radius: inherit;
    }

    /* 닫혀 있을 때 오버레이는 없는 것과 같다 */
    jd-image-lightbox:not([open]) > .jd-modal__backdrop,
    jd-image-lightbox:not([open]) > .jd-modal__panel {
      display: none;
    }

    jd-image-lightbox > .jd-modal__backdrop {
      position: fixed;
      inset: 0;
      z-index: var(--jd-z-modal);
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(4px);
    }

    /* 패널이 곧 오버레이 무대다 — 카드 표면(배경·그림자·max-width)을 전부 벗긴다 */
    jd-image-lightbox > .jd-modal__panel {
      position: fixed;
      inset: 0;
      z-index: var(--jd-z-modal);
      display: flex;
      align-items: center;
      justify-content: center;
      width: auto;
      max-width: none;
      max-height: none;
      padding: 0;
      overflow: visible;
      background: transparent;
      box-shadow: none;
      border-radius: 0;
    }

    .jd-image-lightbox__zoom {
      position: absolute;
      inset-block-start: var(--jd-space-4);
      inset-inline-end: var(--jd-space-4);
      display: flex;
      gap: var(--jd-space-2);
    }

    .jd-image-lightbox__button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      padding: 0;
      border: 0;
      border-radius: var(--jd-radius-full);
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      font-size: var(--jd-text-lg);
      line-height: var(--jd-leading-none);
      cursor: pointer;
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-image-lightbox__button:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.2);
    }
    /* 눌린 면은 빛을 잃는다(§1) — v2에는 세 상태 중 active가 없었다 */
    .jd-image-lightbox__button:active:not(:disabled) {
      scale: 0.97;
      background: rgba(255, 255, 255, 0.28);
    }
    .jd-image-lightbox__button:disabled {
      opacity: var(--jd-opacity-40);
      cursor: default;
    }
    /* 백드롭 위라 outline이 배경에 묻는다 — 흰 링 + 보라 글로우 두 겹으로 세운다 */
    .jd-image-lightbox__button:focus-visible {
      outline: none;
      box-shadow: 0 0 0 var(--jd-border-medium) rgba(255, 255, 255, 0.9),
        var(--jd-shadow-focus-ring);
    }
    .jd-image-lightbox__close {
      font-size: var(--jd-text-2xl);
    }

    .jd-image-lightbox__figure {
      max-width: 90vw;
      max-height: 90vh;
      object-fit: contain;
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
    @keyframes jd-image-lightbox-fade {
      from {
        opacity: 0;
      }
    }
    @keyframes jd-image-lightbox-pop {
      from {
        opacity: 0;
        transform: scale(0.94);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-image-lightbox__figure,
      .jd-image-lightbox__button,
      .jd-image-lightbox__trigger {
        transition: none;
      }
    }
  }
`;
