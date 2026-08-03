import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    /* v2 기본값: direction=row, wrap=wrap, gap="sm"(8px), align=center */
    jd-group {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--jd-space-2);
    }
    jd-group[no-wrap] {
      flex-wrap: nowrap;
    }
  }
`;
