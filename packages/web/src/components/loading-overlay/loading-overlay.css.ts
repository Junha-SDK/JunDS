/**
 * jd-loading-overlay CSS — v2 composites/LoadingOverlay의 토큰 번역.
 *
 * v2 값: 래퍼 relative / 덮개 absolute inset-0 z-10 flex-col 중앙정렬 bg-white/70,
 * blur는 backdrop-blur-sm(4px), 스피너 w-6 h-6 text-primary, 라벨 text-sm text-muted mt-2.
 *
 * 색 번역 2건:
 *  - `bg-white/70` → --jd-color-card 70%. v2는 리터럴 white라 **다크 테마에서
 *    흰 판이 그대로 떴다**(라벨 text-muted와 대비도 무너진다). 카드 표면 토큰을
 *    쓰면 라이트에서는 v2와 같은 흰색(#ffffff)이고 다크만 정상화된다.
 *  - z-index: v2 `z-10`은 position:relative 래퍼 안의 국소 서열이라 절대값 자체는
 *    의미가 없다 — 이름이 정확한 --jd-z-overlay를 쓴다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-loading-overlay { position: relative; display: block; }

  /* 본문 래퍼는 박스를 만들지 않는다 — children의 레이아웃이 v2(래퍼 직속)와 동일 */
  .jd-loading-overlay__content { display: contents; }

  .jd-loading-overlay__veil {
    position: absolute; inset: 0; z-index: var(--jd-z-overlay);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: var(--jd-space-2);
    background: color-mix(in srgb, var(--jd-color-card) 70%, transparent);
  }
  jd-loading-overlay:not([active]) > .jd-loading-overlay__veil { display: none; }
  jd-loading-overlay[blur] > .jd-loading-overlay__veil { backdrop-filter: blur(4px); }

  .jd-loading-overlay__spinner {
    width: 1.5rem; height: 1.5rem;
    color: var(--jd-color-primary);
    animation: jd-spin 1s linear infinite;
  }

  .jd-loading-overlay__label {
    margin: 0;
    font-family: var(--jd-font-sans); font-size: var(--jd-text-sm);
    color: var(--jd-color-muted);
  }
  .jd-loading-overlay__label[hidden] { display: none; }

  /* jd-button/jd-spinner와 같은 이름·같은 본문 — 단독 로드에서도 자족한다 */
  @keyframes jd-spin { to { transform: rotate(360deg); } }

  @media (prefers-reduced-motion: reduce) {
    .jd-loading-overlay__spinner { animation-duration: 1.6s; }
  }
}`;
