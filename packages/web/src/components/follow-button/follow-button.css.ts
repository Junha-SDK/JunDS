/**
 * jd-follow-button CSS — v2 primitives/FollowButton(미팔로우=primary 채움 ·
 * 팔로잉=테두리 · 팔로잉 호버=rose 테두리)의 토큰 번역.
 * 라벨 3종이 DOM에 다 있고 상태·호버로 하나만 보인다(JS 상태 없음).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-follow-button { display: inline-flex; }

  .jd-follow-button {
    display: inline-flex; align-items: center; justify-content: center;
    box-sizing: border-box; border: 0; cursor: pointer; user-select: none;
    font-family: var(--jd-font-sans); font-weight: var(--jd-weight-semibold);
    border-radius: var(--jd-radius-full);
    background: var(--jd-color-primary); color: #ffffff;
    transition: filter var(--jd-duration-fast) var(--jd-easing-ease-out),
                border-color var(--jd-duration-fast) var(--jd-easing-ease-out),
                color var(--jd-duration-fast) var(--jd-easing-ease-out);
    /* size 기본 md */
    height: 2.25rem; padding-inline: var(--jd-space-4); font-size: var(--jd-text-sm);
  }
  .jd-follow-button:hover:not(:disabled) { filter: brightness(1.1); }
  .jd-follow-button:active:not(:disabled) { transform: scale(0.98); }
  .jd-follow-button:disabled { opacity: var(--jd-opacity-50); cursor: not-allowed; }
  .jd-follow-button:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  jd-follow-button[size="sm"] .jd-follow-button {
    height: 1.75rem; padding-inline: var(--jd-space-3); font-size: var(--jd-text-xs);
  }
  jd-follow-button[size="lg"] .jd-follow-button {
    height: 2.75rem; padding-inline: var(--jd-space-5); font-size: var(--jd-text-md);
  }

  /* 라벨 선택 — 기본은 "팔로우"만 */
  .jd-follow-button__following,
  .jd-follow-button__unfollow { display: none; }

  jd-follow-button[following] .jd-follow-button {
    background: transparent; color: var(--jd-color-foreground);
    border: var(--jd-border-thin) solid var(--jd-color-border);
  }
  jd-follow-button[following] .jd-follow-button:hover:not(:disabled) { filter: none; }
  jd-follow-button[following] .jd-follow-button__follow { display: none; }
  jd-follow-button[following] .jd-follow-button__following { display: inline; }

  /* 팔로잉 + 호버/포커스 → 언팔로우 강조 (v2 rose-500) */
  /* 테두리는 그래픽이라 rose 원색, 글자는 텍스트라 foreground와 섞는다(AA — DEC-030-7).
     호버에서만 보이는 상태라 axe 정지 감사에는 잡히지 않는다 — 같은 처방을 선제 적용. */
  jd-follow-button[following]:not([no-unfollow-hover]) .jd-follow-button:hover:not(:disabled),
  jd-follow-button[following]:not([no-unfollow-hover]) .jd-follow-button:focus-visible {
    border-color: #f43f5e;
    color: color-mix(in srgb, #f43f5e 65%, var(--jd-color-foreground));
  }
  jd-follow-button[following]:not([no-unfollow-hover]) .jd-follow-button:hover:not(:disabled) .jd-follow-button__following,
  jd-follow-button[following]:not([no-unfollow-hover]) .jd-follow-button:focus-visible .jd-follow-button__following { display: none; }
  jd-follow-button[following]:not([no-unfollow-hover]) .jd-follow-button:hover:not(:disabled) .jd-follow-button__unfollow,
  jd-follow-button[following]:not([no-unfollow-hover]) .jd-follow-button:focus-visible .jd-follow-button__unfollow { display: inline; }

  @media (prefers-reduced-motion: reduce) {
    .jd-follow-button { transition: none; }
    .jd-follow-button:active:not(:disabled) { transform: none; }
  }
}`;
