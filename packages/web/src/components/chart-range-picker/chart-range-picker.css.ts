import { css } from "../../core/styles.js";

/**
 * v2 값(기계 번역): pill = px-3 py-1.5 rounded-full text-[12px] font-extrabold.
 * 활성 = accent-soft 배경 + accent-strong 글자 + accent 30% 테두리.
 * 비활성 = soft-100 배경 + text 글자 + border 테두리.
 *
 * accent 폴백은 v2 ButterMoney의 teal 리터럴(#14b8a6/#0d9488)이었다. 그 값을 두면
 * `--jd-fin-*`를 안 주는 앱에서 선택된 칩이 **연한 민트**로 떠 팔레트 밖 색이 남는다.
 * 기간 선택은 브랜드 무관하게 "지금 고른 것"이라 강조색이 맞다 — primary 계열로
 * 되돌리고, finance 앱은 --jd-fin-accent 한 줄로 여전히 자기 색을 갖는다.
 */
export default css`
  @layer junds.components {
    jd-chart-range-picker {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--jd-space-1-5);
      font-family: var(--jd-font-sans);
      --_accent: var(--jd-fin-accent, var(--jd-color-primary));
      /* 활성 글자는 틴트 위에 앉는다 — 앵커를 라이트에서는 잉크 쪽, 다크에서는 흰 쪽으로
       미는 톤 잉크 공식(DEC-044)으로 뽑아야 한 값이 양쪽 모드에서 다 읽힌다.
       --jd-fin-accent-strong를 주는 앱은 그 값이 그대로 이긴다. */
      --_accent-strong: var(
        --jd-fin-accent-strong,
        color-mix(in srgb, var(--_accent) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward))
      );
      --_soft: var(--jd-fin-soft-100, var(--jd-color-neutral-100));
      --_text: var(--jd-fin-text, var(--jd-color-foreground));
      --_border: var(--jd-fin-border, var(--jd-color-border));
    }

    .jd-chart-range-picker__pill {
      appearance: none;
      margin: 0;
      padding: var(--jd-space-1-5) var(--jd-space-3);
      border-radius: var(--jd-radius-full);
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-bold);
      line-height: var(--jd-leading-none);
      font-family: inherit;
      cursor: pointer;
      background: var(--_soft);
      color: var(--_text);
      border: var(--jd-border-thin) solid var(--_border);
      box-shadow: var(--jd-shadow-xs);
      /* all 금지 — 대상 속성을 지목한다(DEC-039) */
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-chart-range-picker__pill:hover {
      background: color-mix(in srgb, var(--_accent) 8%, var(--_soft));
      border-color: color-mix(in srgb, var(--_accent) 30%, var(--_border));
    }
    /* 눌린 면은 빛을 잃는다 */
    .jd-chart-range-picker__pill:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    /* 선택된 칩은 강조 틴트 위 강조 글자. 12%로는 이웃한 비활성 칩과 구분이 안 붙어
     bg-strong-mix(라이트 22% / 다크 40%)를 쓴다 — 면은 앵커 하나에서만 파생하므로
     --jd-fin-accent를 바꾸는 앱은 선택 표시도 함께 따라온다. */
    .jd-chart-range-picker__pill[data-active] {
      background: color-mix(in srgb, var(--_accent) var(--jd-tone-bg-strong-mix), transparent);
      color: var(--_accent-strong);
      border-color: color-mix(in srgb, var(--_accent) 34%, transparent);
      box-shadow: inset 0 1px 0 var(--jd-color-highlight);
    }
    .jd-chart-range-picker__pill:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-chart-range-picker__pill {
        transition: none;
      }
    }
  }
`;
