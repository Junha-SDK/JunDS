/**
 * <jd-icon-button> — 아이콘 전용 버튼 (v2 primitives/IconButton).
 * 네이티브 <button> 위임(§1.6-1) — jd-button 정본 패턴 동형. children = 아이콘 노드.
 * label은 접근성 필수 표면(v2 required prop) — aria-label로 위임한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import iconButtonStyles from "./icon-button.css.js";

export class JdIconButton extends JdElement {
  static override tag = "jd-icon-button";
  static override props = {
    variant: { type: String, default: "ghost", reflect: true }, // ghost | outline | filled
    size: { type: String, default: "md", reflect: true }, // xs | sm | md | lg
    label: { type: String }, // 접근성 라벨(필수)
    type: { type: String, default: "button" },
    disabled: { type: Boolean, reflect: true },
  };

  declare variant: string;
  declare size: string;
  declare label: string;
  declare type: string;
  declare disabled: boolean;

  #btn!: HTMLButtonElement;

  protected render(): void {
    adoptStyles(iconButtonStyles);
    const existing = this.querySelector<HTMLButtonElement>(":scope > button.jd-icon-button");
    this.#btn = existing ?? this.#build();
    this.update();
  }

  #build(): HTMLButtonElement {
    const b = document.createElement("button");
    b.className = "jd-icon-button";
    b.append(...this.childNodes); // 아이콘 children 이동
    this.append(b);
    return b;
  }

  protected override update(): void {
    const b = this.#btn;
    b.type = this.type as "button" | "submit" | "reset";
    b.disabled = this.disabled;
    if (this.label) b.setAttribute("aria-label", this.label);
    else b.removeAttribute("aria-label");
  }
}
