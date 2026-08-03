/**
 * jd-scroll-progress CSS — v2 composites/ScrollProgress(fixed 좌우 0 · z-50 ·
 * pointer-events-none · height=thickness · 막대 duration-100 ease-out)의 토큰 번역.
 *
 * z-50은 "sticky 헤더 위, 모달 아래"라는 뜻이었다 → --jd-z-overlay(40).
 * 막대는 폭이 아니라 scaleX로 자란다(레이아웃 0) — 원점은 인라인 시작 쪽.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-scroll-progress {
      display: block;
      box-sizing: border-box;
      position: fixed;
      inset-inline: 0;
      inset-block-start: 0;
      z-index: var(--jd-z-overlay);
      height: var(--jd-scroll-progress-thickness, 3px);
      pointer-events: none;
      overflow: hidden;
    }
    jd-scroll-progress[position="bottom"] {
      inset-block-start: auto;
      inset-block-end: 0;
    }

    .jd-scroll-progress__bar {
      width: 100%;
      height: 100%;
      transform-origin: 0 50%;
      transform: scaleX(var(--jd-scroll-progress-scale, 0));
      background: var(--jd-scroll-progress-color, var(--jd-color-primary));
      transition: transform var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    jd-scroll-progress:dir(rtl) .jd-scroll-progress__bar {
      transform-origin: 100% 50%;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-scroll-progress__bar {
        transition: none;
      }
    }
  }
`;
