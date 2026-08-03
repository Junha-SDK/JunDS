/**
 * jd-image CSS — v2 primitives/Image(래퍼 overflow-hidden + fit/radius/ratio,
 * 로드 전 opacity 0 → 로드 후 1)의 토큰 번역.
 * 상태별 표시는 [status] 훅으로 — JS가 노드를 붙였다 뗐다 하지 않는다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-image {
      position: relative;
      display: block;
      overflow: hidden;
      box-sizing: border-box; /* ratio·width에 padding/border 병용 시 총치수 유지(DEC-014-9) */
      background: var(--jd-color-card-hover); /* v2 bg-surface-soft */
    }

    .jd-image__img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover; /* fit 기본 */
      transition: opacity var(--jd-duration-normal) var(--jd-easing-ease-out);
      opacity: var(--jd-opacity-0);
    }
    jd-image[status="loaded"] .jd-image__img {
      opacity: var(--jd-opacity-100);
    }
    jd-image[status="error"] .jd-image__img {
      display: none;
    }

    jd-image[fit="contain"] .jd-image__img {
      object-fit: contain;
    }
    jd-image[fit="fill"] .jd-image__img {
      object-fit: fill;
    }
    jd-image[fit="none"] .jd-image__img {
      object-fit: none;
    }
    jd-image[fit="scale-down"] .jd-image__img {
      object-fit: scale-down;
    }

    jd-image[radius="sm"] {
      border-radius: var(--jd-radius-sm);
    }
    jd-image[radius="md"] {
      border-radius: var(--jd-radius-md);
    }
    jd-image[radius="lg"] {
      border-radius: var(--jd-radius-lg);
    }
    jd-image[radius="full"] {
      border-radius: var(--jd-radius-full);
    }

    /* 슬롯: placeholder는 로딩 중에만, fallback은 실패 시에만 */
    jd-image > [slot="placeholder"],
    jd-image > [slot="fallback"] {
      display: none;
      align-items: center;
      justify-content: center;
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
      background: var(--jd-color-card-hover);
    }
    /* placeholder는 로딩 중인 img 위에 겹친다 — 박스는 img가 준다 */
    jd-image > [slot="placeholder"] {
      position: absolute;
      inset: 0;
    }
    jd-image[status="loading"] > [slot="placeholder"] {
      display: flex;
    }
    /* fallback은 흐름 배치다(v2 동형): 실패 시 img가 사라지므로 절대배치면 높이가 0이 되어
     ratio·height를 주지 않은 사용처에서 아무것도 보이지 않는다(e2e 실증). */
    jd-image[status="error"] > [slot="fallback"] {
      display: flex;
      width: 100%;
      height: 100%;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-image__img {
        transition: none;
      }
    }
  }
`;
