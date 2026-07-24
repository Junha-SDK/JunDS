/**
 * jd-rich-text-editor CSS — v2 patterns/RichTextEditor 표면 의미 번역.
 * v2 값: 컨테이너 `border rounded-xl bg-white`, 포커스 `border-primary
 * shadow-[0_0_0_3px_var(--primary-glow)]`, disabled `opacity-50`, 툴바
 * `gap-0.5 px-2 py-1.5 border-b bg-gray-50/80`, 버튼 `w-7 h-7 rounded-md text-xs
 * font-semibold text-muted hover:bg-gray-200`, 편집영역 `px-3 py-2 text-sm`,
 * 플레이스홀더 `text-muted-light`.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-rich-text-editor:not(:defined) { display: none; }
}
@layer junds.components {
  jd-rich-text-editor {
    display: block;
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    overflow: hidden;
    background: var(--jd-color-card);
    color: var(--jd-color-foreground);
    font-family: var(--jd-font-sans);
    transition:
      border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
      box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  jd-rich-text-editor[data-focused] {
    border-color: var(--jd-color-primary);
    box-shadow: 0 0 0 3px var(--jd-color-primary-glow);
  }
  jd-rich-text-editor[data-disabled] {
    opacity: var(--jd-opacity-50);
    pointer-events: none;
  }

  .jd-rte__toolbar {
    display: flex;
    align-items: center;
    gap: var(--jd-space-0-5);
    padding: var(--jd-space-1-5) var(--jd-space-2);
    border-bottom: var(--jd-border-thin) solid var(--jd-color-border-light);
    background: var(--jd-color-surface);
  }

  .jd-rte__tool {
    width: 1.75rem;
    height: 1.75rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: var(--jd-radius-md);
    background: transparent;
    color: var(--jd-color-muted);
    font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-semibold);
    cursor: pointer;
    transition:
      background var(--jd-duration-fast) var(--jd-easing-ease-out),
      color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-rte__tool:hover {
    background: color-mix(in srgb, var(--jd-color-muted) 18%, transparent);
    color: var(--jd-color-foreground);
  }
  .jd-rte__tool:focus-visible {
    outline: none;
    box-shadow: var(--jd-shadow-focus-ring);
  }
  /* 활성 서식 — aria-pressed로 표시 */
  .jd-rte__tool[aria-pressed="true"] {
    background: var(--jd-color-primary-light);
    color: var(--jd-color-primary);
  }
  .jd-rte__tool:disabled { cursor: not-allowed; opacity: var(--jd-opacity-50); }

  /* 버튼 글리프에 서식 미리보기(v2 font-extrabold/italic/underline/line-through) */
  .jd-rte__tool[data-style="bold"] { font-weight: var(--jd-weight-bold); }
  .jd-rte__tool[data-style="italic"] { font-style: italic; }
  .jd-rte__tool[data-style="underline"] { text-decoration: underline; }
  .jd-rte__tool[data-style="strike"] { text-decoration: line-through; }

  .jd-rte__editor {
    position: relative;
    padding: var(--jd-space-2) var(--jd-space-3);
    font-size: var(--jd-text-sm);
    color: var(--jd-color-foreground);
    outline: none;
    line-height: var(--jd-leading-relaxed);
    overflow-wrap: break-word;
  }
  /* 플레이스홀더 — 비었고 포커스 없을 때만(v2 조건 동일) */
  jd-rich-text-editor[data-empty]:not([data-focused]) .jd-rte__editor::before {
    content: attr(data-placeholder);
    color: var(--jd-color-muted-light);
    pointer-events: none;
  }

  /* 편집 영역 내부 블록 여백 정리 — prose-sm 근사 */
  .jd-rte__editor :where(h2) {
    font-size: var(--jd-text-lg);
    font-weight: var(--jd-weight-semibold);
    margin: var(--jd-space-2) 0 var(--jd-space-1);
  }
  .jd-rte__editor :where(ul, ol) { padding-left: var(--jd-space-5); margin: var(--jd-space-1) 0; }
  .jd-rte__editor :where(p) { margin: 0 0 var(--jd-space-1); }
}`;
