/**
 * jd-password-input CSS — v2 primitives/PasswordInput의 토큰 번역.
 * 강도 4단 게이지 색: v2 red/orange/blue/green-500 → 의미축이 일치하는
 * danger/warning/info/success 토큰 (DEC-025-1 단서 조항).
 * 미충족 막대·규칙 점은 v2 gray-200/300 → border/muted-light.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-password-input { display: block; width: 100%; }

  .jd-password-input__field { position: relative; display: block; }

  .jd-password-input__input {
    width: 100%; box-sizing: border-box; margin: 0;
    font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    transition: all var(--jd-duration-fast) var(--jd-easing-ease-out);
    height: 2.25rem; font-size: var(--jd-text-sm);
    border-radius: var(--jd-radius-lg);
    padding-inline: var(--jd-space-3) 2.5rem; /* 우측은 토글 버튼 자리 */
  }
  .jd-password-input__input::placeholder { color: var(--jd-color-muted-light); }
  .jd-password-input__input:focus {
    outline: none; border-color: var(--jd-color-primary);
    box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-password-input__input:disabled {
    opacity: var(--jd-opacity-50); cursor: not-allowed;
  }
  jd-password-input[error] .jd-password-input__input { border-color: var(--jd-color-danger); }
  jd-password-input[error] .jd-password-input__input:focus {
    border-color: var(--jd-color-danger); box-shadow: var(--jd-shadow-focus-ring-danger);
  }

  jd-password-input[size="sm"] .jd-password-input__input {
    height: 2rem; font-size: var(--jd-text-xs); border-radius: var(--jd-radius-md);
    padding-inline: var(--jd-space-2-5) 2.25rem;
  }
  jd-password-input[size="lg"] .jd-password-input__input {
    height: 2.75rem; font-size: var(--jd-text-md); border-radius: var(--jd-radius-xl);
    padding-inline: var(--jd-space-4) 2.75rem;
  }

  .jd-password-input__toggle {
    position: absolute; inset-inline-end: var(--jd-space-2-5); top: 50%;
    transform: translateY(-50%);
    display: flex; align-items: center; justify-content: center;
    padding: var(--jd-space-0-5); border: 0; background: none;
    color: var(--jd-color-muted); cursor: pointer;
    transition: color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-password-input__toggle:hover { color: var(--jd-color-foreground); }

  /* ─── 강도 게이지 ─── */
  .jd-password-input__strength {
    display: flex; align-items: center; gap: var(--jd-space-1);
    margin-block-start: var(--jd-space-2);
  }
  .jd-password-input__strength[hidden] { display: none; }
  .jd-password-input__bar {
    flex: 1; height: var(--jd-space-1); border-radius: var(--jd-radius-full);
    background: var(--jd-color-border);
    transition: background var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-password-input__level {
    min-width: 1.75rem; margin-inline-start: var(--jd-space-1-5);
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-semibold);
    font-family: var(--jd-font-sans);
  }
  /* 막대는 그래픽(3:1)이라 원색 그대로, 글자는 텍스트(4.5:1)라 foreground와 섞는다 —
     원색을 그대로 쓰면 warning 3.3:1 · success 3.6:1로 AA 미달(B6 axe 실측 후 소급 교정) */
  .jd-password-input__strength[data-level="weak"] .jd-password-input__bar[data-on] { background: var(--jd-color-danger); }
  .jd-password-input__strength[data-level="weak"] .jd-password-input__level {
    color: color-mix(in srgb, var(--jd-color-danger) 65%, var(--jd-color-foreground));
  }
  .jd-password-input__strength[data-level="fair"] .jd-password-input__bar[data-on] { background: var(--jd-color-warning); }
  .jd-password-input__strength[data-level="fair"] .jd-password-input__level {
    color: color-mix(in srgb, var(--jd-color-warning) 65%, var(--jd-color-foreground));
  }
  .jd-password-input__strength[data-level="good"] .jd-password-input__bar[data-on] { background: var(--jd-color-info); }
  .jd-password-input__strength[data-level="good"] .jd-password-input__level {
    color: color-mix(in srgb, var(--jd-color-info) 65%, var(--jd-color-foreground));
  }
  .jd-password-input__strength[data-level="strong"] .jd-password-input__bar[data-on] { background: var(--jd-color-success); }
  .jd-password-input__strength[data-level="strong"] .jd-password-input__level {
    color: color-mix(in srgb, var(--jd-color-success) 65%, var(--jd-color-foreground));
  }

  /* ─── 규칙 체크리스트 ─── */
  .jd-password-input__rules {
    display: flex; flex-direction: column; gap: var(--jd-space-1);
    margin: var(--jd-space-2) 0 0; padding: 0; list-style: none;
  }
  .jd-password-input__rules[hidden] { display: none; }
  .jd-password-input__rule {
    display: flex; align-items: center; gap: var(--jd-space-1-5);
    font-size: var(--jd-text-xs); font-family: var(--jd-font-sans);
    color: var(--jd-color-muted);
  }
  .jd-password-input__rule[data-passed] {
    color: color-mix(in srgb, var(--jd-color-success) 65%, var(--jd-color-foreground));
  }
  .jd-password-input__rule-icon { display: flex; flex-shrink: 0; color: var(--jd-color-muted-light); }
  /* 아이콘은 그래픽이라 원색 유지 — 글자만 섞은 값 */
  .jd-password-input__rule[data-passed] .jd-password-input__rule-icon { color: var(--jd-color-success); }

  @media (prefers-reduced-motion: reduce) {
    .jd-password-input__input,
    .jd-password-input__toggle,
    .jd-password-input__bar { transition: none; }
  }
}`;
