import { css } from "../../core/styles.js";

/**
 * v2 값: 카드 rounded-xl·border·surface·p-4, 아바타 40px, 이름 text-sm/semibold,
 * 서브 11px muted, 본문 text-sm/leading-relaxed/pre-wrap, 미디어 rounded-lg 테두리,
 * 액션 pill(px-3 py-1.5, text-xs), 좋아요 활성=rose-500, 나머지 muted. 미디어 없으면
 * 컨테이너를 숨긴다(update가 hidden 처리하지 않으므로 :empty로 접는다).
 */
export default css`
@layer junds.components {
  jd-post-card { display: block; }

  .jd-post-card {
    border-radius: var(--jd-radius-xl);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    background: var(--jd-color-card);
    padding: var(--jd-space-4);
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
  }
  jd-post-card[clickable] .jd-post-card {
    cursor: pointer;
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  jd-post-card[clickable] .jd-post-card:hover { background: var(--jd-color-card-hover); }
  .jd-post-card[role="button"]:focus-visible {
    outline: 2px solid var(--jd-color-primary); outline-offset: 2px;
  }

  .jd-post-card__header { display: flex; align-items: center; gap: var(--jd-space-3); }
  .jd-post-card__avatar-img,
  .jd-post-card__avatar-fallback {
    width: 2.5rem; height: 2.5rem; border-radius: var(--jd-radius-full);
    object-fit: cover; flex-shrink: 0;
  }
  .jd-post-card__avatar-fallback {
    display: flex; align-items: center; justify-content: center;
    background: color-mix(in srgb, var(--jd-color-primary) 15%, transparent);
    /* 틴트 위 이니셜: 원색 대신 foreground 혼합으로 대비 확보(emoji-picker 선례·§4). */
    color: color-mix(in srgb, var(--jd-color-primary) 65%, var(--jd-color-foreground));
    font-weight: var(--jd-weight-semibold); user-select: none;
  }
  .jd-post-card__avatar-img[hidden],
  .jd-post-card__avatar-fallback[hidden] { display: none; }

  .jd-post-card__meta { min-width: 0; flex: 1; }
  .jd-post-card__name-row { display: flex; align-items: center; gap: var(--jd-space-1); }
  .jd-post-card__name {
    font-size: var(--jd-text-md); font-weight: var(--jd-weight-semibold);
    color: var(--jd-color-foreground);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-post-card__verified { color: var(--jd-color-primary-ink); font-size: var(--jd-text-xs); }
  .jd-post-card__verified[hidden] { display: none; }

  .jd-post-card__sub {
    margin: 0; font-size: 11px; color: var(--jd-color-muted);
    display: flex; align-items: center;
  }
  .jd-post-card__dot { margin: 0 var(--jd-space-1); }
  .jd-post-card__handle[hidden],
  .jd-post-card__dot[hidden],
  .jd-post-card__time[hidden] { display: none; }

  .jd-post-card__content {
    margin-top: var(--jd-space-3);
    font-size: var(--jd-text-md); line-height: var(--jd-leading-relaxed);
    color: var(--jd-color-foreground); white-space: pre-wrap;
  }

  .jd-post-card__media {
    margin-top: var(--jd-space-3);
    border-radius: var(--jd-radius-lg); overflow: hidden;
    border: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-post-card__media:empty { display: none; }
  .jd-post-card__media img,
  .jd-post-card__media video { display: block; width: 100%; max-width: 100%; }

  .jd-post-card__footer {
    margin-top: var(--jd-space-3); margin-inline: calc(-1 * var(--jd-space-2));
    display: flex; align-items: center; gap: var(--jd-space-1);
  }
  .jd-post-card__footer[hidden] { display: none; }

  .jd-post-card__action {
    appearance: none; -webkit-appearance: none; margin: 0;
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    padding: var(--jd-space-1-5) var(--jd-space-3);
    border: 0; border-radius: var(--jd-radius-full);
    background: transparent; color: var(--jd-color-muted);
    font-size: var(--jd-text-xs); cursor: pointer;
    transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-post-card__action:hover { background: var(--jd-color-card-hover); }
  .jd-post-card__action:focus-visible {
    outline: 2px solid var(--jd-color-primary); outline-offset: 2px;
  }
  .jd-post-card__action[hidden] { display: none; }
  .jd-post-card__like[aria-pressed="true"] { color: #f43f5e; }
  .jd-post-card__count { font-variant-numeric: tabular-nums; }
  .jd-post-card__count[hidden] { display: none; }
}`;
