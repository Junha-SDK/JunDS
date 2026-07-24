import { css } from "../../core/styles.js";

/**
 * jd-news-list CSS — v2 NewsList(bm-card + origin 배지 + 항목 사이 divide 선).
 * 네이버 origin은 브랜드 초록(#03C75A), mock은 soft 배지. 제목/설명 2줄 클램프.
 * 스켈레톤은 shimmer. finance 색은 --bm-* → jd 폴백.
 */
export default css`
@layer junds.components {
  jd-news-list {
    --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
    --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
    --jd-fin-border: var(--bm-border, var(--jd-color-border));
    --jd-fin-card: var(--bm-card, var(--jd-color-card));
    --jd-fin-soft: var(--bm-soft-100, color-mix(in srgb, var(--jd-color-foreground) 6%, transparent));

    display: block; box-sizing: border-box; overflow: hidden;
    background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-xl);
    box-shadow: var(--jd-shadow-sm);
    font-family: var(--jd-font-sans); color: var(--jd-fin-text);
  }
  jd-news-list * { box-sizing: border-box; }

  /* 스켈레톤 */
  .jd-news-list__skeleton { padding: var(--jd-space-3); }
  .jd-news-list__skeleton-row { display: flex; flex-direction: column; gap: var(--jd-space-1-5); }
  .jd-news-list__skeleton-row + .jd-news-list__skeleton-row { margin-block-start: var(--jd-space-2); }
  .jd-news-list__bar {
    height: 12px; border-radius: var(--jd-radius-sm);
    background: linear-gradient(90deg,
      var(--jd-fin-soft) 25%,
      color-mix(in srgb, var(--jd-fin-muted) 14%, transparent) 37%,
      var(--jd-fin-soft) 63%);
    background-size: 400% 100%;
    animation: jd-news-shimmer 1.4s ease infinite;
  }
  @keyframes jd-news-shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
  @media (prefers-reduced-motion: reduce) { .jd-news-list__bar { animation: none; } }

  /* 에러/빈 결과 */
  .jd-news-list__message {
    padding: var(--jd-space-3); font-size: var(--jd-text-sm); color: var(--jd-fin-muted);
  }

  /* origin 배지 */
  .jd-news-list__badgewrap {
    display: flex; align-items: center; gap: var(--jd-space-2);
    padding: var(--jd-space-2) var(--jd-space-3) var(--jd-space-1);
  }
  .jd-news-list__badge {
    display: inline-flex; align-items: center;
    padding: 2px var(--jd-space-2); border-radius: var(--jd-radius-full);
    font-size: 11px; font-weight: 700;
    background: var(--jd-fin-soft); color: var(--jd-fin-muted);
  }
  .jd-news-list__badge[data-origin="naver"] { background: #03c75a; color: #fff; }
  .jd-news-list__query { font-size: 11px; color: var(--jd-fin-muted); }

  /* 목록 */
  .jd-news-list__list { list-style: none; margin: 0; padding: 0; }
  .jd-news-list__item + .jd-news-list__item {
    border-block-start: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  .jd-news-list__link {
    display: flex; align-items: flex-start; gap: var(--jd-space-2);
    padding: var(--jd-space-2-5) var(--jd-space-3);
    text-decoration: none; color: inherit;
  }
  .jd-news-list__link:active { background: var(--jd-fin-soft); }
  .jd-news-list__text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .jd-news-list__title {
    font-size: 13.5px; font-weight: 700; line-height: var(--jd-leading-snug);
    color: var(--jd-fin-text);
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .jd-news-list__desc {
    margin-block-start: var(--jd-space-1); font-size: var(--jd-text-xs);
    color: var(--jd-fin-muted);
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .jd-news-list__meta {
    display: flex; align-items: center; gap: var(--jd-space-1-5);
    margin-block-start: var(--jd-space-1-5); font-size: 11px; color: var(--jd-fin-muted);
  }
  .jd-news-list__source { font-weight: 600; }
  .jd-news-list__chevron { flex-shrink: 0; margin-block-start: 2px; color: var(--jd-fin-muted); }
}`;
