/**
 * jd-kanban CSS — v2 patterns/Kanban 표면 의미 번역.
 * v2 값: 보드 `flex gap-4 overflow-x-auto pb-4`, 컬럼 `w-72 shrink-0 rounded-xl
 * bg-gray-50/80 border border-border/50`, 드롭 대상 `ring-2 ring-primary/30
 * bg-primary-light/20`, 헤더 `px-3 py-2.5 border-b`, 점 `w-2 h-2 rounded-full`,
 * 제목 `text-sm font-semibold`, 카운트 = Badge(default·sm), 카드영역 `gap-2 p-2
 * min-h-[100px]`, 카드 `cursor-grab`, 드래그 중 `opacity-40`.
 *
 * ⚠️ 컬럼은 v2 `bg-gray-50/80` — "흰 카드를 담는 한 톤 들어간 트레이"다.
 * --jd-color-surface(#161329)는 라이트에서도 어두운 크롬용이라 그대로 쓰면 컬럼이
 * 검은 판이 되고 컬럼 제목이 사라진다(실측). 칸반 보드는 크롬이 아니라 **앱의 본문**이라
 * card 계열이 맞다(§4). 다만 카드(card)와 같은 색이면 트레이가 사라지므로 muted를 소량
 * 섞어 한 톤 낮춘다 — 라이트는 카드보다 어둡고 다크는 카드보다 밝은 면이 한 규칙에서 나온다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.base {
    jd-kanban:not(:defined) {
      display: none;
    }
  }
  @layer junds.components {
    jd-kanban {
      display: block;
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }

    /* 카드 이동 지시문 — 시각적으로만 숨긴다(AT에는 남긴다) */
    .jd-kanban__hint {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    .jd-kanban__board {
      display: flex;
      gap: var(--jd-space-4);
      overflow-x: auto;
      /* 보드 끝에서 멈춘 스크롤이 호스트 페이지를 이어서 밀지 않게 한다(§6) */
      overscroll-behavior-x: contain;
      scrollbar-width: thin;
      padding-bottom: var(--jd-space-4);
    }

    .jd-kanban__column {
      display: flex;
      flex-direction: column;
      width: 18rem;
      flex-shrink: 0;
      min-width: 0;
      border-radius: var(--jd-radius-xl);
      background: color-mix(in srgb, var(--jd-color-muted) 8%, var(--jd-color-card));
      border: var(--jd-border-thin) solid var(--jd-color-border-light);
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    /* 드롭 대상 강조 — v2 ring-2 ring-primary/30 + bg-primary-light/20 */
    .jd-kanban__column[data-drop-target] {
      background: color-mix(in srgb, var(--jd-color-primary-light) 40%, var(--jd-color-card));
      box-shadow: 0 0 0 var(--jd-border-medium)
        color-mix(in srgb, var(--jd-color-primary) 30%, transparent);
    }

    .jd-kanban__column-header {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      padding: var(--jd-space-2-5) var(--jd-space-3);
      border-bottom: var(--jd-border-thin) solid var(--jd-color-border-light);
    }
    .jd-kanban__column-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: var(--jd-radius-full);
      flex-shrink: 0;
    }
    .jd-kanban__column-dot[hidden] {
      display: none;
    }
    /* 컬럼 제목은 두 줄로 접히면 안 된다 — 넘치면 말줄임(§5) */
    .jd-kanban__column-title {
      min-width: 0;
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-semibold);
      color: var(--jd-color-foreground);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    /* 카운트 배지 — jd-badge default·sm 표면 */
    .jd-kanban__column-count {
      margin-left: auto;
      min-width: 1.25rem;
      padding: 0 var(--jd-space-1-5);
      height: 1.25rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--jd-radius-full);
      background: color-mix(in srgb, var(--jd-color-muted) 15%, transparent);
      color: var(--jd-color-muted);
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-medium);
      font-variant-numeric: tabular-nums;
    }

    .jd-kanban__list {
      list-style: none;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-2);
      padding: var(--jd-space-2);
      flex: 1;
      min-height: 100px;
    }

    .jd-kanban__card {
      cursor: grab;
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border-light);
      border-radius: var(--jd-radius-lg);
      padding: var(--jd-space-3);
      /* 카드는 트레이 위에 실제로 얹힌 면이다 — 면 + 위에서 받는 빛(§2) */
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
      transition: box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        opacity var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-kanban__card:hover {
      box-shadow: var(--jd-shadow-sm), inset 0 1px 0 var(--jd-color-highlight);
    }
    /* 보드가 overflow-x:auto 라 바깥 아웃라인은 잘린다 — 링을 그림자로 준다(§1) */
    .jd-kanban__card:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring), var(--jd-shadow-sm);
    }
    .jd-kanban__card:active {
      cursor: grabbing;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-kanban__card--dragging {
      opacity: var(--jd-opacity-40);
    }

    /* 길이를 모르는 사용자 문자열 — 컬럼 폭(18rem)을 밀어내지 않게 끊는다(§5) */
    .jd-kanban__card-title {
      margin: 0;
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-medium);
      color: var(--jd-color-foreground);
      overflow-wrap: anywhere;
    }
    .jd-kanban__card-desc {
      margin: var(--jd-space-1) 0 0;
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
      overflow-wrap: anywhere;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-kanban__column,
      .jd-kanban__card {
        transition: none;
      }
    }
  }
`;
