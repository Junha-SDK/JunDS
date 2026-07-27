/**
 * jd-login-form CSS — v2 patterns/LoginForm(max-w-sm 중앙 · 헤더 · 필드 gap-1.5 ·
 * 라벨 + 필수 별표 · Input md · 자동 로그인 · 소셜 · 회원가입 링크 · 보안 안내)의 토큰 번역.
 * 이메일 입력은 jd-text-field[md] 입력 시각을 계승한다(동일 어휘 유지).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-login-form { display: block; }

  .jd-login-form { width: 100%; max-width: 24rem; margin-inline: auto; }

  /* ── 헤더 ── */
  .jd-login-form__header { text-align: center; margin-block-end: var(--jd-space-6); }
  .jd-login-form__logo {
    display: flex; justify-content: center; margin-block-end: var(--jd-space-3);
  }
  .jd-login-form__logo[hidden] { display: none; }
  .jd-login-form__title {
    margin: 0; font-family: var(--jd-font-sans); font-size: var(--jd-text-xl);
    font-weight: var(--jd-weight-bold); color: var(--jd-color-foreground);
  }
  .jd-login-form__subtitle {
    margin: var(--jd-space-1) 0 0; font-family: var(--jd-font-sans);
    font-size: var(--jd-text-sm); color: var(--jd-color-muted);
  }
  .jd-login-form__subtitle[hidden] { display: none; }

  .jd-login-form__alert { display: block; margin-block-end: var(--jd-space-4); }
  .jd-login-form__alert[hidden] { display: none; }

  /* ── 폼 ── */
  .jd-login-form__form { display: flex; flex-direction: column; gap: var(--jd-space-4); }
  .jd-login-form__field { display: flex; flex-direction: column; gap: var(--jd-space-1-5); }
  .jd-login-form__field[hidden] { display: none; }

  .jd-login-form__label {
    font-family: var(--jd-font-sans); font-size: var(--jd-text-sm);
    font-weight: var(--jd-weight-medium); color: var(--jd-color-foreground);
  }
  .jd-login-form__label[data-required]::after {
    content: "*"; margin-inline-start: var(--jd-space-0-5); color: var(--jd-color-danger-ink);
  }
  .jd-login-form__label-row {
    display: flex; align-items: center; justify-content: space-between;
  }

  .jd-login-form__forgot {
    font-family: var(--jd-font-sans); font-size: var(--jd-text-xs);
    color: var(--jd-color-primary-ink); text-decoration: none;
  }
  .jd-login-form__forgot[hidden] { display: none; }
  .jd-login-form__forgot:hover { text-decoration: underline; }

  /* 이메일 입력 — jd-text-field[md] 계승 */
  .jd-login-form__input {
    width: 100%; box-sizing: border-box; margin: 0;
    font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
    background: var(--jd-color-control-surface);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    transition: background-color var(--jd-duration-normal) var(--jd-easing-ease-out),
      border-color var(--jd-duration-normal) var(--jd-easing-ease-out),
      color var(--jd-duration-normal) var(--jd-easing-ease-out),
      box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out),
      opacity var(--jd-duration-normal) var(--jd-easing-ease-out),
      scale var(--jd-duration-normal) var(--jd-easing-ease-out),
      transform var(--jd-duration-normal) var(--jd-easing-ease-out);
    height: 2.5rem; padding-inline: var(--jd-space-3-5);
    font-size: var(--jd-text-md); border-radius: var(--jd-radius-xl);
  }
  .jd-login-form__input::placeholder {
    color: var(--jd-color-neutral-400);
  }
  .jd-login-form__input:focus {
    outline: none; border-color: var(--jd-color-primary);
    background: var(--jd-color-card);
    box-shadow: var(--jd-shadow-focus-ring), var(--jd-shadow-xs);
  }
  .jd-login-form__input[data-error] { border-color: var(--jd-color-danger); }
  .jd-login-form__input[data-error]:focus {
    border-color: var(--jd-color-danger);
    box-shadow: var(--jd-shadow-focus-ring-danger), var(--jd-shadow-xs);
  }

  .jd-login-form__mismatch {
    margin: 0; font-family: var(--jd-font-sans); font-size: var(--jd-text-xs);
    color: var(--jd-color-danger-ink);
  }
  .jd-login-form__mismatch[hidden] { display: none; }

  .jd-login-form__remember-row {
    display: flex; align-items: center; justify-content: space-between;
  }

  /* ── 소셜 ── */
  .jd-login-form__social { display: flex; flex-direction: column; gap: var(--jd-space-2); }
  .jd-login-form__social[hidden] { display: none; }
  .jd-login-form__social-list { display: flex; flex-direction: column; gap: var(--jd-space-2); }

  /* ── 회원가입 링크 ── */
  .jd-login-form__signup {
    margin: 0; text-align: center; font-family: var(--jd-font-sans);
    font-size: var(--jd-text-sm); color: var(--jd-color-muted);
  }
  .jd-login-form__signup[hidden] { display: none; }
  .jd-login-form__signup-link {
    color: var(--jd-color-primary-ink);
    font-weight: var(--jd-weight-medium);
    text-decoration: none;
  }
  .jd-login-form__signup-link:hover { text-decoration: underline; }

  /* ── 보안 안내 ── */
  .jd-login-form__notice {
    margin-block-start: var(--jd-space-6);
    display: flex; align-items: center; justify-content: center; gap: var(--jd-space-1-5);
    font-family: var(--jd-font-sans); font-size: 0.625rem; color: var(--jd-color-muted);
  }
  .jd-login-form__notice > svg { flex-shrink: 0; }

  @media (prefers-reduced-motion: reduce) {
    .jd-login-form__input { transition: none; }
  }
}`;
