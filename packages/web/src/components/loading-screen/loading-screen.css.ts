import { css } from "../../core/styles.js";

/**
 * v2 값: flex-col items-center justify-center gap-4, 풀스크린 fixed inset-0 z-50
 * min-h-screen / 컨테이너형 min-h-[200px], 배경 bg-background/80 + backdrop-blur-sm,
 * 스피너 40px, bars 5개(w-1.5, 컨테이너 h-10, 0.1s씩 지연, scaleY .4↔1),
 * pulse 12(3rem) + inset-2 코어 + ping, 메시지 text-sm muted,
 * 진행 바 w-48 h-1 rounded-full(트랙 surface-soft, 채움 primary, 300ms).
 *
 * v2는 `bars` 변형이 렌더될 때마다 `<style>` 태그를 **인스턴스마다** JSX 안에
 * 심었다(keyframes 중복 정의). v3는 시트에 한 번만 둔다.
 */
export default css`
@layer junds.components {
  jd-loading-screen {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: var(--jd-space-4); box-sizing: border-box;
    font-family: var(--jd-font-sans);
    /* 기본은 풀스크린 — v2 fullscreen=true 승계 */
    position: fixed; inset: 0; z-index: var(--jd-z-modal); min-height: 100vh;
    background: color-mix(in srgb, var(--jd-color-background) 80%, transparent);
    backdrop-filter: blur(4px);
  }
  /* v2 fullscreen=false — 기본이 true인 프롭은 부정형으로 뒤집는다(jd-number-input 선례) */
  jd-loading-screen[contained] {
    position: static; inset: auto; z-index: auto;
    min-height: 200px; width: 100%;
  }
  jd-loading-screen[transparent] { background: none; backdrop-filter: none; }

  .jd-loading-screen__visual { display: flex; align-items: center; justify-content: center; }
  .jd-loading-screen__art { display: flex; align-items: flex-end; justify-content: center; }
  .jd-loading-screen__art[hidden] { display: none; }
  /* 로고는 소비자 노드다 — 변형이 바뀌어도 파괴하지 않고 감추기만 한다 */
  jd-loading-screen:not([variant="logo"]) .jd-loading-screen__visual > [slot="logo"] {
    display: none;
  }

  /* spinner — jd-spinner·jd-button과 같은 SVG(치수만 40px) */
  .jd-loading-screen__spinner {
    width: 40px; height: 40px; color: var(--jd-color-primary-ink);
    animation: jd-spin 1s linear infinite;
  }

  /* bars */
  .jd-loading-screen__bars { display: flex; align-items: flex-end; gap: var(--jd-space-1); height: 2.5rem; }
  .jd-loading-screen__bar {
    width: 0.375rem; height: 100%;
    background: var(--jd-color-primary); border-radius: var(--jd-radius-full);
    animation: jd-loading-screen-bars 1s ease-in-out infinite;
    animation-delay: calc(var(--jd-bar-index, 0) * 0.1s);
  }

  /* pulse */
  .jd-loading-screen__pulse { position: relative; width: 3rem; height: 3rem; }
  .jd-loading-screen__ping {
    position: absolute; inset: 0; border-radius: var(--jd-radius-full);
    background: color-mix(in srgb, var(--jd-color-primary) 30%, transparent);
    animation: jd-loading-screen-ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
  .jd-loading-screen__core {
    position: absolute; inset: var(--jd-space-2);
    border-radius: var(--jd-radius-full); background: var(--jd-color-primary);
  }

  .jd-loading-screen__message {
    margin: 0; font-size: var(--jd-text-md); color: var(--jd-color-muted); text-align: center;
  }
  .jd-loading-screen__message[hidden] { display: none; }

  .jd-loading-screen__progress {
    width: 12rem; height: 0.25rem; overflow: hidden;
    background: var(--jd-color-border-light); border-radius: var(--jd-radius-full);
  }
  .jd-loading-screen__progress[hidden] { display: none; }
  .jd-loading-screen__fill {
    height: 100%; background: var(--jd-color-primary);
    transition: width var(--jd-duration-slow) var(--jd-easing-default);
  }

  @keyframes jd-spin { to { transform: rotate(360deg); } }
  @keyframes jd-loading-screen-bars {
    0%, 100% { transform: scaleY(0.4); }
    50% { transform: scaleY(1); }
  }
  @keyframes jd-loading-screen-ping {
    75%, 100% { transform: scale(2); opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .jd-loading-screen__spinner { animation-duration: 1.6s; }
    .jd-loading-screen__bar,
    .jd-loading-screen__ping { animation: none; }
    .jd-loading-screen__fill { transition: none; }
  }
}`;
