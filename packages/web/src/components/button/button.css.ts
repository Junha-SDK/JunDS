/**
 * jd-button 컴포넌트 CSS (03-web-arch §4.3 규약).
 * v2 ds/primitives/Button의 variant 6종(primary/secondary/danger/ghost/outline/link)
 * × size 4종(xs/sm/md/lg) 시각을 --jd-* 토큰으로 의미 번역(Tailwind 기계 이식 금지).
 * variant/size 분기는 호스트 속성 셀렉터 → 자식 조합자 — update()의 클래스 토글 없음.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-button { display: inline-flex; }
  jd-button[full-width] { display: flex; }
  jd-button[full-width] > .jd-button { width: 100%; }

  /* 기본값(variant=primary·size=md)은 base에 — 디폴트는 attribute로 반영되지
     않으므로(§1.3 reflect는 set 시점) 호스트 속성 셀렉터는 비기본값만 담당한다.
     §4.3 정본 스케치와 동형. */
  .jd-button {
    display: inline-flex; align-items: center; justify-content: center;
    border: 0; margin: 0;
    font-family: var(--jd-font-sans); font-weight: var(--jd-weight-semibold);
    line-height: var(--jd-leading-none);
    cursor: pointer; user-select: none; white-space: nowrap;
    transition: all var(--jd-duration-normal) var(--jd-easing-ease-out);
    /* size 기본 md — v2: 36px */
    height: 2.25rem; padding-inline: var(--jd-space-4); gap: var(--jd-space-2);
    font-size: var(--jd-text-md); border-radius: var(--jd-radius-xl);
    /* variant 기본 primary */
    background: var(--jd-color-primary); color: #fff;
    box-shadow: 0 1px 2px rgba(0,0,0,.1), inset 0 1px 0 rgba(255,255,255,.15);
  }
  .jd-button:hover {
    box-shadow: 0 4px 12px var(--jd-color-primary-glow), 0 1px 2px rgba(0,0,0,.1);
    filter: brightness(1.1);
  }
  .jd-button:active {
    filter: brightness(.95); box-shadow: 0 1px 1px rgba(0,0,0,.1); scale: .98;
  }
  .jd-button:disabled { opacity: var(--jd-opacity-40); pointer-events: none; box-shadow: none; }
  .jd-button:focus-visible {
    outline: var(--jd-border-medium) solid
      color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
    outline-offset: 2px;
  }

  /* size — v2: xs 28px / sm 32px / lg 44px (md는 base) */
  jd-button[size="xs"] > .jd-button {
    height: 1.75rem; padding-inline: var(--jd-space-2-5); gap: var(--jd-space-1);
    font-size: var(--jd-text-xs); border-radius: var(--jd-radius-lg);
  }
  jd-button[size="sm"] > .jd-button {
    height: 2rem; padding-inline: var(--jd-space-3-5); gap: var(--jd-space-1-5);
    font-size: var(--jd-text-xs); border-radius: var(--jd-radius-lg);
  }
  jd-button[size="lg"] > .jd-button {
    height: 2.75rem; padding-inline: var(--jd-space-6); gap: var(--jd-space-2-5);
    font-size: var(--jd-text-lg); border-radius: var(--jd-radius-xl);
  }

  /* 비기본 variant — primary의 배경·그림자·필터를 각자 재정의한다 */
  /* secondary */
  jd-button[variant="secondary"] > .jd-button {
    background: var(--jd-color-card); color: var(--jd-color-foreground);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    box-shadow: var(--jd-shadow-xs); filter: none;
  }
  jd-button[variant="secondary"] > .jd-button:hover {
    background: var(--jd-color-card-hover);
    border-color: color-mix(in srgb, var(--jd-color-border) 70%, var(--jd-color-muted-light));
    box-shadow: 0 2px 8px rgba(0,0,0,.06);
  }
  jd-button[variant="secondary"] > .jd-button:active {
    background: var(--jd-color-border-light); box-shadow: none; scale: .98;
  }

  /* danger */
  jd-button[variant="danger"] > .jd-button {
    background: var(--jd-color-danger); color: #fff;
    box-shadow: 0 1px 2px rgba(0,0,0,.1), inset 0 1px 0 rgba(255,255,255,.15);
  }
  jd-button[variant="danger"] > .jd-button:hover {
    box-shadow: 0 4px 12px rgba(220,63,63,.25), 0 1px 2px rgba(0,0,0,.1);
    filter: brightness(1.1);
  }
  jd-button[variant="danger"] > .jd-button:active { filter: brightness(.95); scale: .98; }
  jd-button[variant="danger"] > .jd-button:focus-visible {
    outline-color: color-mix(in srgb, var(--jd-color-danger) 40%, transparent);
  }

  /* ghost — 투명 배경, 호버 시만 배경 */
  jd-button[variant="ghost"] > .jd-button {
    background: transparent; color: var(--jd-color-foreground);
    box-shadow: none; filter: none;
  }
  jd-button[variant="ghost"] > .jd-button:hover {
    background: color-mix(in srgb, var(--jd-color-muted) 10%, transparent);
  }
  jd-button[variant="ghost"] > .jd-button:active {
    background: color-mix(in srgb, var(--jd-color-muted) 16%, transparent); scale: .98;
  }

  /* outline */
  jd-button[variant="outline"] > .jd-button {
    background: transparent; color: var(--jd-color-foreground);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    box-shadow: none; filter: none;
  }
  jd-button[variant="outline"] > .jd-button:hover {
    background: color-mix(in srgb, var(--jd-color-muted) 6%, transparent);
    border-color: color-mix(in srgb, var(--jd-color-border) 70%, var(--jd-color-muted-light));
  }
  jd-button[variant="outline"] > .jd-button:active {
    background: color-mix(in srgb, var(--jd-color-muted) 12%, transparent); scale: .98;
  }

  /* link — 패딩/높이 없음 */
  jd-button[variant="link"] > .jd-button {
    background: transparent; box-shadow: none; filter: none;
    height: auto; padding: 0; color: var(--jd-color-primary);
    text-underline-offset: 2px;
    text-decoration-color: color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
  }
  jd-button[variant="link"] > .jd-button:hover {
    text-decoration-line: underline;
    text-decoration-color: var(--jd-color-primary);
  }
  jd-button[variant="link"] > .jd-button:active { scale: none; }

  /* spinner — v2: xs 12px / sm 14px / md·lg 16px */
  .jd-button__spinner { flex-shrink: 0; width: 16px; height: 16px; animation: jd-spin 1s linear infinite; }
  jd-button[size="xs"] .jd-button__spinner { width: 12px; height: 12px; }
  jd-button[size="sm"] .jd-button__spinner { width: 14px; height: 14px; }
  @keyframes jd-spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) {
    .jd-button { transition: none; }
    .jd-button__spinner { animation-duration: 1.6s; }
  }
}`;
