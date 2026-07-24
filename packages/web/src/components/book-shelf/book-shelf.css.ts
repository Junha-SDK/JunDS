import { css } from "../../core/styles.js";

/**
 * v2 값: variant wood(`p-4 rounded-2xl` 앰버 그라디언트 + inset 그림자) · minimal(`p-2`) ·
 * card(`p-5 rounded-xl border bg-surface shadow-sm`), 라벨 `mb-3 px-1 text-sm semibold
 * foreground tracking-tight`, 그리드 `grid gap-3` + 반응형 열.
 *
 * columnsMap 반응형(Tailwind sm=640 lg=1024)을 미디어쿼리로 옮긴다:
 *  3·4 = 고정, 5 = 2→3(sm)→5(lg), 6 = 3→4(sm)→6(lg), 8 = 4→6(sm)→8(lg).
 * wood 앰버는 warning×card color-mix로 — 다크에서도 온기가 남는다(v2는 라이트 전용).
 */
export default css`
@layer junds.components {
  jd-book-shelf {
    display: block; box-sizing: border-box;
    font-family: var(--jd-font-sans);
    padding: var(--jd-space-2); /* minimal 기본 */
  }

  jd-book-shelf[variant="card"] {
    padding: var(--jd-space-5);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    background: var(--jd-color-card);
    box-shadow: var(--jd-shadow-sm);
  }
  jd-book-shelf[variant="wood"] {
    padding: var(--jd-space-4);
    border-radius: var(--jd-radius-2xl);
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--jd-color-warning) 8%, var(--jd-color-card)) 0%,
      color-mix(in srgb, var(--jd-color-warning) 16%, var(--jd-color-card)) 100%
    );
    box-shadow: inset 0 -4px 8px rgba(0, 0, 0, 0.08);
  }

  .jd-book-shelf__header {
    margin-block-end: var(--jd-space-3);
    padding-inline: var(--jd-space-1);
    font-size: var(--jd-text-sm); font-weight: var(--jd-weight-semibold);
    letter-spacing: var(--jd-tracking-tight); color: var(--jd-color-foreground);
  }
  .jd-book-shelf__header[hidden] { display: none; }

  .jd-book-shelf__grid {
    display: grid; gap: var(--jd-space-3);
    grid-template-columns: repeat(2, minmax(0, 1fr)); /* columns=5 기본, ~640 */
  }
  jd-book-shelf[columns="3"] .jd-book-shelf__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  jd-book-shelf[columns="4"] .jd-book-shelf__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  jd-book-shelf[columns="6"] .jd-book-shelf__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  jd-book-shelf[columns="8"] .jd-book-shelf__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }

  @media (min-width: 640px) {
    jd-book-shelf[columns="5"] .jd-book-shelf__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    jd-book-shelf[columns="6"] .jd-book-shelf__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    jd-book-shelf[columns="8"] .jd-book-shelf__grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  }
  @media (min-width: 1024px) {
    jd-book-shelf[columns="5"] .jd-book-shelf__grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
    jd-book-shelf[columns="6"] .jd-book-shelf__grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    jd-book-shelf[columns="8"] .jd-book-shelf__grid { grid-template-columns: repeat(8, minmax(0, 1fr)); }
  }
}`;
