import { css } from "../../core/styles.js";

/**
 * v2 값: 카드(radius 16, 테두리), 헤더/주 행 grid `repeat(5,1fr) 150px`, 셀 min-h 170 우테두리,
 * 오늘=2px 링 + 6% 배경 + 날짜 알약, 휴장=soft 배경 + 점, 테마칩=cat 색 10%/20%,
 * 왕관 리스트, 주간요약=accent 4% 틴트 좌테두리.
 *
 * v2가 박아 둔 리터럴 팔레트(핑크 오늘 · 카테고리 8색 · 틸 요약 틴트)를 전부 토큰으로
 * 옮겼다: 리터럴은 브랜드 전환·다크 모드에서 그 자리만 그대로 남아 화면이 두 팔레트로
 * 갈라진다. 카테고리 8색은 계열색 창고인 --jd-color-hue-*에서 고른다.
 * 등락색은 --jd-finance-* 훅을 경유한다 — 한국 관례(적상승·청하락)는 앱이 그 변수를
 * 시작 시 1회 덮어써서 얻는 전환이다(DECISIONS "색 기본값은 웹을 따르고, 관례 전환은 앱에").
 */
export default css`
  @layer junds.components {
    jd-daily-themes-calendar {
      --jd-fin-up: var(--jd-finance-up, var(--jd-color-success));
      --jd-fin-down: var(--jd-finance-down, var(--jd-color-danger));
      --jd-fin-accent: var(--jd-color-primary);
      --jd-fin-muted: var(--jd-color-muted);
      --jd-fin-text: var(--jd-color-foreground);
      --jd-fin-border: var(--jd-color-border);
      --jd-fin-card: var(--jd-color-card);
      --jd-fin-soft: color-mix(in srgb, var(--jd-color-foreground) 6%, transparent);
      --jd-fin-warning: var(--jd-color-warning);
      /* 휴장일은 등락이 아니다 — finance 훅에 물리면 앱이 관례를 뒤집을 때 "장이 안 열림"
       표시까지 함께 뒤집힌다. 정지 상태를 뜻하는 danger에 고정한다. */
      --jd-fin-closed: var(--jd-color-danger);
      /* 오늘은 달력에서 가장 강한 강조다 — 팔레트 밖 핑크 대신 primary 계열의 accent를 쓴다.
       accent를 고른 이유: 요약 열이 이미 primary 틴트라 같은 색이면 두 강조가 겹쳐 읽힌다. */
      --jd-fin-today: var(--jd-color-accent);
      --jd-fin-cat-1: var(--jd-color-hue-violet);
      --jd-fin-cat-2: var(--jd-color-hue-pink);
      --jd-fin-cat-3: var(--jd-color-hue-teal);
      --jd-fin-cat-4: var(--jd-color-hue-amber);
      --jd-fin-cat-5: var(--jd-color-hue-purple);
      --jd-fin-cat-6: var(--jd-color-hue-cyan);
      --jd-fin-cat-7: var(--jd-color-hue-red);
      --jd-fin-cat-8: var(--jd-color-hue-green);

      display: block;
      box-sizing: border-box;
      font-family: var(--jd-font-sans);
      color: var(--jd-fin-text);
      /* 6열 격자는 좁은 화면에서 셀을 짓눌러 글자를 한 자씩 세로로 세운다 —
       접지 말고 굴린다(§6: 잘린 채 끝나는 것과 굴릴 수 있는 것은 다르다). */
      overflow-x: auto;
      overscroll-behavior-x: contain;
      scrollbar-width: thin;
    }
    jd-daily-themes-calendar * {
      box-sizing: border-box;
    }

    jd-daily-themes-calendar .jd-daily-themes-calendar__grid {
      /* 5칸 × 114 + 요약 150 — 이보다 좁아지면 셀 안 수치가 접힌다 */
      min-width: 720px;
      background: var(--jd-fin-card);
      border: var(--jd-border-thin) solid var(--jd-fin-border);
      border-radius: var(--jd-radius-2xl);
      overflow: hidden;
      box-shadow: var(--jd-shadow-xs);
    }

    /* 요일 헤더 */
    jd-daily-themes-calendar .jd-daily-themes-calendar__header {
      display: grid;
      grid-template-columns: repeat(5, 1fr) 150px;
      text-align: center;
      background: var(--jd-fin-soft);
      border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
      color: var(--jd-fin-muted);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__weekday {
      padding: var(--jd-space-2-5) 0;
      font-size: var(--jd-text-xs);
      font-weight: 800;
      letter-spacing: 0.06em;
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__summary-head {
      border-inline-start: var(--jd-border-thin) solid var(--jd-fin-border);
      color: var(--jd-fin-accent);
    }

    /* 주 행 */
    jd-daily-themes-calendar .jd-daily-themes-calendar__week {
      display: grid;
      grid-template-columns: repeat(5, 1fr) 150px;
      border-block-end: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__week[data-last] {
      border-block-end: none;
    }

    /* 셀 공통 */
    jd-daily-themes-calendar .jd-daily-themes-calendar__cell {
      position: relative;
      min-height: 170px;
      border-inline-end: var(--jd-border-thin) solid var(--jd-fin-border);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__cell--blank {
      min-height: 0;
    }

    /* 휴장일 */
    jd-daily-themes-calendar .jd-daily-themes-calendar__cell--holiday {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--jd-space-1);
      padding: var(--jd-space-3);
      background: var(--jd-fin-soft);
      opacity: 0.85;
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__holiday-day {
      font-size: var(--jd-text-xs);
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: var(--jd-fin-muted);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__holiday-tag {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1);
      font-size: 11px;
      font-weight: 800;
      white-space: nowrap;
      color: var(--jd-fin-closed);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__holiday-dot {
      width: 6px;
      height: 6px;
      flex-shrink: 0;
      border-radius: var(--jd-radius-full);
      background: var(--jd-fin-closed);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__holiday-name {
      font-size: 10.5px;
      font-weight: 700;
      line-height: var(--jd-leading-tight);
      text-align: center;
      color: var(--jd-fin-closed);
    }

    /* 미래 */
    jd-daily-themes-calendar .jd-daily-themes-calendar__cell--future {
      padding: var(--jd-space-3);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__future-day {
      font-size: var(--jd-text-xs);
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: var(--jd-fin-muted);
    }

    /* 정상 셀 */
    jd-daily-themes-calendar .jd-daily-themes-calendar__hit {
      position: absolute;
      inset: 0;
      z-index: 0;
      cursor: pointer;
      background: transparent;
      border: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      /* background 단축이 아니라 색만 — image·position까지 전이 대상이 되면 헛돈다 */
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    jd-daily-themes-calendar
      .jd-daily-themes-calendar__cell--day:not([data-today]):hover
      .jd-daily-themes-calendar__hit {
      background-color: var(--jd-fin-soft);
    }
    /* 셀 전체가 버튼이므로 눌림을 scale로 줄 수 없다(격자가 흔들린다) — 면을 한 단 더 눌러
     답한다. :not([data-today])를 hover와 똑같이 붙여 특이도를 맞춘다 — 안 맞추면 누르는
     동안에도 hover 규칙이 이겨 눌림이 보이지 않는다. */
    jd-daily-themes-calendar
      .jd-daily-themes-calendar__cell--day:not([data-today]):active
      .jd-daily-themes-calendar__hit {
      background-color: color-mix(in srgb, var(--jd-color-foreground) 12%, transparent);
    }
    /* 링을 셀 안쪽에 그린다 — 격자 테두리에 딱 붙은 버튼이라 바깥 offset은 이웃 셀에 먹힌다 */
    jd-daily-themes-calendar .jd-daily-themes-calendar__hit:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: -3px;
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__content {
      position: relative;
      z-index: 1;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-2);
      padding: var(--jd-space-3);
    }

    /* 오늘 강조 */
    jd-daily-themes-calendar .jd-daily-themes-calendar__cell--day[data-today] {
      padding: var(--jd-space-1-5);
    }
    jd-daily-themes-calendar
      .jd-daily-themes-calendar__cell--day[data-today]
      .jd-daily-themes-calendar__hit {
      inset: var(--jd-space-1-5);
      border: var(--jd-border-medium) solid var(--jd-fin-today);
      border-radius: var(--jd-radius-xl);
      background: color-mix(in srgb, var(--jd-fin-today) 6%, transparent);
      width: auto;
      height: auto;
    }
    /* 오늘 칸도 눌리는 버튼이다 — 위의 틴트가 일반 hover/active를 덮어쓰므로 자기 색으로
     다시 준다. 안 그러면 달력에서 유일하게 오늘만 아무 반응이 없다. */
    jd-daily-themes-calendar
      .jd-daily-themes-calendar__cell--day[data-today]:hover
      .jd-daily-themes-calendar__hit {
      background-color: color-mix(in srgb, var(--jd-fin-today) 12%, transparent);
    }
    jd-daily-themes-calendar
      .jd-daily-themes-calendar__cell--day[data-today]:active
      .jd-daily-themes-calendar__hit {
      background-color: color-mix(in srgb, var(--jd-fin-today) 20%, transparent);
    }
    jd-daily-themes-calendar
      .jd-daily-themes-calendar__cell--day[data-today]
      .jd-daily-themes-calendar__day-num {
      color: #fff;
      background: var(--jd-fin-today);
      padding: 2px var(--jd-space-2);
      border-radius: var(--jd-radius-full);
    }

    /* 날짜 헤더 */
    jd-daily-themes-calendar .jd-daily-themes-calendar__day-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__day-num {
      font-size: var(--jd-text-xs);
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: var(--jd-fin-text);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__pct-chips {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }
    /* "거 +1.24%"는 라벨과 수치가 한 덩어리다 — 접히면 라벨만 남고 숫자가 아래로 떨어진다 */
    jd-daily-themes-calendar .jd-daily-themes-calendar__pct-chip {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 9.5px;
      font-weight: 700;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__pct-chip[data-tone="up"] {
      color: var(--jd-fin-up);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__pct-chip[data-tone="down"] {
      color: var(--jd-fin-down);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__pct-chip-label {
      color: var(--jd-fin-muted);
    }

    /* 데이터 행 */
    jd-daily-themes-calendar .jd-daily-themes-calendar__data {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-1);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__data-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-1);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__data-label {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1);
      min-width: 0;
      font-size: 10px;
      font-weight: 700;
      white-space: nowrap;
      color: var(--jd-fin-muted);
    }
    /* 수치는 자릿수가 흔들리면 행마다 소수점이 어긋난다 — 등폭 + 줄바꿈 금지 */
    jd-daily-themes-calendar .jd-daily-themes-calendar__data-value {
      font-size: 11.5px;
      font-weight: 800;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      color: var(--jd-fin-text);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__data-value[data-tone="up"] {
      color: var(--jd-fin-up);
    }

    /* 테마칩 */
    jd-daily-themes-calendar .jd-daily-themes-calendar__themes {
      display: flex;
      flex-wrap: wrap;
      gap: var(--jd-space-1);
    }
    /* 칩 색은 element.ts가 인라인 --jd-dtc-cat 하나만 꽂고 면·글자·테두리는 여기서 뽑는다.
     v2처럼 세 속성을 인라인으로 쓰면 인라인이 시트를 이겨 hover/active를 CSS로 줄 수 없다.
     밝기 필터가 아니라 실색 전환인 이유: filter는 글자까지 함께 밝혀 틴트에 녹인다. */
    jd-daily-themes-calendar .jd-daily-themes-calendar__theme-chip {
      --_cat: var(--jd-dtc-cat, var(--jd-fin-accent));
      pointer-events: auto;
      cursor: pointer;
      font-size: 10px;
      font-weight: 800;
      white-space: nowrap;
      border-radius: var(--jd-radius-full);
      padding: 2px var(--jd-space-2);
      /* 옅은 틴트 위 원색 글자는 10px에서 AA에 못 미친다 — 잉크 쪽으로 섞어 대비 확보 */
      color: color-mix(in srgb, var(--_cat) 72%, var(--jd-color-foreground));
      background: color-mix(in srgb, var(--_cat) 10%, transparent);
      border: var(--jd-border-thin) solid color-mix(in srgb, var(--_cat) 20%, transparent);
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__theme-chip:hover {
      background-color: color-mix(in srgb, var(--_cat) 18%, transparent);
      border-color: color-mix(in srgb, var(--_cat) 34%, transparent);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__theme-chip:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__theme-chip:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    /* 왕관 */
    jd-daily-themes-calendar .jd-daily-themes-calendar__leaders {
      list-style: none;
      margin: 0;
      padding: 0;
      margin-block-start: auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__leader {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1);
      font-size: 10.5px;
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__crown {
      color: var(--jd-fin-warning);
      flex-shrink: 0;
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__leader-name {
      font-weight: 700;
      color: var(--jd-fin-text);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__leader-close {
      margin-inline-start: auto;
      font-size: 10px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: var(--jd-fin-text);
      white-space: nowrap;
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__leader-pct {
      font-size: 9.5px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__leader-pct[data-tone="up"] {
      color: var(--jd-fin-up);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__leader-pct[data-tone="down"] {
      color: var(--jd-fin-down);
    }

    /* 주간 요약 */
    jd-daily-themes-calendar .jd-daily-themes-calendar__summary {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-1-5);
      padding: var(--jd-space-3);
      border-inline-start: var(--jd-border-thin) solid var(--jd-fin-border);
      /* 요약 열은 헤더 라벨과 같은 강조색을 옅게 깐다 — v2의 틸 리터럴은 브랜드를 벗어난다 */
      background: color-mix(in srgb, var(--jd-fin-accent) 4%, transparent);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__summary[data-empty] {
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: var(--jd-fin-muted);
      background: var(--jd-fin-soft);
      opacity: 0.7;
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__summary-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__summary-row-label {
      font-size: 10px;
      font-weight: 800;
      color: var(--jd-fin-muted);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__summary-row-value {
      font-size: var(--jd-text-xs);
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: var(--jd-fin-text);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__summary-row-value[data-tone="up"] {
      color: var(--jd-fin-up);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__summary-row-value[data-tone="down"] {
      color: var(--jd-fin-down);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__summary-block {
      margin-block-start: 2px;
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__summary-label {
      font-size: 9.5px;
      font-weight: 800;
      color: var(--jd-fin-muted);
      margin-block-end: 2px;
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__summary-themes {
      display: flex;
      flex-wrap: wrap;
      gap: var(--jd-space-1);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__summary-theme {
      cursor: pointer;
      font-size: 9.5px;
      font-weight: 800;
      white-space: nowrap;
      border-radius: var(--jd-radius-full);
      padding: 1px var(--jd-space-1-5);
      color: color-mix(in srgb, var(--jd-fin-accent) 72%, var(--jd-color-foreground));
      background: color-mix(in srgb, var(--jd-fin-accent) 10%, transparent);
      border: var(--jd-border-thin) solid color-mix(in srgb, var(--jd-fin-accent) 24%, transparent);
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__summary-theme:hover {
      background-color: color-mix(in srgb, var(--jd-fin-accent) 18%, transparent);
      border-color: color-mix(in srgb, var(--jd-fin-accent) 38%, transparent);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__summary-theme:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__summary-theme:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__summary-leaders {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    jd-daily-themes-calendar .jd-daily-themes-calendar__summary-leader {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1);
      min-width: 0;
      font-size: 10px;
      font-weight: 700;
      color: var(--jd-fin-text);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    @media (prefers-reduced-motion: reduce) {
      jd-daily-themes-calendar .jd-daily-themes-calendar__hit,
      jd-daily-themes-calendar .jd-daily-themes-calendar__theme-chip,
      jd-daily-themes-calendar .jd-daily-themes-calendar__summary-theme {
        transition: none;
      }
    }
  }
`;
