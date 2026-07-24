/**
 * jd-virtual-scroll CSS — v2 composites/VirtualScroll 번역.
 *
 * v2 값: 컨테이너 `overflow-auto`(높이는 소비자 className/style),
 * 내부 사이저 `height: items*itemHeight; position: relative`,
 * 각 항목 `position:absolute; top: i*itemHeight; width:100%; height:itemHeight`.
 * v3는 top 대신 transform으로 옮긴다(레이아웃 재계산 제거 — 05-perf).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-virtual-scroll {
    display: block;
    overflow: auto;
    height: var(--_jd-virtual-scroll-height, auto);
    /* 스크롤 체이닝 차단 — 목록 끝에서 페이지가 딸려 움직이지 않는다 */
    overscroll-behavior: contain;
    font-family: var(--jd-font-sans);
    color: var(--jd-color-foreground);
  }

  .jd-virtual-scroll__sizer { position: relative; width: 100%; }

  .jd-virtual-scroll__item {
    position: absolute;
    inset-inline: 0;
    inset-block-start: 0;
    box-sizing: border-box;
    /* 고정 높이 안에서 넘치는 내용이 다음 행을 침범하지 않게 */
    overflow: hidden;
  }
}`;
