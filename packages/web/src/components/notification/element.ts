/**
 * <jd-notification> — 제목·설명·액션을 갖는 알림 카드 (v2 composites/Notification).
 * 토스트(jd-toast)가 이 골격을 담아 띄운다 — 카드와 배치를 분리해 둔다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import notificationStyles from "./notification.css.js";

const CLOSE_SVG =
  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export class JdNotification extends JdElement {
  static override tag = "jd-notification";
  static override props = {
    variant: { type: String, default: "info", reflect: true }, // info|success|warning|danger
    title: { type: String },
    description: { type: String },
    dismissible: { type: Boolean, reflect: true },
  };

  declare variant: string;
  declare title: string;
  declare description: string;
  declare dismissible: boolean;

  #title!: HTMLElement;
  #desc!: HTMLElement;
  #close!: HTMLButtonElement;

  protected render(): void {
    adoptStyles(notificationStyles);
    const existing = this.querySelector<HTMLElement>(":scope > .jd-notification__body");
    if (existing) {
      this.#title = existing.querySelector(".jd-notification__title")!;
      this.#desc = existing.querySelector(".jd-notification__desc")!;
      this.#close = this.querySelector(".jd-notification__close")!;
    } else {
      const icon = this.querySelector(':scope > [slot="icon"]');
      const rest = Array.from(this.childNodes).filter((n) => n !== icon);
      const body = document.createElement("div");
      body.className = "jd-notification__body";
      this.#title = document.createElement("p");
      this.#title.className = "jd-notification__title";
      this.#desc = document.createElement("p");
      this.#desc.className = "jd-notification__desc";
      const extra = document.createElement("div");
      extra.className = "jd-notification__extra";
      extra.append(...rest);
      body.append(this.#title, this.#desc, extra);
      this.#close = document.createElement("button");
      this.#close.type = "button";
      this.#close.className = "jd-notification__close";
      this.#close.setAttribute("aria-label", "닫기");
      this.#close.innerHTML = CLOSE_SVG;
      if (icon) this.append(icon);
      this.append(body, this.#close);
    }
    this.setAttribute("role", "status");
    this.update();
  }

  protected override connected(): void {
    this.#close.addEventListener("click", this.#onClose);
  }

  protected override disconnected(): void {
    this.#close?.removeEventListener("click", this.#onClose);
  }

  #onClose = (): void => {
    this.emit("jd-dismiss");
    this.hidden = true;
  };

  protected override update(): void {
    this.#title.textContent = this.title;
    this.#title.hidden = !this.title;
    this.#desc.textContent = this.description;
    this.#desc.hidden = !this.description;
    this.#close.hidden = !this.dismissible;
  }
}
