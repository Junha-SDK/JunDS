/**
 * jd-holding-form-modal CSS — v2 finance/HoldingFormModal.
 *
 * 파생 태그는 modal.css의 `jd-modal[…]` 태그 규칙을 물려받지 못한다(태그 셀렉터라
 * 캐스케이드 안 됨 — drawer/action-sheet와 동일 사정). 그래서 호스트 open 오버레이
 * 표시를 여기서 다시 선언한다. `.jd-modal__backdrop`/`.jd-modal__panel` 클래스 규칙은
 * 클래스 셀렉터라 그대로 적용되므로 카드 크롬·그림자는 상속된다.
 *
 * bm-accent-strong → primary, bm-soft-100 → card-hover, 입력 잠금 배경도 soft.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-holding-form-modal:not(:defined) { display: none; }
  jd-holding-form-modal { display: none; }
  jd-holding-form-modal[open] {
    display: flex; position: fixed; inset: 0; z-index: var(--jd-z-modal);
    align-items: center; justify-content: center; padding: var(--jd-space-4);
  }
  /* v2 백드롭 톤(slate-900/45) */
  jd-holding-form-modal > .jd-modal__backdrop { background: rgba(15, 23, 42, 0.45); }
  jd-holding-form-modal > .jd-modal__panel {
    max-width: min(28rem, calc(100vw - 2rem));
    overflow: hidden;
    font-variant-numeric: tabular-nums;
  }

  .jd-hfm__header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px var(--jd-space-5);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-hfm__title { margin: 0; font-size: 15px; font-weight: 800; }
  .jd-hfm__close {
    display: inline-grid; place-items: center;
    width: 28px; height: 28px; padding: 0;
    border: none; border-radius: var(--jd-radius-full);
    background: transparent; color: var(--jd-color-muted); cursor: pointer;
  }
  .jd-hfm__close:hover { background: var(--jd-color-card-hover); }

  .jd-hfm__body {
    display: flex; flex-direction: column; gap: var(--jd-space-4);
    padding: var(--jd-space-5);
  }
  .jd-hfm__field { position: relative; display: flex; flex-direction: column; gap: var(--jd-space-1-5); }
  .jd-hfm__label {
    font-size: 11.5px; font-weight: 700; color: var(--jd-color-muted);
  }
  .jd-hfm__label--row { display: flex; align-items: center; justify-content: space-between; }

  .jd-hfm__input {
    width: 100%; height: 40px; padding: 0 var(--jd-space-3);
    font-family: inherit; font-size: 13.5px; font-weight: 700;
    color: var(--jd-color-foreground);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    outline: none;
  }
  .jd-hfm__input:focus-visible { box-shadow: var(--jd-shadow-focus-ring); }
  .jd-hfm__input[data-locked], .jd-hfm__input:disabled {
    background: var(--jd-color-card-hover); cursor: not-allowed;
  }
  .jd-hfm__num {
    text-align: right; font-variant-numeric: tabular-nums;
    -moz-appearance: textfield;
  }
  .jd-hfm__num::-webkit-outer-spin-button,
  .jd-hfm__num::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

  .jd-hfm__fill {
    padding: 0; border: none; background: transparent; cursor: pointer;
    font-size: 10.5px; font-weight: 700; color: var(--jd-color-primary);
  }
  .jd-hfm__fill[hidden] { display: none; }

  .jd-hfm__suggest {
    position: absolute; inset-inline: 0; top: calc(100% + var(--jd-space-1));
    margin: 0; padding: 0; list-style: none; z-index: var(--jd-z-dropdown);
    max-height: 240px; overflow-y: auto;
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    box-shadow: var(--jd-shadow-lg);
  }
  .jd-hfm__suggest[hidden] { display: none; }
  .jd-hfm__suggest-item {
    display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-2);
    width: 100%; padding: var(--jd-space-2) var(--jd-space-3);
    border: none; background: transparent; cursor: pointer; text-align: start;
    font-family: inherit;
  }
  .jd-hfm__suggest-item:hover { background: var(--jd-color-card-hover); }
  .jd-hfm__suggest-left {
    display: flex; align-items: center; gap: var(--jd-space-2); min-width: 0;
  }
  .jd-hfm__suggest-name {
    font-size: 13px; font-weight: 700; color: var(--jd-color-foreground);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-hfm__suggest-sector {
    font-size: 11px; color: var(--jd-color-muted);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-hfm__suggest-price {
    flex-shrink: 0; font-size: 12px; font-weight: 600; color: var(--jd-color-muted);
    font-variant-numeric: tabular-nums;
  }

  .jd-hfm__selected {
    font-size: 11px; font-weight: 600; color: var(--jd-color-muted);
  }
  .jd-hfm__selected[hidden] { display: none; }
  .jd-hfm__selected strong { font-weight: 700; color: var(--jd-color-foreground); }

  .jd-hfm__grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: var(--jd-space-3);
  }

  .jd-hfm__summary {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px var(--jd-space-3);
    background: var(--jd-color-card-hover); border-radius: var(--jd-radius-lg);
  }
  .jd-hfm__summary[hidden] { display: none; }
  .jd-hfm__summary-label { font-size: 12px; font-weight: 700; color: var(--jd-color-muted); }
  .jd-hfm__summary-value {
    font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums;
  }

  .jd-hfm__footer {
    display: flex; align-items: center; justify-content: flex-end; gap: var(--jd-space-2);
    padding: 14px var(--jd-space-5);
    border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
    background: var(--jd-color-card-hover);
  }
  .jd-hfm__btn {
    height: 36px; padding: 0 var(--jd-space-4);
    font-family: inherit; font-size: 13px; font-weight: 700;
    border-radius: var(--jd-radius-lg); cursor: pointer;
  }
  .jd-hfm__btn--cancel {
    background: var(--jd-color-card); color: var(--jd-color-foreground);
    border: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-hfm__btn--cancel:hover { background: var(--jd-color-card-hover); }
  .jd-hfm__btn--submit {
    border: none; color: var(--jd-color-card);
    background: var(--jd-color-muted); opacity: .6;
  }
  .jd-hfm__btn--submit[data-valid] {
    background: var(--jd-color-primary); opacity: 1;
  }
  .jd-hfm__btn--submit[data-valid]:hover { background: var(--jd-color-primary-hover); }
  .jd-hfm__btn--submit:disabled { cursor: not-allowed; }
}`;
