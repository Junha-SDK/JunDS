import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - section: px-4/6 py-10
 * - title: 가운데 정렬 text-xs semibold uppercase tracking-wider muted mb-6
 * - grid: max-w-5xl mx-auto grid gap-6 items-center. columns 3/4/5/6 반응형(v2 colMap):
 *     3 → 3열 / 4 → 2→sm4 / 5 → 2→sm3→lg5 / 6 → 3→sm6
 * - marquee: overflow-hidden max-w-7xl mx-auto, track flex gap-10 whitespace-nowrap,
 *     30s linear infinite, translateX 0→-50%(복제 2벌)
 * - item: h-12 px-4 flex center. grayscale = grayscale opacity-60 → hover 원복
 * - img: h-8 w-auto object-contain / 텍스트: text-sm semibold muted
 */
export default css`
@layer junds.base {
  jd-logo-cloud:not(:defined) { display: block; }
}
@layer junds.components {
  jd-logo-cloud {
    display: block;
    box-sizing: border-box;
    font-family: var(--jd-font-sans);
    padding: var(--jd-space-10) var(--jd-space-4);
  }
  @media (min-width: 640px) {
    jd-logo-cloud { padding-inline: var(--jd-space-6); }
  }

  .jd-logo-cloud__title {
    text-align: center;
    margin-bottom: var(--jd-space-6);
    font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-semibold);
    text-transform: uppercase;
    letter-spacing: var(--jd-tracking-wide);
    color: var(--jd-color-muted);
  }

  /* ── grid (기본 = 5열 반응형) ── */
  jd-logo-cloud[layout="grid"] .jd-logo-cloud__viewport {
    max-width: 64rem; /* max-w-5xl */
    margin-inline: auto;
    display: grid;
    gap: var(--jd-space-6);
    align-items: center;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (min-width: 640px) {
    jd-logo-cloud[layout="grid"] .jd-logo-cloud__viewport { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }
  @media (min-width: 1024px) {
    jd-logo-cloud[layout="grid"] .jd-logo-cloud__viewport { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  }

  jd-logo-cloud[layout="grid"][columns="3"] .jd-logo-cloud__viewport {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  jd-logo-cloud[layout="grid"][columns="4"] .jd-logo-cloud__viewport {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (min-width: 640px) {
    jd-logo-cloud[layout="grid"][columns="4"] .jd-logo-cloud__viewport { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    jd-logo-cloud[layout="grid"][columns="6"] .jd-logo-cloud__viewport { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  }
  jd-logo-cloud[layout="grid"][columns="6"] .jd-logo-cloud__viewport {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  /* ── marquee ── */
  jd-logo-cloud[layout="marquee"] .jd-logo-cloud__viewport {
    position: relative;
    overflow: hidden;
    max-width: 80rem; /* max-w-7xl */
    margin-inline: auto;
  }
  .jd-logo-cloud__track {
    display: flex;
    gap: var(--jd-space-10);
    white-space: nowrap;
    width: max-content;
    animation: jd-logo-cloud-marquee 30s linear infinite;
  }
  @keyframes jd-logo-cloud-marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  @media (prefers-reduced-motion: reduce) {
    .jd-logo-cloud__track { animation: none; }
  }

  /* ── 셀 ── */
  .jd-logo-cloud__link {
    display: block;
    text-decoration: none;
    border-radius: var(--jd-radius-md);
  }
  .jd-logo-cloud__link:focus-visible {
    outline: var(--jd-border-medium) solid color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    outline-offset: 2px;
  }
  .jd-logo-cloud__item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 3rem; /* h-12 */
    padding-inline: var(--jd-space-4);
  }
  .jd-logo-cloud__img {
    height: 2rem; /* h-8 */
    width: auto;
    object-fit: contain;
  }
  .jd-logo-cloud__label {
    font-size: var(--jd-text-sm);
    font-weight: var(--jd-weight-semibold);
    color: var(--jd-color-muted);
  }

  /* 회색조 — 기본 ON, 호버 시 원색 복원 */
  jd-logo-cloud[data-grayscale] .jd-logo-cloud__item {
    filter: grayscale(1);
    opacity: var(--jd-opacity-60);
    transition: filter var(--jd-duration-normal) var(--jd-easing-ease-out),
      opacity var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  jd-logo-cloud[data-grayscale] .jd-logo-cloud__item:hover {
    filter: grayscale(0);
    opacity: 1;
  }
  @media (prefers-reduced-motion: reduce) {
    jd-logo-cloud[data-grayscale] .jd-logo-cloud__item { transition: none; }
  }
}`;
