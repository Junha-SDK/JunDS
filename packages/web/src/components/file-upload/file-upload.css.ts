/**
 * jd-file-upload CSS — v2 primitives/FileUpload(점선 드롭존 · 드래그 중 강조 ·
 * 아이콘 + 설명 + 힌트)의 토큰 번역. v2 primary-light/30·40 알파 배경은 color-mix.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-file-upload { display: block; width: 100%; }

  /* 네이티브 피커는 시각적으로 숨기되 접근성 트리에는 남긴다 */
  .jd-file-upload__input {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  .jd-file-upload__zone {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: var(--jd-space-2); padding: var(--jd-space-8);
    box-sizing: border-box; cursor: pointer;
    border: var(--jd-border-medium) dashed var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    transition: border-color var(--jd-duration-normal) var(--jd-easing-ease-out),
                background var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-file-upload__zone:hover {
    border-color: color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    background: color-mix(in srgb, var(--jd-color-primary-light) 30%, transparent);
  }
  .jd-file-upload__zone:focus-visible {
    outline: none; border-color: var(--jd-color-primary);
    box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-file-upload__zone[data-drag] {
    border-color: var(--jd-color-primary);
    background: color-mix(in srgb, var(--jd-color-primary-light) 40%, transparent);
  }
  .jd-file-upload__zone[aria-disabled="true"] {
    opacity: var(--jd-opacity-50); cursor: not-allowed;
  }
  jd-file-upload[error]:not([error=""]) .jd-file-upload__zone {
    border-color: color-mix(in srgb, var(--jd-color-danger) 40%, transparent);
  }

  .jd-file-upload__icon { display: flex; color: var(--jd-color-muted-light); }
  .jd-file-upload__desc {
    margin: 0; text-align: center; font-family: var(--jd-font-sans);
    font-size: var(--jd-text-sm); color: var(--jd-color-muted);
  }
  .jd-file-upload__hint {
    margin: 0; font-family: var(--jd-font-sans);
    font-size: var(--jd-text-xs); color: var(--jd-color-muted);
  }
  .jd-file-upload__hint[hidden] { display: none; }

  .jd-file-upload__trigger { display: inline-flex; cursor: pointer; }

  .jd-file-upload__error {
    margin: var(--jd-space-1-5) 0 0; font-family: var(--jd-font-sans);
    font-size: var(--jd-text-xs); color: var(--jd-color-danger-ink);
  }
  .jd-file-upload__error[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .jd-file-upload__zone { transition: none; }
  }
}`;
