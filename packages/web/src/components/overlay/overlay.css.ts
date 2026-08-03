import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    /* v2 기본값: inset 0 절대 배치 + 양축 중앙(center=true), blur는 backdrop 4px */
    jd-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    jd-overlay[no-center] {
      display: block;
    }
    jd-overlay[blur] {
      backdrop-filter: blur(4px);
    }
  }
`;
