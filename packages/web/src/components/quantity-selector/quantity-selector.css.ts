/**
 * jd-quantity-selector CSS — v2 composites/QuantitySelector의 시각을 토큰으로 번역.
 *
 * 파생 CSS 규약(jd-drawer 선례): 베이스의 **클래스 규칙**(`.jd-number-input__step`,
 * `.jd-number-input__input`)은 태그와 무관하게 상속되고, **호스트 태그 셀렉터**로
 * 쓰인 컨테이너·size 분기만 새 태그로 다시 건다.
 *
 * v2 값: 테두리 박스 rounded-md, 버튼 정사각 sm 28 / md 36 / lg 44px,
 * 입력 폭 sm 36 / md 48 / lg 56px, 글자 xs/sm/base, tabular-nums, medium.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-quantity-selector {
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      overflow: hidden;
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-md); /* v2 rounded-md */
    }
    jd-quantity-selector:focus-within {
      border-color: var(--jd-color-primary);
      box-shadow: var(--jd-shadow-focus-ring);
    }
    jd-quantity-selector[error] {
      border-color: var(--jd-color-danger);
    }
    jd-quantity-selector[error]:focus-within {
      box-shadow: var(--jd-shadow-focus-ring-danger);
    }
    jd-quantity-selector[disabled] {
      opacity: var(--jd-opacity-50);
    }

    /* size 기본 md — 버튼 36px 정사각 · 입력 48px 폭 */
    jd-quantity-selector .jd-number-input__step {
      width: 2.25rem;
      height: 2.25rem;
    }
    jd-quantity-selector .jd-number-input__input {
      width: 3rem;
      height: 2.25rem;
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-medium);
    }
    jd-quantity-selector[size="sm"] .jd-number-input__step {
      width: 1.75rem;
      height: 1.75rem;
    }
    jd-quantity-selector[size="sm"] .jd-number-input__input {
      width: 2.25rem;
      height: 1.75rem;
      font-size: var(--jd-text-xs);
    }
    jd-quantity-selector[size="lg"] .jd-number-input__step {
      width: 2.75rem;
      height: 2.75rem;
    }
    jd-quantity-selector[size="lg"] .jd-number-input__input {
      width: 3.5rem;
      height: 2.75rem;
      font-size: var(--jd-text-md);
    }

    /* readonly 모드에서는 스텝 버튼이 유일한 키보드 경로 — 포커스 링이 반드시 보여야 한다.
     호스트가 overflow:hidden이라 바깥쪽 아웃라인은 잘린다 → 안쪽으로 그린다. */
    jd-quantity-selector .jd-number-input__step:focus-visible {
      outline: var(--jd-border-medium) solid var(--jd-color-primary);
      outline-offset: -2px;
    }
    jd-quantity-selector .jd-number-input__input:read-only {
      cursor: default;
    }
  }
`;
