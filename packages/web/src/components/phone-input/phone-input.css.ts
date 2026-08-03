/**
 * jd-phone-input CSS — v2 primitives/PhoneInput(테두리 한 덩어리 · 좌측 국가 버튼 ·
 * focus-within 글로우)의 토큰 번역. 네이티브 select는 appearance:none으로 외피를
 * 지우고 v2의 캐럿 SVG를 겹쳐 닫힌 상태 외관을 유지한다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-phone-input {
      display: inline-flex;
      box-sizing: border-box;
      overflow: hidden;
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-lg);
    }
    /* 포커스를 받는 것은 안쪽 select/input이지만 둘 다 테두리가 없다 — 표시는
     테두리를 가진 호스트가 대신 낸다(§1 "대체 표시"). 단 호스트 링만으로는 Tab이
     국가와 번호 중 어디에 있는지 말하지 못한다 — 아래에서 칸별 링을 덧댄다. */
    jd-phone-input:focus-within {
      border-color: var(--jd-color-primary);
      box-shadow: var(--jd-shadow-focus-ring);
    }
    jd-phone-input[error] {
      border-color: var(--jd-color-danger);
    }
    jd-phone-input[error]:focus-within {
      box-shadow: var(--jd-shadow-focus-ring-danger);
    }
    jd-phone-input[disabled] {
      opacity: var(--jd-opacity-50);
    }

    .jd-phone-input__country {
      position: relative;
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      border-inline-end: var(--jd-border-thin) solid var(--jd-color-border);
      transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    /* 비활성일 때는 누를 수 없으므로 hover도 응답하지 않는다 — 호스트의 흐림만으로는
     "눌리는 것처럼 보이는데 안 눌린다"가 남는다 */
    jd-phone-input:not([disabled]) > .jd-phone-input__country:hover {
      background: var(--jd-color-card-hover);
    }
    /* 눌린 면은 빛을 잃는다. 칸이 컨트롤 테두리에 물려 있어 scale은 틈을 만든다 —
     인셋 그림자로 눌러 넣는다. */
    jd-phone-input:not([disabled]) > .jd-phone-input__country:active {
      background: var(--jd-color-border-light);
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }

    .jd-phone-input__select {
      appearance: none;
      -webkit-appearance: none;
      height: 2.25rem;
      margin: 0;
      padding-inline: var(--jd-space-3) var(--jd-space-6);
      border: 0;
      outline: none;
      background: transparent;
      cursor: pointer;
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
    }
    /* 국가 select는 번호 input과 별개의 Tab 정거장이다. outline:none만 두고 호스트
     링에 맡기면 두 정거장이 똑같이 보여 지금 어느 칸을 조작하는지 알 수 없다 —
     칸 자체에 링을 돌려준다. 호스트가 overflow:hidden이라 바깥으로 나가는 아웃라인·
     그림자는 잘리므로 안쪽으로 눕힌다. */
    .jd-phone-input__select:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: calc(-1 * var(--jd-border-medium));
    }
    .jd-phone-input__select:disabled {
      cursor: not-allowed;
    }
    /* 열린 목록은 플랫폼 렌더 — 다크에서 흰 배경으로 뭉개지지 않도록 옵션 색 지정 */
    .jd-phone-input__select option {
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
    }

    .jd-phone-input__caret {
      position: absolute;
      inset-inline-end: var(--jd-space-2);
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      pointer-events: none;
      color: var(--jd-color-muted);
    }

    .jd-phone-input__input {
      flex: 1;
      min-width: 0;
      margin: 0;
      height: 2.25rem;
      padding-inline: var(--jd-space-3);
      border: 0;
      outline: none;
      background: transparent;
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-sm);
      color: var(--jd-color-foreground);
      font-variant-numeric: tabular-nums;
    }
    .jd-phone-input__input:disabled {
      cursor: not-allowed;
    }

    jd-phone-input[size="sm"] .jd-phone-input__select,
    jd-phone-input[size="sm"] .jd-phone-input__input {
      height: 2rem;
      font-size: var(--jd-text-xs);
    }
    jd-phone-input[size="lg"] .jd-phone-input__select,
    jd-phone-input[size="lg"] .jd-phone-input__input {
      height: 2.75rem;
    }
    jd-phone-input[size="lg"] .jd-phone-input__input {
      font-size: var(--jd-text-md);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-phone-input__country {
        transition: none;
      }
    }
  }
`;
