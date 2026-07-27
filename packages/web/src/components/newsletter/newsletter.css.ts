import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - form: flex-col gap-3. inline = sm:flex-row sm:gap-2 sm:items-center
 * - field: flex gap-2. inline = sm:flex-1 row / 그 외 flex-col(버튼이 인풋 아래 전폭)
 * - input: rounded-md border bg-surface px-3 py-2.5 text-sm + focus ring
 * - submit: rounded-md bg-primary white px-4 py-2.5 text-sm semibold, disabled opacity-50
 * - consent: flex items-start gap-2 text-xs muted, accent-primary
 * - 메시지: text-xs, success/danger
 * - card variant: rounded-xl border bg-surface p-6
 * - header: mb-4, title text-lg semibold, desc mt-1 text-sm muted
 */
export default css`
@layer junds.base {
  jd-newsletter:not(:defined) { display: block; }
}
@layer junds.components {
  jd-newsletter {
    display: block;
    box-sizing: border-box;
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
  }
  jd-newsletter[variant="card"] {
    border: var(--jd-border-thin) solid var(--jd-color-border);
    background: var(--jd-color-card);
    border-radius: var(--jd-radius-xl);
    padding: var(--jd-space-6);
  }

  .jd-newsletter__header { margin-bottom: var(--jd-space-4); }
  .jd-newsletter__title {
    margin: 0;
    font-size: var(--jd-text-lg);
    font-weight: var(--jd-weight-semibold);
    line-height: var(--jd-leading-snug);
  }
  .jd-newsletter__desc {
    margin: var(--jd-space-1) 0 0;
    font-size: var(--jd-text-sm);
    color: var(--jd-color-muted);
  }

  .jd-newsletter__form {
    display: flex;
    flex-direction: column;
    gap: var(--jd-space-3);
  }
  jd-newsletter[variant="inline"] .jd-newsletter__form { gap: var(--jd-space-2); }
  @media (min-width: 640px) {
    jd-newsletter[variant="inline"] .jd-newsletter__form {
      flex-direction: row;
      align-items: center;
    }
  }

  .jd-newsletter__field {
    display: flex;
    flex-direction: column;
    gap: var(--jd-space-2);
  }
  @media (min-width: 640px) {
    jd-newsletter[variant="inline"] .jd-newsletter__field {
      flex-direction: row;
      flex: 1;
    }
  }

  .jd-newsletter__input {
    flex: 1;
    min-width: 0;
    box-sizing: border-box;
    border: var(--jd-border-thin) solid var(--jd-color-border);
    background: var(--jd-color-card);
    color: var(--jd-color-foreground);
    border-radius: var(--jd-radius-md);
    padding: var(--jd-space-2-5) var(--jd-space-3);
    font-family: inherit;
    font-size: var(--jd-text-sm);
  }
  .jd-newsletter__input::placeholder { color: var(--jd-color-muted); }
  .jd-newsletter__input:focus-visible {
    outline: none;
    border-color: var(--jd-color-primary);
    box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-newsletter__input[aria-invalid] { border-color: var(--jd-color-danger); }

  .jd-newsletter__submit {
    box-sizing: border-box;
    border: 0;
    margin: 0;
    padding: var(--jd-space-2-5) var(--jd-space-4);
    font-family: inherit;
    font-size: var(--jd-text-sm);
    font-weight: var(--jd-weight-semibold);
    line-height: var(--jd-leading-none);
    cursor: pointer;
    border-radius: var(--jd-radius-md);
    background: var(--jd-color-primary);
    color: #fff;
    white-space: nowrap;
    transition: background-color var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-newsletter__submit:hover { background: var(--jd-color-primary-hover); }
  .jd-newsletter__submit:focus-visible {
    outline: var(--jd-border-medium) solid color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    outline-offset: 2px;
  }
  .jd-newsletter__submit:disabled { opacity: var(--jd-opacity-50); cursor: default; }

  .jd-newsletter__consent {
    display: flex;
    align-items: flex-start;
    gap: var(--jd-space-2);
    font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
    cursor: pointer;
  }
  .jd-newsletter__consent input {
    margin-top: 2px;
    accent-color: var(--jd-color-primary);
  }

  .jd-newsletter__message { font-size: var(--jd-text-xs); }
  .jd-newsletter__message[data-tone="danger"] { color: var(--jd-color-danger-ink); }
  .jd-newsletter__message[data-tone="success"] { color: var(--jd-color-success-ink); }

  @media (prefers-reduced-motion: reduce) {
    .jd-newsletter__submit { transition: none; }
  }
}`;
