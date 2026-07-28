/**
 * jd-globe CSS — v2 Globe의 토큰 번역.
 *
 * v2 값: 껍데기 `relative` + width/height=size + perspective=size*2, 글로우
 * `inset-0 rounded-full opacity-20 blur-xl`, 윤곽 `border-2 opacity-20`, 회전체
 * `inset-0` + transformStyle preserve-3d + `globe-spin {speed}s linear infinite`,
 * 점 `absolute rounded-full` 3×3px + left/top 50% + `translate(-50%,-50%)
 * translate3d(x,y,z)` + z 기반 불투명도, 적도 링 `border opacity-10` + rotateX(75deg).
 * (`blur-xl` = blur(24px).)
 *
 * v2가 점마다 style 객체를 새로 만들던 자리를 CSS 변수 4개(x·y·z·dim)로 바꿨다 —
 * 크기·모양·색 규칙은 시트 한 장이 갖고 인스턴스는 좌표만 심는다.
 *
 * 키프레임은 인스턴스마다 <style>을 렌더하던 v2와 달리 문서에 1장만 채택된다(§4.1).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-globe {
      display: block;
      position: relative;
      width: var(--jd-globe-size, 300px);
      height: var(--jd-globe-size, 300px);
      perspective: calc(var(--jd-globe-size, 300px) * 2);
    }

    .jd-globe__glow {
      position: absolute;
      inset: 0;
      border-radius: var(--jd-radius-full);
      background: var(--jd-globe-color, var(--jd-color-primary));
      opacity: var(--jd-opacity-20);
      filter: blur(24px);
    }

    .jd-globe__outline {
      position: absolute;
      inset: 0;
      border-radius: var(--jd-radius-full);
      border: var(--jd-border-medium) solid var(--jd-globe-color, var(--jd-color-primary));
      opacity: var(--jd-opacity-20);
    }

    .jd-globe__sphere {
      position: absolute;
      inset: 0;
      transform-style: preserve-3d;
      animation: jd-globe-spin var(--jd-globe-duration, 20s) linear infinite;
    }

    .jd-globe__dot {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 3px;
      height: 3px;
      border-radius: var(--jd-radius-full);
      background: var(--jd-globe-dot-color, var(--jd-color-primary-light));
      opacity: var(--jd-globe-dim, 1);
      transform: translate(-50%, -50%)
        translate3d(var(--jd-globe-x, 0px), var(--jd-globe-y, 0px), var(--jd-globe-z, 0px));
    }

    .jd-globe__equator {
      position: absolute;
      left: 50%;
      top: 50%;
      width: var(--jd-globe-size, 300px);
      height: var(--jd-globe-size, 300px);
      border-radius: var(--jd-radius-full);
      border: var(--jd-border-thin) solid var(--jd-globe-color, var(--jd-color-primary));
      opacity: var(--jd-opacity-10);
      transform: translate(-50%, -50%) rotateX(75deg);
    }

    /* 화면 밖(data-offscreen)·명시적 정지·감속 선호 — 셋 다 합성 비용을 끊는다 */
    jd-globe[paused] > .jd-globe__sphere,
    jd-globe[data-offscreen] > .jd-globe__sphere {
      animation-play-state: paused;
    }

    @keyframes jd-globe-spin {
      from {
        transform: rotateY(0deg);
      }
      to {
        transform: rotateY(360deg);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-globe__sphere {
        animation: none;
      }
    }
  }
`;
