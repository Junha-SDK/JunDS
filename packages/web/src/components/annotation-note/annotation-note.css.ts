import { css } from "../../core/styles.js";

/**
 * jd-annotation-note CSS — v2 composites/AnnotationNote(`border-l-4 rounded-r-md p-3
 * text-sm` + 색 5종의 `border-l-<c>-400 bg-<c>-50 dark:bg-<c>-950/30`, 메모 `text-xs
 * muted`, footer 11px muted, 삭제 opacity 50→100 + hover danger, 클릭 시 hover shadow-sm).
 *
 * 형광펜 5색은 semantic 축이 없어 v2 Tailwind 리터럴 승계(DEC-025-1). 색당 선언을
 * 두 줄로 묶으려고 호스트에 사설 변수(--_jd-an-*)만 싣고 규칙 본문은 한 벌만 둔다.
 */
export default css`
@layer junds.components {
  jd-annotation-note {
    display: block;
    --_jd-an-line: #facc15; --_jd-an-bg: #fefce8; --_jd-an-bg-dark: rgb(66 32 6 / 0.3);
  }
  jd-annotation-note[color="green"] {
    --_jd-an-line: #4ade80; --_jd-an-bg: #f0fdf4; --_jd-an-bg-dark: rgb(5 46 22 / 0.3);
  }
  jd-annotation-note[color="blue"] {
    --_jd-an-line: #60a5fa; --_jd-an-bg: #eff6ff; --_jd-an-bg-dark: rgb(23 37 84 / 0.3);
  }
  jd-annotation-note[color="pink"] {
    --_jd-an-line: #f472b6; --_jd-an-bg: #fdf2f8; --_jd-an-bg-dark: rgb(80 7 36 / 0.3);
  }
  jd-annotation-note[color="orange"] {
    --_jd-an-line: #fb923c; --_jd-an-bg: #fff7ed; --_jd-an-bg-dark: rgb(67 20 7 / 0.3);
  }

  .jd-annotation-note {
    box-sizing: border-box; /* DEC-014-9 — padding + border를 자기 폭 안에 */
    padding: var(--jd-space-3);
    border-inline-start: var(--jd-border-heavy) solid var(--_jd-an-line);
    border-start-end-radius: var(--jd-radius-md);
    border-end-end-radius: var(--jd-radius-md);
    background: var(--_jd-an-bg);
    font-family: var(--jd-font-sans);
    font-size: var(--jd-text-sm);
    color: var(--jd-color-foreground);
  }
  [data-jd-theme="dark"] .jd-annotation-note,
  [data-theme="dark"] .jd-annotation-note { background: var(--_jd-an-bg-dark); }

  /* 따옴표는 본문 텍스트가 아니라 표기다 — 글리프는 v2와 같은 " */
  .jd-annotation-note__quote {
    margin: 0; quotes: '"' '"';
    line-height: var(--jd-leading-relaxed);
  }
  .jd-annotation-note__quote::before { content: open-quote; }
  .jd-annotation-note__quote::after { content: close-quote; }

  .jd-annotation-note__note {
    margin: var(--jd-space-2) 0 0;
    font-size: var(--jd-text-xs);
    line-height: var(--jd-leading-relaxed);
    color: var(--jd-color-muted);
  }

  .jd-annotation-note__footer {
    display: flex; align-items: center; justify-content: space-between;
    margin-block-start: var(--jd-space-2);
    font-size: 11px; /* v2 text-[11px] — 대응 토큰 없음 */
    color: var(--jd-color-muted);
  }
  .jd-annotation-note__meta { display: flex; align-items: center; gap: var(--jd-space-2); }

  .jd-annotation-note__note[hidden],
  .jd-annotation-note__footer[hidden],
  .jd-annotation-note__page[hidden],
  .jd-annotation-note__date[hidden] { display: none; }

  .jd-annotation-note__delete {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0; border: 0; background: transparent; color: inherit; cursor: pointer;
    opacity: var(--jd-opacity-50);
    transition:
      opacity var(--jd-duration-normal) var(--jd-easing-ease-out),
      color var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-annotation-note__delete:hover { opacity: var(--jd-opacity-100); color: var(--jd-color-danger-ink); }
  .jd-annotation-note__delete:focus-visible {
    opacity: var(--jd-opacity-100);
    outline: var(--jd-border-medium) solid var(--jd-color-primary);
    outline-offset: 1px; border-radius: var(--jd-radius-sm);
  }

  jd-annotation-note[clickable] > .jd-annotation-note {
    cursor: pointer;
    transition: box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  jd-annotation-note[clickable] > .jd-annotation-note:hover { box-shadow: var(--jd-shadow-sm); }
  jd-annotation-note[clickable] > .jd-annotation-note:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring); /* StatCard와 같은 카드 포커스 링 */
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-annotation-note__delete,
    jd-annotation-note[clickable] > .jd-annotation-note { transition: none; }
  }
}`;
