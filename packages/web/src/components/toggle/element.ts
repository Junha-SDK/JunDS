/**
 * <jd-toggle> — 토글 스위치 (v2 primitives/Toggle).
 * 내부 <button role="switch"> + 트랙/썸 CSS — label 텍스트 클릭 토글은
 * label 래핑의 네이티브 연결(첫 labelable 자손)로 공짜.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import toggleStyles from "./toggle.css.js";

export class JdToggle extends JdElement {
  static override tag = "jd-toggle";
  static override props = {
    checked: { type: Boolean, reflect: true },
    size: { type: String, default: "md", reflect: true }, // sm | md
    disabled: { type: Boolean, reflect: true },
    label: { type: String },
  };

  declare checked: boolean;
  declare size: string;
  declare disabled: boolean;
  declare label: string;

  /** aria 기본 라벨 — Switch가 재정의 */
  protected fallbackAriaLabel = "토글";
  protected baseClass = "jd-toggle";

  #btn!: HTMLButtonElement;
  #text!: HTMLSpanElement;

  protected render(): void {
    adoptStyles((this.constructor as typeof JdToggle).styles);
    const cls = this.baseClass;
    const existing = this.querySelector<HTMLButtonElement>(`button.${cls}__track`);
    if (existing) {
      this.#btn = existing;
      this.#text = this.querySelector(`.${cls}__text`)!;
    } else {
      this.#build();
    }
    this.update();
  }

  /** 서브클래스(Switch)가 자기 시트로 교체 */
  static styles = toggleStyles;

  #build(): void {
    const cls = this.baseClass;
    const wrap = document.createElement("label");
    wrap.className = cls;
    this.#btn = document.createElement("button");
    this.#btn.type = "button";
    this.#btn.className = `${cls}__track`;
    this.#btn.setAttribute("role", "switch");
    const thumb = document.createElement("span");
    thumb.className = `${cls}__thumb`;
    this.#btn.append(thumb);
    this.#text = document.createElement("span");
    this.#text.className = `${cls}__text`;
    wrap.append(this.#btn, this.#text);
    this.append(wrap);
  }

  protected override connected(): void {
    this.#btn.addEventListener("click", this.#onClick);
  }

  protected override disconnected(): void {
    this.#btn?.removeEventListener("click", this.#onClick);
  }

  #onClick = (): void => {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.emit("jd-change", { checked: this.checked });
  };

  protected override update(): void {
    const b = this.#btn;
    b.disabled = this.disabled;
    b.setAttribute("aria-checked", String(this.checked));
    b.setAttribute(
      "aria-label",
      this.label || this.getAttribute("aria-label") || this.fallbackAriaLabel,
    );
    this.#text.textContent = this.label;
    this.#text.hidden = !this.label;
  }
}
