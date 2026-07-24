import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - 루트 max-w-6xl mx-auto px-4 py-10/sm:py-16, head text-center mb-10.
 * - title 3xl/sm:4xl bold tracking-tight, desc mt-3 base muted max-w-2xl.
 * - toggle mt-6 inline-flex gap-1 rounded-full border bg-surface p-1,
 *   버튼 px-4 py-1.5 text-sm rounded-full, active bg-primary text-white,
 *   save 배지 10px semibold rounded-full — 활성 시 흰 반투명, 비활성 시 success 틴트.
 * - FAQ mt-16, h2 2xl semibold center mb-6, details rounded-lg border bg-surface p-4,
 *   caret group-open rotate-180. footer mt-16 center.
 */
export default css`
@layer junds.base {
  jd-pricing-page:not(:defined) { display: block; }
}
@layer junds.components {
  jd-pricing-page {
    display: block; box-sizing: border-box;
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
    max-width: 72rem; margin-inline: auto;
    padding-inline: var(--jd-space-4);
    padding-block: var(--jd-space-10);
  }
  @media (min-width: 640px) { jd-pricing-page { padding-block: var(--jd-space-16); } }

  .jd-pricing-page__head { text-align: center; margin-block-end: var(--jd-space-10); }
  .jd-pricing-page__title {
    margin: 0; font-size: var(--jd-text-3xl); font-weight: var(--jd-weight-bold);
    letter-spacing: var(--jd-tracking-tight);
  }
  @media (min-width: 640px) { .jd-pricing-page__title { font-size: var(--jd-text-4xl); } }
  .jd-pricing-page__title[hidden] { display: none; }

  .jd-pricing-page__desc {
    margin: var(--jd-space-3) auto 0; max-width: 42rem;
    font-size: var(--jd-text-md); color: var(--jd-color-muted);
  }
  .jd-pricing-page__desc[hidden] { display: none; }

  /* 토글 */
  .jd-pricing-page__toggle {
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    margin-block-start: var(--jd-space-6);
    padding: var(--jd-space-1);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-full);
    background: var(--jd-color-surface);
  }
  .jd-pricing-page__toggle[hidden] { display: none; }
  .jd-pricing-page__period {
    display: inline-flex; align-items: center; gap: var(--jd-space-2);
    padding: var(--jd-space-1-5) var(--jd-space-4);
    font-size: var(--jd-text-sm); font-family: inherit;
    color: var(--jd-color-foreground);
    background: transparent; border: 0; border-radius: var(--jd-radius-full);
    cursor: pointer;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-default);
  }
  .jd-pricing-page__period:hover { background: var(--jd-color-surface-raised); }
  .jd-pricing-page__period[data-active] {
    background: var(--jd-color-primary); color: #fff;
  }
  .jd-pricing-page__period[data-active]:hover { background: var(--jd-color-primary); }
  .jd-pricing-page__period:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  .jd-pricing-page__save {
    font-size: 10px; font-weight: var(--jd-weight-semibold);
    padding: var(--jd-space-0-5) var(--jd-space-1-5);
    border-radius: var(--jd-radius-full);
    background: color-mix(in srgb, var(--jd-color-success) 10%, transparent);
    color: color-mix(in srgb, var(--jd-color-success) 65%, var(--jd-color-foreground));
  }
  .jd-pricing-page__period[data-active] .jd-pricing-page__save {
    background: rgba(255, 255, 255, 0.2); color: inherit;
  }

  .jd-pricing-page__table { display: block; }

  /* FAQ */
  .jd-pricing-page__faq { margin-block-start: var(--jd-space-16); }
  .jd-pricing-page__faq[hidden] { display: none; }
  .jd-pricing-page__faq-title {
    margin: 0 0 var(--jd-space-6); text-align: center;
    font-size: var(--jd-text-2xl); font-weight: var(--jd-weight-semibold);
  }
  .jd-pricing-page__faq-list {
    max-width: 42rem; margin-inline: auto;
    display: flex; flex-direction: column; gap: var(--jd-space-3);
  }
  .jd-pricing-page__faq-item {
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
    background: var(--jd-color-surface);
    padding: var(--jd-space-4);
  }
  .jd-pricing-page__faq-q {
    display: flex; align-items: center; justify-content: space-between;
    gap: var(--jd-space-3);
    font-weight: var(--jd-weight-medium); cursor: pointer;
    list-style: none;
  }
  .jd-pricing-page__faq-q::-webkit-details-marker { display: none; }
  .jd-pricing-page__faq-q:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring); border-radius: var(--jd-radius-sm);
  }
  .jd-pricing-page__faq-caret {
    color: var(--jd-color-muted);
    transition: transform var(--jd-duration-normal) var(--jd-easing-default);
  }
  .jd-pricing-page__faq-item[open] .jd-pricing-page__faq-caret { transform: rotate(180deg); }
  .jd-pricing-page__faq-a {
    margin-block-start: var(--jd-space-3);
    font-size: var(--jd-text-sm); color: var(--jd-color-muted);
  }

  /* 푸터 CTA */
  .jd-pricing-page__footer { margin-block-start: var(--jd-space-16); text-align: center; }
  .jd-pricing-page__footer:empty { display: none; }
}`;
