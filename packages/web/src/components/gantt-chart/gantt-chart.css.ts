/**
 * jd-gantt-chart CSS — v2 patterns/GanttChart 표면 의미 번역.
 * v2 값: 컨테이너 `border rounded-lg overflow-auto bg-surface`, 좌측 라벨 `sticky
 * left-0 bg-surface border-r`, 헤더 `h-8 border-b text-xs font-semibold uppercase
 * text-muted`, 라벨행 `text-sm truncate border-b`, 주 눈금 `text-[10px] text-muted
 * border-l`, 막대 `rounded-md text-white text-[11px] font-medium`, 진행 오버레이
 * `bg-black/20`.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-gantt-chart:not(:defined) { display: none; }
}
@layer junds.components {
  jd-gantt-chart {
    display: block;
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
  }

  .jd-gantt__scroll {
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    overflow: auto;
    background: var(--jd-color-surface);
  }

  .jd-gantt__empty {
    margin: 0;
    padding: var(--jd-space-6);
    text-align: center;
    font-size: var(--jd-text-sm);
    color: var(--jd-color-muted);
  }

  .jd-gantt__inner { display: flex; }

  /* 좌측 라벨 열 — 가로 스크롤에도 고정 */
  .jd-gantt__labels {
    position: sticky;
    left: 0;
    z-index: 1;
    background: var(--jd-color-surface);
    border-right: var(--jd-border-thin) solid var(--jd-color-border);
    flex-shrink: 0;
  }
  .jd-gantt__label-head {
    display: flex;
    align-items: center;
    padding: 0 var(--jd-space-3);
    border-bottom: var(--jd-border-thin) solid var(--jd-color-border);
    font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-semibold);
    text-transform: uppercase;
    letter-spacing: var(--jd-tracking-wide);
    color: var(--jd-color-muted);
  }
  .jd-gantt__label-row {
    display: flex;
    align-items: center;
    padding: 0 var(--jd-space-3);
    font-size: var(--jd-text-sm);
    border-bottom: var(--jd-border-thin) solid var(--jd-color-border-light);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 타임라인 */
  .jd-gantt__timeline { position: relative; }
  .jd-gantt__timeline-header {
    position: relative;
    border-bottom: var(--jd-border-thin) solid var(--jd-color-border);
    font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
  }
  .jd-gantt__week {
    position: absolute;
    top: 0;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 var(--jd-space-1);
    border-left: var(--jd-border-thin) solid var(--jd-color-border-light);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .jd-gantt__row {
    position: relative;
    border-bottom: var(--jd-border-thin) solid var(--jd-color-border-light);
  }

  .jd-gantt__bar {
    box-sizing: border-box; /* JS가 준 width(일수*dayWidth)에 좌우 패딩이 더해지면 종료일을 넘친다 */
    position: absolute;
    top: var(--jd-space-1);
    bottom: var(--jd-space-1);
    display: flex;
    align-items: center;
    padding: 0 var(--jd-space-2);
    border: 0;
    border-radius: var(--jd-radius-md);
    overflow: hidden;
    background: var(--jd-bar-color, var(--jd-color-primary));
    color: #fff;
    font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-medium);
    cursor: pointer;
    transition: filter var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-gantt__bar:hover { filter: brightness(1.1); }
  .jd-gantt__bar:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  /* 진행 오버레이 — v2 bg-black/20, 좌측부터 채움 */
  .jd-gantt__fill {
    position: absolute;
    inset: 0 auto 0 0;
    background: rgba(0, 0, 0, 0.2);
  }
  .jd-gantt__bar-text {
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}`;
