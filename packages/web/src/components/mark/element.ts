/**
 * <jd-mark> — 형광펜 강조 (v2 primitives/Mark). 내부 <mark>로 시맨틱 위임
 * (AT가 "강조"로 읽는다 — span + 배경색으로는 얻을 수 없다).
 * color/underline은 순수 CSS 훅 — 골격 1회로 끝난다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import markStyles from "./mark.css.js";

export class JdMark extends JdElement {
  static override tag = "jd-mark";
  static override props = {
    color: { type: String, default: "yellow", reflect: true }, // yellow|blue|green|pink|purple|orange
    /** 배경 대신 밑줄형 */
    underline: { type: Boolean, reflect: true },
  };

  declare color: string;
  declare underline: boolean;

  protected render(): void {
    adoptStyles(markStyles);
    if (this.querySelector(":scope > mark.jd-mark")) return;
    const mark = document.createElement("mark");
    mark.className = "jd-mark";
    mark.append(...Array.from(this.childNodes));
    this.append(mark);
  }
}
