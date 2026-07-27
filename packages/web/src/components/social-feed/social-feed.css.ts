import { css } from "../../core/styles.js";

/**
 * v2 매핑: max-w-2xl 중앙, 스토리 바 = overflow-x-auto + border-b, 스토리 링 그라디언트,
 * 게시물 divide-y(리스트 항목 사이 구분선), sentinel 중앙 정렬 spinner/끝 문구.
 */
export default css`
@layer junds.components {
  jd-social-feed {
    display: block; max-width: 42rem; margin-inline: auto;
    font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
  }

  .jd-social-feed__stories {
    padding: var(--jd-space-3) var(--jd-space-2);
    border-bottom: var(--jd-border-thin) solid var(--jd-color-border);
    overflow-x: auto;
  }
  .jd-social-feed__stories-list {
    display: flex; align-items: flex-start; gap: var(--jd-space-3);
    margin: 0; padding: 0; list-style: none;
  }
  .jd-social-feed__story {
    display: inline-flex; flex-direction: column; align-items: center;
    gap: var(--jd-space-1); width: 4rem;
    border: 0; background: transparent; cursor: pointer; padding: 0;
  }
  .jd-social-feed__story:focus-visible { outline: 2px solid var(--jd-color-primary); outline-offset: 2px; border-radius: var(--jd-radius-md); }
  .jd-social-feed__story-ring {
    display: inline-flex; padding: 2px; border-radius: var(--jd-radius-full);
    background: var(--jd-gradient-sunset);
  }
  .jd-social-feed__story[data-state="seen"] .jd-social-feed__story-ring { background: var(--jd-color-border); }
  .jd-social-feed__story[data-state="live"] .jd-social-feed__story-ring { background: var(--jd-color-danger); }
  .jd-social-feed__story-avatar {
    width: 3.25rem; height: 3.25rem; border-radius: var(--jd-radius-full);
    object-fit: cover; display: block;
    border: 2px solid var(--jd-color-surface); background: var(--jd-color-surface-raised);
  }
  .jd-social-feed__story-avatar--ph {
    display: inline-flex; align-items: center; justify-content: center;
    color: var(--jd-color-primary-ink); font-weight: var(--jd-weight-semibold);
    font-size: var(--jd-text-lg);
  }
  .jd-social-feed__story-name {
    max-width: 100%; font-size: 11px; color: var(--jd-color-muted);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .jd-social-feed__list { list-style: none; margin: 0; padding: 0; }
  .jd-social-feed__item { padding: var(--jd-space-3) 0; }
  .jd-social-feed__item + .jd-social-feed__item {
    border-top: var(--jd-border-thin) solid var(--jd-color-border);
  }

  .jd-social-feed__empty {
    display: flex; flex-direction: column; align-items: center; text-align: center;
    gap: var(--jd-space-2); padding: var(--jd-space-16) var(--jd-space-4);
  }
  .jd-social-feed__empty-icon { font-size: var(--jd-text-4xl); }
  .jd-social-feed__empty-title { margin: 0; font-weight: var(--jd-weight-semibold); }
  .jd-social-feed__empty-desc { margin: 0; font-size: var(--jd-text-sm); color: var(--jd-color-muted); }

  .jd-social-feed__sentinel {
    padding: var(--jd-space-6) 0;
    display: flex; align-items: center; justify-content: center;
    color: var(--jd-color-muted);
  }
  .jd-social-feed__end { margin: 0; font-size: var(--jd-text-xs); color: var(--jd-color-muted); }
  .jd-social-feed__spinner {
    width: 1.25rem; height: 1.25rem; color: var(--jd-color-primary-ink);
    animation: jd-social-feed-spin 0.7s linear infinite;
  }
  @keyframes jd-social-feed-spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) {
    .jd-social-feed__spinner { animation-duration: 1.6s; }
  }
}`;
