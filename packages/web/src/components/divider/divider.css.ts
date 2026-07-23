import { css } from "../../core/styles.js";

/**
 * v2 CoreDivider 기본값: 가로 = 1px 라인 + my 4(16px), 세로 = 1px 세로줄(여백 없음),
 * 라벨 = 라인·라벨·라인 3분할(gap 12px, 라벨 xs·medium·muted).
 */
export default css`
@layer junds.components {
  jd-divider {
    display: block;
    height: 1px;
    background-color: var(--jd-color-border);
    margin-block: var(--jd-space-4);
  }
  jd-divider[orientation="vertical"] {
    display: inline-block;
    width: 1px;
    height: auto;
    align-self: stretch;
    margin-block: 0;
  }
  jd-divider[label]:not([label=""]) {
    display: flex;
    align-items: center;
    gap: var(--jd-space-3);
    height: auto;
    background-color: transparent;
  }
  .jd-divider__line {
    flex: 1;
    height: 1px;
    background-color: var(--jd-color-border);
  }
  .jd-divider__label {
    flex-shrink: 0;
    font-size: 0.75rem;
    font-weight: var(--jd-weight-medium);
    color: var(--jd-color-muted);
  }
}`;
