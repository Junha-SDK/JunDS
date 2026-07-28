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
 * 읽히지 않았다 — 양 테마 동일값인 surface-overlay로 고정하고, 잉크는 그 면의 짝인
 * on-surface로 말한다(DEC-044 · jd-snackbar와 같은 선택).
 *
 * 배율은 --jd-dock-scale(element.ts가 아이템 호스트에 기록)을 읽기만 한다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-dock {
      display: inline-flex;
      align-items: flex-end;
      box-sizing: border-box;
      gap: var(--jd-space-1);
      padding: var(--jd-space-2) var(--jd-space-3);
      font-family: var(--jd-font-sans);
      background: color-mix(in srgb, var(--jd-color-card) 80%, transparent);
      backdrop-filter: blur(24px);
      /* 떠 있는 판의 테두리는 눅인다 — 실선 border는 유리면 위에서 오려낸 종이처럼 뜬다 */
      border: var(--jd-border-thin) solid
        color-mix(in srgb, var(--jd-color-border) 76%, transparent);
      border-radius: var(--jd-radius-2xl);
      box-shadow: var(--jd-shadow-lg);
    }

    jd-dock-item {
      display: block;
    }

    .jd-dock-item__button {
      position: relative; /* v2는 이게 없어 라벨 툴팁의 기준이 엉뚱했다 */
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0;
      border: 0;
      background: none;
      font: inherit;
      color: inherit;
      cursor: pointer;
      transform: scale(var(--jd-dock-scale, 1));
      transform-origin: bottom center;
      /* scale 프로퍼티는 transform과 곱해진다 — 확대 배율(transform)을 건드리지 않고
       누름 반응을 따로 얹을 수 있다 */
      transition: transform var(--jd-duration-fast) var(--jd-easing-ease-out),
        scale var(--jd-duration-press) var(--jd-easing-ease-out);
    }
    /* v2에도 v3 이식본에도 :active가 없었다 — 독 아이콘은 눌러도 아무 일이 없었다 */
    .jd-dock-item__button:active {
      scale: 0.97;
    }

    .jd-dock-item__tile {
      display: flex;
      align-items: center;
      justify-content: center;
      /* width/height + border 동시 사용 → 자기 선언 (v2는 Tailwind 전역 리셋이 담당했다) */
      box-sizing: border-box;
      width: 2.5rem;
      height: 2.5rem;
      color: var(--jd-color-foreground);
      background: linear-gradient(180deg, var(--jd-color-card-hover), var(--jd-color-card));
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      /* 인셋 하이라이트가 '위에서 빛을 받는 타일'을 만든다 */
      box-shadow: var(--jd-shadow-sm), inset 0 1px 0 var(--jd-color-highlight);
      transition: box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out),
        border-color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    .jd-dock-item__button:hover > .jd-dock-item__tile {
      box-shadow: var(--jd-shadow-md), inset 0 1px 0 var(--jd-color-highlight);
      border-color: color-mix(in srgb, var(--jd-color-border) 70%, var(--jd-color-muted-light));
    }
    /* :hover 뒤에 둔다 — 누르는 동안에도 커서는 위에 있으므로 앞에 두면 호버가 이긴다.
     눌린 면은 빛을 잃는다: 상단 하이라이트를 걷어내고 그림자를 안으로 넣는다. */
    .jd-dock-item__button:active > .jd-dock-item__tile {
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    /* 아웃라인은 버튼이 아니라 타일에 — 버튼은 라벨까지 감싸고 있어 링이 툴팁 자리까지
     늘어난다. outline은 border-radius를 따라가므로 둥근 타일에서 각지지 않는다. */
    .jd-dock-item__button:focus-visible {
      outline: none;
    }
    .jd-dock-item__button:focus-visible > .jd-dock-item__tile {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
    }

    .jd-dock-item__label {
      position: absolute;
      bottom: 100%;
      margin-bottom: var(--jd-space-1);
      padding: var(--jd-space-0-5) var(--jd-space-2);
      white-space: nowrap;
      pointer-events: none;
      /* v2 text-[10px]은 읽기 하한(2xs=11px) 아래였다 — 툴팁이라고 글자를 줄이지 않는다 */
      font-size: var(--jd-text-2xs);
      line-height: var(--jd-leading-normal);
      /* 항상 어두운 툴팁 면의 짝은 on-surface다 (DEC-044) */
      color: var(--jd-color-on-surface);
      background: var(--jd-color-surface-overlay);
      border-radius: var(--jd-radius-md);
      /* 떠 있는 것은 그림자로 뜬다 — 그림자 없는 알약은 타일에 붙은 스티커로 읽힌다 */
      box-shadow: var(--jd-shadow-lg);
      opacity: 0;
      transition: opacity var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-dock-item__label[hidden] {
      display: none;
    }
    /* v2는 scale > 1.2일 때만 — 키보드로는 볼 수 없었다 */
    .jd-dock-item__button:hover > .jd-dock-item__label,
    .jd-dock-item__button:focus-visible > .jd-dock-item__label {
      opacity: 1;
    }

    @media (prefers-reduced-motion: reduce) {
      /* 커서를 따라 계속 움직이는 확대는 저감 대상 — 배율 자체를 끈다 */
      .jd-dock-item__button {
        transform: none;
        transition: none;
      }
      .jd-dock-item__tile,
      .jd-dock-item__label {
        transition: none;
      }
    }
  }
`;
