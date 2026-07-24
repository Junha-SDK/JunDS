import { css } from "../../core/styles.js";

/**
 * v2 값: flex-wrap gap-1.5, 칩 = bm-chip(rounded-full·xs·bold) + 회전 accent
 * (cat-3·2·4·8·5)의 12% 배경 + cat 글자, 앞에 옅은 # 프리픽스(opacity .7).
 * finance cat 8색 --bm-cat-* → jd 폴백 체인(daily-themes-calendar 동형).
 */
export default css`
@layer junds.components {
  jd-theme-tag-list {
    --jd-fin-cat-2: var(--bm-cat-2, #ec4899);
    --jd-fin-cat-3: var(--bm-cat-3, #14b8a6);
    --jd-fin-cat-4: var(--bm-cat-4, #f59e0b);
    --jd-fin-cat-5: var(--bm-cat-5, #8b5cf6);
    --jd-fin-cat-8: var(--bm-cat-8, #10b981);

    display: block; box-sizing: border-box; font-family: var(--jd-font-sans);
  }
  jd-theme-tag-list * { box-sizing: border-box; }

  .jd-theme-tag-list {
    display: flex; flex-wrap: wrap; gap: var(--jd-space-1-5);
  }
  .jd-theme-tag-list__chip {
    display: inline-flex; align-items: center; gap: 2px;
    padding: var(--jd-space-0-5) var(--jd-space-2);
    border-radius: var(--jd-radius-full);
    border: var(--jd-border-thin) solid transparent;
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-bold);
    text-decoration: none; white-space: nowrap;
    /* data-accent="0" 기본 = cat-3 */
    /* 12% 틴트 위 원색 cat 글자는 대비 미달(cat-4 amber ~1.9:1) — 글자를 foreground 쪽으로
       섞어 대비를 올리되 색상(hue)은 유지한다(03-web-arch §4.3, 라이트/다크 양쪽 대응). */
    background: color-mix(in srgb, var(--jd-fin-cat-3) 12%, transparent);
    color: color-mix(in srgb, var(--jd-fin-cat-3) 65%, var(--jd-color-foreground));
    transition: filter var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-theme-tag-list__chip[data-accent="1"] {
    background: color-mix(in srgb, var(--jd-fin-cat-2) 12%, transparent);
    color: color-mix(in srgb, var(--jd-fin-cat-2) 65%, var(--jd-color-foreground));
  }
  .jd-theme-tag-list__chip[data-accent="2"] {
    background: color-mix(in srgb, var(--jd-fin-cat-4) 12%, transparent);
    color: color-mix(in srgb, var(--jd-fin-cat-4) 65%, var(--jd-color-foreground));
  }
  .jd-theme-tag-list__chip[data-accent="3"] {
    background: color-mix(in srgb, var(--jd-fin-cat-8) 12%, transparent);
    color: color-mix(in srgb, var(--jd-fin-cat-8) 65%, var(--jd-color-foreground));
  }
  .jd-theme-tag-list__chip[data-accent="4"] {
    background: color-mix(in srgb, var(--jd-fin-cat-5) 12%, transparent);
    color: color-mix(in srgb, var(--jd-fin-cat-5) 65%, var(--jd-color-foreground));
  }
  .jd-theme-tag-list__chip:hover { filter: brightness(0.96); }
  .jd-theme-tag-list__chip:focus-visible {
    outline: var(--jd-border-medium) solid color-mix(in srgb, currentColor 55%, transparent);
    outline-offset: 1px;
  }
  .jd-theme-tag-list__hash { opacity: 0.7; }

  @media (prefers-reduced-motion: reduce) {
    .jd-theme-tag-list__chip { transition: none; }
  }
}`;
