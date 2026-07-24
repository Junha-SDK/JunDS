/**
 * jd-tag-input CSS — v2 composites/TagInput의 Tailwind를 --jd-* 토큰으로 의미 번역.
 *
 * v2 값: 루트 flex-wrap + border + rounded-lg, focus-within primary + glow,
 * size sm(min-h-8 gap-1 px-2 text-xs) / md(min-h-9 gap-1.5 px-3 text-sm) /
 * lg(min-h-11 gap-2 px-4 text-base), 칩 bg-primary/10 text-primary rounded-md medium,
 * 칩 size sm 10px·px-1.5 / md text-xs·px-2 / lg text-sm·px-2.5, 입력 min-w-[80px].
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-tag-input {
    display: flex; flex-wrap: wrap; align-items: center;
    box-sizing: border-box;
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    cursor: text;
    transition:
      border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
      box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
    /* size 기본 md */
    min-height: 2.25rem; gap: var(--jd-space-1-5);
    padding-inline: var(--jd-space-3); padding-block: var(--jd-space-1);
    font-size: var(--jd-text-md);
  }
  jd-tag-input:focus-within {
    border-color: var(--jd-color-primary);
    box-shadow: var(--jd-shadow-focus-ring);
  }
  jd-tag-input[error] { border-color: var(--jd-color-danger); }
  jd-tag-input[error]:focus-within {
    border-color: var(--jd-color-danger);
    box-shadow: var(--jd-shadow-focus-ring-danger);
  }
  jd-tag-input[disabled] { opacity: var(--jd-opacity-50); cursor: not-allowed; }

  jd-tag-input[size="sm"] {
    min-height: 2rem; gap: var(--jd-space-1);
    padding-inline: var(--jd-space-2); font-size: var(--jd-text-xs);
  }
  jd-tag-input[size="lg"] {
    min-height: 2.75rem; gap: var(--jd-space-2);
    padding-inline: var(--jd-space-4); font-size: var(--jd-text-lg);
  }

  .jd-tag-input__tag {
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    max-width: 100%;
    border-radius: var(--jd-radius-md);
    font-family: var(--jd-font-sans); font-weight: var(--jd-weight-medium);
    background: color-mix(in srgb, var(--jd-color-primary) 10%, transparent);
    color: var(--jd-color-primary);
    /* 칩 size 기본 md */
    padding: var(--jd-space-0-5) var(--jd-space-2); font-size: var(--jd-text-xs);
  }
  jd-tag-input[size="sm"] .jd-tag-input__tag {
    padding: var(--jd-space-0-5) var(--jd-space-1-5); font-size: 0.625rem;
  }
  jd-tag-input[size="lg"] .jd-tag-input__tag {
    padding: var(--jd-space-1) var(--jd-space-2-5); font-size: var(--jd-text-md);
  }
  .jd-tag-input__tag-label {
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .jd-tag-input__remove {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0; border: 0; background: transparent; color: inherit;
    cursor: pointer;
    transition: color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-tag-input__remove[hidden] { display: none; }
  .jd-tag-input__remove:hover { color: var(--jd-color-danger); }
  .jd-tag-input__remove:focus-visible {
    outline: var(--jd-border-medium) solid
      color-mix(in srgb, currentColor 40%, transparent);
    outline-offset: 1px; border-radius: var(--jd-radius-sm);
  }

  .jd-tag-input__input {
    flex: 1; min-width: 5rem; /* v2 min-w-[80px] */
    margin: 0; padding: 0; border: 0; outline: none;
    background: transparent; color: var(--jd-color-foreground);
    font-family: var(--jd-font-sans); font-size: inherit;
  }
  .jd-tag-input__input::placeholder { color: var(--jd-color-muted); }
  .jd-tag-input__input:disabled { cursor: not-allowed; }

  @media (prefers-reduced-motion: reduce) {
    jd-tag-input,
    .jd-tag-input__remove { transition: none; }
  }
}`;
