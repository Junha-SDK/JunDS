/**
 * <jd-copy-button> — 클립보드 복사 버튼 (v2 primitives/CopyButton).
 *
 * - 복사 성공 시 2초간 완료 표시. 타이머는 disconnected에서 해제 — 떼어낸 노드를
 *   건드리지 않는다(v2는 언마운트 후에도 setState가 걸렸다).
 * - navigator.clipboard는 보안 컨텍스트·권한 거부·jsdom에서 실패한다. v2는 await만
 *   해서 unhandled rejection이 났다 → v3는 try/catch 후 jd-error 발행(§1.5 canonical).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import copyButtonStyles from "./copy-button.css.js";

const COPY_SVG =
  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.2"/>` +
  `<path d="M10 4V3a1.5 1.5 0 00-1.5-1.5h-5A1.5 1.5 0 002 3v5A1.5 1.5 0 003.5 9.5H4" stroke="currentColor" stroke-width="1.2"/></svg>`;
const DONE_SVG =
  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<path d="M3 7.5l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export class JdCopyButton extends JdElement {
  static override tag = "jd-copy-button";
  static override props = {
    /** 클립보드에 넣을 텍스트 */
    text: { type: String },
    label: { type: String, default: "복사" },
    copiedLabel: { type: String, default: "복사됨!" },
    variant: { type: String, default: "icon", reflect: true }, // icon | button
    size: { type: String, default: "md", reflect: true }, // sm | md
    disabled: { type: Boolean, reflect: true },
    /** 복사 완료 표시 상태 */
    copied: { type: Boolean, reflect: true },
  };

  declare text: string;
  declare label: string;
  declare copiedLabel: string;
  declare variant: string;
  declare size: string;
  declare disabled: boolean;
  declare copied: boolean;

  #btn!: HTMLButtonElement;
  #icon!: HTMLSpanElement;
  #text!: HTMLSpanElement;
  #timer = 0;

  protected render(): void {
    adoptStyles(copyButtonStyles);
    const existing = this.querySelector<HTMLButtonElement>(":scope > button.jd-copy-button");
    if (existing) {
      this.#btn = existing;
      this.#icon = this.querySelector(".jd-copy-button__icon")!;
      this.#text = this.querySelector(".jd-copy-button__label")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    this.#btn = document.createElement("button");
    this.#btn.type = "button";
    this.#btn.className = "jd-copy-button";
    this.#icon = document.createElement("span");
    this.#icon.className = "jd-copy-button__icon";
    this.#text = document.createElement("span");
    this.#text.className = "jd-copy-button__label";
    this.#btn.append(this.#icon, this.#text);
    this.append(this.#btn);
  }

  protected override connected(): void {
    this.#btn.addEventListener("click", this.#onClick);
  }

  protected override disconnected(): void {
    this.#btn?.removeEventListener("click", this.#onClick);
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = 0;
  }

  #onClick = (): void => {
    void this.copy();
  };

  /** 명령형 API — 외부에서 직접 복사시킬 수 있다 */
  async copy(): Promise<boolean> {
    if (this.disabled) return false;
    try {
      await navigator.clipboard.writeText(this.text);
    } catch (error) {
      this.emit("jd-error", { error });
      return false;
    }
    this.copied = true;
    this.emit("jd-copy", { text: this.text });
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = setTimeout(() => {
      this.#timer = 0;
      this.copied = false;
    }, 2000) as unknown as number;
    return true;
  }

  protected override update(): void {
    const label = this.copied ? this.copiedLabel : this.label;
    this.#icon.innerHTML = this.copied ? DONE_SVG : COPY_SVG;
    this.#btn.disabled = this.disabled;
    // icon 변형은 라벨을 시각적으로 감추되 접근 이름은 유지 (v2는 title만 줬다)
    const iconOnly = this.variant !== "button";
    this.#text.textContent = label;
    this.#text.hidden = iconOnly;
    this.#btn.title = iconOnly ? label : "";
    this.#btn.setAttribute("aria-label", label);
  }

  override focus(options?: FocusOptions): void {
    this.#btn?.focus(options);
  }
}
