import { css } from "../../core/styles.js";

/** v2는 null 렌더 — 헤드리스 컨트롤러라 시각 표면이 없다. 레이아웃 차지 금지. */
export default css`
@layer junds.components {
  jd-alert-manager { display: none; }
}`;
