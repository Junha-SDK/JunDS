/**
 * jd-form-wizard CSS — v2 patterns/FormWizard의 토큰 번역.
 * 스텝 인디케이터(w-8 h-8 rounded-full · done=success · current=primary · todo=gray-200) ·
 * 연결선 · 헤더 · 콘텐츠 · 이전/다음 버튼(bordered / primary).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-form-wizard { display: block; }
  jd-form-wizard > [slot="step"] { display: block; }
  .jd-form-wizard { width: 100%; }

  /* ── 스텝 인디케이터 ── */
  .jd-form-wizard__stepper {
    display: flex; align-items: center; gap: var(--jd-space-1);
    margin-block-end: var(--jd-space-6);
  }
  .jd-form-wizard__seg { display: flex; align-items: center; gap: var(--jd-space-1); flex: 1; }
  .jd-form-wizard__seg:last-child { flex: 0 0 auto; }

  .jd-form-wizard__step {
    flex-shrink: 0; width: 2rem; height: 2rem; border: 0;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: var(--jd-radius-full);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-sm);
    font-weight: var(--jd-weight-bold);
    background: var(--jd-color-border); color: var(--jd-color-muted);
    transition: background var(--jd-duration-normal) var(--jd-easing-ease-out),
      color var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-form-wizard__step[data-state="done"] {
    /* success 원색(#2f8f57) + #fff = 4.04:1(<4.5) — 배경을 foreground로 20% 눌러 대비 확보(체크 글리프는 white 승계) */
    background: color-mix(in srgb, var(--jd-color-success) 80%, var(--jd-color-foreground));
    color: #fff; cursor: pointer;
  }
  .jd-form-wizard__step[data-state="current"] { background: var(--jd-color-primary); color: #fff; }
  .jd-form-wizard__step:disabled { cursor: default; }
  .jd-form-wizard__step[data-state="done"]:disabled { cursor: pointer; }
  .jd-form-wizard__step:focus-visible {
    outline: var(--jd-border-medium) solid
      color-mix(in srgb, var(--jd-color-primary) 45%, transparent);
    outline-offset: 2px;
  }

  .jd-form-wizard__line {
    flex: 1; height: 2px; border-radius: var(--jd-radius-full);
    background: var(--jd-color-border);
  }
  .jd-form-wizard__line[data-state="done"] { background: var(--jd-color-success); }

  /* ── 헤더 ── */
  .jd-form-wizard__head { margin-block-end: var(--jd-space-4); }
  .jd-form-wizard__title {
    margin: 0; font-family: var(--jd-font-sans); font-size: var(--jd-text-lg);
    font-weight: var(--jd-weight-semibold); color: var(--jd-color-foreground);
  }
  .jd-form-wizard__desc {
    margin: var(--jd-space-0-5) 0 0; font-family: var(--jd-font-sans);
    font-size: var(--jd-text-sm); color: var(--jd-color-muted);
  }
  .jd-form-wizard__desc[hidden] { display: none; }

  /* ── 콘텐츠 ── */
  .jd-form-wizard__content { margin-block-end: var(--jd-space-6); }

  .jd-form-wizard__error {
    margin: 0 0 var(--jd-space-4); font-family: var(--jd-font-sans);
    font-size: var(--jd-text-sm); color: var(--jd-color-danger-ink);
  }
  .jd-form-wizard__error[hidden] { display: none; }

  /* ── 네비게이션 ── */
  .jd-form-wizard__nav { display: flex; align-items: center; justify-content: space-between; }
  .jd-form-wizard__count {
    font-family: var(--jd-font-sans); font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
  }

  .jd-form-wizard__prev, .jd-form-wizard__next {
    padding: var(--jd-space-2) var(--jd-space-4);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-sm);
    font-weight: var(--jd-weight-medium);
    border-radius: var(--jd-radius-lg); cursor: pointer;
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-form-wizard__prev {
    border: var(--jd-border-thin) solid var(--jd-color-border);
    background: transparent; color: var(--jd-color-foreground);
  }
  .jd-form-wizard__prev:hover:not(:disabled) {
    background: color-mix(in srgb, var(--jd-color-muted) 8%, transparent);
  }
  .jd-form-wizard__prev:disabled { opacity: var(--jd-opacity-30); cursor: not-allowed; }
  .jd-form-wizard__next {
    border: 0; background: var(--jd-color-primary); color: #fff;
  }
  .jd-form-wizard__next:hover { background: var(--jd-color-primary-hover); }
  .jd-form-wizard__prev:focus-visible, .jd-form-wizard__next:focus-visible {
    outline: var(--jd-border-medium) solid
      color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-form-wizard__step, .jd-form-wizard__prev, .jd-form-wizard__next { transition: none; }
  }
}`;
