import { css } from "../../core/styles.js";

/**
 * v2 값: 호스트 `inline-block`, 구간 호 strokeWidth 10 · linecap round · opacity .2,
 * 값 호 동일 굵기 불투명, 바늘 stroke var(--foreground) 2px · 중심 원 r=4,
 * 값 텍스트 text-lg(1.125rem) bold currentColor, 라벨 10px var(--muted).
 *
 * 색은 데이터(구간)마다 다르므로 **커스텀 프로퍼티 경유**로 넣는다 — 요소에 stroke
 * 속성을 박으면 소비자 CSS가 이길 방법이 사실상 사라진다(progress-ring 선례).
 * `overflow: visible`은 size가 작을 때 라벨 텍스트(cy+38)가 뷰박스를 넘겨도
 * 잘리지 않게 한다 — v2는 같은 조건에서 라벨이 통째로 잘렸다.
 */
export default css`
@layer junds.base {
  jd-gauge-chart:not(:defined) { display: inline-block; }
}
@layer junds.components {
  jd-gauge-chart {
    display: inline-block;
    line-height: 0;
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
  }

  .jd-gauge-chart__svg { display: block; overflow: visible; }

  .jd-gauge-chart__segment {
    fill: none;
    stroke: var(--jd-gauge-chart-segment, var(--jd-color-border));
    stroke-width: 10;
    stroke-linecap: round;
    opacity: var(--jd-opacity-20);
  }
  .jd-gauge-chart__value-arc {
    fill: none;
    stroke: var(--jd-gauge-chart-active, var(--jd-color-primary));
    stroke-width: 10;
    stroke-linecap: round;
    transition: stroke var(--jd-duration-normal) var(--jd-easing-default);
  }

  .jd-gauge-chart__needle {
    stroke: var(--jd-color-foreground);
    stroke-width: 2;
    stroke-linecap: round;
  }
  .jd-gauge-chart__pivot { fill: var(--jd-color-foreground); }

  .jd-gauge-chart__value-text {
    fill: currentColor;
    font-size: var(--jd-text-xl); /* v2 text-lg = 1.125rem */
    font-weight: var(--jd-weight-bold);
    font-variant-numeric: tabular-nums;
  }
  .jd-gauge-chart__label-text {
    fill: var(--jd-color-muted);
    font-size: 10px; /* v2 text-[10px] */
  }
  .jd-gauge-chart__label-text[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .jd-gauge-chart__value-arc { transition: none; }
  }
}`;
