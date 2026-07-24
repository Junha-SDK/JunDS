/**
 * jd-floating-action-button CSS — v2 composites/FloatingActionButton의 토큰 번역.
 *
 * v2 값: 컨테이너 fixed z-40 flex gap-2, 위치 4종은 전부 6(=24px) 오프셋,
 * bottom-* 는 flex-col-reverse(첫 액션이 아래), 행은 relative flex items-center +
 * 우측 정렬(우측 위치일 때), 버튼은 rounded-full shadow-lg, 첫 버튼 w-14 h-14 text-lg /
 * 나머지 w-11 h-11 text-sm, 툴팁은 gray-900 알약 + 2px 간격.
 *
 * 색 번역: v2는 blue-600/gray-600/red-600 리터럴이었다(디자인 시스템 밖의 Tailwind
 * 팔레트 — 테마 전환도 리브랜딩도 따라오지 못한다). 시맨틱 토큰으로 옮기되
 * **흰 글자 대비를 라이트·다크 양쪽에서** 맞췄다(실측, 배경 대 #fff):
 *   - primary  var(--jd-color-primary) 그대로 → 6.3 / 6.3 ✔
 *   - danger   원색은 다크에서 #dc3f3f로 밝아져 4.3까지 떨어진다(AA 미달) →
 *              검정 15%를 섞어 6.6 / 5.1 ✔. 라이트도 v2 red-600(4.7)보다 낫다.
 *   - secondary v2 gray-600은 중립 **어두운** 회색이었는데 --jd-color-muted는
 *              다크에서 #a09cb5로 뒤집혀 흰 글자가 2.7까지 무너진다 → 양 테마 동일값인
 *              surface-overlay(칩 표면)로 고정 → 15.9 / 15.9 ✔. jd-snackbar와 같은 선택.
 * 색 그림자(v2 shadow-blue-200)는 변종 색을 25% 섞어 재현한다.
 *
 * 위치는 물리 top/bottom/left/right — `position="bottom-left"`가 RTL에서 오른쪽에
 * 붙으면 프롭 이름이 거짓말이 된다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  /* 기본 = bottom-right. 디폴트값은 attribute로 반영되지 않으므로(§1.3) base가 담당 */
  jd-floating-action-button {
    position: fixed; z-index: var(--jd-z-overlay);
    display: flex; flex-direction: column-reverse;
    gap: var(--jd-space-2);
    bottom: var(--jd-space-6); right: var(--jd-space-6);
    top: auto; left: auto;
    font-family: var(--jd-font-sans);
  }
  jd-floating-action-button[position="bottom-left"] {
    right: auto; left: var(--jd-space-6);
  }
  jd-floating-action-button[position="top-right"] {
    flex-direction: column; bottom: auto; top: var(--jd-space-6);
  }
  jd-floating-action-button[position="top-left"] {
    flex-direction: column; bottom: auto; top: var(--jd-space-6);
    right: auto; left: var(--jd-space-6);
  }

  .jd-floating-action-button__row {
    position: relative;
    display: flex; align-items: center; justify-content: flex-end;
    animation: jd-floating-action-button-in var(--jd-duration-normal) var(--jd-easing-ease-out) backwards;
    animation-delay: calc(var(--jd-floating-action-button-i, 0) * 50ms);
  }
  jd-floating-action-button[position="bottom-left"] .jd-floating-action-button__row,
  jd-floating-action-button[position="top-left"] .jd-floating-action-button__row {
    justify-content: flex-start;
  }
  @keyframes jd-floating-action-button-in { from { opacity: 0; transform: scale(.8); } }

  .jd-floating-action-button__button {
    display: inline-flex; align-items: center; justify-content: center;
    flex-shrink: 0; box-sizing: border-box;
    /* 부(副) 액션 기본 — v2 w-11 h-11 text-sm */
    width: 2.75rem; height: 2.75rem;
    padding: 0; border: 0;
    font-family: inherit; font-size: var(--jd-text-sm);
    color: #ffffff;
    border-radius: var(--jd-radius-full);
    cursor: pointer;
    transition:
      background var(--jd-duration-normal) var(--jd-easing-ease-out),
      box-shadow var(--jd-duration-normal) var(--jd-easing-ease-out);
  }
  /* 주(主) 액션 = 첫 액션 — v2 w-14 h-14 text-lg.
     :first-child는 쓸 수 없다: 아이콘 <template>이 호스트의 첫 자식이라 빗나간다 */
  .jd-floating-action-button__row[data-primary] > .jd-floating-action-button__button {
    width: 3.5rem; height: 3.5rem; font-size: var(--jd-text-lg);
  }
  .jd-floating-action-button__button:disabled { opacity: var(--jd-opacity-40); cursor: not-allowed; }
  .jd-floating-action-button__button:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring), var(--jd-shadow-lg);
  }

  .jd-floating-action-button__icon {
    display: inline-flex; align-items: center; justify-content: center;
    line-height: 1;
  }
  .jd-floating-action-button__icon > svg { width: 1.25em; height: 1.25em; }

  /* variant — 배경·호버·색 그림자 3종 (v2 variantStyles) */
  .jd-floating-action-button__button[data-variant="primary"] {
    background: var(--jd-color-primary);
    box-shadow: var(--jd-shadow-lg), 0 8px 18px color-mix(in srgb, var(--jd-color-primary) 25%, transparent);
  }
  .jd-floating-action-button__button[data-variant="primary"]:hover:not(:disabled) {
    background: var(--jd-color-primary-hover);
  }
  .jd-floating-action-button__button[data-variant="secondary"] {
    background: var(--jd-color-surface-overlay);
    box-shadow: var(--jd-shadow-lg), 0 8px 18px color-mix(in srgb, var(--jd-color-surface-overlay) 25%, transparent);
  }
  /* 라이트에선 더 어둡게, 다크에선 더 밝게 — 어느 테마에서도 호버가 보인다 */
  .jd-floating-action-button__button[data-variant="secondary"]:hover:not(:disabled) {
    background: color-mix(in srgb, var(--jd-color-surface-overlay) 80%, var(--jd-color-foreground));
  }
  .jd-floating-action-button__button[data-variant="danger"] {
    background: color-mix(in srgb, var(--jd-color-danger) 85%, #000000);
    box-shadow: var(--jd-shadow-lg), 0 8px 18px color-mix(in srgb, var(--jd-color-danger) 25%, transparent);
  }
  .jd-floating-action-button__button[data-variant="danger"]:hover:not(:disabled) {
    background: color-mix(in srgb, var(--jd-color-danger) 70%, #000000);
  }

  .jd-floating-action-button__tooltip {
    position: absolute;
    right: 100%; margin-right: var(--jd-space-2);
    padding: var(--jd-space-1) var(--jd-space-2);
    white-space: nowrap; pointer-events: none;
    font-size: var(--jd-text-xs); font-weight: var(--jd-weight-medium);
    color: #ffffff; background: var(--jd-color-surface-overlay);
    border-radius: var(--jd-radius-md); box-shadow: var(--jd-shadow-md);
    opacity: 0;
    transition: opacity var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  jd-floating-action-button[position="bottom-left"] .jd-floating-action-button__tooltip,
  jd-floating-action-button[position="top-left"] .jd-floating-action-button__tooltip {
    right: auto; margin-right: 0;
    left: 100%; margin-left: var(--jd-space-2);
  }
  /* v2는 마우스 hover 전용이었다 — 포커스에도 뜬다 */
  .jd-floating-action-button__row:hover > .jd-floating-action-button__tooltip,
  .jd-floating-action-button__row:focus-within > .jd-floating-action-button__tooltip {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-floating-action-button__row { animation: none; }
    .jd-floating-action-button__button,
    .jd-floating-action-button__tooltip { transition: none; }
  }
}`;
