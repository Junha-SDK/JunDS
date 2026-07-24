import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - 그리드: grid gap-4, gridTemplateColumns repeat(cols, minmax(0,1fr))
 *   → --cols 인라인. 모바일(<768px)은 1열로 접는 반응형 보정(v2엔 없던 개선)
 * - 카드: relative flex-col rounded-xl border bg-surface p-6 + transition-shadow.
 *   highlighted = border-primary + shadow-lg + ring-1 primary/30, 아니면 hover:shadow-md.
 *   disabled = opacity-60
 * - 배지: absolute -top-2 right-4 rounded-full bg-primary white text-[10px] semibold
 *   px-2 py-0.5 uppercase tracking-wider
 * - 헤더: h3 text-lg semibold, desc mt-1 text-sm muted
 * - 가격: flex items-baseline gap-1, amount text-3xl bold tracking-tight, suffix text-sm muted
 * - 기능: ul flex-1 space-y-2 mb-6, li flex items-start gap-2 text-sm, check 14px success
 * - CTA: w-full rounded-lg px-4 py-2.5 text-sm semibold. highlighted=primary/white,
 *   아니면 border. disabled opacity-50
 */
export default css`
@layer junds.base {
  jd-pricing-table:not(:defined) { display: grid; }
}
@layer junds.components {
  jd-pricing-table {
    display: grid;
    box-sizing: border-box;
    gap: var(--jd-space-4);
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
    grid-template-columns: minmax(0, 1fr);
  }
  @media (min-width: 768px) {
    jd-pricing-table { grid-template-columns: repeat(var(--cols, 1), minmax(0, 1fr)); }
  }

  .jd-pricing-table__plan {
    position: relative;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    border: var(--jd-border-thin) solid var(--jd-color-border);
    background: var(--jd-color-card);
    border-radius: var(--jd-radius-xl);
    padding: var(--jd-space-6);
    transition: box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out),
      border-color var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-pricing-table__plan:hover { box-shadow: var(--jd-shadow-md); }
  .jd-pricing-table__plan[data-highlighted] {
    border-color: var(--jd-color-primary);
    box-shadow: var(--jd-shadow-lg), 0 0 0 1px color-mix(in srgb, var(--jd-color-primary) 30%, transparent);
  }
  .jd-pricing-table__plan[data-disabled] { opacity: var(--jd-opacity-60); }

  .jd-pricing-table__badge {
    position: absolute;
    top: calc(-1 * var(--jd-space-2));
    inset-inline-end: var(--jd-space-4);
    border-radius: var(--jd-radius-full);
    background: var(--jd-color-primary);
    color: #fff;
    font-size: 10px;
    font-weight: var(--jd-weight-semibold);
    padding: var(--jd-space-0-5) var(--jd-space-2);
    text-transform: uppercase;
    letter-spacing: var(--jd-tracking-wide);
  }

  .jd-pricing-table__header { margin-bottom: var(--jd-space-4); }
  .jd-pricing-table__name {
    margin: 0;
    font-size: var(--jd-text-lg);
    font-weight: var(--jd-weight-semibold);
    line-height: var(--jd-leading-snug);
  }
  .jd-pricing-table__desc {
    margin: var(--jd-space-1) 0 0;
    font-size: var(--jd-text-sm);
    color: var(--jd-color-muted);
  }

  .jd-pricing-table__price {
    margin-bottom: var(--jd-space-5);
    display: flex;
    align-items: baseline;
    gap: var(--jd-space-1);
  }
  .jd-pricing-table__amount {
    font-size: var(--jd-text-3xl);
    font-weight: var(--jd-weight-bold);
    letter-spacing: var(--jd-tracking-tight);
  }
  .jd-pricing-table__suffix {
    font-size: var(--jd-text-sm);
    color: var(--jd-color-muted);
  }

  .jd-pricing-table__features {
    flex: 1;
    list-style: none;
    margin: 0 0 var(--jd-space-6);
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--jd-space-2);
  }
  .jd-pricing-table__feature {
    display: flex;
    align-items: flex-start;
    gap: var(--jd-space-2);
    font-size: var(--jd-text-sm);
    line-height: var(--jd-leading-normal);
  }
  .jd-pricing-table__check {
    flex-shrink: 0;
    margin-top: 2px;
    color: var(--jd-color-success);
  }

  .jd-pricing-table__cta {
    width: 100%;
    box-sizing: border-box;
    border: var(--jd-border-thin) solid transparent;
    margin: 0;
    padding: var(--jd-space-2-5) var(--jd-space-4);
    font-family: inherit;
    font-size: var(--jd-text-sm);
    font-weight: var(--jd-weight-semibold);
    line-height: var(--jd-leading-none);
    cursor: pointer;
    border-radius: var(--jd-radius-lg);
    background: var(--jd-color-card);
    color: var(--jd-color-foreground);
    border-color: var(--jd-color-border);
    transition: background-color var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-pricing-table__cta:hover { background: var(--jd-color-card-hover); }
  .jd-pricing-table__cta:focus-visible {
    outline: var(--jd-border-medium) solid color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    outline-offset: 2px;
  }
  .jd-pricing-table__cta:disabled {
    opacity: var(--jd-opacity-50);
    cursor: not-allowed;
  }
  .jd-pricing-table__plan[data-highlighted] .jd-pricing-table__cta {
    background: var(--jd-color-primary);
    color: #fff;
    border-color: transparent;
  }
  .jd-pricing-table__plan[data-highlighted] .jd-pricing-table__cta:hover {
    background: var(--jd-color-primary-hover);
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-pricing-table__plan,
    .jd-pricing-table__cta { transition: none; }
  }
}`;
