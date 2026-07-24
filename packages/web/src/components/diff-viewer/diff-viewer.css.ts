/**
 * jd-diff-viewer CSS — v2 DiffViewer의 토큰 번역.
 *
 * v2 값: 껍데기 `rounded-xl border border-border overflow-hidden text-sm font-mono`,
 * 제목 줄 `flex border-b bg-gray-50 text-xs text-muted` + 칸 `flex-1 px-3 py-2`,
 * 본문 `overflow-x-auto`, 줄 번호 `w-10 text-right pr-2 text-[10px] text-gray-400
 * select-none border-r`, 부호 `w-5 text-center text-xs font-bold select-none`,
 * 내용 `flex-1 px-2 whitespace-pre`.
 *
 * 색 판단 2건:
 * 1. `bg-gray-50`(제목 줄)·`text-gray-400`(줄 번호)는 라이트 고정값이라 다크에서 뒤집힌다
 *    → card-hover / muted 토큰으로 번역.
 * 2. `text-success` / `text-danger` 원색을 10% 틴트 위에 그대로 쓰면 3.2~3.6:1로 AA 미달이다
 *    (jd-code가 axe 실측으로 확인한 결함). foreground와 65% 섞어 두 테마에서 함께 산다.
 *
 * div flex → table 이식이므로 폭은 flex-1/w-10이 아니라 `width` + `table-layout: auto`로
 * 옮겼다. 번호·부호 칸은 고정폭, 내용 칸이 남는 폭을 전부 먹는다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-diff-viewer {
    display: block;
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    overflow: hidden;
    font-family: var(--jd-font-mono);
    font-size: var(--jd-text-sm);
    background: var(--jd-color-card);
  }

  .jd-diff-viewer__header {
    display: flex;
    border-bottom: var(--jd-border-thin) solid var(--jd-color-border);
    background: var(--jd-color-card-hover);
    font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
  }
  .jd-diff-viewer__header[hidden] { display: none; }

  .jd-diff-viewer__title {
    flex: 1 1 0;
    min-width: 0;
    padding: var(--jd-space-2) var(--jd-space-3);
  }
  .jd-diff-viewer__title[hidden] { display: none; }
  /* v2는 첫 칸에만 세로 구분선을 뒀다 — 두 칸이 다 있을 때만 그린다 */
  .jd-diff-viewer__title + .jd-diff-viewer__title {
    border-inline-start: var(--jd-border-thin) solid var(--jd-color-border);
  }

  .jd-diff-viewer__scroll { overflow-x: auto; }
  .jd-diff-viewer__scroll:focus-visible {
    outline: 2px solid var(--jd-color-primary);
    outline-offset: -2px;
  }

  .jd-diff-viewer__table {
    width: 100%;
    border-collapse: collapse;
    table-layout: auto;
  }

  /* 요약은 표의 접근 이름으로만 쓴다(시각적으로 숨김 — jd-visually-hidden 관용구) */
  .jd-diff-viewer__caption,
  .jd-diff-viewer__sr {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  .jd-diff-viewer__num,
  .jd-diff-viewer__marker,
  .jd-diff-viewer__content {
    padding: 0;
    vertical-align: top;
    line-height: var(--jd-leading-relaxed);
  }

  /* 번호·부호는 드래그 복사에 섞이지 않는다 — 코드만 깨끗하게 붙는다 */
  .jd-diff-viewer__num {
    width: 2.5rem;
    text-align: right;
    padding-inline-end: var(--jd-space-2);
    font-size: 10px;
    color: var(--jd-color-muted);
    user-select: none;
    border-inline-end: var(--jd-border-thin) solid var(--jd-color-border);
  }

  .jd-diff-viewer__marker {
    width: 1.25rem;
    text-align: center;
    font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-bold);
    user-select: none;
  }

  .jd-diff-viewer__content {
    padding-inline: var(--jd-space-2);
    white-space: pre;
  }

  .jd-diff-viewer__row[data-type="add"] {
    background: color-mix(in srgb, var(--jd-color-success) 10%, transparent);
    color: color-mix(in srgb, var(--jd-color-success) 65%, var(--jd-color-foreground));
  }
  .jd-diff-viewer__row[data-type="remove"] {
    background: color-mix(in srgb, var(--jd-color-danger) 10%, transparent);
    color: color-mix(in srgb, var(--jd-color-danger) 65%, var(--jd-color-foreground));
  }
}`;
