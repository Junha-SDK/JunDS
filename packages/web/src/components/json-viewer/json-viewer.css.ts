/**
 * jd-json-viewer CSS — v2 composites/JSONViewer(rounded-xl 테두리 · gray-950/gray-100
 * 등폭 패널 · depth×16px 들여쓰기 · 90도 회전 셰브론 · 타입별 색)의 토큰 번역.
 *
 * 들여쓰기는 v2가 노드마다 계산해 인라인 style로 박던 값(depth*16)이었다 — 중첩
 * 구조라 자식 컨테이너 padding 한 줄이면 같은 그림이 나온다(JS 계산 0).
 *
 * 값 색: 패널이 라이트·다크 모두 어두운 면이라 semantic 원색은 대비가 모자란다
 * (primary #5b4cc7 on #030712 = 3.2:1, AA 미달). 흰색과 섞은 패널 지역 파생색을
 * 쓴다 — DEC-027에서 axe가 실측으로 같은 결함을 잡았던 code.css.ts와 같은 판단이다.
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-json-viewer {
    display: block; box-sizing: border-box;
    padding: var(--jd-space-3);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-radius: var(--jd-radius-xl);
    background: var(--jd-color-surface); color: var(--jd-color-on-surface); /* 항상 어두운 코드 면 (DEC-041) */
    font-family: var(--jd-font-mono); font-size: var(--jd-text-xs);
    line-height: var(--jd-leading-normal);
    overflow: auto;
    --_jd-json-key: color-mix(in srgb, var(--jd-color-primary) 35%, #ffffff);
    --_jd-json-string: color-mix(in srgb, var(--jd-color-success) 55%, #ffffff);
    --_jd-json-number: color-mix(in srgb, var(--jd-color-primary) 45%, #ffffff);
    --_jd-json-boolean: color-mix(in srgb, var(--jd-color-warning) 55%, #ffffff);
    --_jd-json-null: color-mix(in srgb, var(--jd-color-danger) 55%, #ffffff);
  }
  jd-json-viewer:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring);
  }

  .jd-json-viewer__leaf { display: flex; white-space: pre; }

  .jd-json-viewer__name { color: var(--_jd-json-key); }
  .jd-json-viewer__value { color: var(--jd-color-on-surface); }
  .jd-json-viewer__value[data-kind="string"] { color: var(--_jd-json-string); }
  .jd-json-viewer__value[data-kind="number"] { color: var(--_jd-json-number); }
  .jd-json-viewer__value[data-kind="boolean"] { color: var(--_jd-json-boolean); }
  .jd-json-viewer__value[data-kind="null"] { color: var(--_jd-json-null); }

  /* 개폐는 네이티브 details — 마커만 지우고 셰브론을 우리가 그린다 */
  .jd-json-viewer__summary {
    display: inline-flex; align-items: center; gap: var(--jd-space-1);
    padding-inline: var(--jd-space-1); margin-inline-start: calc(var(--jd-space-1) * -1);
    border-radius: var(--jd-radius-sm);
    cursor: pointer; list-style: none; white-space: pre;
  }
  .jd-json-viewer__summary::-webkit-details-marker { display: none; }
  .jd-json-viewer__summary:hover {
    background: color-mix(in srgb, var(--jd-color-primary) 20%, transparent);
  }
  .jd-json-viewer__summary:focus-visible {
    outline: none; box-shadow: var(--jd-shadow-focus-ring);
  }
  .jd-json-viewer__count { color: var(--jd-color-muted-light); }

  .jd-json-viewer__chevron {
    flex-shrink: 0;
    transition: transform var(--jd-duration-fast) var(--jd-easing-ease-out);
  }
  details[open] > .jd-json-viewer__summary > .jd-json-viewer__chevron {
    transform: rotate(90deg);
  }

  .jd-json-viewer__children { padding-inline-start: var(--jd-space-4); }

  @media (prefers-reduced-motion: reduce) {
    .jd-json-viewer__chevron { transition: none; }
  }
}`;
