import { css } from "../../core/styles.js";

/**
 * v2: div relative w-full h-full overflow-hidden + style backgroundColor,
 * canvas absolute inset-0. 배경색은 --jd-starfield-bg(호스트 인라인)로 전달.
 * 별밭은 보통 배경 레이어라 부모가 크기를 준다(h-full).
 */
export default css`
@layer junds.base {
  jd-starfield:not(:defined) { display: block; }
}
@layer junds.components {
  jd-starfield {
    display: block; position: relative;
    width: 100%; height: 100%;
    overflow: hidden;
    background: var(--jd-starfield-bg, #0b0d1a);
  }
  .jd-starfield__canvas {
    position: absolute; inset: 0;
    display: block;
  }
}`;
