import { css } from "../../core/styles.js";

/**
 * v2 값: 바깥 패딩 px-4/py-5(모바일)→lg:px-6/py-7, 안쪽 mx-auto + maxWidth 상한.
 * 헤더는 flex-col gap-3 → sm:flex-row(제목 flex-1, 액션 우측 고정). 제목 20px→lg:24px
 * extrabold/tracking-tight, 설명 13px muted. Tailwind 리터럴 치수를 --jd-* 토큰으로 번역.
 */
export default css`
@layer junds.components {
  jd-page-shell {
    display: block;
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
    padding-block: var(--jd-space-5);
    padding-inline: var(--jd-space-4);
  }
  @media (min-width: 1024px) {
    jd-page-shell {
      padding-block: 1.75rem; /* py-7 */
      padding-inline: var(--jd-space-6);
    }
  }

  .jd-page-shell__inner {
    margin-inline: auto;
    width: 100%;
  }

  .jd-page-shell__header:not([hidden]) {
    display: flex;
    flex-direction: column;
    gap: var(--jd-space-3);
    margin-block-end: var(--jd-space-5);
  }
  @media (min-width: 640px) {
    .jd-page-shell__header:not([hidden]) {
      flex-direction: row;
      align-items: flex-end;
      justify-content: space-between;
    }
  }

  .jd-page-shell__titles {
    min-width: 0;
    flex: 1 1 auto;
  }
  .jd-page-shell__title:not([hidden]) {
    display: block;
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    line-height: var(--jd-leading-tight);
    letter-spacing: var(--jd-tracking-tight);
  }
  @media (min-width: 1024px) {
    .jd-page-shell__title:not([hidden]) { font-size: 24px; }
  }
  .jd-page-shell__desc:not([hidden]) {
    display: block;
    margin: var(--jd-space-0-5) 0 0;
    font-size: var(--jd-text-sm);
    color: var(--jd-color-muted);
  }

  @media (min-width: 640px) {
    .jd-page-shell__actions { flex-shrink: 0; }
  }
}`;
