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
  jd-tooltip:not(:defined) { display: inline-flex; }
}
@layer junds.components {
  jd-tooltip { position: relative; display: inline-flex; }

  /* 파생 기본값(0,1,1) — 명시 side/align attribute(0,2,0)가 언제나 이긴다 */
  jd-tooltip > .jd-popover__panel {
    --jd-popover-offset: var(--jd-space-2);
    top: auto; bottom: 100%;
    left: 50%; right: auto;
    margin-block: 0 var(--jd-popover-offset);
    --jd-popover-tx: -50%;

    z-index: var(--jd-z-tooltip);
    padding: var(--jd-space-1-5) var(--jd-space-2-5);
    font-size: var(--jd-text-xs);
    color: #ffffff;
    background: color-mix(in srgb, var(--jd-color-sidebar-bg) 95%, transparent);
    border-color: color-mix(in srgb, var(--jd-color-sidebar-hover) 50%, transparent);
    border-radius: var(--jd-radius-lg);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.25);
    white-space: nowrap;
    /* 말풍선이 포인터를 가로채면 hover가 깜빡인다(v2 동일) */
    pointer-events: none;
  }
}`;
