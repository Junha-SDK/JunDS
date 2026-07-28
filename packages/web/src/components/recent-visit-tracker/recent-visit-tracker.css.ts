/**
 * jd-recent-visit-tracker CSS — 표시물이 없는 헤드리스 트래커.
 * 호스트를 화면·레이아웃에서 완전히 제거한다(업그레이드 전에도 동일).
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-recent-visit-tracker,
    jd-recent-visit-tracker:not(:defined) {
      display: none;
    }
  }
`;
