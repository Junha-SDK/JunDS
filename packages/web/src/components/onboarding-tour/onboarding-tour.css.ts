/**
 * jd-onboarding-tour CSS — v2 ds/patterns/OnboardingTour 표면의 토큰 번역.
 *
 * v2 값 매핑:
 *  - 루트 `fixed inset-0 z-[9998]` → 호스트 [open] fixed inset-0, 임의 z는 --jd-z-max.
 *  - 백드롭 `bg-black/55` → rgba(0,0,0,.55)(스크림 리터럴, §4.3 허용).
 *  - 스팟 `rounded-lg ring-4 ring-primary/70 shadow-[0_0_0_9999px_rgba(0,0,0,.55)]`
 *    → radius-lg + box-shadow 2겹(안쪽 4px 프라이머리 70% 링 + 9999px 딤). 링 색은
 *    color-mix로 토큰에서 파생(리터럴 rgba 금지).
 *  - 툴팁 `w-80 rounded-xl border bg-surface shadow-xl p-4` → 20rem/radius-xl/카드 표면.
 *  - transition-all duration-200(v2는 스팟에만) → 스팟 위치 트랜지션(reduced-motion 존중).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.base {
    jd-onboarding-tour:not(:defined) {
      display: none;
    }
  }
  @layer junds.components {
    jd-onboarding-tour {
      display: none;
    }
    jd-onboarding-tour[open] {
      display: block;
      position: fixed;
      inset: 0;
      z-index: var(--jd-z-max);
    }

    .jd-onboarding-tour__backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
    }

    /* 스팟 = 대상 위 링 + 9999px 딤. pointer-events 없음 → 클릭은 아래 백드롭이 받는다 */
    .jd-onboarding-tour__spot {
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      pointer-events: none;
      border-radius: var(--jd-radius-lg);
      box-shadow: 0 0 0 var(--jd-border-heavy)
          color-mix(in srgb, var(--jd-color-primary) 70%, transparent),
        0 0 0 9999px rgba(0, 0, 0, 0.55);
    }
    .jd-onboarding-tour__spot[hidden] {
      display: none;
    }

    .jd-onboarding-tour__tooltip {
      position: absolute;
      top: 24px;
      left: 24px;
      z-index: 1;
      box-sizing: border-box;
      width: 20rem;
      max-width: calc(100vw - 2rem);
      padding: var(--jd-space-4);
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      box-shadow: var(--jd-shadow-xl);
      font-family: var(--jd-font-sans);
    }
    .jd-onboarding-tour__tooltip[hidden] {
      display: none;
    }

    .jd-onboarding-tour__counter {
      font-size: var(--jd-text-xs);
      line-height: var(--jd-leading-normal);
      text-transform: uppercase;
      letter-spacing: var(--jd-tracking-wide);
      color: var(--jd-color-muted);
    }

    .jd-onboarding-tour__title {
      margin: var(--jd-space-1) 0 0;
      font-size: var(--jd-text-lg);
      font-weight: var(--jd-weight-semibold);
      line-height: var(--jd-leading-snug);
      color: var(--jd-color-foreground);
    }
    .jd-onboarding-tour__title[hidden] {
      display: none;
    }

    .jd-onboarding-tour__desc {
      margin-top: var(--jd-space-1);
      font-size: var(--jd-text-md);
      line-height: var(--jd-leading-normal);
      color: var(--jd-color-muted);
    }
    .jd-onboarding-tour__desc[hidden] {
      display: none;
    }

    .jd-onboarding-tour__actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: var(--jd-space-3);
      gap: var(--jd-space-3);
    }
    .jd-onboarding-tour__nav {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
    }

    .jd-onboarding-tour__skip,
    .jd-onboarding-tour__prev,
    .jd-onboarding-tour__next {
      font-family: inherit;
      cursor: pointer;
    }

    .jd-onboarding-tour__skip:focus-visible,
    .jd-onboarding-tour__prev:focus-visible,
    .jd-onboarding-tour__next:focus-visible {
      outline: var(--jd-border-medium) solid var(--jd-color-primary);
      outline-offset: 2px;
    }

    .jd-onboarding-tour__skip {
      padding: 0;
      border: 0;
      background: none;
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
      transition: color var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-onboarding-tour__skip:hover {
      color: var(--jd-color-foreground);
    }

    .jd-onboarding-tour__prev {
      padding: var(--jd-space-1-5) var(--jd-space-3);
      font-size: var(--jd-text-xs);
      color: var(--jd-color-foreground);
      background: transparent;
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-md);
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-onboarding-tour__prev:hover {
      background: var(--jd-color-card-hover);
    }
    .jd-onboarding-tour__prev[hidden] {
      display: none;
    }

    .jd-onboarding-tour__next {
      padding: var(--jd-space-1-5) var(--jd-space-3);
      font-size: var(--jd-text-xs);
      color: #fff;
      background: var(--jd-color-primary);
      border: 0;
      border-radius: var(--jd-radius-md);
      transition: filter var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-onboarding-tour__next:hover {
      filter: brightness(1.1);
    }

    @media (prefers-reduced-motion: no-preference) {
      jd-onboarding-tour[open] > .jd-onboarding-tour__backdrop {
        animation: jd-onboarding-tour-fade var(--jd-duration-normal) var(--jd-easing-ease-out);
      }
      jd-onboarding-tour[open] > .jd-onboarding-tour__tooltip {
        animation: jd-onboarding-tour-pop var(--jd-duration-normal) var(--jd-easing-default);
      }
      .jd-onboarding-tour__spot {
        transition: top var(--jd-duration-normal) var(--jd-easing-ease-out),
          left var(--jd-duration-normal) var(--jd-easing-ease-out),
          width var(--jd-duration-normal) var(--jd-easing-ease-out),
          height var(--jd-duration-normal) var(--jd-easing-ease-out);
      }
    }
    @keyframes jd-onboarding-tour-fade {
      from {
        opacity: 0;
      }
    }
    @keyframes jd-onboarding-tour-pop {
      from {
        opacity: 0;
        transform: scale(0.96);
      }
    }
  }
`;
