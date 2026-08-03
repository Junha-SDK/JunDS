import { css } from "../../core/styles.js";

/**
 * jd-sortable-list CSS — v2 patterns/SortableList 번역.
 * v2 값: 컨테이너 `flex flex-col gap-1`, 행 `flex items-center gap-2 transition-all`,
 * 드래그 중 `opacity-40`, 드롭 대상 `border-t-2 border-primary`,
 * 핸들 `cursor-grab active:cursor-grabbing text-muted hover:text-foreground`,
 * 내용 `flex-1 min-w-0`.
 *
 * v2의 행은 **여백도 면도 없는 맨 줄**이었다. 그래서 목록이 문단처럼 이어져 어디까지가
 * 한 항목인지, 무엇을 집어야 하는지가 보이지 않았다(실측). 집을 수 있는 것은 집을 수
 * 있게 생겨야 한다(§7) — 각 행에 면·테두리·그림자와 grab 커서를 준다.
 */
export default css`
  @layer junds.components {
    jd-sortable-list {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-1-5);
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-md);
      color: var(--jd-color-foreground);
    }

    .jd-sortable-list__item {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      box-sizing: border-box;
      min-width: 0;
      padding: var(--jd-space-2-5) var(--jd-space-3);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-lg);
      background: var(--jd-color-card);
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
      /* all 금지 — padding까지 대상이 되면 드롭 표시가 매 프레임 리플로우를 만든다 */
      transition: opacity var(--jd-duration-snap) var(--jd-easing-ease-out),
        background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    /* 핸들이 없으면 행 전체가 드래그 표면이다 — 커서로 그 사실을 말한다 */
    jd-sortable-list:not([show-handle]) > .jd-sortable-list__item {
      cursor: grab;
    }
    jd-sortable-list:not([show-handle]) > .jd-sortable-list__item:active {
      cursor: grabbing;
    }
    .jd-sortable-list__item:hover {
      background: var(--jd-color-card-hover);
      border-color: color-mix(in srgb, var(--jd-color-border) 70%, var(--jd-color-muted-light));
    }
    .jd-sortable-list__item[data-grabbed] {
      opacity: var(--jd-opacity-40);
      box-shadow: none;
    }
    /* 드롭 자리는 **행 위 경계선**이다. 레이아웃을 밀지 않도록 테두리 두께가 아니라
     안쪽 그림자로 긋는다 — 두께가 바뀌면 목록 전체가 1행씩 출렁인다. */
    .jd-sortable-list__item[data-drop-target] {
      border-color: color-mix(in srgb, var(--jd-color-primary) 55%, transparent);
      box-shadow: inset 0 var(--jd-border-medium) 0 var(--jd-color-primary),
        var(--jd-shadow-sm);
    }
    .jd-sortable-list__item:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    .jd-sortable-list__handle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 1.5rem;
      height: 1.5rem;
      margin: 0;
      padding: 0;
      color: var(--jd-color-muted);
      background: none;
      border: 0;
      border-radius: var(--jd-radius-md);
      cursor: grab;
      touch-action: none;
      transition: color var(--jd-duration-snap) var(--jd-easing-ease-out),
        background-color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-sortable-list__handle:hover {
      color: var(--jd-color-foreground);
      background: color-mix(in srgb, var(--jd-color-muted) 12%, transparent);
    }
    .jd-sortable-list__handle:active {
      cursor: grabbing;
      background: color-mix(in srgb, var(--jd-color-muted) 18%, transparent);
    }
    .jd-sortable-list__handle:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }
    .jd-sortable-list__handle > svg {
      width: 0.875rem;
      height: 0.875rem;
    }

    .jd-sortable-list__content {
      flex: 1 1 0;
      min-width: 0;
      line-height: var(--jd-leading-snug);
      overflow-wrap: anywhere;
    }

    /* 시각적 숨김 — 이동 결과 공지용 */
    .jd-sortable-list__live {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-sortable-list__item,
      .jd-sortable-list__handle {
        transition: none;
      }
    }
  }
`;
