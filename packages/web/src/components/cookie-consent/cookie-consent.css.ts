import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - root: fixed z-50 max-w-lg w-[calc(100%-2rem)] rounded-xl border bg-surface shadow-2xl p-4
 * - position: bottom(가운데) / bottom-left / bottom-right, 모두 bottom-4 오프셋
 * - 메시지: text-sm foreground, 정책 링크 primary underline hover:opacity-80
 * - 패널: mt-3 space-y-2 border-t pt-3, 카테고리 flex items-start gap-2 text-sm(필수 opacity-70)
 * - 액션: mt-4 flex flex-wrap justify-end gap-2. customize=hover surface-soft,
 *   reject=border+hover surface-soft, primary=bg-primary white
 *
 * 개방 게이트: [data-open] 없으면 display:none — connected()의 스토리지 판정 전까지 숨김.
 */
export default css`
@layer junds.base {
  jd-cookie-consent:not(:defined) { display: none; }
}
@layer junds.components {
  jd-cookie-consent {
    position: fixed;
    z-index: var(--jd-z-toast);
    box-sizing: border-box;
    bottom: var(--jd-space-4);
    width: calc(100% - 2rem);
    max-width: 32rem; /* max-w-lg */
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    box-shadow: var(--jd-shadow-2xl);
    padding: var(--jd-space-4);
  }
  jd-cookie-consent:not([data-open]) { display: none; }

  /* 위치 */
  jd-cookie-consent[position="bottom"] {
    inset-inline-start: 50%;
    transform: translateX(-50%);
  }
  jd-cookie-consent[position="bottom-left"] { inset-inline-start: var(--jd-space-4); }
  jd-cookie-consent[position="bottom-right"] { inset-inline-end: var(--jd-space-4); }

  .jd-cookie-consent__message {
    margin: 0;
    font-size: var(--jd-text-sm);
    line-height: var(--jd-leading-normal);
    color: var(--jd-color-foreground);
  }
  .jd-cookie-consent__policy {
    color: var(--jd-color-primary);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .jd-cookie-consent__policy:hover { opacity: var(--jd-opacity-80); }

  .jd-cookie-consent__panel {
    margin-top: var(--jd-space-3);
    padding-top: var(--jd-space-3);
    border-top: var(--jd-border-thin) solid var(--jd-color-border);
    display: flex;
    flex-direction: column;
    gap: var(--jd-space-2);
  }
  .jd-cookie-consent__cat {
    display: flex;
    align-items: flex-start;
    gap: var(--jd-space-2);
    font-size: var(--jd-text-sm);
    cursor: pointer;
  }
  .jd-cookie-consent__cat[data-required] { opacity: var(--jd-opacity-70); cursor: default; }
  .jd-cookie-consent__cat-check {
    margin-top: 2px;
    accent-color: var(--jd-color-primary);
  }
  .jd-cookie-consent__cat-label { font-weight: var(--jd-weight-medium); }
  .jd-cookie-consent__cat-required {
    font-size: 10px;
    font-weight: var(--jd-weight-normal);
    color: var(--jd-color-muted);
  }
  .jd-cookie-consent__cat-desc {
    font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
  }

  .jd-cookie-consent__actions {
    margin-top: var(--jd-space-4);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: var(--jd-space-2);
  }
  .jd-cookie-consent__btn {
    box-sizing: border-box;
    border: var(--jd-border-thin) solid transparent;
    margin: 0;
    padding: var(--jd-space-1-5) var(--jd-space-3);
    font-family: inherit;
    font-size: var(--jd-text-sm);
    font-weight: var(--jd-weight-medium);
    line-height: var(--jd-leading-none);
    cursor: pointer;
    border-radius: var(--jd-radius-md);
    background: transparent;
    color: var(--jd-color-foreground);
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-cookie-consent__btn:focus-visible {
    outline: var(--jd-border-medium) solid color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    outline-offset: 2px;
  }
  .jd-cookie-consent__btn-customize:hover { background: var(--jd-color-card-hover); }
  .jd-cookie-consent__btn-reject {
    border-color: var(--jd-color-border);
  }
  .jd-cookie-consent__btn-reject:hover { background: var(--jd-color-card-hover); }
  .jd-cookie-consent__btn-primary {
    background: var(--jd-color-primary);
    color: #fff;
    font-weight: var(--jd-weight-semibold);
  }
  .jd-cookie-consent__btn-primary:hover { background: var(--jd-color-primary-hover); }

  @media (prefers-reduced-motion: reduce) {
    .jd-cookie-consent__btn { transition: none; }
  }
}`;
