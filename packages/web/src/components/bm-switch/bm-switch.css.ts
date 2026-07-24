import { css } from "../../core/styles.js";

/**
 * v2 값(기계 번역): 트랙 sm 36×20 / md 44×24 / lg 56×28, 썸 14/18/22px(수직 중앙·left 3px),
 * 이동 16/20/28px. 체크 트랙 = teal 그라디언트, 미체크 = soft-200. 썸 = card 실색 + 그림자.
 *
 * finance 팔레트는 `--jd-fin-*`로 노출한다 — 소비자가 CSS 한 줄로 리브랜딩(§4.4-a).
 * 값이 없는 앱에서도 서던 되도록 v2 ButterMoney 기본색을 폴백으로 박는다.
 */
export default css`
@layer junds.components {
  jd-bm-switch {
    display: inline-flex;
    --_accent: var(--jd-fin-accent, #14b8a6);
    --_accent-2: var(--jd-fin-accent-glow, #5cdcd0);
    --_off: var(--jd-fin-soft-200, #e2e8f0);
    --_thumb: var(--jd-fin-surface, #ffffff);
    --_text: var(--jd-fin-text, var(--jd-color-foreground));
  }

  .jd-bm-switch {
    display: inline-flex; align-items: center; gap: var(--jd-space-2);
    cursor: pointer; user-select: none; font-family: var(--jd-font-sans);
  }
  jd-bm-switch[disabled] > .jd-bm-switch { cursor: not-allowed; opacity: var(--jd-opacity-50); }

  .jd-bm-switch__track {
    position: relative; display: inline-flex; flex-shrink: 0;
    border: 0; margin: 0; padding: 0; cursor: inherit;
    width: 44px; height: 24px; /* md 기본 */
    border-radius: var(--jd-radius-full);
    background: var(--_off);
    box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.08);
    transition:
      background var(--jd-duration-normal, 200ms) var(--jd-easing-ease-out),
      box-shadow var(--jd-duration-normal, 200ms) var(--jd-easing-ease-out);
  }
  jd-bm-switch[checked] .jd-bm-switch__track {
    background: linear-gradient(135deg, var(--_accent) 0%, var(--_accent-2) 100%);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
  }
  .jd-bm-switch__track:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--_accent) 55%, transparent);
    outline-offset: 2px;
  }

  .jd-bm-switch__thumb {
    position: absolute; top: 50%; left: 3px;
    width: 18px; height: 18px; /* md 기본 */
    border-radius: var(--jd-radius-full);
    background: var(--_thumb);
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.18), 0 2px 4px rgba(15, 23, 42, 0.06);
    transform: translateY(-50%) translateX(0);
    transition: transform var(--jd-duration-normal, 200ms) var(--jd-easing-ease-out);
  }
  jd-bm-switch[checked] .jd-bm-switch__thumb { transform: translateY(-50%) translateX(20px); }

  /* sm 36×20 / 썸 14 / 이동 16 */
  jd-bm-switch[size="sm"] .jd-bm-switch__track { width: 36px; height: 20px; }
  jd-bm-switch[size="sm"] .jd-bm-switch__thumb { width: 14px; height: 14px; }
  jd-bm-switch[size="sm"][checked] .jd-bm-switch__thumb { transform: translateY(-50%) translateX(16px); }

  /* lg 56×28 / 썸 22 / 이동 28 */
  jd-bm-switch[size="lg"] .jd-bm-switch__track { width: 56px; height: 28px; }
  jd-bm-switch[size="lg"] .jd-bm-switch__thumb { width: 22px; height: 22px; }
  jd-bm-switch[size="lg"][checked] .jd-bm-switch__thumb { transform: translateY(-50%) translateX(28px); }

  .jd-bm-switch__text {
    font-size: 13px; font-weight: var(--jd-weight-semibold); color: var(--_text);
  }
  .jd-bm-switch__text[hidden] { display: none; }

  @media (prefers-reduced-motion: reduce) {
    .jd-bm-switch__track, .jd-bm-switch__thumb { transition: none; }
  }
}`;
