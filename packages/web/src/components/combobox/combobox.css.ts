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
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      box-sizing: border-box;
      height: 2.25rem;
      padding-inline: var(--jd-space-3);
      cursor: text;
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-lg);
      transition: border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    /* 포커스를 받는 것은 input이지만 그 input은 테두리가 없어 아웃라인을 얹을 면이
     없다 — 표시는 input을 감싼 컨트롤이 대신 낸다(§1 "대체 표시"). 컨트롤 안에
     포커스 가능한 것은 input 하나뿐이라 focus-within은 곧 input의 포커스다. */
    .jd-combobox__control:focus-within {
      border-color: var(--jd-color-primary);
      box-shadow: var(--jd-shadow-focus-ring);
    }
    jd-combobox[error] > .jd-combobox__control {
      border-color: var(--jd-color-danger);
    }
    jd-combobox[error] > .jd-combobox__control:focus-within {
      border-color: var(--jd-color-danger);
      box-shadow: var(--jd-shadow-focus-ring-danger);
    }
    jd-combobox[disabled] > .jd-combobox__control {
      opacity: var(--jd-opacity-50);
      cursor: not-allowed;
    }

    .jd-combobox__icon {
      flex-shrink: 0;
      color: var(--jd-color-muted);
    }

    .jd-combobox__input {
      flex: 1;
      min-width: 0;
      margin: 0;
      padding: 0;
      border: 0;
      outline: none;
      background: transparent;
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-md);
      color: var(--jd-color-foreground);
    }
    .jd-combobox__input::placeholder {
      color: var(--jd-color-muted-light);
    }
    .jd-combobox__input:disabled {
      cursor: not-allowed;
    }

    .jd-combobox__spinner {
      display: inline-flex;
      flex-shrink: 0;
      width: 14px;
      height: 14px;
      color: var(--jd-color-primary-ink);
    }
    .jd-combobox__spinner[hidden] {
      display: none;
    }
    .jd-combobox__spinner > svg,
    .jd-combobox__loading > svg {
      width: 100%;
      height: 100%;
      animation: jd-combobox-spin 1s linear infinite;
    }
    @keyframes jd-combobox-spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* ── 팝업 ───────────────────────────────────────────────── */
    .jd-combobox__popup {
      position: absolute;
      top: 100%;
      inset-inline: 0;
      margin-block-start: var(--jd-space-1);
      z-index: var(--jd-z-dropdown);
      box-sizing: border-box;
      max-height: 15rem;
      overflow: auto;
      padding-block: var(--jd-space-1);
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-lg);
      box-shadow: var(--jd-shadow-lg);
      transform-origin: top center;
      animation: jd-combobox-pop var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-combobox__popup[hidden] {
      display: none;
    }
    @keyframes jd-combobox-pop {
      from {
        opacity: 0;
        transform: scale(0.97);
      }
    }

    .jd-combobox__list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .jd-combobox__option {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      padding: var(--jd-space-2) var(--jd-space-3);
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-md);
      color: var(--jd-color-foreground);
      text-align: start;
      cursor: pointer;
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    /* 아래 세 규칙은 특정도가 같다 — 순서가 곧 서열이다: 눌림 > 활성 행 > 호버 */
    .jd-combobox__option:hover {
      background: var(--jd-color-card-hover);
    }
    /* 키보드 포커스는 input에 남고 이 행은 aria-activedescendant로만 지시된다 —
     즉 이 행의 표시가 §1의 :focus-visible을 대신한다. 배경 틴트만으로는 hover와
     같은 세기라 커서가 지워지므로 포커스 링을 함께 그린다. 팝업이 overflow:auto라
     바깥으로 나가는 아웃라인은 잘린다 — 안쪽으로 눕힌다. */
    .jd-combobox__option[data-active] {
      background: var(--jd-color-primary-light);
      outline: var(--jd-focus-ring);
      outline-offset: calc(-1 * var(--jd-border-medium));
    }
    /* 눌린 행은 빛을 잃는다 — 포인터로 고르는 순간의 유일한 응답이다 */
    .jd-combobox__option:active {
      background: color-mix(in srgb, var(--jd-color-primary) 18%, transparent);
    }
    .jd-combobox__option[aria-selected="true"] {
      color: var(--jd-color-primary-ink);
      font-weight: var(--jd-weight-medium);
    }
    .jd-combobox__option[data-create] {
      color: var(--jd-color-primary-ink);
    }
    .jd-combobox__option[data-disabled] {
      opacity: var(--jd-opacity-40);
      cursor: not-allowed;
    }
    /* 고를 수 없는 행이 호버·눌림에 응답하면 "눌리는데 안 되는" 거짓말이 된다.
     특정도가 한 칸 높아 위 세 규칙을 모두 이긴다. */
    .jd-combobox__option[data-disabled]:hover,
    .jd-combobox__option[data-disabled]:active {
      background: none;
    }

    .jd-combobox__option-icon {
      flex-shrink: 0;
    }
    .jd-combobox__option-icon[hidden] {
      display: none;
    }
    .jd-combobox__option-body {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }
    .jd-combobox__option-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-combobox__option-desc {
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
      font-weight: var(--jd-weight-normal);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .jd-combobox__option-desc[hidden] {
      display: none;
    }

    .jd-combobox__option-check {
      display: inline-flex;
      flex-shrink: 0;
      margin-inline-start: auto;
      visibility: hidden;
      color: var(--jd-color-primary-ink);
    }
    .jd-combobox__option[aria-selected="true"] > .jd-combobox__option-check {
      visibility: visible;
    }

    .jd-combobox__empty {
      padding: var(--jd-space-4) var(--jd-space-3);
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-md);
      color: var(--jd-color-muted);
      text-align: center;
    }
    .jd-combobox__empty[hidden] {
      display: none;
    }

    .jd-combobox__loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-block: var(--jd-space-4);
      width: 100%;
      box-sizing: border-box;
      color: var(--jd-color-primary-ink);
    }
    .jd-combobox__loading[hidden] {
      display: none;
    }
    .jd-combobox__loading > svg {
      width: 16px;
      height: 16px;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-combobox__control,
      .jd-combobox__option {
        transition: none;
      }
      .jd-combobox__popup {
        animation: none;
      }
      .jd-combobox__spinner > svg,
      .jd-combobox__loading > svg {
        animation-duration: 1.6s;
      }
    }
  }
`;
