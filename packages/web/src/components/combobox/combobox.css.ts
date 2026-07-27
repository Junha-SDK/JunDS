/**
 * jd-combobox CSS — v2 composites/Combobox의 Tailwind를 --jd-* 토큰으로 의미 번역.
 *
 * v2 값: 컨트롤 h-9 px-3 gap-2 rounded-lg border, focus-within primary + glow,
 * 팝업 mt-1 rounded-lg shadow-lg max-h-60 py-1, 행 px-3 py-2 text-sm,
 * 활성 행 bg-primary-light, 선택 행 text-primary/medium, 설명 text-xs text-muted.
 * v2가 하드코딩한 bg-white/bg-gray-50은 테마 토큰(card / card-hover)으로 번역한다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-combobox {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  /* ── 컨트롤 ─────────────────────────────────────────────── */
  .jd-combobox__control {
    display: flex; align-items: center; gap: var(--jd-space-2);
    box-sizing: border-box; height: 2.25rem;
    padding-inline: var(--jd-space-3);
    cursor: text;
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    transition:
      border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
      box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-combobox__control:focus-within {
    border-color: var(--jd-color-primary);
    box-shadow: var(--jd-shadow-focus-ring);
  }
  jd-combobox[error] > .jd-combobox__control { border-color: var(--jd-color-danger); }
  jd-combobox[error] > .jd-combobox__control:focus-within {
    border-color: var(--jd-color-danger);
    box-shadow: var(--jd-shadow-focus-ring-danger);
  }
  jd-combobox[disabled] > .jd-combobox__control {
    opacity: var(--jd-opacity-50); cursor: not-allowed;
  }

  .jd-combobox__icon { flex-shrink: 0; color: var(--jd-color-muted); }

  .jd-combobox__input {
    flex: 1; min-width: 0; margin: 0; padding: 0;
    border: 0; outline: none; background: transparent;
    font-family: var(--jd-font-sans); font-size: var(--jd-text-md);
    color: var(--jd-color-foreground);
  }
  .jd-combobox__input::placeholder { color: var(--jd-color-muted-light); }
  .jd-combobox__input:disabled { cursor: not-allowed; }

  .jd-combobox__spinner {
    display: inline-flex; flex-shrink: 0;
    width: 14px; height: 14px; color: var(--jd-color-primary-ink);
  }
  .jd-combobox__spinner[hidden] { display: none; }
  .jd-combobox__spinner > svg,
  .jd-combobox__loading > svg {
    width: 100%; height: 100%;
    animation: jd-combobox-spin 1s linear infinite;
  }
  @keyframes jd-combobox-spin { to { transform: rotate(360deg); } }

  /* ── 팝업 ───────────────────────────────────────────────── */
  .jd-combobox__popup {
    position: absolute; top: 100%; inset-inline: 0;
    margin-block-start: var(--jd-space-1);
    z-index: var(--jd-z-dropdown);
    box-sizing: border-box;
    max-height: 15rem; overflow: auto;
    padding-block: var(--jd-space-1);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    box-shadow: var(--jd-shadow-lg);
    transform-origin: top center;
    animation: jd-combobox-pop var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-combobox__popup[hidden] { display: none; }
  @keyframes jd-combobox-pop { from { opacity: 0; transform: scale(0.97); } }

  .jd-combobox__list { list-style: none; margin: 0; padding: 0; }

  .jd-combobox__option {
    display: flex; align-items: center; gap: var(--jd-space-2);
    padding: var(--jd-space-2) var(--jd-space-3);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-md);
    color: var(--jd-color-foreground);
    text-align: start; cursor: pointer;
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-combobox__option:hover { background: var(--jd-color-card-hover); }
  .jd-combobox__option[data-active] { background: var(--jd-color-primary-light); }
  .jd-combobox__option[aria-selected="true"] {
    color: var(--jd-color-primary-ink); font-weight: var(--jd-weight-medium);
  }
  .jd-combobox__option[data-create] { color: var(--jd-color-primary-ink); }
  .jd-combobox__option[data-disabled] {
    opacity: var(--jd-opacity-40); cursor: not-allowed;
  }
  .jd-combobox__option[data-disabled]:hover { background: none; }

  .jd-combobox__option-icon { flex-shrink: 0; }
  .jd-combobox__option-icon[hidden] { display: none; }
  .jd-combobox__option-body {
    display: flex; flex-direction: column; flex: 1; min-width: 0;
  }
  .jd-combobox__option-label {
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-combobox__option-desc {
    font-size: var(--jd-text-xs); color: var(--jd-color-muted);
    font-weight: var(--jd-weight-normal);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-combobox__option-desc[hidden] { display: none; }

  .jd-combobox__option-check {
    display: inline-flex; flex-shrink: 0; margin-inline-start: auto;
    visibility: hidden; color: var(--jd-color-primary-ink);
  }
  .jd-combobox__option[aria-selected="true"] > .jd-combobox__option-check {
    visibility: visible;
  }

  .jd-combobox__empty {
    padding: var(--jd-space-4) var(--jd-space-3);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-md);
    color: var(--jd-color-muted); text-align: center;
  }
  .jd-combobox__empty[hidden] { display: none; }

  .jd-combobox__loading {
    display: flex; align-items: center; justify-content: center;
    padding-block: var(--jd-space-4);
    width: 100%; box-sizing: border-box;
    color: var(--jd-color-primary-ink);
  }
  .jd-combobox__loading[hidden] { display: none; }
  .jd-combobox__loading > svg { width: 16px; height: 16px; }

  @media (prefers-reduced-motion: reduce) {
    .jd-combobox__control,
    .jd-combobox__option { transition: none; }
    .jd-combobox__popup { animation: none; }
    .jd-combobox__spinner > svg,
    .jd-combobox__loading > svg { animation-duration: 1.6s; }
  }
}`;
