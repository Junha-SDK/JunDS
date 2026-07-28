import { css } from "../../core/styles.js";

/**
 * v2 값: fixed left-0 right-0 z-50, top-0 또는 bottom-0, flex 중앙정렬 gap-2,
 * px-4 py-2, text-sm font-medium, 오프라인 bg-danger / 복구 bg-success, 흰 글자,
 * 앞머리 점 w-2 h-2 rounded-full bg-current opacity-80.
 *
 * 리전 노드는 **항상 문서에 남는다**(element.ts 참조) — 감추는 것은 visibility가
 * 아니라 display여야 레이아웃을 먹지 않으면서도 라이브 리전 등록이 유지된다.
 *
 * v2 치수에서 올린 것 둘:
 *  · 글자를 text-sm → text-md로. 이 띠는 "지금 인터넷이 끊겼다"는 단 하나의 문장을
 *    나르는데, 화면 끝에 붙은 얇은 띠 안에서 13px은 배경으로 흘러갔다(§9).
 *  · 흰 글자를 받는 배경을 jd-banner와 같은 처방으로 눅였다 — success 원색 위 흰
 *    글자는 4.0:1로 AA 미달이다(DEC-030-7의 배경판).
 */
export default css`
  @layer junds.components {
    jd-offline-indicator {
      display: none;
      box-sizing: border-box;
      position: fixed;
      inset-inline: 0;
      z-index: var(--jd-z-modal);
      align-items: center;
      justify-content: center;
      gap: var(--jd-space-2-5);
      padding: var(--jd-space-3) var(--jd-space-5);
      min-height: 2.75rem;
      font-family: var(--jd-font-sans);
      font-size: var(--jd-text-md);
      font-weight: var(--jd-weight-semibold);
      line-height: var(--jd-leading-snug);
      text-wrap: balance; /* 좁은 폭에서 접힐 때 한 단어만 남는 둘째 줄을 막는다 */
      color: #fff;
      background: color-mix(in srgb, var(--_jd-offline-color) 80%, var(--jd-color-foreground));
      /* 문서 위에 떠 있는 띠다 — 경계선 대신 그림자로 본문과 분리한다(§2) */
      box-shadow: var(--jd-shadow-lg);
      /* 끊김 → 복구는 같은 띠가 색만 바꾸는 사건이다. 즉시 갈아치우면 무엇이 바뀐 건지
       보이지 않는다 — 색만 전이한다(레이아웃 속성은 대상 밖, §3). */
      transition: background-color var(--jd-duration-normal) var(--jd-easing-ease-out);
      --_jd-offline-color: var(--jd-color-danger);
      inset-block-start: 0; /* position 기본 top */
    }
    jd-offline-indicator[visible] {
      display: flex;
    }
    jd-offline-indicator[position="bottom"] {
      inset-block-start: auto;
      inset-block-end: 0;
    }
    jd-offline-indicator[online] {
      --_jd-offline-color: var(--jd-color-success);
    }

    .jd-offline-indicator__dot {
      width: 0.5rem;
      height: 0.5rem;
      flex-shrink: 0;
      border-radius: var(--jd-radius-full);
      background: currentColor;
      opacity: var(--jd-opacity-80);
    }

    @media (prefers-reduced-motion: reduce) {
      jd-offline-indicator {
        transition: none;
      }
    }
  }
`;
