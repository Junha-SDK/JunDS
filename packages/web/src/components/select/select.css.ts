/**
 * jd-select CSS — v2 composites/Select의 Tailwind를 --jd-* 토큰으로 의미 번역.
 *
 * v2 치수: 트리거 sm h-8 px-2.5 text-xs rounded-md / md h-9 px-3 text-sm rounded-lg /
 * lg h-11 px-4 text-base rounded-xl, 팝업 max-h-60(15rem) shadow-xl rounded-lg py-1,
 * 행 px-3 py-1.5 text-sm, 선택 행 bg-primary text-white, 활성/호버 bg-primary/10.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-select {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    width: fit-content;
  }
  jd-select[full-width] { display: flex; width: 100%; }

  /* ── 트리거 ─────────────────────────────────────────────── */
  .jd-select__trigger {
    display: flex; align-items: center; justify-content: space-between;
    gap: var(--jd-space-2);
    width: 100%; box-sizing: border-box; margin: 0;
    cursor: pointer; text-align: start;
    font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    transition:
      border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
      box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
    /* size 기본 md — 기본값은 attribute 미반영(§1.3)이라 base가 담당 */
    height: 2.25rem; padding-inline: var(--jd-space-3);
    font-size: var(--jd-text-md); border-radius: var(--jd-radius-lg);
  }
  .jd-select__trigger:focus-visible,
  jd-select[open] > .jd-select__trigger {
    outline: none;
    border-color: var(--jd-color-primary);
    box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-select__trigger:disabled { opacity: var(--jd-opacity-50); cursor: not-allowed; }

  jd-select[size="sm"] > .jd-select__trigger {
    height: 2rem; padding-inline: var(--jd-space-2-5);
    font-size: var(--jd-text-xs); border-radius: var(--jd-radius-md);
  }
  jd-select[size="lg"] > .jd-select__trigger {
    height: 2.75rem; padding-inline: var(--jd-space-4);
    font-size: var(--jd-text-lg); border-radius: var(--jd-radius-xl);
  }

  jd-select[error] > .jd-select__trigger { border-color: var(--jd-color-danger); }
  jd-select[error] > .jd-select__trigger:focus-visible,
  jd-select[error][open] > .jd-select__trigger {
    border-color: var(--jd-color-danger);
    box-shadow: var(--jd-shadow-focus-ring-danger);
  }

  .jd-select__value {
    display: inline-flex; align-items: center; gap: var(--jd-space-2);
    min-width: 0; overflow: hidden;
  }
  .jd-select__value[data-placeholder] { color: var(--jd-color-muted-light); }
  .jd-select__value-icon[hidden] { display: none; }
  .jd-select__value-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .jd-select__chevron {
    width: 1rem; height: 1rem; flex-shrink: 0;
    color: var(--jd-color-muted);
    transition: transform var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  jd-select[open] .jd-select__chevron { transform: rotate(180deg); }

  /* ── 팝업 ───────────────────────────────────────────────── */
  .jd-select__popup {
    position: absolute; top: 100%; inset-inline: 0;
    margin-block-start: var(--jd-space-1);
    z-index: var(--jd-z-dropdown);
    box-sizing: border-box;
    max-height: 15rem; overflow: auto;
    padding-block: var(--jd-space-1);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    box-shadow: var(--jd-shadow-xl);
    transform-origin: top center;
    animation: jd-select-pop var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-select__popup[hidden] { display: none; }
  @keyframes jd-select-pop { from { opacity: 0; transform: scale(0.97); } }

  .jd-select__search {
    position: sticky; top: 0; z-index: 1;
    padding: var(--jd-space-1-5) var(--jd-space-2);
    background: var(--jd-color-card);
  }
  .jd-select__search[hidden] { display: none; }
  .jd-select__search-input {
    width: 100%; box-sizing: border-box; margin: 0;
    padding: var(--jd-space-1) var(--jd-space-2);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-md);
    color: var(--jd-color-foreground); background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-md);
  }
  .jd-select__search-input:focus {
    outline: none; border-color: var(--jd-color-primary);
  }
  .jd-select__search-input::placeholder { color: var(--jd-color-muted-light); }

  /* ── 목록 ───────────────────────────────────────────────── */
  .jd-select__list { list-style: none; margin: 0; padding: 0; }

  .jd-select__option {
    display: flex; align-items: center; gap: var(--jd-space-2);
    padding: var(--jd-space-1-5) var(--jd-space-3);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-md);
    color: var(--jd-color-foreground);
    cursor: pointer;
    transition:
      background var(--jd-duration-fast) var(--jd-easing-ease-out),
      color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-select__option:hover,
  .jd-select__option[data-active] {
    background: color-mix(in srgb, var(--jd-color-primary) 10%, transparent);
    color: var(--jd-color-primary);
  }
  .jd-select__option[aria-selected="true"] {
    background: var(--jd-color-primary);
    color: #fff;
    font-weight: var(--jd-weight-medium);
  }
  .jd-select__option[data-disabled] {
    opacity: var(--jd-opacity-40); cursor: not-allowed;
  }
  .jd-select__option[data-disabled]:hover {
    background: none; color: var(--jd-color-foreground);
  }

  .jd-select__option-icon { flex-shrink: 0; }
  .jd-select__option-icon[hidden] { display: none; }
  .jd-select__option-label {
    flex: 1; min-width: 0;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  /* v2는 선택 행이 bg-primary/text-white인데 체크만 text-primary라 보이지 않았다 */
  .jd-select__option-check {
    display: inline-flex; flex-shrink: 0;
    margin-inline-start: auto;
    visibility: hidden; color: currentColor;
  }
  .jd-select__option-check > svg { width: 1rem; height: 1rem; }
  .jd-select__option[aria-selected="true"] > .jd-select__option-check { visibility: visible; }

  .jd-select__empty {
    padding: var(--jd-space-2) var(--jd-space-3);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-md);
    color: var(--jd-color-muted-light); text-align: center;
  }
  .jd-select__empty[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .jd-select__trigger,
    .jd-select__chevron,
    .jd-select__option { transition: none; }
    .jd-select__popup { animation: none; }
  }
}`;
