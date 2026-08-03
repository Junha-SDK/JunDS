/**
 * jd-tooltip CSS — v2 Tooltip 표면의 토큰 번역.
 *
 * v2 값: `px-2.5 py-1.5 text-xs text-white bg-gray-900/95 rounded-lg shadow-xl
 * shadow-black/25 border border-gray-700/50 backdrop-blur-sm whitespace-nowrap
 * pointer-events-none animate-fade-in z-80`, 오프셋 `mb-2/mt-2/mr-2/ml-2`.
 *
 * 어두운 말풍선 표면은 테마 반전 대상이 아니다(라이트/다크 모두 잉크색) — 사이드바
 * 잉크 토큰(--jd-color-sidebar-bg)을 그 역할로 재사용한다. 기하는 jd-popover 시트가
 * 담당하고 여기서는 **기본값(side=top·align=center)과 스킨만** 덮어쓴다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.base {
    jd-tooltip:not(:defined) {
      display: inline-flex;
    }
  }
  @layer junds.components {
    jd-tooltip {
      position: relative;
      display: inline-flex;
    }

    /* 파생 기본값(0,1,1) — 명시 side/align attribute(0,2,0)가 언제나 이긴다 */
    jd-tooltip > .jd-popover__panel {
      --jd-popover-offset: var(--jd-space-2);
      top: auto;
      bottom: 100%;
      left: 50%;
      right: auto;
      margin-block: 0 var(--jd-popover-offset);
      --jd-popover-tx: -50%;

      z-index: var(--jd-z-tooltip);
      padding: var(--jd-space-1-5) var(--jd-space-2-5);
      font-size: var(--jd-text-xs);
      line-height: var(--jd-leading-snug);
      color: #ffffff;
      background: color-mix(in srgb, var(--jd-color-sidebar-bg) 95%, transparent);
      border-color: color-mix(in srgb, var(--jd-color-sidebar-hover) 50%, transparent);
      border-radius: var(--jd-radius-lg);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.25);
      /* v2는 nowrap 고정이라 긴 설명이 상자 밖으로 삐져나갔다. width:max-content가
       짧은 문구는 여전히 한 줄로 잡아 주므로, 줄바꿈을 허용하고 상한만 좁히면
       "짧으면 한 줄 · 길면 두세 줄"이 된다 — 글자를 줄이는 대신 줄 수를 늘린다(§9). */
      white-space: normal;
      max-width: min(18rem, calc(100vw - 2rem));
      overflow-wrap: anywhere;
      /* 잉크 말풍선이라 꼬리도 잉크색이다 — 기하는 jd-popover 시트가 이미 갖고 있다 */
      --jd-popover-arrow: 5px;
      --jd-popover-arrow-face: color-mix(in srgb, var(--jd-color-sidebar-bg) 95%, transparent);
      /* 말풍선이 포인터를 가로채면 hover가 깜빡인다(v2 동일) */
      pointer-events: none;
    }
    /* 파생 기본값(side=top · align=center)도 attribute로 반영되지 않으므로(§1.3)
     꼬리 기하를 여기서 잡는다 — 명시 [side]/[align] 규칙(0,2,1)이 언제나 이긴다. */
    jd-tooltip > .jd-popover__panel::after {
      top: 100%;
      bottom: auto;
      left: 50%;
      right: auto;
      margin-inline-start: calc(-1 * var(--jd-popover-arrow));
      border-width: var(--jd-popover-arrow);
      border-bottom-width: 0;
      border-bottom-color: transparent;
      border-top-color: var(--jd-popover-arrow-face);
    }
  }
`;
