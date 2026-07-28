/**
 * jd-pull-to-refresh CSS — v2 composites/PullToRefresh 토큰 번역.
 *
 * v2 값: 루트 `overflow-auto`, 인디케이터 `flex justify-center transition-all overflow-hidden`
 * (높이 = 당김 거리, 투명도 = 당김/임계), 스피너 `w-5 h-5 text-primary mt-2`
 * (+ 새로고침 중 `animate-spin`).
 * 인라인 style 2개는 CSS 변수(--_jd-ptr-pull · --_jd-ptr-progress)로 옮겼다 —
 * 프레임마다 style 문자열을 다시 만들지 않는다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-pull-to-refresh {
      display: block;
      overflow: auto;
      /* 당김이 페이지 전체 고무줄로 번지지 않게 */
      overscroll-behavior-y: contain;
      scrollbar-width: thin;
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }

    /* 당겨서 새로고침이 붙는 자리는 사실상 언제나 **목록**이다. v2는 본문에 아무
     규약을 두지 않아 항목 사이에 여백만 벌어지고 어디서 한 행이 끝나는지 보이지
     않았다 — 직계 자식에 행 리듬을 준다(인디케이터는 본문이 아니므로 제외).
     자기 표면을 가진 본문은 --jd-pull-to-refresh-row-padding: 0 ·
     --jd-pull-to-refresh-rule: transparent 로 끈다. */
    jd-pull-to-refresh > :not(.jd-pull-to-refresh__indicator) {
      padding-block: var(--jd-pull-to-refresh-row-padding, var(--jd-space-3));
    }
    /* 첫 행 위에는 선을 긋지 않는다 — 인디케이터와 본문 사이는 경계가 아니다 */
    jd-pull-to-refresh
      > :not(.jd-pull-to-refresh__indicator)
      ~ :not(.jd-pull-to-refresh__indicator) {
      border-block-start: var(--jd-border-thin) solid
        var(--jd-pull-to-refresh-rule, var(--jd-color-border-light));
    }

    .jd-pull-to-refresh__indicator {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      overflow: hidden;
      height: var(--_jd-ptr-pull, 0px);
      opacity: var(--_jd-ptr-progress, 0);
      transition: height var(--jd-duration-fast) var(--jd-easing-ease-out),
        opacity var(--jd-duration-fast) var(--jd-easing-ease-out);
    }

    .jd-pull-to-refresh__spinner {
      width: 1.25rem;
      height: 1.25rem;
      margin-block-start: var(--jd-space-2);
      color: var(--jd-color-primary-ink);
    }
    jd-pull-to-refresh[refreshing] .jd-pull-to-refresh__spinner {
      animation: jd-ptr-spin 1s linear infinite;
    }

    /* 상태 문구는 접근성 트리 전용 — 화면에는 스피너만 있다(v2 시각 동형) */
    .jd-pull-to-refresh__status {
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

    @keyframes jd-ptr-spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-pull-to-refresh__indicator {
        transition: none;
      }
      /* 진행 표시는 남기되 회전을 늦춘다 — 완전 정지는 "멈춘 것"으로 읽힌다 */
      jd-pull-to-refresh[refreshing] .jd-pull-to-refresh__spinner {
        animation-duration: 3s;
      }
    }
  }
`;
