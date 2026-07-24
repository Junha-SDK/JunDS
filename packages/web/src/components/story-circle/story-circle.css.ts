import { css } from "../../core/styles.js";

/**
 * v2 값: 링 패딩 2.5px(unread/live)·2px(read/muted), 내부 프레임 카드-bg 2px,
 * unread 그라디언트(rose→fuchsia→amber), live 그라디언트(rose 500→700),
 * read/muted 회색(다크 대응). 이름 라벨 11px·최대폭 72px 말줄임. 링 색은 v2
 * Tailwind 리터럴 승계(avatar.css 선례 — 브랜드 고정 색은 리터럴 허용).
 */
export default css`
@layer junds.components {
  jd-story-circle {
    display: inline-flex;
    --_jd-story-size: 64px;
    --_jd-story-pad: 2.5px;
    --_jd-story-ring: linear-gradient(to top right, #f43f5e, #d946ef, #f59e0b);
  }
  jd-story-circle[state="read"] { --_jd-story-pad: 2px; --_jd-story-ring: #d1d5db; }
  jd-story-circle[state="live"] { --_jd-story-ring: linear-gradient(to top right, #f43f5e, #be123c); }
  jd-story-circle[state="muted"] { --_jd-story-pad: 2px; --_jd-story-ring: #e5e7eb; }
  [data-jd-theme="dark"] jd-story-circle[state="read"],
  [data-theme="dark"] jd-story-circle[state="read"] { --_jd-story-ring: #374151; }
  [data-jd-theme="dark"] jd-story-circle[state="muted"],
  [data-theme="dark"] jd-story-circle[state="muted"] { --_jd-story-ring: #1f2937; }

  .jd-story-circle {
    appearance: none; -webkit-appearance: none; border: 0; background: transparent;
    margin: 0; padding: var(--jd-space-1);
    display: inline-flex; flex-direction: column; align-items: center; gap: var(--jd-space-1);
    cursor: pointer; border-radius: var(--jd-radius-md);
    font-family: var(--jd-font-sans);
  }
  .jd-story-circle:focus-visible {
    outline: 2px solid var(--jd-color-primary); outline-offset: 2px;
  }

  .jd-story-circle__ring {
    position: relative;
    width: var(--_jd-story-size); height: var(--_jd-story-size);
    border-radius: var(--jd-radius-full);
    padding: var(--_jd-story-pad);
    background: var(--_jd-story-ring);
    display: inline-flex; box-sizing: border-box;
  }
  .jd-story-circle__frame {
    width: 100%; height: 100%;
    border-radius: var(--jd-radius-full);
    background: var(--jd-color-card);
    padding: 2px; box-sizing: border-box;
    display: flex;
  }
  .jd-story-circle__img,
  .jd-story-circle__fallback {
    width: 100%; height: 100%;
    border-radius: var(--jd-radius-full);
    object-fit: cover; display: block;
  }
  .jd-story-circle__fallback {
    display: flex; align-items: center; justify-content: center;
    font-size: var(--jd-text-md); font-weight: var(--jd-weight-bold);
    background: color-mix(in srgb, var(--jd-color-primary) 15%, transparent);
    /* 틴트 위 이니셜: 원색 대신 foreground 혼합으로 대비 확보(emoji-picker 선례·§4). */
    color: color-mix(in srgb, var(--jd-color-primary) 65%, var(--jd-color-foreground));
    user-select: none;
  }
  .jd-story-circle__img[hidden],
  .jd-story-circle__fallback[hidden] { display: none; }

  .jd-story-circle__live {
    position: absolute; bottom: 0; left: 50%;
    transform: translate(-50%, 50%);
    padding: 1px var(--jd-space-1-5);
    border-radius: var(--jd-radius-md);
    background: #e11d48; color: #fff;
    font-size: 9px; font-weight: var(--jd-weight-bold);
    letter-spacing: var(--jd-tracking-wide); line-height: 1.4;
  }
  .jd-story-circle__live[hidden] { display: none; }

  .jd-story-circle__name {
    max-width: 72px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    font-size: 11px; color: var(--jd-color-foreground);
  }
  .jd-story-circle__name[hidden] { display: none; }
}`;
