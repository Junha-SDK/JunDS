import { css } from "../../core/styles.js";

/**
 * v2 LivePriceText는 React Fragment라 부모 스타일을 그대로 상속했다(bm-num = tabular).
 * CE는 호스트가 생기므로 display:inline으로 흐름을 보존하고, 지표 폭이 갱신 때 흔들리지
 * 않게 tabular-nums만 얹는다(jd-stat 값과 같은 판단).
 */
export default css`
  @layer junds.components {
    jd-live-price-text {
      display: inline;
      font-variant-numeric: tabular-nums;
    }
  }
`;
