import { css } from "../../core/styles.js";

/**
 * v2 값: 카드(bm-card, overflow hidden), 헤더 px-4 py-2.5 + 하단 보더, 표 12px, 헤더/합계
 * 행 bm-soft-100 배경, 잔량 막대(매도 청 8%/매수 적 8%), 호가 셀 옅은 틴트(4%) + 색,
 * 현재가 띠 accent 8% 배경 13px. finance 색은 --bm-* → jd 폴백(형제 카드 동형).
 * 색 관례: 매도=하락색(--jd-fin-down), 매수=상승색(--jd-fin-up).
 */
export default css`
@layer junds.components {
  jd-live-order-book {
    --jd-fin-up: var(--bm-up, var(--jd-color-success));
    --jd-fin-down: var(--bm-down, var(--jd-color-danger));
    --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
    --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
    --jd-fin-border: var(--bm-border, var(--jd-color-border));
    --jd-fin-card: var(--bm-card, var(--jd-color-card));
    --jd-fin-soft: var(--bm-soft-100, color-mix(in srgb, var(--jd-color-foreground) 6%, transparent));
    --jd-fin-accent: var(--bm-accent-strong, var(--jd-color-primary));

    display: block; overflow: hidden;
    background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-xl);
    font-family: var(--jd-font-sans); color: var(--jd-fin-text);
  }
  jd-live-order-book * { box-sizing: border-box; }

  .jd-lob__head {
    display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-2);
    padding: var(--jd-space-2-5) var(--jd-space-4);
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  .jd-lob__meta { display: inline-flex; align-items: center; gap: var(--jd-space-2); }
  .jd-lob__title { font-size: 12.5px; font-weight: 800; }
  .jd-lob__source {
    font-size: 10.5px; font-weight: 700; color: var(--jd-fin-muted);
    font-variant-numeric: tabular-nums;
  }
  .jd-lob__source[hidden] { display: none; }

  .jd-lob__table {
    width: 100%; border-collapse: collapse; font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
  .jd-lob__th {
    padding: var(--jd-space-1-5) var(--jd-space-3);
    font-size: 10.5px; font-weight: 700; color: var(--jd-fin-muted);
    background: var(--jd-fin-soft); width: 33.333%;
  }
  .jd-lob__th--ask { text-align: right; }
  .jd-lob__th--mid { text-align: center; }
  .jd-lob__th--bid { text-align: left; }

  .jd-lob__row { border-block-start: var(--jd-border-thin) solid var(--jd-fin-border); }

  .jd-lob__qty {
    position: relative; padding: var(--jd-space-1) var(--jd-space-3);
    color: var(--jd-fin-muted); font-weight: 700; overflow: hidden;
  }
  .jd-lob__qty--ask { text-align: right; }
  .jd-lob__qty--bid { text-align: left; }
  .jd-lob__bar {
    position: absolute; top: 0; height: 100%;
  }
  .jd-lob__qty--ask .jd-lob__bar {
    right: 0; background: color-mix(in srgb, var(--jd-fin-down) 12%, transparent);
  }
  .jd-lob__qty--bid .jd-lob__bar {
    left: 0; background: color-mix(in srgb, var(--jd-fin-up) 12%, transparent);
  }
  .jd-lob__qty-val { position: relative; }

  .jd-lob__price {
    padding: var(--jd-space-1) var(--jd-space-2); text-align: center; font-weight: 800;
  }
  .jd-lob__price--ask {
    color: var(--jd-fin-down);
    background: color-mix(in srgb, var(--jd-fin-down) 5%, transparent);
  }
  .jd-lob__price--bid {
    color: var(--jd-fin-up);
    background: color-mix(in srgb, var(--jd-fin-up) 5%, transparent);
  }
  .jd-lob__spacer { padding: var(--jd-space-1) var(--jd-space-3); }

  .jd-lob__current {
    background: color-mix(in srgb, var(--jd-fin-accent) 10%, transparent);
  }
  .jd-lob__current td {
    padding: var(--jd-space-1-5) var(--jd-space-3);
    text-align: center; font-weight: 800; font-size: 13px;
  }

  .jd-lob__empty {
    padding: var(--jd-space-6) var(--jd-space-4);
    text-align: center; font-size: 12px; color: var(--jd-fin-muted);
    background: var(--jd-fin-soft);
  }

  .jd-lob__totals {
    background: var(--jd-fin-soft);
    border-block-start: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  .jd-lob__total { padding: var(--jd-space-1-5) var(--jd-space-3); font-weight: 800; }
  .jd-lob__total--ask { text-align: right; color: var(--jd-fin-down); }
  .jd-lob__total--bid { text-align: left; color: var(--jd-fin-up); }
  .jd-lob__total-label {
    padding: var(--jd-space-1-5) var(--jd-space-2);
    text-align: center; font-size: 10.5px; font-weight: 700; color: var(--jd-fin-muted);
  }
}`;
