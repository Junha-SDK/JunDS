/**
 * jd-number-input CSS — v2 primitives/NumberInput의 시각을 --jd-* 토큰으로 번역.
 * v2: inline-flex 테두리 박스 + 좌우 27px 스텝 버튼, focus-within 글로우.
 * size는 v2 NumberInput 고유 스케일(h-8/h-9/h-11) — Input(32/40/48)과 다르다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-number-input {
      display: inline-flex;
      box-sizing: border-box;
      overflow: hidden;
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-lg);
    }
    /* 포커스를 받는 것은 안쪽 input이지만 그 input은 테두리가 없다 — 표시는 테두리를
     가진 호스트가 대신 낸다(§1 "대체 표시"). Tab이 닿는 것은 input 하나뿐이라
     focus-within은 곧 input의 포커스다. */
    jd-number-input:focus-within {
      border-color: var(--jd-color-primary);
      box-shadow: var(--jd-shadow-focus-ring);
    }
    jd-number-input[error] {
      border-color: var(--jd-color-danger);
    }
    jd-number-input[error]:focus-within {
      box-shadow: var(--jd-shadow-focus-ring-danger);
    }
    jd-number-input[disabled] {
      opacity: var(--jd-opacity-50);
    }

    .jd-number-input__step {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      padding: 0;
      border: 0;
      background: none;
      color: var(--jd-color-muted);
      cursor: pointer;
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out),
        color var(--jd-duration-fast) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-number-input__step[hidden] {
      display: none;
    }
    .jd-number-input__step:hover:not(:disabled) {
      background: var(--jd-color-card-hover);
      color: var(--jd-color-foreground);
    }
    /* 눌린 면은 빛을 잃는다. 버튼이 컨트롤 테두리에 딱 맞물려 있어 scale은 틈을
     만든다 — 면을 눌러 넣는 인셋 그림자로 대신한다. */
    .jd-number-input__step:active:not(:disabled) {
      background: var(--jd-color-border-light);
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    /* tabIndex=-1이라 Tab으로는 닿지 않지만 클릭·명령형 focus()로는 포커스를 받는다.
     호스트가 overflow:hidden이라 바깥 아웃라인도 바깥 그림자도 잘린다 — 안쪽 링. */
    .jd-number-input__step:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: calc(-1 * var(--jd-border-medium));
    }
    .jd-number-input__step:disabled {
      opacity: var(--jd-opacity-30);
      cursor: not-allowed;
    }
    /* v2: 좌 버튼은 오른쪽 구분선, 우 버튼은 왼쪽 구분선 */
    .jd-number-input__step[data-dir="-1"] {
      border-inline-end: var(--jd-border-thin) solid var(--jd-color-border);
    }
    .jd-number-input__step[data-dir="1"] {
      border-inline-start: var(--jd-border-thin) solid var(--jd-color-border);
    }

    .jd-number-input__input {
      width: 4rem;
      min-width: 0;
      margin: 0;
      padding: 0;
      border: 0;
      outline: none;
      background: transparent;
      text-align: center;
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
      font-variant-numeric: tabular-nums;
      /* 네이티브 스피너 제거 — 증감은 자체 버튼 (v2 [appearance:textfield]) */
      appearance: textfield;
      -moz-appearance: textfield;
      height: 2.25rem;
      font-size: var(--jd-text-sm);
    }
    .jd-number-input__input::-webkit-outer-spin-button,
    .jd-number-input__input::-webkit-inner-spin-button {
      appearance: none;
      margin: 0;
    }
    .jd-number-input__input:disabled {
      cursor: not-allowed;
    }

    jd-number-input[size="sm"] .jd-number-input__input {
      height: 2rem;
      font-size: var(--jd-text-xs);
    }
    jd-number-input[size="lg"] .jd-number-input__input {
      height: 2.75rem;
      font-size: var(--jd-text-md);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-number-input__step {
        transition: none;
      }
    }
  }
`;
