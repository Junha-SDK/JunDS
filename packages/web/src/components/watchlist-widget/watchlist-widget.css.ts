import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 기계 번역):
 * - 루트: bm-card + overflow-hidden. (형제 jd-live-stock-table 카드와 같은 radius-xl 채택)
 * - 헤더: flex justify-between, px-4 py-3, 종목 있을 때만 하단 보더(bm-border).
 *   ★ deco 15px warning, 제목 14px extrabold, count 배지 info sm, 라이브 점, 출처 배지
 *   10px extrabold px-1.5 py-0.5 rounded + bm-soft-100 배경 + source별 색.
 * - "추가 ›" 12px muted semibold.
 * - 빈 상태 12.5px muted leading-relaxed px-4 py-5.
 * - 행: px-3 py-2.5 gap-2, divide-y(행 사이 보더), 별 16px, 색 점 8px, 이름 13.5px bold
 *   truncate, 우측 현재가(md)+등락률 배지.
 * finance 색은 --bm-* → jd 폴백(형제 jd-live-stock-table 브리지 관용).
 */
export default css`
@layer junds.base {
  jd-watchlist-widget:not(:defined) { display: block; }
}
@layer junds.components {
  jd-watchlist-widget {
    --jd-fin-up: var(--bm-up, var(--jd-color-success));
    --jd-fin-down: var(--bm-down, var(--jd-color-danger));
    --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
    --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
    --jd-fin-border: var(--bm-border, var(--jd-color-border));
    --jd-fin-card: var(--bm-card, var(--jd-color-card));
    --jd-fin-soft: var(--bm-soft-100, color-mix(in srgb, var(--jd-color-foreground) 6%, transparent));
    --jd-fin-warning: var(--bm-warning, var(--jd-color-warning));
    --jd-fin-success: var(--bm-success, var(--jd-color-success));

    display: block;
    overflow: hidden;
    font-family: var(--jd-font-sans);
    color: var(--jd-fin-text);
    background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-xl);
  }
  jd-watchlist-widget * { box-sizing: border-box; }

  /* ── 헤더 ─────────────────────────────────────────── */
  .jd-wlw__header {
    display: flex; align-items: center; justify-content: space-between;
    gap: var(--jd-space-2);
    padding: var(--jd-space-3) var(--jd-space-4);
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  jd-watchlist-widget[data-empty] .jd-wlw__header { border-block-end: none; }

  .jd-wlw__lead {
    display: flex; align-items: center; gap: var(--jd-space-2);
    flex-wrap: wrap; min-width: 0;
  }
  .jd-wlw__mark { color: var(--jd-fin-warning); font-size: 15px; line-height: 1; }
  .jd-wlw__title {
    margin: 0; font-size: var(--jd-text-md); font-weight: 800;
    line-height: var(--jd-leading-tight); color: var(--jd-fin-text);
  }
  .jd-wlw__status[hidden] { display: none; }

  .jd-wlw__source {
    font-size: 10px; font-weight: 800; letter-spacing: var(--jd-tracking-wide);
    padding: var(--jd-space-0-5) var(--jd-space-1-5);
    border-radius: var(--jd-radius-md); white-space: nowrap;
    background: var(--jd-fin-soft); color: var(--jd-fin-muted);
  }
  .jd-wlw__source[hidden] { display: none; }
  /* semantic 원색을 중립 틴트 위에 그대로 얹으면 대비 부족(특히 warning=amber) —
     전경색과 65:35로 섞어 가독 대비 확보(대비 규칙). --bm-* 브리지는 유지 */
  .jd-wlw__source[data-source="kis"] {
    color: color-mix(in srgb, var(--jd-fin-success) 65%, var(--jd-fin-text));
  }
  .jd-wlw__source[data-source="yahoo"] {
    color: color-mix(in srgb, var(--jd-fin-warning) 65%, var(--jd-fin-text));
  }

  .jd-wlw__add {
    flex-shrink: 0; font-family: inherit;
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-semibold);
    color: var(--jd-fin-muted); text-decoration: none; white-space: nowrap;
    background: none; border: 0; padding: 0; cursor: pointer;
  }
  .jd-wlw__add:hover { color: var(--jd-fin-text); }

  /* ── 빈 상태 ──────────────────────────────────────── */
  .jd-wlw__empty {
    margin: 0; padding: var(--jd-space-5) var(--jd-space-4);
    font-size: 12.5px; line-height: var(--jd-leading-relaxed);
    color: var(--jd-fin-muted);
  }
  .jd-wlw__empty[hidden] { display: none; }

  /* ── 목록 ─────────────────────────────────────────── */
  .jd-wlw__list { list-style: none; margin: 0; padding: 0; }
  .jd-wlw__list[hidden] { display: none; }

  .jd-wlw__row {
    display: flex; align-items: center; gap: var(--jd-space-2);
    padding: 10px var(--jd-space-3);
    border-block-start: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  .jd-wlw__row:first-child { border-block-start: 0; } /* divide-y: 첫 행 위 보더 없음 */

  .jd-wlw__star {
    flex-shrink: 0; display: inline-flex; padding: var(--jd-space-1);
    line-height: 0; color: var(--jd-fin-warning);
    background: none; border: 0; cursor: pointer;
  }
  .jd-wlw__star svg { display: block; width: 16px; height: 16px; fill: currentColor; }

  .jd-wlw__dot {
    flex-shrink: 0; width: 8px; height: 8px; border-radius: var(--jd-radius-full);
  }
  .jd-wlw__dot[hidden] { display: none; }

  .jd-wlw__link {
    flex: 1 1 auto; min-width: 0;
    display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-2);
    font: inherit; text-align: left; color: inherit; text-decoration: none;
    background: none; border: 0; padding: 0; cursor: pointer;
  }
  .jd-wlw__name {
    min-width: 0; font-size: 13.5px; font-weight: var(--jd-weight-bold);
    color: var(--jd-fin-text);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-wlw__meta {
    flex-shrink: 0; display: inline-flex; align-items: center; gap: var(--jd-space-2);
  }

  /* 키보드 사용자 초점 링 — v2에는 없었다 */
  .jd-wlw__star:focus-visible,
  .jd-wlw__link:focus-visible,
  .jd-wlw__add:focus-visible {
    outline: none; border-radius: var(--jd-radius-sm);
    box-shadow: var(--jd-shadow-focus-ring);
  }
}`;
