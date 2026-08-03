/**
 * <jd-form-builder> — 선언적 폼 빌더: 필드 배열로 폼 자동 생성 (v2 patterns/FormBuilder).
 *
 * 각 필드는 <jd-form-field>(라벨·에러·required 자동 배선) + 컨트롤로 구성한다:
 *  - text/email/password/number → 네이티브 <input>(폼 참여·자동완성·IME 공짜)
 *  - textarea → <jd-textarea>
 *  - select → <jd-select>(옵션 property + hidden input 폼 참여)
 * 라벨/에러/aria는 jd-form-field가 전담하므로 빌더는 값·검증만 관장한다.
 *
 * - fields는 복합 데이터 → property 전용(§1.3). validate 함수가 없는 선언형이면 자식
 *   <script type="application/json"> 슬롯으로도 시드 가능(WEB-03 예외).
 * - 검증(v2 동형): required 미입력 → "{label}을(를) 입력해주세요", 이후 커스텀 validate.
 *   블러 시 해당 필드, 제출 시 전 필드 검증.
 * - 이벤트(§1.5): jd-change { name, value } · jd-submit { values }(유효할 때만).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import formBuilderStyles from "./form-builder.css.js";
import type { JdSelectOption } from "../select/element.js";

export type JdFieldType = "text" | "email" | "password" | "number" | "textarea" | "select";

export interface JdBuilderField {
  name: string;
  label: string;
  type: JdFieldType;
  required?: boolean;
  placeholder?: string;
  options?: JdSelectOption[];
  validate?: (value: string) => string | undefined;
}

/** jd-form-field 인스턴스의 우리가 만지는 표면 */
type FormFieldEl = HTMLElement & { label: string; error: string; required: boolean };

const TEXT_TYPES = new Set<JdFieldType>(["text", "email", "password", "number"]);

export class JdFormBuilder extends JdElement {
  static override tag = "jd-form-builder";
  static override props = {
    submitLabel: { type: String, default: "저장" }, // attr: submit-label
    loading: { type: Boolean, reflect: true },
    columns: { type: Number, default: 1, reflect: true }, // 1 | 2 — CSS 그리드 훅
  };

  declare submitLabel: string;
  declare loading: boolean;
  declare columns: number;

  #fields: JdBuilderField[] = [];
  #values: Record<string, string> = {};
  #errors: Record<string, string> = {};
  #touched = new Set<string>();

  #form!: HTMLFormElement;
  #grid!: HTMLElement;
  #footer!: HTMLElement;
  #submit!: HTMLElement;
  #actions: Node[] = [];
  #controls = new Map<string, HTMLElement>();
  #wrappers = new Map<string, FormFieldEl>();
  #renderedKey = "";

  get fields(): JdBuilderField[] {
    return this.#fields;
  }
  set fields(v: JdBuilderField[]) {
    this.#fields = Array.isArray(v) ? v : [];
    this.#seedValues();
    this.requestUpdate();
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(formBuilderStyles);
    this.#upgradeOwn("fields");
    this.#readJson();
    this.#seedValues();
    // actions 슬롯 자식은 골격 구축 전에 회수(재구축 시에도 보존)
    this.#actions = Array.from(this.childNodes).filter(
      (n) => n instanceof Element && n.getAttribute("slot") === "actions",
    );

    const existing = this.querySelector<HTMLFormElement>(":scope > form.jd-form-builder");
    if (existing) {
      this.#form = existing;
      this.#grid = existing.querySelector(".jd-form-builder__grid")!;
      this.#footer = existing.querySelector(".jd-form-builder__footer")!;
      this.#submit = existing.querySelector(".jd-form-builder__submit")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as JdBuilderField[];
      if (Array.isArray(parsed)) this.#fields = parsed;
    } catch {
      console.warn("[junds] <jd-form-builder> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #seedValues(): void {
    for (const f of this.#fields) {
      if (!(f.name in this.#values)) this.#values[f.name] = "";
    }
  }

  #build(): void {
    this.#form = document.createElement("form");
    this.#form.className = "jd-form-builder";
    this.#grid = document.createElement("div");
    this.#grid.className = "jd-form-builder__grid";
    this.#footer = document.createElement("div");
    this.#footer.className = "jd-form-builder__footer";

    this.#submit = document.createElement("jd-button");
    this.#submit.className = "jd-form-builder__submit";
    this.#submit.setAttribute("type", "submit");

    this.#footer.append(this.#submit, ...this.#actions);
    this.#form.append(this.#grid, this.#footer);
    this.append(this.#form);
  }

  #upgradeOwn(name: string): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const self = this as unknown as Record<string, unknown>;
    const v = self[name];
    delete self[name];
    self[name] = v;
  }

  protected override connected(): void {
    this.#form.addEventListener("submit", this.#onSubmit);
    this.#form.addEventListener("input", this.#onInput);
    this.#form.addEventListener("jd-change", this.#onJdChange as EventListener);
    this.#form.addEventListener("focusout", this.#onFocusOut);
  }

  protected override disconnected(): void {
    this.#form?.removeEventListener("submit", this.#onSubmit);
    this.#form?.removeEventListener("input", this.#onInput);
    this.#form?.removeEventListener("jd-change", this.#onJdChange as EventListener);
    this.#form?.removeEventListener("focusout", this.#onFocusOut);
  }

  /* ── 이벤트 ───────────────────────────────────────────────────────── */

  #nameOf(target: EventTarget | null): string | null {
    const wrapper = (target as Element | null)?.closest<HTMLElement>("jd-form-field[data-name]");
    return wrapper?.dataset.name ?? null;
  }

  #readControl(name: string): string {
    const control = this.#controls.get(name);
    if (!control) return "";
    const v = (control as unknown as { value?: unknown }).value;
    return v == null ? "" : String(v);
  }

  #onInput = (e: Event): void => {
    // 우리 네이티브 입력·textarea만 — jd-select 내부 검색창 등은 무시(jd-select는 jd-change로 처리)
    const t = e.target as HTMLElement;
    if (!(t.matches("input.jd-form-builder__input") || t.tagName === "TEXTAREA")) return;
    const name = this.#nameOf(t);
    if (!name) return;
    this.#values[name] = this.#readControl(name);
    this.emit("jd-change", { name, value: this.#values[name] });
    if (this.#touched.has(name)) {
      this.#validateField(name);
      this.#showErrors();
    }
  };

  #onJdChange = (e: CustomEvent): void => {
    const target = e.target as Element | null;
    if (!target || target === this) return; // 우리가 재발행한 이벤트는 무시
    const name = this.#nameOf(target);
    if (!name) return;
    this.#values[name] = this.#readControl(name);
    this.emit("jd-change", { name, value: this.#values[name] });
    if (this.#touched.has(name)) {
      this.#validateField(name);
      this.#showErrors();
    }
  };

  #onFocusOut = (e: FocusEvent): void => {
    const name = this.#nameOf(e.target);
    if (!name) return;
    this.#values[name] = this.#readControl(name);
    this.#touched.add(name);
    this.#validateField(name);
    this.#showErrors();
  };

  #onSubmit = (e: SubmitEvent): void => {
    e.preventDefault();
    for (const f of this.#fields) {
      this.#values[f.name] = this.#readControl(f.name);
      this.#touched.add(f.name);
    }
    let valid = true;
    for (const f of this.#fields) if (!this.#validateField(f.name)) valid = false;
    this.#showErrors();
    if (valid) this.emit("jd-submit", { values: { ...this.#values } });
  };

  /* ── 검증 ─────────────────────────────────────────────────────────── */

  #validateField(name: string): boolean {
    const field = this.#fields.find((f) => f.name === name);
    if (!field) return true;
    const value = this.#values[name] ?? "";
    let error: string | undefined;
    if (field.required && !value.trim()) error = `${field.label}을(를) 입력해주세요`;
    if (!error && field.validate) error = field.validate(value);
    if (error) this.#errors[name] = error;
    else delete this.#errors[name];
    return !error;
  }

  #showErrors(): void {
    for (const f of this.#fields) {
      const wrap = this.#wrappers.get(f.name);
      if (!wrap) continue;
      const show = this.#touched.has(f.name) && this.#errors[f.name];
      wrap.error = show ? this.#errors[f.name]! : "";
    }
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    const key = this.#fields.map((f) => `${f.name}:${f.type}`).join("|");
    if (key !== this.#renderedKey) {
      this.#rebuildRows();
      this.#renderedKey = key;
    }
    this.#submit.textContent = this.submitLabel;
    this.#submit.toggleAttribute("loading", this.loading);
    this.#showErrors();
  }

  #rebuildRows(): void {
    this.#grid.textContent = "";
    this.#controls.clear();
    this.#wrappers.clear();

    for (const field of this.#fields) {
      const wrap = document.createElement("jd-form-field") as FormFieldEl;
      wrap.dataset.name = field.name;
      wrap.label = field.label;
      wrap.required = Boolean(field.required);
      if (field.type === "textarea" && this.columns === 2) wrap.setAttribute("data-span", "");

      const control = this.#buildControl(field);
      wrap.append(control);
      this.#controls.set(field.name, control);
      this.#wrappers.set(field.name, wrap);
      this.#grid.append(wrap);
    }
  }

  #buildControl(field: JdBuilderField): HTMLElement {
    if (field.type === "textarea") {
      const ta = document.createElement("jd-textarea");
      ta.setAttribute("name", field.name);
      if (field.placeholder) ta.setAttribute("placeholder", field.placeholder);
      return ta;
    }
    if (field.type === "select") {
      const sel = document.createElement("jd-select");
      sel.setAttribute("name", field.name);
      sel.setAttribute("full-width", "");
      if (field.placeholder) sel.setAttribute("placeholder", field.placeholder);
      sel.setAttribute("aria-label", field.label); // form-field가 button은 배선 못함
      (sel as unknown as { options: JdSelectOption[] }).options = field.options ?? [];
      return sel;
    }
    const input = document.createElement("input");
    input.className = "jd-form-builder__input";
    input.type = TEXT_TYPES.has(field.type) ? field.type : "text";
    input.name = field.name;
    if (field.placeholder) input.placeholder = field.placeholder;
    return input;
  }
}
