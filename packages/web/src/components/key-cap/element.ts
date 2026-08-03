/**
 * <jd-key-cap> — 키 한 개 모양 칩 (v2 primitives/KeyCap). Kbd와 달리 단일 키 +
 * variant/pressed. 내부 <kbd> 시맨틱, 상태는 전부 attr 셀렉터.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import keyCapStyles from "./key-cap.css.js";

export class JdKeyCap extends JdElement {
  static override tag = "jd-key-cap";
  static override props = {
    size: { type: String, default: "md", reflect: true }, // sm | md | lg
    variant: { type: String, default: "default", reflect: true }, // default | primary | muted
    pressed: { type: Boolean, reflect: true },
  };

  declare size: string;
  declare variant: string;
  declare pressed: boolean;

  protected render(): void {
    adoptStyles(keyCapStyles);
    if (!this.querySelector(":scope > kbd.jd-key-cap")) {
      const k = document.createElement("kbd");
      k.className = "jd-key-cap";
      k.append(...this.childNodes);
      this.append(k);
    }
  }
}
