import { css } from "../../core/styles.js";

/**
 * jd-market-heatmap CSS — v2 finance/MarketHeatmap.
 * 칸 색은 데이터(등락률)라 인라인 --jd-mh-fill이 나른다(테마로 못 덮는 값). 그 외 크롬
 * (배경·칸 경계·그룹 헤더)은 토큰. 흰 라벨 + drop-shadow로 채도 높은 적/청 위 가독성 확보.
 * 대체 목록(.jd-mh__sr)은 시각적으로만 숨긴다(display:none은 AT에서도 지워진다).
 */
export default css`
@layer junds.components {
  jd-market-heatmap { display: block; font-family: var(--jd-font-sans); }
  jd-market-heatmap:not(:defined) { display: block; }

  .jd-mh__svg {
    display: block; max-width: 100%; height: auto;
    font-variant-numeric: tabular-nums;
  }
  .jd-mh__bg { fill: var(--jd-color-card); }

  .jd-mh__cell { cursor: pointer; }
  .jd-mh__cell-rect {
    fill: var(--jd-mh-fill, hsl(220, 10%, 52%));
    stroke: color-mix(in srgb, var(--jd-color-card) 85%, transparent);
    stroke-width: 1;
  }
  .jd-mh__cell-text {
    fill: #fff; pointer-events: none;
    filter: drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.55));
  }
  .jd-mh__cell-price { fill: rgba(255, 255, 255, 0.78); filter: none; }

  .jd-mh__group-bg { fill: color-mix(in srgb, var(--jd-color-card) 96%, transparent); }
  .jd-mh__group-divider { fill: color-mix(in srgb, var(--jd-color-foreground) 6%, transparent); }
  .jd-mh__group-label {
    fill: var(--jd-color-foreground); font-size: 11px; font-weight: 800;
    letter-spacing: 0.2px; pointer-events: none;
  }

  .jd-mh__sr {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }
}`;
