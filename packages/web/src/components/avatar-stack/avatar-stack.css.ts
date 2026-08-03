import { css } from "../../core/styles.js";

/**
 * jd-avatar-stack CSS — v2 composites/AvatarStack의 Tailwind를 의미 번역.
 *
 * v2 값: `flex items-center -space-x-2`(겹침 0.5rem) · 각 아바타 `ring-2 ring-white`
 * · 초과 배지 `rounded-full bg-gray-200 text-gray-600 font-semibold ring-2 ring-white`
 * + size별 치수(xs 24/9px · sm 32/10px · md 36/12px · lg 44/14px · xl 56/16px).
 *
 * 두 색의 처리:
 *  - **링(ring-white)** 은 "뒤 배경과 같은 색으로 잘라낸다"가 전부인 표면 색이므로
 *    테마 토큰(`--jd-color-card`)으로 번역했다(jd-combobox가 bg-white를 card로
 *    옮긴 선례와 동일). 다크 테마에서 흰 테두리가 남지 않는다.
 *  - **배지 채움(gray-200/600)** 은 DEC-044 톤 레시피로 옮겼다. 이 배지는 옆에 서는
 *    jd-avatar 이니셜 칩과 **한 줄에서 같은 밝기로 읽혀야** 하는데, 그 칩도 같은
 *    레시피를 쓰므로 두 면이 모드와 무관하게 함께 움직인다.
 *
 * 치수는 --_jd-stack-size / --_jd-stack-font / --_jd-stack-overlap 세 변수로 모아
 * size 분기를 1곳에 둔다(jd-avatar가 --_jd-avatar-size로 세운 관용구와 동형).
 * 겹침은 지름 비례다 — 고정 px이면 작은 size에서만 과하게 겹친다.
 */
export default css`
  @layer junds.components {
    jd-avatar-stack {
      display: inline-flex;
      align-items: center;
      font-family: var(--jd-font-sans);
      /* size 기본 sm — v2 AvatarStack 기본값 */
      --_jd-stack-size: 2rem;
      --_jd-stack-font: var(--jd-text-2xs);
      --_jd-stack-ring: 2px;
      /* 겹침은 고정 px이 아니라 **지름의 비율**이다. v2의 -space-x-2(8px 고정)는
       xs(24px)에서 지름의 33%를 덮어 두 글자 이니셜의 첫 글자가 링 밑으로 들어갔다.
       링 두께까지 합쳐도 30%를 넘지 않도록 20%로 잡는다. */
      --_jd-stack-overlap: calc(var(--_jd-stack-size) * 0.2);
    }
    jd-avatar-stack[size="xs"] {
      --_jd-stack-size: 1.5rem;
      /* 2xs(11px)가 하한 — "+9"가 읽혀야 한다 */
      --_jd-stack-font: var(--jd-text-2xs);
      --_jd-stack-ring: 1.5px;
    }
    jd-avatar-stack[size="md"] {
      --_jd-stack-size: 2.25rem;
      --_jd-stack-font: var(--jd-text-xs);
    }
    jd-avatar-stack[size="lg"] {
      --_jd-stack-size: 2.75rem;
      --_jd-stack-font: var(--jd-text-md);
      --_jd-stack-ring: 2.5px;
    }
    jd-avatar-stack[size="xl"] {
      --_jd-stack-size: 3.5rem;
      --_jd-stack-font: var(--jd-text-lg);
      --_jd-stack-ring: 3px;
    }

    .jd-avatar-stack__item {
      position: relative;
      display: inline-flex;
      flex-shrink: 0;
      border-radius: var(--jd-radius-full);
      /* ring-2 ring-white — 링은 배경을 잘라내는 표면색이라 토큰.
       그 바깥에 잉크에서 뽑은 머리카락 선을 한 겹 더 둔다: 카드색 링만으로는
       카드 위에 얹혔을 때 앞뒤 아바타의 경계가 사라져 겹친 부분이 한 덩어리로 읽힌다. */
      box-shadow: 0 0 0 var(--_jd-stack-ring) var(--jd-color-card),
        0 0 0 calc(var(--_jd-stack-ring) + var(--jd-border-thin))
          color-mix(in srgb, var(--jd-color-foreground) 10%, transparent);
    }
    /* -space-x-2 — 첫 항목을 뺀 나머지가 앞으로 파고든다. 뒤 항목이 위로 겹친다 */
    .jd-avatar-stack__item + .jd-avatar-stack__item {
      margin-inline-start: calc(var(--_jd-stack-overlap) * -1);
    }

    .jd-avatar-stack__more {
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      width: var(--_jd-stack-size);
      height: var(--_jd-stack-size);
      border-radius: var(--jd-radius-full);
      font-size: var(--_jd-stack-font);
      font-weight: var(--jd-weight-semibold);
      line-height: var(--jd-leading-none);
      user-select: none;
      /* 아바타 팔레트와 같은 계약 — DEC-044 톤 레시피 */
      --jd-tone: var(--jd-color-hue-gray);
      /* 11px "+N"이 옆의 이니셜 칩과 같은 무게로 읽히도록 잉크 비율을 아바타와 맞춘다 */
      --jd-tone-ink-mix: 68%;
      --jd-tone-face: color-mix(in srgb, var(--jd-tone) var(--jd-tone-lift), #ffffff);
      background-color: color-mix(
        in srgb,
        var(--jd-tone-face) var(--jd-tone-bg-strong-mix),
        transparent
      );
      /* jd-avatar 이니셜 칩과 같은 면 처리(§2) — 한 줄에 서므로 빛도 같아야 한다 */
      background-image: linear-gradient(180deg, var(--jd-color-highlight), transparent 60%);
      box-shadow: inset 0 0 0 var(--jd-border-thin)
        color-mix(in srgb, var(--jd-tone) 18%, transparent);
      color: color-mix(in srgb, var(--jd-tone) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward));
    }

    /* 이름·"외 N명"은 읽히기만 한다 (jd-trust-indicator __sr 관용구) */
    .jd-avatar-stack__name {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }
  }
`;
