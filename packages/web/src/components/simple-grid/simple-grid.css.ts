import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  /* v2 기본값: cols=1, gap=4(16px) */
  jd-simple-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: var(--jd-space-4);
  }
}`;
