import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - 루트: rounded-xl(12px) + border-border + bg-surface + overflow-hidden + transition-shadow.
 *   ※ v2 `bg-surface`는 Tailwind 팔레트의 밝은 패널색이라 다크 전용 토큰인 --jd-color-surface가
 *     아니라 --jd-color-card(라이트 #fff)로 번역한다(카드 배경 의미 보존).
 * - clickable(=오버레이 링크 존재) hover:shadow-md, image group-hover:scale-105.
 * - 배지: bg-danger text-white text-[10px] uppercase tracking-wider rounded-full.
 * - 위시: w-8 h-8 rounded-full bg-white/90 backdrop-blur, hover:scale-110, on일 때 하트=danger fill.
 * - 미디어: bg-surface-soft → 은은한 recessed 영역이라 --jd-color-background로 번역.
 * - 본문: p-4 gap-1. 브랜드 text-[10px] uppercase muted, 제목 text-sm medium line-clamp-2,
 *   평점 text-xs muted(별=warning, 값=foreground), 가격 text-base semibold.
 * - 장바구니: bg-foreground text-background rounded-md, hover:opacity-90.
 *
 * v2에 없던 접근성: 오버레이 링크 :focus-visible에 카드 포커스 링, 위시 :focus-visible 링,
 *   상승/확대 모션은 prefers-reduced-motion에서 뺀다.
 */
export default css`
@layer junds.base {
  jd-product-card:not(:defined) { display: block; }
}
@layer junds.components {
  jd-product-card {
    position: relative;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    background: var(--jd-color-card);
    overflow: hidden;
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
    transition: box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  jd-product-card[disabled] { opacity: 0.6; }
  /* display를 지정한 요소는 [hidden]이 안 먹는다(작성자 규칙이 UA를 이김) — 명시 가드 */
  .jd-product-card__wishlist[hidden],
  .jd-product-card__placeholder[hidden],
  .jd-product-card__stock[hidden],
  .jd-product-card__rating[hidden] { display: none; }
  jd-product-card[data-clickable] { cursor: pointer; }
  jd-product-card[data-clickable]:hover { box-shadow: var(--jd-shadow-md); }
  jd-product-card:has(.jd-product-card__link:focus-visible) {
    box-shadow: var(--jd-shadow-md), var(--jd-shadow-focus-ring);
  }

  /* 전면 오버레이 링크 — 카드 본문을 덮어 하나의 큰 히트 영역이 된다(중첩 인터랙티브 제거) */
  .jd-product-card__link {
    position: absolute;
    inset: 0;
    z-index: 1;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: transparent;
    font: inherit;
    cursor: inherit;
  }
  .jd-product-card__link:focus-visible { outline: none; }

  /* 배지 */
  .jd-product-card__badge {
    position: absolute;
    top: var(--jd-space-2);
    left: var(--jd-space-2);
    z-index: 3;
    padding: var(--jd-space-0-5) var(--jd-space-2);
    border-radius: var(--jd-radius-full);
    background: var(--jd-color-danger);
    color: #fff;
    font-size: 10px;
    font-weight: var(--jd-weight-bold);
    line-height: var(--jd-leading-normal);
    text-transform: uppercase;
    letter-spacing: var(--jd-tracking-wide);
  }

  /* 위시리스트 */
  .jd-product-card__wishlist {
    position: absolute;
    top: var(--jd-space-2);
    right: var(--jd-space-2);
    z-index: 4;
    width: 2rem;
    height: 2rem;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--jd-radius-full);
    background: color-mix(in srgb, var(--jd-color-card) 90%, transparent);
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
    color: var(--jd-color-foreground);
    cursor: pointer;
    transition: scale var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-product-card__wishlist:focus-visible {
    outline: none;
    box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-product-card__wishlist-icon {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }
  .jd-product-card__wishlist[data-on] .jd-product-card__wishlist-icon {
    fill: var(--jd-color-danger);
    stroke: var(--jd-color-danger);
  }
  @media (prefers-reduced-motion: no-preference) {
    .jd-product-card__wishlist:hover { scale: 1.1; }
  }

  /* 미디어 */
  .jd-product-card__main { display: block; }
  .jd-product-card__media {
    position: relative;
    display: block;
    width: 100%;
    overflow: hidden;
    background: var(--jd-color-background);
  }
  .jd-product-card__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: scale var(--jd-duration-slow) var(--jd-easing-ease-out);
  }
  @media (prefers-reduced-motion: no-preference) {
    jd-product-card[data-clickable]:hover .jd-product-card__image { scale: 1.05; }
  }
  .jd-product-card__placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--jd-color-muted);
    font-size: var(--jd-text-xs);
  }
  .jd-product-card__stock {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
  }
  .jd-product-card__stock-label {
    color: #fff;
    font-size: var(--jd-text-md);
    font-weight: var(--jd-weight-semibold);
    text-transform: uppercase;
    letter-spacing: var(--jd-tracking-wide);
  }

  /* 본문 */
  .jd-product-card__body {
    display: flex;
    flex-direction: column;
    gap: var(--jd-space-1);
    padding: var(--jd-space-4);
  }
  .jd-product-card__brand {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: var(--jd-tracking-wide);
    color: var(--jd-color-muted);
  }
  .jd-product-card__title {
    margin: 0;
    font-size: var(--jd-text-md);
    font-weight: var(--jd-weight-medium);
    line-height: var(--jd-leading-snug);
    color: var(--jd-color-foreground);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .jd-product-card__rating {
    display: flex;
    align-items: center;
    gap: var(--jd-space-1);
    font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
  }
  .jd-product-card__star { color: var(--jd-color-warning-ink); }
  .jd-product-card__rating-value {
    font-weight: var(--jd-weight-medium);
    color: var(--jd-color-foreground);
    font-variant-numeric: tabular-nums;
  }
  .jd-product-card__rating-count { font-variant-numeric: tabular-nums; }
  .jd-product-card__price {
    margin-top: var(--jd-space-1);
    font-size: var(--jd-text-lg);
    font-weight: var(--jd-weight-semibold);
    color: var(--jd-color-foreground);
  }

  /* 장바구니 — 오버레이 링크 위로 올린다(형제, z-index 2) */
  .jd-product-card__cart {
    position: relative;
    z-index: 2;
    margin: 0 var(--jd-space-4) var(--jd-space-4);
    padding: var(--jd-space-2) var(--jd-space-3);
    border: none;
    border-radius: var(--jd-radius-md);
    background: var(--jd-color-foreground);
    color: var(--jd-color-background);
    font-size: var(--jd-text-md);
    font-weight: var(--jd-weight-semibold);
    cursor: pointer;
    transition: opacity var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-product-card__cart:hover { opacity: 0.9; }
  .jd-product-card__cart:focus-visible {
    outline: none;
    box-shadow: var(--jd-shadow-focus-ring);
  }
}`;
