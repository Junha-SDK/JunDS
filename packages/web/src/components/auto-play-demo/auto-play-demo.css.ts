/**
 * jd-auto-play-demo CSS — v2 AutoPlayDemo의 토큰 번역.
 *
 * v2 값: 래퍼 `relative w-full`, 프레임 `transition-all pointer-events-none`
 * (첫 프레임 `relative`, 나머지 `absolute inset-0`), 전이별 exit —
 * fade/crossfade `opacity-0` · slide-up `opacity-0 translate-y-3`(0.75rem) ·
 * slide-left `opacity-0 translate-x-4`(1rem) · scale `opacity-0 scale-90`,
 * timing `cubic-bezier(0.16, 1, 0.3, 1)`(= --jd-easing-spring), duration 인라인.
 *
 * 판단 3건:
 * 1. **겹침은 grid 한 칸으로.** v2의 "첫 프레임만 흐름 + 나머지 absolute"는 상자
 *    높이를 첫 프레임에 묶어, 더 큰 프레임이 넘쳤다. 같은 `grid-area`에 쌓으면
 *    높이는 최댓값이 되고 프레임 사이에 특권이 없어진다.
 * 2. **exit 변형은 커스텀 프로퍼티로.** 전이 종류를 호스트 속성으로 고르면
 *    `jd-auto-play-demo[transition="scale"] .…__frame`(0,2,1)이
 *    `.…__frame[data-active]`(0,2,0)를 이겨 활성 프레임이 작아진 채 굳는다.
 *    값만 변수로 내리면 특이도 경쟁 자체가 사라진다(선언 순서에도 무의존).
 * 3. **duration은 인라인 변수.** 프레임 수와 무관하게 호스트 1곳에서 상속된다 —
 *    v2는 프레임마다 style 객체를 새로 만들었다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-auto-play-demo {
      --jd-auto-play-demo-exit: none; /* fade · crossfade = 불투명도만 */
      position: relative;
      display: grid;
      width: 100%;
      box-sizing: border-box; /* DEC-014-9 — width:100% + padding 병용 대비 */
    }
    jd-auto-play-demo[transition="slide-up"] {
      --jd-auto-play-demo-exit: translateY(0.75rem);
    }
    jd-auto-play-demo[transition="slide-left"] {
      --jd-auto-play-demo-exit: translateX(1rem);
    }
    jd-auto-play-demo[transition="scale"] {
      --jd-auto-play-demo-exit: scale(0.9);
    }

    .jd-auto-play-demo__frame {
      grid-area: 1 / 1; /* 전부 같은 칸 — 상자는 가장 큰 프레임에 맞는다 */
      min-width: 0;
      visibility: hidden;
      pointer-events: none;
      opacity: var(--jd-opacity-0);
      transform: var(--jd-auto-play-demo-exit);
      transition-property: opacity, transform;
      transition-duration: var(--jd-auto-play-demo-duration, 400ms);
      transition-timing-function: var(--jd-easing-spring);
    }

    /* 나가는 프레임은 전이가 끝날 때까지만 보인다 — 그동안 클릭을 먹지 않는다 */
    .jd-auto-play-demo__frame[data-leaving] {
      visibility: visible;
    }

    /* 활성 프레임만 보이고, 만질 수 있다 (포커스가 들어오면 순환이 멈춘다) */
    .jd-auto-play-demo__frame[data-active] {
      visibility: visible;
      pointer-events: auto;
      opacity: var(--jd-opacity-100);
      transform: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-auto-play-demo__frame {
        transition: none;
      }
    }
  }
`;
