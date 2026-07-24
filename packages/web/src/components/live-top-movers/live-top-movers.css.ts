import { css } from "../../core/styles.js";

/**
 * v2 값: 카드(bm-card overflow hidden), 헤더 px-3 py-2 + 하단 보더, 3열 그리드(md 이상),
 * 열 헤더 bm-soft-100 + tone 점, 행 grid[16px 1fr auto], 1위 rank 배지 tone색, 등락률
 * up/down 착색, 거래대금 보라(#9333ea). 시장 토글 세그먼트(활성 accent-strong 배경).
 * finance 색은 --bm-* → jd 폴백. 형제 jd-investor-ranking과 동일 관용구.
 */
export default css`
@layer junds.components {
  jd-live-top-movers {
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
  jd-live-top-movers * { box-sizing: border-box; }

  .jd-ltm__card {
    overflow: hidden;
    background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-xl);
  }

  .jd-ltm__head {
    display: flex; align-items: center; gap: var(--jd-space-2); flex-wrap: wrap;
    padding: var(--jd-space-2) var(--jd-space-3);
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  .jd-ltm__title { font-size: 12.5px; font-weight: 800; }
  .jd-ltm__source {
    margin-inline-start: auto;
    font-size: 11.5px; font-weight: 700; color: var(--jd-fin-muted);
    font-variant-numeric: tabular-nums;
  }
  .jd-ltm__source[hidden] { display: none; }

  .jd-ltm__toggle {
    display: inline-flex; overflow: hidden;
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-md);
  }
  .jd-ltm__toggle-btn {
    padding: 2px var(--jd-space-2);
    font: inherit; font-size: 10.5px; font-weight: 800;
    background: transparent; color: var(--jd-fin-muted);
    border: 0; cursor: pointer;
  }
  .jd-ltm__toggle-btn[data-active] { background: var(--jd-fin-accent); color: var(--jd-fin-card); }

  .jd-ltm__grid { display: grid; grid-template-columns: 1fr; }
  @media (min-width: 768px) {
    .jd-ltm__grid { grid-template-columns: repeat(3, 1fr); }
  }

  .jd-ltm__col {
    --_tone: var(--jd-fin-muted);
    border-inline-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  .jd-ltm__col[data-tone="up"] { --_tone: var(--jd-fin-up); }
  .jd-ltm__col[data-tone="down"] { --_tone: var(--jd-fin-down); }
  .jd-ltm__col[data-tone="neutral"] { --_tone: var(--jd-fin-neutral); }
  .jd-ltm__col[data-last] { border-inline-end: none; }
  @media (max-width: 767.98px) {
    .jd-ltm__col { border-inline-end: none; border-block-end: var(--jd-border-thin) solid var(--jd-fin-border); }
    .jd-ltm__col[data-last] { border-block-end: none; }
  }

  .jd-ltm__col-head {
    display: flex; align-items: center; gap: var(--jd-space-1-5);
    padding: 6px var(--jd-space-3);
    background: var(--jd-fin-soft);
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  .jd-ltm__col-dot {
    width: 8px; height: 8px; border-radius: var(--jd-radius-full);
    background: var(--_tone);
  }
  .jd-ltm__col-label { font-size: 11.5px; font-weight: 800; }

  .jd-ltm__list { margin: 0; padding: 0; list-style: none; }
  .jd-ltm__row {
    display: grid; grid-template-columns: 16px 1fr auto; gap: var(--jd-space-2);
    align-items: center;
    padding: 6px var(--jd-space-3);
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  .jd-ltm__row:last-child { border-block-end: none; }
  .jd-ltm__empty {
    padding: var(--jd-space-4) var(--jd-space-3);
    font-size: 11.5px; font-weight: 700; color: var(--jd-fin-muted); text-align: center;
  }

  .jd-ltm__rank {
    display: inline-flex; align-items: center; justify-content: center;
    width: 16px; height: 16px; border-radius: var(--jd-radius-full);
    font-size: 10px; font-weight: 800; font-variant-numeric: tabular-nums;
    background: var(--jd-fin-soft); color: var(--jd-fin-muted);
  }
  .jd-ltm__rank[data-first] { background: var(--_tone); color: #fff; }

  .jd-ltm__meta { min-width: 0; }
  .jd-ltm__name {
    font-size: 11.5px; font-weight: 800; color: var(--jd-fin-text);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-ltm__row-sub {
    display: flex; align-items: center; gap: var(--jd-space-1-5); margin-block-start: 2px;
  }
  .jd-ltm__price {
    font-size: 10px; font-weight: 700; color: var(--jd-fin-muted);
    font-variant-numeric: tabular-nums;
  }
  .jd-ltm__code {
    font-size: 9px; font-weight: 700; color: var(--jd-fin-muted);
    background: var(--jd-fin-soft); border-radius: var(--jd-radius-full);
    padding-inline: var(--jd-space-1); font-variant-numeric: tabular-nums;
  }
  .jd-ltm__value {
    font-size: 12px; font-weight: 800; white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .jd-ltm__value[data-dir="up"] { color: var(--jd-fin-up); }
  .jd-ltm__value[data-dir="down"] { color: var(--jd-fin-down); }
  .jd-ltm__value[data-dir="neutral"] { color: var(--jd-fin-neutral); }
}`;
