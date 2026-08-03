import { css } from "../../core/styles.js";

/**
 * jd-segmented-pill CSS — v2 finance/SegmentedPill 토큰 번역.
 *
 * 골격 클래스(.jd-tabs__tab/__icon/__label/__badge)는 jd-tabs 상속분을 그대로 쓰고,
 * 여기서는 **호스트 태그로 스코프한 규칙**으로 알약 트랙 외관을 얹는다. jd-tabs의
 * underline 기본(밑줄 border-block-end + margin)은 이 컴포넌트에서 무력화한다.
 * 스코프(jd-segmented-pill .jd-tabs__tab, 특이도 0,1,1)가 jd-tabs의 무스코프 기본
 * (0,1,0)을 항상 이기므로 jd-tabs 쪽으로 누수되지 않는다.
 *
 * v2 값 매핑: 트랙 bg --bm-soft-100 → border-light, border --bm-border → border,
 * 선택 pill bg --bm-card → card + shadow --bm-shadow-sm → shadow-sm + text --bm-text
 * → foreground, 비선택 --bm-muted → muted. 배지 선택 --bm-accent → primary/#fff,
 * 비선택 --bm-soft-200 → muted 18% 틴트. 사이즈는 v2 px 수치(11.5/13/14) 리터럴.
 */
export default css`
  @layer junds.base {
    jd-segmented-pill:not(:defined) {
      display: inline-flex;
    }
  }
  @layer junds.components {
    /* 트랙 — v2: relative inline-flex items-center rounded-full p-1 border */
    jd-segmented-pill {
      position: relative;
      box-sizing: border-box; /* full-width 시 width:100% + padding + border 오버플로 방지 */
      display: inline-flex;
      align-items: center;
      gap: 0;
      padding: var(--jd-space-1);
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-border-light);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      font-family: var(--jd-font-sans);
    }
    jd-segmented-pill[full-width] {
      display: flex;
      width: 100%;
    }

    /* 알약 — underline 잔재 제거 + 알약 기하 */
    jd-segmented-pill .jd-tabs__tab {
      position: relative;
      z-index: 1;
      gap: var(--jd-space-1-5);
      border-block-end: 0;
      margin-block-end: 0;
      border-radius: var(--jd-radius-full);
      font-weight: var(--jd-weight-bold);
      color: var(--jd-color-muted);
      background: transparent;
      transition: color var(--jd-duration-normal) var(--jd-easing-ease-out),
        background var(--jd-duration-normal) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out);
      /* size 기본 md — v2: px-4 py-1.5 text-[13px] */
      padding: var(--jd-space-1-5) var(--jd-space-4);
      font-size: var(--jd-text-sm);
    }
    jd-segmented-pill[full-width] .jd-tabs__tab {
      flex: 1;
    }

    jd-segmented-pill[size="sm"] .jd-tabs__tab {
      padding: var(--jd-space-1) var(--jd-space-3);
      font-size: 0.71875rem; /* v2 11.5px */
    }
    jd-segmented-pill[size="lg"] .jd-tabs__tab {
      padding: var(--jd-space-2) var(--jd-space-5);
      font-size: var(--jd-text-md); /* 14px */
    }

    jd-segmented-pill .jd-tabs__tab:hover:not(:disabled) {
      color: color-mix(in srgb, var(--jd-color-foreground) 75%, transparent);
      background: transparent;
    }
    jd-segmented-pill .jd-tabs__tab[aria-selected="true"] {
      color: var(--jd-color-foreground);
      background: var(--jd-color-card);
      box-shadow: var(--jd-shadow-sm);
      border-block-end: 0;
    }

    /* 카운트 배지 — v2: min-w-18 rounded-full px-1.5 text-[10.5px] font-extrabold */
    jd-segmented-pill .jd-tabs__badge {
      min-width: 18px;
      font-size: 0.65625rem; /* v2 10.5px */
      font-weight: 800;
      background: color-mix(in srgb, var(--jd-color-muted) 18%, transparent);
      color: var(--jd-color-muted);
    }
    jd-segmented-pill .jd-tabs__tab[aria-selected="true"] > .jd-tabs__badge {
      background: var(--jd-color-primary);
      color: #fff;
    }

    @media (prefers-reduced-motion: reduce) {
      jd-segmented-pill .jd-tabs__tab {
        transition: none;
      }
    }
  }
`;
