import { css } from "../../core/styles.js";

/**
 * v2 값: bm-card-lg(카드+테두리+radius 16), section-head(px20 py14 하단선), 문장 13.5px
 * leading-relaxed + 번호 사각칩 20, 키워드 푸터 상단선. 톤칩 px8 h24 radius-md. finance
 * 색은 --bm-* → jd 폴백. 스켈레톤은 shimmer 애니메이션.
 */
export default css`
@layer junds.components {
  jd-theme-news-summary {
    --jd-fin-up: var(--bm-up, var(--jd-color-success));
    --jd-fin-down: var(--bm-down, var(--jd-color-danger));
    --jd-fin-up-soft: var(--bm-up-soft, color-mix(in srgb, var(--jd-color-success) 14%, transparent));
    --jd-fin-down-soft: var(--bm-down-soft, color-mix(in srgb, var(--jd-color-danger) 14%, transparent));
    --jd-fin-accent: var(--bm-accent-strong, var(--jd-color-primary));
    --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
    --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
    --jd-fin-border: var(--bm-border, var(--jd-color-border));
    --jd-fin-card: var(--bm-card, var(--jd-color-card));
    --jd-fin-soft: var(--bm-soft-100, color-mix(in srgb, var(--jd-color-foreground) 6%, transparent));

    display: block; box-sizing: border-box;
    background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-2xl); overflow: hidden;
    box-shadow: var(--jd-shadow-sm);
    font-family: var(--jd-font-sans); color: var(--jd-fin-text);
  }
  jd-theme-news-summary * { box-sizing: border-box; }

  /* 스켈레톤 */
  jd-theme-news-summary .jd-theme-news-summary__skeleton { padding: var(--jd-space-4); }
  jd-theme-news-summary .jd-theme-news-summary__bar {
    height: 12px; margin-block-end: var(--jd-space-2);
    border-radius: var(--jd-radius-sm);
    background: linear-gradient(90deg,
      var(--jd-fin-soft) 25%,
      color-mix(in srgb, var(--jd-fin-muted) 14%, transparent) 37%,
      var(--jd-fin-soft) 63%);
    background-size: 400% 100%;
    animation: jd-tns-shimmer 1.4s ease infinite;
  }
  jd-theme-news-summary .jd-theme-news-summary__bar:first-child { height: 16px; }
  jd-theme-news-summary .jd-theme-news-summary__bar:last-child { margin-block-end: 0; }
  @keyframes jd-tns-shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
  @media (prefers-reduced-motion: reduce) {
    jd-theme-news-summary .jd-theme-news-summary__bar { animation: none; }
  }

  /* 빈 결과 */
  jd-theme-news-summary .jd-theme-news-summary__empty {
    padding: var(--jd-space-4); font-size: var(--jd-text-xs);
    color: var(--jd-fin-muted);
  }

  /* 헤더 */
  jd-theme-news-summary .jd-theme-news-summary__head {
    display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-3);
    padding: var(--jd-space-3-5) var(--jd-space-5);
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  jd-theme-news-summary .jd-theme-news-summary__title {
    display: inline-flex; align-items: center; gap: var(--jd-space-2);
    font-size: var(--jd-text-sm); font-weight: 800; letter-spacing: var(--jd-tracking-tight);
    min-width: 0;
  }
  jd-theme-news-summary .jd-theme-news-summary__icon { color: var(--jd-fin-accent); flex-shrink: 0; }
  jd-theme-news-summary .jd-theme-news-summary__meta {
    font-size: 10.5px; font-weight: 700; letter-spacing: var(--jd-tracking-wide);
    text-transform: uppercase; color: var(--jd-fin-muted);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  jd-theme-news-summary .jd-theme-news-summary__tone {
    display: grid; place-items: center; flex-shrink: 0;
    height: 24px; padding: 0 var(--jd-space-2); border-radius: var(--jd-radius-md);
    font-size: 11px; font-weight: 800; font-variant-numeric: tabular-nums;
    color: var(--jd-fin-muted); background: var(--jd-fin-soft);
  }
  jd-theme-news-summary .jd-theme-news-summary__tone[data-state="positive"] { color: color-mix(in srgb, var(--jd-fin-up) 65%, var(--jd-color-foreground)); background: var(--jd-fin-up-soft); }
  jd-theme-news-summary .jd-theme-news-summary__tone[data-state="negative"] { color: color-mix(in srgb, var(--jd-fin-down) 65%, var(--jd-color-foreground)); background: var(--jd-fin-down-soft); }

  /* 문장 목록 */
  jd-theme-news-summary .jd-theme-news-summary__list {
    list-style: none; margin: 0; counter-reset: jd-tns;
    padding: var(--jd-space-4) var(--jd-space-5);
    display: flex; flex-direction: column; gap: var(--jd-space-2-5);
  }
  jd-theme-news-summary .jd-theme-news-summary__item {
    counter-increment: jd-tns;
    position: relative; padding-inline-start: 30px;
    font-size: 13.5px; line-height: var(--jd-leading-relaxed); color: var(--jd-fin-text);
  }
  jd-theme-news-summary .jd-theme-news-summary__item::before {
    content: counter(jd-tns);
    position: absolute; inset-inline-start: 0; inset-block-start: 1px;
    width: 20px; height: 20px; border-radius: var(--jd-radius-md);
    display: grid; place-items: center;
    font-size: 10.5px; font-weight: 800; font-variant-numeric: tabular-nums;
    background: var(--jd-fin-soft); color: var(--jd-fin-muted);
  }

  /* 키워드 푸터 */
  jd-theme-news-summary .jd-theme-news-summary__terms {
    display: flex; align-items: center; gap: var(--jd-space-1-5); flex-wrap: wrap;
    padding: var(--jd-space-3) var(--jd-space-5);
    border-block-start: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  jd-theme-news-summary .jd-theme-news-summary__terms-label {
    font-size: 10.5px; font-weight: 700; letter-spacing: var(--jd-tracking-wide);
    text-transform: uppercase; color: var(--jd-fin-muted); margin-inline-end: var(--jd-space-1);
  }
  jd-theme-news-summary .jd-theme-news-summary__term-list {
    display: contents;
  }
  jd-theme-news-summary .jd-theme-news-summary__chip {
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    padding: var(--jd-space-0-5) var(--jd-space-2); border-radius: var(--jd-radius-full);
    font-size: var(--jd-text-xs); font-weight: 700;
    background: var(--jd-fin-soft); color: var(--jd-fin-text);
  }
  jd-theme-news-summary .jd-theme-news-summary__chip-count {
    font-size: 10px; font-weight: 700; font-variant-numeric: tabular-nums; opacity: .6;
  }
}`;
