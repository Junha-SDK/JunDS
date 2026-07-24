/**
 * jd-affix CSS — v2 composites/Affix(position: fixed + 좌표 객체 + zIndex 40).
 *
 * longhand는 --jd-affix-* 커스텀 프로퍼티를 읽기만 한다. 값 기록은 element.ts의
 * update()가 하며 네 변을 항상 전부 쓰므로, 아래 폴백은 **업그레이드 이전 한 프레임**
 * (FOUC 구간)에서만 쓰인다 — v2 기본값과 같은 우하단 20px.
 *
 * 논리 속성이 아니라 물리 top/bottom/left/right를 쓴다: 프롭 이름 자체가 방향을
 * 명시하는 API라 RTL에서 뒤집히면 `left={16}`이 오른쪽에 붙는 배신이 된다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-affix {
    display: block; box-sizing: border-box;
    position: fixed;
    z-index: var(--jd-affix-z, var(--jd-z-overlay));
    top: var(--jd-affix-top, auto);
    bottom: var(--jd-affix-bottom, 20px);
    left: var(--jd-affix-left, auto);
    right: var(--jd-affix-right, 20px);
  }
}`;
