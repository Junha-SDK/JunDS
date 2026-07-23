import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  /* v2 기본값: gap="md"(16px). align 기본은 stretch(CSS 기본) — 규칙 불필요 */
  jd-vstack {
    display: flex;
    flex-direction: column;
    gap: var(--jd-space-4);
  }
}`;
