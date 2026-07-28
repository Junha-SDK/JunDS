import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    /* v2 기본값: wrap=wrap, gap="sm"(8px), align=center — jd-group과 동형(별칭 파생) */
    jd-wrap {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--jd-space-2);
    }
    jd-wrap[no-wrap] {
      flex-wrap: nowrap;
    }
  }
`;
