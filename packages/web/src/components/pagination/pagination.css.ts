/**
 * jd-pagination CSS — v2 composites/Pagination(32px 정사각 · rounded-lg ·
 * 활성=primary/흰 글자 · 비활성 30% 투명)의 의미 번역.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-pagination {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1);
    }
    jd-pagination[hidden] {
      display: none;
    }

    .jd-pagination__list {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .jd-pagination__item {
      display: inline-flex;
    }

    .jd-pagination__arrow,
    .jd-pagination__page,
    .jd-pagination__ellipsis {
      /* v2: w-8 h-8 */
      inline-size: 2rem;
      block-size: 2rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      background: transparent;
      border-radius: var(--jd-radius-lg);
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-medium);
      line-height: var(--jd-leading-none);
      color: var(--jd-color-muted);
    }

    .jd-pagination__arrow,
    .jd-pagination__page {
      cursor: pointer;
      transition: background var(--jd-duration-normal) var(--jd-easing-ease-out),
        color var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    .jd-pagination__arrow:hover:not(:disabled),
    .jd-pagination__page:hover:not([aria-current="page"]) {
      background: color-mix(in srgb, var(--jd-color-muted) 10%, transparent);
      color: var(--jd-color-foreground);
    }
    .jd-pagination__arrow:focus-visible,
    .jd-pagination__page:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }
    .jd-pagination__arrow:disabled {
      opacity: var(--jd-opacity-30);
      pointer-events: none;
    }
    .jd-pagination__arrow > svg {
      inline-size: 16px;
      block-size: 16px;
    }

    .jd-pagination__page[aria-current="page"] {
      background: var(--jd-color-primary);
      color: #fff;
      box-shadow: var(--jd-shadow-sm);
    }

    .jd-pagination__ellipsis {
      cursor: default;
      user-select: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-pagination__arrow,
      .jd-pagination__page {
        transition: none;
      }
    }
  }
`;
