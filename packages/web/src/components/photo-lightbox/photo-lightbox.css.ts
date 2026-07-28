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
    jd-photo-lightbox:not(:defined) {
      display: none;
    }
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
    .jd-photo-lightbox__figure {
      pointer-events: auto;
    }

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
      /* 검은 화면 위 반투명 원은 위에서 빛을 받는 면으로 그려야 단추로 읽힌다 */
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-photo-lightbox__close:hover,
    .jd-photo-lightbox__nav:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .jd-photo-lightbox__close:active,
    .jd-photo-lightbox__nav:active {
      scale: 0.94;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.38);
    }
    .jd-photo-lightbox__close:focus-visible,
    .jd-photo-lightbox__nav:focus-visible {
      outline: var(--jd-border-medium) solid #fff;
      outline-offset: 2px;
    }
    .jd-photo-lightbox__close[hidden],
    .jd-photo-lightbox__nav[hidden] {
      display: none;
    }
    .jd-photo-lightbox__close > svg {
      width: 1.25rem;
      height: 1.25rem;
    }
    .jd-photo-lightbox__nav > svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    .jd-photo-lightbox__close {
      position: absolute;
      inset-block-start: var(--jd-space-4);
      inset-inline-end: var(--jd-space-4);
    }

    /* ── 무대 ───────────────────────────────────────────────── */
    /* 치수를 vw/vh가 아니라 **패널 비율**로 잡는다: 라이트박스는 fixed지만 컨테이닝
     블록이 항상 뷰포트인 것은 아니다(transform·contain: paint 조상이 있으면 그 상자다).
     vh로 재면 무대가 덮개보다 커져 넘치고, 그 상태에서 좌우 버튼이 캡션·순번 위로
     내려앉는다. 또 사진이 없을 때 폭이 0으로 접히면 두 버튼이 한 점에 겹친다(실측) —
     figure에 폭을 확정해 두면 두 증상이 함께 사라진다. */
    .jd-photo-lightbox__figure {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--jd-space-4);
      margin: 0;
      width: min(90%, 64rem);
      min-width: 0;
      min-height: 0;
      max-height: 100%;
      font-family: var(--jd-font-sans);
    }

    .jd-photo-lightbox__stage {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1 1 auto;
      width: 100%;
      min-width: 0;
      /* 좌우 버튼(2.5rem)이 앉을 자리 — 사진이 오기 전에도 무대가 접히지 않는다 */
      min-height: 4rem;
    }
    .jd-photo-lightbox__nav {
      position: absolute;
      inset-block-start: 50%;
      transform: translateY(-50%);
      z-index: 1;
    }
    .jd-photo-lightbox__nav[data-dir="prev"] {
      inset-inline-start: var(--jd-space-2);
    }
    .jd-photo-lightbox__nav[data-dir="next"] {
      inset-inline-end: var(--jd-space-2);
    }

    .jd-photo-lightbox__img {
      display: block;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: var(--jd-radius-lg);
    }
    .jd-photo-lightbox__img[hidden] {
      display: none;
    }

    /* ── 캡션·순번 ──────────────────────────────────────────── */
    .jd-photo-lightbox__info {
      flex: none;
      width: 100%;
      max-width: 42rem; /* v2 max-w-2xl */
      margin-inline: auto;
      text-align: center;
    }
    .jd-photo-lightbox__caption {
      margin: 0;
      font-size: var(--jd-text-md);
      line-height: var(--jd-leading-normal);
    }
    .jd-photo-lightbox__caption[hidden] {
      display: none;
    }
    .jd-photo-lightbox__counter {
      margin: var(--jd-space-1) 0 0;
      font-size: var(--jd-text-2xs); /* v2 text-[11px] = 토큰 하한 */
      color: rgba(255, 255, 255, 0.7);
      font-variant-numeric: tabular-nums;
    }
    .jd-photo-lightbox__counter[hidden] {
      display: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-photo-lightbox__close,
      .jd-photo-lightbox__nav {
        transition: none;
      }
    }
  }
`;
