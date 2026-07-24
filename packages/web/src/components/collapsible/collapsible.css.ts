/**
 * jd-collapsible CSS — 원형(jd-disclosure) 시트 위에 v2 Collapsible의 스킨만 얹는다.
 * v2 값: 루트 `w-full`, 트리거 `w-full cursor-pointer`(별도 크롬 없음).
 * 호스트 셀렉터는 태그마다 따로 필요하다(파생 태그는 원형 태그 셀렉터에 걸리지 않는다).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.base {
  jd-collapsible:not(:defined) { display: block; }
}
@layer junds.components {
  jd-collapsible { display: block; width: 100%; }
}`;
