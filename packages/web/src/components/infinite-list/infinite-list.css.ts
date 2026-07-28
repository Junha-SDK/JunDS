import { css } from "../../core/styles.js";

/**
 * jd-infinite-list CSS — v2 patterns/InfiniteList 번역.
 * v2 값: 컨테이너 `flex flex-col`, 센티넬 `h-1`, 스피너 래퍼 `flex justify-center py-4`,
 * 완료 문구 `py-4 text-center text-xs text-muted-light`, 빈 상태 `py-12 text-center text-sm text-muted`.
 *
 * v2에 없던 것 하나: **행 리듬**. v2는 항목 컨테이너만 세로 flex로 두고 항목 자체에는
 * 아무 규약이 없어, 소비자가 카드를 넘기지 않으면 목록이 통째로 한 문단으로 읽혔다.
 * 여백·구분선은 변수로 열어 두어 자기 표면을 가진 renderItem은 끌 수 있다.
 */
export default css`
  @layer junds.components {
    jd-infinite-list {
      display: flex;
      flex-direction: column;
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }
    jd-infinite-list > [hidden] {
      display: none;
    }

    .jd-infinite-list__items {
      display: flex;
      flex-direction: column;
    }
    /* v2는 항목에 아무 규약이 없어 renderItem이 텍스트만 돌려주면 목록 전체가 한
     문단으로 흘렀다 — 어디서 한 항목이 끝나는지 볼 수 없었다. 행에 여백과
     머리카락 구분선을 준다. 자기 카드/여백을 가진 renderItem은
     --jd-infinite-list-row-padding: 0 · --jd-infinite-list-rule: transparent 로 끈다. */
    .jd-infinite-list__item {
      padding-block: var(--jd-infinite-list-row-padding, var(--jd-space-3));
      font-size: var(--jd-text-md);
      line-height: var(--jd-leading-snug);
    }
    .jd-infinite-list__item + .jd-infinite-list__item {
      border-block-start: var(--jd-border-thin) solid
        var(--jd-infinite-list-rule, var(--jd-color-border-light));
    }
    .jd-infinite-list__sentinel {
      height: var(--jd-space-px);
    }

    .jd-infinite-list__spinner {
      display: flex;
      justify-content: center;
      padding-block: var(--jd-space-4);
      color: var(--jd-color-muted);
    }
    .jd-infinite-list__spinner-svg {
      width: 1.25rem;
      height: 1.25rem;
      animation: jd-infinite-list-spin var(--jd-duration-slower, 0.7s) linear infinite;
    }
    @keyframes jd-infinite-list-spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* v2 text-muted-light는 라이트에서 2.7:1이라 AA 미달이다(§9) — muted까지만 내린다 */
    .jd-infinite-list__end {
      margin: 0;
      padding-block: var(--jd-space-4);
      text-align: center;
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
    }

    .jd-infinite-list__empty {
      margin: 0;
      padding-block: var(--jd-space-12);
      text-align: center;
      font-size: var(--jd-text-sm);
      color: var(--jd-color-muted);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-infinite-list__spinner-svg {
        animation-duration: 1.6s;
      }
    }
  }
`;
