/**
 * <jd-empty-state> — 비어 있음 안내 (v2 composites/EmptyState).
 * Result(상태 화면)와 골격이 같아 Result가 이 구현을 파생한다(§6 R12).
 * 아이콘·액션은 light DOM 슬롯(slot="icon" / slot="action").
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import emptyStateStyles from "./empty-state.css.js";

const BOX_SVG =
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">` +
  `<path d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z" stroke="currentColor" stroke-width="1.5"/>` +
  `<path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" stroke-width="1.5"/></svg>`;

export class JdEmptyState extends JdElement {
  static override tag = "jd-empty-state";
  static override props = {
    title: { type: String },
    description: { type: String },
  };

  declare title: string;
  declare description: string;

  static styles = emptyStateStyles;
  protected baseClass = "jd-empty-state";
  /** Result가 상태별 아이콘으로 재정의 */
  protected defaultIcon(): string {
    return BOX_SVG;
  }

  #icon!: HTMLElement;
  #title!: HTMLElement;
  #desc!: HTMLElement;

  protected render(): void {
    adoptStyles((this.constructor as typeof JdEmptyState).styles);
    const cls = this.baseClass;
    const found = this.querySelector<HTMLElement>(`:scope > .${cls}__icon`);
    if (found) {
      this.#icon = found;
      this.#title = this.querySelector(`.${cls}__title`)!;
      this.#desc = this.querySelector(`.${cls}__desc`)!;
      this.update();
      return;
    }
    const custom = this.querySelector(':scope > [slot="icon"]');
    const action = this.querySelector(':scope > [slot="action"]');
    const rest = Array.from(this.childNodes).filter((n) => n !== custom && n !== action);

    this.#icon = document.createElement("div");
    this.#icon.className = `${cls}__icon`;
    this.#icon.setAttribute("aria-hidden", "true");
    if (custom) this.#icon.append(custom);
    this.#title = document.createElement("h3");
    this.#title.className = `${cls}__title`;
    this.#desc = document.createElement("p");
    this.#desc.className = `${cls}__desc`;
    const body = document.createElement("div");
    body.className = `${cls}__body`;
    body.append(...rest);

    this.append(this.#icon, this.#title, this.#desc, body);
    if (action) this.append(action);
    this.update();
  }

  protected override update(): void {
    if (!this.#icon.firstElementChild || this.#icon.dataset.builtin) {
      this.#icon.dataset.builtin = "1";
      this.#icon.innerHTML = this.defaultIcon();
    }
    this.#title.textContent = this.title;
    this.#title.hidden = !this.title;
    this.#desc.textContent = this.description;
    this.#desc.hidden = !this.description;
  }
}
