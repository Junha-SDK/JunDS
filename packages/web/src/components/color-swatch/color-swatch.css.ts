/**
 * jd-color-swatch 컴포넌트 CSS.
 * v2 ds/composites/ColorSwatch 시각을 --jd-* 토큰으로 의미 번역:
 *   flex flex-wrap gap-2 / 스와치 rounded-lg border-2 / size sm 24·md 32·lg 40px /
 *   선택 = border-primary + scale-110 + shadow-md / 비선택 = border-transparent,
 *   hover scale-105 / 라벨 = text-xs · text-muted · font-mono · ml-1.
 *
 * 색 자체는 데이터라 인라인(chip.style.backgroundColor)이다 — 토큰화 대상이 아니다.
 * 라디오는 시각적으로만 감추고 포커스 링은 :has로 스와치 면에 그린다(star-rating 관용구).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-color-swatch {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--jd-space-2);
      font-family: var(--jd-font-sans);
    }
    /* columns>0이면 그리드 — 열 수는 update()가 인라인으로 채운다 */
    jd-color-swatch[columns]:not([columns="0"]) {
      display: grid;
      justify-content: start;
    }
    jd-color-swatch[columns]:not([columns="0"]) > .jd-color-swatch__label {
      grid-column: 1 / -1;
    }

    .jd-color-swatch__item {
      position: relative;
      display: inline-flex;
      box-sizing: border-box;
      border: var(--jd-border-medium) solid transparent;
      border-radius: var(--jd-radius-lg);
      cursor: pointer;
      /* size 기본 md — v2 w-8 h-8 */
      width: 2rem;
      height: 2rem;
      transition: transform var(--jd-duration-fast) var(--jd-easing-ease-out),
        border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-color-swatch__item:hover {
      transform: scale(1.05);
    }
    .jd-color-swatch__item[data-selected] {
      border-color: var(--jd-color-primary);
      transform: scale(1.1);
      box-shadow: var(--jd-shadow-md);
    }

    /* size — v2: sm 24px / lg 40px (md는 base) */
    jd-color-swatch[size="sm"] .jd-color-swatch__item {
      width: 1.5rem;
      height: 1.5rem;
    }
    jd-color-swatch[size="lg"] .jd-color-swatch__item {
      width: 2.5rem;
      height: 2.5rem;
    }

    .jd-color-swatch__chip {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: calc(var(--jd-radius-lg) - var(--jd-border-medium));
      background: transparent;
    }

    .jd-color-swatch__input {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }
    .jd-color-swatch__item:has(.jd-color-swatch__input:focus-visible) {
      outline: var(--jd-border-medium) solid var(--jd-color-primary);
      outline-offset: 2px;
    }

    .jd-color-swatch__label {
      display: inline-flex;
      align-items: center;
      margin-inline-start: var(--jd-space-1);
      font-family: var(--jd-font-mono);
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
    }
    .jd-color-swatch__label[hidden] {
      display: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-color-swatch__item {
        transition: none;
      }
      .jd-color-swatch__item:hover,
      .jd-color-swatch__item[data-selected] {
        transform: none;
      }
    }
  }
`;
