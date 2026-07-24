/**
 * jd-chat-bubble CSS — v2 composites/ChatBubble(최대폭 80% · gap-2 · 아바타 하단 정렬 ·
 * px-3.5/py-2 · rounded-2xl + 꼬리쪽만 rounded-sm · 10px 보조 텍스트)의 토큰 번역.
 *
 * v2 `bg-gray-100`은 라이트 전용 리터럴이라 다크에서 눈이 부신다. 배경을 카드 위에
 * muted를 섞은 값으로 옮기면(라이트 ≈ #eeedf1로 v2와 사실상 동일, 다크는 카드보다
 * 한 단 뜬 면) 한 규칙이 양쪽 테마에서 함께 산다 — code.css.ts의 색 번역과 같은 방침.
 * side/variant 분기는 전부 호스트 속성 셀렉터다(§4.3).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-chat-bubble {
    display: flex; gap: var(--jd-space-2);
    max-inline-size: 80%;
    font-family: var(--jd-font-sans);
  }
  jd-chat-bubble[side="right"] {
    margin-inline-start: auto; flex-direction: row-reverse;
  }

  .jd-chat-bubble__avatar { flex-shrink: 0; margin-block-start: auto; }
  .jd-chat-bubble__avatar[hidden] { display: none; }

  .jd-chat-bubble__main { min-inline-size: 0; }

  .jd-chat-bubble__sender,
  .jd-chat-bubble__time {
    display: block; margin: 0;
    padding-inline: var(--jd-space-1);
    font-size: 10px; line-height: var(--jd-leading-normal);
    color: var(--jd-color-muted);
  }
  .jd-chat-bubble__sender { margin-block-end: var(--jd-space-0-5); }
  .jd-chat-bubble__time { margin-block-start: var(--jd-space-0-5); }
  .jd-chat-bubble__sender[hidden], .jd-chat-bubble__time[hidden] { display: none; }
  jd-chat-bubble[side="right"] .jd-chat-bubble__sender,
  jd-chat-bubble[side="right"] .jd-chat-bubble__time { text-align: end; }

  .jd-chat-bubble__bubble {
    padding: var(--jd-space-2) var(--jd-space-3-5);
    border-radius: var(--jd-radius-2xl);
    font-size: var(--jd-text-md); line-height: var(--jd-leading-relaxed);
    overflow-wrap: anywhere;
    background: color-mix(in srgb, var(--jd-color-muted) 14%, var(--jd-color-card));
    color: var(--jd-color-foreground);
    /* 꼬리 — 기본(left)은 좌하단, right는 우하단만 각진다 */
    border-end-start-radius: var(--jd-radius-sm);
  }
  jd-chat-bubble[side="right"] .jd-chat-bubble__bubble {
    border-end-start-radius: var(--jd-radius-2xl);
    border-end-end-radius: var(--jd-radius-sm);
  }
  jd-chat-bubble[variant="primary"] .jd-chat-bubble__bubble {
    background: var(--jd-color-primary); color: #fff;
  }
}`;
