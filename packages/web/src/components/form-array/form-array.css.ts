/**
 * jd-form-array CSS — v2 patterns/FormArray(space-y-3 · flex gap-2 items-start ·
 * 삭제 버튼 muted→danger · 점선 primary 추가 버튼)의 토큰 번역.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-form-array {
      display: block;
    }
    jd-form-array > template {
      display: none;
    }

    .jd-form-array {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-3);
    }

    .jd-form-array__list {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-3);
    }

    .jd-form-array__item {
      display: flex;
      align-items: flex-start;
      gap: var(--jd-space-2);
    }
    .jd-form-array__control {
      flex: 1;
      min-width: 0;
    }

    .jd-form-array__remove {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-block-start: var(--jd-space-1);
      padding: var(--jd-space-2);
      border: 0;
      background: none;
      color: var(--jd-color-muted);
      cursor: pointer;
      border-radius: var(--jd-radius-md);
      transition: color var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-form-array__remove[hidden] {
      display: none;
    }
    .jd-form-array__remove:hover {
      color: var(--jd-color-danger);
    }
    .jd-form-array__remove:focus-visible {
      outline: var(--jd-border-medium) solid
        color-mix(in srgb, var(--jd-color-danger) 40%, transparent);
      outline-offset: 2px;
    }

    .jd-form-array__add {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      padding: var(--jd-space-2) var(--jd-space-3);
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-sm);
      color: var(--jd-color-primary-ink);
      background: none;
      cursor: pointer;
      border: var(--jd-border-thin) dashed
        color-mix(in srgb, var(--jd-color-primary) 30%, transparent);
      border-radius: var(--jd-radius-lg);
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-form-array__add[hidden] {
      display: none;
    }
    .jd-form-array__add:hover {
      background: color-mix(in srgb, var(--jd-color-primary) 5%, transparent);
    }
    .jd-form-array__add:focus-visible {
      outline: var(--jd-border-medium) solid
        color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
      outline-offset: 2px;
    }
    .jd-form-array__add > svg {
      flex-shrink: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-form-array__remove,
      .jd-form-array__add {
        transition: none;
      }
    }
  }
`;
