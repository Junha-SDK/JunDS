/**
 * jd-month-picker 컴포넌트 CSS.
 * 카드·헤더·격자·셀은 GRID_PICKER_CSS(공용)가 담고, 여기서는 월 격자 고유값만 얹는다.
 * 보간 근거는 core/grid-picker.styles.ts 주석 참조.
 */
import { css } from "../../core/styles.js";
import { GRID_PICKER_CSS } from "../../core/grid-picker.styles.js";

export default css`
@layer junds.components {
${GRID_PICKER_CSS}
}`;
