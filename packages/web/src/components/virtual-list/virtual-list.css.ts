import { css } from "../../core/styles.js";

/**
 * jd-virtual-list CSS — jd-virtual-scroll 파생. 내부 사이저·항목 클래스
 * (.jd-virtual-scroll__*)는 베이스 시트가 이미 깔았고, 여기서는 **host 규칙만** 다시 쓴다.
 * 호스트 셀렉터는 태그별이라 상속되지 않기 때문(element.ts 판단 2).
 * update()가 세우는 `--_jd-virtual-scroll-height`도 같은 변수를 쓴다 — 파생이 값을 그대로 물려받는다.
 */
export default css`
@layer junds.components {
  jd-virtual-list {
    display: block;
    overflow: auto;
    height: var(--_jd-virtual-scroll-height, auto);
    overscroll-behavior: contain;
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
  }
}`;
