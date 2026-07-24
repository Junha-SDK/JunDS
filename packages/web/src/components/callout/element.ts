/**
 * <jd-callout> — 문서용 강조 블록 (v2 composites/Callout).
 * v2 variant 5종(note/tip/info/warning/danger)의 이모지 아이콘·좌측 강조선 승계.
 * collapsible은 네이티브 <details>에 위임 — 열고 닫기·키보드·AT 상태 보고가 공짜다
 * (v2는 useState + div로 직접 만들어 aria-expanded가 없었다).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import calloutStyles from "./callout.css.js";

const EMOJI: Record<string, string> = {
  note: "\u{1F4DD}",
  tip: "\u{1F4A1}",
  info: "ℹ️",
  warning: "⚠️",
  danger: "\u{1F534}",
};

export class JdCallout extends JdElement {
  static override tag = "jd-callout";
  static override props = {
    variant: { type: String, default: "note", reflect: true },
    title: { type: String },
    /** 접을 수 있게 — 네이티브 details로 렌더 */
    collapsible: { type: Boolean, reflect: true },
    /** collapsible일 때 처음부터 펼침 */
    open: { type: Boolean, reflect: true },
  };

  declare variant: string;
  declare title: string;
  declare collapsible: boolean;
  declare open: boolean;

  #icon!: HTMLElement;
  #titleEl!: HTMLElement;
  #details: HTMLDetailsElement | null = null;

  protected render(): void {
    adoptStyles(calloutStyles);
    if (this.querySelector(":scope > .jd-callout__head, :scope > details")) {
      this.#icon = this.querySelector(".jd-callout__icon")!;
      this.#titleEl = this.querySelector(".jd-callout__title")!;
      this.#details = this.querySelector("details");
      this.update();
      return;
    }
    const body = document.createElement("div");
    body.className = "jd-callout__body";
    body.append(...this.childNodes);

    this.#icon = document.createElement("span");
    this.#icon.className = "jd-callout__icon";
    this.#icon.setAttribute("aria-hidden", "true");
    this.#titleEl = document.createElement("span");
    this.#titleEl.className = "jd-callout__title";

    if (this.collapsible) {
      this.#details = document.createElement("details");
      this.#details.className = "jd-callout__details";
      const summary = document.createElement("summary");
      summary.className = "jd-callout__head";
      summary.append(this.#icon, this.#titleEl);
      this.#details.append(summary, body);
      this.append(this.#details);
    } else {
      const head = document.createElement("div");
      head.className = "jd-callout__head";
      head.append(this.#icon, this.#titleEl);
      this.append(head, body);
    }
    this.update();
  }

  protected override update(): void {
    this.#icon.textContent = EMOJI[this.variant] ?? EMOJI.note!;
    this.#titleEl.textContent = this.title;
    this.#titleEl.hidden = !this.title && !this.collapsible;
    if (this.#details) this.#details.open = this.open;
  }
}
