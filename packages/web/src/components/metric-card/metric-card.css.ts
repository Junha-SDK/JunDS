import { css } from "../../core/styles.js";

/**
 * jd-metric-card CSS — StatCard 크롬 위의 델타 2개(변화량 줄 내림 + 스파크라인).
 *
 * v2 값: `rounded-xl border border-border bg-white p-5`, 값 mt-1 text-2xl bold,
 * 변화량 줄 `flex items-center gap-1.5 mt-2`(칩 아님 — 맨 텍스트 semibold),
 * changeLabel `text-xs text-muted`, 스파크라인 mt-3 · 높이 48 · --primary.
 */
export default css`
@layer junds.components {
  jd-metric-card { padding: var(--jd-space-5); }

  /* 라벨 → 값 간격은 v2 mt-1 */
  jd-metric-card .jd-stat__text { gap: var(--jd-space-1); }
  jd-metric-card .jd-stat__main > [slot="icon"] { color: var(--jd-color-muted); }

  /* 변화량은 값 옆이 아니라 아래 줄이다 — 투명 래퍼를 실제 상자로 승격하고
     flex-basis 100%로 줄을 통째로 넘긴다(값·단위는 윗줄에 남는다). */
  jd-metric-card .jd-stat__delta {
    display: flex; align-items: center; gap: var(--jd-space-1-5);
    flex-basis: 100%; margin-block-start: var(--jd-space-1);
  }
  /* 칩 배경은 StatCard 고유 표현 — 여기서는 되돌린다 */
  jd-metric-card .jd-stat__change {
    padding: 0; background: none; border-radius: 0;
    margin-block-end: 0; font-weight: var(--jd-weight-semibold);
  }
  jd-metric-card .jd-stat__hint { margin-block-start: 0; }

  .jd-metric-card__spark {
    display: block; width: 100%; height: 48px;
    margin-block-start: var(--jd-space-3);
    color: var(--jd-color-primary-ink); /* stroke·gradient가 currentColor로 따라온다 */
    overflow: visible;
  }
}`;
