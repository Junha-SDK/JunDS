/**
 * jd-gantt-chart CSS — v2 patterns/GanttChart 표면 의미 번역.
 * v2 값: 컨테이너 `border rounded-lg overflow-auto bg-surface`, 좌측 라벨 `sticky
 * left-0 bg-surface border-r`, 헤더 `h-8 border-b text-xs font-semibold uppercase
 * text-muted`, 라벨행 `text-sm truncate border-b`, 주 눈금 `text-[10px] text-muted
 * border-l`, 막대 `rounded-md text-white text-[11px] font-medium`, 진행 오버레이
 * `bg-black/20`.
 *
 * ⚠️ v2의 `bg-surface`는 카드색이었다. v3 --jd-color-surface(#161329)는 라이트에서도 어두운
 * 크롬 전용이라 그대로 옮기면 행이 검은 판이 되고, 그 위 모드추종 잉크가 라이트 모드에서
 * 사라져 태스크 이름이 안 보인다(실측). 간트는 앱의 본문 표라 card 가 맞다 — VISUAL-BAR §4.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.base {
    jd-gantt-chart:not(:defined) {
      display: none;
    }
  }
  @layer junds.components {
    jd-gantt-chart {
      display: block;
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }

    .jd-gantt__scroll {
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-lg);
      /* 타임라인은 부모 폭을 넘긴다 — 잘린 채 끝나는 대신 스스로 구른다(§6) */
      overflow: auto;
      overscroll-behavior-x: contain;
      scrollbar-width: thin;
      background: var(--jd-color-card);
    }

    .jd-gantt__empty {
      margin: 0;
      padding: var(--jd-space-6);
      text-align: center;
      font-size: var(--jd-text-sm);
      color: var(--jd-color-muted);
    }

    .jd-gantt__inner {
      display: flex;
    }

    /* 좌측 라벨 열 — 가로 스크롤에도 고정. 배경은 불투명이어야 아래로 흐르는 막대를 가린다 */
    .jd-gantt__labels {
      position: sticky;
      left: 0;
      z-index: 1;
      background: var(--jd-color-card);
      border-right: var(--jd-border-thin) solid var(--jd-color-border);
      flex-shrink: 0;
    }
    .jd-gantt__label-head {
      display: flex;
      align-items: center;
      padding: 0 var(--jd-space-3);
      border-bottom: var(--jd-border-thin) solid var(--jd-color-border);
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-semibold);
      text-transform: uppercase;
      letter-spacing: var(--jd-tracking-wide);
      color: var(--jd-color-muted);
    }
    /* flex 컨테이너였다면 태스크 이름(익명 flex 아이템)에 text-overflow가 걸리지 않아
       말줄임이 죽고 글자가 중간에서 잘린다 — 블록 컨테이너 + align-content로 바꿔
       세로 중앙 정렬은 유지하면서 말줄임을 되살린다(§5) */
    .jd-gantt__label-row {
      display: block;
      align-content: center;
      padding: 0 var(--jd-space-3);
      font-size: var(--jd-text-sm);
      border-bottom: var(--jd-border-thin) solid var(--jd-color-border-light);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* 타임라인 */
    .jd-gantt__timeline {
      position: relative;
    }
    .jd-gantt__timeline-header {
      position: relative;
      border-bottom: var(--jd-border-thin) solid var(--jd-color-border);
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
    }
    .jd-gantt__week {
      position: absolute;
      top: 0;
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 var(--jd-space-1);
      border-left: var(--jd-border-thin) solid var(--jd-color-border-light);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .jd-gantt__row {
      position: relative;
      border-bottom: var(--jd-border-thin) solid var(--jd-color-border-light);
    }

    .jd-gantt__bar {
      box-sizing: border-box; /* JS가 준 width(일수*dayWidth)에 좌우 패딩이 더해지면 종료일을 넘친다 */
      position: absolute;
      top: var(--jd-space-1);
      bottom: var(--jd-space-1);
      display: flex;
      align-items: center;
      padding: 0 var(--jd-space-2);
      border: 0;
      border-radius: var(--jd-radius-md);
      overflow: hidden;
      background: var(--jd-bar-color, var(--jd-color-primary));
      color: #fff;
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-medium);
      cursor: pointer;
      box-shadow: inset 0 1px 0 var(--jd-color-highlight);
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    /* filter: brightness는 막대 안 흰 글자와 진행 오버레이까지 함께 밝혀 글자가 배경에
       녹고 GPU 레이어를 새로 만든다 — 실색 전환으로 옮긴다(§1) */
    .jd-gantt__bar:hover {
      background: color-mix(in srgb, #fff 14%, var(--jd-bar-color, var(--jd-color-primary)));
    }
    .jd-gantt__bar:active {
      scale: 0.98;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    /* 스크롤 컨테이너 안이라 바깥 아웃라인은 잘린다 — 링을 그림자로 준다(§1) */
    .jd-gantt__bar:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    /* 진행 오버레이 — v2 bg-black/20, 좌측부터 채움 */
    .jd-gantt__fill {
      position: absolute;
      inset: 0 auto 0 0;
      background: rgba(0, 0, 0, 0.2);
    }
    .jd-gantt__bar-text {
      position: relative;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-gantt__bar {
        transition: none;
      }
    }
  }
`;
