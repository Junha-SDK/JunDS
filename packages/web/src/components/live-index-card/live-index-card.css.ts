import { css } from "../../core/styles.js";

/**
 * v2 값(기계 번역): bm-card(테두리·라운드·카드 bg, overflow hidden), 헤더 px-3.5 py-2.5
 * + 하단 보더, 라벨 extrabold(large 13px / 기본 10px), 등락률 pill 11px extrabold,
 * 본문 값 extrabold(large 28px / 기본 18px, 본문색 고정), diff 12px bold 착색, spark h36
 * (area fillOpacity .12 + line 1.5). finance 색은 --bm-* → jd 폴백(portfolio-council 동형).
 */
export default css`
@layer junds.components {
  jd-live-index-card {
    --jd-fin-up: var(--bm-up, var(--jd-color-success));
    --jd-fin-down: var(--bm-down, var(--jd-color-danger));
    --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
    --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
    --jd-fin-border: var(--bm-border, var(--jd-color-border));
    --jd-fin-card: var(--bm-card, var(--jd-color-card));

    display: block; box-sizing: border-box; overflow: hidden;
    background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-2xl);
    font-family: var(--jd-font-sans); color: var(--jd-fin-text);
  }
  jd-live-index-card * { box-sizing: border-box; }
  jd-live-index-card[data-dir="up"] { --jd-lic-dir: var(--jd-fin-up); }
  jd-live-index-card[data-dir="down"] { --jd-lic-dir: var(--jd-fin-down); }

  jd-live-index-card .jd-live-index-card__head {
    display: flex; align-items: center; justify-content: space-between;
    padding: var(--jd-space-2-5) var(--jd-space-3-5);
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  jd-live-index-card .jd-live-index-card__label {
    font-weight: 800; font-size: 10px; color: var(--jd-fin-text);
  }
  jd-live-index-card[large] .jd-live-index-card__label { font-size: 13px; }
  jd-live-index-card .jd-live-index-card__pct {
    display: inline-flex; align-items: center; gap: 2px;
    font-size: 11px; font-weight: 800;
    font-variant-numeric: tabular-nums; color: var(--jd-lic-dir, var(--jd-fin-muted));
  }

  jd-live-index-card .jd-live-index-card__body {
    padding: var(--jd-space-2-5) var(--jd-space-3-5) var(--jd-space-3);
  }
  jd-live-index-card .jd-live-index-card__value {
    font-weight: 800; font-size: 18px; line-height: var(--jd-leading-tight);
    font-variant-numeric: tabular-nums; color: var(--jd-fin-text);
  }
  jd-live-index-card[large] .jd-live-index-card__value { font-size: 28px; }
  jd-live-index-card .jd-live-index-card__diff {
    margin-block-start: 2px; font-weight: 700; font-size: 12px;
    font-variant-numeric: tabular-nums; color: var(--jd-lic-dir, var(--jd-fin-muted));
  }

  jd-live-index-card .jd-live-index-card__spark {
    display: block; margin-block-start: var(--jd-space-2);
  }
  jd-live-index-card .jd-live-index-card__spark-area {
    fill: var(--jd-lic-dir, var(--jd-fin-muted)); fill-opacity: 0.12; stroke: none;
  }
  jd-live-index-card .jd-live-index-card__spark-line {
    fill: none; stroke: var(--jd-lic-dir, var(--jd-fin-muted)); stroke-width: 1.5;
  }
}`;
