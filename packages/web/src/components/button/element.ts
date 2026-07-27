/**
 * <jd-button> — 03-web-arch §10 정본 패턴. 이후 전 컴포넌트가 이 형태를 따른다.
 * - 네이티브 <button> 위임(§1.6-1): 폼 제출·disabled 시 click 미발행·a11y 공짜
 * - jd-click 재발명 금지(§1.5): 내부 <button>의 click이 그대로 버블
 * - v2 leftIcon/rightIcon/asChild는 React 어댑터 관심사(§10 주해) — children에 직접 작성
 */
import { defineProps, JdElement, type PropDefs } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import buttonStyles from "./button.css.js";

export type JdButtonVariant =
  "primary" | "secondary" | "danger" | "ghost" | "outline" | "link";
export type JdButtonSize = "xs" | "sm" | "md" | "lg";
export type JdButtonType = "button" | "submit" | "reset";

const SPINNER_SVG =
  `<svg class="jd-button__spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">` +
  `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity=".25"/>` +
  `<path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity=".75"/></svg>`;

export class JdButton extends JdElement {
  static override tag = "jd-button";
  static override props: PropDefs = defineProps({
    variant: { type: String, default: "primary", reflect: true }, // enum → reflect(§1.3)
    size: { type: String, default: "md", reflect: true },
    type: { type: String, default: "button" },
    loading: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    fullWidth: { type: Boolean, reflect: true }, // attr: full-width
  });

  declare variant: JdButtonVariant;
  declare size: JdButtonSize;
  declare type: JdButtonType;
  declare loading: boolean;
  declare disabled: boolean;
  declare fullWidth: boolean;

  #btn!: HTMLButtonElement;

  protected render(): void {
    adoptStyles(buttonStyles);
    // 입양 규칙(§3.3): SSR/어댑터가 그린 골격이 있으면 재사용
    const existing = this.querySelector<HTMLButtonElement>(
      ":scope > button.jd-button",
    );
    this.#btn = existing ?? this.#build();
    this.update();
  }

  #build(): HTMLButtonElement {
    const b = document.createElement("button");
    b.className = "jd-button";
    b.append(...this.childNodes); // 사용자가 쓴 children을 내부 button으로 이동
    this.append(b);
    return b;
  }

  protected override update(): void {
    const b = this.#btn;
    b.type =
      this.type === "submit" || this.type === "reset" ? this.type : "button";
    b.disabled = this.disabled || this.loading; // 네이티브 위임(§1.6-1)
    if (this.loading) b.setAttribute("aria-busy", "true");
    else b.removeAttribute("aria-busy");
    const spin = b.querySelector(":scope > .jd-button__spinner");
    if (this.loading && !spin) b.insertAdjacentHTML("afterbegin", SPINNER_SVG);
    else if (!this.loading && spin) spin.remove();
    // variant/size/fullWidth는 reflect된 호스트 속성 → CSS가 처리. JS 분기 없음(§4.3)
  }

  /** 내부 네이티브 버튼으로 포커스를 위임한다. */
  override focus(options?: FocusOptions): void {
    this.#btn?.focus(options);
  }

  /** 내부 네이티브 버튼의 disabled·폼 의미론을 유지한 채 클릭한다. */
  override click(): void {
    this.#btn?.click();
  }
}
