/**
 * jd-photo-lightbox CSS — v2 composites/PhotoLightbox 토큰 번역.
 * 골격은 jd-modal 소유(`.jd-modal__backdrop` / `.jd-modal__panel`)이고 여기서는
 * **기하와 색만** 재정의한다 — jd-drawer가 `.jd-modal__panel`을 쓰는 것과 같은 규칙.
 *
 * v2 값: 오버레이 `fixed inset-0 bg-black/95 flex flex-col items-center justify-center p-4`,
 * 닫기 `absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-xl hover:bg-white/20`,
 * 무대 `max-w-[90vw] max-h-[80vh]`, 이미지 `max-h-[80vh] object-contain rounded-lg`,
 * 좌우 `absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 z-10`,
 * 정보 `mt-4 max-w-2xl text-center text-sm`, 카운터 `text-[11px] text-white/60 tabular-nums`.
 *
 * 패널은 뷰포트를 채우되 `pointer-events: none`이다 — 빈 영역 클릭이 아래 백드롭에
 * 닿아 v2의 "사진 바깥을 누르면 닫힘"이 그대로 성립한다(기반의 백드롭 경로 재사용).
 * 사진·버튼·캡션만 pointer-events를 되살린다(= v2의 stopPropagation 자리).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-photo-lightbox:not(:defined) { display: none; }
}
@layer junds.components {
  jd-photo-lightbox > .jd-modal__backdrop {
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: none;
  }

  .jd-photo-lightbox__panel {
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    align-items: center;
    justify-content: center;
    overflow: visible;
    color: #fff;
    background: none;
    border-radius: var(--jd-radius-none);
    box-shadow: none;
    pointer-events: none;
  }
  .jd-photo-lightbox__close,
  .jd-photo-lightbox__nav,
  .jd-photo-lightbox__figure { pointer-events: auto; }

  /* ── 컨트롤 ─────────────────────────────────────────────── */
  .jd-photo-lightbox__close,
  .jd-photo-lightbox__nav {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0;
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
    border: 0;
    border-radius: var(--jd-radius-full);
    cursor: pointer;
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-photo-lightbox__close:hover,
  .jd-photo-lightbox__nav:hover { background: rgba(255, 255, 255, 0.2); }
  .jd-photo-lightbox__close:focus-visible,
  .jd-photo-lightbox__nav:focus-visible {
    outline: var(--jd-border-medium) solid #fff;
    outline-offset: 2px;
  }
  .jd-photo-lightbox__close[hidden],
  .jd-photo-lightbox__nav[hidden] { display: none; }
  .jd-photo-lightbox__close > svg { width: 1.25rem; height: 1.25rem; }
  .jd-photo-lightbox__nav > svg { width: 1.25rem; height: 1.25rem; }

  .jd-photo-lightbox__close {
    position: absolute;
    inset-block-start: var(--jd-space-4);
    inset-inline-end: var(--jd-space-4);
  }

  /* ── 무대 ───────────────────────────────────────────────── */
  .jd-photo-lightbox__figure {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0;
    max-width: 90vw;
    font-family: var(--jd-font-sans);
  }

  .jd-photo-lightbox__stage {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 90vw;
    max-height: 80vh;
  }
  .jd-photo-lightbox__nav {
    position: absolute;
    inset-block-start: 50%;
    transform: translateY(-50%);
    z-index: 1;
  }
  .jd-photo-lightbox__nav[data-dir="prev"] { inset-inline-start: var(--jd-space-2); }
  .jd-photo-lightbox__nav[data-dir="next"] { inset-inline-end: var(--jd-space-2); }

  .jd-photo-lightbox__img {
    display: block;
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: var(--jd-radius-lg);
  }
  .jd-photo-lightbox__img[hidden] { display: none; }

  /* ── 캡션·순번 ──────────────────────────────────────────── */
  .jd-photo-lightbox__info {
    width: 100%;
    max-width: 42rem; /* v2 max-w-2xl */
    margin-block-start: var(--jd-space-4);
    text-align: center;
  }
  .jd-photo-lightbox__caption {
    margin: 0;
    font-size: var(--jd-text-md);
    line-height: var(--jd-leading-normal);
  }
  .jd-photo-lightbox__caption[hidden] { display: none; }
  .jd-photo-lightbox__counter {
    margin: var(--jd-space-1) 0 0;
    font-size: 11px; /* v2 text-[11px] */
    color: rgba(255, 255, 255, 0.6);
    font-variant-numeric: tabular-nums;
  }
  .jd-photo-lightbox__counter[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .jd-photo-lightbox__close,
    .jd-photo-lightbox__nav { transition: none; }
  }
}`;
