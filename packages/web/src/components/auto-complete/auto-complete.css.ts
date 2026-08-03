/**
 * jd-auto-complete CSS — 차분만. 팝업·행·컨트롤 표면은 jd-combobox 시트를 그대로 쓴다.
 * 호스트 셀렉터는 태그 단위라 jd-combobox의 호스트 스코프 규칙이 파생에 닿지 않는다 —
 * 그 부분만 다시 선언한다(drawer→modal 선례).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-auto-complete {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    jd-auto-complete[error] > .jd-combobox__control {
      border-color: var(--jd-color-danger);
    }
    jd-auto-complete[error] > .jd-combobox__control:focus-within {
      border-color: var(--jd-color-danger);
      box-shadow: var(--jd-shadow-focus-ring-danger);
    }
    jd-auto-complete[disabled] > .jd-combobox__control {
      opacity: var(--jd-opacity-50);
      cursor: not-allowed;
    }

    /* v2 AutoComplete는 활성 행 배경만 있고 hover는 primary/10이었다 */
    jd-auto-complete .jd-combobox__option:hover {
      background: color-mix(in srgb, var(--jd-color-primary) 10%, transparent);
    }
  }
`;
