/**
 * <jd-snackbar> — 짧은 피드백 띠 (v2 composites/Snackbar).
 * 자동 닫힘 타이머는 **포인터가 올라가 있으면 멈춘다** — 읽는 중에 사라지는 것은
 * 접근성 지침(WCAG 2.2.1)이 지적하는 문제다. v2에는 없던 보강.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import snackbarStyles from "./snackbar.css.js";

export class JdSnackbar extends JdElement {
  static override tag = "jd-snackbar";
  static override props = {
    open: { type: Boolean, reflect: true },
    message: { type: String },
    variant: { type: String, default: "default", reflect: true }, // default|success|error|warning|info
    /** bottom | top | bottom-left | bottom-right */
    position: { type: String, default: "bottom", reflect: true },
    /** 자동 닫힘(ms). 0이면 수동 */
    duration: { type: Number, default: 4000 },
  };

  declare open: boolean;
  declare message: string;
  declare variant: string;
  declare position: string;
  declare duration: number;

  #msg!: HTMLElement;
  #timer = 0;
  #hovering = false;

  protected render(): void {
    adoptStyles(snackbarStyles);
    const existing = this.querySelector<HTMLElement>(":scope > .jd-snackbar__message");
    if (existing) {
      this.#msg = existing;
    } else {
      const action = this.querySelector(':scope > [slot="action"]');
      const rest = Array.from(this.childNodes).filter((n) => n !== action);
      this.#msg = document.createElement("span");
      this.#msg.className = "jd-snackbar__message";
      this.#msg.append(...rest);
      this.append(this.#msg);
      if (action) this.append(action);
    }
    this.setAttribute("role", "status");
    this.update();
  }

  protected override connected(): void {
    this.addEventListener("pointerenter", this.#onEnter);
    this.addEventListener("pointerleave", this.#onLeave);
    this.addEventListener("focusin", this.#onEnter);
    this.addEventListener("focusout", this.#onLeave);
  }

  protected override disconnected(): void {
    this.removeEventListener("pointerenter", this.#onEnter);
    this.removeEventListener("pointerleave", this.#onLeave);
    this.removeEventListener("focusin", this.#onEnter);
    this.removeEventListener("focusout", this.#onLeave);
    this.#clear();
  }

  #onEnter = (): void => {
    this.#hovering = true;
    this.#clear(); // 읽는 동안 사라지지 않는다
  };

  #onLeave = (): void => {
    this.#hovering = false;
    this.#arm();
  };

  #clear(): void {
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = 0;
  }

  #arm(): void {
    this.#clear();
    if (!this.open || !this.duration || this.#hovering) return;
    this.#timer = setTimeout(() => {
      this.#timer = 0;
      this.open = false;
      this.emit("jd-close");
    }, this.duration) as unknown as number;
  }

  /** 메시지를 띄운다 — 같은 요소를 재사용하는 명령형 표면 */
  show(message?: string): void {
    if (message !== undefined) this.message = message;
    this.open = true;
  }

  protected override update(): void {
    if (this.message) this.#msg.textContent = this.message;
    this.#arm();
  }
}
