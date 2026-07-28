/**
 * jd-copy-button CSS — v2 primitives/CopyButton(icon: 정사각 고스트 · button:
 * 테두리 + 라벨, 완료 시 success 색)의 토큰 번역.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-copy-button {
      display: inline-flex;
    }

    .jd-copy-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--jd-space-1-5);
      box-sizing: border-box;
      font-family: var(--jd-font-sans);
      font-weight: var(--jd-weight-medium);
      border: 0;
      background: none;
      cursor: pointer;
      color: var(--jd-color-muted);
      transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out),
        border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
        color var(--jd-duration-fast) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out),
        opacity var(--jd-duration-fast) var(--jd-easing-ease-out),
        scale var(--jd-duration-fast) var(--jd-easing-ease-out),
        transform var(--jd-duration-fast) var(--jd-easing-ease-out);
      /* icon 변형 기본 — md */
      width: 1.75rem;
      height: 1.75rem;
      padding: 0;
      border-radius: var(--jd-radius-md);
    }
    .jd-copy-button:hover:not(:disabled) {
      color: var(--jd-color-foreground);
      background: var(--jd-color-card-hover);
    }
    /* 눌린 면은 빛을 잃는다 — 복사는 되돌아오는 화면 변화가 2초 뒤에나 오므로
     누른 순간의 응답이 없으면 눌렸는지 알 수 없다 */
    .jd-copy-button:active:not(:disabled) {
      scale: 0.97;
      background: color-mix(in srgb, var(--jd-color-muted) 16%, transparent);
    }
    /* 코드 블록·표 셀 안에 끼어 사는 버튼이라 키보드로 도달했을 때가 특히 잘 안 보인다 */
    .jd-copy-button:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }
    .jd-copy-button:disabled {
      opacity: var(--jd-opacity-50);
      cursor: not-allowed;
    }
    .jd-copy-button__icon {
      display: flex;
    }
    .jd-copy-button__label[hidden] {
      display: none;
    }

    jd-copy-button[size="sm"] .jd-copy-button {
      width: 1.5rem;
      height: 1.5rem;
    }
    jd-copy-button[copied] .jd-copy-button {
      color: var(--jd-color-success);
    }

    /* button 변형 — 테두리 + 라벨 */
    jd-copy-button[variant="button"] .jd-copy-button {
      width: auto;
      height: auto;
      color: var(--jd-color-foreground);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-lg);
      padding: var(--jd-space-1-5) var(--jd-space-3);
      font-size: var(--jd-text-sm);
    }
    jd-copy-button[variant="button"][size="sm"] .jd-copy-button {
      padding: var(--jd-space-1) var(--jd-space-2);
      font-size: var(--jd-text-xs);
    }
    jd-copy-button[variant="button"][copied] .jd-copy-button {
      color: var(--jd-color-success);
      border-color: color-mix(in srgb, var(--jd-color-success) 30%, transparent);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-copy-button {
        transition: none;
      }
    }
  }
`;
