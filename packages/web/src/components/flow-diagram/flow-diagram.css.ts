import { css } from "../../core/styles.js";

/**
 * v2 값(Tailwind → 의미 번역). 노드 에디터는 고정 다크 서피스(gray-950 캔버스 / gray-900
 * 노드)라 그 팔레트는 컴포넌트 고유 색 리터럴로 유지한다(§4.3) — 테마로 뒤집지 않는다.
 * 선택·연결 강조와 격자만 시맨틱 토큰(primary/muted)을 쓴다. 좌표·치수는 JS 인라인.
 */
export default css`
@layer junds.base {
  jd-flow-diagram:not(:defined) { display: block; }
}
@layer junds.components {
  jd-flow-diagram {
    display: block; position: relative; box-sizing: border-box;
    width: 100%; min-height: 400px; overflow: hidden;
    background: #030712; /* gray-950 */
    font-family: var(--jd-font-sans);
    outline: none; touch-action: none; cursor: default;
  }
  jd-flow-diagram:focus-visible { box-shadow: inset 0 0 0 2px var(--jd-color-primary); }
  jd-flow-diagram[data-grabbing] { cursor: grabbing; }
  jd-flow-diagram[data-space] { cursor: grab; }

  /* 격자 */
  .jd-flow__grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image: radial-gradient(circle, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
  }
  .jd-flow__grid[hidden] { display: none; }

  /* 변환 레이어 */
  .jd-flow__viewport { position: absolute; top: 0; left: 0; transform-origin: 0 0; }
  .jd-flow__nodes, .jd-flow__groups { position: absolute; top: 0; left: 0; }

  /* 연결선 SVG */
  .jd-flow__links {
    position: absolute; top: 0; left: 0; width: 1px; height: 1px;
    overflow: visible; pointer-events: none;
  }
  .jd-flow__link-hit {
    stroke: transparent; stroke-width: 14; fill: none;
    pointer-events: stroke; cursor: pointer;
  }
  .jd-flow__link-line {
    stroke: var(--jd-color-muted); stroke-width: 2; fill: none; stroke-linecap: round;
    pointer-events: none;
  }
  .jd-flow__link-line[data-animate] {
    stroke-dasharray: 6 4; animation: jd-flow-dash 0.8s linear infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .jd-flow__link-line[data-animate] { animation: none; }
  }
  @keyframes jd-flow-dash { to { stroke-dashoffset: -20; } }
  .jd-flow__link-arrow { fill: var(--jd-color-muted); pointer-events: none; }
  .jd-flow__link[data-selected] .jd-flow__link-line { stroke: var(--jd-color-primary); stroke-width: 3; }
  .jd-flow__link[data-selected] .jd-flow__link-arrow { fill: var(--jd-color-primary); }
  .jd-flow__link-label-bg { fill: var(--jd-color-neutral-900); stroke: var(--jd-color-neutral-800); stroke-width: 1; pointer-events: none; }
  .jd-flow__link-label {
    fill: var(--jd-color-neutral-300); font-size: 10px; font-family: var(--jd-font-sans); pointer-events: none;
  }

  /* 노드 카드 */
  .jd-flow__node {
    position: absolute; user-select: none; overflow: visible;
    border-radius: var(--jd-radius-xl);
    border: 2px solid var(--jd-color-muted);
    background: var(--jd-color-neutral-900); color: #fff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
  .jd-flow__node[data-selected] {
    box-shadow: 0 0 0 2px var(--jd-color-primary), 0 4px 24px rgba(0, 0, 0, 0.4);
    z-index: 10;
  }
  .jd-flow__node[data-variant="success"] { border-color: var(--jd-color-success); }
  .jd-flow__node[data-variant="warning"] { border-color: var(--jd-color-warning); }
  .jd-flow__node[data-variant="danger"] { border-color: var(--jd-color-danger); }
  .jd-flow__node[data-variant="info"] { border-color: var(--jd-color-primary); }

  .jd-flow__node-header {
    display: flex; align-items: center; gap: var(--jd-space-1-5);
    padding: var(--jd-space-2) var(--jd-space-3);
    font-size: var(--jd-text-sm); font-weight: var(--jd-weight-bold);
    border-block-end: 1px solid var(--jd-color-muted);
    border-start-start-radius: 10px; border-start-end-radius: 10px;
    background: var(--jd-color-neutral-800); color: #cbd5e1;
  }
  .jd-flow__node[data-variant="success"] .jd-flow__node-header { background: #14532d; color: var(--jd-color-success-light); border-color: var(--jd-color-success); }
  .jd-flow__node[data-variant="warning"] .jd-flow__node-header { background: #78350f; color: var(--jd-color-warning-light); border-color: var(--jd-color-warning); }
  .jd-flow__node[data-variant="danger"] .jd-flow__node-header { background: #7f1d1d; color: var(--jd-color-danger-light); border-color: var(--jd-color-danger); }
  .jd-flow__node[data-variant="info"] .jd-flow__node-header { background: #1e3a5f; color: var(--jd-color-primary-light); border-color: var(--jd-color-primary); }
  .jd-flow__node-icon { flex-shrink: 0; font-size: var(--jd-text-md); }
  .jd-flow__node-icon[hidden] { display: none; }
  .jd-flow__node-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .jd-flow__node-body {
    padding: var(--jd-space-2) var(--jd-space-3);
    font-size: var(--jd-text-xs); color: #9ca3af;
  }
  .jd-flow__node-body[hidden] { display: none; }

  /* 포트 */
  .jd-flow__ports { position: absolute; inset: 0; pointer-events: none; }
  .jd-flow__port {
    position: absolute; width: 12px; height: 12px; border-radius: var(--jd-radius-full);
    border: 2px solid var(--jd-color-neutral-300); background: #3b82f6; z-index: 20;
    cursor: crosshair; pointer-events: auto;
    transition: transform var(--jd-duration-fast) var(--jd-easing-default);
  }
  .jd-flow__port:hover { transform: scale(1.5); }
  .jd-flow__port[data-readonly] { cursor: default; opacity: 0.4; }
  .jd-flow__port[data-readonly]:hover { transform: none; }

  /* 그룹 */
  .jd-flow__group {
    position: absolute; pointer-events: none; border-radius: var(--jd-radius-2xl);
    background: color-mix(in srgb, var(--jd-flow-group, #818cf8) 8%, transparent);
    border: 2px dashed color-mix(in srgb, var(--jd-flow-group, #818cf8) 40%, transparent);
  }
  .jd-flow__group-label {
    position: absolute; top: 6px; left: 12px;
    font-size: 10px; font-weight: var(--jd-weight-bold);
    text-transform: uppercase; letter-spacing: var(--jd-tracking-wide);
    color: var(--jd-flow-group, #818cf8);
  }

  /* 범위 선택 박스 */
  .jd-flow__marquee {
    position: absolute; pointer-events: none; border-radius: var(--jd-radius-lg);
    border: 2px dashed rgba(236, 72, 153, 0.6); background: rgba(236, 72, 153, 0.1);
  }
  .jd-flow__marquee[hidden] { display: none; }

  /* 미니맵 */
  .jd-flow__minimap {
    position: absolute; top: var(--jd-space-3); right: var(--jd-space-3); z-index: 20;
    width: 150px; height: 90px; border-radius: var(--jd-radius-lg);
    border: 1px solid var(--jd-color-neutral-800); background: rgba(17, 24, 39, 0.9);
    -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
  }
  .jd-flow__minimap[hidden] { display: none; }
  .jd-flow__mini-link { stroke: var(--jd-color-muted); stroke-width: 0.8; }
  .jd-flow__mini-node { fill: var(--jd-color-neutral-800); stroke: var(--jd-color-muted); stroke-width: 0.5; }
  .jd-flow__mini-view { fill: none; stroke: var(--jd-color-primary); stroke-width: 1.5; }

  /* 줌 컨트롤 */
  .jd-flow__zoom {
    position: absolute; bottom: var(--jd-space-4); right: var(--jd-space-4); z-index: 20;
    display: flex; flex-direction: column; gap: var(--jd-space-1);
  }
  .jd-flow__zoom-btn {
    width: 2rem; height: 2rem; border: 0; border-radius: var(--jd-radius-lg);
    display: inline-flex; align-items: center; justify-content: center;
    background: rgba(31, 41, 55, 0.9); color: #fff; cursor: pointer;
    font-family: inherit; font-size: var(--jd-text-sm); line-height: 1;
    transition: background-color var(--jd-duration-fast) var(--jd-easing-default);
  }
  .jd-flow__zoom-btn:hover { background: var(--jd-color-neutral-800); }
  .jd-flow__zoom-btn:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }
  .jd-flow__zoom-label { font-size: 10px; }

  /* 단축키 힌트 */
  .jd-flow__hint {
    position: absolute; bottom: var(--jd-space-4); left: var(--jd-space-4); z-index: 20;
    font-size: 10px; color: #4b5563; user-select: none; pointer-events: none;
  }
}`;
