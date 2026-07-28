/**
 * jd-error-boundary CSS — v2 primitives/ErrorBoundary 기본 폴백(점선 아닌 danger 테두리
 * 카드 + ⚠ + 제목 + 사유 + 재시도 버튼)의 토큰 번역.
 * 실패 시 children을 감추고 폴백만 보인다 — 노드를 지우지 않으므로 reset이 곧 복원이다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-error-boundary {
      display: block;
    }

    .jd-error-boundary__fallback {
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--jd-space-1);
      padding: var(--jd-space-8);
      box-sizing: border-box;
      text-align: center;
      font-family: var(--jd-font-sans);
      border: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-color-danger) 20%, transparent);
      border-radius: var(--jd-radius-xl);
      background: var(--jd-color-danger-light);
    }
    /* 실패 시에만 폴백 노출 + 나머지 children 은닉 */
    jd-error-boundary[failed] > .jd-error-boundary__fallback {
      display: flex;
    }
    jd-error-boundary[failed] > *:not(.jd-error-boundary__fallback) {
      display: none;
    }

    .jd-error-boundary__icon {
      font-size: var(--jd-text-2xl);
      line-height: var(--jd-leading-none);
      color: var(--jd-color-danger);
    }
    .jd-error-boundary__heading {
      margin: 0;
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-semibold);
      color: var(--jd-color-foreground);
    }
    .jd-error-boundary__message {
      margin: 0 0 var(--jd-space-2);
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
    }
    .jd-error-boundary__message[hidden] {
      display: none;
    }

    .jd-error-boundary__retry {
      padding: var(--jd-space-1-5) var(--jd-space-3);
      font-family: inherit;
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-medium);
      color: #ffffff;
      background: var(--jd-color-danger);
      border: 0;
      border-radius: var(--jd-radius-lg);
      cursor: pointer;
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-error-boundary__retry:hover {
      background: var(--jd-color-danger-hover);
    }
    .jd-error-boundary__retry:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring-danger);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-error-boundary__retry {
        transition: none;
      }
    }
  }
`;
