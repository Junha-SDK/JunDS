/**
 * <jd-kbd> — 키보드 단축키 표기 (v2 primitives/Kbd).
 * 내부 실제 <kbd> 시맨틱. keys attribute("⌘ K")는 공백 제거 결합 —
 * v2 keys.join("")과 등가. 미지정 시 children 그대로.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import kbdStyles from "./kbd.css.js";

export class JdKbd extends JdElement {
  static override tag = "jd-kbd";
  static override props = {
    keys: { type: String },
  };

  declare keys: string;

  #kbd!: HTMLElement;

  protected render(): void {
    adoptStyles(kbdStyles);
    const existing = this.querySelector<HTMLElement>(":scope > kbd.jd-kbd");
    this.#kbd = existing ?? this.#build();
    this.update();
  }

  #build(): HTMLElement {
    const k = document.createElement("kbd");
    k.className = "jd-kbd";
    k.append(...this.childNodes);
    this.append(k);
    return k;
  }

  protected override update(): void {
    if (this.keys) this.#kbd.textContent = this.keys.replace(/\s+/g, "");
  }
}
