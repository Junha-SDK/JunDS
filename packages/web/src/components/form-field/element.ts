/**
 * <jd-form-field> — 라벨 + 임의 컨트롤(children) + 에러·힌트 행 (v2 composites/FormField).
 *
 * - 컨트롤은 **light DOM children 그대로** 둔다(래퍼 div 없음) — v2 DOM 순서와 동일하게
 *   label → children → error → hint. 골격은 앞뒤에만 삽입되므로 소비자/React 어댑터가
 *   children 소유권을 유지한다(§3.3 입양 + DEC-022-2 children 소유권 경계).
 * - v2 대비 접근성 가산: v2는 `htmlFor`를 **사람이 손으로** 맞춰야 했고 에러·힌트는
 *   어떤 컨트롤과도 연결되지 않았다. v3는 첫 폼 컨트롤 자손을 찾아
 *   label[for] · aria-describedby · aria-invalid를 자동 배선한다(§8 light DOM id 참조).
 *   소비자가 이미 지정한 aria-describedby에는 JunDS id만 병합하고, 상태가 바뀌면
 *   JunDS가 추가한 id만 회수한다 — 자식의 자체 설명과 함께 안전하게 조합된다.
 * - 자식이 커스텀 엘리먼트면 그 내부 <input>은 자식의 render(마이크로태스크) 뒤에 생긴다.
 *   connected()에서 마이크로태스크 1회를 더 예약해 늦게 도착한 컨트롤도 배선한다
 *   (타이머·랜덤 없음 — 프리렌더 결정성 유지).
 */
import { JdElement } from "../../core/element.js";
import { syncAriaIdRefs, syncOwnedAttribute } from "../../core/aria.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import formFieldStyles from "./form-field.css.js";

const ERROR_ICON_SVG =
  `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">` +
  `<circle cx="6" cy="6" r="5.5" stroke="currentColor"/>` +
  `<path d="M6 3.5v3M6 8h.01" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`;

/** 라벨·설명을 붙일 "필드의 컨트롤" 후보 (버튼류는 제외 — 값을 갖는 것만) */
const CONTROL_SELECTOR = 'input:not([type="hidden"]), textarea, select, [contenteditable="true"]';

export class JdFormField extends JdElement {
  static override tag = "jd-form-field";
  static override props = {
    label: { type: String },
    /** 에러 메시지. 비어있지 않으면 에러 상태(CSS 훅 + aria-invalid) */
    error: { type: String, reflect: true },
    /** 힌트 텍스트. error가 있으면 감춘다(v2 동형) */
    hint: { type: String },
    /** 라벨이 가리킬 컨트롤 id. 비우면 첫 컨트롤 자손에서 자동 배선 */
    htmlFor: { type: String, attribute: "for" }, // 네이티브 표기 계승
    required: { type: Boolean, reflect: true }, // 별표는 CSS ::after
  };

  declare label: string;
  declare error: string;
  declare hint: string;
  declare htmlFor: string;
  declare required: boolean;

  #uid = "";
  #label!: HTMLLabelElement;
  #error!: HTMLParagraphElement;
  #hint!: HTMLParagraphElement;
  #wiredControl: HTMLElement | null = null;

  protected render(): void {
    adoptStyles(formFieldStyles);
    const existing = this.querySelector<HTMLLabelElement>(":scope > label.jd-form-field__label");
    if (existing) {
      this.#label = existing;
      this.#error = this.querySelector<HTMLParagraphElement>(":scope > p.jd-form-field__error")!;
      this.#hint = this.querySelector<HTMLParagraphElement>(":scope > p.jd-form-field__hint")!;
      this.#uid = this.#error.id.replace(/-error$/, "");
    } else {
      this.#build();
    }
    this.update();
  }

  /** 라벨은 맨 앞, 에러·힌트는 맨 뒤 — children(컨트롤)은 제자리 유지 */
  #build(): void {
    this.#uid = jdUid("jd-ff");
    this.#label = document.createElement("label");
    this.#label.className = "jd-form-field__label";
    this.#error = document.createElement("p");
    this.#error.className = "jd-form-field__error";
    this.#error.id = `${this.#uid}-error`;
    this.#hint = document.createElement("p");
    this.#hint.className = "jd-form-field__hint";
    this.#hint.id = `${this.#uid}-hint`;
    this.prepend(this.#label);
    this.append(this.#error, this.#hint);
  }

  /** 늦게 업그레이드된 커스텀 엘리먼트 자식(내부 input)까지 배선 */
  protected override connected(): void {
    queueMicrotask(() => {
      if (this.isConnected) this.#wire();
    });
  }

  protected override update(): void {
    const hasLabel = Boolean(this.label);
    this.#label.textContent = this.label;
    this.#label.hidden = !hasLabel;

    const hasError = Boolean(this.error);
    if (hasError) {
      this.#error.innerHTML = ERROR_ICON_SVG;
      this.#error.append(this.error);
    } else {
      this.#error.textContent = "";
    }
    this.#error.hidden = !hasError;

    const hasHint = Boolean(this.hint) && !hasError; // v2: error가 hint를 가린다
    this.#hint.textContent = hasHint ? this.hint : "";
    this.#hint.hidden = !hasHint;

    this.#wire();
  }

  /** label[for] · aria-describedby · aria-invalid 자동 배선 */
  #wire(): void {
    const control = this.querySelector<HTMLElement>(CONTROL_SELECTOR);
    if (this.#wiredControl && this.#wiredControl !== control) {
      this.#unwire(this.#wiredControl);
    }
    this.#wiredControl = control;
    if (!control) {
      this.#label.removeAttribute("for");
      return;
    }
    if (!control.id) control.id = `${this.#uid}-control`;
    if (this.label) this.#label.htmlFor = this.htmlFor || control.id;
    else this.#label.removeAttribute("for");

    const hasError = Boolean(this.error);
    const describedBy = hasError ? this.#error.id : this.hint ? this.#hint.id : null;
    syncAriaIdRefs(control, "aria-describedby", describedBy);
    syncOwnedAttribute(control, "aria-invalid", hasError ? "true" : null);
    // required는 별표(시각) + aria-required(의미)까지만 — 네이티브 required는
    // 제출을 막으므로 v2 표면(별표만)을 넘어서지 않는다(DEC-022-7 대비 보수 선택).
    syncOwnedAttribute(control, "aria-required", this.required ? "true" : null);
  }

  #unwire(control: HTMLElement): void {
    syncAriaIdRefs(control, "aria-describedby", null);
    syncOwnedAttribute(control, "aria-invalid", null);
    syncOwnedAttribute(control, "aria-required", null);
  }

  /** 편의 — 필드의 컨트롤로 포커스 위임 */
  override focus(options?: FocusOptions): void {
    this.querySelector<HTMLElement>(CONTROL_SELECTOR)?.focus(options);
  }
}
