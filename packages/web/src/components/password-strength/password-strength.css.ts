/**
 * jd-password-strength CSS — v2 composites/PasswordStrength의 토큰 번역.
 * v2 값: 세로 gap-2 · 막대 4칸 grid gap-1 h-1.5 rounded-full · 라벨 text-xs w-16 우정렬 ·
 * 체크리스트 text-xs gap-0.5, 통과 success / 미통과 muted.
 *
 * 등급 색은 **채워진 막대 전부**에 현재 등급 색이 적용되는 v2 동작을 그대로 옮겼다
 * (호스트 data-level → 자식 조합자. update()의 클래스 토글 없음 §4.3).
 * 체크리스트 통과 색은 12px 본문이라 라이트 대비 보정(DEC-027 · jd-badge 선례).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-password-strength {
    display: flex; flex-direction: column; gap: var(--jd-space-2);
    width: 100%; box-sizing: border-box;
    font-family: var(--jd-font-sans);
  }

  .jd-password-strength__row {
    display: flex; align-items: center; gap: var(--jd-space-2);
  }

  .jd-password-strength__meter {
    flex: 1; display: grid; grid-template-columns: repeat(4, 1fr);
    gap: var(--jd-space-1);
  }
  .jd-password-strength__bar {
    height: 0.375rem; border-radius: var(--jd-radius-full);
    background: var(--jd-color-border-light); /* v2 bg-surface-soft */
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  /* 채워진 막대는 전부 현재 등급 색 (v2 LEVEL_COLOR[level]) */
  jd-password-strength[data-level="0"] .jd-password-strength__bar[data-on] { background: var(--jd-color-danger); }
  jd-password-strength[data-level="1"] .jd-password-strength__bar[data-on],
  jd-password-strength[data-level="2"] .jd-password-strength__bar[data-on] { background: var(--jd-color-warning); }
  jd-password-strength[data-level="3"] .jd-password-strength__bar[data-on],
  jd-password-strength[data-level="4"] .jd-password-strength__bar[data-on] { background: var(--jd-color-success); }

  .jd-password-strength__label {
    flex-shrink: 0; width: 4rem; text-align: end;
    font-size: var(--jd-text-xs); color: var(--jd-color-muted);
  }
  .jd-password-strength__label[hidden] { display: none; }

  .jd-password-strength__rules {
    display: flex; flex-direction: column; gap: var(--jd-space-0-5);
    margin: 0; padding: 0; list-style: none;
    font-size: var(--jd-text-xs);
  }
  .jd-password-strength__rules[hidden] { display: none; }

  .jd-password-strength__rule {
    display: flex; align-items: center; gap: var(--jd-space-1-5);
    color: var(--jd-color-muted);
  }
  .jd-password-strength__rule[data-ok] { color: color-mix(in srgb, var(--jd-color-success) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward)); }

  .jd-password-strength__mark { flex-shrink: 0; }

  /* 규칙 통과 여부의 비시각 경로 — 색·글리프만으로 전달하지 않는다(WCAG 1.4.1) */
  .jd-password-strength__state {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-password-strength__bar { transition: none; }
  }
}`;
