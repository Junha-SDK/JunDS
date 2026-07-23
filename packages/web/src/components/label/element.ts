/**
 * <jd-label> — 폼 라벨 (v2 primitives/Label).
 * 내부 실제 <label> 렌더(연결 시맨틱), htmlFor 프로퍼티 ↔ for attribute(네이티브 계승).
 * required의 * 표식은 CSS ::after — DOM 노드 없음 (jd-text-field 라벨 동형).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import labelStyles from "./label.css.js";

export class JdLabel extends JdElement {
  static override tag = "jd-label";
  static override props = {
    htmlFor: { type: String, attribute: "for" }, // 네이티브 표기 계승
    required: { type: Boolean, reflect: true },  // CSS ::after 훅
  };

  declare htmlFor: string;
  declare required: boolean;

  #label!: HTMLLabelElement;

  protected render(): void {
    adoptStyles(labelStyles);
    const existing = this.querySelector<HTMLLabelElement>(":scope > label.jd-label");
    this.#label = existing ?? this.#build();
    this.update();
  }

  #build(): HTMLLabelElement {
    const l = document.createElement("label");
    l.className = "jd-label";
    l.append(...this.childNodes);
    this.append(l);
    return l;
  }

  protected override update(): void {
    if (this.htmlFor) this.#label.htmlFor = this.htmlFor;
    else this.#label.removeAttribute("for");
  }
}
