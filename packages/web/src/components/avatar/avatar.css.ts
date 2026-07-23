import { css } from "../../core/styles.js";

/**
 * v2 값: size xs 24 / sm 32 / md 36 / lg 44 / xl 56, 이니셜 팔레트 8종
 * (violet·blue·emerald·amber·rose·cyan·purple·teal 100/700 — Tailwind 리터럴 승계),
 * status 점 우하단(green/gray/yellow/red 500) + 화이트 링.
 */
export default css`
@layer junds.components {
  jd-avatar {
    position: relative; display: inline-flex; flex-shrink: 0;
    font-family: var(--jd-font-sans);
    /* size 기본 md — 36px */
    --_jd-avatar-size: 2.25rem; --_jd-avatar-font: var(--jd-text-md);
    --_jd-avatar-dot: 10px; --_jd-avatar-ring: 1.5px;
  }
  jd-avatar[size="xs"] { --_jd-avatar-size: 1.5rem; --_jd-avatar-font: 10px; --_jd-avatar-dot: 6px; --_jd-avatar-ring: 1px; }
  jd-avatar[size="sm"] { --_jd-avatar-size: 2rem; --_jd-avatar-font: var(--jd-text-xs); --_jd-avatar-dot: 8px; --_jd-avatar-ring: 1.5px; }
  jd-avatar[size="lg"] { --_jd-avatar-size: 2.75rem; --_jd-avatar-font: var(--jd-text-lg); --_jd-avatar-dot: 12px; --_jd-avatar-ring: 2px; }
  jd-avatar[size="xl"] { --_jd-avatar-size: 3.5rem; --_jd-avatar-font: var(--jd-text-xl); --_jd-avatar-dot: 14px; --_jd-avatar-ring: 2px; }

  .jd-avatar__img {
    width: var(--_jd-avatar-size); height: var(--_jd-avatar-size);
    border-radius: var(--jd-radius-full); object-fit: cover; display: block;
  }
  .jd-avatar__fallback {
    width: var(--_jd-avatar-size); height: var(--_jd-avatar-size);
    border-radius: var(--jd-radius-full);
    display: flex; align-items: center; justify-content: center;
    font-size: var(--_jd-avatar-font); font-weight: var(--jd-weight-semibold);
    user-select: none;
    background: #e5e7eb; color: #6b7280; /* 무이름 기본 */
  }
  .jd-avatar__fallback[data-palette="0"] { background: #ede9fe; color: #6d28d9; } /* violet */
  .jd-avatar__fallback[data-palette="1"] { background: #dbeafe; color: #1d4ed8; } /* blue */
  .jd-avatar__fallback[data-palette="2"] { background: #d1fae5; color: #047857; } /* emerald */
  .jd-avatar__fallback[data-palette="3"] { background: #fef3c7; color: #b45309; } /* amber */
  .jd-avatar__fallback[data-palette="4"] { background: #ffe4e6; color: #be123c; } /* rose */
  .jd-avatar__fallback[data-palette="5"] { background: #cffafe; color: #0e7490; } /* cyan */
  .jd-avatar__fallback[data-palette="6"] { background: #f3e8ff; color: #7e22ce; } /* purple */
  .jd-avatar__fallback[data-palette="7"] { background: #ccfbf1; color: #0f766e; } /* teal */

  .jd-avatar__status {
    position: absolute; bottom: 0; right: 0;
    width: var(--_jd-avatar-dot); height: var(--_jd-avatar-dot);
    border-radius: var(--jd-radius-full);
    border: var(--_jd-avatar-ring) solid #fff;
    background: #9ca3af;
  }
  jd-avatar[status="online"] .jd-avatar__status { background: #22c55e; }
  jd-avatar[status="away"] .jd-avatar__status { background: #eab308; }
  jd-avatar[status="busy"] .jd-avatar__status { background: #ef4444; }
}`;
