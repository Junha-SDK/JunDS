/**
 * jd-phone-input CSS — v2 primitives/PhoneInput(테두리 한 덩어리 · 좌측 국가 버튼 ·
 * focus-within 글로우)의 토큰 번역. 네이티브 select는 appearance:none으로 외피를
 * 지우고 v2의 캐럿 SVG를 겹쳐 닫힌 상태 외관을 유지한다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-phone-input {
    display: inline-flex; box-sizing: border-box; overflow: hidden;
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-lg);
  }
  jd-phone-input:focus-within {
    border-color: var(--jd-color-primary); box-shadow: var(--jd-shadow-focus-ring);
  }
  jd-phone-input[error] { border-color: var(--jd-color-danger); }
  jd-phone-input[error]:focus-within { box-shadow: var(--jd-shadow-focus-ring-danger); }
  jd-phone-input[disabled] { opacity: var(--jd-opacity-50); }

  .jd-phone-input__country {
    position: relative; display: inline-flex; align-items: center; flex-shrink: 0;
    border-inline-end: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-phone-input__country:hover { background: var(--jd-color-card-hover); }

  .jd-phone-input__select {
    appearance: none; -webkit-appearance: none;
    height: 2.25rem; margin: 0;
    padding-inline: var(--jd-space-3) var(--jd-space-6);
    border: 0; outline: none; background: transparent; cursor: pointer;
    font-family: var(--jd-font-sans); font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
  }
  .jd-phone-input__select:disabled { cursor: not-allowed; }
  /* 열린 목록은 플랫폼 렌더 — 다크에서 흰 배경으로 뭉개지지 않도록 옵션 색 지정 */
  .jd-phone-input__select option {
    background: var(--jd-color-card); color: var(--jd-color-foreground);
  }

  .jd-phone-input__caret {
    position: absolute; inset-inline-end: var(--jd-space-2); top: 50%;
    transform: translateY(-50%);
    display: flex; pointer-events: none; color: var(--jd-color-muted);
  }

  .jd-phone-input__input {
    flex: 1; min-width: 0; margin: 0; height: 2.25rem;
    padding-inline: var(--jd-space-3);
    border: 0; outline: none; background: transparent;
    font-family: var(--jd-font-sans); font-size: var(--jd-text-sm);
    color: var(--jd-color-foreground); font-variant-numeric: tabular-nums;
  }
  .jd-phone-input__input:disabled { cursor: not-allowed; }

  jd-phone-input[size="sm"] .jd-phone-input__select,
  jd-phone-input[size="sm"] .jd-phone-input__input { height: 2rem; font-size: var(--jd-text-xs); }
  jd-phone-input[size="lg"] .jd-phone-input__select,
  jd-phone-input[size="lg"] .jd-phone-input__input { height: 2.75rem; }
  jd-phone-input[size="lg"] .jd-phone-input__input { font-size: var(--jd-text-md); }
}`;
