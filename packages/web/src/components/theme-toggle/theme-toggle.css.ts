import { css } from "../../core/styles.js";

/**
 * v2 값: size-9(36px) rounded-full grid place-items-center, 글자 muted, 배경 transparent,
 * transition-colors, 아이콘 18px. hover 시 옅은 soft 배경(v2는 헤더 hover 상속) — DS는
 * 자립하므로 hover/focus 배경을 명시한다.
 */
export default css`
  @layer junds.components {
    jd-theme-toggle {
      display: inline-flex;
    }
    .jd-theme-toggle {
      display: inline-grid;
      place-items: center;
      width: 36px;
      height: 36px;
      padding: 0;
      border: 0;
      border-radius: var(--jd-radius-full);
      background: transparent;
      color: var(--jd-color-muted);
      cursor: pointer;
      transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out),
        color var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-theme-toggle:hover {
      background: color-mix(in srgb, var(--jd-color-foreground) 6%, transparent);
      color: var(--jd-color-foreground);
    }
    .jd-theme-toggle:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }
    .jd-theme-toggle > svg {
      display: block;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-theme-toggle {
        transition: none;
      }
    }
  }
`;
