import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  /* v2 기본값: axis=vertical, size=4(16px) — 값은 update() 인라인이 담당 */
  jd-spacer {
    display: block;
    flex-shrink: 0;
    padding-block: var(--jd-space-4);
  }
  jd-spacer[axis="horizontal"] {
    display: inline-block;
    padding-block: 0;
    padding-inline: var(--jd-space-4);
  }
}`;
