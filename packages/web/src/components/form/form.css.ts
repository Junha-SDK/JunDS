/**
 * jd-form CSS — v2 patterns/Form(<form className="space-y-4">)의 토큰 번역.
 * 세로 스택 + 16px 거터. 시각 요소는 없다(값·제출 관장 컨테이너).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-form { display: block; }
  .jd-form { display: flex; flex-direction: column; gap: var(--jd-space-4); }
}`;
