import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - content: flex-col gap-5, eyebrow text-xs semibold uppercase tracking-wider primary,
 *   title 3xl/sm:4xl/lg:5xl bold tracking-tight leading-tight, subtitle base/sm:lg muted max-w-2xl,
 *   actions flex-wrap gap-3, footer mt-4 text-sm muted.
 * - CtaButton: rounded-md semibold px-5 py-2.5 text-sm, primary bg-primary/hover-primary-hover text-white,
 *   secondary border bg-surface/hover-surface-soft, focus ring.
 * - centered: max-w-5xl py-16/sm:py-24, 중앙 정렬. minimal: max-w-4xl py-10.
 *   split: max-w-7xl py-12/sm:py-20, lg 2열 + media order 스왑. imageBg: 풀블리드 + 어둠 오버레이.
 * 브레이크포인트는 Tailwind sm=640 / lg=1024.
 */
export default css`
@layer junds.base {
  jd-hero-section:not(:defined) { display: block; }
}
@layer junds.components {
  jd-hero-section {
    display: block; box-sizing: border-box;
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
    margin-inline: auto;
    max-width: 64rem; /* centered 기본 */
    padding-block: var(--jd-space-16);
    padding-inline: var(--jd-space-4);
  }
  @media (min-width: 640px) {
    jd-hero-section { padding-block: var(--jd-space-24); padding-inline: var(--jd-space-6); }
  }

  .jd-hero__inner { display: block; }
  .jd-hero__content { display: flex; flex-direction: column; gap: var(--jd-space-5); }

  .jd-hero__eyebrow {
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-semibold);
    text-transform: uppercase; letter-spacing: var(--jd-tracking-wide);
    color: var(--jd-color-primary);
  }
  .jd-hero__eyebrow[hidden], .jd-hero__title[hidden], .jd-hero__subtitle[hidden],
  .jd-hero__actions[hidden], .jd-hero__media[hidden] { display: none; }

  .jd-hero__title {
    margin: 0; font-weight: var(--jd-weight-bold);
    letter-spacing: var(--jd-tracking-tight); line-height: var(--jd-leading-tight);
    font-size: var(--jd-text-3xl);
  }
  @media (min-width: 640px) { .jd-hero__title { font-size: var(--jd-text-4xl); } }
  @media (min-width: 1024px) { .jd-hero__title { font-size: var(--jd-text-5xl); } }

  .jd-hero__subtitle {
    margin: 0; font-size: var(--jd-text-md); color: var(--jd-color-muted);
    max-width: 42rem; line-height: var(--jd-leading-relaxed);
  }
  @media (min-width: 640px) { .jd-hero__subtitle { font-size: var(--jd-text-lg); } }

  .jd-hero__actions { display: flex; flex-wrap: wrap; gap: var(--jd-space-3); }

  .jd-hero__footer {
    margin-block-start: var(--jd-space-4);
    font-size: var(--jd-text-sm); color: var(--jd-color-muted);
  }
  .jd-hero__footer:empty { display: none; }

  .jd-hero__media { display: none; } /* split에서만 노출 */

  /* CTA — v2 CtaButton */
  .jd-hero__cta {
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: var(--jd-radius-md); font-weight: var(--jd-weight-semibold);
    padding: var(--jd-space-2-5) var(--jd-space-5); font-size: var(--jd-text-sm);
    text-decoration: none; cursor: pointer;
    border: var(--jd-border-thin) solid transparent;
    transition:
      background-color var(--jd-duration-fast) var(--jd-easing-default),
      border-color var(--jd-duration-fast) var(--jd-easing-default);
  }
  .jd-hero__cta[data-cta="primary"] { background: var(--jd-color-primary); color: #fff; }
  .jd-hero__cta[data-cta="primary"]:hover { background: var(--jd-color-primary-hover); }
  .jd-hero__cta[data-cta="secondary"] {
    background: var(--jd-color-surface); color: var(--jd-color-foreground);
    border-color: var(--jd-color-border);
  }
  .jd-hero__cta[data-cta="secondary"]:hover { background: var(--jd-color-surface-raised); }
  .jd-hero__cta:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  /* ── centered (기본) ── */
  jd-hero-section[variant="centered"] .jd-hero__content { align-items: center; text-align: center; }
  jd-hero-section[variant="centered"] .jd-hero__actions { justify-content: center; }

  /* ── minimal ── */
  jd-hero-section[variant="minimal"] { max-width: 56rem; padding-block: var(--jd-space-10); }
  @media (min-width: 640px) { jd-hero-section[variant="minimal"] { padding-block: var(--jd-space-10); } }

  /* ── split ── */
  jd-hero-section[variant="split"] { max-width: 80rem; padding-block: var(--jd-space-12); }
  @media (min-width: 640px) { jd-hero-section[variant="split"] { padding-block: var(--jd-space-20); } }
  jd-hero-section[variant="split"] .jd-hero__inner { display: grid; gap: var(--jd-space-10); align-items: center; }
  jd-hero-section[variant="split"] .jd-hero__content { max-width: 36rem; }
  jd-hero-section[variant="split"] .jd-hero__media { display: block; order: -1; }
  @media (min-width: 1024px) {
    jd-hero-section[variant="split"] .jd-hero__inner { grid-template-columns: 1fr 1fr; }
    jd-hero-section[variant="split"] .jd-hero__media { order: 1; }
  }

  /* ── imageBg (풀블리드) ── */
  jd-hero-section[variant="imageBg"] { max-width: none; padding: 0; }
  jd-hero-section[variant="imageBg"] .jd-hero__inner {
    position: relative; overflow: hidden;
    display: flex; flex-direction: column; align-items: center;
    color: #fff;
    padding-block: var(--jd-space-20); padding-inline: var(--jd-space-4);
    /* bgImage 없어도 흰 글자가 보이도록 어두운 폴백 위에 오버레이 */
    background-color: var(--jd-color-neutral-900);
    background-image: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)), var(--jd-hero-bg, none);
    background-size: cover; background-position: center;
  }
  @media (min-width: 640px) {
    jd-hero-section[variant="imageBg"] .jd-hero__inner {
      padding-block: var(--jd-space-24); padding-inline: var(--jd-space-6);
    }
  }
  jd-hero-section[variant="imageBg"] .jd-hero__content { align-items: center; text-align: center; max-width: 56rem; }
  jd-hero-section[variant="imageBg"] .jd-hero__eyebrow { color: #fff; }
  jd-hero-section[variant="imageBg"] .jd-hero__subtitle { color: rgba(255,255,255,.9); }
  jd-hero-section[variant="imageBg"] .jd-hero__actions { justify-content: center; }
  jd-hero-section[variant="imageBg"] .jd-hero__media { display: none; }
}`;
