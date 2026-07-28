import { css } from "../../core/styles.js";

/**
 * v2 값: sticky top-0 z-20, bg var(--bm-bg)/90 + backdrop-blur, px-4 pt-3 pb-2.
 * 1행 = 브랜드 | 날짜(muted 13px tabular) | 액션(우측). 검색행 = mt-3.
 *
 * 토큰 번역: --bm-bg→--jd-color-background(90% + 블러), z-20→--jd-z-sticky,
 * 날짜 muted→--jd-color-muted.
 */
export default css`
  @layer junds.components {
    jd-app-header {
      display: block;
    }
    header.jd-app-header {
      padding: var(--jd-space-3) var(--jd-space-4) var(--jd-space-2);
      background: color-mix(in srgb, var(--jd-color-background) 90%, transparent);
      -webkit-backdrop-filter: blur(8px);
      backdrop-filter: blur(8px);
    }
    jd-app-header:not([static]) header.jd-app-header {
      position: sticky;
      top: 0;
      z-index: var(--jd-z-sticky);
    }

    .jd-app-header__bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-2);
    }
    .jd-app-header__brand {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-2);
      min-width: 0;
    }
    .jd-app-header__meta {
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-semibold);
      color: var(--jd-color-muted);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .jd-app-header__meta[hidden] {
      display: none;
    }
    .jd-app-header__actions {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1);
    }

    .jd-app-header__search {
      margin-top: var(--jd-space-3);
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
    }
    .jd-app-header__search[hidden] {
      display: none;
    }
  }
`;
