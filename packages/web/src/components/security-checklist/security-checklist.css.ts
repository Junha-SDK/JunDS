import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 토큰 의미 번역):
 * - 루트 bg-white border rounded-xl overflow-hidden.
 * - 헤더 px-5 py-4 border-b border-border-light, 제목 base semibold,
 *   카운트 배지 xs semibold rounded-full(ok=success/warn=warning/bad=danger 틴트),
 *   진행 막대 gap-0.5 · seg h-1.5 flex-1 rounded-full(status 색).
 * - 항목 divide-y, 행 gap-3 px-5 py-3, 아이콘 w-8 h-8 rounded-full status 틴트,
 *   제목 sm medium, 설명 xs muted, 조치 버튼 xs(insecure=primary/그 외 secondary).
 * status→토큰: secure=success, insecure=danger, attention=warning, unchecked=muted.
 * ※ v2 보조 버튼의 `bg-surface`는 Tailwind의 밝은 패널색이다 — 다크 전용 토큰
 *   --jd-color-surface가 아니라 jd-button[variant=secondary]와 같은 card + border로 번역한다.
 */
export default css`
  @layer junds.base {
    jd-security-checklist:not(:defined) {
      display: block;
    }
  }
  @layer junds.components {
    jd-security-checklist {
      display: block;
      box-sizing: border-box;
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      overflow: hidden;
    }

    .jd-security__header {
      padding: var(--jd-space-4) var(--jd-space-5);
      border-block-end: var(--jd-border-thin) solid var(--jd-color-border-light);
    }
    .jd-security__head-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jd-space-3);
      margin-block-end: var(--jd-space-2);
    }
    .jd-security__title {
      margin: 0;
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-semibold);
      color: var(--jd-color-foreground);
    }
    .jd-security__count {
      flex-shrink: 0;
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-semibold);
      padding: var(--jd-space-0-5) var(--jd-space-2);
      border-radius: var(--jd-radius-full);
      font-variant-numeric: tabular-nums;
    }
    .jd-security__count[data-level="ok"] {
      background: color-mix(in srgb, var(--jd-color-success) 12%, transparent);
      color: color-mix(
        in srgb,
        var(--jd-color-success) var(--jd-tone-ink-mix),
        var(--jd-tone-ink-toward)
      );
    }
    .jd-security__count[data-level="warn"] {
      background: color-mix(in srgb, var(--jd-color-warning) 12%, transparent);
      color: color-mix(
        in srgb,
        var(--jd-color-warning) var(--jd-tone-ink-mix),
        var(--jd-tone-ink-toward)
      );
    }
    .jd-security__count[data-level="bad"] {
      background: color-mix(in srgb, var(--jd-color-danger) 12%, transparent);
      color: color-mix(
        in srgb,
        var(--jd-color-danger) var(--jd-tone-ink-mix),
        var(--jd-tone-ink-toward)
      );
    }

    /* 진행 막대 */
    .jd-security__progress {
      display: flex;
      gap: var(--jd-space-0-5);
    }
    .jd-security__seg {
      height: 0.375rem;
      flex: 1 1 0;
      border-radius: var(--jd-radius-full);
      background: color-mix(in srgb, var(--jd-color-muted) 25%, transparent);
    }
    .jd-security__seg[data-status="secure"] {
      background: var(--jd-color-success);
    }
    .jd-security__seg[data-status="insecure"] {
      background: var(--jd-color-danger);
    }
    .jd-security__seg[data-status="attention"] {
      background: var(--jd-color-warning);
    }

    /* 항목 */
    .jd-security__list {
      display: block;
    }
    .jd-security__item {
      display: flex;
      align-items: center;
      gap: var(--jd-space-3);
      padding: var(--jd-space-3) var(--jd-space-5);
    }
    .jd-security__item:not(:first-child) {
      border-block-start: var(--jd-border-thin) solid var(--jd-color-border-light);
    }

    .jd-security__icon {
      flex-shrink: 0;
      width: 2rem;
      height: 2rem;
      border-radius: var(--jd-radius-full);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: color-mix(in srgb, var(--jd-color-muted) 14%, transparent);
      color: var(--jd-color-muted);
    }
    .jd-security__icon[data-status="secure"] {
      background: color-mix(in srgb, var(--jd-color-success) 14%, transparent);
      color: var(--jd-color-success);
    }
    .jd-security__icon[data-status="insecure"] {
      background: color-mix(in srgb, var(--jd-color-danger) 14%, transparent);
      color: var(--jd-color-danger);
    }
    .jd-security__icon[data-status="attention"] {
      background: color-mix(in srgb, var(--jd-color-warning) 14%, transparent);
      color: var(--jd-color-warning);
    }
    .jd-security__icon svg {
      width: 1rem;
      height: 1rem;
    }

    .jd-security__body {
      flex: 1 1 auto;
      min-width: 0;
    }
    .jd-security__item-title {
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-medium);
      color: var(--jd-color-foreground);
    }
    .jd-security__item-desc {
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
    }

    .jd-security__action {
      flex-shrink: 0;
      cursor: pointer;
      font-family: inherit;
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-medium);
      white-space: nowrap;
      padding: var(--jd-space-1) var(--jd-space-2-5);
      border-radius: var(--jd-radius-md);
      border: var(--jd-border-thin) solid transparent;
      /* all 금지 — padding·font-size까지 대상이 되어 밀도 전환이 흐른다 (DEC-039) */
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-security__action[data-variant="primary"] {
      background: var(--jd-color-primary);
      color: #fff;
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
    }
    .jd-security__action[data-variant="primary"]:hover {
      background: var(--jd-color-primary-hover);
    }
    /* v2 bg-surface는 Tailwind의 밝은 패널색이다 — 다크 전용 토큰인 --jd-color-surface에
     foreground를 얹으면 라이트 모드에서 검은 글자가 검은 버튼에 묻힌다. 보조 버튼의
     면은 jd-button[variant=secondary]와 같은 어휘(card + border)로 맞춘다. */
    .jd-security__action[data-variant="secondary"] {
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
      border-color: var(--jd-color-border);
      box-shadow: var(--jd-shadow-xs);
    }
    .jd-security__action[data-variant="secondary"]:hover {
      background: var(--jd-color-card-hover);
      border-color: color-mix(in srgb, var(--jd-color-border) 70%, var(--jd-color-muted-light));
      box-shadow: var(--jd-shadow-sm);
    }
    /* 눌린 면은 빛을 잃는다 */
    /* [data-variant]까지 붙여 변종 :hover(특이도 0,3,0)를 넘긴다 — 누르는 동안에도
     :hover가 참이라 특이도가 낮으면 눌림이 호버에 가린다 */
    .jd-security__action[data-variant]:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-security__action:focus-visible {
      /* 항목 행이 카드 overflow:hidden 안이라 outline이 잘린다 — 링을 그림자로 그린다 */
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-security__action {
        transition: none;
      }
      .jd-security__action[data-variant]:active {
        scale: none;
      }
    }
  }
`;
