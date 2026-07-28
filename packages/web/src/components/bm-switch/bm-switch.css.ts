import { css } from "../../core/styles.js";

/**
 * v2 값(기계 번역): 트랙 sm 36×20 / md 44×24 / lg 56×28, 썸 14/18/22px(수직 중앙·left 3px),
 * 이동 16/20/28px. 체크 트랙 = 강조 그라디언트, 미체크 = soft-200. 썸 = card 실색 + 그림자.
 *
 * finance 팔레트는 `--jd-fin-*`로 노출한다 — 소비자가 CSS 한 줄로 리브랜딩(§4.4-a).
 * 폴백은 v2 ButterMoney의 teal 리터럴(#14b8a6/#5cdcd0)이었는데, 그 값을 그대로 두면
 * `--jd-fin-*`를 안 주는 앱에서 **형광 민트 스위치**가 켜져 팔레트 밖 색이 화면에 남는다.
 * 켜짐은 브랜드 무관하게 "강조"라서 폴백을 primary→accent 그라디언트로 되돌린다 —
 * finance 앱은 --jd-fin-accent 한 줄로 여전히 자기 색을 갖는다.
 */
export default css`
  @layer junds.components {
    jd-bm-switch {
      display: inline-flex;
      --_accent: var(--jd-fin-accent, var(--jd-color-primary));
      --_accent-2: var(--jd-fin-accent-glow, var(--jd-color-accent));
      --_off: var(--jd-fin-soft-200, var(--jd-color-control-track));
      --_thumb: var(--jd-fin-surface, var(--jd-color-control-knob));
      --_text: var(--jd-fin-text, var(--jd-color-foreground));
    }

    .jd-bm-switch {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-2);
      cursor: pointer;
      user-select: none;
      font-family: var(--jd-font-sans);
    }
    jd-bm-switch[disabled] > .jd-bm-switch {
      cursor: not-allowed;
      opacity: var(--jd-opacity-50);
    }

    .jd-bm-switch__track {
      position: relative;
      display: inline-flex;
      flex-shrink: 0;
      border: 0;
      margin: 0;
      padding: 0;
      cursor: inherit;
      width: 44px;
      height: 24px; /* md 기본 */
      border-radius: var(--jd-radius-full);
      background: var(--_off);
      /* 파인 홈은 그림자도 토큰에서 — 리터럴 rgba는 다크에서 안 깊어진다 */
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
      transition: background var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    jd-bm-switch[checked] .jd-bm-switch__track {
      background: linear-gradient(135deg, var(--_accent) 0%, var(--_accent-2) 100%);
      box-shadow: inset 0 1px 0 var(--jd-color-highlight);
    }
    /* 호버는 실색 전환(filter: brightness 금지 — 썸까지 밝혀 트랙과 붙는다). 켜짐/꺼짐을
     각각 명시해 두 규칙의 특이도를 같게 맞춘다 — 한쪽만 쓰면 꺼짐 호버가 켜짐을 이긴다. */
    jd-bm-switch:not([checked], [disabled]) .jd-bm-switch:hover .jd-bm-switch__track {
      /* 새 훅을 만들지 않고 --_off를 잉크 쪽으로 민다 — 소비자가 soft-200을 무엇으로
       바꾸든 호버는 그 색의 한 단 짙은 값이 된다 */
      background: color-mix(in srgb, var(--jd-color-foreground) 8%, var(--_off));
    }
    jd-bm-switch[checked]:not([disabled]) .jd-bm-switch:hover .jd-bm-switch__track {
      background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--_accent) 86%, var(--jd-color-foreground)) 0%,
        var(--_accent) 100%
      );
    }
    /* 눌린 면은 빛을 잃는다 */
    jd-bm-switch:not([disabled]) .jd-bm-switch:active .jd-bm-switch__track {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-bm-switch__track:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    .jd-bm-switch__thumb {
      position: absolute;
      top: 50%;
      left: 3px;
      width: 18px;
      height: 18px; /* md 기본 */
      border-radius: var(--jd-radius-full);
      background: var(--_thumb);
      /* 노브 그림자는 전용 토큰 — 다크에서 더 깊어져야 흰 노브가 트랙에서 떠 보인다 */
      box-shadow: var(--jd-shadow-knob);
      transform: translateY(-50%) translateX(0);
      transition: transform var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    jd-bm-switch[checked] .jd-bm-switch__thumb {
      transform: translateY(-50%) translateX(20px);
    }

    /* sm 36×20 / 썸 14 / 이동 16 */
    jd-bm-switch[size="sm"] .jd-bm-switch__track {
      width: 36px;
      height: 20px;
    }
    jd-bm-switch[size="sm"] .jd-bm-switch__thumb {
      width: 14px;
      height: 14px;
    }
    jd-bm-switch[size="sm"][checked] .jd-bm-switch__thumb {
      transform: translateY(-50%) translateX(16px);
    }

    /* lg 56×28 / 썸 22 / 이동 28 */
    jd-bm-switch[size="lg"] .jd-bm-switch__track {
      width: 56px;
      height: 28px;
    }
    jd-bm-switch[size="lg"] .jd-bm-switch__thumb {
      width: 22px;
      height: 22px;
    }
    jd-bm-switch[size="lg"][checked] .jd-bm-switch__thumb {
      transform: translateY(-50%) translateX(28px);
    }

    .jd-bm-switch__text {
      font-size: var(--jd-text-sm);
      font-weight: var(--jd-weight-semibold);
      color: var(--_text);
    }
    .jd-bm-switch__text[hidden] {
      display: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-bm-switch__track,
      .jd-bm-switch__thumb {
        transition: none;
      }
    }
  }
`;
