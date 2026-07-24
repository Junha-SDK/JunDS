/**
 * <jd-button-group> — 버튼 묶음 (v2 composites/ButtonGroup) = <jd-box> 파생.
 *
 * v2는 `[&>*]:rounded-none [&>*:first-child]:rounded-l-lg …` 같은 Tailwind 임의
 * 셀렉터로 자식 버튼의 모서리를 깎았다. v3에서 자식은 <jd-button> 호스트고 실제
 * 모서리·테두리는 그 안의 .jd-button이 갖는다 — CSS가 호스트와 내부 컨트롤 두
 * 층을 함께 겨눈다. JS 분기는 0이다(§4.3).
 *
 * jd-group(=Box 파생) 선례를 따라 스타일 프롭을 그대로 물려받는다.
 * v2에 없던 `label`은 role=group에 접근 이름을 주기 위한 상위집합이다.
 */
import { STYLE_PROPS } from "../../core/style-props.js";
import { JdBox } from "../box/element.js";
import buttonGroupStyles from "./button-group.css.js";

export class JdButtonGroup extends JdBox {
  static override tag = "jd-button-group";
  static override styles = buttonGroupStyles;
  static override props = {
    ...STYLE_PROPS,
    /** 붙이지 않고 간격을 둔다 (v2 separated) */
    separated: { type: Boolean, reflect: true },
    /** 전체 너비 + 자식 균등 분배 (v2 fullWidth) — attr: full-width */
    fullWidth: { type: Boolean, reflect: true },
    /** 그룹 접근 이름 */
    label: { type: String },
  };

  declare separated: boolean;
  declare fullWidth: boolean;
  declare label: string;

  protected override render(): void {
    super.render(); // 시트 채택 + 스타일 프롭 반영
    // 소비자가 직접 지정했으면 존중한다(toolbar 등)
    if (!this.hasAttribute("role")) this.setAttribute("role", "group");
  }

  protected override update(): void {
    super.update();
    if (this.label) this.setAttribute("aria-label", this.label);
    else this.removeAttribute("aria-label");
  }
}
