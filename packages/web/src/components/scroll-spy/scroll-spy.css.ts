/**
 * jd-scroll-spy CSS — v2 composites/ScrollSpy(flex-col gap-1 · px-3 py-1.5 text-sm
 * rounded-md · border-l-2 · 활성 primary + primary/5 배경)의 의미 번역.
 *
 * v2 `hover:bg-gray-50`은 라이트 전용 리터럴이라 다크에서 흰 판이 됐다 —
 * --jd-color-card-hover로 근사 번역한다(KeyCap surface-soft 선례 · DEC-025-4).
 * `<ul>` 기본 목록 표식·패딩은 컴포넌트가 직접 지운다(리셋 의존 금지).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-scroll-spy {
    display: block; box-sizing: border-box;
    font-family: var(--jd-font-sans); font-size: var(--jd-text-md);
  }
  jd-scroll-spy[data-empty] { display: none; }

  .jd-scroll-spy__list {
    display: flex; flex-direction: column; gap: var(--jd-space-1);
    margin: 0; padding: 0; list-style: none;
  }

  .jd-scroll-spy__row {
    display: flex; min-width: 0;
    /* 들여쓰기 단계 × 12px — v2 (level - minLevel) * 12 동형 */
    padding-inline-start: calc(var(--jd-scroll-spy-depth, 0) * 12px);
  }

  .jd-scroll-spy__item {
    flex: 1; min-width: 0;
    display: block; box-sizing: border-box; text-align: start; text-decoration: none;
    padding-block: var(--jd-space-1-5);
    padding-inline: var(--jd-space-3);
    border-radius: var(--jd-radius-md);
    border-inline-start: var(--jd-border-medium) solid transparent;
    color: var(--jd-color-muted);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    transition:
      color var(--jd-duration-normal) var(--jd-easing-ease-out),
      border-color var(--jd-duration-normal) var(--jd-easing-ease-out),
      background-color var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  .jd-scroll-spy__item:hover {
    color: var(--jd-color-foreground);
    background: var(--jd-color-card-hover);
  }
  .jd-scroll-spy__item:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-scroll-spy__item[aria-current] {
    border-inline-start-color: var(--jd-color-primary);
    color: var(--jd-color-primary-ink);
    font-weight: var(--jd-weight-medium);
    background: color-mix(in srgb, var(--jd-color-primary) 5%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-scroll-spy__item { transition: none; }
  }
}`;
