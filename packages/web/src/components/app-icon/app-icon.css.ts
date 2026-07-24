import { css } from "../../core/styles.js";

/**
 * v2 값: 인라인 SVG 아이콘, 크기는 width/height 속성으로 직접 실린다(레이아웃은
 * inline-flex 정렬만). currentColor 상속 — 부모 색을 그대로 받는다.
 */
export default css`
@layer junds.components {
  jd-app-icon {
    display: inline-flex; flex-shrink: 0;
    line-height: 0; vertical-align: middle;
  }
  jd-app-icon > svg.jd-app-icon { display: block; }
}`;
