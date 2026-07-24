import { css } from "../../core/styles.js";

/**
 * jd-address-input CSS — v2 composites/AddressInput 토큰 번역.
 * v2 값: space-y-2 · 우편번호 w-28 · 전 칸 h-9/px-3/text-sm/rounded-lg ·
 * 읽기전용 칸 bg-gray-50 · 상세 칸 bg-white + focus primary 글로우 ·
 * 검색 버튼 h-9/px-4/font-medium/bg-primary/text-white.
 * gray-50은 대응 토큰 부재로 --jd-color-card-hover 근사 번역(DEC-025-4 선례),
 * text-white는 배경이 항상 primary라 #fff 리터럴 승계(switch 썸 선례).
 */
export default css`
@layer junds.components {
  jd-address-input {
    display: flex; flex-direction: column; gap: var(--jd-space-2);
  }
  jd-address-input[disabled] { opacity: var(--jd-opacity-50); }

  .jd-address-input__row { display: flex; gap: var(--jd-space-2); }

  .jd-address-input__field {
    box-sizing: border-box; margin: 0; width: 100%;
    height: 2.25rem; padding-inline: var(--jd-space-3);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-md);
    color: var(--jd-color-foreground);
    background: var(--jd-color-card-hover);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    transition: border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
                box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-address-input__field::placeholder { color: var(--jd-color-muted-light); }
  .jd-address-input__field:disabled { cursor: not-allowed; }
  .jd-address-input__field:read-only { cursor: default; }

  .jd-address-input__zonecode {
    width: 7rem; flex: 0 0 auto; font-variant-numeric: tabular-nums;
  }

  /* 유일하게 편집 가능한 칸 — 카드 배경 + 포커스 글로우 */
  .jd-address-input__detail { background: var(--jd-color-card); }
  .jd-address-input__detail:focus {
    outline: none; border-color: var(--jd-color-primary);
    box-shadow: var(--jd-shadow-focus-ring);
  }

  .jd-address-input__search {
    flex: 0 0 auto; margin: 0; border: 0;
    height: 2.25rem; padding-inline: var(--jd-space-4);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-md);
    font-weight: var(--jd-weight-medium);
    color: #fff; background: var(--jd-color-primary);
    border-radius: var(--jd-radius-lg); cursor: pointer;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-address-input__search:hover:not(:disabled) {
    background: var(--jd-color-primary-hover);
  }
  .jd-address-input__search:focus-visible {
    outline: var(--jd-border-medium) solid
      color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    outline-offset: 2px;
  }
  .jd-address-input__search:disabled {
    opacity: var(--jd-opacity-50); cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-address-input__field, .jd-address-input__search { transition: none; }
  }
}`;
