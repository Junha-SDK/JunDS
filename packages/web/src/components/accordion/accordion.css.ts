/**
 * jd-accordion CSS — v2 composites/Accordion의 크롬만. 개폐 관용구(패널 grid 0fr↔1fr,
 * 트리거 리셋)는 원형 jd-disclosure 시트가 담당한다.
 *
 * v2 값: 컨테이너 `divide-y divide-border border border-border rounded-xl overflow-hidden`,
 * 트리거 `w-full flex items-center justify-between px-4 py-3 text-sm font-medium
 * text-foreground hover:bg-gray-50 transition-colors text-left`, 셰브런
 * `w-4 h-4 text-muted transition-transform duration-200` + 열림 시 `rotate-180`,
 * 본문 `px-4 pb-3 text-sm text-muted`.
 * (Tailwind text-sm = 0.875rem = --jd-text-md · hover:bg-gray-50 = --jd-color-card-hover)
 *
 * 행 내부 규칙은 전부 호스트 태그를 접두로 단다: 행 골격은 원형 jd-disclosure가
 * 입양하고(§3.3) 그 시트는 아코디언 시트 **뒤에** 채택될 수 있어(행은 아코디언
 * render() 다음에 연결된다) 같은 특이도끼리는 어느 쪽이 이길지 모른다 —
 * `.jd-disclosure__trigger`의 `padding: 0`이 이기면 행이 여백을 통째로 잃는다.
 * 태그 접두로 (0,1,1) 이상을 만들어 특이도로 이겨 둔다(jd-faq가 `.jd-faq__item`
 * 접두로 하는 것과 같은 처방 — 여기서는 행 클래스에 기대지 않으려고 태그를 쓴다).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.base {
    jd-accordion:not(:defined) {
      display: block;
    }
    jd-accordion:not(:defined) > script {
      display: none;
    }
  }
  @layer junds.components {
    jd-accordion {
      display: block;
      box-sizing: border-box;
      overflow: hidden;
      /* 면 없이 선만 있으면 열린 행이 위아래 구분선 + 컨테이너 좌우선에 둘러싸여
       **별도의 상자**로 읽힌다(실측: 테두리 이중). 카드 면과 위에서 받는 빛을 줘서
       컨테이너 전체가 하나의 표면이 되게 한다 — 행은 그 표면의 구획일 뿐이다.
       hover의 card-hover도 배경이 있어야 실제로 보인다(투명 위에서는 페이지
       배경과 구분되지 않았다). */
      background: var(--jd-color-card);
      border: var(--jd-border-thin) solid var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      box-shadow: var(--jd-shadow-xs);
      font-family: var(--jd-font-sans);
      color: var(--jd-color-foreground);
    }
    /* v2 divide-y — 첫 행 위에는 선이 없다 */
    jd-accordion > jd-disclosure + jd-disclosure {
      border-block-start: var(--jd-border-thin) solid var(--jd-color-border);
    }

    jd-accordion .jd-accordion__trigger {
      padding: var(--jd-space-3) var(--jd-space-4);
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-medium);
      transition: background-color var(--jd-duration-snap) var(--jd-easing-ease-out),
        color var(--jd-duration-snap) var(--jd-easing-ease-out),
        box-shadow var(--jd-duration-snap) var(--jd-easing-ease-out);
    }
    jd-accordion .jd-accordion__trigger:hover:not(:disabled) {
      background: var(--jd-color-card-hover);
    }
    /* 행은 폭 전체를 차지하므로 scale로 줄이면 컨테이너에서 떨어져 보인다 —
     눌린 면이 빛을 잃는 신호(inset shade)만 남긴다 (button link variant 선례). */
    jd-accordion .jd-accordion__trigger:active:not(:disabled) {
      background: var(--jd-color-border-light);
      box-shadow: inset 0 1px 2px var(--jd-color-shade);
    }
    /* 링을 행 **안쪽**에 그린다: 바깥으로 나가면 컨테이너의 overflow:hidden에 좌우가
     잘리고 남은 위아래 선이 '테두리 한 겹'으로 읽힌다. */
    jd-accordion .jd-accordion__trigger:focus-visible {
      outline: var(--jd-focus-ring);
      outline-offset: calc(var(--jd-focus-ring-offset) * -1);
      box-shadow: none;
    }

    jd-accordion .jd-accordion__icon {
      display: inline-flex;
      flex-shrink: 0;
      color: var(--jd-color-muted);
    }
    jd-accordion .jd-accordion__icon[hidden] {
      display: none;
    }
    jd-accordion .jd-accordion__icon > svg {
      width: 1em;
      height: 1em;
    }

    jd-accordion .jd-accordion__title {
      flex: 1 1 auto;
      min-width: 0;
    }

    /* justify-between의 자리 — 아이콘·제목은 왼쪽, 셰브런은 오른쪽 */
    jd-accordion .jd-accordion__chevron {
      display: inline-flex;
      flex-shrink: 0;
      margin-inline-start: auto;
      color: var(--jd-color-muted);
      transition: transform var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    jd-accordion .jd-accordion__chevron > svg {
      width: 1rem;
      height: 1rem;
    }
    jd-accordion .jd-accordion__trigger[data-state="open"] > .jd-accordion__chevron {
      transform: rotate(180deg);
    }

    jd-accordion .jd-accordion__content {
      padding: 0 var(--jd-space-4) var(--jd-space-3);
      font-size: var(--jd-text-md);
      color: var(--jd-color-muted);
      line-height: var(--jd-leading-relaxed);
    }

    @media (prefers-reduced-motion: reduce) {
      jd-accordion .jd-accordion__trigger,
      jd-accordion .jd-accordion__chevron {
        transition: none;
      }
    }
  }
`;
