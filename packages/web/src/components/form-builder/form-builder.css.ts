/**
 * jd-form-builder CSS — v2 patterns/FormBuilder(flex-col gap-4 · grid columns 1|2 ·
 * textarea는 2컬럼에서 col-span-2 · 하단 액션 행)의 토큰 번역.
 * 네이티브 <input>은 jd-text-field의 입력 시각을 그대로 계승한다(동일 어휘 유지).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-form-builder {
      display: block;
    }
    .jd-form-builder {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-4);
    }

    .jd-form-builder__grid {
      display: grid;
      gap: var(--jd-space-4);
      grid-template-columns: 1fr;
    }
    @media (min-width: 40rem) {
      jd-form-builder[columns="2"] .jd-form-builder__grid {
        grid-template-columns: 1fr 1fr;
      }
      jd-form-builder[columns="2"] .jd-form-builder__grid > [data-span] {
        grid-column: 1 / -1;
      }
    }

    .jd-form-builder__footer {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      padding-block-start: var(--jd-space-2);
    }

    /* 네이티브 입력 — jd-text-field[md] 입력 시각과 동일 */
    .jd-form-builder__input {
      width: 100%;
      box-sizing: border-box;
      margin: 0;
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
      background: var(--jd-color-control-surface);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      transition: background-color var(--jd-duration-normal) var(--jd-easing-ease-out),
        border-color var(--jd-duration-normal) var(--jd-easing-ease-out),
        color var(--jd-duration-normal) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out),
        opacity var(--jd-duration-normal) var(--jd-easing-ease-out),
        scale var(--jd-duration-normal) var(--jd-easing-ease-out),
        transform var(--jd-duration-normal) var(--jd-easing-ease-out);
      height: 2.5rem;
      padding-inline: var(--jd-space-3-5);
      font-size: var(--jd-text-md);
      border-radius: var(--jd-radius-xl);
    }
    .jd-form-builder__input::placeholder {
      color: var(--jd-color-neutral-400);
    }
    .jd-form-builder__input:focus {
      outline: none;
      border-color: var(--jd-color-primary);
      background: var(--jd-color-card);
      box-shadow: var(--jd-shadow-focus-ring), var(--jd-shadow-xs);
    }
    .jd-form-builder__input:disabled {
      opacity: var(--jd-opacity-40);
      cursor: not-allowed;
      background: var(--jd-color-card-hover);
    }
    /* jd-form-field가 aria-invalid를 세우면 danger 테두리 */
    .jd-form-builder__input[aria-invalid="true"] {
      border-color: var(--jd-color-danger);
    }
    .jd-form-builder__input[aria-invalid="true"]:focus {
      border-color: var(--jd-color-danger);
      box-shadow: var(--jd-shadow-focus-ring-danger), var(--jd-shadow-xs);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-form-builder__input {
        transition: none;
      }
    }
  }
`;
