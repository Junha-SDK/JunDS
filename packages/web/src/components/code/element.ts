/**
 * <jd-code> — 인라인 코드 (v2 primitives/Code). 내부 <code>로 시맨틱 위임.
 * variant·size는 순수 CSS 훅 — update()가 할 일이 없다(골격 1회로 끝).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import codeStyles from "./code.css.js";

export class JdCode extends JdElement {
  static override tag = "jd-code";
  static override props = {
    variant: { type: String, default: "default", reflect: true }, // default|primary|success|warning|danger
    size: { type: String, default: "md", reflect: true }, // sm | md | lg
  };

  declare variant: string;
  declare size: string;

  protected render(): void {
    adoptStyles(codeStyles);
    if (this.querySelector(":scope > code.jd-code")) return;
    const code = document.createElement("code");
    code.className = "jd-code";
    code.append(...Array.from(this.childNodes));
    this.append(code);
  }
}
