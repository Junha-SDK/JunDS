import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - 컨테이너: inline-flex flex-wrap. inline → items-baseline gap-1.5(0.375rem),
 *   stacked → flex-col gap-0.5(0.125rem).
 * - 현재가: font-bold tabular-nums. 원가: text-muted line-through tabular-nums.
 * - 할인율: font-bold text-danger tabular-nums.
 * - size 4종의 Tailwind 텍스트 클래스를 rem 등가 jd 토큰으로 번역
 *   (text-sm→md · text-base→lg · text-xl→2xl · text-3xl→4xl · text-2xl→3xl · text-xs→xs):
 *     sm  현재 text-sm  / 원가 text-xs
 *     md  현재 text-base/ 원가 text-xs
 *     lg  현재 text-xl  / 원가 text-sm
 *     xl  현재 text-3xl / 원가 text-base, 할인율은 text-2xl(v2 특례)
 *   할인율은 xl을 제외하면 현재가와 같은 크기.
 */
export default css`
@layer junds.base {
  jd-price-display:not(:defined) { display: inline-flex; }
}
@layer junds.components {
  jd-price-display {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--jd-space-1-5);
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
  }
  jd-price-display[layout="stacked"] {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--jd-space-0-5);
  }

  .jd-price-display__current {
    display: inline-flex;
    align-items: baseline;
    font-weight: var(--jd-weight-bold);
    font-variant-numeric: tabular-nums;
    color: var(--jd-color-foreground);
  }
  .jd-price-display__suffix {
    margin-inline-start: var(--jd-space-0-5);
    font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-normal);
    color: var(--jd-color-muted);
  }
  .jd-price-display__discount {
    font-weight: var(--jd-weight-bold);
    font-variant-numeric: tabular-nums;
    color: var(--jd-color-danger);
  }
  .jd-price-display__original {
    color: var(--jd-color-muted);
    text-decoration: line-through;
    font-variant-numeric: tabular-nums;
  }

  /* size md (기본) */
  .jd-price-display__current,
  .jd-price-display__discount { font-size: var(--jd-text-lg); }
  .jd-price-display__original { font-size: var(--jd-text-xs); }

  jd-price-display[size="sm"] .jd-price-display__current,
  jd-price-display[size="sm"] .jd-price-display__discount { font-size: var(--jd-text-md); }
  jd-price-display[size="sm"] .jd-price-display__original { font-size: var(--jd-text-xs); }

  jd-price-display[size="lg"] .jd-price-display__current,
  jd-price-display[size="lg"] .jd-price-display__discount { font-size: var(--jd-text-2xl); }
  jd-price-display[size="lg"] .jd-price-display__original { font-size: var(--jd-text-md); }

  jd-price-display[size="xl"] .jd-price-display__current { font-size: var(--jd-text-4xl); }
  jd-price-display[size="xl"] .jd-price-display__discount { font-size: var(--jd-text-3xl); }
  jd-price-display[size="xl"] .jd-price-display__original { font-size: var(--jd-text-lg); }
}`;
