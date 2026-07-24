/**
 * jd-sticky CSS — v2 composites/Sticky(class="sticky" + style {top, zIndex:10}).
 *
 * jd-affix와 같은 --jd-affix-* 변수를 읽는다(파생 관계의 명시적 귀결 — element.ts의
 * update()가 공용 기록기다). 다른 것은 position 키워드와 폴백 기본값뿐이다.
 *
 * position: sticky는 **조상의 overflow가 아닌 스크롤 컨테이너 기준**으로 동작하므로
 * 호스트에 별도의 stacking/containment를 만들지 않는다 — display:block만 준다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-sticky {
    display: block; box-sizing: border-box;
    position: sticky;
    z-index: var(--jd-affix-z, var(--jd-z-sticky));
    top: var(--jd-affix-top, 0px);
    bottom: var(--jd-affix-bottom, auto);
    left: var(--jd-affix-left, auto);
    right: var(--jd-affix-right, auto);
  }
}`;
