/**
 * jd-link CSS — v2 primitives/Link(variant 4종 × underline 3종)의 토큰 번역.
 * v2 danger는 hover:opacity-80(색 유지) — 그대로 승계.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-link {
      display: inline;
    }

    .jd-link {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1);
      border-radius: var(--jd-radius-sm);
      cursor: pointer;
      color: var(--jd-color-primary-ink);
      transition: color var(--jd-duration-fast) var(--jd-easing-ease-out),
        opacity var(--jd-duration-fast) var(--jd-easing-ease-out);
      /* underline 기본 hover — 기본값은 attribute 미반영(§1.3)이라 base가 담당 */
      text-decoration: none;
      text-underline-offset: 2px;
    }
    .jd-link:hover {
      color: var(--jd-color-primary-hover);
      text-decoration: underline;
    }
    .jd-link:focus-visible {
      outline: var(--jd-border-medium) solid var(--jd-color-primary);
      outline-offset: 2px;
    }
    .jd-link__external {
      display: inline-flex;
    }

    jd-link[variant="subtle"] .jd-link {
      color: var(--jd-color-foreground);
    }
    jd-link[variant="subtle"] .jd-link:hover {
      color: var(--jd-color-primary-ink);
    }
    jd-link[variant="muted"] .jd-link {
      color: var(--jd-color-muted);
    }
    jd-link[variant="muted"] .jd-link:hover {
      color: var(--jd-color-foreground);
    }
    jd-link[variant="danger"] .jd-link {
      color: var(--jd-color-danger);
    }
    jd-link[variant="danger"] .jd-link:hover {
      color: var(--jd-color-danger);
      opacity: var(--jd-opacity-80);
    }

    jd-link[underline="always"] .jd-link {
      text-decoration: underline;
    }
    jd-link[underline="none"] .jd-link,
    jd-link[underline="none"] .jd-link:hover {
      text-decoration: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-link {
        transition: none;
      }
    }
  }
`;
