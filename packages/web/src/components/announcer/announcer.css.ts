/**
 * jd-announcer CSS — live region은 보이지 않아야 하지만 접근성 트리에는 남아야 한다
 * (display:none이면 AT도 못 읽는다). v2 인라인 스타일과 동일 관용구.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-announcer { display: contents; }
  .jd-announcer__region {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }
}`;
