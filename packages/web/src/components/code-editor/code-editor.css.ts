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
 * gray-100). 라이브러리 토큰에는 "어두운 코드 표면" 계열이 없어(--jd-color-card는
 * 라이트에서 흰색) 여기서만 리터럴을 쓰되 전부 컴포넌트 지역 변수로 노출한다 —
 * 소비자는 `jd-code-editor { --jd-code-editor-bg: … }` 한 줄로 갈아끼운다.
 * (G2 색 어휘 재심의 목록: jd-code가 남긴 "코드 표면 토큰 부재"와 같은 항목.)
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
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    overflow: hidden;
    background: var(--jd-code-editor-bg, #030712);

    --jd-code-editor-fg: #f3f4f6;
    --jd-code-editor-gutter-fg: #6b7280;
    --jd-code-editor-rule: #1f2937;
  }

  .jd-code-editor__header {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--jd-space-2) var(--jd-space-4);
    background: var(--jd-color-card-hover);
    border-bottom: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-code-editor__header[hidden] { display: none; }

  .jd-code-editor__language {
    font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-medium);
    color: var(--jd-color-muted);
    text-transform: uppercase;
    letter-spacing: var(--jd-tracking-wide);
  }

  .jd-code-editor__gutter {
    grid-column: 1;
    overflow: hidden; /* scrollTop 동기화용 — 스크롤바는 textarea만 갖는다 */
    padding: var(--jd-space-3) var(--jd-space-2);
    text-align: right;
    user-select: none;
    border-inline-end: var(--jd-border-thin) solid var(--jd-code-editor-rule);
    font-family: var(--jd-font-mono);
    font-size: var(--jd-text-xs);
    line-height: var(--jd-leading-relaxed);
    color: var(--jd-code-editor-gutter-fg);
  }
  .jd-code-editor__gutter[hidden] { display: none; }
  .jd-code-editor__line { display: block; }

  /* 안내문은 aria-describedby 전용 — 화면에서는 숨고 grid 흐름에서도 빠진다 */
  .jd-code-editor__hint {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
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
    white-space: pre;
    tab-size: var(--jd-code-editor-tab-size, 2);
    font-family: var(--jd-font-mono);
    font-size: var(--jd-text-sm);
    line-height: var(--jd-leading-relaxed);
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
    outline: 2px solid var(--jd-color-primary);
    outline-offset: -2px;
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
    jd-code-editor > .jd-textarea__input { transition: none; }
  }
}`;
