/**
 * jd-rating CSS — v2 composites/Rating(별 sm 16 / md 20 / lg 28px, gap-0.5,
 * 채움·외곽선 warning, 빈 별 외곽선 border, disabled 50%)의 토큰 번역.
 *
 * 반칸은 SVG 2장 겹침 + clip-path다(v2 linearGradient id 충돌 회피 — element.ts 주해).
 * 히트 영역이 별 위에 정확히 반씩 깔려 있어 "왼쪽 절반=0.5"가 좌표 계산 없이 성립하고,
 * 논리 속성(inset-inline)이라 RTL에서도 방향이 자동으로 뒤집힌다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-rating {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-0-5); /* v2 gap-0.5 */
    }
    jd-rating[disabled] {
      opacity: var(--jd-opacity-50);
    }

    /* size 기본 md(20px) — 디폴트는 attribute 미반영(§1.3)이라 base가 담당 */
    .jd-rating__star {
      position: relative;
      display: inline-block;
      flex-shrink: 0;
      width: 1.25rem;
      height: 1.25rem;
    }
    jd-rating[size="sm"] .jd-rating__star {
      width: 1rem;
      height: 1rem;
    }
    jd-rating[size="lg"] .jd-rating__star {
      width: 1.75rem;
      height: 1.75rem;
    }

    .jd-rating__icon {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      fill: none;
      stroke: var(--jd-color-border);
      stroke-width: 1.5;
      stroke-linejoin: round;
    }
    .jd-rating__icon--fill {
      fill: var(--jd-color-warning);
      stroke: var(--jd-color-warning);
      clip-path: inset(0 100% 0 0); /* data-fill="none" */
    }
    .jd-rating__star[data-fill="half"] .jd-rating__icon--fill {
      clip-path: inset(0 50% 0 0);
    }
    .jd-rating__star[data-fill="full"] .jd-rating__icon--fill {
      clip-path: inset(0);
    }
    /* v2: 반쯤 찬 별도 외곽선 전체가 warning이다 */
    .jd-rating__star[data-fill="half"] .jd-rating__icon--empty,
    .jd-rating__star[data-fill="full"] .jd-rating__icon--empty {
      stroke: var(--jd-color-warning);
    }

    /* 히트 영역 — 아이콘 위에 깔린다(뒤 형제라 z-index 불필요) */
    .jd-rating__hit {
      position: absolute;
      inset-block: 0;
      width: 50%;
      cursor: pointer;
    }
    .jd-rating__hit[data-side="half"] {
      inset-inline-start: 0;
    }
    .jd-rating__hit[data-side="full"] {
      inset-inline-end: 0;
    }
    /* 반칸이 아니면 한 칸이 별 전체를 덮는다 */
    jd-rating:not([half]) .jd-rating__hit[data-side="full"] {
      inset-inline: 0;
      width: 100%;
    }
    jd-rating[readonly] .jd-rating__hit,
    jd-rating[disabled] .jd-rating__hit {
      cursor: default;
    }

    /* 라디오는 시각적으로만 감춘다 — 포커스 링은 :has로 히트 영역에 그린다 */
    .jd-rating__radio {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }
    .jd-rating__hit:has(.jd-rating__radio:focus-visible) {
      outline: var(--jd-border-medium) solid var(--jd-color-primary);
      outline-offset: 1px;
      border-radius: var(--jd-radius-sm);
    }
  }
`;
