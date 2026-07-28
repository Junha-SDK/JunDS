import { css } from "../../core/styles.js";

/**
 * v2 의미론: Show above=X → w>=X 표시 · below=Y → w<Y 표시 · 병용 = AND.
 * Hide는 역 — above=X → w>=X 숨김 · below=Y → w<Y 숨김 (병용 시 v2도 상시 숨김).
 * 브레이크포인트 = v2 BREAKPOINTS(640/768/1024/1280/1536).
 */
export default css`
  @layer junds.components {
    jd-show,
    jd-hide {
      display: contents;
    }

    /* jd-show[above=X] — X 미만에서 숨김 */
    @media (max-width: 639.98px) {
      jd-show[above="sm"] {
        display: none;
      }
    }
    @media (max-width: 767.98px) {
      jd-show[above="md"] {
        display: none;
      }
    }
    @media (max-width: 1023.98px) {
      jd-show[above="lg"] {
        display: none;
      }
    }
    @media (max-width: 1279.98px) {
      jd-show[above="xl"] {
        display: none;
      }
    }
    @media (max-width: 1535.98px) {
      jd-show[above="2xl"] {
        display: none;
      }
    }

    /* jd-show[below=Y] — Y 이상에서 숨김 */
    @media (min-width: 640px) {
      jd-show[below="sm"] {
        display: none;
      }
    }
    @media (min-width: 768px) {
      jd-show[below="md"] {
        display: none;
      }
    }
    @media (min-width: 1024px) {
      jd-show[below="lg"] {
        display: none;
      }
    }
    @media (min-width: 1280px) {
      jd-show[below="xl"] {
        display: none;
      }
    }
    @media (min-width: 1536px) {
      jd-show[below="2xl"] {
        display: none;
      }
    }

    /* jd-hide[above=X] — X 이상에서 숨김 */
    @media (min-width: 640px) {
      jd-hide[above="sm"] {
        display: none;
      }
    }
    @media (min-width: 768px) {
      jd-hide[above="md"] {
        display: none;
      }
    }
    @media (min-width: 1024px) {
      jd-hide[above="lg"] {
        display: none;
      }
    }
    @media (min-width: 1280px) {
      jd-hide[above="xl"] {
        display: none;
      }
    }
    @media (min-width: 1536px) {
      jd-hide[above="2xl"] {
        display: none;
      }
    }

    /* jd-hide[below=Y] — Y 미만에서 숨김 */
    @media (max-width: 639.98px) {
      jd-hide[below="sm"] {
        display: none;
      }
    }
    @media (max-width: 767.98px) {
      jd-hide[below="md"] {
        display: none;
      }
    }
    @media (max-width: 1023.98px) {
      jd-hide[below="lg"] {
        display: none;
      }
    }
    @media (max-width: 1279.98px) {
      jd-hide[below="xl"] {
        display: none;
      }
    }
    @media (max-width: 1535.98px) {
      jd-hide[below="2xl"] {
        display: none;
      }
    }
  }
`;
