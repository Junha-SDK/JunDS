/**
 * jd-year-picker 컴포넌트 CSS.
 * 카드·헤더·격자·셀은 GRID_PICKER_CSS(공용)가 담는다 — jd-month-picker와 시각 동일.
 * 연도 셀은 4자리라 월 셀보다 좁으면 줄바꿈이 나서 자간만 조인다.
 * 보간 근거는 core/grid-picker.styles.ts 주석 참조.
 */
import { css } from "../../core/styles.js";
import { GRID_PICKER_CSS } from "../../core/grid-picker.styles.js";

export default css`
  @layer junds.components {
    ${GRID_PICKER_CSS}

    jd-year-picker > .jd-grid-picker__grid > .jd-grid-picker__cell {
      padding-inline: var(--jd-space-1);
      font-variant-numeric: tabular-nums;
    }
    jd-year-picker > .jd-grid-picker__header > .jd-grid-picker__label {
      font-variant-numeric: tabular-nums;
    }
  }
`;
