/**
 * jd-code-editor CSS — v2 CodeEditor의 토큰 번역 + jd-textarea 표면 상쇄.
 *
 * v2 값: 껍데기 `rounded-xl border border-border overflow-hidden`, 머리띠
 * `px-4 py-2 bg-gray-50 border-b` + 라벨 `text-xs font-medium text-muted uppercase
 * tracking-wider`, 편집면 `bg-gray-950`, 번호 여백 `py-3 px-2 text-right select-none
 * border-r border-gray-800` + 번호 `text-xs text-gray-500 leading-relaxed`,
 * textarea `flex-1 p-3 text-sm text-gray-100 font-mono leading-relaxed resize-none`.
 *
 * 색 판단: 편집면은 v2가 테마와 무관하게 **어두운 코드면**으로 고정했다(gray-950 위
 * gray-100). 그 자리는 이제 토큰이 갖는다 — `--jd-color-surface` 3단은 정의상
 * 라이트에서도 어두운 크롬이고 짝이 되는 잉크가 `--jd-color-on-surface`다(DEC-044,
 * jd-copy-block 선례). 리터럴은 전부 걷어냈고 지역 변수는 소비자 탈출구로 남긴다 —
 * `jd-code-editor { --jd-code-editor-bg: … }` 한 줄로 갈아끼운다.
 *
 * 머리띠 판단: v2의 `bg-gray-50`(라이트에서 흰 띠)은 어두운 편집면 위에 **다른 상자**로
 * 얹혔다 — 실측된 "탭과 본문 사이 왼쪽 흰 틈"의 정체다. 머리띠도 같은 계열의
 * 한 단 밝은 면(surface-raised)으로 옮기고, 구분선은 잉크에서 뽑는다(§4).
 *
 * 골격 판단: 머리띠/번호칸/textarea가 전부 호스트의 직계 자식이라(부모 jd-textarea의
 * 입양 셀렉터 보존) 배치는 grid가 진다. 번호칸은 1열, textarea는 2열로 못 박고
 * 머리띠만 전 폭을 덮는다 — 머리띠가 없어도(display:none) 나머지 배치가 그대로다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-code-editor {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      position: relative; /* 부모의 .jd-textarea__count 절대배치 기준 */
      /* 어두운 편집면을 라이트 테두리로 두르면 상자가 둘로 보인다 — 잉크에서 뽑는다(§4) */
      border: var(--jd-border-thin) solid var(--jd-code-editor-rule);
      border-radius: var(--jd-radius-xl);
      overflow: hidden;
      background: var(--jd-code-editor-bg, var(--jd-color-surface));
      box-shadow: var(--jd-shadow-sm);

      --jd-code-editor-fg: var(--jd-color-on-surface);
      --jd-code-editor-gutter-fg: var(--jd-color-on-surface-muted);
      --jd-code-editor-rule: color-mix(in srgb, var(--jd-color-on-surface) 14%, transparent);
      /* 번호 칸과 코드가 공유하는 줄 높이 — 아래 두 규칙이 같은 값을 쓴다 */
      --_jd-code-editor-line: calc(var(--jd-text-sm) * var(--jd-leading-relaxed));
    }

    .jd-code-editor__header {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--jd-space-2) var(--jd-space-4);
      background: var(--jd-color-surface-raised);
      border-bottom: var(--jd-border-thin) solid var(--jd-code-editor-rule);
    }
    .jd-code-editor__header[hidden] {
      display: none;
    }

    .jd-code-editor__language {
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-semibold);
      color: var(--jd-code-editor-gutter-fg);
      text-transform: uppercase;
      letter-spacing: var(--jd-tracking-wider);
    }

    .jd-code-editor__gutter {
      grid-column: 1;
      overflow: hidden; /* scrollTop 동기화용 — 스크롤바는 textarea만 갖는다 */
      padding: var(--jd-space-3) var(--jd-space-2);
      text-align: right;
      user-select: none;
      /* 번호 칸은 편집면보다 한 겹 눌린 레일이다 — 배경이 없으면 코드와 같은 평면에
       떠 있는 숫자로 읽힌다 */
      background: color-mix(in srgb, var(--jd-color-on-surface) 5%, transparent);
      border-inline-end: var(--jd-border-thin) solid var(--jd-code-editor-rule);
      font-family: var(--jd-font-mono);
      font-size: var(--jd-text-xs);
      /* 줄 높이는 **비율이 아니라 절대값**을 공유한다. 번호(12px)와 코드(13px)에
       같은 배수를 걸면 줄마다 1.6px씩 어긋나 20줄 아래에서 번호가 한 줄 밀린다 —
       element.ts가 wrap=off로 확보한 1:1 정합이 CSS에서 무너지던 자리다. */
      line-height: var(--_jd-code-editor-line);
      font-variant-numeric: tabular-nums;
      color: var(--jd-code-editor-gutter-fg);
    }
    .jd-code-editor__gutter[hidden] {
      display: none;
    }
    .jd-code-editor__line {
      display: block;
    }

    /* 안내문은 aria-describedby 전용 — 화면에서는 숨고 grid 흐름에서도 빠진다 */
    .jd-code-editor__hint {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    /* jd-textarea 표면(유리 배경·테두리·radius·글로우 포커스) 상쇄.
     특이도 (0,1,1) — 부모 규칙 (0,1,0)을 이긴다. */
    jd-code-editor > .jd-textarea__input {
      grid-column: 2;
      min-height: var(--jd-code-editor-min-height, 200px);
      margin: 0;
      padding: var(--jd-space-3);
      border: 0;
      border-radius: 0;
      background: transparent;
      backdrop-filter: none;
      resize: none;
      overflow: auto;
      /* wrap=off라 긴 줄은 반드시 가로로 넘친다 — 잘린 채 끝나지 않고 굴러야 한다(§6).
       어두운 면 위 기본 스크롤바는 배경에 묻혀 "굴릴 수 있다"가 보이지 않으므로
       잉크에서 뽑은 색을 준다. */
      overscroll-behavior-x: contain;
      scrollbar-width: thin;
      scrollbar-color: color-mix(in srgb, var(--jd-color-on-surface) 30%, transparent) transparent;
      white-space: pre;
      tab-size: var(--jd-code-editor-tab-size, 2);
      font-family: var(--jd-font-mono);
      font-size: var(--jd-text-sm);
      line-height: var(--_jd-code-editor-line);
      color: var(--jd-code-editor-fg);
    }
    jd-code-editor > .jd-textarea__input::placeholder {
      color: var(--jd-code-editor-gutter-fg);
    }
    jd-code-editor > .jd-textarea__input:focus {
      background: transparent;
      border-color: transparent;
      /* 유리 글로우는 어두운 면에서 보이지 않는다 — 안쪽 아웃라인으로 바꾼다 */
      box-shadow: none;
      outline: var(--jd-border-medium) solid var(--jd-color-primary);
      outline-offset: calc(-1 * var(--jd-border-medium));
    }
    jd-code-editor > .jd-textarea__input:disabled {
      background: transparent;
      opacity: var(--jd-opacity-50);
    }
    jd-code-editor > .jd-textarea__input:read-only {
      cursor: default;
    }

    jd-code-editor > .jd-textarea__count {
      color: var(--jd-code-editor-gutter-fg);
    }

    @media (prefers-reduced-motion: reduce) {
      jd-code-editor > .jd-textarea__input {
        transition: none;
      }
    }
  }
`;
