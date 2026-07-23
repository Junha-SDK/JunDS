/**
 * <jd-tag> — 태그/칩 (v2 primitives/Tag).
 * closable이면 닫기 버튼 구축, 클릭 → jd-remove 사후 통지(§1.5 canonical — v2 onClose).
 * 제거 자체는 소비자 몫(v2 동형 — 목록 상태는 앱이 소유).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import tagStyles from "./tag.css.js";

const CLOSE_SVG =
  `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">` +
  `<path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export class JdTag extends JdElement {
  static override tag = "jd-tag";
  static override props = {
    color: { type: String, default: "gray", reflect: true },
    closable: { type: Boolean, reflect: true },
  };

  declare color: string;
  declare closable: boolean;

  protected render(): void {
    adoptStyles(tagStyles);
    this.update();
  }

  protected override connected(): void {
    this.addEventListener("click", this.#onClick);
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.#onClick);
  }

  #onClick = (e: Event): void => {
    if ((e.target as Element).closest(".jd-tag__close")) {
      e.stopPropagation(); // v2 동형
      this.emit("jd-remove");
    }
  };

  protected override update(): void {
    let close = this.querySelector<HTMLButtonElement>(":scope > .jd-tag__close");
    if (this.closable && !close) {
      close = document.createElement("button");
      close.type = "button";
      close.className = "jd-tag__close";
      close.setAttribute("aria-label", "삭제");
      close.innerHTML = CLOSE_SVG;
      this.append(close);
    } else if (!this.closable && close) {
      close.remove();
    }
  }
}
