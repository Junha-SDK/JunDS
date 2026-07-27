/**
 * jd-banner CSS — v2 composites/Banner(꽉 찬 색 배경 + 흰 글자, 중앙 정렬).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-banner {
    display: flex; align-items: center; justify-content: center;
    gap: var(--jd-space-3); box-sizing: border-box;
    padding: var(--jd-space-2-5) var(--jd-space-4);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-sm);
    font-weight: var(--jd-weight-medium);
    /* 흰 글자를 받으려면 배경이 충분히 어두워야 한다. semantic 원색 그대로면
       info 3.9:1 · warning 3.6:1 · success 4.0:1로 AA 미달(axe 실측, v2 승계 결함) —
       foreground를 20% 섞어 색상은 유지하고 명도만 내린다(DEC-030-7의 배경판). */
    color: #ffffff;
    background: color-mix(in srgb, var(--_jd-banner-color) 80%, #17141f);
    --_jd-banner-color: var(--jd-color-info); /* variant 기본 info */
  }
  jd-banner[hidden] { display: none; }
  jd-banner[variant="success"] { --_jd-banner-color: var(--jd-color-success); }
  jd-banner[variant="warning"] { --_jd-banner-color: var(--jd-color-warning); }
  jd-banner[variant="danger"] { --_jd-banner-color: var(--jd-color-danger); }

  .jd-banner__content { text-align: center; }

  .jd-banner__close {
    display: flex; flex-shrink: 0; padding: var(--jd-space-1);
    margin-inline-start: var(--jd-space-2);
    border: 0; background: none; color: inherit; cursor: pointer;
    border-radius: var(--jd-radius-sm);
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-banner__close:hover { background: rgb(255 255 255 / 0.2); }
  .jd-banner__close[hidden] { display: none; }
  .jd-banner__close:focus-visible { outline: var(--jd-border-medium) solid #ffffff; outline-offset: 1px; }

  @media (prefers-reduced-motion: reduce) { .jd-banner__close { transition: none; } }
}`;
