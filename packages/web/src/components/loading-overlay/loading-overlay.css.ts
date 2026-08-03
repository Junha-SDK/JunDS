/**
 * jd-loading-overlay CSS — v2 composites/LoadingOverlay의 토큰 번역.
 *
 * v2 값: 래퍼 relative / 덮개 absolute inset-0 z-10 flex-col 중앙정렬 bg-white/70,
 * blur는 backdrop-blur-sm(4px), 스피너 w-6 h-6 text-primary, 라벨 text-sm text-muted mt-2.
 *
 * 색 번역 2건:
 *  - `bg-white/70` → --jd-color-card 70%. v2는 리터럴 white라 **다크 테마에서
 *    흰 판이 그대로 떴다**(라벨 text-muted와 대비도 무너진다). 카드 표면 토큰을
 *    쓰면 라이트에서는 v2와 같은 흰색(#ffffff)이고 다크만 정상화된다.
 *  - z-index: v2 `z-10`은 position:relative 래퍼 안의 국소 서열이라 절대값 자체는
 *    의미가 없다 — 이름이 정확한 --jd-z-overlay를 쓴다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-loading-overlay {
      position: relative;
      display: block;
    }
    /* 감쌀 본문이 없으면 호스트가 0×0 이 되고, inset:0 인 덮개도 0 폭이 되어
     라벨이 한 글자씩 세로로 선다(실측: "시세를 불러오는 중…"이 세로 한 줄).
     덮개만 단독으로 쓰는 자리(문서·미리보기·빈 목록 위)를 위해 활성일 때만
     바닥을 깐다 — 감쌀 본문이 있으면 본문이 이 값을 넘으므로 무해하다. */
    jd-loading-overlay[active] {
      min-width: 12rem;
      min-height: 6rem;
    }

    /* 본문 래퍼는 박스를 만들지 않는다 — children의 레이아웃이 v2(래퍼 직속)와 동일 */
    .jd-loading-overlay__content {
      display: contents;
    }

    .jd-loading-overlay__veil {
      position: absolute;
      inset: 0;
      z-index: var(--jd-z-overlay);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--jd-space-2);
      /* 덮개는 본문 크기를 그대로 받으므로 좁은 본문 위에서는 라벨이 벽에 붙는다 —
       패딩이 없으면 남는 폭이 0에 수렴해 글자가 세로로 선다 */
      padding: var(--jd-space-4);
      box-sizing: border-box;
      text-align: center;
      background: color-mix(in srgb, var(--jd-color-card) 70%, transparent);
    }
    jd-loading-overlay:not([active]) > .jd-loading-overlay__veil {
      display: none;
    }
    /* 덮개가 툭 나타나면 '무엇이 바뀌었나'를 눈이 놓친다 — 짧은 페이드로 알린다 */
    @media (prefers-reduced-motion: no-preference) {
      jd-loading-overlay[active] > .jd-loading-overlay__veil {
        animation: jd-loading-overlay-in var(--jd-duration-normal) var(--jd-easing-ease-out);
      }
    }
    @keyframes jd-loading-overlay-in {
      from {
        opacity: 0;
      }
    }
    jd-loading-overlay[blur] > .jd-loading-overlay__veil {
      backdrop-filter: blur(4px);
    }

    .jd-loading-overlay__spinner {
      width: 1.5rem;
      height: 1.5rem;
      flex-shrink: 0;
      color: var(--jd-color-primary-ink);
      animation: jd-spin 1s linear infinite;
    }

    /* "시세를 불러오는 중…"이 한 글자씩 세로로 서던 자리 — 기본 CJK 줄바꿈은 글자
     단위라 폭이 모자라면 세로 한 줄이 된다. 어절은 지키고 줄 수로 버틴다(§9). */
    .jd-loading-overlay__label {
      margin: 0;
      max-width: 100%;
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-sm);
      line-height: var(--jd-leading-snug);
      color: var(--jd-color-muted);
      word-break: keep-all;
      overflow-wrap: break-word;
      text-wrap: balance;
    }
    .jd-loading-overlay__label[hidden] {
      display: none;
    }

    /* jd-button/jd-spinner와 같은 이름·같은 본문 — 단독 로드에서도 자족한다 */
    @keyframes jd-spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-loading-overlay__spinner {
        animation-duration: 1.6s;
      }
      .jd-loading-overlay__veil {
        animation: none;
      }
    }
  }
`;
