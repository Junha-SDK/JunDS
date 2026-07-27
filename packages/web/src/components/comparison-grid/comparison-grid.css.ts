import { css } from "../../core/styles.js";

/**
 * v2 값: 격자 `grid gap-4` + columns별 `grid-cols-1 sm:grid-cols-2 md:grid-cols-N`,
 * 카드 `border rounded-xl p-4 bg-white hover:shadow-md hover:-translate-y-0.5`,
 * variance `border-l-[3px] border-l-amber-400 bg-amber-50/40`,
 * 라벨 `text-[10px] medium uppercase tracking-wider text-muted`,
 * 값 `text-xl bold tabular-nums`, 변화 배지 `text-xs semibold px-1.5 py-0.5 rounded-md mb-0.5`,
 * 보조문 `text-xs text-muted mt-1`.
 *
 * amber/white 리터럴은 warning·card 토큰으로 — 다크에서도 성립한다(v2는 라이트 전용).
 * 배지 글자색은 jd-badge와 같은 대비 보정 관용구(원색 80~90% + 검정, 다크는 원색 복원).
 */
export default css`
@layer junds.base {
  jd-comparison-grid:not(:defined) { display: grid; }
}
@layer junds.components {
  jd-comparison-grid {
    display: grid;
    gap: var(--jd-space-4);
    grid-template-columns: 1fr;
    font-family: var(--jd-font-sans);
  }
  @media (min-width: 640px) {
    jd-comparison-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 768px) {
    /* 기본 columns=4는 attribute로 반영되지 않는다(§1.3) — base가 담당 */
    jd-comparison-grid { grid-template-columns: repeat(4, 1fr); }
    jd-comparison-grid[columns="2"] { grid-template-columns: repeat(2, 1fr); }
    jd-comparison-grid[columns="3"] { grid-template-columns: repeat(3, 1fr); }
  }

  .jd-comparison-grid__card {
    box-sizing: border-box;
    padding: var(--jd-space-4);
    background: var(--jd-color-card);
    color: var(--jd-color-foreground);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    transition:
      box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out),
      transform var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-comparison-grid__card:hover { box-shadow: var(--jd-shadow-md); }
  @media (prefers-reduced-motion: no-preference) {
    .jd-comparison-grid__card:hover { transform: translateY(-2px); }
  }

  .jd-comparison-grid__card[data-variance] {
    border-inline-start: var(--jd-border-thick) solid var(--jd-color-warning);
    background: color-mix(in srgb, var(--jd-color-warning-light) 40%, var(--jd-color-card));
  }
  .jd-comparison-grid__card[data-variance]:hover {
    box-shadow: 0 4px 6px color-mix(in srgb, var(--jd-color-warning) 25%, transparent);
  }

  .jd-comparison-grid__label {
    display: block;
    font-size: .625rem;
    font-weight: var(--jd-weight-medium);
    text-transform: uppercase;
    letter-spacing: .05em;
    color: var(--jd-color-muted);
  }

  .jd-comparison-grid__row {
    display: flex;
    align-items: flex-end;
    gap: var(--jd-space-2);
    margin-block-start: var(--jd-space-1);
  }

  .jd-comparison-grid__value {
    font-size: var(--jd-text-2xl); /* v2 text-xl = 1.25rem */
    font-weight: var(--jd-weight-bold);
    line-height: var(--jd-leading-tight);
    font-variant-numeric: tabular-nums;
    color: var(--jd-color-foreground);
  }

  .jd-comparison-grid__change {
    display: inline-flex;
    align-items: center;
    margin-block-end: 2px;
    padding: var(--jd-space-0-5) var(--jd-space-1-5);
    border-radius: var(--jd-radius-md);
    font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-semibold);
    line-height: var(--jd-leading-normal);
    background: var(--jd-color-border-light);
    color: var(--jd-color-muted);
  }
  .jd-comparison-grid__change[hidden] { display: none; }
  .jd-comparison-grid__change[data-direction="up"] {
    background: var(--jd-color-success-light);
    color: color-mix(in srgb, var(--jd-color-success) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward));
  }
  .jd-comparison-grid__change[data-direction="down"] {
    background: var(--jd-color-danger-light);
    color: color-mix(in srgb, var(--jd-color-danger) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward));
  }

  .jd-comparison-grid__subtext {
    margin: var(--jd-space-1) 0 0;
    font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
  }
  .jd-comparison-grid__subtext[hidden] { display: none; }

  /* 시각적으로만 숨긴다 — 색으로만 전달되던 정보의 텍스트 등가물 (jd-visually-hidden 관용구) */
  .jd-comparison-grid__sr {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-comparison-grid__card { transition: none; }
  }
}`;
