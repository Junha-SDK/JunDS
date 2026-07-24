import { css } from "../../core/styles.js";

/**
 * jd-stat CSS — v2 composites/Stat(`flex flex-col gap-1`, 라벨 xs·muted·uppercase·
 * tracking-wider, 값 text-2xl semibold tabular-nums, 단위 sm muted, 변화량 xs medium).
 *
 * 이 시트가 지표 3종의 **공용 골격**이다(.jd-stat__*). StatCard·MetricCard는 자기
 * 시트에서 델타만 덮어쓴다(jd-drawer가 jd-modal 패널 기하만 덮는 것과 같은 구성).
 * 트렌드 색은 호스트에 실린 --_jd-stat-trend 하나로 흐른다 — 파생 태그마다 색 규칙을
 * 다시 쓰지 않기 위해서다.
 */
export default css`
@layer junds.components {
  jd-stat {
    display: flex; flex-direction: column;
    box-sizing: border-box; font-family: var(--jd-font-sans);
  }

  .jd-stat__main {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: var(--jd-space-3);
  }
  .jd-stat__main > [slot="icon"] {
    display: flex; flex-shrink: 0; color: var(--jd-color-muted);
  }
  .jd-stat__text {
    display: flex; flex-direction: column; gap: var(--jd-space-1);
    flex: 1 1 auto; min-width: 0;
  }

  .jd-stat__label {
    font-size: var(--jd-text-xs); color: var(--jd-color-muted);
    text-transform: uppercase; letter-spacing: var(--jd-tracking-wide);
  }

  .jd-stat__row {
    display: flex; align-items: baseline; flex-wrap: wrap;
    gap: var(--jd-space-1-5);
  }
  .jd-stat__value {
    font-size: var(--jd-text-2xl); font-weight: var(--jd-weight-semibold);
    line-height: var(--jd-leading-tight); color: var(--jd-color-foreground);
    font-variant-numeric: tabular-nums;
  }
  .jd-stat__unit { font-size: var(--jd-text-sm); color: var(--jd-color-muted); }

  /* 투명 래퍼 — 변화량이 값과 같은 baseline 줄에 참여한다.
     MetricCard만 실제 상자로 승격해(display:flex) 다음 줄로 내린다. */
  .jd-stat__delta { display: contents; }
  .jd-stat__delta[hidden] { display: none; }

  .jd-stat__change {
    display: inline-flex; align-items: baseline; gap: var(--jd-space-1);
    white-space: nowrap;
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-medium);
    font-variant-numeric: tabular-nums;
    color: var(--_jd-stat-trend, var(--jd-color-muted));
  }
  .jd-stat__change[hidden] { display: none; }
  .jd-stat__change-label { font-size: var(--jd-text-xs); color: var(--jd-color-muted); }

  /* 트렌드 색 단일 통로 — 파생 태그를 여기 한 줄에 모은다 */
  :where(jd-stat, jd-stat-card, jd-metric-card)[data-trend="up"] {
    --_jd-stat-trend: var(--jd-color-success);
  }
  :where(jd-stat, jd-stat-card, jd-metric-card)[data-trend="down"] {
    --_jd-stat-trend: var(--jd-color-danger);
  }

  /* 화살표 옆 방향 낱말 — 눈에는 안 보이고 스크린리더에만 읽힌다
     (jd-visually-hidden과 같은 clip-path 관용구) */
  .jd-stat__sr {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  .jd-stat__hint {
    margin: 0; font-size: var(--jd-text-xs); color: var(--jd-color-muted);
  }

  jd-stat[align="center"] .jd-stat__main { justify-content: center; }
  jd-stat[align="center"] .jd-stat__text { align-items: center; text-align: center; }
  jd-stat[align="center"] .jd-stat__row { justify-content: center; }
}`;
