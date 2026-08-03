import { css } from "../../core/styles.js";

/**
 * v2 값: 인라인 SVG 아이콘, 크기는 width/height 속성으로 직접 실린다(레이아웃은
 * inline-flex 정렬만). currentColor 상속 — 부모 색을 그대로 받는다.
 *
 * 이름과 달리 이것은 앱 런처의 **타일**이 아니라, finance 도메인 이름표 하나로 정해진
 * 글리프를 뽑는 **명명 아이콘 세트**다(element.ts의 APP_ICONS 73종). 실제로
 * jd-nav-sidebar·jd-stock-top-bar·jd-strategy-panel이 16px 인라인 글리프로 합성한다 —
 * 호스트에 둥근 사각 배경을 얹으면 사이드바 항목·시세 헤더 행 안에 타일이 박힌다.
 * 그래서 면은 주지 않고 글리프가 놓이는 자리만 정확히 잡는다.
 */
export default css`
  @layer junds.components {
    jd-app-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      line-height: 0;
      vertical-align: middle;
      color: inherit;
    }
    /* 좁은 행(칩·배지 안)에서 플렉스 자식으로 눌려 찌그러지지 않게 — SVG는 width/height
     속성이 말하는 크기 그대로 있어야 한다 */
    jd-app-icon > svg.jd-app-icon {
      display: block;
      flex: none;
    }
    /* 이름이 비었거나 레지스트리에 없으면 svg 내용이 통째로 비어(update의 innerHTML="")
     자리만 차지한 투명 구멍이 남는다 — 빠진 글리프는 보이지 않는 실패다. 점선 자리로
     드러내 이름 오타가 화면에서 잡히게 한다. */
    jd-app-icon > svg.jd-app-icon:empty {
      box-sizing: border-box;
      border: var(--jd-border-thin) dashed color-mix(in srgb, currentColor 35%, transparent);
      border-radius: var(--jd-radius-sm);
    }
  }
`;
