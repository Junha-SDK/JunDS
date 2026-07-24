/**
 * <jd-sidebar-section> — 라벨이 붙은 항목 묶음 (v2 patterns/Sidebar의 SidebarSection).
 * children(주로 jd-sidebar-link)을 items 컨테이너로 입양하고, title은 접힘 시 CSS로
 * 숨긴다. role="group" + aria-label로 스크린리더에 묶음 경계를 알린다(v2엔 없던 보강).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import sidebarSectionStyles from "./sidebar-section.css.js";

export class JdSidebarSection extends JdElement {
  static override tag = "jd-sidebar-section";
  static override props = {
    title: { type: String },
  };

  declare title: string;

  #title!: HTMLElement;

  protected render(): void {
    adoptStyles(sidebarSectionStyles);
    const existing = this.querySelector<HTMLElement>(":scope > .jd-sidebar-section__title");
    if (existing) {
      this.#title = existing;
    } else {
      this.#build();
    }
    this.setAttribute("role", "group");
    this.update();
  }

  #build(): void {
    const items = document.createElement("div");
    items.className = "jd-sidebar-section__items";
    items.append(...this.childNodes);
    this.#title = document.createElement("div");
    this.#title.className = "jd-sidebar-section__title";
    this.append(this.#title, items);
  }

  protected override update(): void {
    this.#title.textContent = this.title;
    this.#title.hidden = !this.title;
    if (this.title) this.setAttribute("aria-label", this.title);
    else this.removeAttribute("aria-label");
  }
}
