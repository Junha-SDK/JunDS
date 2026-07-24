import { css } from "../../core/styles.js";

/**
 * jd-avatar-stack CSS — v2 composites/AvatarStack의 Tailwind를 의미 번역.
 *
 * v2 값: `flex items-center -space-x-2`(겹침 0.5rem) · 각 아바타 `ring-2 ring-white`
 * · 초과 배지 `rounded-full bg-gray-200 text-gray-600 font-semibold ring-2 ring-white`
 * + size별 치수(xs 24/9px · sm 32/10px · md 36/12px · lg 44/14px · xl 56/16px).
 *
 * 두 색의 처리를 다르게 한 이유:
 *  - **링(ring-white)** 은 "뒤 배경과 같은 색으로 잘라낸다"가 전부인 표면 색이므로
 *    테마 토큰(`--jd-color-card`)으로 번역했다(jd-combobox가 bg-white를 card로
 *    옮긴 선례와 동일). 다크 테마에서 흰 테두리가 남지 않는다.
 *  - **배지 채움(gray-200/600)** 은 리터럴을 유지했다. 이 배지는 옆에 서는
 *    jd-avatar 이니셜 칩(violet-100/blue-100… 리터럴 팔레트)과 **한 줄에서 같은
 *    밝기로 읽혀야** 하는데, 팔레트가 테마 무관 리터럴이므로 배지만 토큰으로
 *    바꾸면 다크에서 혼자 튄다. 아바타 계열의 색 계약을 따른 것이다.
 *
 * 치수는 --_jd-stack-size / --_jd-stack-font 두 변수로 모아 size 분기를 1곳에 둔다
 * (jd-avatar가 --_jd-avatar-size로 세운 관용구와 동형).
 */
export default css`
@layer junds.components {
  jd-avatar-stack {
    display: inline-flex; align-items: center;
    font-family: var(--jd-font-sans);
    /* size 기본 sm — v2 AvatarStack 기본값 */
    --_jd-stack-size: 2rem; --_jd-stack-font: 10px;
    --_jd-stack-ring: 2px;
    --_jd-stack-overlap: var(--jd-space-2);
  }
  jd-avatar-stack[size="xs"] { --_jd-stack-size: 1.5rem; --_jd-stack-font: 9px; }
  jd-avatar-stack[size="md"] { --_jd-stack-size: 2.25rem; --_jd-stack-font: var(--jd-text-xs); }
  jd-avatar-stack[size="lg"] { --_jd-stack-size: 2.75rem; --_jd-stack-font: var(--jd-text-md); }
  jd-avatar-stack[size="xl"] { --_jd-stack-size: 3.5rem; --_jd-stack-font: var(--jd-text-lg); }

  .jd-avatar-stack__item {
    position: relative; display: inline-flex; flex-shrink: 0;
    border-radius: var(--jd-radius-full);
    /* ring-2 ring-white — 링은 배경을 잘라내는 표면색이라 토큰 */
    box-shadow: 0 0 0 var(--_jd-stack-ring) var(--jd-color-card);
  }
  /* -space-x-2 — 첫 항목을 뺀 나머지가 앞으로 파고든다. 뒤 항목이 위로 겹친다 */
  .jd-avatar-stack__item + .jd-avatar-stack__item {
    margin-inline-start: calc(var(--_jd-stack-overlap) * -1);
  }

  .jd-avatar-stack__more {
    display: flex; align-items: center; justify-content: center;
    box-sizing: border-box;
    width: var(--_jd-stack-size); height: var(--_jd-stack-size);
    border-radius: var(--jd-radius-full);
    font-size: var(--_jd-stack-font); font-weight: var(--jd-weight-semibold);
    line-height: var(--jd-leading-none);
    user-select: none;
    background: #e5e7eb; color: #4b5563; /* v2 gray-200 / gray-600 — 아바타 팔레트와 같은 계약 */
  }

  /* 이름·"외 N명"은 읽히기만 한다 (jd-trust-indicator __sr 관용구) */
  .jd-avatar-stack__name {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }
}`;
