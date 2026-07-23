import { css } from "../../core/styles.js";

/** v2 값: border+gray-50 배경, 11px mono medium muted, 미세 바닥 그림자 */
export default css`
@layer junds.components {
  jd-kbd { display: inline-flex; }

  .jd-kbd {
    display: inline-flex; align-items: center; gap: var(--jd-space-0-5);
    padding: var(--jd-space-0-5) var(--jd-space-1-5);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-sm);
    background: #f9fafb;
    font-family: var(--jd-font-mono); font-size: 11px;
    font-weight: var(--jd-weight-medium); color: var(--jd-color-muted);
    box-shadow: 0 1px 0 1px rgba(0,0,0,.04);
  }
}`;
