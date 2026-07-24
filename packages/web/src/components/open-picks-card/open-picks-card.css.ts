import { css } from "../../core/styles.js";

/**
 * jd-open-picks-card CSS — v2 PicksCard(bm-card + 헤더 하단선 + 행 상단선 + soft footer).
 * finance 색은 --bm-* → jd 폴백. 강도 배지 3색(강=상승적, 중=경고황, 약=soft),
 * 예상 변동률은 상승색. 값 폰트는 tabular-nums(bm-num).
 */
export default css`
@layer junds.components {
  jd-open-picks-card {
    --jd-fin-up: var(--bm-up, var(--jd-color-danger));
    --jd-fin-warning: var(--bm-yellow, var(--jd-color-warning));
    --jd-fin-muted: var(--bm-muted, var(--jd-color-muted));
    --jd-fin-text: var(--bm-text, var(--jd-color-foreground));
    --jd-fin-border: var(--bm-border, var(--jd-color-border));
    --jd-fin-card: var(--bm-card, var(--jd-color-card));
    --jd-fin-soft: var(--bm-soft-100, color-mix(in srgb, var(--jd-color-foreground) 6%, transparent));
    --jd-fin-soft-200: var(--bm-soft-200, color-mix(in srgb, var(--jd-color-foreground) 10%, transparent));

    display: block; box-sizing: border-box; overflow: hidden;
    background: var(--jd-fin-card);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
    border-radius: var(--jd-radius-xl);
    box-shadow: var(--jd-shadow-sm);
    font-family: var(--jd-font-sans); color: var(--jd-fin-text);
  }
  jd-open-picks-card * { box-sizing: border-box; }

  /* 헤더 */
  .jd-open-picks-card__head {
    display: flex; align-items: center; justify-content: space-between; gap: var(--jd-space-2);
    padding: var(--jd-space-2-5) var(--jd-space-4);
    border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  .jd-open-picks-card__titlewrap {
    display: inline-flex; align-items: center; gap: var(--jd-space-2); min-width: 0;
  }
  .jd-open-picks-card__emoji { font-size: 14px; line-height: 1; flex-shrink: 0; }
  .jd-open-picks-card__title {
    margin: 0; font-size: 13.5px; font-weight: 800; letter-spacing: var(--jd-tracking-tight);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-open-picks-card__summary {
    flex-shrink: 0; font-size: 11px; font-weight: 700; color: var(--jd-fin-muted);
    font-variant-numeric: tabular-nums;
  }

  /* 목록 */
  .jd-open-picks-card__list { list-style: none; margin: 0; padding: 0; }
  .jd-open-picks-card__item {
    display: flex; align-items: center; gap: var(--jd-space-3);
    padding: var(--jd-space-2-5) var(--jd-space-4);
  }
  .jd-open-picks-card__item + .jd-open-picks-card__item {
    border-block-start: var(--jd-border-thin) solid var(--jd-fin-border);
  }

  /* 강도 배지 */
  .jd-open-picks-card__badge {
    flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
    width: 22px; height: 22px; border-radius: var(--jd-radius-md);
    font-size: 10.5px; font-weight: 800;
    background: var(--jd-fin-soft-200); color: var(--jd-fin-muted);
    border: var(--jd-border-thin) solid var(--jd-fin-border);
  }
  .jd-open-picks-card__badge[data-strength="high"] {
    background: var(--jd-fin-up); color: #fff; border-color: transparent;
  }
  .jd-open-picks-card__badge[data-strength="medium"] {
    background: var(--jd-fin-warning); color: #0f172a; border-color: transparent;
  }

  /* 본문 */
  .jd-open-picks-card__body { min-width: 0; flex: 1; display: flex; flex-direction: column; }
  .jd-open-picks-card__name {
    font-size: 13.5px; font-weight: 800; color: var(--jd-fin-text);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-decoration: none;
  }
  a.jd-open-picks-card__name:hover { text-decoration: underline; }
  .jd-open-picks-card__reason {
    margin-block-start: 2px; font-size: 11px; color: var(--jd-fin-muted);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .jd-open-picks-card__pct {
    flex-shrink: 0; font-size: 13.5px; font-weight: 800; color: var(--jd-fin-up);
    font-variant-numeric: tabular-nums;
  }

  /* footer */
  .jd-open-picks-card__footer {
    padding: var(--jd-space-2) var(--jd-space-4); font-size: 10.5px;
    color: var(--jd-fin-muted); background: var(--jd-fin-soft);
    border-block-start: var(--jd-border-thin) solid var(--jd-fin-border);
  }
}`;
