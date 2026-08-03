/**
 * jd-resizable CSS — 원형(jd-split-pane) 시트 위에 v2 Resizable의 스킨만 얹는다.
 * v2 값: 컨테이너 `flex overflow-hidden border border-border rounded-xl`,
 * 분리대 `w-1.5`(6px) / `h-1.5`, 그립 `bg-muted rounded-full w-1 h-6`(세로 분할은 `h-1 w-6`)
 * 중앙 정렬.
 *
 * 호스트 셀렉터는 태그마다 따로 필요하다 — 파생 태그는 원형 태그 셀렉터에 걸리지 않는다
 * (jd-drawer가 jd-modal 규칙을 다시 쓰는 것과 같다).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.base {
    jd-resizable:not(:defined) {
      display: flex;
    }
  }
  @layer junds.components {
    jd-resizable {
      display: flex;
      flex-direction: row;
      overflow: hidden;
      box-sizing: border-box;
      height: 100%;
      font-family: var(--jd-font-sans);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
    }
    jd-resizable[direction="vertical"] {
      flex-direction: column;
    }

    /* v2 w-1.5 / h-1.5 — 원형(4px)보다 두껍다 */
    jd-resizable > .jd-split-pane__separator {
      inline-size: 6px;
    }
    /* 세로 분할 기하·커서는 파생 태그가 스스로 선언한다 — 원형 시트의 호스트 셀렉터
     (jd-split-pane[direction="vertical"])는 파생 태그에 걸리지 않는다 */
    jd-resizable[direction="vertical"] > .jd-split-pane__separator {
      inline-size: auto;
      block-size: 6px;
      cursor: row-resize;
    }

    jd-resizable .jd-split-pane__grip {
      display: block;
      position: absolute;
      inset-inline-start: 50%;
      inset-block-start: 50%;
      translate: -50% -50%;
      background: var(--jd-color-muted);
      border-radius: var(--jd-radius-full);
      inline-size: 4px;
      block-size: 24px;
    }
    jd-resizable[direction="vertical"] .jd-split-pane__grip {
      inline-size: 24px;
      block-size: 4px;
    }
  }
`;
