/**
 * jd-checkbox-card-group 컴포넌트 CSS — 호스트 그리드 규칙만 담는다.
 * 카드 시각(.jd-radio-card-group__*)은 기반 시트가 단일 소스다
 * (jd-drawer가 .jd-modal__panel을 공유하는 것과 같은 규약).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-checkbox-card-group {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: var(--jd-space-2);
    font-family: var(--jd-font-sans);
  }
}`;
