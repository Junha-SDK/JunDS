import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    /* v2 기본값: ratio=16/9, position relative + overflow hidden */
    jd-aspect-ratio-box {
      display: block;
      position: relative;
      overflow: hidden;
      aspect-ratio: 16 / 9;
    }
  }
`;
