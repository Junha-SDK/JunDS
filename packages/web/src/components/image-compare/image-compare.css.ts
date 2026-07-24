import { css } from "../../core/styles.js";

/**
 * jd-image-compare CSS — v2 composites/ImageCompare의 토큰 번역.
 * 골격은 원형(jd-compare-slider)의 것이므로 여기서는 **기하와 표면만** 덮어쓴다
 * (jd-drawer가 `.jd-modal__panel` 기하만 덮어쓰는 것과 같은 축).
 *
 * v2 값: `relative overflow-hidden rounded-xl bg-black select-none` + `aspectRatio`
 * 인라인, 이미지 `absolute inset-0 w-full h-full object-cover`,
 * 라벨 `rounded-full bg-black/60 text-[11px] font-semibold backdrop-blur`.
 */
export default css`
@layer junds.components {
  jd-image-compare {
    aspect-ratio: var(--_jd-image-compare-ratio, 16 / 9);
    background: #000;
  }

  /* 원형은 바탕 이미지가 흐름 배치라 높이를 스스로 준다.
     여기는 컨테이너가 종횡비로 높이를 정하므로 둘 다 절대 배치 + cover. */
  jd-image-compare .jd-compare-slider__image {
    position: absolute; inset: 0;
    width: 100%; height: 100%; object-fit: cover;
  }

  jd-image-compare .jd-compare-slider__label {
    padding: var(--jd-space-0-5) var(--jd-space-2);
    border-radius: var(--jd-radius-full);
    background: rgba(0, 0, 0, .6);
    font-size: 11px; font-weight: var(--jd-weight-semibold);
  }
}`;
