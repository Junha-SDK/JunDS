import { css } from "../../core/styles.js";

/**
 * jd-audio-player CSS — v2 composites/AudioPlayer의 토큰 번역.
 * v2 값: 카드(`px-4 py-3 rounded-xl border border-border bg-white`), 토글 36px 원형
 * primary, 제목 14px medium + truncate, 시간 10px muted tabular, 트랙 6px(h-1.5)
 * gray-200 + primary 채움.
 *
 * 트랙 채움·색은 변수 3개로 뽑아 뒀다(--_jd-audio-pct / --_jd-audio-fill /
 * --_jd-audio-track) — jd-video-player가 어두운 배경용으로 트랙만 갈아 끼운다.
 * 썸은 쉼 상태에서 투명하다: v2에는 손잡이가 없었고(막대뿐), 그 외관을 지키면서도
 * 호버·포커스에서는 드러나 키보드/드래그 대상임이 보이게 한다.
 */
export default css`
@layer junds.components {
  jd-audio-player {
    display: block; box-sizing: border-box;
    padding: var(--jd-space-3) var(--jd-space-4);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    background: var(--jd-color-card);
    color: var(--jd-color-foreground);
    font-family: var(--jd-font-sans);
    --_jd-audio-fill: var(--jd-color-primary);
    --_jd-audio-track: #e5e7eb; /* v2 bg-gray-200 (G2 gray 어휘) */
  }

  /* 오디오 요소 자체는 보이지 않는다 — 컨트롤을 우리가 그린다 */
  jd-audio-player > .jd-audio-player__media { display: none; }

  .jd-audio-player__controls {
    display: flex; align-items: center; gap: var(--jd-space-3);
  }

  .jd-audio-player__toggle {
    flex-shrink: 0;
    display: inline-flex; align-items: center; justify-content: center;
    width: 2.25rem; height: 2.25rem; padding: 0; border: 0;
    border-radius: var(--jd-radius-full);
    background: var(--jd-color-primary); color: #fff;
    cursor: pointer;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-audio-player__toggle:hover { background: var(--jd-color-primary-hover); }
  .jd-audio-player__toggle:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring);
  }

  /* 아이콘 교체는 DOM이 아니라 [data-playing] 훅 — JS가 노드를 붙였다 뗐다 하지 않는다 */
  .jd-audio-player__icon { display: block; }
  .jd-audio-player__icon--pause { display: none; }
  jd-audio-player[data-playing] .jd-audio-player__icon--play { display: none; }
  jd-audio-player[data-playing] .jd-audio-player__icon--pause { display: block; }

  .jd-audio-player__body { flex: 1; min-width: 0; }

  .jd-audio-player__title {
    margin: 0;
    font-size: var(--jd-text-sm); font-weight: var(--jd-weight-medium);
    color: var(--jd-color-foreground);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-audio-player__title[hidden] { display: none; }

  .jd-audio-player__transport {
    display: flex; align-items: center; gap: var(--jd-space-2);
  }

  .jd-audio-player__time {
    flex-shrink: 0; font-size: 10px; color: var(--jd-color-muted);
    font-variant-numeric: tabular-nums;
  }

  /* 시크바 — 네이티브 range 재도색(jd-slider와 같은 크로스 브라우저 레시피) */
  .jd-audio-player__seek {
    appearance: none; -webkit-appearance: none;
    flex: 1; min-width: 0; margin: 0; padding: 0;
    height: 0.875rem; /* 썸 히트 영역 — 트랙은 6px */
    background: transparent; cursor: pointer;
  }
  .jd-audio-player__seek:disabled { cursor: default; opacity: var(--jd-opacity-60); }

  .jd-audio-player__seek::-webkit-slider-runnable-track {
    height: 6px; border-radius: var(--jd-radius-full);
    background: linear-gradient(
      to right,
      var(--_jd-audio-fill) var(--_jd-audio-pct, 0%),
      var(--_jd-audio-track) var(--_jd-audio-pct, 0%)
    );
  }
  .jd-audio-player__seek::-moz-range-track {
    height: 6px; border-radius: var(--jd-radius-full); background: var(--_jd-audio-track);
  }
  .jd-audio-player__seek::-moz-range-progress {
    height: 6px; border-radius: var(--jd-radius-full); background: var(--_jd-audio-fill);
  }

  .jd-audio-player__seek::-webkit-slider-thumb {
    appearance: none; -webkit-appearance: none;
    width: 0.75rem; height: 0.75rem; margin-top: -3px; /* (12-6)/2 */
    border-radius: var(--jd-radius-full);
    background: var(--_jd-audio-fill); border: 0;
    opacity: var(--jd-opacity-0);
    transition: opacity var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-audio-player__seek::-moz-range-thumb {
    width: 0.75rem; height: 0.75rem; box-sizing: border-box; border: 0;
    border-radius: var(--jd-radius-full); background: var(--_jd-audio-fill);
    opacity: var(--jd-opacity-0);
    transition: opacity var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-audio-player__seek:hover::-webkit-slider-thumb,
  .jd-audio-player__seek:focus-visible::-webkit-slider-thumb { opacity: var(--jd-opacity-100); }
  .jd-audio-player__seek:hover::-moz-range-thumb,
  .jd-audio-player__seek:focus-visible::-moz-range-thumb { opacity: var(--jd-opacity-100); }
  .jd-audio-player__seek:focus-visible {
    outline: var(--jd-border-medium) solid
      color-mix(in srgb, var(--_jd-audio-fill) 40%, transparent);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-audio-player__toggle { transition: none; }
    .jd-audio-player__seek::-webkit-slider-thumb { transition: none; }
    .jd-audio-player__seek::-moz-range-thumb { transition: none; }
  }
}`;
