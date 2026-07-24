/**
 * jd-copy-block CSS — v2 composites/CopyBlock(rounded-xl 테두리 · gray-50 머리글 ·
 * gray-950/gray-100 코드면 · 우상단 고스트 복사 버튼, 완료 시 success)의 토큰 번역.
 *
 * 코드면은 라이트/다크 양쪽에서 어두운 면을 유지한다(v2 동형 — 코드 블록의 관례).
 * 그래서 gray-950/gray-100/gray-800 계열만 리터럴로 남는다(G2 gray 어휘, badge 선례).
 * 줄 번호는 DOM이 아니라 CSS 카운터다 — 접근성 트리에도 클립보드에도 실리지 않는다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-copy-block {
    display: block; position: relative; box-sizing: border-box;
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    overflow: hidden;
  }

  .jd-copy-block__head {
    display: flex; align-items: center; justify-content: space-between;
    padding: var(--jd-space-2) var(--jd-space-4);
    background: var(--jd-color-card-hover);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-copy-block__head[hidden] { display: none; }
  .jd-copy-block__lang {
    font-family: var(--jd-font-sans); font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-medium); color: var(--jd-color-muted);
    text-transform: uppercase; letter-spacing: var(--jd-tracking-wide);
  }

  .jd-copy-block__pre {
    margin: 0; padding: var(--jd-space-4);
    overflow-x: auto;
    background: #030712; color: #f3f4f6;
    font-family: var(--jd-font-mono); font-size: var(--jd-text-md);
    line-height: var(--jd-leading-relaxed);
    tab-size: 2;
  }
  .jd-copy-block__pre:focus-visible {
    outline: none; box-shadow: inset var(--jd-shadow-focus-ring);
  }
  .jd-copy-block__code { font: inherit; }
  /* 빈 줄도 한 행을 차지해야 한다 (v2는 높이 0으로 접혀 줄 수가 어긋났다) */
  .jd-copy-block__line {
    display: block; min-block-size: calc(1em * var(--jd-leading-relaxed));
  }
  jd-copy-block[show-line-numbers] .jd-copy-block__line::before {
    counter-increment: jd-copy-block-line;
    content: counter(jd-copy-block-line);
    display: inline-block; inline-size: 2rem; margin-inline-end: var(--jd-space-4);
    text-align: end; color: #6b7280; user-select: none;
  }
  jd-copy-block[show-line-numbers] .jd-copy-block__code {
    counter-reset: jd-copy-block-line;
  }

  /* 복사 버튼 — v2는 hover에서만 나타나 키보드·터치에서 사라졌다 */
  .jd-copy-block__copy {
    position: absolute; inset-block-start: var(--jd-space-2);
    inset-inline-end: var(--jd-space-2);
    display: inline-flex; align-items: center; justify-content: center;
    padding: var(--jd-space-2); border: 0; cursor: pointer;
    border-radius: var(--jd-radius-lg);
    background: #1f2937; color: #d1d5db;
    opacity: 0;
    transition: opacity var(--jd-duration-normal) var(--jd-easing-ease-out),
      background var(--jd-duration-fast) var(--jd-easing-ease-out),
      color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  jd-copy-block:hover .jd-copy-block__copy,
  jd-copy-block:focus-within .jd-copy-block__copy { opacity: 1; }
  @media (hover: none) { .jd-copy-block__copy { opacity: 1; } }
  .jd-copy-block__copy:hover { background: #374151; color: #fff; }
  .jd-copy-block__copy:focus-visible {
    opacity: 1; outline: none; box-shadow: var(--jd-shadow-focus-ring);
  }
  jd-copy-block[copied] .jd-copy-block__copy {
    background: var(--jd-color-success); color: #fff;
  }
  .jd-copy-block__icon { display: flex; }

  /* 라이브 리전 — 화면에서만 숨긴다 */
  .jd-copy-block__status {
    position: absolute; inline-size: 1px; block-size: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-copy-block__copy { transition: none; }
  }
}`;
