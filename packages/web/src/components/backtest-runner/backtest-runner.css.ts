import { css } from "../../core/styles.js";

/**
 * v2 값: 두 bm-card-lg 세로 스택(space-y-5), 설정 그리드 1/3칸, 컨트롤 h40 rounded-lg soft 배경,
 * 기간 버튼 active=accent/#fff, 결과 stat 그리드 2/4칸(gap:1px border), 자산곡선 SVG(전략=accent
 * 2.2 / 매수보유=muted 점선), 의견분포 칩. finance 색 --bm-* → jd 폴백.
 */
export default css`
@layer junds.components {
  jd-backtest-runner {
    --jd-fin-up: var(--bm-up, var(--jd-color-success));
    --jd-fin-down: var(--bm-down, var(--jd-color-danger));
    --jd-fin-accent: var(--bm-accent-strong, var(--jd-color-primary));
    --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
    --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
    --jd-fin-border: var(--bm-border, var(--jd-color-border));
    --jd-fin-card: var(--bm-card, var(--jd-color-card));
    --jd-fin-soft: var(--bm-soft-100, color-mix(in srgb, var(--jd-color-foreground) 6%, transparent));

    display: flex; flex-direction: column; gap: var(--jd-space-5);
    box-sizing: border-box; font-family: var(--jd-font-sans); color: var(--jd-fin-text);
  }
  jd-backtest-runner * { box-sizing: border-box; }

  jd-backtest-runner .jd-backtest-runner__card {
    background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-2xl); overflow: hidden;
    box-shadow: var(--jd-shadow-sm);
  }
  jd-backtest-runner .jd-backtest-runner__settings { padding: var(--jd-space-5); }

  /* 설정 헤더 */
  jd-backtest-runner .jd-backtest-runner__settings-head {
    display: flex; align-items: center; gap: var(--jd-space-2); margin-block-end: var(--jd-space-3);
  }
  jd-backtest-runner .jd-backtest-runner__spark-icon { color: var(--jd-fin-accent); }
  jd-backtest-runner .jd-backtest-runner__settings-title {
    font-size: var(--jd-text-sm); font-weight: 800; letter-spacing: var(--jd-tracking-tight);
  }

  /* 그리드 */
  jd-backtest-runner .jd-backtest-runner__grid {
    display: grid; grid-template-columns: 1fr; gap: var(--jd-space-3);
  }
  @media (min-width: 768px) {
    jd-backtest-runner .jd-backtest-runner__grid { grid-template-columns: repeat(3, 1fr); }
  }
  jd-backtest-runner .jd-backtest-runner__field { min-width: 0; }
  jd-backtest-runner .jd-backtest-runner__symbol-field { position: relative; }
  jd-backtest-runner .jd-backtest-runner__label {
    display: block; margin-block-end: var(--jd-space-1-5);
    font-size: 10.5px; font-weight: 700; letter-spacing: var(--jd-tracking-wide);
    text-transform: uppercase; color: var(--jd-fin-muted);
  }
  jd-backtest-runner .jd-backtest-runner__control {
    width: 100%; height: 40px; padding: 0 var(--jd-space-3);
    border-radius: var(--jd-radius-lg); font: inherit; font-size: var(--jd-text-sm);
    font-weight: 700; color: var(--jd-fin-text);
    background: var(--jd-fin-soft);
    border: var(--jd-border-thin) solid var(--jd-fin-border); outline: none;
  }
  jd-backtest-runner .jd-backtest-runner__control:focus-visible {
    border-color: var(--jd-fin-accent); box-shadow: var(--jd-shadow-focus-ring);
  }

  /* 서제스트 */
  jd-backtest-runner .jd-backtest-runner__suggest {
    position: absolute; z-index: var(--jd-z-dropdown); inset-inline: 0;
    inset-block-start: calc(100% + var(--jd-space-1)); list-style: none; margin: 0; padding: 0;
    max-height: 240px; overflow-y: auto; overflow-x: hidden;
    background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-lg); box-shadow: var(--jd-shadow-lg);
  }
  jd-backtest-runner .jd-backtest-runner__suggest-item {
    display: block; width: 100%; text-align: start; cursor: pointer;
    padding: var(--jd-space-2) var(--jd-space-3); font: inherit; font-size: var(--jd-text-sm);
    font-weight: 700; color: var(--jd-fin-text); background: none; border: 0;
  }
  jd-backtest-runner .jd-backtest-runner__suggest-item:hover,
  jd-backtest-runner .jd-backtest-runner__suggest-item:focus-visible {
    background: var(--jd-fin-soft); outline: none;
  }
  jd-backtest-runner .jd-backtest-runner__suggest-sector {
    margin-inline-start: var(--jd-space-2); font-size: 11px; font-weight: 400; color: var(--jd-fin-muted);
  }

  /* 기간 버튼 */
  jd-backtest-runner .jd-backtest-runner__ranges { display: flex; align-items: center; gap: var(--jd-space-1); }
  jd-backtest-runner .jd-backtest-runner__range {
    flex: 1; height: 40px; border-radius: var(--jd-radius-lg);
    font: inherit; font-size: var(--jd-text-sm); font-weight: 800; cursor: pointer;
    background: var(--jd-fin-soft); color: var(--jd-fin-text);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    transition: background var(--jd-duration-fast) var(--jd-easing-default);
  }
  jd-backtest-runner .jd-backtest-runner__range[data-active="true"] {
    background: var(--jd-fin-accent); color: #fff; border-color: var(--jd-fin-accent);
  }
  jd-backtest-runner .jd-backtest-runner__range:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  /* 결과 헤더 */
  jd-backtest-runner .jd-backtest-runner__results-head {
    display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-3);
    padding: var(--jd-space-3-5) var(--jd-space-5);
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  jd-backtest-runner .jd-backtest-runner__results-title {
    display: inline-flex; align-items: center; gap: var(--jd-space-2);
    font-size: var(--jd-text-md); font-weight: 800; letter-spacing: var(--jd-tracking-tight);
  }
  jd-backtest-runner .jd-backtest-runner__head-emoji { font-size: 16px; line-height: var(--jd-leading-none); }
  jd-backtest-runner .jd-backtest-runner__results-note {
    font-size: 10.5px; font-weight: 700; letter-spacing: var(--jd-tracking-wide);
    text-transform: uppercase; color: var(--jd-fin-muted); white-space: nowrap;
  }

  /* 스탯 그리드 */
  jd-backtest-runner .jd-backtest-runner__stat-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--jd-border-thin);
    background: var(--jd-fin-border);
  }
  @media (min-width: 768px) {
    jd-backtest-runner .jd-backtest-runner__stat-grid { grid-template-columns: repeat(4, 1fr); }
  }
  jd-backtest-runner .jd-backtest-runner__stat {
    display: flex; flex-direction: column; gap: var(--jd-space-1);
    padding: var(--jd-space-3) var(--jd-space-4); background: var(--jd-fin-card);
  }
  jd-backtest-runner .jd-backtest-runner__stat-label {
    font-size: 10.5px; font-weight: 700; letter-spacing: var(--jd-tracking-wide);
    text-transform: uppercase; color: var(--jd-fin-muted);
  }
  jd-backtest-runner .jd-backtest-runner__stat-value {
    font-size: var(--jd-text-lg); font-weight: 800; font-variant-numeric: tabular-nums;
    color: var(--jd-fin-text);
  }
  jd-backtest-runner .jd-backtest-runner__stat-value[data-tone="up"] { color: var(--jd-fin-up); }
  jd-backtest-runner .jd-backtest-runner__stat-value[data-tone="down"] { color: var(--jd-fin-down); }

  /* 자산곡선 */
  jd-backtest-runner .jd-backtest-runner__chart { padding: var(--jd-space-4); }
  jd-backtest-runner .jd-backtest-runner__equity { display: block; width: 100%; height: auto; }
  jd-backtest-runner .jd-backtest-runner__baseline { stroke: var(--jd-fin-border); }
  jd-backtest-runner .jd-backtest-runner__axis { fill: var(--jd-fin-muted); }
  jd-backtest-runner .jd-backtest-runner__line-eq { stroke: var(--jd-fin-accent); }
  jd-backtest-runner .jd-backtest-runner__line-bh { stroke: var(--jd-fin-muted); }
  jd-backtest-runner .jd-backtest-runner__legend-box { fill: var(--jd-fin-card); stroke: var(--jd-fin-border); }
  jd-backtest-runner .jd-backtest-runner__legend-eq { fill: var(--jd-fin-text); }
  jd-backtest-runner .jd-backtest-runner__legend-bh { fill: var(--jd-fin-muted); }

  /* 의견 분포 */
  jd-backtest-runner .jd-backtest-runner__histogram {
    display: flex; align-items: center; gap: var(--jd-space-3); flex-wrap: wrap;
    padding: var(--jd-space-3) var(--jd-space-4);
    border-block-start: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  jd-backtest-runner .jd-backtest-runner__histogram-label {
    font-size: 10.5px; font-weight: 700; letter-spacing: var(--jd-tracking-wide);
    text-transform: uppercase; color: var(--jd-fin-muted);
  }
  jd-backtest-runner .jd-backtest-runner__verdict {
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    font-size: 11.5px; font-weight: 700; font-variant-numeric: tabular-nums;
  }
  jd-backtest-runner .jd-backtest-runner__verdict-name { color: var(--jd-fin-muted); }
  jd-backtest-runner .jd-backtest-runner__verdict-count[data-tone="up"] { color: var(--jd-fin-up); }
  jd-backtest-runner .jd-backtest-runner__verdict-count[data-tone="down"] { color: var(--jd-fin-down); }
  jd-backtest-runner .jd-backtest-runner__verdict-count[data-tone="flat"] { color: var(--jd-fin-text); }
}`;
