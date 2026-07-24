/**
 * <jd-tooltip> — 짧은 설명 말풍선 (v2 composites/Tooltip) = Popover 파생.
 *
 * v2 대비 표면 매핑: `position` → `side`, `delay` → `open-delay`(기본 200 동일),
 * `content` → 동명 프롭, `children` → 무슬롯 children(=트리거, defaultSlot 재정의).
 *
 * v2 대비 개선 2가지:
 *  1. **ESC로 닫힌다.** v2 툴팁은 마우스를 떼기 전까지 화면을 가렸다(WCAG 1.4.13
 *     "Content on Hover or Focus"의 dismissable 요건 미충족).
 *  2. **트리거가 포커스 불가일 때 tabindex를 부여**한다. v2는 onFocus 핸들러만 달아
 *     포커스 가능한 자식이 없으면 키보드로는 열 방법이 없었다.
 * 두 개선 모두 원형(JdPopover)에 있어 이 파일에는 코드가 없다 — 그게 파생의 요점이다.
 *
 * role="tooltip" 패널은 aria-controls/expanded가 아니라 **열려 있는 동안만**
 * aria-describedby로 트리거에 연결된다(hidden 요소 참조 금지).
 */
import { JdPopover } from "../popover/element.js";
import { adoptStyles } from "../../core/styles.js";
import tooltipStyles from "./tooltip.css.js";

export class JdTooltip extends JdPopover {
  static override tag = "jd-tooltip";
  static override props = {
    ...JdPopover.props,
    side: { type: String, default: "top", reflect: true },
    align: { type: String, default: "center", reflect: true },
    trigger: { type: String, default: "hover", reflect: true },
    /** v2 delay 기본 200ms */
    openDelay: { type: Number, default: 200 },
  };

  /** v2: children이 트리거, content가 내용 */
  protected override get defaultSlot(): "trigger" | "content" {
    return "trigger";
  }
  protected override get panelRole(): string {
    return "tooltip";
  }
  /** null → aria-describedby 방식 */
  protected override get ariaPopupType(): string | null {
    return null;
  }

  protected override render(): void {
    super.render();
    adoptStyles(tooltipStyles);
  }
}
