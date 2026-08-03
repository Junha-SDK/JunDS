/**
 * <jd-battery-indicator> — 배터리형 레벨 표시 (v2 primitives/BatteryIndicator).
 * auto-color: >70 green / >30 amber / else red (v2 임계 동형). lg만 % 텍스트
 * (mix-blend-difference). 채움 폭·자동 색은 update()가 data-fill 속성으로 반영.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import batteryStyles from "./battery-indicator.css.js";

export class JdBatteryIndicator extends JdElement {
  static override tag = "jd-battery-indicator";
  static override props = {
    value: { type: Number, reflect: true }, // 0~100
    autoColor: { type: Boolean, reflect: true }, // attr: auto-color
    color: { type: String, reflect: true }, // success | warning | danger | primary
    label: { type: String },
    size: { type: String, default: "md", reflect: true }, // sm | md | lg
  };

  declare value: number;
  declare autoColor: boolean;
  declare color: string;
  declare label: string;
  declare size: string;

  #labelEl: HTMLSpanElement | null = null;
  #fill!: HTMLDivElement;
  #pct!: HTMLSpanElement;

  protected render(): void {
    adoptStyles(batteryStyles);
    const existing = this.querySelector<HTMLDivElement>(".jd-battery__fill");
    if (existing) {
      this.#fill = existing;
      this.#pct = this.querySelector(".jd-battery__pct")!;
      this.#labelEl = this.querySelector(":scope > .jd-battery__label");
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    const body = document.createElement("div");
    body.className = "jd-battery__body";
    this.#fill = document.createElement("div");
    this.#fill.className = "jd-battery__fill";
    this.#pct = document.createElement("span");
    this.#pct.className = "jd-battery__pct";
    body.append(this.#fill, this.#pct);
    const cap = document.createElement("div");
    cap.className = "jd-battery__cap";
    this.append(body, cap);
  }

  protected override update(): void {
    const clamped = Math.max(0, Math.min(100, this.value));
    this.#fill.style.width = `${clamped}%`;
    // 자동 색 판정(v2 임계) — CSS 훅으로 반영
    const level = this.autoColor
      ? clamped > 70
        ? "success"
        : clamped > 30
        ? "warning"
        : "danger"
      : this.color || "primary";
    this.setAttribute("data-fill", level);
    this.#pct.textContent = `${Math.round(clamped)}%`;

    if (this.label) {
      if (!this.#labelEl) {
        this.#labelEl = document.createElement("span");
        this.#labelEl.className = "jd-battery__label";
        this.prepend(this.#labelEl);
      }
      this.#labelEl.textContent = this.label;
    } else {
      this.#labelEl?.remove();
      this.#labelEl = null;
    }
  }
}
