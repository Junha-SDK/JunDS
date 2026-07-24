import { css } from "../../core/styles.js";

/**
 * jd-security-badge CSS — v2 composites/SecurityBadge.
 *
 * v2 값: `inline-flex items-center font-semibold rounded-full border` +
 * 레벨별 Tailwind 50/200/700(unverified만 gray-50/200/600),
 * 크기 sm `px-1.5 py-0.5 text-[10px] gap-1` · md `px-2 py-1 text-xs gap-1.5` ·
 * lg `px-3 py-1.5 text-sm gap-2`, 아이콘 10/12/14px.
 * 레벨 색은 의미축이 아니라 v2 팔레트 리터럴 승계다(jd-severity-badge 선례).
 */
export default css`
@layer junds.components {
  jd-security-badge {
    display: inline-flex; align-items: center; box-sizing: border-box;
    gap: var(--jd-space-1-5);
    padding: var(--jd-space-1) var(--jd-space-2);
    border: var(--jd-border-thin) solid var(--_jd-sec-border);
    border-radius: var(--jd-radius-full);
    background: var(--_jd-sec-bg); color: var(--_jd-sec-fg);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-xs);
    font-weight: var(--jd-weight-semibold); white-space: nowrap;
    /* unverified 기본 (gray-50 / gray-200 / gray-600) */
    --_jd-sec-bg: #f9fafb; --_jd-sec-border: #e5e7eb; --_jd-sec-fg: #4b5563;
  }
  jd-security-badge[level="critical"] {
    --_jd-sec-bg: #fef2f2; --_jd-sec-border: #fecaca; --_jd-sec-fg: #b91c1c;
  }
  jd-security-badge[level="warning"] {
    --_jd-sec-bg: #fffbeb; --_jd-sec-border: #fde68a; --_jd-sec-fg: #b45309;
  }
  jd-security-badge[level="safe"] {
    --_jd-sec-bg: #f0fdf4; --_jd-sec-border: #bbf7d0; --_jd-sec-fg: #15803d;
  }
  jd-security-badge[level="verified"] {
    --_jd-sec-bg: #eff6ff; --_jd-sec-border: #bfdbfe; --_jd-sec-fg: #1d4ed8;
  }

  jd-security-badge[size="sm"] {
    gap: var(--jd-space-1); padding: var(--jd-space-0-5) var(--jd-space-1-5);
    font-size: 10px;
  }
  jd-security-badge[size="lg"] {
    gap: var(--jd-space-2); padding: var(--jd-space-1-5) var(--jd-space-3);
    font-size: var(--jd-text-sm);
  }

  .jd-security-badge__icon {
    display: inline-flex; flex-shrink: 0;
    width: 12px; height: 12px; /* md 기본 */
  }
  .jd-security-badge__icon[hidden] { display: none; }
  .jd-security-badge__icon > svg { width: 100%; height: 100%; }
  jd-security-badge[size="sm"] .jd-security-badge__icon { width: 10px; height: 10px; }
  jd-security-badge[size="lg"] .jd-security-badge__icon { width: 14px; height: 14px; }

  /* 심각도 보충 낱말 — 화면에는 없고 스크린리더에만 읽힌다 */
  .jd-security-badge__sr {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }
}`;
