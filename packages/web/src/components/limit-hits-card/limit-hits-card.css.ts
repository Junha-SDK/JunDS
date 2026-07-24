import { css } from "../../core/styles.js";

/**
 * jd-limit-hits-card CSS — v2 finance/MarketSignals `LimitHitsCard`.
 * 카드 크롬·구분선·각주 규칙은 close-picks-card.css에서 상속(부모가 채택)한다.
 * 여기서는 limit-hit 고유 행(.jd-lhc__*)만 정의한다.
 */
export default css`
@layer junds.components {
  .jd-lhc__row {
    display: flex; align-items: flex-start; justify-content: space-between; gap: var(--jd-space-3);
    padding: var(--jd-space-2-5) var(--jd-space-4);
  }

  .jd-lhc__main { min-width: 0; flex: 1; }
  .jd-lhc__nameline {
    display: flex; align-items: center; gap: var(--jd-space-1-5); flex-wrap: wrap;
  }
  .jd-lhc__name {
    font-size: 13.5px; font-weight: 800; color: var(--jd-color-foreground);
    text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-lhc__name:hover { text-decoration: underline; }
  .jd-lhc__catalyst {
    margin-block-start: 2px; font-size: 11px; color: var(--jd-color-muted);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .jd-lhc__pill {
    display: inline-flex; align-items: center; gap: 3px;
    padding: 1px 7px; border-radius: var(--jd-radius-full);
    font-size: 10.5px; font-weight: 800; font-variant-numeric: tabular-nums;
    background: color-mix(in srgb, var(--jd-color-muted) 12%, transparent);
    color: var(--jd-color-muted);
    border: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-lhc__pill[data-clean="true"] {
    background: color-mix(in srgb, var(--jd-fin-up) 14%, transparent);
    color: var(--jd-fin-up);
    border-color: color-mix(in srgb, var(--jd-fin-up) 35%, transparent);
  }
  .jd-lhc__pill-icon { display: inline-flex; }

  .jd-lhc__figures { flex-shrink: 0; text-align: end; }
  .jd-lhc__pct { font-size: 13.5px; font-weight: 800; font-variant-numeric: tabular-nums; }
  .jd-lhc__pct[data-dir="up"] { color: var(--jd-fin-up); }
  .jd-lhc__pct[data-dir="down"] { color: var(--jd-fin-down); }
  .jd-lhc__amount {
    margin-block-start: 2px; font-size: 10.5px; font-weight: 700;
    color: var(--jd-color-muted); font-variant-numeric: tabular-nums;
  }
}`;
