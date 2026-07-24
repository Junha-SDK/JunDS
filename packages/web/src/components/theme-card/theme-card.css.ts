import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - 카드: bm-card(카드 배경·테두리·radius 2xl) overflow-hidden h-full flex-col,
 *   hover shadow-md, 기본 그림자 0 1px 2px.
 * - 헤더: px-4 pt-3.5 pb-2.5, 이름 15px 800 tracking-tight truncate, 헤드라인 12px muted.
 * - 총액 태그: v2 <Tag color="teal"> → accent(teal) 12% 틴트 + accent-strong 글자.
 * - 종목 행: px-3 py-2.5, hover soft. 이름 13px 700, 가격 13px 800(up/down 색),
 *   거래대금 10.5px muted. 왕관=warning, hot dot 6px up.
 * - pct: hot이면 up/down 14% 틴트 pill(▲/▼), 아니면 12.5px 800 up/down 색.
 *
 * finance 색 --bm-* → jd 폴백 체인(daily-themes-calendar 동형).
 * 한국 관례 상승/하락 색은 상위 컴포넌트들(live-price·backtest-runner)과 맞춰
 * up→success, down→danger로 둔다(앱이 --bm-up/down으로 재틴트 가능).
 */
export default css`
@layer junds.components {
  jd-theme-card {
    --jd-fin-up: var(--bm-up, var(--jd-color-success));
    --jd-fin-down: var(--bm-down, var(--jd-color-danger));
    --jd-fin-accent: var(--bm-accent, #14b8a6);
    --jd-fin-accent-strong: var(--bm-accent-strong, #0d9488);
    --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
    --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
    --jd-fin-border: var(--bm-border, var(--jd-color-border));
    --jd-fin-card: var(--bm-card, var(--jd-color-card));
    --jd-fin-soft: var(--bm-soft-100, color-mix(in srgb, var(--jd-color-foreground) 6%, transparent));
    --jd-fin-warning: var(--bm-warning, var(--jd-color-warning));

    display: block; box-sizing: border-box; height: 100%;
    font-family: var(--jd-font-sans); color: var(--jd-fin-text);
  }
  jd-theme-card * { box-sizing: border-box; }

  .jd-theme-card {
    display: flex; flex-direction: column; height: 100%; overflow: hidden;
    background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-2xl);
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    transition: box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-theme-card:hover { box-shadow: var(--jd-shadow-md); }

  /* 헤더 */
  .jd-theme-card__header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: var(--jd-space-3);
    padding: var(--jd-space-3-5) var(--jd-space-4) var(--jd-space-2-5);
  }
  .jd-theme-card__heading { min-width: 0; }
  .jd-theme-card__title-row { display: flex; align-items: center; gap: var(--jd-space-1-5); }
  .jd-theme-card__star { color: var(--jd-fin-warning); font-size: 14px; line-height: 1; }
  .jd-theme-card__name {
    margin: 0; font-size: 15px; font-weight: 800;
    letter-spacing: var(--jd-tracking-tight);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-theme-card__headline {
    margin: var(--jd-space-1) 0 0; font-size: 12px;
    color: var(--jd-fin-muted); line-height: var(--jd-leading-tight);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-theme-card__total {
    flex-shrink: 0; align-self: flex-start;
    padding: var(--jd-space-0-5) var(--jd-space-2);
    border-radius: var(--jd-radius-md);
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-bold);
    font-variant-numeric: tabular-nums; white-space: nowrap;
    background: color-mix(in srgb, var(--jd-fin-accent) 12%, transparent);
    color: var(--jd-fin-accent-strong);
  }

  /* 스파크라인 */
  .jd-theme-card__chart {
    padding: 0 var(--jd-space-4) var(--jd-space-1);
    opacity: 0.9;
  }
  .jd-theme-card__spark { display: block; width: 100%; height: 32px; }
  .jd-theme-card__spark-line {
    fill: none; stroke: var(--jd-fin-accent); stroke-width: 1.5;
    stroke-linejoin: round; stroke-linecap: round;
    vector-effect: non-scaling-stroke;
  }
  .jd-theme-card__spark-area {
    fill: color-mix(in srgb, var(--jd-fin-accent) 14%, transparent); stroke: none;
  }

  /* 종목 목록 */
  .jd-theme-card__list { list-style: none; margin: 0; padding: 0; flex: 1; }
  .jd-theme-card__empty {
    padding: var(--jd-space-6) var(--jd-space-4); text-align: center;
    font-size: 12px; color: var(--jd-fin-muted);
  }
  .jd-theme-card__row {
    display: flex; align-items: center; gap: var(--jd-space-2);
    padding: var(--jd-space-2-5) var(--jd-space-3);
    text-decoration: none; color: inherit;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-theme-card__row:hover { background: var(--jd-fin-soft); }
  .jd-theme-card__row:focus-visible {
    outline: var(--jd-border-medium) solid var(--jd-fin-accent-strong);
    outline-offset: -2px; border-radius: var(--jd-radius-md);
  }

  .jd-theme-card__stock-name {
    min-width: 0; flex: 1; display: flex; align-items: center; gap: var(--jd-space-1-5);
  }
  .jd-theme-card__king { color: var(--jd-fin-warning); }
  .jd-theme-card__hot {
    flex-shrink: 0; width: 6px; height: 6px; border-radius: var(--jd-radius-full);
    background: var(--jd-fin-up);
  }
  .jd-theme-card__stock-label {
    font-size: 13px; font-weight: var(--jd-weight-bold);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .jd-theme-card__num {
    flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end;
    line-height: var(--jd-leading-tight); font-variant-numeric: tabular-nums;
  }
  .jd-theme-card__price { font-size: 13px; font-weight: 800; }
  .jd-theme-card__price[data-dir="up"] { color: var(--jd-fin-up); }
  .jd-theme-card__price[data-dir="down"] { color: var(--jd-fin-down); }
  .jd-theme-card__amount {
    font-size: 10.5px; font-weight: var(--jd-weight-semibold); color: var(--jd-fin-muted);
  }

  .jd-theme-card__pct {
    flex-shrink: 0; font-variant-numeric: tabular-nums;
    font-size: 12.5px; font-weight: 800;
  }
  .jd-theme-card__pct[data-dir="up"] { color: var(--jd-fin-up); }
  .jd-theme-card__pct[data-dir="down"] { color: var(--jd-fin-down); }
  .jd-theme-card__pct[data-hot] {
    display: inline-flex; align-items: center; gap: var(--jd-space-0-5);
    font-size: 12px; padding: 2px 7px; border-radius: var(--jd-radius-md);
    letter-spacing: -0.005em;
  }
  /* hot pill: 14% 틴트 위 원색 up/down 글자는 대비가 얕다 — hue는 유지하고 글자를
     foreground 쪽으로 섞어 대비 확보(03-web-arch §4.3, 라이트/다크 양쪽 대응). */
  .jd-theme-card__pct[data-hot][data-dir="up"] {
    background: color-mix(in srgb, var(--jd-fin-up) 14%, transparent);
    color: color-mix(in srgb, var(--jd-fin-up) 65%, var(--jd-color-foreground));
  }
  .jd-theme-card__pct[data-hot][data-dir="down"] {
    background: color-mix(in srgb, var(--jd-fin-down) 14%, transparent);
    color: color-mix(in srgb, var(--jd-fin-down) 65%, var(--jd-color-foreground));
  }
  .jd-theme-card__pct-arrow { font-size: 10px; line-height: 1; }

  @media (prefers-reduced-motion: reduce) {
    .jd-theme-card, .jd-theme-card__row { transition: none; }
  }
}`;
