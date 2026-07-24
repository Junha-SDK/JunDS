import { css } from "../../core/styles.js";

/**
 * jd-star-button CSS — v2 finance/StarButton 토큰 번역.
 * v2 값: 고스트(배경·테두리 없음) 아이콘 버튼, padding 4, line-height 0,
 * 색 비활성 --bm-muted / 활성 --bm-warning(획 색만 바뀜, 채움 없음).
 * 토큰 매핑: --bm-muted → --jd-color-muted, --bm-warning → --jd-color-warning.
 * 획 색만 바꾸는 v2 외관을 그대로 지킨다(파생 계열의 fill 관용구를 도입하지 않음 —
 * "외관은 v2와 같게"). 크기는 토큰 스케일이 아니라 px 수치라 --_jd-star-size 변수로 받는다.
 */
export default css`
@layer junds.components {
  jd-star-button { display: inline-flex; --_jd-star-size: 18px; }

  .jd-star-button {
    display: inline-flex; align-items: center; justify-content: center;
    padding: var(--jd-space-1); border: 0; background: none; cursor: pointer;
    line-height: 0; color: var(--jd-color-muted); border-radius: var(--jd-radius-md);
    transition: color var(--jd-duration-fast) var(--jd-easing-ease-out),
                background var(--jd-duration-fast) var(--jd-easing-ease-out),
                transform var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-star-button:hover:not(:disabled) { color: var(--jd-color-warning); }
  .jd-star-button:active:not(:disabled) { transform: scale(0.92); }
  .jd-star-button:disabled { opacity: var(--jd-opacity-50); cursor: not-allowed; }
  .jd-star-button:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  .jd-star-button__icon {
    width: var(--_jd-star-size); height: var(--_jd-star-size);
    fill: none; stroke: currentColor; stroke-width: 2;
  }

  /* 활성 — v2: 획 색만 warning으로. 채우지 않는다. */
  jd-star-button[active] .jd-star-button { color: var(--jd-color-warning); }

  @media (prefers-reduced-motion: reduce) {
    .jd-star-button { transition: none; }
    .jd-star-button:active:not(:disabled) { transform: none; }
  }
}`;
