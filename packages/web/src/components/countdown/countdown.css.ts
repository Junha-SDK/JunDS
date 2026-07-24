/**
 * jd-countdown 컴포넌트 CSS.
 * v2 ds/composites/Countdown 3형식을 --jd-* 토큰으로 의미 번역:
 *  - full    : `inline-flex gap-3` + 칸마다 `min-w-[48px] rounded-md border bg-surface
 *              px-3 py-2`, 값 `text-xl font-semibold font-mono tabular-nums leading-none`,
 *              라벨 `text-[10px] text-muted uppercase tracking-wider`
 *  - compact : `inline-flex items-baseline gap-1 font-mono tabular-nums`
 *  - minimal : `font-mono tabular-nums text-sm` + 콜론 구분
 * v2 `bg-surface`는 v3 토큰에서 다크 표면값이라 card로 옮겼다(grid-picker와 같은 판단).
 *
 * minimal에서 단위 라벨은 display:none이 아니라 **시각적으로만** 숨긴다 —
 * 화면에는 "01:02:03"이지만 낭독은 "01 시 02 분 03 초"로 남는다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-countdown {
    display: inline-flex; align-items: center;
    font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
  }
  .jd-countdown__parts[hidden], .jd-countdown__done[hidden] { display: none; }
  .jd-countdown__unit[hidden], .jd-countdown__sep[hidden] { display: none; }

  .jd-countdown__value { font-variant-numeric: tabular-nums; font-family: var(--jd-font-mono); }

  /* ── full (기본) ── */
  .jd-countdown__parts { display: inline-flex; align-items: center; gap: var(--jd-space-3); }
  .jd-countdown__unit {
    display: inline-flex; flex-direction: column; align-items: center;
    box-sizing: border-box; min-width: 3rem;
    padding: var(--jd-space-2) var(--jd-space-3);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-md);
  }
  .jd-countdown__unit > .jd-countdown__value {
    font-size: var(--jd-text-xl); font-weight: var(--jd-weight-semibold);
    line-height: var(--jd-leading-none);
  }
  .jd-countdown__unit > .jd-countdown__label {
    margin-top: var(--jd-space-1); font-size: .625rem;
    color: var(--jd-color-muted); text-transform: uppercase;
    letter-spacing: var(--jd-tracking-wide);
  }
  .jd-countdown__sep { display: none; }

  /* ── compact ── */
  jd-countdown[format="compact"] > .jd-countdown__parts {
    align-items: baseline; gap: var(--jd-space-1);
    font-family: var(--jd-font-mono); font-variant-numeric: tabular-nums;
  }
  jd-countdown[format="compact"] .jd-countdown__unit {
    display: inline; min-width: 0; padding: 0;
    background: none; border: 0; border-radius: 0;
  }
  jd-countdown[format="compact"] .jd-countdown__value {
    font-size: inherit; font-weight: var(--jd-weight-normal);
    line-height: inherit;
  }
  jd-countdown[format="compact"] .jd-countdown__label {
    margin: 0; font-size: inherit; color: inherit;
    text-transform: none; letter-spacing: normal;
  }

  /* ── minimal ── */
  jd-countdown[format="minimal"] > .jd-countdown__parts {
    gap: 0; font-family: var(--jd-font-mono);
    font-size: var(--jd-text-sm); font-variant-numeric: tabular-nums;
  }
  jd-countdown[format="minimal"] .jd-countdown__unit {
    display: inline; min-width: 0; padding: 0;
    background: none; border: 0; border-radius: 0;
  }
  jd-countdown[format="minimal"] .jd-countdown__value {
    font-size: inherit; font-weight: var(--jd-weight-normal); line-height: inherit;
  }
  /* 라벨은 지우지 않고 시각적으로만 숨긴다 — 낭독에는 단위가 남는다 */
  jd-countdown[format="minimal"] .jd-countdown__label {
    position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }
  jd-countdown[format="minimal"] .jd-countdown__sep:not([hidden]) { display: inline; }

  .jd-countdown__done { font-size: var(--jd-text-md); }
}`;
