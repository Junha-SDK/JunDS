import { css } from "../../core/styles.js";

/**
 * v2 값: 행 flex gap-3, 답글 들여쓰기 depth*32px, 아바타 32px, 말풍선 rounded-2xl·
 * surface-soft·px-3/py-2, 작성자 text-xs/semibold, 시각 10px muted, 본문 text-sm/relaxed,
 * 액션 11px(좋아요 활성=rose-500), 세로 간격 space-y-3.
 */
export default css`
@layer junds.components {
  jd-comment-thread { display: block; font-family: var(--jd-font-sans); }

  .jd-comment-thread,
  .jd-comment-thread__replies {
    list-style: none; margin: 0; padding: 0;
    display: flex; flex-direction: column; gap: var(--jd-space-3);
  }
  .jd-comment-thread__replies { margin-top: var(--jd-space-2); }

  .jd-comment-thread__row { display: flex; gap: var(--jd-space-3); }

  .jd-comment-thread__avatar { flex-shrink: 0; }
  .jd-comment-thread__avatar-img,
  .jd-comment-thread__avatar-fallback {
    width: 2rem; height: 2rem; border-radius: var(--jd-radius-full);
    object-fit: cover; display: block;
  }
  .jd-comment-thread__avatar-fallback {
    display: flex; align-items: center; justify-content: center;
    background: color-mix(in srgb, var(--jd-color-primary) 15%, transparent);
    /* 틴트 위 이니셜: 원색 대신 foreground 혼합으로 대비 확보(emoji-picker 선례·§4). */
    color: color-mix(in srgb, var(--jd-color-primary) 65%, var(--jd-color-foreground));
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-semibold); user-select: none;
  }

  .jd-comment-thread__main { flex: 1; min-width: 0; }

  .jd-comment-thread__bubble {
    border-radius: var(--jd-radius-2xl);
    background: var(--jd-color-card-hover);
    padding: var(--jd-space-2) var(--jd-space-3);
  }
  .jd-comment-thread__head { display: flex; align-items: baseline; gap: var(--jd-space-2); }
  .jd-comment-thread__author {
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-semibold);
    color: var(--jd-color-foreground);
  }
  .jd-comment-thread__time { font-size: 10px; color: var(--jd-color-muted); }
  .jd-comment-thread__body {
    margin: var(--jd-space-0-5) 0 0;
    font-size: var(--jd-text-md); line-height: var(--jd-leading-relaxed);
    color: var(--jd-color-foreground); overflow-wrap: anywhere;
  }

  .jd-comment-thread__actions {
    margin-top: var(--jd-space-1); margin-inline-start: var(--jd-space-3);
    display: flex; align-items: center; gap: var(--jd-space-3);
    font-size: 11px;
  }
  .jd-comment-thread__like,
  .jd-comment-thread__reply {
    appearance: none; -webkit-appearance: none; margin: 0; padding: 0;
    border: 0; background: transparent; cursor: pointer;
    font: inherit; color: var(--jd-color-muted);
    transition: color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-comment-thread__like:hover,
  .jd-comment-thread__reply:hover { color: var(--jd-color-foreground); }
  .jd-comment-thread__like:focus-visible,
  .jd-comment-thread__reply:focus-visible {
    outline: 2px solid var(--jd-color-primary); outline-offset: 2px; border-radius: var(--jd-radius-sm);
  }
  .jd-comment-thread__like[data-liked] { color: #f43f5e; }
  .jd-comment-thread__like[data-liked]:hover { color: #f43f5e; }
}`;
