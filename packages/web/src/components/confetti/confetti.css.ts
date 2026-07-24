/**
 * jd-confetti CSS — v2 Confetti의 토큰 번역.
 *
 * v2 값: 껍데기 `fixed inset-0 z-[9999] pointer-events-none overflow-hidden`,
 * 조각 `absolute top-0` + left/animationDelay 인라인 + `confetti-fall {duration}ms
 * cubic-bezier(.25,.46,.45,.94) forwards`, 알맹이 width/height/backgroundColor/
 * borderRadius 인라인 + `confetti-spin {600~1000}ms linear infinite`,
 * 낙하 키프레임 `translateY(-10vh) rotate(0)` → `translateY(110vh) rotate(720deg)`.
 *
 * 회전 판단: v2는 알맹이에 정적 `rotate(Xdeg)`와 `to { rotate(360deg) }`를 함께 걸어,
 * 시작 각이 클수록 회전 폭이 줄어드는(360도에 가까우면 거의 안 도는) 부작용이 있었다.
 * v3는 from/to를 `--jd-confetti-rot` 기준으로 잡아 어느 조각이든 한 바퀴를 돈다.
 *
 * 인스턴스마다 <style>을 심던 v2와 달리 키프레임은 문서에 1장만 채택된다(§4.1).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  /* 덮개는 발사 중에만 존재한다 — 그 외에는 문서에 아무 상자도 만들지 않는다 */
  jd-confetti { display: none; }
  jd-confetti[data-running] {
    display: block;
    position: fixed;
    inset: 0;
    z-index: var(--jd-z-max);
    pointer-events: none;
    overflow: hidden;
  }

  .jd-confetti__piece {
    position: absolute;
    top: 0;
    left: var(--jd-confetti-x, 50%);
    animation: jd-confetti-fall var(--jd-confetti-fall, 3000ms)
      cubic-bezier(0.25, 0.46, 0.45, 0.94) var(--jd-confetti-delay, 0ms) forwards;
  }

  .jd-confetti__bit {
    display: block;
    width: var(--jd-confetti-w, 8px);
    height: var(--jd-confetti-h, 8px);
    background: var(--jd-confetti-color, var(--jd-color-primary));
    border-radius: 2px; /* v2 square/strip */
    animation: jd-confetti-spin var(--jd-confetti-spin, 800ms) linear infinite;
  }
  .jd-confetti__bit[data-shape="circle"] { border-radius: var(--jd-radius-full); }

  @keyframes jd-confetti-fall {
    0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
  }
  @keyframes jd-confetti-spin {
    from { transform: rotate(var(--jd-confetti-rot, 0deg)); }
    to { transform: rotate(calc(var(--jd-confetti-rot, 0deg) + 360deg)); }
  }

  /* element가 감속 선호에서는 조각을 아예 만들지 않는다 — 여기 규칙은 이중 안전망 */
  @media (prefers-reduced-motion: reduce) {
    .jd-confetti__piece,
    .jd-confetti__bit { animation: none; }
    jd-confetti[data-running] { display: none; }
  }
}`;
