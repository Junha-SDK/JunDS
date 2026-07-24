import { css } from "../../core/styles.js";

/**
 * v2 값: bm-card px-3 py-2.5, 이름 13px 700, 총액 <Tag color="orange">,
 * hover soft, 그림자 0 1px 2px.
 * orange 태그는 v2 Tag의 리터럴 승계(bg #fff7ed / color #c2410c) — 앱 orange 재정의가
 * 필요하면 --jd-fin-orange 폴백 체인으로 연다.
 */
export default css`
@layer junds.components {
  jd-theme-pill-card {
    --jd-fin-card: var(--bm-card, var(--jd-color-card));
    --jd-fin-border: var(--bm-border, var(--jd-color-border));
    --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
    --jd-fin-soft: var(--bm-soft-100, color-mix(in srgb, var(--jd-color-foreground) 6%, transparent));

    display: block; box-sizing: border-box; font-family: var(--jd-font-sans);
  }
  jd-theme-pill-card * { box-sizing: border-box; }

  .jd-theme-pill-card {
    display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-2);
    padding: var(--jd-space-2-5) var(--jd-space-3);
    background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-2xl);
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    color: var(--jd-fin-text);
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-theme-pill-card:hover { background: var(--jd-fin-soft); }

  .jd-theme-pill-card__name {
    min-width: 0; font-size: 13px; font-weight: var(--jd-weight-bold);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-theme-pill-card__total {
    flex-shrink: 0;
    padding: var(--jd-space-0-5) var(--jd-space-2);
    border-radius: var(--jd-radius-md);
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-bold);
    font-variant-numeric: tabular-nums; white-space: nowrap;
    background: var(--jd-fin-orange-soft, #fff7ed);
    color: var(--jd-fin-orange, #c2410c);
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-theme-pill-card { transition: none; }
  }
}`;
