/**
 * <jd-banner> — 화면 폭 전체 공지 띠 (v2 composites/Banner).
 * v2는 role="banner"를 썼는데 그건 **사이트 헤더 랜드마크**라 공지 띠에 붙이면
 * 랜드마크가 중복된다 — role=status로 바로잡았다(내용이 바뀌면 알려주되 낭독을 끊지 않음).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import bannerStyles from "./banner.css.js";

const CLOSE_SVG =
  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export class JdBanner extends JdElement {
  static override tag = "jd-banner";
  static override props = {
    variant: { type: String, default: "info", reflect: true }, // info|success|warning|danger
    /** 닫기 버튼 숨김 — v2 기본은 노출이라 반전 플래그(DEC-029-5) */
    noDismiss: { type: Boolean, reflect: true },
  };

  declare variant: string;
  declare noDismiss: boolean;

  #close!: HTMLButtonElement;

  protected render(): void {
    adoptStyles(bannerStyles);
    const existing = this.querySelector<HTMLButtonElement>(":scope > .jd-banner__close");
    if (existing) {
      this.#close = existing;
    } else {
      const content = document.createElement("span");
      content.className = "jd-banner__content";
      content.append(...this.childNodes);
      this.#close = document.createElement("button");
      this.#close.type = "button";
      this.#close.className = "jd-banner__close";
      this.#close.setAttribute("aria-label", "배너 닫기");
      this.#close.innerHTML = CLOSE_SVG;
      this.append(content, this.#close);
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
    this.hidden = true;
    this.emit("jd-dismiss");
  };

  protected override update(): void {
    this.#close.hidden = this.noDismiss;
  }
}
