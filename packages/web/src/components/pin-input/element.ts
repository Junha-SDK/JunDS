/**
 * <jd-pin-input> — 자릿수 분할 코드 입력 (v2 primitives/PinInput).
 *
 * - 칸마다 네이티브 <input maxlength=1>: 폼 참여·모바일 숫자 키패드·자동완성
 *   (one-time-code)이 브라우저 기본. 이동/삭제/붙여넣기만 얹는다.
 * - 리스너는 호스트 위임 4종(input·keydown·paste·focusin) — length 변경으로 칸을
 *   재구축해도 재부착이 필요 없다(focus는 버블하지 않아 focusin 사용).
 * - v2 `numeric = true` 기본값은 attribute로 표현 불가(존재=참) → 반전 플래그
 *   `alphanumeric`로 옵트아웃. 기본 동작은 v2와 동일한 숫자 전용.
 * - OTPInput은 이 구현의 파생(§6 R12 · DEC-023-5 Switch=Toggle 선례).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import pinInputStyles from "./pin-input.css.js";

export class JdPinInput extends JdElement {
  static override tag = "jd-pin-input";
  static override props = {
    length: { type: Number, default: 6 },
    /** 전체 값(칸 결합). 프로퍼티/attribute로 채우면 각 칸에 분배된다 */
    value: { type: String },
    masked: { type: Boolean, reflect: true },
    /** 숫자 외 문자 허용(v2 numeric=false 대응) */
    alphanumeric: { type: Boolean, reflect: true },
    error: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    /** 그룹 접근 이름 */
    label: { type: String },
  };

  declare length: number;
  declare value: string;
  declare masked: boolean;
  declare alphanumeric: boolean;
  declare error: boolean;
  declare disabled: boolean;
  declare label: string;

  static styles = pinInputStyles;
  protected baseClass = "jd-pin-input";
  protected fallbackAriaLabel = "인증 번호 입력";
  /** OTP가 false로 고정 — 항상 숫자 */
  protected get textMode(): boolean {
    return this.alphanumeric;
  }
  /** 구분자를 넣을 칸 인덱스. -1이면 없음 (OTP가 재정의) */
  protected separatorIndex(): number {
    return -1;
  }

  #cells: HTMLInputElement[] = [];

  protected render(): void {
    adoptStyles((this.constructor as typeof JdPinInput).styles);
    this.setAttribute("role", "group");
    this.#sync();
    this.update();
  }

  /** 칸 수를 length에 맞춘다. 이미 맞으면 기존 노드 입양(§3.3) */
  #sync(): void {
    const cls = this.baseClass;
    const existing = Array.from(
      this.querySelectorAll<HTMLInputElement>(`:scope > input.${cls}__cell`),
    );
    if (existing.length === this.length) {
      this.#cells = existing;
      return;
    }
    for (const n of Array.from(this.children)) n.remove();
    this.#cells = [];
    const sep = this.separatorIndex();
    for (let i = 0; i < this.length; i++) {
      if (i === sep) {
        const s = document.createElement("span");
        s.className = `${cls}__separator`;
        s.setAttribute("aria-hidden", "true");
        this.append(s);
      }
      const cell = document.createElement("input");
      cell.className = `${cls}__cell`;
      cell.type = "text";
      cell.maxLength = 1;
      cell.autocomplete = "one-time-code";
      this.#cells.push(cell);
      this.append(cell);
    }
  }

  protected override connected(): void {
    this.addEventListener("input", this.#onInput);
    this.addEventListener("keydown", this.#onKeyDown);
    this.addEventListener("paste", this.#onPaste);
    this.addEventListener("focusin", this.#onFocusIn);
  }

  protected override disconnected(): void {
    this.removeEventListener("input", this.#onInput);
    this.removeEventListener("keydown", this.#onKeyDown);
    this.removeEventListener("paste", this.#onPaste);
    this.removeEventListener("focusin", this.#onFocusIn);
  }

  #indexOf(t: EventTarget | null): number {
    return this.#cells.indexOf(t as HTMLInputElement);
  }

  #focusCell(i: number): void {
    this.#cells[i]?.focus();
  }

  /** 칸 → value 반영 + 이벤트(§1.5). 전 칸이 차면 jd-complete 추가 발행 */
  #commit(): void {
    const next = this.#cells.map((c) => c.value).join("");
    this.value = next;
    this.emit("jd-input", { value: next });
    if (next.length === this.#cells.length && this.#cells.every((c) => c.value !== "")) {
      this.emit("jd-complete", { value: next });
    }
  }

  #onInput = (e: Event): void => {
    const cell = e.target as HTMLInputElement;
    const i = this.#indexOf(cell);
    if (i < 0) return;
    // 조합·자동완성으로 2자 이상 들어오면 마지막 1자만 — React 재렌더 되돌림의 바닐라 대응
    let char = cell.value.length > 1 ? cell.value.slice(-1) : cell.value;
    if (!this.textMode && !/^\d?$/.test(char)) char = "";
    cell.value = char;
    this.#commit();
    if (char && i < this.#cells.length - 1) this.#focusCell(i + 1);
  };

  #onKeyDown = (e: KeyboardEvent): void => {
    const i = this.#indexOf(e.target);
    if (i < 0) return;
    if (e.key === "Backspace") {
      const cell = this.#cells[i]!;
      if (cell.value) {
        cell.value = "";
        this.#commit();
      } else if (i > 0) {
        this.#focusCell(i - 1);
        this.#cells[i - 1]!.value = "";
        this.#commit();
      }
    } else if (e.key === "ArrowLeft") {
      this.#focusCell(i - 1);
    } else if (e.key === "ArrowRight") {
      this.#focusCell(i + 1);
    }
  };

  #onPaste = (e: ClipboardEvent): void => {
    if (this.#indexOf(e.target) < 0) return;
    e.preventDefault();
    if (this.disabled) return;
    const raw = e.clipboardData?.getData("text") ?? "";
    // 숫자 모드는 구분자 섞인 코드("123-456")도 받아들인다 — v2 PinInput은 전량 거부였다
    const pasted = (this.textMode ? raw : raw.replace(/\D/g, "")).slice(0, this.#cells.length);
    if (!pasted) return;
    for (let i = 0; i < pasted.length; i++) this.#cells[i]!.value = pasted[i]!;
    this.#commit();
    this.#focusCell(Math.min(pasted.length, this.#cells.length - 1));
  };

  #onFocusIn = (e: FocusEvent): void => {
    const i = this.#indexOf(e.target);
    if (i >= 0) this.#cells[i]!.select();
  };

  protected override update(): void {
    if (this.#cells.length !== this.length) this.#sync();
    const text = this.textMode;
    for (let i = 0; i < this.#cells.length; i++) {
      const c = this.#cells[i]!;
      const ch = this.value[i] ?? "";
      if (c.value !== ch) c.value = ch;
      c.type = this.masked ? "password" : "text";
      c.inputMode = text ? "text" : "numeric";
      c.disabled = this.disabled;
      c.setAttribute("aria-label", `${i + 1}번째 자리`);
      c.toggleAttribute("data-filled", ch !== "");
    }
    this.setAttribute("aria-label", this.label || this.fallbackAriaLabel);
    if (this.error) this.setAttribute("aria-invalid", "true");
    else this.removeAttribute("aria-invalid");
  }

  override focus(options?: FocusOptions): void {
    // 첫 빈 칸으로 — 이어서 입력하는 흐름이 자연스럽다
    const empty = this.#cells.findIndex((c) => !c.value);
    this.#cells[empty < 0 ? 0 : empty]?.focus(options);
  }
}
