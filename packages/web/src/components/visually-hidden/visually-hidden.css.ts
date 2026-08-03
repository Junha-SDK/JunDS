/**
 * jd-visually-hidden CSS — v2 primitives/VisuallyHidden의 clip 관용구.
 * v2는 폐기 예정 `clip`을 썼다 — 현행 `clip-path: inset(50%)`로 갱신(같은 효과,
 * 브라우저 지원 동일. B5 file-upload 숨김 input과 같은 선언).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }
  }
`;
