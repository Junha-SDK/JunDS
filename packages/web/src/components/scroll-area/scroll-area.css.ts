/**
 * jd-scroll-area CSS — v2 primitives/ScrollArea(얇은 커스텀 스크롤바 + 포커스 링).
 * v2 thumb은 gray-300/400 고정이라 다크에서 배경과 충돌했다 — border/muted-light
 * 토큰으로 번역해 양쪽 테마에서 성립시킨다(패리티 이탈 기록).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-scroll-area {
      position: relative;
      display: block;
      /* max-height와 소비자 padding/border 병용이 기본 사용례 — v2 preflight(border-box)와
       같은 총높이 상한이 되도록 자기 선언한다(DEC-014-9 · DEC-024-2 위반 계열) */
      box-sizing: border-box;
      overflow-x: hidden;
      overflow-y: auto; /* orientation 기본 vertical */
      scrollbar-width: thin;
      scrollbar-color: var(--jd-color-border) transparent;
    }
    jd-scroll-area[orientation="horizontal"] {
      overflow-x: auto;
      overflow-y: hidden;
    }
    jd-scroll-area[orientation="both"] {
      overflow: auto;
    }

    jd-scroll-area::-webkit-scrollbar {
      width: var(--jd-space-2);
      height: var(--jd-space-2);
    }
    jd-scroll-area::-webkit-scrollbar-track {
      background: transparent;
    }
    jd-scroll-area::-webkit-scrollbar-thumb {
      background: var(--jd-color-border);
      border-radius: var(--jd-radius-full);
    }
    jd-scroll-area::-webkit-scrollbar-thumb:hover {
      background: var(--jd-color-muted-light);
    }

    jd-scroll-area:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }
  }
`;
