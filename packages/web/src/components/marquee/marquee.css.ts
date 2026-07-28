/**
 * jd-marquee CSS — v2 Marquee의 토큰 번역 + 이음매 계산 교정.
 *
 * v2 값: 껍데기 `overflow-hidden`, 트랙 `flex w-max` + `animation: marquee-scroll {speed}s
 * linear infinite {normal|reverse}` + inline gap, 벌 `flex shrink-0` + 같은 gap.
 *
 * 이동 거리 계산(§개선 1): 사본 N벌·한 벌 폭 W·간격 g일 때 트랙 폭 T = N·W + (N−1)·g다.
 * 이음매 없이 이으려면 한 바퀴에 정확히 **W + g** 만큼 밀어야 하고, 그 값은
 * `(T + g) / N` 이다 — translateX의 %가 T 기준이므로 `calc((-100% - gap) / copies)`가
 * 사본 수와 무관하게 항상 정답이 된다. v2의 `-50%`는 N=2에서 `W + g/2`라 매 바퀴
 * `g/2`씩 어긋났다.
 *
 * 키프레임은 문서에 1장만 채택된다 — v2는 인스턴스마다 <style>을 렌더했다(§4.1).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-marquee {
      display: block;
      overflow: hidden;
    }

    .jd-marquee__track {
      display: flex;
      width: max-content;
      gap: var(--jd-marquee-gap, 48px);
      will-change: transform;
      animation: jd-marquee-scroll var(--jd-marquee-duration, 30s) linear infinite;
    }

    .jd-marquee__group {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      gap: var(--jd-marquee-gap, 48px);
    }

    jd-marquee[direction="right"] > .jd-marquee__track {
      animation-direction: reverse;
    }

    /* v2는 마우스 호버만 알았다 — 키보드 포커스가 안으로 들어와도 멈춘다 */
    jd-marquee:not([no-pause]):hover > .jd-marquee__track,
    jd-marquee:not([no-pause]):focus-within > .jd-marquee__track,
    jd-marquee[paused] > .jd-marquee__track {
      animation-play-state: paused;
    }

    @keyframes jd-marquee-scroll {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(
          calc((-100% - var(--jd-marquee-gap, 48px)) / var(--jd-marquee-copies, 2))
        );
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-marquee__track {
        animation: none;
        will-change: auto;
      }
    }
  }
`;
