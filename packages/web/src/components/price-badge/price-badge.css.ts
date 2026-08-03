import { css } from "../../core/styles.js";

/**
 * v2 값: inline-flex gap-[2px], tabular-nums(bm-num), md 14px / sm 12px, bold 700(기본)·
 * no-bold 500. 색 up→--bm-up / flat→--bm-muted / down→--bm-down = finance 폴백 체인.
 * 화살표는 currentColor stroke라 호스트 색을 그대로 물려받는다. 아이콘 11px 고정(v2).
 */
export default css`
  @layer junds.components {
    jd-price-badge {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-family: var(--jd-font-sans);
      font-variant-numeric: tabular-nums;
      font-size: 14px;
      font-weight: var(--jd-weight-bold);
      line-height: 1;
      color: var(--jd-color-muted);
    }
    jd-price-badge[size="sm"] {
      font-size: 12px;
    }
    jd-price-badge[no-bold] {
      font-weight: var(--jd-weight-medium);
    }

    jd-price-badge[data-trend="up"] {
      color: var(--jd-finance-up, var(--jd-color-success));
    }
    jd-price-badge[data-trend="down"] {
      color: var(--jd-finance-down, var(--jd-color-danger));
    }
    jd-price-badge[data-trend="flat"] {
      color: var(--jd-color-muted);
    }

    .jd-price-badge__arrow {
      display: inline-block;
      width: 11px;
      height: 11px;
      flex-shrink: 0;
    }
    .jd-price-badge__arrow--hidden {
      display: none;
    }
    .jd-price-badge__value {
      display: inline;
    }
  }
`;
