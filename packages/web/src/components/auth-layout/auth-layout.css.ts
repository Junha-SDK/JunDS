/**
 * jd-auth-layout CSS — v2 patterns/AuthLayout(centered/split/branded)의 토큰 번역.
 * 단일 골격 + [variant] 속성 훅으로 세 레이아웃을 CSS만으로 전환한다.
 * 카드 시각(rounded-xl · border · bg-surface · shadow-sm · p-6 sm:p-8)은 variant 불변.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-auth-layout {
    display: grid;
    grid-template-columns: 1fr;
    min-height: 100dvh;
  }

  /* 브랜드 패널 — 기본 숨김. split/branded만 노출 */
  .jd-auth-layout__brand { display: none; }
  .jd-auth-layout__brand-inner { max-width: 28rem; }
  .jd-auth-layout__brand-title {
    font-family: var(--jd-font-sans); font-size: var(--jd-text-3xl);
    font-weight: var(--jd-weight-bold); margin-block-end: var(--jd-space-3);
  }
  .jd-auth-layout__brand-text {
    margin: 0; font-family: var(--jd-font-sans); font-size: var(--jd-text-md);
    /* 브랜드 패널 배경은 항상 primary(#5b4cc7) — v2 text-white/80 승계. #fff on primary = 6.4:1 */
    color: color-mix(in srgb, #fff 80%, transparent);
  }

  .jd-auth-layout__main {
    display: flex; align-items: center; justify-content: center;
    padding: var(--jd-space-10) var(--jd-space-4);
    background: var(--jd-color-background);
  }

  .jd-auth-layout__wrap { width: 100%; max-width: 28rem; margin-inline: auto; }

  .jd-auth-layout__logo {
    display: flex; justify-content: center; margin-block-end: var(--jd-space-6);
  }
  .jd-auth-layout__logo[hidden] { display: none; }

  .jd-auth-layout__card {
    border: var(--jd-border-thin) solid var(--jd-color-border);
    background: var(--jd-color-surface);
    border-radius: var(--jd-radius-xl);
    box-shadow: var(--jd-shadow-sm);
    padding: var(--jd-space-6);
  }
  @media (min-width: 40rem) {
    .jd-auth-layout__card { padding: var(--jd-space-8); }
  }

  .jd-auth-layout__header { margin-block-end: var(--jd-space-6); text-align: center; }
  .jd-auth-layout__header[hidden] { display: none; }
  .jd-auth-layout__title {
    margin: 0; font-family: var(--jd-font-sans); font-size: var(--jd-text-xl);
    font-weight: var(--jd-weight-semibold); color: var(--jd-color-foreground);
  }
  .jd-auth-layout__title[hidden] { display: none; }
  @media (min-width: 40rem) {
    .jd-auth-layout__title { font-size: var(--jd-text-2xl); }
  }
  .jd-auth-layout__subtitle {
    margin: var(--jd-space-1) 0 0; font-family: var(--jd-font-sans);
    font-size: var(--jd-text-sm); color: var(--jd-color-muted);
  }
  .jd-auth-layout__subtitle[hidden] { display: none; }

  .jd-auth-layout__footer {
    margin-block-start: var(--jd-space-6); padding-block-start: var(--jd-space-4);
    border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
    text-align: center; font-family: var(--jd-font-sans);
    font-size: var(--jd-text-sm); color: var(--jd-color-muted);
  }

  .jd-auth-layout__page-footer {
    margin-block-start: var(--jd-space-6); text-align: center;
    font-family: var(--jd-font-sans); font-size: var(--jd-text-xs);
    color: var(--jd-color-muted);
  }

  /* branded — 카드 뒤로 primary 그라디언트 (v2 from-primary to-primary-hover) */
  jd-auth-layout[variant="branded"] .jd-auth-layout__main {
    background: linear-gradient(135deg, var(--jd-color-primary), var(--jd-color-primary-hover));
  }

  /* split — 데스크톱(lg=64rem)에서만 좌측 브랜드 패널 노출 */
  jd-auth-layout[variant="split"] .jd-auth-layout__brand {
    align-items: center; justify-content: center;
    padding: var(--jd-space-10);
    /* v2 branded 브랜드 패널 text-white 승계 — #fff on primary(#5b4cc7) = 6.4:1 */
    background: var(--jd-color-primary); color: #fff;
  }
  @media (min-width: 64rem) {
    jd-auth-layout[variant="split"] {
      grid-template-columns: 1fr 1fr;
    }
    jd-auth-layout[variant="split"] .jd-auth-layout__brand { display: flex; }
  }
}`;
