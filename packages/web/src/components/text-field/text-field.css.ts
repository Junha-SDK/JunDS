/**
 * jd-text-field 컴포넌트 CSS.
 * v2 ds/primitives/Input(size sm/md/lg·error·focus 글로우) + ds/composites/FormField
 * (Label·에러 메시지 행)의 시각을 --jd-* 토큰으로 의미 번역.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-text-field { display: flex; flex-direction: column; gap: var(--jd-space-1-5); }

  .jd-text-field__label {
    font-size: var(--jd-text-md); font-weight: var(--jd-weight-medium);
    font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
  }
  .jd-text-field__label[hidden] { display: none; }
  jd-text-field[required] > .jd-text-field__label::after {
    content: "*"; margin-inline-start: var(--jd-space-0-5); color: var(--jd-color-danger);
  }

  .jd-text-field__input {
    width: 100%; box-sizing: border-box; margin: 0;
    font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
    background: color-mix(in srgb, var(--jd-color-card) 80%, transparent);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    backdrop-filter: blur(4px);
    transition: all var(--jd-duration-normal) var(--jd-easing-ease-out);
    /* size 기본 md — 디폴트는 attribute 미반영(§1.3)이라 base가 담당. v2: 40px */
    height: 2.5rem; padding-inline: var(--jd-space-3-5);
    font-size: var(--jd-text-md); border-radius: var(--jd-radius-xl);
  }
  .jd-text-field__input::placeholder {
    color: color-mix(in srgb, var(--jd-color-muted-light) 60%, transparent);
  }
  .jd-text-field__input:focus {
    outline: none; border-color: var(--jd-color-primary);
    background: var(--jd-color-card);
    box-shadow: var(--jd-shadow-focus-ring), var(--jd-shadow-xs);
  }
  .jd-text-field__input:disabled {
    opacity: var(--jd-opacity-40); cursor: not-allowed;
    background: var(--jd-color-card-hover);
  }

  /* size — v2 Input: sm 32px / lg 48px (md는 base) */
  jd-text-field[size="sm"] > .jd-text-field__input {
    height: 2rem; padding-inline: var(--jd-space-3);
    font-size: var(--jd-text-xs); border-radius: var(--jd-radius-lg);
  }
  jd-text-field[size="lg"] > .jd-text-field__input {
    height: 3rem; padding-inline: var(--jd-space-4);
    font-size: var(--jd-text-lg); border-radius: var(--jd-radius-xl);
  }

  /* error 상태 — 호스트 error 속성(reflect, 비어있지 않을 때만)이 스타일 훅 */
  jd-text-field[error]:not([error=""]) > .jd-text-field__input {
    border-color: var(--jd-color-danger);
  }
  jd-text-field[error]:not([error=""]) > .jd-text-field__input:focus {
    border-color: var(--jd-color-danger);
    box-shadow: var(--jd-shadow-focus-ring-danger), var(--jd-shadow-xs);
  }

  .jd-text-field__error {
    display: flex; align-items: center; gap: var(--jd-space-1); margin: 0;
    font-size: var(--jd-text-xs); font-family: var(--jd-font-sans);
    color: var(--jd-color-danger);
  }
  .jd-text-field__error[hidden] { display: none; }
  .jd-text-field__error > svg { flex-shrink: 0; }

  @media (prefers-reduced-motion: reduce) {
    .jd-text-field__input { transition: none; }
  }
}`;
