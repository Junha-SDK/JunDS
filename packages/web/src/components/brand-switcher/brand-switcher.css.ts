import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - select: h-9 px-3 text-sm rounded-md border-border bg-surface(→--jd-color-card) + focus ring primary/40.
 * - chips: flex-wrap gap-2, 칩 px-3 py-1.5 rounded-full text-xs medium.
 *   inactive bg-surface-soft(→foreground 6%)·hover surface(→10%), active bg-primary text-white.
 *   스와치 w-3 h-3 dot + ring-white/30(=primary).
 * - list: space-y-1, 행 p-3 rounded-lg border, inactive border-border·hover border-primary/40,
 *   active border-primary + bg-primary/5. 스와치 w-8 h-8 rounded-md 그라디언트(primary→accent).
 *   라벨 text-sm semibold, tagline text-xs muted, active ✓ primary.
 *
 * v2 role="radio" 버튼 대신 네이티브 radio input(시각 숨김)+<label> 칩 — 활성/포커스는
 *   :has(:checked)/:has(:focus-visible)로 스타일한다(v2에 없던 화살표 순회가 공짜).
 */
export default css`
  @layer junds.base {
    jd-brand-switcher:not(:defined) {
      display: block;
    }
  }
  @layer junds.components {
    jd-brand-switcher {
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }
    jd-brand-switcher[variant="chips"] {
      display: flex;
      flex-wrap: wrap;
      gap: var(--jd-space-2);
    }
    jd-brand-switcher[variant="list"] {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-1);
    }
    jd-brand-switcher[variant="select"] {
      display: inline-block;
    }

    /* 네이티브 radio는 시각적으로 숨기되 포커스 가능(화살표 순회 유지) */
    .jd-brand-switcher__input {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      border: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .jd-brand-switcher__item {
      position: relative;
      cursor: pointer;
    }
    .jd-brand-switcher__item:has(.jd-brand-switcher__input:focus-visible) {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }
    .jd-brand-switcher__text {
      min-width: 0;
    }
    .jd-brand-switcher__label {
      color: var(--jd-color-foreground);
    }

    /* ── select ── */
    .jd-brand-switcher__select {
      height: 2.25rem;
      padding-inline: var(--jd-space-3);
      font-family: inherit;
      font-size: var(--jd-text-md);
      border-radius: var(--jd-radius-md);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
      cursor: pointer;
    }
    .jd-brand-switcher__select:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    }

    /* ── chips ── */
    jd-brand-switcher[variant="chips"] .jd-brand-switcher__item {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-2);
      padding: var(--jd-space-1-5) var(--jd-space-3);
      border-radius: var(--jd-radius-full);
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-medium);
      background: color-mix(in srgb, var(--jd-color-foreground) 6%, transparent);
      transition: background var(--jd-duration-normal) var(--jd-easing-ease-out),
        color var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    jd-brand-switcher[variant="chips"] .jd-brand-switcher__item:hover {
      background: color-mix(in srgb, var(--jd-color-foreground) 10%, transparent);
    }
    jd-brand-switcher[variant="chips"]
      .jd-brand-switcher__item:has(.jd-brand-switcher__input:checked) {
      background: var(--jd-color-primary);
    }
    jd-brand-switcher[variant="chips"]
      .jd-brand-switcher__item:has(.jd-brand-switcher__input:checked)
      .jd-brand-switcher__label {
      color: #fff;
    }
    jd-brand-switcher[variant="chips"] .jd-brand-switcher__swatch {
      flex-shrink: 0;
      width: 0.75rem;
      height: 0.75rem;
      border-radius: var(--jd-radius-full);
      background: var(--jd-bs-primary, var(--jd-color-primary));
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
    }
    jd-brand-switcher[variant="chips"] .jd-brand-switcher__tagline {
      display: none;
    }

    /* ── list ── */
    jd-brand-switcher[variant="list"] .jd-brand-switcher__item {
      display: flex;
      align-items: center;
      gap: var(--jd-space-3);
      box-sizing: border-box;
      width: 100%;
      padding: var(--jd-space-3);
      border-radius: var(--jd-radius-lg);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      text-align: left;
      transition: border-color var(--jd-duration-normal) var(--jd-easing-ease-out),
        background var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    jd-brand-switcher[variant="list"] .jd-brand-switcher__item:hover {
      border-color: color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    }
    jd-brand-switcher[variant="list"]
      .jd-brand-switcher__item:has(.jd-brand-switcher__input:checked) {
      border-color: var(--jd-color-primary);
      background: color-mix(in srgb, var(--jd-color-primary) 5%, transparent);
    }
    jd-brand-switcher[variant="list"]
      .jd-brand-switcher__item:has(.jd-brand-switcher__input:checked)::after {
      content: "✓";
      margin-inline-start: auto;
      color: var(--jd-color-primary-ink);
      font-size: var(--jd-text-md);
    }
    jd-brand-switcher[variant="list"] .jd-brand-switcher__swatch {
      flex-shrink: 0;
      width: 2rem;
      height: 2rem;
      border-radius: var(--jd-radius-md);
      background: linear-gradient(
        135deg,
        var(--jd-bs-primary, var(--jd-color-primary)),
        var(--jd-bs-accent, var(--jd-color-accent))
      );
    }
    jd-brand-switcher[variant="list"] .jd-brand-switcher__text {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    jd-brand-switcher[variant="list"] .jd-brand-switcher__label {
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-semibold);
    }
    jd-brand-switcher[variant="list"] .jd-brand-switcher__tagline {
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* disabled */
    jd-brand-switcher[disabled] .jd-brand-switcher__item,
    jd-brand-switcher[disabled] .jd-brand-switcher__select {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;
