/**
 * jd-calendar-month CSS — v2 patterns/CalendarMonth 표면 의미 번역.
 * v2 `bg-surface`는 **밝은 카드면**을 뜻했다 — v3의 surface 3단(라이트에서도 어두운
 * 크롬)과 이름만 같다. 그래서 컨테이너는 card로 옮겼다(DEC-044).
 * v2 값: 컨테이너 `rounded-xl border bg-surface p-4`, 헤더 `mb-3`, 제목
 * `text-lg font-semibold tabular-nums`, 네비 버튼 `w-8 h-8 rounded-md
 * hover:bg-surface-soft`, 요일 `text-[11px] text-muted`, 셀 `min-h-[64px]
 * rounded-md p-1`, 오늘 `bg-primary text-white`, 선택 `bg-primary/10
 * border-primary/30`, 이벤트칩 `text-[10px] bg-{color}/15 text-{color}`.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.base {
    jd-calendar-month:not(:defined) {
      display: none;
    }
  }
  @layer junds.components {
    jd-calendar-month {
      display: block;
      font-family: var(--jd-font-sans);
    }

    /* 달력 격자는 "앱의 본문"이다 — 라이트에서도 어두워야 할 이유가 없으므로 surface가
     아니라 card다(DEC-044). v2 bg-surface 를 이름만 보고 옮겨 오면서 라이트 모드에서
     검은 판 위에 검은 글자가 얹혀 달력이 통째로 검은 상자로 렌더됐다.
     인셋 하이라이트는 '위에서 빛을 받는 면' — 채움만 있는 패널은 색종이로 읽힌다. */
    .jd-cm {
      border-radius: var(--jd-radius-xl);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
      padding: var(--jd-space-4);
    }

    .jd-cm__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--jd-space-3);
    }
    .jd-cm__title {
      margin: 0;
      font-size: var(--jd-text-lg);
      font-weight: var(--jd-weight-semibold);
      color: var(--jd-color-foreground);
      font-variant-numeric: tabular-nums;
      /* "2026년 7월"이 두 줄로 접히면 헤더 높이가 달마다 흔들린다 */
      white-space: nowrap;
    }
    .jd-cm__nav {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1);
    }
    .jd-cm__arrow,
    .jd-cm__today {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 2rem;
      border: 0;
      background: transparent;
      color: var(--jd-color-foreground);
      border-radius: var(--jd-radius-md);
      cursor: pointer;
      transition: background var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-cm__arrow {
      width: 2rem;
    }
    .jd-cm__arrow > svg {
      width: 0.875rem;
      height: 0.875rem;
    }
    .jd-cm__today {
      padding: 0 var(--jd-space-3);
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-medium);
      white-space: nowrap;
    }
    .jd-cm__arrow:hover,
    .jd-cm__today:hover {
      background: color-mix(in srgb, var(--jd-color-muted) 12%, transparent);
    }
    /* 눌린 면은 빛을 잃는다 — v2에도 v3 이식본에도 :active가 없어 세 버튼 모두
     클릭 순간 아무 반응이 없었다 */
    .jd-cm__arrow:active,
    .jd-cm__today:active {
      scale: 0.97;
      background: color-mix(in srgb, var(--jd-color-muted) 18%, transparent);
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-cm__arrow:focus-visible,
    .jd-cm__today:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    .jd-cm__weekdays,
    .jd-cm__grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: var(--jd-space-1);
    }
    .jd-cm__weekday {
      padding: var(--jd-space-1) 0;
      text-align: center;
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
    }
    .jd-cm__grid {
      margin-top: var(--jd-space-1);
      border-radius: var(--jd-radius-md);
    }
    .jd-cm__grid:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    .jd-cm__cell {
      min-height: 4rem;
      border-radius: var(--jd-radius-md);
      border: var(--jd-border-thin) solid transparent;
      padding: var(--jd-space-1);
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-0-5);
      cursor: pointer;
      transition: border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        background var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-cm__cell:hover {
      border-color: var(--jd-color-border);
      background: color-mix(in srgb, var(--jd-color-muted) 6%, transparent);
    }
    .jd-cm__cell[data-outside] {
      opacity: var(--jd-opacity-40);
    }
    .jd-cm__cell[data-selected] {
      background: color-mix(in srgb, var(--jd-color-primary) 10%, transparent);
      border-color: color-mix(in srgb, var(--jd-color-primary) 30%, transparent);
    }
    .jd-cm__cell[data-focus] {
      border-color: color-mix(in srgb, var(--jd-color-primary) 50%, transparent);
    }
    /* :active는 선택·포커스 규칙 **뒤에** 둔다 — 앞에 두면 같은 특이도라 이미 선택된
     칸을 눌렀을 때 아무 반응이 없다. 셀은 scale로 누르지 않는다: 이웃과 선을 맞대고
     있어 한 칸만 줄면 격자가 흔들린다. 대신 면이 빛을 잃게 한다. */
    .jd-cm__cell:active {
      background: color-mix(in srgb, var(--jd-color-muted) 14%, transparent);
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }

    .jd-cm__num {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: var(--jd-radius-full);
      font-size: var(--jd-text-xs);
      color: var(--jd-color-foreground);
      font-variant-numeric: tabular-nums;
    }
    .jd-cm__cell[data-today] > .jd-cm__num {
      background: var(--jd-color-primary);
      color: #fff;
      font-weight: var(--jd-weight-bold);
    }

    .jd-cm__events {
      list-style: none;
      margin: 0;
      padding: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-0-5);
      overflow: hidden;
    }
    /* 색 변종은 **앵커색 한 줄**만 바꾼다 — 배경·글자·호버를 변종마다 다시 적으면
     상태를 하나 늘릴 때 6곳을 고쳐야 하고 실제로 호버가 primary에만 붙어 있었다.
     원색을 옅은 틴트 위에 그대로 두면 라이트 모드 대비가 무너지므로 글자는
     foreground 쪽으로 당긴다(테마 적응). */
    .jd-cm__event {
      --jd-cm-event-tone: var(--jd-color-primary);
      display: block;
      width: 100%;
      text-align: left;
      border: 0;
      border-radius: var(--jd-radius-sm);
      padding: 0.0625rem var(--jd-space-1-5);
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-medium);
      line-height: var(--jd-leading-snug);
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      background: color-mix(in srgb, var(--jd-cm-event-tone) 15%, transparent);
      color: color-mix(in srgb, var(--jd-cm-event-tone) 65%, var(--jd-color-foreground));
      transition: background var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-cm__event[data-color="success"] {
      --jd-cm-event-tone: var(--jd-color-success);
    }
    .jd-cm__event[data-color="warning"] {
      --jd-cm-event-tone: var(--jd-color-warning);
    }
    .jd-cm__event[data-color="danger"] {
      --jd-cm-event-tone: var(--jd-color-danger);
    }
    .jd-cm__event[data-color="info"] {
      --jd-cm-event-tone: var(--jd-color-info);
    }
    .jd-cm__event[data-color="accent"] {
      --jd-cm-event-tone: var(--jd-color-accent);
    }
    .jd-cm__event:hover {
      background: color-mix(in srgb, var(--jd-cm-event-tone) 26%, transparent);
    }
    .jd-cm__event:active {
      scale: 0.97;
    }
    /* 링을 **안쪽**에 그린다 — 이벤트 목록(.jd-cm__events)이 overflow:hidden이라
     바깥으로 그린 outline도 box-shadow도 그대로 잘려 나간다 */
    .jd-cm__event:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: calc(var(--jd-focus-ring-offset) * -1);
    }

    .jd-cm__more {
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
      padding-left: var(--jd-space-1-5);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-cm__arrow,
      .jd-cm__today,
      .jd-cm__cell,
      .jd-cm__event {
        transition: none;
      }
    }
  }
`;
