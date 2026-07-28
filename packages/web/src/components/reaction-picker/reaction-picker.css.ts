import { css } from "../../core/styles.js";

/**
 * v2 값: 트리거 pill(px-2.5/py-1, text-sm, border), 선택 시 primary 10%/30% 틴트.
 * 팝업 = 절대배치 flex pill(카드면·테두리·떠 있는 그림자·p-1), placement top이면 위쪽,
 * bottom이면 아래쪽. 옵션 32px 원형(hover scale 1.25), 선택 항목 primary 15% + 링.
 */
export default css`
  @layer junds.components {
    jd-reaction-picker {
      position: relative;
      display: inline-block;
      font-family: var(--jd-font-sans);
    }

    .jd-reaction-picker__trigger {
      appearance: none;
      -webkit-appearance: none;
      margin: 0;
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1);
      padding: var(--jd-space-1) var(--jd-space-2-5);
      border-radius: var(--jd-radius-full);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
      font-family: inherit;
      font-size: var(--jd-text-md);
      line-height: var(--jd-leading-none);
      cursor: pointer;
      user-select: none;
      /* 눌리는 알약은 면 + 위에서 받는 빛을 함께 가진다 — 채움만 있으면 색종이로 읽힌다 */
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
      /* all 금지 — padding·font-size까지 대상이 되어 레이아웃이 매 프레임 리플로우된다 */
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-reaction-picker__trigger:hover {
      background: var(--jd-color-card-hover);
      border-color: color-mix(in srgb, var(--jd-color-border) 70%, var(--jd-color-muted-light));
    }
    .jd-reaction-picker__trigger:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-reaction-picker__trigger:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }
    .jd-reaction-picker__trigger[data-selected] {
      background: color-mix(in srgb, var(--jd-color-primary) 10%, var(--jd-color-card));
      border-color: color-mix(in srgb, var(--jd-color-primary) 30%, transparent);
    }
    /* 이모지와 plus 글리프의 높이가 달라 알약이 들썩이지 않게 자리를 고정한다 */
    .jd-reaction-picker__value {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.125rem;
      font-size: var(--jd-text-lg);
      line-height: var(--jd-leading-none);
    }
    .jd-reaction-picker__trigger-label {
      font-size: var(--jd-text-xs);
      white-space: nowrap;
    }
    .jd-reaction-picker__trigger-label[hidden] {
      display: none;
    }

    /* 기본 placement=top은 **base 규칙이** 담당한다 — 디폴트는 attribute로 반영되지
     않으므로(§1.3 reflect는 set 시점) [placement="top"]은 매치되지 않는다. 그러면
     top/bottom이 둘 다 auto가 되어 팝업이 정적 위치(= 트리거 바로 뒤)에 얹히고,
     이모지 하나만 트리거 옆에 뜬 채 나머지가 좌상단에 압착되어 보인다(실측). */
    .jd-reaction-picker__menu {
      position: absolute;
      left: 0;
      bottom: 100%;
      top: auto;
      margin-block: 0 var(--jd-space-1-5);
      z-index: var(--jd-z-dropdown);
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      gap: var(--jd-space-0-5);
      padding: var(--jd-space-1);
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-card);
      /* 떠 있는 것은 lg 이상 + 눅인 테두리 */
      border: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-color-border) 76%, transparent);
      box-shadow: var(--jd-shadow-lg), inset 0 1px 0 var(--jd-color-highlight);
    }
    .jd-reaction-picker__menu[hidden] {
      display: none;
    }
    jd-reaction-picker[placement="top"] .jd-reaction-picker__menu {
      top: auto;
      bottom: 100%;
      margin-block: 0 var(--jd-space-1-5);
    }
    jd-reaction-picker[placement="bottom"] .jd-reaction-picker__menu {
      top: 100%;
      bottom: auto;
      margin-block: var(--jd-space-1-5) 0;
    }

    .jd-reaction-picker__option {
      appearance: none;
      -webkit-appearance: none;
      margin: 0;
      padding: 0;
      flex: none;
      width: 2rem;
      height: 2rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      border-radius: var(--jd-radius-full);
      background: transparent;
      font-family: inherit;
      font-size: var(--jd-text-xl);
      line-height: var(--jd-leading-none);
      cursor: pointer;
      transition: transform var(--jd-duration-fast) var(--jd-easing-ease-out),
        background-color var(--jd-duration-fast) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-reaction-picker__option:hover {
      transform: scale(1.25);
      background: color-mix(in srgb, var(--jd-color-muted) 10%, transparent);
    }
    .jd-reaction-picker__option:active {
      transform: scale(0.94);
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-reaction-picker__option:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: 1px;
    }
    .jd-reaction-picker__option[data-active] {
      background: color-mix(in srgb, var(--jd-color-primary) 15%, transparent);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-reaction-picker__trigger,
      .jd-reaction-picker__option {
        transition: none;
      }
      .jd-reaction-picker__option:hover {
        transform: none;
      }
    }
  }
`;
