/**
 * jd-real-candle-chart CSS — v2 finance/RealCandleChart 헤더의 Tailwind/인라인 번역.
 *
 * v2 값: 헤더 flex justify-between mb-2 px-1, Yahoo 배지 초록 알약(bg green/12, #16a34a),
 * 샘플 배지 soft 알약, 점 1.5px, 봉수/신선도 11px, 신선도 점은 장중이면 bright.
 * 내부 캔들 차트는 자기 CSS(candle-chart.css)가 칠한다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-real-candle-chart {
    display: block;
    font-family: var(--jd-font-sans);
    --_success: var(--jd-fin-success, #22c55e);
    --_muted: var(--jd-fin-muted, var(--jd-color-muted));
    --_soft: var(--jd-fin-soft-100, var(--jd-color-card-hover));
    --_bright: var(--jd-fin-live-bright, var(--jd-fin-accent, #14b8a6));
  }
  jd-real-candle-chart:not(:defined) { display: block; }

  .jd-real-candle-chart__header {
    display: flex; align-items: center; justify-content: space-between;
    gap: var(--jd-space-2);
    margin-block-end: var(--jd-space-2);
    padding-inline: 4px;
  }
  .jd-real-candle-chart__meta {
    display: flex; align-items: center; gap: var(--jd-space-2);
    font-size: 11.5px; min-width: 0; flex-wrap: wrap;
  }

  .jd-real-candle-chart__badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px var(--jd-space-2); border-radius: var(--jd-radius-full);
    font-weight: 800; white-space: nowrap;
  }
  .jd-real-candle-chart__badge[data-source="yahoo"] {
    background: color-mix(in srgb, var(--_success) 12%, transparent);
    color: #16a34a;
  }
  .jd-real-candle-chart__badge[data-source="mock"] {
    background: var(--_soft); color: var(--_muted);
  }
  .jd-real-candle-chart__dot {
    width: 6px; height: 6px; border-radius: var(--jd-radius-full);
    background: var(--_muted); flex-shrink: 0;
  }
  .jd-real-candle-chart__badge[data-source="yahoo"] .jd-real-candle-chart__dot {
    background: var(--_success);
  }

  .jd-real-candle-chart__count {
    font-size: 11px; color: var(--_muted); font-variant-numeric: tabular-nums;
  }
  .jd-real-candle-chart__count[hidden] { display: none; }

  .jd-real-candle-chart__freshness {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 700; color: var(--_muted);
  }
  .jd-real-candle-chart__freshness[hidden] { display: none; }
  .jd-real-candle-chart__fresh-dot {
    width: 6px; height: 6px; border-radius: var(--jd-radius-full);
    background: var(--_muted); flex-shrink: 0;
  }
  .jd-real-candle-chart__fresh-dot[data-live="true"] { background: var(--_bright); }

  .jd-real-candle-chart__yahoo {
    display: inline-flex; align-items: center; gap: 4px;
    flex-shrink: 0;
    font-size: 11px; font-weight: 700; color: var(--_muted);
    text-decoration: none; white-space: nowrap;
  }
  .jd-real-candle-chart__yahoo[hidden] { display: none; }
  .jd-real-candle-chart__yahoo:hover { color: var(--jd-color-foreground); }
  .jd-real-candle-chart__yahoo:focus-visible {
    outline: 2px solid var(--jd-color-focus); outline-offset: 2px;
    border-radius: var(--jd-radius-sm);
  }
  .jd-real-candle-chart__ext { flex-shrink: 0; }

  .jd-real-candle-chart__chart { display: block; max-width: 100%; }
}`;
