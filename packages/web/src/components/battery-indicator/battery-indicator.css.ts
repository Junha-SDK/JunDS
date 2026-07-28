import { css } from "../../core/styles.js";

/**
 * v2 값: body sm 40×16 / md 56×24 / lg 80×32 + 캡, 보더 gray-400(다크 gray-500),
 * 호버 scale 1.05, % 텍스트는 lg만(mix-blend-difference).
 *
 * 채움색은 v2 Tailwind 500 리터럴(green/amber/red/blue)을 승계했었다. 잔량 구간은
 * 이미 **의미**다 — 충분/주의/위험은 success/warning/danger 그 자체이고, 기본 잔량은
 * 경고가 아니라 강조라 primary다. 리터럴 형광 초록(#22c55e)은 팔레트 밖 색이라
 * 같은 화면의 success 뱃지와 다른 초록 두 개가 나란히 서던 결함이었다.
 */
export default css`
  @layer junds.components {
    jd-battery-indicator {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1-5);
      font-family: var(--jd-font-sans);
      transition: transform var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    jd-battery-indicator:hover {
      transform: scale(1.05);
    }

    /* --jd-color-muted가 이미 모드별 값을 갖는다 — 다크 분기가 있으면 토큰이 바뀌어도
     이 컴포넌트만 옛 회색에 묶인다. */
    .jd-battery__label {
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-medium);
      color: var(--jd-color-muted);
    }

    .jd-battery__body {
      position: relative;
      overflow: hidden;
      border: 2px solid var(--jd-color-neutral-400);
      border-radius: var(--jd-radius-sm);
      width: 3.5rem;
      height: 1.5rem; /* md 기본 56×24 */
    }
    [data-jd-theme="dark"] .jd-battery__body,
    [data-theme="dark"] .jd-battery__body {
      border-color: var(--jd-color-neutral-500);
    }
    jd-battery-indicator[size="sm"] .jd-battery__body {
      width: 2.5rem;
      height: 1rem;
    }
    jd-battery-indicator[size="lg"] .jd-battery__body {
      width: 5rem;
      height: 2rem;
    }

    /* 채운 면은 위에서 빛을 받는다 — 인셋 하이라이트가 없으면 색종이로 읽힌다(jd-button 규약) */
    .jd-battery__fill {
      position: absolute;
      inset-block: 0;
      left: 0;
      background: var(--jd-color-primary);
      box-shadow: inset 0 1px 0 var(--jd-color-highlight);
      transition: background-color var(--jd-duration-slower) var(--jd-easing-ease-out),
        border-color var(--jd-duration-slower) var(--jd-easing-ease-out),
        color var(--jd-duration-slower) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-slower) var(--jd-easing-ease-out),
        opacity var(--jd-duration-slower) var(--jd-easing-ease-out),
        scale var(--jd-duration-slower) var(--jd-easing-ease-out),
        transform var(--jd-duration-slower) var(--jd-easing-ease-out);
    }
    jd-battery-indicator[data-fill="success"] .jd-battery__fill {
      background: var(--jd-color-success);
    }
    jd-battery-indicator[data-fill="warning"] .jd-battery__fill {
      background: var(--jd-color-warning);
    }
    jd-battery-indicator[data-fill="danger"] .jd-battery__fill {
      background: var(--jd-color-danger);
    }

    .jd-battery__pct {
      display: none;
      position: absolute;
      inset: 0;
      align-items: center;
      justify-content: center;
      /* 11px 아래로는 내려가지 않는다 — lg(80×32) 안에서 2xs가 넉넉히 들어간다 */
      font-size: var(--jd-text-2xs);
      font-weight: var(--jd-weight-bold);
      /* v2 blend-difference → 흰 글자+다크 헤일로 (axe 대비 실측 가능, DEC-027) */
      color: #fff;
      text-shadow: 0 0 2px rgba(17, 24, 39, 0.95), 0 0 1px rgba(17, 24, 39, 0.95),
        0 1px 2px rgba(17, 24, 39, 0.85);
    }
    jd-battery-indicator[size="lg"] .jd-battery__pct {
      display: flex;
    }

    .jd-battery__cap {
      border-start-end-radius: var(--jd-radius-sm);
      border-end-end-radius: var(--jd-radius-sm);
      background: var(--jd-color-neutral-400);
      width: 6px;
      height: 12px; /* md */
    }
    [data-jd-theme="dark"] .jd-battery__cap,
    [data-theme="dark"] .jd-battery__cap {
      background: var(--jd-color-neutral-500);
    }
    jd-battery-indicator[size="sm"] .jd-battery__cap {
      width: 4px;
      height: 8px;
    }
    jd-battery-indicator[size="lg"] .jd-battery__cap {
      width: 8px;
      height: 16px;
    }

    @media (prefers-reduced-motion: reduce) {
      jd-battery-indicator,
      .jd-battery__fill {
        transition: none;
      }
      jd-battery-indicator:hover {
        transform: none;
      }
    }
  }
`;
