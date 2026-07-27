/**
 * jd-calendar-month CSS — v2 patterns/CalendarMonth 표면 의미 번역.
 * v2 값: 컨테이너 `rounded-xl border bg-surface p-4`, 헤더 `mb-3`, 제목
 * `text-lg font-semibold tabular-nums`, 네비 버튼 `w-8 h-8 rounded-md
 * hover:bg-surface-soft`, 요일 `text-[11px] text-muted`, 셀 `min-h-[64px]
 * rounded-md p-1`, 오늘 `bg-primary text-white`, 선택 `bg-primary/10
 * border-primary/30`, 이벤트칩 `text-[10px] bg-{color}/15 text-{color}`.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-calendar-month:not(:defined) { display: none; }
}
@layer junds.components {
  jd-calendar-month { display: block; font-family: var(--jd-font-sans); }

  .jd-cm {
    border-radius: var(--jd-radius-xl);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    background: var(--jd-color-surface);
    color: var(--jd-color-foreground);
    padding: var(--jd-space-4);
  }

  .jd-cm__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--jd-space-3);
  }
  .jd-cm__title {
    margin: 0;
    font-size: var(--jd-text-lg);
    font-weight: var(--jd-weight-semibold);
    color: var(--jd-color-foreground);
    font-variant-numeric: tabular-nums;
  }
  .jd-cm__nav { display: flex; align-items: center; gap: var(--jd-space-1); }
  .jd-cm__arrow,
  .jd-cm__today {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2rem;
    border: 0;
    background: transparent;
    color: var(--jd-color-foreground);
    border-radius: var(--jd-radius-md);
    cursor: pointer;
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-cm__arrow { width: 2rem; }
  .jd-cm__arrow > svg { width: 0.875rem; height: 0.875rem; }
  .jd-cm__today {
    padding: 0 var(--jd-space-3);
    font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-medium);
  }
  .jd-cm__arrow:hover,
  .jd-cm__today:hover {
    background: color-mix(in srgb, var(--jd-color-muted) 12%, transparent);
  }
  .jd-cm__arrow:focus-visible,
  .jd-cm__today:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  .jd-cm__weekdays,
  .jd-cm__grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: var(--jd-space-1);
  }
  .jd-cm__weekday {
    padding: var(--jd-space-1) 0;
    text-align: center;
    font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
  }
  .jd-cm__grid {
    margin-top: var(--jd-space-1);
    border-radius: var(--jd-radius-md);
  }
  .jd-cm__grid:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  .jd-cm__cell {
    min-height: 4rem;
    border-radius: var(--jd-radius-md);
    border: var(--jd-border-thin) solid transparent;
    padding: var(--jd-space-1);
    display: flex;
    flex-direction: column;
    gap: var(--jd-space-0-5);
    cursor: pointer;
    transition:
      border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
      background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-cm__cell:hover { border-color: var(--jd-color-border-light); }
  .jd-cm__cell[data-outside] { opacity: var(--jd-opacity-40); }
  .jd-cm__cell[data-selected] {
    background: color-mix(in srgb, var(--jd-color-primary) 10%, transparent);
    border-color: color-mix(in srgb, var(--jd-color-primary) 30%, transparent);
  }
  .jd-cm__cell[data-focus] {
    border-color: color-mix(in srgb, var(--jd-color-primary) 50%, transparent);
  }

  .jd-cm__num {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: var(--jd-radius-full);
    font-size: var(--jd-text-xs);
    color: var(--jd-color-foreground);
    font-variant-numeric: tabular-nums;
  }
  .jd-cm__cell[data-today] > .jd-cm__num {
    background: var(--jd-color-primary);
    color: #fff;
    font-weight: var(--jd-weight-bold);
  }

  .jd-cm__events {
    list-style: none;
    margin: 0;
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--jd-space-0-5);
    overflow: hidden;
  }
  .jd-cm__event {
    display: block;
    width: 100%;
    text-align: left;
    border: 0;
    border-radius: var(--jd-radius-sm);
    padding: 0.0625rem var(--jd-space-1-5);
    font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-medium);
    line-height: var(--jd-leading-snug);
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: color-mix(in srgb, var(--jd-color-primary) 15%, transparent);
    color: var(--jd-color-primary-ink);
  }
  /* 원색 텍스트를 옅은 틴트 위에 그대로 두면 라이트모드 대비가 무너진다 — foreground로 당겨 대비 확보(테마 적응) */
  .jd-cm__event[data-color="success"] { background: color-mix(in srgb, var(--jd-color-success) 15%, transparent); color: color-mix(in srgb, var(--jd-color-success) 65%, var(--jd-color-foreground)); }
  .jd-cm__event[data-color="warning"] { background: color-mix(in srgb, var(--jd-color-warning) 15%, transparent); color: color-mix(in srgb, var(--jd-color-warning) 65%, var(--jd-color-foreground)); }
  .jd-cm__event[data-color="danger"] { background: color-mix(in srgb, var(--jd-color-danger) 15%, transparent); color: color-mix(in srgb, var(--jd-color-danger) 65%, var(--jd-color-foreground)); }
  .jd-cm__event[data-color="info"] { background: color-mix(in srgb, var(--jd-color-info) 15%, transparent); color: color-mix(in srgb, var(--jd-color-info) 65%, var(--jd-color-foreground)); }
  .jd-cm__event[data-color="accent"] { background: color-mix(in srgb, var(--jd-color-accent) 15%, transparent); color: color-mix(in srgb, var(--jd-color-accent) 65%, var(--jd-color-foreground)); }
  .jd-cm__event:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  .jd-cm__more {
    font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
    padding-left: var(--jd-space-1-5);
  }
}`;
