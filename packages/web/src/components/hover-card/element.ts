/**
 * <jd-hover-card> — 호버 시 뜨는 미리보기 카드 (v2 composites/HoverCard) = Popover 파생.
 *
 * v2 표면 매핑: `trigger` → `slot="trigger"` children, `children` → 무슬롯 children,
 * `side`/`openDelay`(300)/`closeDelay`(200) 동명. 2단 지연(열림 지연 + 닫힘 유예)은
 * 원형의 schedule()이 이미 갖고 있어 파생 코드가 필요 없다.
 *
 * v2 대비 개선: **키보드로 열린다.** v2 HoverCard는 mouseenter/mouseleave만 달아
 * 포인터가 없는 사용자에게는 존재하지 않는 콘텐츠였다. 원형이 hover 모드에서
 * focusin/focusout도 같은 경로로 처리하므로 트리거에 포커스만 가면 열린다.
 * ESC 닫기·바깥 클릭 닫기도 원형에서 따라온다.
 */
import { JdPopover } from "../popover/element.js";
import { adoptStyles } from "../../core/styles.js";
import hoverCardStyles from "./hover-card.css.js";

export class JdHoverCard extends JdPopover {
  static override tag = "jd-hover-card";
  static override props = {
    ...JdPopover.props,
    align: { type: String, default: "center", reflect: true },
    trigger: { type: String, default: "hover", reflect: true },
    openDelay: { type: Number, default: 300 },
    closeDelay: { type: Number, default: 200 },
  };

  protected override render(): void {
    super.render();
    adoptStyles(hoverCardStyles);
  }
}
