import { css } from "../../core/styles.js";

/**
 * jd-market-alert-banner CSS — v2 finance/MarketAlertBanner.
 * 상승/하락 색은 finance 관례(상승=적, 하락=청)를 :where()로 특이도 0에 두어
 * 소비자가 태그 셀렉터로 재정의할 수 있게 한다. warning 계열이 배너 아이덴티티.
 */
export default css`
@layer junds.components {
  :where(jd-market-alert-banner) {
    --jd-fin-up: var(--jd-color-danger);
    --jd-fin-down: var(--jd-color-info);
    --jd-fin-warning: var(--jd-color-warning);
    --jd-fin-up-soft: color-mix(in srgb, var(--jd-color-danger) 14%, transparent);
    --jd-fin-down-soft: color-mix(in srgb, var(--jd-color-info) 14%, transparent);
  }
  jd-market-alert-banner { display: block; font-family: var(--jd-font-sans); }
  jd-market-alert-banner:not(:defined) { display: block; }

  .jd-mab {
    display: flex; align-items: center; gap: var(--jd-space-2-5);
    padding: var(--jd-space-2-5) var(--jd-space-3-5);
    border-radius: var(--jd-radius-xl);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    background: var(--jd-color-card);
    color: inherit; text-decoration: none; overflow: hidden;
    transition: box-shadow 0.2s ease;
  }
  .jd-mab:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
  .jd-mab:focus-visible {
    outline: var(--jd-border-medium) solid var(--jd-color-primary); outline-offset: 2px;
  }

  .jd-mab__icon {
    display: grid; place-items: center; flex-shrink: 0;
    width: 28px; height: 28px; border-radius: var(--jd-radius-full);
    background: var(--jd-fin-warning); color: #fff;
  }

  .jd-mab__body { flex: 1; min-width: 0; }
  .jd-mab__meta { display: flex; align-items: center; gap: var(--jd-space-1-5); flex-wrap: wrap; }
  .jd-mab__time {
    font-size: 11.5px; font-weight: 800; padding: 1px 6px;
    border-radius: var(--jd-radius-sm); font-variant-numeric: tabular-nums;
    background: color-mix(in srgb, var(--jd-fin-warning) 12%, transparent);
    color: color-mix(in srgb, var(--jd-fin-warning) 55%, var(--jd-color-foreground));
  }
  .jd-mab__label {
    font-size: 11.5px; font-weight: 800;
    color: color-mix(in srgb, var(--jd-fin-warning) 55%, var(--jd-color-foreground));
  }

  .jd-mab__headline {
    margin: 2px 0 0; font-size: 12.5px; font-weight: 700; line-height: 1.35;
    color: var(--jd-color-foreground);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-mab__symbol { font-weight: 800; }
  .jd-mab__dot { margin: 0 4px; color: var(--jd-color-muted); }

  .jd-mab__pct {
    flex-shrink: 0; display: inline-flex; align-items: center; gap: 2px;
    font-size: 12.5px; font-weight: 800; padding: var(--jd-space-1) var(--jd-space-2);
    border-radius: var(--jd-radius-md); font-variant-numeric: tabular-nums;
  }
  .jd-mab__pct[data-dir="up"] { background: var(--jd-fin-up-soft); color: var(--jd-fin-up); }
  .jd-mab__pct[data-dir="down"] { background: var(--jd-fin-down-soft); color: var(--jd-fin-down); }
}`;
