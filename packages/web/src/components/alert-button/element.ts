/**
 * <jd-alert-button> — 종목 상세용 "알림" 등록 버튼 (v2 finance/AlertButton).
 *
 * v2는 `useAlerts()`로 이 종목의 활성 알림 수를 읽어 배지를 얹고, 클릭하면
 * AlertSheet를 열되 이미 5개면 토스트로 막았다. v3는 데이터·토스트 결합을 걷어내고
 * (DEC-019) 표시 + 의도 이벤트만 남긴다:
 *   - `count`(등록 수)·`max`(상한, 기본 5)를 프로퍼티로 받는다.
 *   - 상한 미만 클릭 → `jd-open`(시트 열기 요청). 상한 도달 클릭 → `jd-limit`.
 *   소비자가 jd-open을 받아 <jd-alert-sheet>를 열고, jd-limit을 받아 토스트를 띄운다.
 *
 * v2는 pill 배경/글자/테두리를 활성 여부로 인라인 스타일 분기했다 — v3는 그 분기를
 * `data-active` 속성 + CSS로 옮겨 렌더를 결정적으로(§3.1) 유지한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import alertButtonStyles from "./alert-button.css.js";

export class JdAlertButton extends JdElement {
  static override tag = "jd-alert-button";
  static override props = {
    /** 이 종목에 등록된 알림 수 */
    count: { type: Number, default: 0 },
    /** 등록 상한 (v2 하드코딩 5) */
    max: { type: Number, default: 5 },
    label: { type: String, default: "알림" },
    disabled: { type: Boolean, reflect: true },
  };

  declare count: number;
  declare max: number;
  declare label: string;
  declare disabled: boolean;

  #btn!: HTMLButtonElement;
  #labelEl!: HTMLSpanElement;
  #count!: HTMLSpanElement;

  protected render(): void {
    adoptStyles(alertButtonStyles);
    const existing = this.querySelector<HTMLButtonElement>(":scope > button.jd-alert-button");
    if (existing) {
      this.#btn = existing;
      this.#labelEl = existing.querySelector(".jd-alert-button__label")!;
      this.#count = existing.querySelector(".jd-alert-button__count")!;
    } else {
      this.#btn = document.createElement("button");
      this.#btn.type = "button";
      this.#btn.className = "jd-alert-button";
      const bell = document.createElement("span");
      bell.className = "jd-alert-button__bell";
      bell.setAttribute("aria-hidden", "true");
      bell.textContent = "🔔";
      this.#labelEl = document.createElement("span");
      this.#labelEl.className = "jd-alert-button__label";
      this.#count = document.createElement("span");
      this.#count.className = "jd-alert-button__count";
      this.#count.setAttribute("aria-hidden", "true");
      this.#btn.append(bell, this.#labelEl, this.#count);
      this.append(this.#btn);
    }
    this.#btn.addEventListener("click", this.#onClick);
    this.update();
  }

  protected override update(): void {
    const n = Math.max(0, Math.trunc(this.count));
    const active = n > 0;
    this.#labelEl.textContent = this.label;
    this.#count.hidden = !active;
    if (active) this.#count.textContent = String(n);
    this.#btn.toggleAttribute("data-active", active);
    this.#btn.disabled = this.disabled;
    this.#btn.setAttribute("aria-label", active ? `가격 알림 ${n}개 등록됨` : "가격 알림 추가");
  }

  #onClick = (): void => {
    if (this.disabled) return;
    const n = Math.max(0, Math.trunc(this.count));
    if (n >= this.max) {
      this.emit("jd-limit", { count: n, max: this.max });
      return;
    }
    this.emit("jd-open", { count: n });
  };
}
