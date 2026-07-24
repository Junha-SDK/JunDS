import { css } from "../../core/styles.js";

/**
 * v2 값: 카드(radius 16, 테두리), 헤더/주 행 grid `repeat(5,1fr) 150px`, 셀 min-h 170 우테두리,
 * 오늘=핑크 2px 링 + 핑크 6% 배경 + 날짜 핑크 알약, 휴장=soft 배경 + down 점, 테마칩=cat 색
 * 10%/20%, 왕관 리스트, 주간요약=teal 4% 틴트 좌테두리. finance 색 --bm-* → jd 폴백, cat 8색.
 */
export default css`
@layer junds.components {
  jd-daily-themes-calendar {
    --jd-fin-up: var(--bm-up, var(--jd-color-success));
    --jd-fin-down: var(--bm-down, var(--jd-color-danger));
    --jd-fin-accent: var(--bm-accent-strong, var(--jd-color-primary));
    --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
    --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
    --jd-fin-border: var(--bm-border, var(--jd-color-border));
    --jd-fin-card: var(--bm-card, var(--jd-color-card));
    --jd-fin-soft: var(--bm-soft-100, color-mix(in srgb, var(--jd-color-foreground) 6%, transparent));
    --jd-fin-warning: var(--bm-warning, var(--jd-color-warning));
    --jd-fin-today: var(--bm-today, #ec4899);
    --jd-fin-cat-1: var(--bm-cat-1, #6366f1);
    --jd-fin-cat-2: var(--bm-cat-2, #ec4899);
    --jd-fin-cat-3: var(--bm-cat-3, #14b8a6);
    --jd-fin-cat-4: var(--bm-cat-4, #f59e0b);
    --jd-fin-cat-5: var(--bm-cat-5, #8b5cf6);
    --jd-fin-cat-6: var(--bm-cat-6, #06b6d4);
    --jd-fin-cat-7: var(--bm-cat-7, #ef4444);
    --jd-fin-cat-8: var(--bm-cat-8, #10b981);

    display: block; box-sizing: border-box; font-family: var(--jd-font-sans); color: var(--jd-fin-text);
  }
  jd-daily-themes-calendar * { box-sizing: border-box; }

  jd-daily-themes-calendar .jd-daily-themes-calendar__grid {
    background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-2xl); overflow: hidden;
  }

  /* 요일 헤더 */
  jd-daily-themes-calendar .jd-daily-themes-calendar__header {
    display: grid; grid-template-columns: repeat(5, 1fr) 150px;
    text-align: center; background: var(--jd-fin-soft);
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
    color: var(--jd-fin-muted);
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__weekday {
    padding: var(--jd-space-2-5) 0; font-size: var(--jd-text-xs); font-weight: 800;
    letter-spacing: 0.06em;
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__summary-head {
    border-inline-start: var(--jd-border-thin) solid var(--jd-fin-border);
    color: var(--jd-fin-accent);
  }

  /* 주 행 */
  jd-daily-themes-calendar .jd-daily-themes-calendar__week {
    display: grid; grid-template-columns: repeat(5, 1fr) 150px;
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__week[data-last] { border-block-end: none; }

  /* 셀 공통 */
  jd-daily-themes-calendar .jd-daily-themes-calendar__cell {
    position: relative; min-height: 170px;
    border-inline-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__cell--blank { min-height: 0; }

  /* 휴장일 */
  jd-daily-themes-calendar .jd-daily-themes-calendar__cell--holiday {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: var(--jd-space-1); padding: var(--jd-space-3);
    background: var(--jd-fin-soft); opacity: .85;
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__holiday-day {
    font-size: var(--jd-text-xs); font-weight: 700; font-variant-numeric: tabular-nums; color: var(--jd-fin-muted);
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__holiday-tag {
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    font-size: 11px; font-weight: 800; color: var(--jd-fin-down);
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__holiday-dot {
    width: 6px; height: 6px; border-radius: var(--jd-radius-full); background: var(--jd-fin-down);
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__holiday-name {
    font-size: 10.5px; font-weight: 700; line-height: var(--jd-leading-tight);
    text-align: center; color: var(--jd-fin-down);
  }

  /* 미래 */
  jd-daily-themes-calendar .jd-daily-themes-calendar__cell--future { padding: var(--jd-space-3); }
  jd-daily-themes-calendar .jd-daily-themes-calendar__future-day {
    font-size: var(--jd-text-xs); font-weight: 700; font-variant-numeric: tabular-nums; color: var(--jd-fin-muted);
  }

  /* 정상 셀 */
  jd-daily-themes-calendar .jd-daily-themes-calendar__hit {
    position: absolute; inset: 0; z-index: 0; cursor: pointer;
    background: transparent; border: 0; padding: 0; width: 100%; height: 100%;
    transition: background var(--jd-duration-fast) var(--jd-easing-default);
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__cell--day:not([data-today]):hover .jd-daily-themes-calendar__hit {
    background: var(--jd-fin-soft);
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__hit:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring) inset;
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__content {
    position: relative; z-index: 1; pointer-events: none;
    display: flex; flex-direction: column; gap: var(--jd-space-2); padding: var(--jd-space-3);
  }

  /* 오늘 강조 */
  jd-daily-themes-calendar .jd-daily-themes-calendar__cell--day[data-today] { padding: var(--jd-space-1-5); }
  jd-daily-themes-calendar .jd-daily-themes-calendar__cell--day[data-today] .jd-daily-themes-calendar__hit {
    inset: var(--jd-space-1-5); border: var(--jd-border-medium) solid var(--jd-fin-today);
    border-radius: var(--jd-radius-xl); background: color-mix(in srgb, var(--jd-fin-today) 6%, transparent);
    width: auto; height: auto;
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__cell--day[data-today] .jd-daily-themes-calendar__day-num {
    color: #fff; background: var(--jd-fin-today); padding: 2px var(--jd-space-2); border-radius: var(--jd-radius-full);
  }

  /* 날짜 헤더 */
  jd-daily-themes-calendar .jd-daily-themes-calendar__day-head {
    display: flex; align-items: flex-start; justify-content: space-between;
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__day-num {
    font-size: var(--jd-text-xs); font-weight: 800; font-variant-numeric: tabular-nums; color: var(--jd-fin-text);
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__pct-chips {
    display: flex; flex-direction: column; align-items: flex-end; gap: 2px;
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__pct-chip {
    display: inline-flex; align-items: center; gap: 2px;
    font-size: 9.5px; font-weight: 700; font-variant-numeric: tabular-nums;
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__pct-chip[data-tone="up"] { color: var(--jd-fin-up); }
  jd-daily-themes-calendar .jd-daily-themes-calendar__pct-chip[data-tone="down"] { color: var(--jd-fin-down); }
  jd-daily-themes-calendar .jd-daily-themes-calendar__pct-chip-label { color: var(--jd-fin-muted); }

  /* 데이터 행 */
  jd-daily-themes-calendar .jd-daily-themes-calendar__data { display: flex; flex-direction: column; gap: var(--jd-space-1); }
  jd-daily-themes-calendar .jd-daily-themes-calendar__data-row {
    display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-1);
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__data-label {
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    font-size: 10px; font-weight: 700; color: var(--jd-fin-muted);
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__data-value {
    font-size: 11.5px; font-weight: 800; font-variant-numeric: tabular-nums; color: var(--jd-fin-text);
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__data-value[data-tone="up"] { color: var(--jd-fin-up); }

  /* 테마칩 */
  jd-daily-themes-calendar .jd-daily-themes-calendar__themes { display: flex; flex-wrap: wrap; gap: var(--jd-space-1); }
  jd-daily-themes-calendar .jd-daily-themes-calendar__theme-chip {
    pointer-events: auto; cursor: pointer;
    font-size: 10px; font-weight: 800; border-radius: var(--jd-radius-full);
    padding: 2px var(--jd-space-2); border: var(--jd-border-thin) solid transparent;
    transition: filter var(--jd-duration-fast) var(--jd-easing-default);
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__theme-chip:hover { filter: brightness(1.1); }
  jd-daily-themes-calendar .jd-daily-themes-calendar__theme-chip:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  /* 왕관 */
  jd-daily-themes-calendar .jd-daily-themes-calendar__leaders {
    list-style: none; margin: 0; padding: 0; margin-block-start: auto;
    display: flex; flex-direction: column; gap: 2px;
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__leader {
    display: flex; align-items: center; gap: var(--jd-space-1); font-size: 10.5px;
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__crown { color: var(--jd-fin-warning); flex-shrink: 0; }
  jd-daily-themes-calendar .jd-daily-themes-calendar__leader-name {
    font-weight: 700; color: var(--jd-fin-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__leader-close {
    margin-inline-start: auto; font-size: 10px; font-weight: 700; font-variant-numeric: tabular-nums;
    color: var(--jd-fin-text); white-space: nowrap;
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__leader-pct {
    font-size: 9.5px; font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap;
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__leader-pct[data-tone="up"] { color: var(--jd-fin-up); }
  jd-daily-themes-calendar .jd-daily-themes-calendar__leader-pct[data-tone="down"] { color: var(--jd-fin-down); }

  /* 주간 요약 */
  jd-daily-themes-calendar .jd-daily-themes-calendar__summary {
    display: flex; flex-direction: column; gap: var(--jd-space-1-5); padding: var(--jd-space-3);
    border-inline-start: var(--jd-border-thin) solid var(--jd-fin-border);
    background: color-mix(in srgb, #0d9488 4%, transparent);
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__summary[data-empty] {
    align-items: center; justify-content: center; font-size: 11px; font-weight: 700;
    color: var(--jd-fin-muted); background: var(--jd-fin-soft); opacity: .7;
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__summary-row {
    display: flex; align-items: baseline; justify-content: space-between;
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__summary-row-label {
    font-size: 10px; font-weight: 800; color: var(--jd-fin-muted);
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__summary-row-value {
    font-size: var(--jd-text-xs); font-weight: 800; font-variant-numeric: tabular-nums; color: var(--jd-fin-text);
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__summary-row-value[data-tone="up"] { color: var(--jd-fin-up); }
  jd-daily-themes-calendar .jd-daily-themes-calendar__summary-row-value[data-tone="down"] { color: var(--jd-fin-down); }
  jd-daily-themes-calendar .jd-daily-themes-calendar__summary-block { margin-block-start: 2px; }
  jd-daily-themes-calendar .jd-daily-themes-calendar__summary-label {
    font-size: 9.5px; font-weight: 800; color: var(--jd-fin-muted); margin-block-end: 2px;
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__summary-themes { display: flex; flex-wrap: wrap; gap: var(--jd-space-1); }
  jd-daily-themes-calendar .jd-daily-themes-calendar__summary-theme {
    cursor: pointer; font-size: 9.5px; font-weight: 800; border-radius: var(--jd-radius-full);
    padding: 1px var(--jd-space-1-5);
    color: var(--jd-fin-accent);
    background: color-mix(in srgb, var(--jd-fin-accent) 10%, transparent);
    border: var(--jd-border-thin) solid color-mix(in srgb, var(--jd-fin-accent) 24%, transparent);
    transition: filter var(--jd-duration-fast) var(--jd-easing-default);
  }
  jd-daily-themes-calendar .jd-daily-themes-calendar__summary-theme:hover { filter: brightness(1.1); }
  jd-daily-themes-calendar .jd-daily-themes-calendar__summary-theme:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }
  jd-daily-themes-calendar .jd-daily-themes-calendar__summary-leaders { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
  jd-daily-themes-calendar .jd-daily-themes-calendar__summary-leader {
    display: flex; align-items: center; gap: var(--jd-space-1); font-size: 10px; font-weight: 700;
    color: var(--jd-fin-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
}`;
