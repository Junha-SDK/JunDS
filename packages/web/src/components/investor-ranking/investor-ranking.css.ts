/**
 * jd-investor-ranking CSS — v2 finance/InvestorRanking.
 * bm-card → 카드 크롬, bm-num → tabular-nums, bm-up/down(적/청) → 상승·매수색 관례 계승.
 * 투자자색은 열의 인라인 --_c가 나른다(점·1위 배지). 상승/하락은 --jd-fin-up/down.
 * 색 기본값은 :where()로 특이도 0 → 소비자가 태그 셀렉터로 재정의.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-investor-ranking:not(:defined) { display: block; }

  :where(jd-investor-ranking) {
    --jd-fin-foreign: var(--jd-color-danger);
    --jd-fin-institution: #a855f7;
    --jd-fin-individual: var(--jd-color-warning);
    --jd-fin-up: var(--jd-color-danger);
    --jd-fin-down: var(--jd-color-info);
  }
  jd-investor-ranking {
    display: block;
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
  }

  .jd-ir__card {
    overflow: hidden;
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
  }

  .jd-ir__head {
    display: flex; align-items: center; gap: var(--jd-space-2);
    padding: var(--jd-space-2) var(--jd-space-3);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-ir__title { font-size: 12.5px; font-weight: 800; }
  .jd-ir__sub-note {
    margin-inline-start: var(--jd-space-2);
    font-size: 10.5px; font-weight: 700; color: var(--jd-color-muted);
    font-variant-numeric: tabular-nums;
  }

  .jd-ir__grid { display: grid; grid-template-columns: 1fr; }
  @media (min-width: 768px) {
    .jd-ir__grid { grid-template-columns: repeat(3, 1fr); }
  }

  .jd-ir__col { border-inline-end: var(--jd-border-thin) solid var(--jd-color-border); }
  .jd-ir__col[data-last] { border-inline-end: none; }
  @media (max-width: 767.98px) {
    .jd-ir__col { border-inline-end: none; border-block-end: var(--jd-border-thin) solid var(--jd-color-border); }
    .jd-ir__col[data-last] { border-block-end: none; }
  }

  .jd-ir__col-head {
    display: flex; align-items: center; gap: var(--jd-space-1-5);
    padding: 6px var(--jd-space-3);
    background: var(--jd-color-card-hover);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-ir__dot {
    width: 8px; height: 8px; border-radius: var(--jd-radius-full);
    background: var(--_c, var(--jd-color-muted));
  }
  .jd-ir__col-label { font-size: 11.5px; font-weight: 800; }

  .jd-ir__list { margin: 0; padding: 0; list-style: none; }
  .jd-ir__row {
    display: grid; grid-template-columns: 16px 1fr auto; gap: 6px;
    align-items: center;
    padding: 6px var(--jd-space-3);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-ir__row:last-child { border-block-end: none; }

  .jd-ir__rank {
    display: inline-flex; align-items: center; justify-content: center;
    width: 16px; height: 16px; border-radius: var(--jd-radius-full);
    font-size: 10px; font-weight: 800; font-variant-numeric: tabular-nums;
    background: var(--jd-color-card-hover); color: var(--jd-color-muted);
  }
  .jd-ir__rank[data-first] { background: var(--_c, var(--jd-color-primary)); color: #fff; }

  .jd-ir__meta { min-width: 0; }
  .jd-ir__name {
    font-size: 11.5px; font-weight: 800; color: var(--jd-color-foreground);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-ir__row-sub {
    display: flex; align-items: center; gap: var(--jd-space-1-5); margin-block-start: 2px;
  }
  .jd-ir__close {
    font-size: 10px; font-weight: 700; color: var(--jd-color-muted);
    font-variant-numeric: tabular-nums;
  }
  .jd-ir__pct { font-size: 10px; font-weight: 800; font-variant-numeric: tabular-nums; }
  .jd-ir__net {
    font-size: 11.5px; font-weight: 800; white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .jd-ir__pct[data-dir="up"], .jd-ir__net[data-dir="up"] { color: var(--jd-fin-up); }
  .jd-ir__pct[data-dir="down"], .jd-ir__net[data-dir="down"] { color: var(--jd-fin-down); }
}`;
