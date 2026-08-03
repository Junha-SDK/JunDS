import { css } from "../../core/styles.js";

/**
 * v2 값: maxWidth 프리셋 sm 640~2xl 1536/full, 기본 xl(1280). 패딩 base 16 → md 24.
 * 헤더 타이포 = Heading level 1(1.5rem→md 1.875rem) + Text sm dimmed.
 * 헤더 행: base 블록 흐름 → md 가로 배치(justify-between), actions는 md에서 mt 제거.
 */
export default css`
  @layer junds.components {
    jd-page {
      display: block;
      box-sizing: border-box; /* width:100%+padding 병용 — 전역 리셋 비의존 (DEC-014-9) */
      width: 100%;
      margin-inline: auto;
      max-width: 1280px;
      padding: var(--jd-space-4);
    }
    jd-page[max-width="sm"] {
      max-width: 640px;
    }
    jd-page[max-width="md"] {
      max-width: 768px;
    }
    jd-page[max-width="lg"] {
      max-width: 1024px;
    }
    jd-page[max-width="2xl"] {
      max-width: 1536px;
    }
    jd-page[max-width="full"] {
      max-width: 100%;
    }

    jd-page-header {
      display: block;
      margin-bottom: var(--jd-space-6);
    }
    .jd-page-header__breadcrumb {
      margin-bottom: var(--jd-space-3);
    }
    .jd-page-header__row {
      display: block;
    }
    .jd-page-header__title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: var(--jd-weight-bold);
      line-height: var(--jd-leading-tight);
      letter-spacing: var(--jd-tracking-tight);
      color: var(--jd-color-foreground);
    }
    .jd-page-header__desc {
      margin: var(--jd-space-1) 0 0;
      font-size: 0.875rem;
      line-height: var(--jd-leading-relaxed);
      color: var(--jd-color-muted);
    }
    .jd-page-header__actions {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      flex-shrink: 0;
      margin-top: var(--jd-space-3);
    }
    .jd-page-header__actions[hidden] {
      display: none;
    }

    jd-page-body {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-4);
    }

    @media (min-width: 768px) {
      jd-page {
        padding: var(--jd-space-6);
      }
      .jd-page-header__row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--jd-space-4);
      }
      .jd-page-header__title {
        font-size: 1.875rem;
      }
      .jd-page-header__actions {
        margin-top: 0;
      }
      jd-page-body {
        gap: var(--jd-space-6);
      }
    }
  }
`;
