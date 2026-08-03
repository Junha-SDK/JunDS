/**
 * jd-motion CSS — v2 primitives/Motion의 8프리셋(mFade·mFadeUp… 전역 keyframes)을
 * 컴포넌트 로컬로 이식. 지속시간·이징도 v2 값 그대로(fade 300ms ease-out,
 * 나머지 280~400ms cubic-bezier(0.16,1,0.3,1)) — 토큰 duration과 값이 어긋나
 * 리터럴 유지(G2 모션 어휘 재심의 목록).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-motion {
      display: block;
      animation: jd-m-fade 300ms var(--jd-easing-ease-out) both; /* preset 기본 fade */
    }
    jd-motion[preset="fade-up"] {
      animation: jd-m-fade-up 350ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    jd-motion[preset="fade-down"] {
      animation: jd-m-fade-down 350ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    jd-motion[preset="scale"] {
      animation: jd-m-scale 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    jd-motion[preset="slide-up"] {
      animation: jd-m-slide-up 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    jd-motion[preset="slide-down"] {
      animation: jd-m-slide-down 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    jd-motion[preset="slide-left"] {
      animation: jd-m-slide-left 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    jd-motion[preset="slide-right"] {
      animation: jd-m-slide-right 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes jd-m-fade {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    @keyframes jd-m-fade-up {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
    @keyframes jd-m-fade-down {
      from {
        opacity: 0;
        transform: translateY(-12px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
    @keyframes jd-m-scale {
      from {
        opacity: 0;
        transform: scale(0.96);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
    @keyframes jd-m-slide-up {
      from {
        opacity: 0;
        transform: translateY(24px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
    @keyframes jd-m-slide-down {
      from {
        opacity: 0;
        transform: translateY(-24px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
    @keyframes jd-m-slide-left {
      from {
        opacity: 0;
        transform: translateX(24px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
    @keyframes jd-m-slide-right {
      from {
        opacity: 0;
        transform: translateX(-24px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }

    /* 감속 선호 — 내용은 즉시 보이고 움직임만 사라진다. force-motion이 옵트아웃 */
    @media (prefers-reduced-motion: reduce) {
      jd-motion:not([force-motion]) {
        animation: none;
      }
    }
  }
`;
