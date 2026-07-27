import { css } from "../../core/styles.js";

/**
 * v2 매핑: bg-surface + border rounded-xl flex-col, 스크롤 영역 flex-1 overflow-y p-4 space-y-3,
 * 그룹 flex gap-2(mine=flex-row-reverse), 아바타 32px, 버블 rounded-2xl(mine=primary/white,
 * 상대=surface-soft), max-w 70%, 타이핑 점 pulse, composer border-t.
 */
export default css`
@layer junds.components {
  jd-chat-thread {
    display: flex; flex-direction: column;
    background: var(--jd-color-surface);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl); overflow: hidden;
    font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
    min-height: 0;
  }

  .jd-chat-thread__scroll {
    flex: 1; overflow-y: auto; padding: var(--jd-space-4);
    display: flex; flex-direction: column; gap: var(--jd-space-3);
  }
  .jd-chat-thread__groups { display: flex; flex-direction: column; gap: var(--jd-space-3); }

  .jd-chat-thread__group { display: flex; gap: var(--jd-space-2); }
  .jd-chat-thread__group[data-mine] { flex-direction: row-reverse; }

  .jd-chat-thread__avatar {
    flex-shrink: 0; width: 2rem; height: 2rem; border-radius: var(--jd-radius-full);
    overflow: hidden;
  }
  .jd-chat-thread__avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .jd-chat-thread__avatar--ph {
    display: inline-flex; align-items: center; justify-content: center;
    background: color-mix(in srgb, var(--jd-color-primary) 15%, transparent);
    color: var(--jd-color-primary-ink); font-size: var(--jd-text-xs); font-weight: var(--jd-weight-semibold);
  }

  .jd-chat-thread__col {
    display: flex; flex-direction: column; gap: var(--jd-space-1);
    min-width: 0; max-width: 70%;
  }
  .jd-chat-thread__group[data-mine] .jd-chat-thread__col { align-items: flex-end; }
  .jd-chat-thread__name { margin: 0 0 0 var(--jd-space-1); font-size: 11px; color: var(--jd-color-muted); }

  .jd-chat-thread__row { display: flex; align-items: flex-end; gap: var(--jd-space-1-5); }

  .jd-chat-thread__bubble {
    padding: var(--jd-space-2) var(--jd-space-3);
    border-radius: var(--jd-radius-2xl);
    font-size: var(--jd-text-sm); text-align: left;
    border: 0; cursor: pointer;
    background: var(--jd-color-surface-raised); color: var(--jd-color-foreground);
    max-width: 100%;
  }
  .jd-chat-thread__group:not([data-mine]) .jd-chat-thread__bubble { border-bottom-left-radius: var(--jd-radius-md); }
  .jd-chat-thread__group[data-mine] .jd-chat-thread__bubble {
    background: var(--jd-color-primary); color: #fff; border-bottom-right-radius: var(--jd-radius-md);
  }
  .jd-chat-thread__bubble[data-failed] { opacity: .6; }
  .jd-chat-thread__bubble:focus-visible { outline: 2px solid var(--jd-color-primary); outline-offset: 2px; }
  .jd-chat-thread__text { white-space: pre-wrap; overflow-wrap: anywhere; }
  .jd-chat-thread__attachment {
    display: block; margin-top: var(--jd-space-2); max-width: 100%;
    border-radius: var(--jd-radius-lg);
  }

  .jd-chat-thread__status,
  .jd-chat-thread__time {
    flex-shrink: 0; font-size: 10px; color: var(--jd-color-muted);
    margin-bottom: 2px; white-space: nowrap;
  }
  .jd-chat-thread__status { display: inline-flex; align-items: center; gap: var(--jd-space-1); }
  .jd-chat-thread__retry {
    border: 0; background: transparent; cursor: pointer; padding: 0;
    color: var(--jd-color-danger-ink); font-size: 10px;
  }
  .jd-chat-thread__retry:hover { text-decoration: underline; }

  .jd-chat-thread__typing { display: flex; align-items: center; gap: var(--jd-space-2); padding-left: var(--jd-space-1); }
  .jd-chat-thread__typing[hidden] { display: none; }
  .jd-chat-thread__typing-dots {
    display: inline-flex; gap: var(--jd-space-1);
    padding: var(--jd-space-2) var(--jd-space-3); border-radius: var(--jd-radius-2xl);
    background: var(--jd-color-surface-raised);
  }
  .jd-chat-thread__typing-dots i {
    width: 6px; height: 6px; border-radius: var(--jd-radius-full);
    background: var(--jd-color-muted); animation: jd-chat-typing 1.2s infinite;
  }
  .jd-chat-thread__typing-dots i:nth-child(2) { animation-delay: .15s; }
  .jd-chat-thread__typing-dots i:nth-child(3) { animation-delay: .3s; }
  .jd-chat-thread__typing-text { font-size: var(--jd-text-xs); color: var(--jd-color-muted); }
  @keyframes jd-chat-typing { 0%, 60%, 100% { opacity: .3; } 30% { opacity: 1; } }

  .jd-chat-thread__composer:empty { display: none; }
  .jd-chat-thread__composer {
    border-top: var(--jd-border-thin) solid var(--jd-color-border);
    background: var(--jd-color-surface);
    padding: var(--jd-space-2) var(--jd-space-3);
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-chat-thread__typing-dots i { animation: none; opacity: .6; }
  }
}`;
