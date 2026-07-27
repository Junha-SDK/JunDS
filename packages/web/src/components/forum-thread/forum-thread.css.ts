import { css } from "../../core/styles.js";

/**
 * v2 값(patterns/ForumThread): 컨테이너 max-w-3xl·mx-auto·p-4·space-y-4,
 * 제목 text-xl/bold, 태그 pill surface-soft·text-[11px]·muted, 답변 헤딩 text-sm/semibold·
 * muted·uppercase·tracking-wider, 포스트 flex gap-3·p-4·rounded-xl·border·bg-surface(채택 시
 * success/40 테두리 + success/5 배경), 투표 버튼 w-7 h-7·rounded-md(추천 활성 primary, 비추천
 * 활성 danger), 점수 text-sm/semibold·tabular-nums, 채택 ✓ text-lg/success, 아바타 20px,
 * 메타 text-xs/muted, 역할 배지 primary/10, 본문 prose-sm/relaxed, 답변 들여쓰기 ml-6.
 */
export default css`
@layer junds.components {
  jd-forum-thread { display: block; font-family: var(--jd-font-sans); }

  .jd-forum-thread {
    max-width: 48rem; margin-inline: auto; padding: var(--jd-space-4);
    display: flex; flex-direction: column; gap: var(--jd-space-4);
  }

  .jd-forum-thread__title {
    margin: 0; font-size: var(--jd-text-2xl); font-weight: var(--jd-weight-bold);
    line-height: var(--jd-leading-snug); color: var(--jd-color-foreground);
    overflow-wrap: anywhere;
  }
  .jd-forum-thread__tags {
    margin-top: var(--jd-space-1); display: flex; flex-wrap: wrap; gap: var(--jd-space-1);
  }
  .jd-forum-thread__tags[hidden] { display: none; }
  .jd-forum-thread__tag {
    display: inline-flex; align-items: center;
    padding: var(--jd-space-0-5) var(--jd-space-2);
    border-radius: var(--jd-radius-full); background: var(--jd-color-card-hover);
    font-size: 11px; color: var(--jd-color-muted);
  }

  .jd-forum-thread__answers-heading {
    margin: 0 0 var(--jd-space-2); font-size: var(--jd-text-md);
    font-weight: var(--jd-weight-semibold); color: var(--jd-color-muted);
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  .jd-forum-thread__answers-list {
    display: flex; flex-direction: column; gap: var(--jd-space-3);
  }

  .jd-forum-thread__post {
    display: flex; gap: var(--jd-space-3); padding: var(--jd-space-4);
    border-radius: var(--jd-radius-xl);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    background: var(--jd-color-surface);
  }
  .jd-forum-thread__post:not([data-depth="0"]) { margin-inline-start: var(--jd-space-6); }
  .jd-forum-thread__post[data-accepted] {
    border-color: color-mix(in srgb, var(--jd-color-success) 40%, transparent);
    background: color-mix(in srgb, var(--jd-color-success) 5%, transparent);
  }

  .jd-forum-thread__votes {
    flex-shrink: 0; display: flex; flex-direction: column; align-items: center;
    gap: var(--jd-space-1);
  }
  .jd-forum-thread__vote {
    appearance: none; -webkit-appearance: none; margin: 0; padding: 0; border: 0;
    width: 1.75rem; height: 1.75rem; display: inline-flex; align-items: center;
    justify-content: center; border-radius: var(--jd-radius-md);
    background: transparent; color: var(--jd-color-foreground);
    font: inherit; line-height: 1; cursor: pointer;
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out),
      color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-forum-thread__vote:hover { background: var(--jd-color-card-hover); }
  .jd-forum-thread__vote:focus-visible {
    outline: 2px solid var(--jd-color-primary); outline-offset: 2px;
  }
  .jd-forum-thread__vote[data-dir="up"][aria-pressed="true"] { color: var(--jd-color-primary-ink); }
  .jd-forum-thread__vote[data-dir="down"][aria-pressed="true"] { color: var(--jd-color-danger-ink); }

  .jd-forum-thread__score {
    font-size: var(--jd-text-md); font-weight: var(--jd-weight-semibold);
    font-variant-numeric: tabular-nums; color: var(--jd-color-foreground);
  }
  .jd-forum-thread__accepted-mark {
    margin-top: var(--jd-space-1); font-size: var(--jd-text-xl); line-height: 1;
    color: var(--jd-color-success-ink);
  }

  .jd-forum-thread__body-col { flex: 1; min-width: 0; }

  .jd-forum-thread__meta {
    display: flex; align-items: center; gap: var(--jd-space-2);
    font-size: var(--jd-text-xs); color: var(--jd-color-muted);
  }
  .jd-forum-thread__avatar-img,
  .jd-forum-thread__avatar-fallback {
    width: 1.25rem; height: 1.25rem; border-radius: var(--jd-radius-full);
    object-fit: cover; flex-shrink: 0;
  }
  .jd-forum-thread__avatar-img { display: block; }
  .jd-forum-thread__avatar-fallback {
    display: inline-flex; align-items: center; justify-content: center;
    background: color-mix(in srgb, var(--jd-color-primary) 15%, transparent);
    color: color-mix(in srgb, var(--jd-color-primary) 65%, var(--jd-color-foreground));
    font-size: 10px;
    font-weight: var(--jd-weight-semibold); user-select: none;
  }
  .jd-forum-thread__author {
    font-weight: var(--jd-weight-medium); color: var(--jd-color-foreground);
  }
  .jd-forum-thread__role {
    padding: var(--jd-space-0-5) 0.375rem; border-radius: var(--jd-radius-full);
    background: color-mix(in srgb, var(--jd-color-primary) 10%, transparent);
    color: color-mix(in srgb, var(--jd-color-primary) 65%, var(--jd-color-foreground));
    font-size: 10px;
    font-weight: var(--jd-weight-semibold);
  }
  .jd-forum-thread__time { white-space: nowrap; }

  .jd-forum-thread__accept {
    appearance: none; -webkit-appearance: none; margin: 0 0 0 auto; padding: 0;
    border: 0; background: transparent; cursor: pointer; font: inherit;
    font-size: var(--jd-text-xs); color: var(--jd-color-success-ink);
  }
  .jd-forum-thread__accept:hover { text-decoration: underline; }
  .jd-forum-thread__accept:focus-visible {
    outline: 2px solid var(--jd-color-success); outline-offset: 2px;
    border-radius: var(--jd-radius-sm);
  }

  .jd-forum-thread__content {
    margin-top: var(--jd-space-2); font-size: var(--jd-text-md);
    line-height: var(--jd-leading-relaxed); color: var(--jd-color-foreground);
    overflow-wrap: anywhere; white-space: pre-wrap;
  }

  .jd-forum-thread__replies {
    margin-top: var(--jd-space-3); display: flex; flex-direction: column;
    gap: var(--jd-space-2);
  }

  .jd-forum-thread__composer {
    border-radius: var(--jd-radius-xl);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    background: var(--jd-color-surface); padding: var(--jd-space-4);
  }
  .jd-forum-thread__composer-title {
    margin: 0 0 var(--jd-space-2); font-size: var(--jd-text-md);
    font-weight: var(--jd-weight-semibold); color: var(--jd-color-foreground);
  }
}`;
