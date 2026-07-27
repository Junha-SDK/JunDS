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
    /* DEC-044 톤 레시피 — 팔레트 8종은 앵커만 바꾼다(base.css --jd-tone-*).
       채워진 원이라 배경은 한 단 진한 혼합비를 쓴다. */
    --jd-tone: var(--jd-color-hue-gray); /* 무이름 기본 */
    --jd-tone-ink-mix: 40%; /* 강한 배경 위 xs 이니셜도 양 테마 AA 유지 */
    --jd-tone-face: color-mix(in srgb, var(--jd-tone) var(--jd-tone-lift), #ffffff);
    background: color-mix(in srgb, var(--jd-tone-face) var(--jd-tone-bg-strong-mix), transparent);
    color: color-mix(in srgb, var(--jd-tone) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward));
  }
  .jd-avatar__fallback[data-palette="0"] { --jd-tone: var(--jd-color-hue-violet); }
  .jd-avatar__fallback[data-palette="1"] { --jd-tone: var(--jd-color-hue-blue); }
  .jd-avatar__fallback[data-palette="2"] { --jd-tone: var(--jd-color-hue-green); }
  .jd-avatar__fallback[data-palette="3"] { --jd-tone: var(--jd-color-hue-amber); }
  .jd-avatar__fallback[data-palette="4"] { --jd-tone: var(--jd-color-hue-rose); }
  .jd-avatar__fallback[data-palette="5"] { --jd-tone: var(--jd-color-hue-cyan); }
  .jd-avatar__fallback[data-palette="6"] { --jd-tone: var(--jd-color-hue-purple); }
  .jd-avatar__fallback[data-palette="7"] { --jd-tone: var(--jd-color-hue-teal); }

  .jd-avatar__status {
    position: absolute; bottom: 0; right: 0;
    width: var(--_jd-avatar-dot); height: var(--_jd-avatar-dot);
    border-radius: var(--jd-radius-full);
    /* 링은 아바타에서 점을 떼어 내는 장치라 '흰색'이 아니라 '그 자리의 면'이다 */
    border: var(--_jd-avatar-ring) solid var(--jd-color-card);
    background: var(--jd-color-neutral-400);
  }
  jd-avatar[status="online"] .jd-avatar__status { background: var(--jd-color-success); }
  jd-avatar[status="away"] .jd-avatar__status { background: var(--jd-color-warning); }
  jd-avatar[status="busy"] .jd-avatar__status { background: var(--jd-color-danger); }
}`;
