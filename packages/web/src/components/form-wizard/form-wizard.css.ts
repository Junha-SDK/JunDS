/**
 * jd-form-wizard CSS — v2 patterns/FormWizard의 토큰 번역.
 * 스텝 인디케이터(w-8 h-8 rounded-full · done=success · current=primary · todo=gray-200) ·
 * 연결선 · 헤더 · 콘텐츠 · 이전/다음 버튼(bordered / primary).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-form-wizard {
      display: block;
    }
    jd-form-wizard > [slot="step"] {
      display: block;
    }
    .jd-form-wizard {
      width: 100%;
    }

    /* ── 스텝 인디케이터 ── */
    .jd-form-wizard__stepper {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1);
      margin-block-end: var(--jd-space-6);
    }
    .jd-form-wizard__seg {
      display: flex;
      align-items: center;
      gap: var(--jd-space-1);
      flex: 1 1 0;
      min-width: 0; /* 연결선이 칸을 밀어내지 않게 — 원은 flex-shrink:0으로 지킨다 */
    }
    .jd-form-wizard__seg:last-child {
      flex: 0 0 auto;
    }

    .jd-form-wizard__step {
      flex-shrink: 0;
      width: 2rem;
      height: 2rem;
      border: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--jd-radius-full);
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-bold);
      background: var(--jd-color-border);
      color: var(--jd-color-muted);
      transition: background var(--jd-duration-normal) var(--jd-easing-ease-out),
        color var(--jd-duration-normal) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-form-wizard__step[data-state="done"] {
      /* success 원색(#2f8f57) + #fff = 4.04:1(<4.5) — 배경을 foreground로 20% 눌러 대비 확보(체크 글리프는 white 승계) */
      background: color-mix(in srgb, var(--jd-color-success) 80%, var(--jd-color-foreground));
      color: #fff;
      cursor: pointer;
    }
    .jd-form-wizard__step[data-state="current"] {
      background: var(--jd-color-primary);
      color: #fff;
    }
    .jd-form-wizard__step:disabled {
      cursor: default;
    }
    .jd-form-wizard__step[data-state="done"]:disabled {
      cursor: pointer;
    }
    /* 되돌아갈 수 있는 단계는 눌린다 — 세 상태를 다 준다(§1). 배경을 밝히지 않고
     후광으로 알리는 이유: 위 규칙의 혼합비는 흰 글자와 4.5:1을 맞춘 값이라 손대면
     대비가 무너지고, 혼합 방향(foreground)은 모드마다 반대로 움직인다. */
    .jd-form-wizard__step[data-state="done"]:hover {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--jd-color-success) 25%, transparent);
    }
    .jd-form-wizard__step[data-state="done"]:active {
      scale: 0.94;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-form-wizard__step:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    .jd-form-wizard__line {
      flex: 1;
      height: 2px;
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-border);
    }
    .jd-form-wizard__line[data-state="done"] {
      background: var(--jd-color-success);
    }

    /* ── 헤더 ── */
    .jd-form-wizard__head {
      margin-block-end: var(--jd-space-4);
    }
    /* 제목·설명은 어절을 지킨다 — 기본 CJK 줄바꿈은 글자 단위라 좁은 폭에서 조각난다(§5) */
    .jd-form-wizard__title {
      margin: 0;
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-lg);
      font-weight: var(--jd-weight-semibold);
      color: var(--jd-color-foreground);
      word-break: keep-all;
      overflow-wrap: break-word;
    }
    .jd-form-wizard__desc {
      margin: var(--jd-space-0-5) 0 0;
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-sm);
      color: var(--jd-color-muted);
      word-break: keep-all;
      overflow-wrap: break-word;
    }
    .jd-form-wizard__desc[hidden] {
      display: none;
    }

    /* ── 콘텐츠 ── */
    .jd-form-wizard__content {
      margin-block-end: var(--jd-space-6);
    }

    .jd-form-wizard__error {
      margin: 0 0 var(--jd-space-4);
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-sm);
      color: var(--jd-color-danger);
    }
    .jd-form-wizard__error[hidden] {
      display: none;
    }

    /* ── 네비게이션 ──
     간격이 없으면 세 조각(이전 / n / m / 다음)이 좁은 폭에서 서로를 밀어 겹친다(실측).
     버튼은 줄이지 않고, 정말 모자라면 줄을 바꾼다. */
    .jd-form-wizard__nav {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-3);
    }
    .jd-form-wizard__count {
      /* 단계 표시는 수치다 — 자릿수가 바뀌어도 좌우 버튼이 흔들리지 않게 */
      flex: 1 1 auto;
      min-width: 0;
      text-align: center;
      white-space: nowrap;
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-xs);
      font-variant-numeric: tabular-nums;
      color: var(--jd-color-muted);
    }

    .jd-form-wizard__prev,
    .jd-form-wizard__next {
      flex-shrink: 0;
      white-space: nowrap;
      padding: var(--jd-space-2) var(--jd-space-4);
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-medium);
      border-radius: var(--jd-radius-lg);
      cursor: pointer;
      /* all 금지 — 대상을 지목한다(§3). 눌림(scale)은 press 속도로 따로 잡는다. */
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out),
        border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-form-wizard__prev {
      border: var(--jd-border-thin) solid var(--jd-color-border);
      background: transparent;
      color: var(--jd-color-foreground);
    }
    .jd-form-wizard__prev:hover:not(:disabled) {
      background: color-mix(in srgb, var(--jd-color-muted) 8%, transparent);
      border-color: color-mix(in srgb, var(--jd-color-border) 70%, var(--jd-color-muted-light));
    }
    .jd-form-wizard__prev:disabled {
      opacity: var(--jd-opacity-30);
      cursor: not-allowed;
    }
    .jd-form-wizard__next {
      border: 0;
      background: var(--jd-color-primary);
      color: #fff;
      /* 채움만 있는 면은 색종이로 읽힌다 — 위에서 받는 빛을 함께 준다(§2) */
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
    }
    .jd-form-wizard__next:hover {
      background: var(--jd-color-primary-hover);
      box-shadow: 0 4px 12px var(--jd-color-primary-glow), var(--jd-shadow-xs),
        inset 0 1px 0 var(--jd-color-highlight);
    }
    /* 눌린 면은 빛을 잃는다(§1) — v2에는 눌림 상태 자체가 없었다 */
    .jd-form-wizard__prev:active:not(:disabled),
    .jd-form-wizard__next:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-form-wizard__prev:focus-visible,
    .jd-form-wizard__next:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-form-wizard__step,
      .jd-form-wizard__prev,
      .jd-form-wizard__next {
        transition: none;
      }
    }
  }
`;
