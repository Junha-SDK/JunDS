import { css } from "../../core/styles.js";

/**
 * jd-video-player CSS — v2 composites/VideoPlayer의 토큰 번역.
 * v2 값: 컨테이너 `relative rounded-xl overflow-hidden bg-black`, 컨트롤 바
 * `absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 p-3 opacity-0
 * group-hover:opacity-100`, 트랙 `h-1 bg-white/30` + primary 채움, 아이콘 16px 흰색.
 *
 * 골격은 원형(jd-audio-player)의 것이라 여기서는 **스킨과 배치만** 덮어쓴다
 * (jd-drawer가 `.jd-modal__panel` 기하만 덮어쓰는 것과 같은 축).
 * 배치 차이 1건은 의도적이다: v2는 시크바가 한 줄, 그 아래 [재생 · "cur / dur" · 음소거]
 * 였다. v3는 원형의 트랜스포트(시간 · 시크바 · 시간)를 통째로 윗줄에 올리고 아랫줄에
 * [재생 · 음소거]를 둔다 — 같은 정보, 오디오와 같은 문법.
 */
export default css`
@layer junds.components {
  jd-video-player {
    display: block; position: relative; box-sizing: border-box;
    padding: 0; border: 0;
    border-radius: var(--jd-radius-xl); overflow: hidden;
    background: #000;
    --_jd-audio-track: rgba(255, 255, 255, .3); /* v2 bg-white/30 */
  }

  jd-video-player > .jd-audio-player__media {
    display: block; width: 100%; height: auto; cursor: pointer;
  }

  jd-video-player > .jd-audio-player__controls {
    position: absolute; inset-inline: 0; inset-block-end: 0;
    flex-wrap: wrap; gap: var(--jd-space-2) var(--jd-space-3);
    padding: var(--jd-space-3);
    background: linear-gradient(to top, rgba(0, 0, 0, .7), transparent);
    opacity: var(--jd-opacity-0);
    transition: opacity var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  jd-video-player:hover > .jd-audio-player__controls,
  jd-video-player:focus-within > .jd-audio-player__controls {
    opacity: var(--jd-opacity-100);
  }
  /* 호버가 없는 기기에서 v2는 컨트롤에 영영 닿을 수 없었다 — 상시 노출로 교정 */
  @media (hover: none) {
    jd-video-player > .jd-audio-player__controls { opacity: var(--jd-opacity-100); }
  }

  /* 시크·시간 줄을 위로(원형은 세로 스택이 오른쪽에 붙는 구조) */
  jd-video-player .jd-audio-player__body { order: -1; flex: 1 0 100%; }
  jd-video-player .jd-audio-player__title { color: #fff; }
  jd-video-player .jd-audio-player__time {
    font-size: var(--jd-text-xs); color: rgba(255, 255, 255, .8);
  }

  /* 재생 토글은 영상 위에서 투명 버튼(v2 text-white) */
  jd-video-player .jd-audio-player__toggle {
    width: auto; height: auto; padding: var(--jd-space-1);
    border-radius: var(--jd-radius-md);
    background: transparent; color: #fff;
  }
  jd-video-player .jd-audio-player__toggle:hover {
    background: rgba(255, 255, 255, .15);
  }
  jd-video-player .jd-audio-player__icon { width: 16px; height: 16px; }

  .jd-video-player__mute {
    margin-inline-start: auto;
    display: inline-flex; align-items: center; justify-content: center;
    padding: var(--jd-space-1); border: 0;
    border-radius: var(--jd-radius-md);
    background: transparent; color: #fff; cursor: pointer;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-video-player__mute:hover { background: rgba(255, 255, 255, .15); }
  .jd-video-player__mute:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  .jd-video-player__icon { display: block; }
  .jd-video-player__icon--muted { display: none; }
  jd-video-player[data-muted] .jd-video-player__icon--sound { display: none; }
  jd-video-player[data-muted] .jd-video-player__icon--muted { display: block; }

  @media (prefers-reduced-motion: reduce) {
    jd-video-player > .jd-audio-player__controls { transition: none; }
    .jd-video-player__mute { transition: none; }
  }
}`;
