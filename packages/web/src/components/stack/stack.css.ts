import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    /* v2 기본값: direction=column, gap="md"(16px) */
    jd-stack {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-4);
    }
  }
`;
