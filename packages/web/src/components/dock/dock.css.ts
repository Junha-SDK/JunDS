/**
 * jd-dock / jd-dock-item CSS — v2 composites/Dock의 토큰 번역.
 *
 * v2 값: 컨테이너 inline-flex items-end gap-1 px-3 py-2 bg-white/80 backdrop-blur-xl
 * border rounded-2xl shadow-lg, 아이템 버튼 flex-col items-center gap-0.5
 * transition-transform 150ms origin-bottom, 타일 w-10 h-10 rounded-xl
 * gray-100→gray-50 그라디언트 + border + shadow-sm(호버 shadow-md),
 * 라벨 10px 알약.
 *
 * 색 번역: `bg-white/80`·`from-gray-100 to-gray-50`은 리터럴이라 다크에서 흰 판이
 * 그대로 떴다 — card/card-hover 토큰으로 옮겨 라이트 외관은 같고 다크만 정상화된다.
 * 라벨은 v2 `bg-foreground text-white`였는데 **다크에서 밝은 배경에 흰 글자**가 되어
 * 읽히지 않았다 — 양 테마 동일값인 surface-overlay로 고정한다(jd-snackbar와 같은 선택).
 *
 * 배율은 --jd-dock-scale(element.ts가 아이템 호스트에 기록)을 읽기만 한다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-dock {
    display: inline-flex; align-items: flex-end; box-sizing: border-box;
    gap: var(--jd-space-1);
    padding: var(--jd-space-2) var(--jd-space-3);
    font-family: var(--jd-font-sans);
    background: color-mix(in srgb, var(--jd-color-card) 80%, transparent);
    backdrop-filter: blur(24px);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-2xl);
    box-shadow: var(--jd-shadow-lg);
  }

  jd-dock-item { display: block; }

  .jd-dock-item__button {
    position: relative; /* v2는 이게 없어 라벨 툴팁의 기준이 엉뚱했다 */
    display: flex; flex-direction: column; align-items: center;
    padding: 0; border: 0; background: none;
    font: inherit; color: inherit; cursor: pointer;
    transform: scale(var(--jd-dock-scale, 1));
    transform-origin: bottom center;
    transition: transform var(--jd-duration-fast) var(--jd-easing-ease-out);
  }

  .jd-dock-item__tile {
    display: flex; align-items: center; justify-content: center;
    /* width/height + border 동시 사용 → 자기 선언 (v2는 Tailwind 전역 리셋이 담당했다) */
    box-sizing: border-box; width: 2.5rem; height: 2.5rem;
    color: var(--jd-color-foreground);
    background: linear-gradient(180deg, var(--jd-color-card-hover), var(--jd-color-card));
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    box-shadow: var(--jd-shadow-sm);
    transition: box-shadow var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-dock-item__button:hover > .jd-dock-item__tile { box-shadow: var(--jd-shadow-md); }
  .jd-dock-item__button:focus-visible { outline: none; }
  .jd-dock-item__button:focus-visible > .jd-dock-item__tile {
    box-shadow: var(--jd-shadow-focus-ring);
  }

  .jd-dock-item__label {
    position: absolute; bottom: 100%; margin-bottom: var(--jd-space-1);
    padding: 0.125rem var(--jd-space-2);
    white-space: nowrap; pointer-events: none;
    font-size: 0.625rem; /* v2 text-[10px] — 토큰 없는 컴포넌트 고유 지오메트리 */
    line-height: var(--jd-leading-normal);
    color: #ffffff; background: var(--jd-color-surface-overlay);
    border-radius: var(--jd-radius-md);
    opacity: 0;
    transition: opacity var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  .jd-dock-item__label[hidden] { display: none; }
  /* v2는 scale > 1.2일 때만 — 키보드로는 볼 수 없었다 */
  .jd-dock-item__button:hover > .jd-dock-item__label,
  .jd-dock-item__button:focus-visible > .jd-dock-item__label { opacity: 1; }

  @media (prefers-reduced-motion: reduce) {
    /* 커서를 따라 계속 움직이는 확대는 저감 대상 — 배율 자체를 끈다 */
    .jd-dock-item__button { transform: none; transition: none; }
    .jd-dock-item__tile,
    .jd-dock-item__label { transition: none; }
  }
}`;
