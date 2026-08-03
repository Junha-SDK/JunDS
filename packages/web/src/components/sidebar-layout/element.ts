/**
 * <jd-sidebar-layout> — 사이드바 + 본문, 좁아지면 자동으로 쌓임 (DEC-052).
 *
 * ## 왜 새 태그인가
 * `<jd-app-shell>`은 앱 전체 골격(헤더·레일·본문 + 모바일 드로어)이라 화면 안쪽의
 * "목록 옆에 상세", "본문 옆에 목차" 같은 국소 2단 배치에는 과하다. 그래서 지금까지는
 * grid-template-columns와 브레이크포인트를 매번 손으로 적었다.
 *
 * ```html
 * <jd-sidebar-layout side-width="240px">
 *   <nav>…목차…</nav>
 *   <article>…본문…</article>
 * </jd-sidebar-layout>
 * ```
 *
 * 첫 번째 children이 사이드바, 마지막이 본문이다. 꺾이는 폭은 적지 않는다 — 본문
 * 최소 폭(`content-min`, 기본 60%)에서 따라 나온다.
 *
 * ⚠️ children이 정확히 둘일 때의 배치다. 셋 이상이면 가운데 것들은 기본 flex 규칙을
 * 따라 예상과 달라진다 — 묶어서 둘로 만들어라.
 */
import { STYLE_PROPS, applyStyleProps } from "../../core/style-props.js";
import { JdBox } from "../box/element.js";
import sidebarStyles from "./sidebar-layout.css.js";

export class JdSidebarLayout extends JdBox {
  static override tag = "jd-sidebar-layout";
  static override styles = sidebarStyles;
  static override props = {
    ...STYLE_PROPS,
    /** 사이드바 폭 (CSS 길이, 기본 16rem) */
    sideWidth: { type: String },
    /** 본문 최소 폭 — 이보다 좁아지면 쌓인다 (CSS 길이/백분율, 기본 60%) */
    contentMin: { type: String },
    /** 사이드바를 오른쪽에 둔다 — start(기본) | end */
    side: { type: String, reflect: true },
  };

  declare sideWidth: string;
  declare contentMin: string;
  declare side: string;

  protected override update(): void {
    super.update();
    // 길이는 토큰 척도가 아니라 화면마다 다른 수치라 attr → 커스텀 프로퍼티로 통과시킨다.
    // 값이 없으면 **지우고** base CSS의 기본값이 다시 이기게 한다(빈 문자열로 덮으면
    // var()가 폴백 없이 무효가 되어 배치가 무너진다).
    setOrClear(this, "--jd-sidebar-width", this.sideWidth);
    setOrClear(this, "--jd-sidebar-content-min", this.contentMin);
  }
}

function setOrClear(el: HTMLElement, prop: string, value: string | undefined): void {
  if (value) el.style.setProperty(prop, value);
  else el.style.removeProperty(prop);
}
