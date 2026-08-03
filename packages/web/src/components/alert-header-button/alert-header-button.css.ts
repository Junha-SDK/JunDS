import { css } from "../../core/styles.js";

/**
 * v2 값: size-9(36px) 원형 그리드 센터, 색 var(--bm-muted). 카운트 배지는
 * 우상단 min-w 16px·h 16px 원형, 배경 var(--bm-up)·흰 글자·2px 배경색 링,
 * 9.5px extrabold.
 *
 * 토큰 번역: --bm-muted→--jd-color-muted, 상승색은 앱이 재틴트할 수 있게
 * --jd-finance-up 폴백 체인으로 둔다(신규 전역 토큰 도입 없이, 기본은 JunDS
 * 시맨틱 success=긍정).
 *
 * v2와 다른 두 가지:
 *  1. **면을 준다.** v2는 배경 없는 아이콘이라 채도 높은 배지 옆에서 얇은 회색 종이
 *     묻혀 "배지만 떠 있는" 것으로 읽혔다(실측). jd-button secondary와 같은 어휘로
 *     면·테두리·그림자를 줘서 배지가 **버튼 위에** 앉게 한다.
 *  2. 배지 링은 --jd-color-background가 아니라 --jd-color-card다 — 링의 역할은
 *     배지를 아래 면에서 떼어 놓는 것이고, 이제 그 아래 면은 버튼 표면이다.
 */
export default css`
  @layer junds.components {
    jd-alert-header-button {
      display: inline-flex;
      flex-shrink: 0;
    }
    a.jd-alert-header-button {
      position: relative;
      display: grid;
      place-items: center;
      box-sizing: border-box;
      width: 2.25rem;
      height: 2.25rem;
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-card);
      color: var(--jd-color-foreground);
      box-shadow: var(--jd-shadow-xs);
      text-decoration: none;
      flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    a.jd-alert-header-button:hover {
      background: var(--jd-color-card-hover);
      border-color: color-mix(in srgb, var(--jd-color-border) 70%, var(--jd-color-muted-light));
      box-shadow: var(--jd-shadow-sm);
    }
    a.jd-alert-header-button:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    a.jd-alert-header-button:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
      box-shadow: var(--jd-shadow-xs);
    }
    .jd-alert-header-button__icon {
      display: block;
    }

    .jd-alert-header-button__badge {
      position: absolute;
      top: 0.125rem;
      right: 0.125rem;
      /* content-box면 링 2px이 밖으로 더해져 36px 버튼 밖으로 나간다 */
      box-sizing: border-box;
      min-width: 1.125rem;
      height: 1.125rem;
      padding-inline: var(--jd-space-1);
      display: grid;
      place-items: center;
      border-radius: var(--jd-radius-full);
      background: var(--jd-finance-up, var(--jd-color-success));
      color: #fff;
      border: var(--jd-border-medium) solid var(--jd-color-card);
      /* v2의 9.5px는 읽기 하한(11px) 아래다 — 배지를 키워 글자를 지킨다 */
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      line-height: var(--jd-leading-none);
      font-variant-numeric: tabular-nums;
    }
    .jd-alert-header-button__badge[hidden] {
      display: none;
    }

    @media (prefers-reduced-motion: reduce) {
      a.jd-alert-header-button {
        transition: none;
      }
    }
  }
`;
