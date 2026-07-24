import { css } from "../../core/styles.js";

/**
 * v2 값: 헤더(Modal.Header) + 본문(px-5 pb-5, max-h 75vh 스크롤). 지표 타일은 soft-100
 * 배경 rounded-xl(라벨 10.5px muted / 값 15px extrabold + 단위 10.5px 0.7 opacity).
 * 그리드 2→sm:4칸. 표 12.5px tabular-nums, 헤더 soft-100, 행 상단 보더. 구분 배지는
 * 매도=up틴트 / 매수=down틴트. bm-* 를 --jd-* 로 번역, soft-100은 로컬 토큰으로.
 */
export default css`
@layer junds.components {
  /* 호스트 오버레이 규칙은 jd-modal 태그 셀렉터라 파생 태그로 캐스케이드되지 않는다
     — 다시 선언한다(jd-holding-form-modal 선례). 패널 폭은 v2 size="lg"(42rem). */
  jd-portfolio-day-detail-modal:not(:defined) { display: none; }
  jd-portfolio-day-detail-modal { display: none; }
  jd-portfolio-day-detail-modal[open] {
    display: flex;
    position: fixed;
    inset: 0;
    z-index: var(--jd-z-modal);
    align-items: center;
    justify-content: center;
    padding: var(--jd-space-4);
  }
  jd-portfolio-day-detail-modal > .jd-modal__panel {
    max-width: min(42rem, calc(100vw - 2rem));
  }

  jd-portfolio-day-detail-modal {
    --jd-pddm-soft: color-mix(in srgb, var(--jd-color-muted) 12%, transparent);
  }

  .jd-pddm__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--jd-space-3);
    padding: var(--jd-space-4) var(--jd-space-5) var(--jd-space-2);
    font-weight: 800;
  }
  .jd-pddm__title { margin: 0; font-size: var(--jd-text-lg); font-weight: 800; }
  .jd-pddm__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 1.75rem;
    height: 1.75rem;
    border: 0;
    border-radius: var(--jd-radius-lg);
    background: transparent;
    color: var(--jd-color-muted);
    cursor: pointer;
  }
  .jd-pddm__close:hover { background: var(--jd-pddm-soft); color: var(--jd-color-foreground); }
  .jd-pddm__close svg { width: 16px; height: 16px; }

  .jd-pddm__empty {
    padding: var(--jd-space-2) var(--jd-space-5) var(--jd-space-6);
    font-size: var(--jd-text-sm);
    color: var(--jd-color-muted);
  }

  .jd-pddm__content {
    padding: var(--jd-space-1) var(--jd-space-5) var(--jd-space-5);
    max-height: 75vh;
    overflow-y: auto;
  }

  .jd-pddm__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--jd-space-3);
  }
  @media (min-width: 640px) {
    .jd-pddm__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }

  .jd-pddm__stat {
    border-radius: var(--jd-radius-xl);
    padding: var(--jd-space-2-5) var(--jd-space-3);
    background: var(--jd-pddm-soft);
  }
  .jd-pddm__stat-label { font-size: 10.5px; font-weight: var(--jd-weight-bold); color: var(--jd-color-muted); }
  .jd-pddm__stat-value {
    margin-block-start: var(--jd-space-0-5);
    font-size: 15px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
  .jd-pddm__stat-unit { margin-inline-start: 2px; font-size: 10.5px; font-weight: var(--jd-weight-semibold); opacity: 0.7; }

  .jd-pddm__section { margin: var(--jd-space-5) 0 var(--jd-space-2); font-size: var(--jd-text-sm); font-weight: 800; }

  .jd-pddm__table-wrap {
    border-radius: var(--jd-radius-xl);
    overflow: hidden;
    border: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-pddm__table { width: 100%; border-collapse: collapse; font-size: 12.5px; font-variant-numeric: tabular-nums; }
  .jd-pddm__table thead {
    background: var(--jd-pddm-soft);
    color: var(--jd-color-muted);
    font-size: 11px;
    font-weight: var(--jd-weight-bold);
  }
  .jd-pddm__table th,
  .jd-pddm__table td { padding: var(--jd-space-2) var(--jd-space-3); text-align: left; font-weight: var(--jd-weight-normal); }
  .jd-pddm__table th[data-align="right"],
  .jd-pddm__table td[data-align="right"] { text-align: right; }
  .jd-pddm__table tbody tr { border-block-start: var(--jd-border-thin) solid var(--jd-color-border); }
  .jd-pddm__td-name { font-weight: var(--jd-weight-bold); }
  .jd-pddm__td-amount { font-weight: var(--jd-weight-semibold); }
  .jd-pddm__td-fee { color: var(--jd-color-muted); }
  .jd-pddm__td-pl { font-weight: 800; }

  .jd-pddm__side {
    display: inline-block;
    padding: 1px 6px;
    border-radius: var(--jd-radius-sm);
    font-size: 10.5px;
    font-weight: 800;
  }
  .jd-pddm__side[data-side="sell"] {
    background: color-mix(in srgb, var(--jd-finance-up, var(--jd-color-success)) 12%, transparent);
    color: color-mix(in srgb, var(--jd-finance-up, var(--jd-color-success)) 65%, var(--jd-color-foreground));
  }
  .jd-pddm__side[data-side="buy"] {
    background: color-mix(in srgb, var(--jd-finance-down, var(--jd-color-danger)) 12%, transparent);
    color: color-mix(in srgb, var(--jd-finance-down, var(--jd-color-danger)) 65%, var(--jd-color-foreground));
  }

  .jd-pddm__note {
    margin: var(--jd-space-4) 0 0;
    font-size: 11.5px;
    line-height: var(--jd-leading-relaxed);
    color: var(--jd-color-muted);
  }
}`;
