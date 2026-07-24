/**
 * <jd-alert> — 인라인 알림 배너 (v2 composites/Alert).
 *
 * 아이콘은 variant별 기본 4종을 내장하되 `slot="icon"` children이 있으면 그것을 쓴다
 * (v2 icon prop의 light DOM 대응). role은 danger/warning일 때만 alert —
 * 정보성 알림까지 alert로 두면 스크린리더가 매번 진행을 끊는다(v2는 role 없음).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import alertStyles from "./alert.css.js";

const ICONS: Record<string, string> = {
  info:
    `<circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="1.5"/>` +
    `<path d="M9 8v4.5M9 5.5h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  success:
    `<circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="1.5"/>` +
    `<path d="M5.5 9.5l2 2 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  warning:
    `<path d="M9 2L1.5 15.5h15L9 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>` +
    `<path d="M9 7v3.5M9 13h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  danger:
    `<circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="1.5"/>` +
    `<path d="M6.5 6.5l5 5M11.5 6.5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
};

const CLOSE_SVG =
  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export class JdAlert extends JdElement {
  static override tag = "jd-alert";
  static override props = {
    variant: { type: String, default: "info", reflect: true }, // info|success|warning|danger
    title: { type: String },
    /** 닫기 버튼 노출 */
    dismissible: { type: Boolean, reflect: true },
  };

  declare variant: string;
  declare title: string;
  declare dismissible: boolean;

  #icon!: HTMLElement;
  #title!: HTMLElement;
  #close!: HTMLButtonElement;

  protected render(): void {
    adoptStyles(alertStyles);
    const existing = this.querySelector<HTMLElement>(":scope > .jd-alert__icon");
    if (existing) {
      this.#icon = existing;
      this.#title = this.querySelector(".jd-alert__title")!;
      this.#close = this.querySelector(".jd-alert__close")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    const custom = this.querySelector(':scope > [slot="icon"]');
    const rest = Array.from(this.childNodes).filter((n) => n !== custom);

    this.#icon = document.createElement("span");
    this.#icon.className = "jd-alert__icon";
    this.#icon.setAttribute("aria-hidden", "true");
    if (custom) this.#icon.append(custom);

    const body = document.createElement("div");
    body.className = "jd-alert__body";
    this.#title = document.createElement("p");
    this.#title.className = "jd-alert__title";
    const content = document.createElement("div");
    content.className = "jd-alert__content";
    content.append(...rest);
    body.append(this.#title, content);

    this.#close = document.createElement("button");
    this.#close.type = "button";
    this.#close.className = "jd-alert__close";
    this.#close.setAttribute("aria-label", "알림 닫기");
    this.#close.innerHTML = CLOSE_SVG;

    this.append(this.#icon, body, this.#close);
  }

  protected override connected(): void {
    this.#close.addEventListener("click", this.#onClose);
  }

  protected override disconnected(): void {
    this.#close?.removeEventListener("click", this.#onClose);
  }

  #onClose = (): void => {
    // 노드를 지우지 않는다 — 소비자가 되살릴 수 있어야 한다
    this.hidden = true;
    this.emit("jd-dismiss");
  };

  protected override update(): void {
    // 사용자 아이콘이 없을 때만 기본 아이콘을 그린다
    if (!this.#icon.firstElementChild || this.#icon.dataset.builtin) {
      this.#icon.dataset.builtin = "1";
      this.#icon.innerHTML =
        `<svg width="20" height="20" viewBox="0 0 18 18" fill="none">${ICONS[this.variant] ?? ICONS.info}</svg>`;
    }
    this.#title.textContent = this.title;
    this.#title.hidden = !this.title;
    this.#close.hidden = !this.dismissible;
    // 사후 통지형(info/success)까지 alert로 두면 낭독을 매번 끊는다
    const assertive = this.variant === "danger" || this.variant === "warning";
    this.setAttribute("role", assertive ? "alert" : "status");
  }
}
