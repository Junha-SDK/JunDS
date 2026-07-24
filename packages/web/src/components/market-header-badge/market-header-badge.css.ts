import { css } from "../../core/styles.js";

/**
 * jd-market-header-badge CSS — v2 finance/MarketHeader.
 * accent(=primary) 틴트가 정상 배지 바탕, 상승/하락 태그는 finance 관례(적/청).
 * 색 기본값은 :where()로 특이도 0 → 소비자가 태그 셀렉터로 재정의한다.
 */
export default css`
@layer junds.components {
  :where(jd-market-header-badge) {
    --jd-fin-up: var(--jd-color-danger);
    --jd-fin-down: var(--jd-color-info);
    --jd-fin-accent: var(--jd-color-primary);
    --jd-fin-accent-strong: var(--jd-color-primary);
  }
  jd-market-header-badge { display: inline-block; font-family: var(--jd-font-sans); }
  jd-market-header-badge:not(:defined) { display: inline-block; }

  .jd-mhb {
    display: inline-flex; align-items: center; gap: var(--jd-space-2);
    padding: var(--jd-space-1-5) var(--jd-space-3);
    border-radius: var(--jd-radius-xl);
    font-size: 12.5px; font-variant-numeric: tabular-nums;
    background: var(--jd-color-card);
  }
  .jd-mhb[data-state="ready"] {
    background: color-mix(in srgb, var(--jd-fin-accent) 10%, transparent);
  }
  .jd-mhb[data-state="loading"],
  .jd-mhb[data-state="empty"] {
    background: color-mix(in srgb, var(--jd-color-muted) 10%, transparent);
  }

  .jd-mhb__msg { font-weight: 800; color: var(--jd-color-muted); }
  .jd-mhb__ready { display: inline-flex; align-items: center; gap: var(--jd-space-2); }

  .jd-mhb__name { font-weight: 800; color: var(--jd-fin-accent-strong); }
  .jd-mhb__value { font-weight: 800; color: var(--jd-color-foreground); }

  .jd-mhb__tag {
    padding: 1px 6px; border-radius: var(--jd-radius-sm);
    font-size: 11px; font-weight: 800; font-variant-numeric: tabular-nums;
  }
  .jd-mhb__tag[data-dir="up"] {
    background: color-mix(in srgb, var(--jd-fin-up) 12%, transparent); color: var(--jd-fin-up);
  }
  .jd-mhb__tag[data-dir="down"] {
    background: color-mix(in srgb, var(--jd-fin-down) 12%, transparent); color: var(--jd-fin-down);
  }

  .jd-mhb__status { font-size: 10px; font-weight: 700; color: var(--jd-color-muted); }
  .jd-mhb__status[hidden] { display: none; }
}`;
