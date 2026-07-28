/**
 * jd-icon CSS — v2 primitives/Icon(inline-block shrink-0). 치수는 element가
 * width/height attribute로 준다(SVG 고유 속성 — CSS 규칙 없이도 정확).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-icon {
      display: inline-flex;
      flex-shrink: 0;
    }
    .jd-icon {
      display: block;
    }
  }
`;
