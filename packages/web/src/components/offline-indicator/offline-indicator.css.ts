import { css } from "../../core/styles.js";

/**
 * v2 값: fixed left-0 right-0 z-50, top-0 또는 bottom-0, flex 중앙정렬 gap-2,
 * px-4 py-2, text-sm font-medium, 오프라인 bg-danger / 복구 bg-success, 흰 글자,
 * 앞머리 점 w-2 h-2 rounded-full bg-current opacity-80.
 *
 * 리전 노드는 **항상 문서에 남는다**(element.ts 참조) — 감추는 것은 visibility가
 * 아니라 display여야 레이아웃을 먹지 않으면서도 라이브 리전 등록이 유지된다.
 */
export default css`
@layer junds.components {
  jd-offline-indicator {
    display: none;
    box-sizing: border-box;
    position: fixed; inset-inline: 0; z-index: var(--jd-z-modal);
    align-items: center; justify-content: center; gap: var(--jd-space-2);
    padding: var(--jd-space-2) var(--jd-space-4);
    font-family: var(--jd-font-sans); font-size: var(--jd-text-sm);
    font-weight: var(--jd-weight-medium);
    color: #fff; background: var(--jd-color-danger);
    inset-block-start: 0; /* position 기본 top */
  }
  jd-offline-indicator[visible] { display: flex; }
  jd-offline-indicator[position="bottom"] {
    inset-block-start: auto; inset-block-end: 0;
  }
  jd-offline-indicator[online] { background: var(--jd-color-success); }

  .jd-offline-indicator__dot {
    width: 0.5rem; height: 0.5rem; flex-shrink: 0;
    border-radius: var(--jd-radius-full);
    background: currentColor; opacity: var(--jd-opacity-80);
  }
}`;
