/**
 * jd-timeline CSS — v2 composites/Timeline(12px 점 + 2px 링 · 아이콘이면 32px 원 ·
 * 1px 연결선 · 행 간격 pb-6)의 토큰 번역.
 *
 * v2 dotColors는 `bg-<color> border-<color>-light` 한 쌍이었다 — semantic 토큰과
 * 축이 그대로 맞아 primary/success/warning/danger는 무손실 번역이고, neutral만
 * gray-400/gray-200 리터럴이라 muted-light/border로 옮겼다(다크에서도 함께 산다).
 * lineStyle 분기는 호스트 속성 셀렉터(§4.3) — JS가 클래스를 토글하지 않는다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-timeline { display: block; }

  .jd-timeline__list {
    display: block; margin: 0; padding: 0; list-style: none;
  }

  .jd-timeline__item {
    display: flex; gap: var(--jd-space-3);
    padding-block-end: var(--jd-space-6);
    --_jd-timeline-dot: var(--jd-color-muted-light);
    --_jd-timeline-ring: var(--jd-color-border);
  }
  .jd-timeline__item[data-last] { padding-block-end: 0; }

  .jd-timeline__item[data-color="primary"] {
    --_jd-timeline-dot: var(--jd-color-primary);
    --_jd-timeline-ring: var(--jd-color-primary-light);
  }
  .jd-timeline__item[data-color="success"] {
    --_jd-timeline-dot: var(--jd-color-success);
    --_jd-timeline-ring: var(--jd-color-success-light);
  }
  .jd-timeline__item[data-color="warning"] {
    --_jd-timeline-dot: var(--jd-color-warning);
    --_jd-timeline-ring: var(--jd-color-warning-light);
  }
  .jd-timeline__item[data-color="danger"] {
    --_jd-timeline-dot: var(--jd-color-danger);
    --_jd-timeline-ring: var(--jd-color-danger-light);
  }

  /* ── 마커 열 (점/아이콘 + 연결선) ─────────────────────────────── */
  .jd-timeline__marker {
    display: flex; flex-direction: column; align-items: center;
    flex-shrink: 0; align-self: stretch;
  }

  .jd-timeline__dot {
    box-sizing: border-box; flex-shrink: 0;
    inline-size: 0.75rem; block-size: 0.75rem;
    margin-block-start: var(--jd-space-1);
    border-radius: var(--jd-radius-full);
    border: var(--jd-border-medium) solid var(--_jd-timeline-ring);
    background: var(--_jd-timeline-dot);
  }
  /* 아이콘이 있으면 v2처럼 32px 원형 배지가 된다 — 링 없이 색면 + 흰 글자 */
  .jd-timeline__dot[data-icon] {
    inline-size: 2rem; block-size: 2rem; margin-block-start: 0; border: 0;
    display: inline-flex; align-items: center; justify-content: center;
    color: #fff;
  }
  .jd-timeline__dot[data-icon] > svg { inline-size: 1rem; block-size: 1rem; }

  .jd-timeline__line {
    flex: 1 1 auto; inline-size: var(--jd-space-px);
    margin-block-start: var(--jd-space-1);
    background: var(--jd-color-border);
  }
  .jd-timeline__item[data-last] .jd-timeline__line { display: none; }
  jd-timeline[line-style="dashed"] .jd-timeline__line {
    inline-size: 0; background: none;
    border-inline-start: var(--jd-border-thin) dashed var(--jd-color-border);
  }

  /* ── 본문 열 ──────────────────────────────────────────────── */
  .jd-timeline__body {
    flex: 1 1 0; min-inline-size: 0;
    padding-block-start: var(--jd-space-px);
    font-family: var(--jd-font-sans);
  }
  .jd-timeline__head {
    display: flex; align-items: center; gap: var(--jd-space-2);
    min-inline-size: 0;
  }
  .jd-timeline__title {
    font-size: var(--jd-text-md); font-weight: var(--jd-weight-medium);
    color: var(--jd-color-foreground);
  }
  .jd-timeline__time {
    flex-shrink: 0;
    font-size: 10px; color: var(--jd-color-muted-light);
    font-variant-numeric: tabular-nums;
  }
  .jd-timeline__desc {
    margin-block-start: var(--jd-space-0-5);
    font-size: var(--jd-text-xs); line-height: var(--jd-leading-normal);
    color: var(--jd-color-muted);
  }
  .jd-timeline__time[hidden], .jd-timeline__desc[hidden] { display: none; }
}`;
