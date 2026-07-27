/**
 * jd-social-share CSS — v2 composites/SocialShare의 토큰 번역.
 * 원본: inline-flex gap-2 flex-wrap · 버튼 sm28/md36/lg44 · circle=rounded-full
 * square=rounded-md · text-white(kakao만 #3C1E1E) · hover:scale-110 · text-xs 글리프.
 * 플랫폼 브랜드 색은 semantic 축이 없어 v2 리터럴 승계(DEC-025-1).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-social-share {
    display: inline-flex; align-items: center; flex-wrap: wrap;
    gap: var(--jd-space-2);
  }

  .jd-social-share__btn {
    flex-shrink: 0;
    display: inline-flex; align-items: center; justify-content: center;
    width: 36px; height: 36px;                 /* md 기본 */
    padding: 0; border: 0; cursor: pointer;
    color: #fff; text-decoration: none;
    font-family: var(--jd-font-sans); font-weight: var(--jd-weight-semibold);
    border-radius: var(--jd-radius-full);       /* circle 기본 */
    transition: transform var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-social-share__btn:hover { transform: scale(1.1); }
  .jd-social-share__btn:focus-visible {
    outline: var(--jd-border-medium) solid var(--jd-color-primary); outline-offset: 2px;
  }

  jd-social-share[size="sm"] .jd-social-share__btn { width: 28px; height: 28px; }
  jd-social-share[size="lg"] .jd-social-share__btn { width: 44px; height: 44px; }
  jd-social-share[shape="square"] .jd-social-share__btn { border-radius: var(--jd-radius-md); }

  .jd-social-share__glyph { font-size: var(--jd-text-xs); line-height: 1; }

  /* 플랫폼 브랜드 색 (v2 COLORS 승계) */
  .jd-social-share__btn[data-platform="twitter"]  { background: #1DA1F2; }
  .jd-social-share__btn[data-platform="facebook"] { background: #1877F2; }
  .jd-social-share__btn[data-platform="linkedin"] { background: #0A66C2; }
  .jd-social-share__btn[data-platform="kakao"]    { background: #FEE500; color: #3C1E1E; }
  .jd-social-share__btn[data-platform="telegram"] { background: #26A5E4; }
  .jd-social-share__btn[data-platform="whatsapp"] { background: #25D366; }
  .jd-social-share__btn[data-platform="email"]    { background: var(--jd-color-neutral-500); }
  .jd-social-share__btn[data-platform="copy"]     { background: var(--jd-color-neutral-400); }

  @media (prefers-reduced-motion: reduce) {
    .jd-social-share__btn { transition: none; }
    .jd-social-share__btn:hover { transform: none; }
  }
}`;
