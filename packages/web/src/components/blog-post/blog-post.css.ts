import { css } from "../../core/styles.js";

/**
 * v2 매핑: max-w-6xl 컨테이너 + 중앙 헤더(max-w-3xl), 태그=primary 소프트 pill,
 * 제목 3xl→5xl 반응형, meta 회색 인라인(·구분), 커버 max-w-5xl rounded-xl,
 * 본문 prose + 사이드바 있으면 [1fr 240px] 2열(lg+), 하단 border-t 푸터.
 */
export default css`
@layer junds.components {
  jd-blog-post {
    display: block;
    max-width: 72rem;
    margin-inline: auto;
    padding: var(--jd-space-10) var(--jd-space-4);
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
  }
  @media (min-width: 640px) {
    jd-blog-post { padding-inline: var(--jd-space-6); }
  }

  .jd-blog-post__header {
    max-width: 48rem;
    margin: 0 auto var(--jd-space-8);
    text-align: center;
  }

  .jd-blog-post__tags {
    display: flex; flex-wrap: wrap; gap: var(--jd-space-1);
    justify-content: center; margin: 0 0 var(--jd-space-4); padding: 0; list-style: none;
  }
  .jd-blog-post__tag {
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-medium);
    padding: var(--jd-space-0-5) var(--jd-space-2); border-radius: var(--jd-radius-full);
    background: color-mix(in srgb, var(--jd-color-primary) 10%, transparent);
    color: var(--jd-color-primary);
  }

  .jd-blog-post__title {
    margin: 0;
    font-size: var(--jd-text-3xl);
    font-weight: var(--jd-weight-bold);
    letter-spacing: var(--jd-tracking-tight);
    line-height: var(--jd-leading-tight);
  }
  @media (min-width: 640px) { .jd-blog-post__title { font-size: var(--jd-text-4xl); } }
  @media (min-width: 1024px) { .jd-blog-post__title { font-size: var(--jd-text-5xl); } }

  .jd-blog-post__excerpt {
    margin: var(--jd-space-4) 0 0;
    font-size: var(--jd-text-lg);
    color: var(--jd-color-muted);
  }

  .jd-blog-post__meta {
    margin-top: var(--jd-space-6);
    display: flex; align-items: center; justify-content: center;
    flex-wrap: wrap; gap: var(--jd-space-3);
    font-size: var(--jd-text-sm); color: var(--jd-color-muted);
  }
  .jd-blog-post__author { display: inline-flex; align-items: center; gap: var(--jd-space-2); }
  .jd-blog-post__avatar { width: 1.5rem; height: 1.5rem; border-radius: var(--jd-radius-full); object-fit: cover; }
  .jd-blog-post__author a { color: inherit; text-decoration: none; }
  .jd-blog-post__author a:hover { color: var(--jd-color-foreground); }

  .jd-blog-post__cover {
    max-width: 64rem; margin: 0 auto var(--jd-space-10);
    border-radius: var(--jd-radius-xl); overflow: hidden;
  }
  .jd-blog-post__cover-img { display: block; width: 100%; height: auto; object-fit: cover; }

  .jd-blog-post__layout {
    display: grid; gap: var(--jd-space-10);
    max-width: 48rem; margin-inline: auto;
  }
  .jd-blog-post__sidebar { display: none; }
  @media (min-width: 1024px) {
    .jd-blog-post__layout[data-has-sidebar] {
      max-width: none; grid-template-columns: 1fr 240px;
    }
    .jd-blog-post__layout[data-has-sidebar] .jd-blog-post__sidebar { display: block; }
    .jd-blog-post__layout[data-has-sidebar] .jd-blog-post__sidebar > * { position: sticky; top: var(--jd-space-6); }
  }

  /* 본문 prose — 스코프된 bare 요소 규칙(라이브러리 산문 타이포) */
  .jd-blog-post__body { min-width: 0; line-height: var(--jd-leading-relaxed); }
  .jd-blog-post__body > :first-child { margin-top: 0; }
  .jd-blog-post__body h2 {
    font-size: var(--jd-text-2xl); font-weight: var(--jd-weight-semibold);
    letter-spacing: var(--jd-tracking-tight); margin: var(--jd-space-8) 0 var(--jd-space-3);
  }
  .jd-blog-post__body h3 {
    font-size: var(--jd-text-xl); font-weight: var(--jd-weight-semibold);
    margin: var(--jd-space-6) 0 var(--jd-space-2);
  }
  .jd-blog-post__body p { margin: 0 0 var(--jd-space-4); }
  .jd-blog-post__body a { color: var(--jd-color-primary); text-underline-offset: 2px; }
  .jd-blog-post__body img { max-width: 100%; height: auto; border-radius: var(--jd-radius-lg); }
  .jd-blog-post__body blockquote {
    margin: var(--jd-space-4) 0; padding-left: var(--jd-space-4);
    border-left: var(--jd-border-medium) solid var(--jd-color-border);
    color: var(--jd-color-muted);
  }
  .jd-blog-post__body pre {
    overflow-x: auto; padding: var(--jd-space-4); border-radius: var(--jd-radius-lg);
    background: var(--jd-color-surface-raised); font-family: var(--jd-font-mono);
    font-size: var(--jd-text-sm);
  }

  .jd-blog-post__footer:empty { display: none; }
  .jd-blog-post__footer {
    max-width: 48rem; margin: var(--jd-space-16) auto 0;
    padding-top: var(--jd-space-8);
    border-top: var(--jd-border-thin) solid var(--jd-color-border);
  }
}`;
