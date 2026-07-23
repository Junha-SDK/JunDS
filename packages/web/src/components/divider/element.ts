/**
 * <jd-divider> — 구분선 단일 정본 (R12 삼중복 선점: v2 CoreDivider 표면 계승,
 * layout/LayoutDivider·primitives/Divider는 B2·B4에서 이 클래스의 별칭으로 처리).
 *
 * - 기본 여백: CoreDivider의 my=4(16px) 계승 — base CSS가 담당, my/mx 프롭이 덮는다.
 *   (primitives Divider의 무여백 기본과의 차는 React 어댑터가 프롭 매핑으로 해소)
 * - label 모드: 좌우 라인 + 라벨 3분할 골격을 update()에서 지연 구축/해체.
 * - a11y: role="separator" + 세로일 때 aria-orientation="vertical".
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { resolveColor, resolveSpace } from "../../core/style-props.js";
import dividerStyles from "./divider.css.js";

export class JdDivider extends JdElement {
  static override tag = "jd-divider";
  static override props = {
    orientation: { type: String, default: "horizontal", reflect: true },
    label: { type: String, reflect: true }, // 라벨 모드 레이아웃은 attr 셀렉터 훅
    color: { type: String }, // ColorToken, 기본 border — base CSS가 담당
    my: { type: String },
    mx: { type: String },
  };

  declare orientation: string;
  declare label: string;
  declare color: string;
  declare my: string;
  declare mx: string;

  protected render(): void {
    adoptStyles(dividerStyles);
    this.setAttribute("role", "separator");
    this.update();
  }

  protected override update(): void {
    const vertical = this.orientation === "vertical";
    if (vertical) this.setAttribute("aria-orientation", "vertical");
    else this.removeAttribute("aria-orientation");

    // 라벨 골격 지연 구축/해체 (입양 §3.3: 기존 골격 재사용)
    const hasLabel = Boolean(this.label);
    let labelEl = this.querySelector<HTMLSpanElement>(":scope > .jd-divider__label");
    if (hasLabel && !labelEl) {
      const line = (): HTMLDivElement => {
        const d = document.createElement("div");
        d.className = "jd-divider__line";
        return d;
      };
      labelEl = document.createElement("span");
      labelEl.className = "jd-divider__label";
      this.append(line(), labelEl, line());
    } else if (!hasLabel && labelEl) {
      this.replaceChildren();
      labelEl = null;
    }
    if (labelEl) labelEl.textContent = this.label;

    // color — 라벨 모드에선 라인에, 아니면 호스트 배경에 (v2 동형)
    const color = this.color ? resolveColor(this.color) : null;
    for (const line of this.querySelectorAll<HTMLElement>(":scope > .jd-divider__line")) {
      if (color) line.style.setProperty("background-color", color);
      else line.style.removeProperty("background-color");
    }
    if (color && !hasLabel) this.style.setProperty("background-color", color);
    else this.style.removeProperty("background-color");

    // 여백 — 방향 불문 my/mx 지정분만 인라인 (기본 여백은 base CSS)
    const my = this.my ? resolveSpace(this.my) : null;
    const mx = this.mx ? resolveSpace(this.mx) : null;
    if (my) this.style.setProperty("margin-block", my);
    else this.style.removeProperty("margin-block");
    if (mx) this.style.setProperty("margin-inline", mx);
    else this.style.removeProperty("margin-inline");
  }
}
