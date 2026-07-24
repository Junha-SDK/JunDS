import { css } from "../../core/styles.js";

/**
 * v2 값: 카드(bm-card overflow hidden), 컨트롤 바 px-3 py-2 wrap + 하단 보더, 검색·셀렉트
 * bm-soft-100, 시장 세그먼트(활성 accent-strong), 표 11.5px 스크롤(maxHeight), sticky
 * thead bm-soft-100, 홀수행 zebra bm-soft-100, 가격 trend 착색 + ▲/▼, 등락률 up/down,
 * 거래대금 보라(#9333ea). finance 색은 --bm-* → jd 폴백.
 */
export default css`
@layer junds.components {
  jd-live-stock-table {
    --jd-fin-up: var(--bm-up, var(--jd-color-success));
    --jd-fin-down: var(--bm-down, var(--jd-color-danger));
    --jd-fin-neutral: #9333ea;
    --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
    --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
    --jd-fin-border: var(--bm-border, var(--jd-color-border));
    --jd-fin-card: var(--bm-card, var(--jd-color-card));
    --jd-fin-soft: var(--bm-soft-100, color-mix(in srgb, var(--jd-color-foreground) 6%, transparent));
    --jd-fin-accent: var(--bm-accent-strong, var(--jd-color-primary));

    display: block; font-family: var(--jd-font-sans); color: var(--jd-fin-text);
  }
  jd-live-stock-table * { box-sizing: border-box; }

  .jd-lst__card {
    overflow: hidden;
    background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-xl);
  }

  .jd-lst__bar {
    display: flex; align-items: center; gap: var(--jd-space-2); flex-wrap: wrap;
    padding: var(--jd-space-2) var(--jd-space-3);
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  .jd-lst__count { font-size: 12.5px; font-weight: 800; white-space: nowrap; }

  .jd-lst__search {
    flex: 1 1 200px; min-width: 160px;
    padding: 4px var(--jd-space-2-5); font: inherit; font-size: 11.5px;
    color: var(--jd-fin-text); background: var(--jd-fin-soft);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-md);
  }

  .jd-lst__toggle {
    display: inline-flex; overflow: hidden;
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-md);
  }
  .jd-lst__toggle-btn {
    padding: 2px var(--jd-space-2);
    font: inherit; font-size: 10.5px; font-weight: 800;
    background: transparent; color: var(--jd-fin-muted); border: 0; cursor: pointer;
  }
  .jd-lst__toggle-btn[data-active] { background: var(--jd-fin-accent); color: var(--jd-fin-card); }

  .jd-lst__select {
    padding: 4px var(--jd-space-2); font: inherit; font-size: 11px;
    color: var(--jd-fin-text); background: var(--jd-fin-soft);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-md);
  }

  .jd-lst__scroll { overflow-y: auto; overflow-x: auto; }
  .jd-lst__table {
    width: 100%; border-collapse: collapse; font-size: 11.5px;
    font-variant-numeric: tabular-nums;
  }
  .jd-lst__th {
    position: sticky; top: 0; z-index: 1;
    padding: var(--jd-space-1-5) var(--jd-space-3);
    text-align: left; font-size: 10.5px; font-weight: 800; color: var(--jd-fin-muted);
    background: var(--jd-fin-soft);
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  .jd-lst__th[data-right] { text-align: right; }

  .jd-lst__row {
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
    cursor: pointer;
  }
  .jd-lst__row:nth-child(even) { background: var(--jd-fin-soft); }
  .jd-lst__row:hover { background: color-mix(in srgb, var(--jd-fin-accent) 6%, transparent); }
  .jd-lst__row:focus-visible {
    outline: var(--jd-border-thin) solid var(--jd-fin-accent); outline-offset: -2px;
  }

  .jd-lst__num, .jd-lst__name-cell, .jd-lst__sector,
  .jd-lst__price, .jd-lst__pct, .jd-lst__vol {
    padding: var(--jd-space-1-5) var(--jd-space-3);
  }
  .jd-lst__num { font-size: 10.5px; font-weight: 700; color: var(--jd-fin-muted); }

  .jd-lst__name-cell { display: flex; flex-direction: column; line-height: 1.25; }
  .jd-lst__name { font-weight: 800; color: var(--jd-fin-text); }
  .jd-lst__sub {
    font-size: 9.5px; font-weight: 700; color: var(--jd-fin-muted);
    font-variant-numeric: tabular-nums;
  }

  .jd-lst__sector { color: var(--jd-fin-muted); }
  .jd-lst__tag {
    display: inline-block;
    font-size: 9.5px; font-weight: 800; color: var(--jd-fin-muted);
    background: var(--jd-fin-soft); border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-full); padding: 1px var(--jd-space-1-5);
  }

  .jd-lst__price, .jd-lst__pct, .jd-lst__vol { font-weight: 800; }
  .jd-lst__price[data-right], .jd-lst__pct[data-right], .jd-lst__vol[data-right] { text-align: right; }
  .jd-lst__price[data-trend="up"] { color: var(--jd-fin-up); }
  .jd-lst__price[data-trend="down"] { color: var(--jd-fin-down); }
  .jd-lst__price[data-trend="flat"] { color: var(--jd-fin-text); }
  .jd-lst__pct[data-dir="up"] { color: var(--jd-fin-up); }
  .jd-lst__pct[data-dir="down"] { color: var(--jd-fin-down); }
  .jd-lst__vol { color: var(--jd-fin-neutral); font-weight: 700; }

  .jd-lst__empty {
    padding: var(--jd-space-6) var(--jd-space-3);
    text-align: center; font-size: 12px; font-weight: 700; color: var(--jd-fin-muted);
  }
}`;
