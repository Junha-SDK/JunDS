import { css } from "../../core/styles.js";

/**
 * v2 값: relative 래퍼, 좌상단 LIVE 배지(backdrop-blur 반투명 pill, 10px extrabold), 안쪽은
 * CandleChart. 안쪽 SVG는 고정 치수(viewBox)라 컨테이너에 맞춰 축소되도록 max-width:100%로
 * 유동화한다(비율 유지). finance 색은 --bm-* → jd 폴백.
 */
export default css`
  @layer junds.components {
    jd-live-stock-hero-chart {
      --jd-fin-card: var(--bm-card, var(--jd-color-card));
      --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));

      position: relative;
      display: block;
      font-family: var(--jd-font-sans);
    }

    .jd-lshc__badge {
      position: absolute;
      top: var(--jd-space-2);
      left: var(--jd-space-2);
      z-index: 1;
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      padding: 2px var(--jd-space-2);
      border-radius: var(--jd-radius-full);
      background: color-mix(in srgb, var(--jd-fin-card) 80%, transparent);
      backdrop-filter: blur(4px);
    }
    .jd-lshc__source {
      font-size: 10px;
      font-weight: 800;
      color: var(--jd-fin-muted);
      font-variant-numeric: tabular-nums;
    }
    .jd-lshc__source[hidden] {
      display: none;
    }

    .jd-lshc__chart {
      display: block;
    }
    /* 안쪽 캔들 SVG를 컨테이너에 맞춰 유동화(비율 유지) */
    jd-live-stock-hero-chart .jd-candle-chart__svg {
      max-width: 100%;
      height: auto;
    }
  }
`;
