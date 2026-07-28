/**
 * jd-result CSS — EmptyState 골격 + 큰 상태 아이콘/색.
 * v2 green/red/yellow/blue-500은 의미축이 있어 토큰 참조(DEC-025-1 단서).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-result {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding: var(--jd-space-12) var(--jd-space-6);
      text-align: center;
      font-family: var(--jd-font-sans);
    }

    jd-result .jd-empty-state__icon {
      width: auto;
      height: auto;
      background: none;
      margin-block-end: var(--jd-space-4);
      color: var(--jd-color-info); /* status 기본 info */
    }
    jd-result[status="success"] .jd-empty-state__icon {
      color: var(--jd-color-success);
    }
    jd-result[status="error"] .jd-empty-state__icon {
      color: var(--jd-color-danger);
    }
    jd-result[status="warning"] .jd-empty-state__icon {
      color: var(--jd-color-warning);
    }
    jd-result[status="404"] .jd-empty-state__icon,
    jd-result[status="403"] .jd-empty-state__icon {
      color: var(--jd-color-muted);
    }

    jd-result .jd-empty-state__title {
      font-size: var(--jd-text-xl);
      margin-block-end: var(--jd-space-2);
    }
    jd-result .jd-empty-state__desc {
      max-width: 28rem;
    }
    jd-result > [slot="action"] {
      margin-block-start: var(--jd-space-6);
    }
  }
`;
