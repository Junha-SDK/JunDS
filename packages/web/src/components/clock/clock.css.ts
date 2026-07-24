import { css } from "../../core/styles.js";

/**
 * v2 값 번역: 디지털 `inline-flex items-baseline gap-2 font-mono tabular-nums` +
 * 숫자 `text-2xl font-semibold`, 아날로그 `inline-block`.
 * 면은 fill-surface(= Tailwind @theme의 --color-surface → var(--card)) · 테두리
 * stroke-border, 눈금·시분침 foreground, 초침·중심점 primary.
 * 획 두께(2/1.5/3/2/1)는 v2가 size와 무관한 px 상수였고 viewBox 단위 = px라 그대로 CSS로 뺀다.
 */
export default css`
@layer junds.components {
  jd-clock {
    display: inline-flex; align-items: baseline; gap: var(--jd-space-2);
    font-family: var(--jd-font-mono); font-variant-numeric: tabular-nums;
    color: var(--jd-color-foreground);
  }
  jd-clock[mode="analog"] { display: inline-block; }

  .jd-clock__time {
    font-size: var(--jd-text-2xl); font-weight: var(--jd-weight-semibold);
    line-height: var(--jd-leading-tight);
  }

  .jd-clock__face { display: block; }
  .jd-clock__dial {
    fill: var(--jd-color-card); stroke: var(--jd-color-border); stroke-width: 2;
  }
  .jd-clock__tick { stroke: var(--jd-color-foreground); stroke-width: 1.5; }
  .jd-clock__hand { stroke: var(--jd-color-foreground); stroke-linecap: round; }
  .jd-clock__hand[data-hand="hour"] { stroke-width: 3; }
  .jd-clock__hand[data-hand="minute"] { stroke-width: 2; }
  .jd-clock__hand[data-hand="second"] { stroke: var(--jd-color-primary); stroke-width: 1; }
  .jd-clock__pin { fill: var(--jd-color-primary); }

  /* 초 숨김은 DOM 교체 없이 CSS로 — hide-seconds는 반전 플래그(§1.3) */
  jd-clock[hide-seconds] .jd-clock__hand[data-hand="second"] { display: none; }
}`;
