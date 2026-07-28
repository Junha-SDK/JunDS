/**
 * jd-typewriter CSS — v2 Typewriter의 토큰 번역.
 *
 * v2 값: 껍데기 `inline`, 커서 `animate-pulse ml-0.5 text-primary`.
 * Tailwind animate-pulse = opacity 1 → .5 → 1, 2s cubic-bezier(.4,0,.6,1) infinite.
 * 키프레임은 인스턴스마다 <style>을 심던 v2와 달리 **문서에 1장**만 채택된다(§4.1).
 *
 * 글꼴·크기는 주지 않는다 — 문장 속에 섞여 흐르는 표시기이므로 부모 타이포를 상속하는
 * 것이 옳다(v2도 색만 지정했다).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-typewriter {
      display: inline;
    }

    .jd-typewriter__typed {
      white-space: pre-wrap;
    }

    .jd-typewriter__cursor {
      margin-inline-start: 0.125rem; /* v2 ml-0.5 */
      color: var(--jd-color-primary-ink);
      animation: jd-typewriter-blink 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    .jd-typewriter__cursor[hidden] {
      display: none;
    }

    /* 낭독 전용 완성형 — jd-visually-hidden 관용구 */
    .jd-typewriter__sr {
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

    @keyframes jd-typewriter-blink {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    /* 감속 선호에서는 타이핑 자체가 멎는다(element가 완성형을 칠한다) — 커서도 정지 */
    @media (prefers-reduced-motion: reduce) {
      .jd-typewriter__cursor {
        animation: none;
      }
    }
  }
`;
