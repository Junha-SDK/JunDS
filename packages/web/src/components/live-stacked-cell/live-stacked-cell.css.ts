import { css } from "../../core/styles.js";

/**
 * v2 값: text-right, leading-tight, tabular(bm-num). 가격 13px extrabold, 등락률 10.5px
 * semibold, 둘 다 같은 색(up→--bm-up / down→--bm-down). 색은 호스트 data-trend에서
 * 자식으로 상속된다(색 통로 하나). extrabold 토큰이 없어 bold(700)로 매핑한다.
 * 13/10.5px는 v2 그대로의 리터럴(토큰 눈금 밖).
 */
export default css`
@layer junds.components {
  jd-live-stacked-cell {
    display: block; text-align: right;
    font-family: var(--jd-font-sans);
    font-variant-numeric: tabular-nums;
    line-height: var(--jd-leading-tight);
    color: var(--jd-color-muted);
  }
  .jd-live-stacked-cell__price {
    font-size: 13px; font-weight: var(--jd-weight-bold);
  }
  .jd-live-stacked-cell__pct {
    font-size: 10.5px; font-weight: var(--jd-weight-semibold);
  }
  jd-live-stacked-cell[data-trend="up"] { color: var(--jd-color-success); }
  jd-live-stacked-cell[data-trend="down"] { color: var(--jd-color-danger); }
}`;
