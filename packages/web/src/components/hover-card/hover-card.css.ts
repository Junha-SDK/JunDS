/**
 * jd-hover-card CSS — v2 HoverCard 표면의 토큰 번역.
 * v2 값: 래퍼 `relative inline-flex`, 패널 `w-64 p-4 bg-card rounded-xl shadow-lg
 * border border-border animate-fade-in z-50`, 오프셋 `mt-2/mb-2/mr-2/ml-2`, 수평 중앙.
 * 기하는 jd-popover 시트가 담당 — 여기서는 기본 정렬(center)과 스킨만 덮어쓴다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-hover-card:not(:defined) { display: inline-flex; }
  jd-hover-card:not(:defined) > :not([slot="trigger"]) { display: none; }
}
@layer junds.components {
  jd-hover-card { position: relative; display: inline-flex; }

  /* 파생 기본값(0,1,1) — 명시 align attribute(0,2,0)가 언제나 이긴다 */
  jd-hover-card > .jd-popover__panel {
    --jd-popover-offset: var(--jd-space-2);
    left: 50%; right: auto;
    --jd-popover-tx: -50%;

    width: 16rem;
    box-shadow: var(--jd-shadow-lg);
    backdrop-filter: none;
  }
}`;
