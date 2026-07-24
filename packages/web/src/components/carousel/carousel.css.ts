/**
 * jd-carousel CSS — v2 composites/Carousel 토큰 번역.
 *
 * v2 값: 루트 `relative group`, 트랙 `flex overflow-x-hidden snap-x snap-mandatory scroll-smooth`,
 * 슬라이드 `w-full flex-shrink-0 snap-start`,
 * 화살표 `absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 border shadow-sm`
 * (기본 opacity-0 → 그룹 hover에서 100), 도트 `w-2 h-2 rounded-full`(활성 `w-4 bg-foreground`,
 * 비활성 `bg-border hover:bg-muted`) + `mt-3 gap-1.5`.
 *
 * v2의 `bg-white/80`은 라이트 전용 리터럴이라 다크에서 흰 판이 됐다 —
 * 카드 토큰 80%로 번역해 두 테마에서 같은 의미(반투명 표면)를 유지한다(jd-scroll-spy 선례).
 * 화살표를 hover에서만 보이게 하는 v2 규칙은 **포커스 시에도** 드러나게 확장했다 —
 * 그러지 않으면 키보드 사용자에게는 영영 보이지 않는 버튼이 된다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-carousel { display: block; position: relative; font-family: var(--jd-font-sans); }

  .jd-carousel__track {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none; /* v2 overflow-x-hidden의 의미(스크롤바 없음)를 유지하되 */
    overscroll-behavior-x: contain;
  }
  .jd-carousel__track::-webkit-scrollbar { display: none; }

  .jd-carousel__slide {
    flex: 0 0 100%;
    max-width: 100%;
    scroll-snap-align: start;
  }

  .jd-carousel__arrow {
    position: absolute; inset-block-start: 50%; transform: translateY(-50%);
    display: inline-flex; align-items: center; justify-content: center;
    width: 2rem; height: 2rem; padding: 0;
    color: var(--jd-color-foreground);
    background: color-mix(in srgb, var(--jd-color-card) 80%, transparent);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-full);
    box-shadow: var(--jd-shadow-sm);
    cursor: pointer;
    opacity: var(--jd-opacity-0);
    transition: opacity var(--jd-duration-normal) var(--jd-easing-ease-out),
                background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-carousel__arrow[hidden] { display: none; }
  .jd-carousel__arrow[data-dir="prev"] { inset-inline-start: var(--jd-space-2); }
  .jd-carousel__arrow[data-dir="next"] { inset-inline-end: var(--jd-space-2); }
  .jd-carousel__arrow > svg { width: 1rem; height: 1rem; }
  jd-carousel:hover .jd-carousel__arrow,
  jd-carousel:focus-within .jd-carousel__arrow { opacity: var(--jd-opacity-100); }
  .jd-carousel__arrow:hover { background: var(--jd-color-card); }
  .jd-carousel__arrow:focus-visible {
    opacity: var(--jd-opacity-100);
    outline: var(--jd-border-medium) solid var(--jd-color-primary); outline-offset: 2px;
  }
  .jd-carousel__arrow:disabled { opacity: var(--jd-opacity-30); cursor: not-allowed; }
  /* 포인터가 없는 기기에서는 hover가 없다 — 화살표를 상시 노출한다 */
  @media (hover: none) {
    .jd-carousel__arrow { opacity: var(--jd-opacity-100); }
  }

  .jd-carousel__dots {
    display: flex; align-items: center; justify-content: center;
    gap: var(--jd-space-1-5);
    margin-block-start: var(--jd-space-3);
  }
  .jd-carousel__dots[hidden] { display: none; }
  .jd-carousel__dot {
    width: 0.5rem; height: 0.5rem; padding: 0;
    background: var(--jd-color-border); border: 0;
    border-radius: var(--jd-radius-full);
    cursor: pointer;
    transition: width var(--jd-duration-normal) var(--jd-easing-ease-out),
                background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-carousel__dot:hover { background: var(--jd-color-muted); }
  .jd-carousel__dot[data-active] { width: 1rem; background: var(--jd-color-foreground); }
  .jd-carousel__dot:focus-visible {
    outline: var(--jd-border-medium) solid var(--jd-color-primary); outline-offset: 2px;
  }

  @media (prefers-reduced-motion: no-preference) {
    .jd-carousel__track { scroll-behavior: smooth; }
  }
  @media (prefers-reduced-motion: reduce) {
    .jd-carousel__arrow,
    .jd-carousel__dot { transition: none; }
  }
}`;
