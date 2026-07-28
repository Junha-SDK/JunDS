/**
 * jd-hover-card CSS — v2 HoverCard 표면의 토큰 번역.
 * v2 값: 래퍼 `relative inline-flex`, 패널 `w-64 p-4 bg-card rounded-xl shadow-lg
 * border border-border animate-fade-in z-50`, 오프셋 `mt-2/mb-2/mr-2/ml-2`, 수평 중앙.
 * 기하는 jd-popover 시트가 담당 — 여기서는 기본 정렬(center)과 스킨만 덮어쓴다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.base {
    jd-hover-card:not(:defined) {
      display: inline-flex;
    }
    jd-hover-card:not(:defined) > :not([slot="trigger"]) {
      display: none;
    }
  }
  @layer junds.components {
    jd-hover-card {
      position: relative;
      display: inline-flex;
      align-items: center;
      /* 본문 한가운데 섞여 앉는 앵커다 — 글줄 위에 서고, 부모 폭을 넘지 않는다 */
      vertical-align: middle;
      max-width: 100%;
      font-family: var(--jd-font-sans);
    }

    /* ── 트리거 ──
     원형은 포커스 가능한 자식이 없을 때만 래퍼를 승격한다 — 그래서 [tabindex] 가
     곧 "소비자가 자기 링크·버튼을 넣지 않았다"는 표식이다. 그 경우 트리거는 본문과
     구별되지 않아 카드가 있다는 사실 자체가 보이지 않았다(실측).
     밑줄을 text-decoration이 아니라 border로 긋는 이유: 승격된 래퍼는 inline-flex라
     텍스트 장식이 플렉스 아이템(=글줄)으로 전파되지 않는다. */
    jd-hover-card > .jd-popover__trigger[tabindex] {
      gap: var(--jd-space-1);
      border-block-end: var(--jd-border-thin) dashed
        color-mix(in srgb, var(--jd-color-muted) 60%, transparent);
      color: inherit;
      cursor: default;
      transition: border-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    jd-hover-card > .jd-popover__trigger[tabindex]:hover,
    jd-hover-card[open] > .jd-popover__trigger[tabindex] {
      border-block-end-color: var(--jd-color-primary);
      color: var(--jd-color-primary-ink);
    }
    jd-hover-card > .jd-popover__trigger[tabindex]:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: var(--jd-focus-ring-offset);
      box-shadow: none;
    }

    /* 파생 기본값(0,1,1) — 명시 align attribute(0,2,0)가 언제나 이긴다 */
    jd-hover-card > .jd-popover__panel {
      --jd-popover-offset: var(--jd-space-2);
      left: 50%;
      right: auto;
      --jd-popover-tx: -50%;

      width: 16rem;
      /* 중앙 정렬이라 앵커 기준 좌우로 반씩 뻗는다 — 좁은 화면에서 밖으로 나가지 않게 */
      max-width: min(16rem, calc(100vw - 2rem));
      /* 떠 있는 면은 테두리를 눅이고 그림자로 띄운다 — 실선 테두리는 문서 안의
       구획으로 읽힌다 */
      border-color: color-mix(in srgb, var(--jd-color-border) 76%, transparent);
      box-shadow: var(--jd-shadow-lg);
      backdrop-filter: none;
      line-height: var(--jd-leading-normal);
    }
    /* 프로필 카드는 보통 블록 몇 개가 쌓인 것이다 — 서로 붙어 한 덩어리로 읽히지
     않게 사이만 벌린다. 텍스트 노드의 인라인 흐름은 건드리지 않는다. */
    jd-hover-card > .jd-popover__panel > * + * {
      margin-block-start: var(--jd-space-2);
    }

    @media (prefers-reduced-motion: reduce) {
      jd-hover-card > .jd-popover__trigger[tabindex] {
        transition: none;
      }
    }
  }
`;
