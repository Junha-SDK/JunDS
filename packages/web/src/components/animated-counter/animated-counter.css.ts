/**
 * jd-animated-counter 컴포넌트 CSS.
 * v2 ds/composites/AnimatedCounter의 유틸 2개를 --jd-* 토큰으로 의미 번역:
 *  - 루트 `tabular-nums font-bold` → font-variant-numeric + --jd-weight-bold
 *  - 글자 `inline-block transition-transform duration-300`
 *    → --jd-duration-slow(300ms) + --jd-easing-ease-out
 * 색·크기는 v2와 같이 **선언하지 않는다** — 상속이 정답이다(문맥의 글자 크기를 따른다).
 *
 * v2의 글자 transition은 인라인 `transform: translateY(0)` 고정이라 실제로는 아무것도
 * 움직이지 않았다(자릿수 롤 애니메이션의 흔적). 선언은 승계하되 죽은 인라인 스타일은
 * 옮기지 않는다 — 소비자가 자기 CSS로 transform을 얹으면 그때 살아난다.
 *
 * v2는 글자마다 inline-block이라 줄 끝에서 숫자가 두 줄로 쪼개졌다(0.1초 카운트업
 * 도중에 줄바꿈이 튄다). __value에 nowrap을 걸어 숫자 덩어리를 원자로 만든다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-animated-counter {
    display: inline;
    font-family: var(--jd-font-sans);
    font-weight: var(--jd-weight-bold);
    font-variant-numeric: tabular-nums;
  }

  /* 시각 표시부 — aria-hidden. 숫자 덩어리는 줄바꿈으로 쪼개지지 않는다 */
  .jd-animated-counter__value { white-space: nowrap; }

  .jd-animated-counter__char {
    display: inline-block;
    transition: transform var(--jd-duration-slow) var(--jd-easing-ease-out);
  }

  /*
   * 낭독 전용 텍스트. display:none·hidden은 접근성 트리에서도 지우므로 쓰지 않는다
   * (jd-visually-hidden과 같은 clip 관용구). user-select:none이라 화면 복사에는
   * 눈에 보이는 숫자만 담기고 이 사본은 딸려오지 않는다.
   */
  .jd-animated-counter__text {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
    -webkit-user-select: none; user-select: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-animated-counter__char { transition: none; }
  }
}`;
