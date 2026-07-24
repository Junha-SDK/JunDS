/**
 * jd-markdown-viewer CSS — v2 composites/MarkdownViewer가 파서 안에 문자열로 박아 두던
 * Tailwind 클래스(h1 text-xl/mt-6, h2 text-lg/mt-5, h3 text-base/mt-4, li ml-4,
 * code bg-gray-100 primary, blockquote 좌측 primary/30 선, hr border-border)의 토큰 번역.
 *
 * 산문 규칙은 전부 `.jd-markdown-viewer__*` 클래스로 스코프한다 — 맨 요소 셀렉터를
 * 쓰면 소비자 문서로 새어 나간다(MySelf 갤러리에서 실증된 산문 누수).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-markdown-viewer {
    display: block;
    font-family: var(--jd-font-sans);
    font-size: var(--jd-text-md); line-height: var(--jd-leading-relaxed);
    color: var(--jd-color-foreground);
  }

  .jd-markdown-viewer__h1,
  .jd-markdown-viewer__h2,
  .jd-markdown-viewer__h3 { color: var(--jd-color-foreground); }
  .jd-markdown-viewer__h1 {
    font-size: var(--jd-text-2xl); font-weight: var(--jd-weight-bold);
    line-height: var(--jd-leading-tight);
    margin-block: var(--jd-space-6) var(--jd-space-3);
  }
  .jd-markdown-viewer__h2 {
    font-size: var(--jd-text-xl); font-weight: var(--jd-weight-bold);
    line-height: var(--jd-leading-snug);
    margin-block: var(--jd-space-5) var(--jd-space-2);
  }
  .jd-markdown-viewer__h3 {
    font-size: var(--jd-text-lg); font-weight: var(--jd-weight-semibold);
    line-height: var(--jd-leading-snug);
    margin-block: var(--jd-space-4) var(--jd-space-2);
  }
  /* 첫 블록의 위쪽 여백은 접는다 — 뷰어가 카드 안에 들어가는 것이 기본 사용처다 */
  .jd-markdown-viewer__body > :first-child { margin-block-start: 0; }
  .jd-markdown-viewer__body > :last-child { margin-block-end: 0; }

  .jd-markdown-viewer__p { margin-block: var(--jd-space-2); }

  .jd-markdown-viewer__list {
    margin-block: var(--jd-space-2); padding-inline-start: var(--jd-space-6);
  }
  .jd-markdown-viewer__item { margin-block: var(--jd-space-1); }

  .jd-markdown-viewer__code {
    padding: var(--jd-space-0-5) var(--jd-space-1-5);
    border-radius: var(--jd-radius-sm);
    background: var(--jd-color-card-hover);
    color: var(--jd-color-primary);
    font-family: var(--jd-font-mono); font-size: var(--jd-text-xs);
  }

  .jd-markdown-viewer__link {
    color: var(--jd-color-primary); text-decoration: underline;
  }
  .jd-markdown-viewer__link:focus-visible {
    outline: none; border-radius: var(--jd-radius-sm);
    box-shadow: var(--jd-shadow-focus-ring);
  }

  .jd-markdown-viewer__quote {
    margin-block: var(--jd-space-2); margin-inline: 0;
    padding-inline-start: var(--jd-space-4);
    border-inline-start: var(--jd-border-heavy) solid
      color-mix(in srgb, var(--jd-color-primary) 30%, transparent);
    color: var(--jd-color-muted); font-style: italic;
  }
  .jd-markdown-viewer__quote .jd-markdown-viewer__p { margin-block: var(--jd-space-1); }

  .jd-markdown-viewer__rule {
    margin-block: var(--jd-space-4);
    border: 0; border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
  }
}`;
