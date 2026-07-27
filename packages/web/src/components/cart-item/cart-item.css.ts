import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - 행: flex items-start gap-4 py-4 border-b border-border, last:border-b-0, disabled opacity-60.
 * - 썸네일: w-20 h-20(5rem) rounded-md overflow-hidden bg-surface-soft(→--jd-color-background).
 * - 본문: 제목 text-sm medium truncate, variant mt-0.5 text-xs muted truncate,
 *   단가 mt-2 text-sm muted, 수량 위젯 mt-2.
 * - 우측: flex-col items-end gap-2, 소계 text-sm semibold, 삭제 text-xs muted hover:text-danger.
 */
export default css`
@layer junds.base {
  jd-cart-item:not(:defined) { display: flex; }
}
@layer junds.components {
  jd-cart-item {
    display: flex;
    align-items: flex-start;
    gap: var(--jd-space-4);
    padding-block: var(--jd-space-4);
    border-block-end: var(--jd-border-thin) solid var(--jd-color-border);
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
  }
  jd-cart-item:last-of-type { border-block-end: none; }
  jd-cart-item[disabled] { opacity: 0.6; }

  .jd-cart-item__thumb {
    display: block;
    flex-shrink: 0;
    width: 5rem;
    height: 5rem;
    border-radius: var(--jd-radius-md);
    overflow: hidden;
    background: var(--jd-color-background);
  }
  /* display 지정 요소는 [hidden]이 안 먹으므로 명시 가드 */
  .jd-cart-item__thumb[hidden],
  .jd-cart-item__variant[hidden],
  .jd-cart-item__price[hidden] { display: none; }
  .jd-cart-item__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .jd-cart-item__body {
    flex: 1;
    min-width: 0;
  }
  .jd-cart-item__title {
    margin: 0;
    font-size: var(--jd-text-md);
    font-weight: var(--jd-weight-medium);
    line-height: var(--jd-leading-snug);
    color: var(--jd-color-foreground);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .jd-cart-item__variant {
    display: block;
    margin-top: var(--jd-space-0-5);
    font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .jd-cart-item__price {
    display: block;
    margin-top: var(--jd-space-2);
    font-size: var(--jd-text-md);
    color: var(--jd-color-muted);
  }
  .jd-cart-item__qty {
    margin-top: var(--jd-space-2);
  }

  .jd-cart-item__aside {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--jd-space-2);
    flex-shrink: 0;
  }
  .jd-cart-item__subtotal {
    font-size: var(--jd-text-md);
    font-weight: var(--jd-weight-semibold);
    color: var(--jd-color-foreground);
  }
  .jd-cart-item__remove {
    padding: 0;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
    cursor: pointer;
    transition: color var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-cart-item__remove:hover { color: var(--jd-color-danger-ink); }
  .jd-cart-item__remove:disabled { opacity: 0.5; cursor: not-allowed; }
  .jd-cart-item__remove:focus-visible {
    outline: none;
    border-radius: var(--jd-radius-sm);
    box-shadow: var(--jd-shadow-focus-ring);
  }
}`;
