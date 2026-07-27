import { css } from "../../core/styles.js";

/**
 * jd-form-field CSS — v2 composites/FormField(flex-col gap-1.5 · Label · text-xs 에러/힌트)
 * 의 토큰 번역. 에러 행은 jd-text-field와 같은 어휘(아이콘 + danger 텍스트).
 * v2 힌트의 text-muted-light(2.7:1)는 AA 미달 → --jd-color-muted (DEC-027 선례).
 */
export default css`
@layer junds.components {
  jd-form-field {
    display: flex; flex-direction: column; gap: var(--jd-space-1-5);
  }

  .jd-form-field__label {
    font-family: var(--jd-font-sans); font-size: var(--jd-text-md);
    font-weight: var(--jd-weight-medium); color: var(--jd-color-foreground);
  }
  .jd-form-field__label[hidden] { display: none; }
  jd-form-field[required] > .jd-form-field__label::after {
    content: "*"; margin-inline-start: var(--jd-space-0-5); color: var(--jd-color-danger-ink);
  }

  .jd-form-field__error {
    display: flex; align-items: center; gap: var(--jd-space-1); margin: 0;
    font-family: var(--jd-font-sans); font-size: var(--jd-text-xs);
    color: var(--jd-color-danger-ink);
  }
  .jd-form-field__error[hidden] { display: none; }
  .jd-form-field__error > svg { flex-shrink: 0; }

  .jd-form-field__hint {
    margin: 0; font-family: var(--jd-font-sans); font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
  }
  .jd-form-field__hint[hidden] { display: none; }
}`;
