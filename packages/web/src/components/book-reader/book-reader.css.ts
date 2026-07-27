import { css } from "../../core/styles.js";

/**
 * v2 매핑: bg-surface min-h-screen, sticky 헤더(surface/90 backdrop-blur + border-b),
 * 상단 2px 스크롤바, max-w-6xl 컨테이너, lg에서 [260px 1fr] 2열(toc-open일 때),
 * 목차 sticky top-24, 본문 prose. 토글/북마크/닫기 = 32px 정사각 hover 버튼.
 */
export default css`
@layer junds.components {
  jd-book-reader {
    position: relative;
    display: block;
    min-height: 100vh;
    background: var(--jd-color-surface);
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
  }

  .jd-book-reader__progressbar {
    position: fixed; inset-block-start: 0; inset-inline: 0;
    height: 2px; z-index: var(--jd-z-sticky);
    background: transparent;
  }
  .jd-book-reader__progressbar-fill {
    display: block; height: 100%; width: 0%;
    background: var(--jd-color-primary);
    transition: width var(--jd-duration-fast) var(--jd-easing-linear);
  }

  .jd-book-reader__header {
    position: sticky; inset-block-start: 0; z-index: var(--jd-z-header);
    background: color-mix(in srgb, var(--jd-color-surface) 90%, transparent);
    backdrop-filter: blur(8px);
    border-bottom: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-book-reader__topbar {
    max-width: 72rem; margin-inline: auto;
    padding: var(--jd-space-2) var(--jd-space-4);
    display: flex; align-items: center; gap: var(--jd-space-2);
  }
  .jd-book-reader__toc-toggle,
  .jd-book-reader__bookmark,
  .jd-book-reader__close {
    flex-shrink: 0; width: 2rem; height: 2rem;
    display: inline-flex; align-items: center; justify-content: center;
    border: 0; background: transparent; cursor: pointer;
    border-radius: var(--jd-radius-md); color: var(--jd-color-foreground);
    font-size: var(--jd-text-md);
    transition: background var(--jd-duration-fast) var(--jd-easing-default);
  }
  .jd-book-reader__toc-toggle:hover,
  .jd-book-reader__bookmark:hover,
  .jd-book-reader__close:hover { background: var(--jd-color-surface-raised); }
  .jd-book-reader__toc-toggle:focus-visible,
  .jd-book-reader__bookmark:focus-visible,
  .jd-book-reader__close:focus-visible,
  .jd-book-reader__toc-link:focus-visible {
    outline: 2px solid var(--jd-color-primary); outline-offset: 2px;
  }
  /* v2 병렬: 핸들러가 있을 때만 노출(bookmarkable / closable) */
  .jd-book-reader__bookmark { display: none; }
  .jd-book-reader__close { display: none; }
  jd-book-reader[bookmarkable] .jd-book-reader__bookmark { display: inline-flex; }
  jd-book-reader[closable] .jd-book-reader__close { display: inline-flex; }
  jd-book-reader[bookmarked] .jd-book-reader__bookmark { color: var(--jd-color-primary-ink); }

  .jd-book-reader__titles { min-width: 0; flex: 1; }
  .jd-book-reader__title {
    margin: 0; font-size: var(--jd-text-sm); font-weight: var(--jd-weight-semibold);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .jd-book-reader__author {
    margin: 0; font-size: 11px; color: var(--jd-color-muted);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .jd-book-reader__pageprogress {
    max-width: 72rem; margin-inline: auto;
    padding: 0 var(--jd-space-4) var(--jd-space-2);
    display: flex; align-items: center; gap: var(--jd-space-2);
  }
  .jd-book-reader__pagebar {
    flex: 1; height: 4px; border-radius: var(--jd-radius-full);
    background: var(--jd-color-border-light); overflow: hidden;
  }
  .jd-book-reader__pagebar-fill {
    display: block; height: 100%; width: 0%;
    background: var(--jd-color-primary);
    transition: width var(--jd-duration-normal) var(--jd-easing-default);
  }
  .jd-book-reader__pagelabel {
    flex-shrink: 0; font-size: 11px; color: var(--jd-color-muted);
    font-variant-numeric: tabular-nums;
  }

  .jd-book-reader__layout {
    max-width: 72rem; margin-inline: auto;
    padding: var(--jd-space-6) var(--jd-space-4);
    display: grid; gap: var(--jd-space-6);
  }
  .jd-book-reader__toc { display: none; }
  @media (min-width: 1024px) {
    jd-book-reader[toc-open] .jd-book-reader__layout { grid-template-columns: 260px 1fr; }
    jd-book-reader[toc-open] .jd-book-reader__toc {
      display: block; position: sticky; inset-block-start: 6rem; align-self: start;
      max-height: calc(100vh - 7rem); overflow-y: auto; padding-right: var(--jd-space-2);
    }
  }

  .jd-book-reader__toc-list { list-style: none; margin: 0; padding: 0; }
  .jd-book-reader__toc-list .jd-book-reader__toc-list { padding-left: var(--jd-space-3); }
  .jd-book-reader__toc-link {
    display: block; padding: var(--jd-space-1-5) var(--jd-space-2);
    border-radius: var(--jd-radius-md);
    font-size: var(--jd-text-sm); color: var(--jd-color-muted);
    text-decoration: none;
    transition: background var(--jd-duration-fast) var(--jd-easing-default),
      color var(--jd-duration-fast) var(--jd-easing-default);
  }
  .jd-book-reader__toc-link:hover { background: var(--jd-color-surface-raised); color: var(--jd-color-foreground); }
  .jd-book-reader__toc-link[data-active] {
    background: color-mix(in srgb, var(--jd-color-primary) 10%, transparent);
    color: var(--jd-color-primary-ink); font-weight: var(--jd-weight-medium);
  }

  .jd-book-reader__body {
    min-width: 0; line-height: var(--jd-leading-relaxed);
  }
  .jd-book-reader__body > :first-child { margin-top: 0; }
  .jd-book-reader__body h2 {
    font-size: var(--jd-text-2xl); font-weight: var(--jd-weight-semibold);
    margin: var(--jd-space-8) 0 var(--jd-space-3);
  }
  .jd-book-reader__body h3 {
    font-size: var(--jd-text-xl); font-weight: var(--jd-weight-semibold);
    margin: var(--jd-space-6) 0 var(--jd-space-2);
  }
  .jd-book-reader__body p { margin: 0 0 var(--jd-space-4); }
  .jd-book-reader__body a { color: var(--jd-color-primary-ink); text-underline-offset: 2px; }

  @media (prefers-reduced-motion: reduce) {
    .jd-book-reader__progressbar-fill,
    .jd-book-reader__pagebar-fill { transition: none; }
  }
}`;
