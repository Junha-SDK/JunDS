import { css } from "../../core/styles.js";

/**
 * v2 값: 래퍼 `relative`, 오버레이 `absolute inset-0 pointer-events-none z-10` +
 * `background-repeat: repeat`. 기본색 rgba(0,0,0,.08)은 변수로 빼서 다크에서 뒤집는다
 * (jd-badge의 [data-jd-theme="dark"] / [data-theme="dark"] 병기 선례).
 */
export default css`
@layer junds.base {
  jd-watermark:not(:defined) { display: block; }
}
@layer junds.components {
  jd-watermark {
    --jd-watermark-color: rgba(0, 0, 0, .08);
    display: block;
    position: relative;
  }
  [data-jd-theme="dark"] jd-watermark,
  [data-theme="dark"] jd-watermark {
    --jd-watermark-color: rgba(255, 255, 255, .08);
  }

  .jd-watermark__layer {
    position: absolute;
    inset: 0;
    z-index: 10;
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
    background-repeat: repeat;
  }
}`;
