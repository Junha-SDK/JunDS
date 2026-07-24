import { css } from "../../core/styles.js";

/**
 * v2 값: 카드 크롬(bm-card + border), 왼쪽 배지 컬럼(그라디언트 페이드 + 우측 보더),
 * 항목 12px extrabold, 이름 --bm-text, 가격/등락 up→--bm-up·down→--bm-down, 거래대금
 * 10.5px --bm-muted. finance 색은 --bm-* → jd 폴백(형제 카드 동형). 흐름·정지는 jd-marquee.
 */
export default css`
@layer junds.components {
  jd-live-ticker {
    --jd-fin-up: var(--bm-up, var(--jd-color-success));
    --jd-fin-down: var(--bm-down, var(--jd-color-danger));
    --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
    --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
    --jd-fin-border: var(--bm-border, var(--jd-color-border));
    --jd-fin-card: var(--bm-card, var(--jd-color-card));

    display: flex; align-items: stretch; overflow: hidden;
    background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-lg);
    font-family: var(--jd-font-sans); color: var(--jd-fin-text);
  }
  jd-live-ticker * { box-sizing: border-box; }

  .jd-lt__badge {
    display: inline-flex; align-items: center; gap: var(--jd-space-1-5);
    flex-shrink: 0; z-index: 1;
    padding-inline: var(--jd-space-3);
    background: linear-gradient(90deg, var(--jd-fin-card) 80%, transparent);
    border-inline-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  .jd-lt__dot { flex-shrink: 0; }
  .jd-lt__caption {
    font-size: 10.5px; font-weight: 800; white-space: nowrap;
    color: var(--jd-fin-muted); font-variant-numeric: tabular-nums;
  }

  .jd-lt__stage { position: relative; flex: 1 1 auto; min-width: 0; overflow: hidden; }
  .jd-lt__marquee { display: block; padding-block: var(--jd-space-2); }

  .jd-lt__item {
    display: inline-flex; align-items: center; gap: var(--jd-space-1-5);
    font-size: 12px; white-space: nowrap;
  }
  .jd-lt__name { font-weight: 800; color: var(--jd-fin-text); }
  .jd-lt__price, .jd-lt__pct {
    font-weight: 800; font-variant-numeric: tabular-nums;
  }
  .jd-lt__price[data-dir="up"], .jd-lt__pct[data-dir="up"] { color: var(--jd-fin-up); }
  .jd-lt__price[data-dir="down"], .jd-lt__pct[data-dir="down"] { color: var(--jd-fin-down); }
  .jd-lt__vol {
    font-size: 10.5px; font-weight: 700; color: var(--jd-fin-muted);
    font-variant-numeric: tabular-nums;
  }
}`;
