import { css } from "../../core/styles.js";

/**
 * jd-inline-edit CSS — v2 composites/InlineEdit 토큰 번역.
 * v2 값: 아래 테두리 2px(표시=transparent, hover=primary/30, focus=primary/40,
 * 편집=primary), 빈 값은 muted + italic, 연필 12px opacity 0→1.
 * 트리거는 <button>이라 폰트·색을 상속시켜 v2의 text-inherit/font-inherit를 재현한다.
 */
export default css`
@layer junds.components {
  jd-inline-edit { display: inline-block; }

  .jd-inline-edit__display { display: inline-block; margin: 0; }
  .jd-inline-edit__display[hidden] { display: none; }

  .jd-inline-edit__trigger {
    display: inline-flex; align-items: center; gap: var(--jd-space-1-5);
    margin: 0; padding: 0; background: none;
    font: inherit; color: inherit; text-align: inherit;
    border: 0; border-block-end: var(--jd-border-medium) solid transparent;
    cursor: pointer;
    transition: border-color var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-inline-edit__trigger:hover {
    border-block-end-color: color-mix(in srgb, var(--jd-color-primary) 30%, transparent);
  }
  .jd-inline-edit__trigger:focus-visible {
    border-block-end-color: color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    outline: var(--jd-border-medium) solid
      color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    outline-offset: 2px;
  }
  .jd-inline-edit__trigger:disabled { cursor: default; }

  /* 빈 값 안내 — muted-light(2.7:1)는 AA 미달이라 muted (DEC-027) */
  .jd-inline-edit__trigger[data-empty] .jd-inline-edit__text {
    color: var(--jd-color-muted); font-style: italic;
  }

  .jd-inline-edit__pencil {
    flex-shrink: 0; color: var(--jd-color-muted); opacity: var(--jd-opacity-0);
    transition: opacity var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-inline-edit__trigger:hover > .jd-inline-edit__pencil,
  .jd-inline-edit__trigger:focus-visible > .jd-inline-edit__pencil {
    opacity: var(--jd-opacity-100);
  }
  .jd-inline-edit__trigger:disabled > .jd-inline-edit__pencil { display: none; }

  .jd-inline-edit__input {
    margin: 0; padding: 0; background: transparent;
    font: inherit; color: inherit;
    border: 0; border-block-end: var(--jd-border-medium) solid var(--jd-color-primary);
    transition: border-color var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-inline-edit__input[hidden] { display: none; }
  .jd-inline-edit__input:disabled { opacity: var(--jd-opacity-50); cursor: not-allowed; }

  @media (prefers-reduced-motion: reduce) {
    .jd-inline-edit__trigger,
    .jd-inline-edit__pencil,
    .jd-inline-edit__input { transition: none; }
  }
}`;
