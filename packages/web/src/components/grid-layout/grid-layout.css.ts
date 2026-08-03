import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    /* v2 기본값: cols=1, gap="md"(16px) */
    jd-grid-layout {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: var(--jd-space-4);
    }
  }
`;
