import { css } from "../../core/styles.js";

/**
 * v2 매핑: bg-surface + border rounded-xl flex-col, 스크롤 영역 flex-1 overflow-y p-4 space-y-3,
 * 그룹 flex gap-2(mine=flex-row-reverse), 아바타 32px, 버블 rounded-2xl(mine=primary/white,
 * 상대=surface-soft), max-w 70%, 타이핑 점 pulse, composer border-t.
 *
 * ⚠️ v2의 `surface`는 카드색이었다. v3 --jd-color-surface(#161329)는 라이트에서도 어두운
 * 크롬(코드블록·다이어그램 캔버스)용이라, 스레드에 그대로 쓰면 라이트 모드에서 검은 판 위에
 * 모드추종 잉크(--jd-color-foreground)가 얹혀 상대 말풍선 글자가 사라진다(실측).
 * 채팅 스레드는 크롬이 아니라 **앱의 본문**이므로 card 가 맞다 — VISUAL-BAR §4.
 * 상대 버블의 "한 톤 뜬 면"은 jd-chat-bubble 시트와 같은 어법(muted를 카드에 섞기)으로 얻는다.
 */
export default css`
  @layer junds.components {
    jd-chat-thread {
      display: flex;
      flex-direction: column;
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      overflow: hidden;
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
      min-height: 0;
    }

    .jd-chat-thread__scroll {
      flex: 1;
      overflow-y: auto;
      /* 스레드 안에서 끝난 스크롤이 호스트 페이지를 이어서 밀지 않게 한다 */
      overscroll-behavior-y: contain;
      scrollbar-width: thin;
      padding: var(--jd-space-4);
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-3);
    }
    .jd-chat-thread__groups {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-3);
    }

    .jd-chat-thread__group {
      display: flex;
      gap: var(--jd-space-2);
    }
    .jd-chat-thread__group[data-mine] {
      flex-direction: row-reverse;
    }

    .jd-chat-thread__avatar {
      flex-shrink: 0;
      width: 2rem;
      height: 2rem;
      border-radius: var(--jd-radius-full);
      overflow: hidden;
    }
    .jd-chat-thread__avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .jd-chat-thread__avatar--ph {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: color-mix(in srgb, var(--jd-color-primary) 15%, transparent);
      color: var(--jd-color-primary-ink);
      font-size: var(--jd-text-xs);
      font-weight: var(--jd-weight-semibold);
    }

    .jd-chat-thread__col {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-1);
      min-width: 0;
      max-width: 70%;
    }
    .jd-chat-thread__group[data-mine] .jd-chat-thread__col {
      align-items: flex-end;
    }
    .jd-chat-thread__name {
      margin: 0 0 0 var(--jd-space-1);
      font-size: var(--jd-text-2xs);
      color: var(--jd-color-muted);
    }

    .jd-chat-thread__row {
      display: flex;
      align-items: flex-end;
      gap: var(--jd-space-1-5);
    }

    /* 버블은 클릭 가능한 <button> 이다 — hover/active/focus 3종을 모두 가진다(§1) */
    .jd-chat-thread__bubble {
      padding: var(--jd-space-2) var(--jd-space-3);
      border-radius: var(--jd-radius-2xl);
      font-size: var(--jd-text-sm);
      text-align: left;
      border: 0;
      cursor: pointer;
      background: color-mix(in srgb, var(--jd-color-muted) 14%, var(--jd-color-card));
      color: var(--jd-color-foreground);
      max-width: 100%;
      box-shadow: var(--jd-shadow-xs);
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-chat-thread__bubble:hover {
      background: color-mix(in srgb, var(--jd-color-muted) 22%, var(--jd-color-card));
    }
    .jd-chat-thread__bubble:active {
      scale: 0.97;
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-chat-thread__group:not([data-mine]) .jd-chat-thread__bubble {
      border-bottom-left-radius: var(--jd-radius-md);
    }
    .jd-chat-thread__group[data-mine] .jd-chat-thread__bubble {
      background: var(--jd-color-primary);
      color: #fff;
      border-bottom-right-radius: var(--jd-radius-md);
      /* 채움만 있는 면은 색종이로 읽힌다 — 위에서 받는 빛을 함께 준다(§2) */
      box-shadow: var(--jd-shadow-xs), inset 0 1px 0 var(--jd-color-highlight);
    }
    .jd-chat-thread__group[data-mine] .jd-chat-thread__bubble:hover {
      background: var(--jd-color-primary-hover);
    }
    .jd-chat-thread__group[data-mine] .jd-chat-thread__bubble:active {
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    .jd-chat-thread__bubble[data-failed] {
      opacity: var(--jd-opacity-60);
    }
    .jd-chat-thread__bubble:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }
    .jd-chat-thread__text {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    .jd-chat-thread__attachment {
      display: block;
      margin-top: var(--jd-space-2);
      max-width: 100%;
      border-radius: var(--jd-radius-lg);
    }

    /* 10px는 §9 하한(11px) 아래다 — 시각 하한 토큰으로 올린다 */
    .jd-chat-thread__status,
    .jd-chat-thread__time {
      flex-shrink: 0;
      font-size: var(--jd-text-2xs);
      color: var(--jd-color-muted);
      margin-bottom: var(--jd-space-0-5);
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
    .jd-chat-thread__status {
      display: inline-flex;
      align-items: center;
      gap: var(--jd-space-1);
    }
    .jd-chat-thread__retry {
      border: 0;
      background: transparent;
      cursor: pointer;
      padding: 0;
      color: var(--jd-color-danger);
      font-size: var(--jd-text-2xs);
      border-radius: var(--jd-radius-sm);
      transition: scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    .jd-chat-thread__retry:hover {
      text-decoration: underline;
    }
    .jd-chat-thread__retry:active {
      scale: 0.97;
    }
    .jd-chat-thread__retry:focus-visible {
      outline: var(--jd-focus-ring-danger);
      outline-offset: var(--jd-focus-ring-offset);
    }

    .jd-chat-thread__typing {
      display: flex;
      align-items: center;
      gap: var(--jd-space-2);
      padding-left: var(--jd-space-1);
    }
    .jd-chat-thread__typing[hidden] {
      display: none;
    }
    .jd-chat-thread__typing-dots {
      display: inline-flex;
      gap: var(--jd-space-1);
      padding: var(--jd-space-2) var(--jd-space-3);
      border-radius: var(--jd-radius-2xl);
      background: color-mix(in srgb, var(--jd-color-muted) 14%, var(--jd-color-card));
    }
    .jd-chat-thread__typing-dots i {
      width: 6px;
      height: 6px;
      border-radius: var(--jd-radius-full);
      background: var(--jd-color-muted);
      animation: jd-chat-typing 1.2s infinite;
    }
    .jd-chat-thread__typing-dots i:nth-child(2) {
      animation-delay: 0.15s;
    }
    .jd-chat-thread__typing-dots i:nth-child(3) {
      animation-delay: 0.3s;
    }
    .jd-chat-thread__typing-text {
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
    }
    @keyframes jd-chat-typing {
      0%,
      60%,
      100% {
        opacity: 0.3;
      }
      30% {
        opacity: 1;
      }
    }

    .jd-chat-thread__composer:empty {
      display: none;
    }
    .jd-chat-thread__composer {
      border-top: var(--jd-border-thin) solid var(--jd-color-border);
      background: var(--jd-color-card);
      padding: var(--jd-space-2) var(--jd-space-3);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-chat-thread__bubble,
      .jd-chat-thread__retry {
        transition: none;
      }
      .jd-chat-thread__typing-dots i {
        animation: none;
        opacity: var(--jd-opacity-60);
      }
    }
  }
`;
