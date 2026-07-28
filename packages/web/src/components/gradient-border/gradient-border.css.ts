import { css } from "../../core/styles.js";

/**
 * v2 값: 바깥 `relative p-[borderWidth]` + `rounded-*`, 그라디언트 레이어
 * `absolute inset-0 bg-gradient-to-r`(=90deg), 안쪽 `relative bg-white rounded-*`,
 * animated면 `background-size: 200% 200%` + `gradient-shift 3s ease infinite`
 * (0%,100% → 0% 50% / 50% → 100% 50%).
 *
 * 기본 그라디언트는 v2 `from-primary via-accent to-primary`의 토큰 번역이다.
 * 안쪽 배경 `bg-white`는 --jd-color-card로 — 다크에서도 성립한다(v2는 라이트 전용).
 */
export default css`
  @layer junds.base {
    jd-gradient-border:not(:defined) {
      display: block;
    }
  }
  @layer junds.components {
    jd-gradient-border {
      --jd-gradient-border-default: linear-gradient(
        90deg,
        var(--jd-color-primary) 0%,
        var(--jd-color-accent) 50%,
        var(--jd-color-primary) 100%
      );
      --jd-gradient-border-radius: var(--jd-radius-xl); /* v2 기본 rounded-xl = 12px */

      display: block;
      position: relative;
      box-sizing: border-box;
      padding: var(--jd-gradient-border-width, 2px);
      border-radius: var(--jd-gradient-border-radius);
      background-image: var(--jd-gradient-border-image, var(--jd-gradient-border-default));
      background-size: 100% 100%;
    }

    jd-gradient-border[radius="none"] {
      --jd-gradient-border-radius: var(--jd-radius-none);
    }
    jd-gradient-border[radius="sm"] {
      --jd-gradient-border-radius: var(--jd-radius-sm);
    }
    jd-gradient-border[radius="md"] {
      --jd-gradient-border-radius: var(--jd-radius-md);
    }
    jd-gradient-border[radius="lg"] {
      --jd-gradient-border-radius: var(--jd-radius-lg);
    }
    jd-gradient-border[radius="2xl"] {
      --jd-gradient-border-radius: var(--jd-radius-2xl);
    }
    jd-gradient-border[radius="full"] {
      --jd-gradient-border-radius: var(--jd-radius-full);
    }

    .jd-gradient-border__inner {
      position: relative;
      border-radius: inherit; /* v2: 바깥과 같은 rounded 클래스 */
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
    }

    jd-gradient-border[animated] {
      background-size: 200% 200%;
    }
    @media (prefers-reduced-motion: no-preference) {
      jd-gradient-border[animated] {
        animation: jd-gradient-border-shift 3s var(--jd-easing-ease-in-out) infinite;
      }
    }
    @keyframes jd-gradient-border-shift {
      0%,
      100% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
    }
  }
`;
