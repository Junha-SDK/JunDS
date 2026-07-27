import { css } from "../../core/styles.js";

/**
 * v2 값: 블록 bg-gray-200 + animate-pulse(Tailwind 기본 pulse 2s), 기본 radius
 * `rounded`(0.25rem) · circle `rounded-full` · rect `rounded-lg`. text 변형은
 * 컨테이너(flex-col gap-2) + 줄 h-3.5(0.875rem), 마지막 줄 75%.
 *
 * 기본 variant(text)의 규칙은 **맨 호스트 셀렉터**가 갖는다 — default는 프로퍼티
 * 기본값일 뿐 attribute로 나가지 않는다(jd-badge 선례).
 *
 * 판단 2건:
 * 1. **`.jd-skeleton-block`을 공개 관용구로 뺀다.** jd-skeleton-preset이 같은 반짝임을
 *    다시 정의하지 않고 이 시트를 채택해 쓴다 — 색·박자의 단일 출처(§6 R12).
 * 2. **다크 테마 색을 준다.** v2는 `bg-gray-200`(#e5e7eb) 고정이라 다크 배경에서
 *    자리표시자가 오히려 본문보다 밝게 빛났다. 토큰 경유 오버라이드로 교정.
 */
export default css`
@layer junds.components {
  /* text 기본 — 줄 컨테이너 */
  jd-skeleton {
    display: flex; flex-direction: column; gap: var(--jd-space-2);
  }

  /* 반짝이는 블록 자체 — 프리셋도 .jd-skeleton-block으로 이 규칙을 공유한다.
     span에 높이를 주려면 block이어야 한다(인라인은 height를 무시). */
  jd-skeleton[variant="circle"],
  jd-skeleton[variant="rect"],
  .jd-skeleton__line,
  .jd-skeleton-block {
    display: block;
    background: var(--jd-skeleton-color, var(--jd-color-neutral-200));
    border-radius: var(--jd-skeleton-radius, var(--jd-radius-sm));
    animation: jd-skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  jd-skeleton[variant="circle"] { border-radius: var(--jd-skeleton-radius, var(--jd-radius-full)); }
  jd-skeleton[variant="rect"] { border-radius: var(--jd-skeleton-radius, var(--jd-radius-lg)); }

  .jd-skeleton__line { height: 0.875rem; flex-shrink: 0; } /* v2 h-3.5 */

  [data-jd-theme="dark"] jd-skeleton,
  [data-theme="dark"] jd-skeleton,
  [data-jd-theme="dark"] .jd-skeleton-block,
  [data-theme="dark"] .jd-skeleton-block {
    --jd-skeleton-color: var(--jd-color-border);
  }

  @keyframes jd-skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
  }
  @media (prefers-reduced-motion: reduce) {
    jd-skeleton[variant="circle"],
    jd-skeleton[variant="rect"],
    .jd-skeleton__line,
    .jd-skeleton-block { animation: none; }
  }
}`;
