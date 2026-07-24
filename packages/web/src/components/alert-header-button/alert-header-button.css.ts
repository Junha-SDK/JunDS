import { css } from "../../core/styles.js";

/**
 * v2 값: size-9(36px) 원형 그리드 센터, 색 var(--bm-muted). 카운트 배지는
 * 우상단 min-w 16px·h 16px 원형, 배경 var(--bm-up)·흰 글자·2px 배경색 링,
 * 9.5px extrabold.
 *
 * 토큰 번역: --bm-muted→--jd-color-muted, --bm-bg(링)→--jd-color-background.
 * 상승색은 앱이 재틴트할 수 있게 --jd-finance-up 폴백 체인으로 둔다(신규 전역
 * 토큰 도입 없이, 기본은 JunDS 시맨틱 success=긍정).
 */
export default css`
@layer junds.components {
  jd-alert-header-button { display: inline-flex; flex-shrink: 0; }
  a.jd-alert-header-button {
    position: relative; display: grid; place-items: center;
    width: 2.25rem; height: 2.25rem; border-radius: var(--jd-radius-full);
    color: var(--jd-color-muted); text-decoration: none; flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-default),
                color var(--jd-duration-fast) var(--jd-easing-default);
  }
  a.jd-alert-header-button:hover { background: color-mix(in srgb, var(--jd-color-muted) 12%, transparent); }
  a.jd-alert-header-button:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-alert-header-button__icon { display: block; }

  .jd-alert-header-button__badge {
    position: absolute; top: 0.125rem; right: 0.125rem;
    min-width: 16px; height: 16px; padding: 0 4px;
    display: grid; place-items: center; border-radius: var(--jd-radius-full);
    background: var(--jd-finance-up, var(--jd-color-success));
    color: #fff; border: 2px solid var(--jd-color-background);
    font-size: 9.5px; font-weight: var(--jd-weight-bold); line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .jd-alert-header-button__badge[hidden] { display: none; }
}`;
