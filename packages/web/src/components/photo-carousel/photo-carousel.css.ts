/**
 * jd-photo-carousel CSS — v2 composites/PhotoCarousel 토큰 번역.
 * 골격은 jd-carousel 소유(`.jd-carousel__track|slide|arrow|dots|dot`)이고 여기서는
 * **무대 색·기하와 컨트롤 스킨만** 재정의한다(jd-drawer가 `.jd-modal__panel`을 쓰는 규칙).
 *
 * v2 값: 루트 `relative overflow-hidden rounded-xl bg-black`(+ style aspectRatio),
 * 이미지 `w-full h-full object-cover`,
 * 캡션 `absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-sm`,
 * 화살표 `absolute left-3|right-3 top-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur
 * hover:bg-white/30`, 인디케이터 `absolute bottom-3 gap-1.5` + 점 `w-1.5 h-1.5`
 * (활성 `w-5 bg-white`, 비활성 `bg-white/50 hover:bg-white/80`).
 *
 * 기반은 `jd-carousel { position: relative }`로 절대배치 기준을 잡는다 — 태그가 다르니
 * 여기서 다시 잡아 준다(파생 태그가 기반 호스트 셀렉터를 상속하지 못하는 지점).
 * 화살표는 v2대로 **항상 보인다**(기반은 호버·포커스에서만 노출).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-photo-carousel:not(:defined) { display: block; }
}
@layer junds.components {
  jd-photo-carousel {
    display: block;
    position: relative;
    overflow: hidden;
    background: #000;
    border-radius: var(--jd-radius-xl);
    font-family: var(--jd-font-sans);
  }
  /* v2는 photos가 비면 아무것도 렌더하지 않았다 */
  jd-photo-carousel[data-empty] { display: none; }

  jd-photo-carousel > .jd-carousel__track {
    aspect-ratio: var(--jd-photo-carousel-ratio, 16 / 9);
  }
  jd-photo-carousel .jd-carousel__track:focus-visible {
    outline: var(--jd-border-medium) solid var(--jd-color-primary);
    outline-offset: -2px;
  }

  .jd-photo-carousel__figure {
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0;
  }
  .jd-photo-carousel__img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .jd-photo-carousel__caption {
    position: absolute;
    inset-block-end: 0;
    inset-inline: 0;
    margin: 0;
    padding: var(--jd-space-4);
    color: #fff;
    font-size: var(--jd-text-md);
    line-height: var(--jd-leading-normal);
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  }
  .jd-photo-carousel__caption[hidden] { display: none; }

  /* ── 컨트롤 스킨 ─────────────────────────────────────────── */
  jd-photo-carousel .jd-carousel__arrow {
    width: 2.25rem;
    height: 2.25rem;
    color: #fff;
    background: rgba(255, 255, 255, 0.2);
    border: 0;
    box-shadow: none;
    backdrop-filter: blur(4px);
    opacity: var(--jd-opacity-100);
  }
  jd-photo-carousel .jd-carousel__arrow:hover { background: rgba(255, 255, 255, 0.3); }
  jd-photo-carousel .jd-carousel__arrow:focus-visible { outline-color: #fff; }
  jd-photo-carousel .jd-carousel__arrow > svg { width: 1.125rem; height: 1.125rem; }
  jd-photo-carousel .jd-carousel__arrow[data-dir="prev"] { inset-inline-start: var(--jd-space-3); }
  jd-photo-carousel .jd-carousel__arrow[data-dir="next"] { inset-inline-end: var(--jd-space-3); }

  jd-photo-carousel .jd-carousel__dots {
    position: absolute;
    inset-inline: 0;
    inset-block-end: var(--jd-space-3);
    margin-block-start: 0;
  }
  jd-photo-carousel .jd-carousel__dot {
    width: 0.375rem; /* v2 w-1.5 */
    height: 0.375rem;
    background: rgba(255, 255, 255, 0.5);
  }
  jd-photo-carousel .jd-carousel__dot:hover { background: rgba(255, 255, 255, 0.8); }
  jd-photo-carousel .jd-carousel__dot[data-active] {
    width: 1.25rem; /* v2 w-5 */
    background: #fff;
  }
  jd-photo-carousel .jd-carousel__dot:focus-visible { outline-color: #fff; }
}`;
