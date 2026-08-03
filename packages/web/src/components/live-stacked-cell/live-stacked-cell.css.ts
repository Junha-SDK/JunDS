import { css } from "../../core/styles.js";

/**
 * v2 값: text-right, leading-tight, tabular(bm-num). 가격 13px extrabold, 등락률 10.5px
 * semibold, 둘 다 같은 색(up→--bm-up / down→--bm-down). 색은 호스트 data-trend에서
 * 자식으로 상속된다(색 통로 하나). extrabold 토큰이 없어 bold(700)로 매핑한다.
 * 13/10.5px는 v2 그대로의 리터럴(토큰 눈금 밖).
 *
 * 그 색 통로는 --jd-finance-* 훅에서 시작한다. success/danger를 직접 박으면 한국 관례를
 * 켠 앱의 override가 이 셀만 비껴가, 같은 표의 jd-price-badge와 색이 갈린다.
 * 가격·등락률은 각각 숫자 한 덩어리라 줄바꿈으로 갈리지 않게 nowrap으로 묶는다(§5).
 */
export default css`
  @layer junds.components {
    jd-live-stacked-cell {
      display: block;
      text-align: right;
      font-family: var(--jd-font-sans);
      font-variant-numeric: tabular-nums;
      line-height: var(--jd-leading-tight);
      color: var(--jd-finance-flat, var(--jd-color-muted));
    }
    .jd-live-stacked-cell__price {
      font-size: 13px;
      font-weight: var(--jd-weight-bold);
      white-space: nowrap;
    }
    .jd-live-stacked-cell__pct {
      font-size: 10.5px;
      font-weight: var(--jd-weight-semibold);
      white-space: nowrap;
    }
    jd-live-stacked-cell[data-trend="up"] {
      color: var(--jd-finance-up, var(--jd-color-success));
    }
    jd-live-stacked-cell[data-trend="down"] {
      color: var(--jd-finance-down, var(--jd-color-danger));
    }
  }
`;
