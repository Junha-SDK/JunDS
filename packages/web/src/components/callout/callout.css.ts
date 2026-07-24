/**
 * jd-callout CSS — v2 composites/Callout(좌측 강조선 + 5% 틴트 + 이모지).
 * v2 색은 emerald/amber/red/slate/blue Tailwind 리터럴이었고 semantic 축과
 * 일치하는 것(tip=success, warning, danger, info)은 토큰으로, note(slate)만 muted로 번역.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-callout {
    display: block; box-sizing: border-box;
    padding: var(--jd-space-4);
    font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
    border-inline-start: var(--jd-border-thick) solid var(--_jd-callout-color);
    border-radius: var(--jd-radius-md);
    background: color-mix(in srgb, var(--_jd-callout-color) 5%, transparent);
    --_jd-callout-color: var(--jd-color-muted); /* variant 기본 note */
  }
  jd-callout[variant="tip"] { --_jd-callout-color: var(--jd-color-success); }
  jd-callout[variant="info"] { --_jd-callout-color: var(--jd-color-info); }
  jd-callout[variant="warning"] { --_jd-callout-color: var(--jd-color-warning); }
  jd-callout[variant="danger"] { --_jd-callout-color: var(--jd-color-danger); }

  .jd-callout__head {
    display: flex; align-items: center; gap: var(--jd-space-2);
    font-size: var(--jd-text-sm); font-weight: var(--jd-weight-semibold);
    color: color-mix(in srgb, var(--_jd-callout-color) 65%, var(--jd-color-foreground));
  }
  summary.jd-callout__head { cursor: pointer; list-style: none; }
  summary.jd-callout__head::-webkit-details-marker { display: none; }
  /* 네이티브 마커 대신 방향 표시 — details[open]이 상태를 준다 */
  summary.jd-callout__head::after {
    content: "\\25BE"; margin-inline-start: auto;
    transition: transform var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  details[open] > summary.jd-callout__head::after { transform: rotate(180deg); }
  summary.jd-callout__head:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  .jd-callout__icon { flex-shrink: 0; }
  .jd-callout__title[hidden] { display: none; }

  .jd-callout__body {
    font-size: var(--jd-text-sm); line-height: var(--jd-leading-relaxed);
  }
  .jd-callout__head + .jd-callout__body,
  details .jd-callout__body { margin-block-start: var(--jd-space-2); }

  @media (prefers-reduced-motion: reduce) {
    summary.jd-callout__head::after { transition: none; }
  }
}`;
