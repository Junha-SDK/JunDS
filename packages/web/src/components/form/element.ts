/**
 * <jd-form> — 값/오류/터치 상태를 관장하는 폼 컨테이너 (v2 patterns/Form).
 *
 * v2는 React Context로 values/errors/touched를 자식 FormField에 내려보냈다. 바닐라
 * light DOM에는 컨텍스트가 없다 — 대신 내부 <input name>이 조상 <form>에 그냥 참여하는
 * 네이티브 위임(§1.6-1)을 살려, 컨트롤의 input/change를 **위임 수집**해 values를 자동
 * 구성한다(v2는 소비자가 onChange를 손으로 배선해야 했다 — 순가산).
 *
 * - values/errors/touched는 복합 데이터라 property 전용(§1.3 WEB-03). 초기 seed·읽기용이며
 *   컨트롤 값으로 되쓰지 않는다(controlled 충돌·IME 안전). 되쓰기는 setValue()가 담당.
 * - 제출: 네이티브 submit을 preventDefault하고, 권위 값은 FormData로 수집해 발행한다
 *   (jd-select 같은 hidden input 참여 컨트롤까지 포함).
 * - 이벤트(§1.5): jd-input/jd-change { name, value } · jd-blur { name } · jd-submit { values }.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import formStyles from "./form.css.js";

type Values = Record<string, unknown>;

const NAMED_CONTROL = "input, textarea, select";

export class JdForm extends JdElement {
  static override tag = "jd-form";
  static override props = {};

  #form!: HTMLFormElement;
  #values: Values = {};
  #errors: Record<string, string> = {};
  #touched: Record<string, boolean> = {};

  /* ── 복합 데이터 표면 — property 전용(§1.3) ─────────────────────────── */

  get values(): Values {
    return this.#values;
  }
  set values(v: Values) {
    this.#values = v && typeof v === "object" ? v : {};
    this.requestUpdate();
  }

  get errors(): Record<string, string> {
    return this.#errors;
  }
  set errors(v: Record<string, string>) {
    this.#errors = v && typeof v === "object" ? v : {};
    this.requestUpdate();
  }

  get touched(): Record<string, boolean> {
    return this.#touched;
  }
  set touched(v: Record<string, boolean>) {
    this.#touched = v && typeof v === "object" ? v : {};
    this.requestUpdate();
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(formStyles);
    this.#upgradeOwn("values");
    this.#upgradeOwn("errors");
    this.#upgradeOwn("touched");
    const existing = this.querySelector<HTMLFormElement>(":scope > form.jd-form");
    this.#form = existing ?? this.#build();
    this.#form.noValidate = true;
    this.update();
  }

  #build(): HTMLFormElement {
    const form = document.createElement("form");
    form.className = "jd-form";
    form.append(...this.childNodes); // 사용자 children을 내부 <form>으로 이동(§1.6-1 폼 참여)
    this.append(form);
    return form;
  }

  /** 업그레이드 전 대입된 복합 own property 회수(base #upgradeProps는 static props만) */
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
    this.#form.addEventListener("change", this.#onChange);
    this.#form.addEventListener("focusout", this.#onFocusOut);
  }

  protected override disconnected(): void {
    this.#form?.removeEventListener("submit", this.#onSubmit);
    this.#form?.removeEventListener("input", this.#onInput);
    this.#form?.removeEventListener("change", this.#onChange);
    this.#form?.removeEventListener("focusout", this.#onFocusOut);
  }

  /* ── 이벤트 ───────────────────────────────────────────────────────── */

  #named(target: EventTarget | null): { name: string; value: unknown } | null {
    const el = target as HTMLElement | null;
    if (!el) return null;
    const name = (el as HTMLInputElement).name;
    if (!name) return null;
    const input = el as HTMLInputElement;
    const value =
      input.type === "checkbox" ? input.checked : input.type === "radio" ? input.value : input.value;
    return { name, value };
  }

  #onInput = (e: Event): void => {
    const hit = this.#named(e.target);
    if (!hit) return;
    this.#values[hit.name] = hit.value;
    this.emit("jd-input", { name: hit.name, value: hit.value });
  };

  #onChange = (e: Event): void => {
    const hit = this.#named(e.target);
    if (!hit) return;
    this.#values[hit.name] = hit.value;
    this.emit("jd-change", { name: hit.name, value: hit.value });
  };

  #onFocusOut = (e: FocusEvent): void => {
    const hit = this.#named(e.target);
    if (!hit) return;
    this.#touched[hit.name] = true;
    this.emit("jd-blur", { name: hit.name });
  };

  #onSubmit = (e: SubmitEvent): void => {
    e.preventDefault();
    this.emit("jd-submit", { values: this.collect() });
  };

  /* ── 공개 표면 ─────────────────────────────────────────────────────── */

  /** 권위 값 — 네이티브 FormData로 수집(hidden input 참여 컨트롤 포함) */
  collect(): Values {
    const out: Values = { ...this.#values };
    const data = new FormData(this.#form);
    for (const key of new Set(data.keys())) {
      const all = data.getAll(key);
      out[key] = all.length > 1 ? all : all[0];
    }
    return out;
  }

  /** 프로그램적 값 설정 — 매칭 컨트롤에 되쓴다(있으면) + 모델 갱신 */
  setValue(name: string, value: unknown): void {
    this.#values[name] = value;
    const control = this.#form?.querySelector<HTMLElement>(`[name="${CSS.escape(name)}"]`);
    if (control) {
      if (control.matches(NAMED_CONTROL)) {
        (control as HTMLInputElement).value = value == null ? "" : String(value);
      } else {
        (control as unknown as { value?: unknown }).value = value;
      }
    }
    this.emit("jd-change", { name, value });
  }

  /** 제출 트리거 (외부 버튼용) */
  submit(): void {
    if (this.#form.requestSubmit) this.#form.requestSubmit();
    else this.emit("jd-submit", { values: this.collect() });
  }

  /** 네이티브 리셋 + 모델 초기화 */
  reset(): void {
    this.#form?.reset();
    this.#values = {};
    this.#errors = {};
    this.#touched = {};
    this.requestUpdate();
  }
}
