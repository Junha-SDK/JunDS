/**
 * <jd-status-dot> — 상태 점 (v2 primitives/StatusDot).
 * 점은 CSS ::before(DOM 0), label만 스팬. pulse는 opacity 펄스 키프레임.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import statusDotStyles from "./status-dot.css.js";

export class JdStatusDot extends JdElement {
  static override tag = "jd-status-dot";
  static override props = {
    status: { type: String, default: "neutral", reflect: true },
    label: { type: String },
    size: { type: String, default: "md", reflect: true }, // sm | md | lg
  };

  declare status: string;
  declare label: string;
  declare size: string;

  #text: HTMLSpanElement | null = null;

  protected render(): void {
    adoptStyles(statusDotStyles);
    this.#text = this.querySelector(":scope > .jd-status-dot__label");
    this.update();
  }

  protected override update(): void {
    if (this.label) {
      if (!this.#text) {
        this.#text = document.createElement("span");
        this.#text.className = "jd-status-dot__label";
        this.append(this.#text);
      }
      this.#text.textContent = this.label;
    } else {
      this.#text?.remove();
      this.#text = null;
    }
  }
}
