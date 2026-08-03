import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    /* v2 기본값: gap="sm"(8px), align=center */
    jd-hstack {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--jd-space-2);
    }
  }
`;
