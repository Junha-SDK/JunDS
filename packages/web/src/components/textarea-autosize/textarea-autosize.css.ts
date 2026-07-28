import { css } from "../../core/styles.js";

/**
 * jd-textarea-autosize CSS — 파생 델타만. 입력 표면(배경·테두리·포커스 글로우·에러)은
 * jd-textarea 시트를 그대로 쓰고, v2 composites/TextareaAutosize 고유값만 덮는다:
 * rounded-md · px-3 py-2 · resize 없음 · min-height 없음(minRows가 하한을 정하므로
 * 베이스의 80px 하한이 남아 있으면 minRows가 무력화된다) · 카운터 bottom-1 right-2.
 * 높이·overflow-y는 element.ts가 인라인으로 공급한다.
 */
export default css`
  @layer junds.components {
    /* 카운터가 절대배치라 호스트가 컨테이닝 블록이어야 한다 */
    jd-textarea-autosize {
      display: block;
      position: relative;
    }

    jd-textarea-autosize > .jd-textarea__input {
      min-height: 0;
      resize: none;
      border-radius: var(--jd-radius-md);
      padding: var(--jd-space-2) var(--jd-space-3);
    }

    jd-textarea-autosize[error] > .jd-textarea__input {
      border-color: var(--jd-color-danger);
    }
    jd-textarea-autosize[error] > .jd-textarea__input:focus {
      border-color: var(--jd-color-danger);
      box-shadow: var(--jd-shadow-focus-ring-danger), var(--jd-shadow-xs);
    }

    jd-textarea-autosize > .jd-textarea__count {
      bottom: var(--jd-space-1);
      right: var(--jd-space-2);
      font-variant-numeric: tabular-nums;
    }
  }
`;
