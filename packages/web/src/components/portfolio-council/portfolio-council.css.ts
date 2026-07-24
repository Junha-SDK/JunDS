import { css } from "../../core/styles.js";

/**
 * v2 값: bm-card-lg + section-head, bm-table(th 좌정렬·소형·muted, td py). 손익 up/down 색,
 * 수량·평단 muted. 괴리 행 warning 6% 틴트 + ⚠칩(warning 18% bg). 이름 링크 hover underline.
 * 위원회 이모지 우정렬. finance 색은 --bm-* → jd 폴백.
 */
export default css`
@layer junds.components {
  jd-portfolio-council {
    --jd-fin-up: var(--bm-up, var(--jd-color-success));
    --jd-fin-down: var(--bm-down, var(--jd-color-danger));
    --jd-fin-accent: var(--bm-accent-strong, var(--jd-color-primary));
    --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
    --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
    --jd-fin-border: var(--bm-border, var(--jd-color-border));
    --jd-fin-card: var(--bm-card, var(--jd-color-card));
    --jd-fin-soft: var(--bm-soft-100, color-mix(in srgb, var(--jd-color-foreground) 6%, transparent));
    --jd-fin-warning: var(--bm-warning, var(--jd-color-warning));

    display: block; box-sizing: border-box;
    background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-2xl); overflow: hidden;
    box-shadow: var(--jd-shadow-sm);
    font-family: var(--jd-font-sans); color: var(--jd-fin-text);
  }
  jd-portfolio-council * { box-sizing: border-box; }

  /* 스켈레톤 */
  jd-portfolio-council .jd-portfolio-council__skeleton {
    height: 128px; margin: var(--jd-space-5);
    border-radius: var(--jd-radius-lg);
    background: linear-gradient(90deg,
      var(--jd-fin-soft) 25%,
      color-mix(in srgb, var(--jd-fin-muted) 14%, transparent) 37%,
      var(--jd-fin-soft) 63%);
    background-size: 400% 100%;
    animation: jd-pc-shimmer 1.4s ease infinite;
  }
  @keyframes jd-pc-shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
  @media (prefers-reduced-motion: reduce) {
    jd-portfolio-council .jd-portfolio-council__skeleton { animation: none; }
  }

  /* 빈 상태 */
  jd-portfolio-council .jd-portfolio-council__empty {
    display: flex; flex-direction: column; align-items: center; text-align: center;
    gap: var(--jd-space-2); padding: var(--jd-space-12) var(--jd-space-6);
  }
  jd-portfolio-council .jd-portfolio-council__empty-icon {
    color: var(--jd-fin-muted); margin-block-end: var(--jd-space-1);
  }
  jd-portfolio-council .jd-portfolio-council__empty-title {
    font-size: var(--jd-text-md); font-weight: 800; color: var(--jd-fin-text);
  }
  jd-portfolio-council .jd-portfolio-council__empty-desc {
    font-size: var(--jd-text-xs); color: var(--jd-fin-muted); max-width: 30ch;
  }

  /* 헤더 */
  jd-portfolio-council .jd-portfolio-council__head {
    display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-3);
    padding: var(--jd-space-3-5) var(--jd-space-5);
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  jd-portfolio-council .jd-portfolio-council__title {
    display: inline-flex; align-items: center; gap: var(--jd-space-2);
    font-size: var(--jd-text-sm); font-weight: 800; letter-spacing: var(--jd-tracking-tight);
  }
  jd-portfolio-council .jd-portfolio-council__icon { color: var(--jd-fin-accent); }
  jd-portfolio-council .jd-portfolio-council__count {
    font-size: 11px; font-weight: 700; color: var(--jd-fin-muted);
  }

  /* 표 */
  jd-portfolio-council .jd-portfolio-council__scroll { overflow-x: auto; }
  jd-portfolio-council .jd-portfolio-council__caption {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
  }
  jd-portfolio-council .jd-portfolio-council__table {
    width: 100%; border-collapse: collapse; font-size: var(--jd-text-sm);
  }
  jd-portfolio-council .jd-portfolio-council__table th {
    text-align: start; font-size: 10.5px; font-weight: 700;
    letter-spacing: var(--jd-tracking-wide); text-transform: uppercase;
    color: var(--jd-fin-muted); padding: var(--jd-space-2-5) var(--jd-space-4);
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
    white-space: nowrap;
  }
  jd-portfolio-council .jd-portfolio-council__table td {
    padding: var(--jd-space-3) var(--jd-space-4); vertical-align: middle;
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
    white-space: nowrap;
  }
  jd-portfolio-council .jd-portfolio-council__table tbody tr:last-child td { border-block-end: none; }
  jd-portfolio-council .jd-portfolio-council__table tr[data-divergence] td {
    background: color-mix(in srgb, var(--jd-fin-warning) 8%, transparent);
  }

  jd-portfolio-council .jd-portfolio-council__num {
    font-variant-numeric: tabular-nums; color: var(--jd-fin-text);
  }
  jd-portfolio-council .jd-portfolio-council__num[data-tone="muted"] { color: var(--jd-fin-muted); }
  jd-portfolio-council .jd-portfolio-council__num[data-tone="up"] { color: var(--jd-fin-up); }
  jd-portfolio-council .jd-portfolio-council__num[data-tone="down"] { color: var(--jd-fin-down); }
  jd-portfolio-council .jd-portfolio-council__strong { font-weight: 800; }

  /* 종목명 */
  jd-portfolio-council .jd-portfolio-council__name {
    font: inherit; font-weight: 800; color: var(--jd-fin-text);
    background: none; border: 0; padding: 0; cursor: pointer;
    text-decoration: none;
  }
  jd-portfolio-council a.jd-portfolio-council__name:hover,
  jd-portfolio-council button.jd-portfolio-council__name:hover { text-decoration: underline; }
  jd-portfolio-council .jd-portfolio-council__name:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring); border-radius: var(--jd-radius-sm);
  }
  jd-portfolio-council .jd-portfolio-council__warn {
    margin-inline-start: var(--jd-space-1-5); font-size: 10px; font-weight: 800;
    padding: 1px var(--jd-space-1-5); border-radius: var(--jd-radius-sm);
    background: color-mix(in srgb, var(--jd-fin-warning) 18%, transparent);
    color: color-mix(in srgb, var(--jd-fin-warning) 65%, var(--jd-color-foreground));
  }

  /* 위원회 이모지 */
  jd-portfolio-council .jd-portfolio-council__emojis {
    display: flex; align-items: center; justify-content: flex-end; gap: 2px;
    font-size: 14px; line-height: var(--jd-leading-none);
  }

  /* 의견 */
  jd-portfolio-council .jd-portfolio-council__verdict { font-weight: 800; }
  jd-portfolio-council .jd-portfolio-council__verdict[data-tone="up"] { color: var(--jd-fin-up); }
  jd-portfolio-council .jd-portfolio-council__verdict[data-tone="down"] { color: var(--jd-fin-down); }
  jd-portfolio-council .jd-portfolio-council__verdict[data-tone="flat"] { color: var(--jd-fin-muted); }
  jd-portfolio-council .jd-portfolio-council__ratio {
    margin-inline-start: var(--jd-space-1-5); font-size: 10.5px; font-weight: 700;
    font-variant-numeric: tabular-nums; color: var(--jd-fin-muted);
  }
}`;
