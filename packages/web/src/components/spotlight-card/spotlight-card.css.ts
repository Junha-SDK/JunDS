import { css } from "../../core/styles.js";

/**
 * v2 값: `relative overflow-hidden rounded-2xl border border-border bg-white p-6
 * transition-shadow duration-300 hover:shadow-lg` + 글로우
 * `radial-gradient({size}px circle at {x}px {y}px, {color}, transparent 60%)`.
 *
 * v2 기본 색 `rgba(var(--primary-rgb, 91, 76, 199), 0.08)`의 --primary-rgb는 v2 어디에도
 * 정의된 적이 없어 항상 폴백 91,76,199 = --jd-color-primary(#5b4cc7)였다 —
 * color-mix(primary 8%)로 번역하면 값이 같고 리브랜딩까지 따라온다(DEC-011-1 계열).
 */
export default css`
@layer junds.base {
  jd-spotlight-card:not(:defined) { display: block; }
}
@layer junds.components {
  jd-spotlight-card {
    --jd-spotlight-card-color: color-mix(in srgb, var(--jd-color-primary) 8%, transparent);
    --jd-spotlight-card-size: 300px;
    --jd-spotlight-card-x: 50%;
    --jd-spotlight-card-y: 50%;

    display: block;
    position: relative;
    isolation: isolate; /* ::before의 z-index:-1이 호스트 배경 위·콘텐츠 아래에 들어가게 */
    overflow: hidden;
    box-sizing: border-box;
    padding: var(--jd-space-6);
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
    background: var(--jd-color-card);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-2xl);
    transition: box-shadow var(--jd-duration-slow) var(--jd-easing-ease-out);
  }
  jd-spotlight-card:hover { box-shadow: var(--jd-shadow-lg); }

  jd-spotlight-card::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    opacity: 0;
    transition: opacity var(--jd-duration-slow) var(--jd-easing-ease-out);
    background: radial-gradient(
      var(--jd-spotlight-card-size) circle at
        var(--jd-spotlight-card-x) var(--jd-spotlight-card-y),
      var(--jd-spotlight-card-color),
      transparent 60%
    );
  }
  jd-spotlight-card[data-hovered]::before { opacity: 1; }

  @media (prefers-reduced-motion: reduce) {
    jd-spotlight-card,
    jd-spotlight-card::before { transition: none; }
  }
}`;
