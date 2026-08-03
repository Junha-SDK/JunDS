/**
 * jd-button-group 컴포넌트 CSS.
 * v2 ds/composites/ButtonGroup: inline-flex / fullWidth=w-full / separated=gap-1 /
 * 붙임 모드=[&>*]:rounded-none + 양 끝 rounded-l|r-lg + 비마지막 border-r-0.
 *
 * v3에서 자식은 <jd-button> **호스트**고 모서리·테두리는 그 안의 .jd-button이
 * 갖는다 → 규칙마다 "호스트 자식"과 "호스트 안 컨트롤" 두 층을 함께 겨눈다.
 * 맨 <button>/<a>를 직접 넣어도 첫 번째 셀렉터가 받는다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-button-group {
      display: inline-flex;
      align-items: center;
    }

    jd-button-group[full-width] {
      display: flex;
      width: 100%;
    }
    jd-button-group[full-width] > * {
      flex: 1 1 0;
      min-width: 0;
    }
    jd-button-group[full-width] > * > :is(.jd-button, .jd-icon-button) {
      width: 100%;
    }

    /* v2 separated: 간격만 두고 모서리는 각자 유지 */
    jd-button-group[separated] {
      gap: var(--jd-space-1);
    }

    /* ── 붙임 모드(기본) ── */
    jd-button-group:not([separated]) > *,
    jd-button-group:not([separated]) > * > :is(.jd-button, .jd-icon-button) {
      border-radius: 0;
    }
    jd-button-group:not([separated]) > :first-child,
    jd-button-group:not([separated]) > :first-child > :is(.jd-button, .jd-icon-button) {
      border-start-start-radius: var(--jd-radius-lg);
      border-end-start-radius: var(--jd-radius-lg);
    }
    jd-button-group:not([separated]) > :last-child,
    jd-button-group:not([separated]) > :last-child > :is(.jd-button, .jd-icon-button) {
      border-start-end-radius: var(--jd-radius-lg);
      border-end-end-radius: var(--jd-radius-lg);
    }
    /* v2 border-r-0 — 인접 테두리를 한 겹으로 */
    jd-button-group:not([separated]) > :not(:last-child),
    jd-button-group:not([separated]) > :not(:last-child) > :is(.jd-button, .jd-icon-button) {
      border-inline-end-width: 0;
    }
    /* 초점 링이 옆 버튼에 잘리지 않게 위로 올린다 */
    jd-button-group:not([separated]) > *:focus-within {
      position: relative;
      z-index: 1;
    }
  }
`;
