import { css } from "../../core/styles.js";

/**
 * v2 CoreDivider 기본값: 가로 = 1px 라인 + my 4(16px), 세로 = 1px 세로줄(여백 없음),
 * 라벨 = 라인·라벨·라인 3분할(gap 12px, 라벨 xs·medium·muted).
 */
export default css`
  @layer junds.components {
    jd-divider {
      display: block;
      height: var(--jd-border-thin);
      background-color: var(--jd-color-border);
      margin-block: var(--jd-space-4);
    }
    jd-divider[orientation="vertical"] {
      display: inline-block;
      width: var(--jd-border-thin);
      height: auto;
      /* 플렉스 부모에서는 stretch가 높이를 준다. 그 밖(블록·인라인 문맥)에서는
       height:auto가 0이 되어 선이 통째로 사라진다 — 최소 한 줄 높이는 남긴다. */
      min-height: 1em;
      align-self: stretch;
      margin-block: 0;
    }
    /* 라벨 모드는 축을 **전부 리셋**한다: orientation 규칙이 남긴 width/min-height가
     함께 걸리면 3분할 행이 1px 기둥으로 찌그러진다 (popover 시트의 "속성 규칙은
     전부 리셋을 포함한다" 규약과 동형). */
    jd-divider[label]:not([label=""]) {
      display: flex;
      align-items: center;
      gap: var(--jd-space-3);
      width: auto;
      height: auto;
      min-height: 0;
      background-color: transparent;
    }
    /* flex-basis 0으로 자라기만 하면 부모가 폭을 shrink-wrap 할 때(플렉스/그리드 자식,
     인라인 문맥) 0폭이 되어 **선이 아예 안 보인다**(실측). 라벨 달린 구분선은 선이
     보이는 것이 존재 이유이므로 최소 길이를 준다. */
    .jd-divider__line {
      flex: 1 1 auto;
      min-width: var(--jd-space-6);
      height: var(--jd-border-thin);
      background-color: var(--jd-color-border);
    }
    .jd-divider__label {
      flex-shrink: 0;
      /* 좁아지면 줄어드는 것은 선이지 라벨이 아니다 — 접히면 글자가 세로로 선다 */
      white-space: nowrap;
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-medium);
      line-height: var(--jd-leading-none);
      color: var(--jd-color-muted);
    }
  }
`;
