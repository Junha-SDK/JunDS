import { css } from "../../core/styles.js";

/**
 * v2 값: 트랙 bg-gray-100 rounded-full overflow-hidden, 높이 sm h-1.5 / md h-2.5 /
 * lg h-4, 채움 색 primary·success·warning·danger, transition 500ms,
 * `animated`는 `animate-progress`(= progress-fill 1s, from{width:0} forwards),
 * 헤더 라벨 text-xs medium foreground · 값 text-xs muted tabular-nums, mb-1.
 *
 * 기본 size(md)·variant(default) 규칙은 맨 셀렉터가 갖는다(default는 attribute로
 * 나가지 않는다 — jd-badge 선례).
 *
 * `--jd-progress-bar-height`는 **여기서 정의하지 않고 읽기만 한다** — 정의를 두면
 * `[size="sm"]`(0,1,1)이 바깥 정의를 이겨 합성이 막힌다. 바깥(jd-loading-screen 등)이
 * 유일한 정의자가 되게 두는 것이 이 관용구의 핵심이다.
 */
export default css`
@layer junds.components {
  jd-progress-bar {
    display: block; width: 100%; box-sizing: border-box;
    font-family: var(--jd-font-sans);
  }

  .jd-progress-bar__header {
    display: flex; align-items: center; justify-content: space-between;
    margin-block-end: var(--jd-space-1);
    font-size: var(--jd-text-xs);
  }
  /* 저작 display가 UA의 [hidden] 규칙을 이긴다 — 명시 규칙 필수(레포 관용구) */
  .jd-progress-bar__header[hidden] { display: none; }
  .jd-progress-bar__label {
    font-weight: var(--jd-weight-medium); color: var(--jd-color-foreground);
  }
  .jd-progress-bar__label[hidden] { display: none; }
  .jd-progress-bar__value {
    color: var(--jd-color-muted); font-variant-numeric: tabular-nums;
  }
  .jd-progress-bar__value[hidden] { display: none; }

  .jd-progress-bar__track {
    width: 100%; overflow: hidden;
    height: var(--jd-progress-bar-height, 0.625rem); /* md */
    background: var(--jd-progress-bar-track, var(--jd-color-neutral-100));
    border-radius: var(--jd-radius-full);
  }
  jd-progress-bar[size="sm"] .jd-progress-bar__track {
    height: var(--jd-progress-bar-height, 0.375rem);
  }
  jd-progress-bar[size="lg"] .jd-progress-bar__track {
    height: var(--jd-progress-bar-height, 1rem);
  }

  .jd-progress-bar__fill {
    height: 100%; border-radius: var(--jd-radius-full);
    background: var(--jd-color-primary);
    transition: width var(--jd-duration-slower) var(--jd-easing-default);
  }
  jd-progress-bar[variant="success"] .jd-progress-bar__fill { background: var(--jd-color-success); }
  jd-progress-bar[variant="warning"] .jd-progress-bar__fill { background: var(--jd-color-warning); }
  jd-progress-bar[variant="danger"] .jd-progress-bar__fill { background: var(--jd-color-danger); }

  /* v2 animate-progress — 마운트 시 0에서 차오른다 */
  jd-progress-bar[animated] .jd-progress-bar__fill {
    animation: jd-progress-fill 1s var(--jd-easing-default) forwards;
  }

  [data-jd-theme="dark"] jd-progress-bar,
  [data-theme="dark"] jd-progress-bar {
    --jd-progress-bar-track: var(--jd-color-border);
  }

  @keyframes jd-progress-fill { from { width: 0; } }

  @media (prefers-reduced-motion: reduce) {
    .jd-progress-bar__fill { transition: none; }
    jd-progress-bar[animated] .jd-progress-bar__fill { animation: none; }
  }
}`;
