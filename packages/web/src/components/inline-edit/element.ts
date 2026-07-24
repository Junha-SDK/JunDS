/**
 * <jd-inline-edit> — 클릭하면 편집 입력으로 바뀌는 텍스트 (v2 composites/InlineEdit).
 *
 * v2 대비 접근성 가산 3건:
 *  1. v2는 `<span role="button" tabindex=0>` + Enter만 처리했다 — Space가 죽어 있고
 *     disabled가 의미가 아닌 클래스였다. v3는 **진짜 <button>**을 `as` 태그 안에 넣는다:
 *     Enter/Space·포커스 링·disabled 의미론이 브라우저 몫이 된다.
 *  2. 편집 종료(Enter/Escape) 시 포커스를 트리거로 되돌린다(v2는 포커스가 body로 유실).
 *  3. 연필 아이콘은 v2에서 `group-hover:`를 썼는데 `group` 클래스가 어디에도 없어
 *     영원히 opacity-0이었다 — v3는 트리거 :hover/:focus-visible로 실제 동작한다.
 *
 * 상태 표면: `editing`은 property/attribute로 노출(reflect) — 외부에서 편집 모드를
 * 열고 닫을 수 있고 CSS 훅도 된다. 값 확정은 §1.5 canonical `jd-change`.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import inlineEditStyles from "./inline-edit.css.js";

const PENCIL_SVG =
  `<svg class="jd-inline-edit__pencil" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">` +
  `<path d="M8.5 1.5l2 2-6 6H2.5V7.5z" stroke="currentColor" stroke-width="1.2" ` +
  `stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** v2 InlineEditProps["as"] 그대로 — 밖의 값은 span으로 폴백 */
const TAGS = new Set(["span", "h1", "h2", "h3", "p"]);

export class JdInlineEdit extends JdElement {
  static override tag = "jd-inline-edit";
  static override props = {
    value: { type: String },
    placeholder: { type: String, default: "클릭하여 편집" },
    /** 표시 태그 — span | h1 | h2 | h3 | p (v2 동형) */
    as: { type: String, default: "span", reflect: true },
    disabled: { type: Boolean, reflect: true },
    /** 편집 모드 여부 — 외부 제어 가능 + CSS 훅 */
    editing: { type: Boolean, reflect: true },
  };

  declare value: string;
  declare placeholder: string;
  declare as: string;
  declare disabled: boolean;
  declare editing: boolean;

  #display!: HTMLElement;
  #trigger!: HTMLButtonElement;
  #text!: HTMLSpanElement;
  #input!: HTMLInputElement;
  /** 직전 update()의 editing — 진입 시 1회만 포커스 */
  #wasEditing = false;

  protected render(): void {
    adoptStyles(inlineEditStyles);
    const existing = this.querySelector<HTMLInputElement>(":scope > input.jd-inline-edit__input");
    if (existing) {
      this.#input = existing;
      this.#display = this.querySelector<HTMLElement>(":scope > .jd-inline-edit__display")!;
      this.#trigger = this.#display.querySelector<HTMLButtonElement>(".jd-inline-edit__trigger")!;
      this.#text = this.#trigger.querySelector<HTMLSpanElement>(".jd-inline-edit__text")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    this.#display = this.#createDisplay();
    this.#input = document.createElement("input");
    this.#input.className = "jd-inline-edit__input";
    this.#input.type = "text";
    this.append(this.#display, this.#input);
  }

  /** `as` 태그 껍데기 + 진짜 <button> 트리거 */
  #createDisplay(): HTMLElement {
    const tag = TAGS.has(this.as) ? this.as : "span";
    const display = document.createElement(tag);
    display.className = "jd-inline-edit__display";
    this.#trigger = document.createElement("button");
    this.#trigger.type = "button";
    this.#trigger.className = "jd-inline-edit__trigger";
    this.#text = document.createElement("span");
    this.#text.className = "jd-inline-edit__text";
    this.#trigger.append(this.#text);
    this.#trigger.insertAdjacentHTML("beforeend", PENCIL_SVG);
    display.append(this.#trigger);
    return display;
  }

  protected override connected(): void {
    this.#trigger.addEventListener("click", this.#onTriggerClick);
    this.#input.addEventListener("input", this.#onInput);
    this.#input.addEventListener("keydown", this.#onKeyDown);
    this.#input.addEventListener("blur", this.#onBlur);
  }

  protected override disconnected(): void {
    this.#trigger?.removeEventListener("click", this.#onTriggerClick);
    this.#input?.removeEventListener("input", this.#onInput);
    this.#input?.removeEventListener("keydown", this.#onKeyDown);
    this.#input?.removeEventListener("blur", this.#onBlur);
  }

  protected override update(): void {
    // `as`가 바뀌면 껍데기만 교체(트리거·텍스트는 새로 만들어 옮긴다)
    const want = TAGS.has(this.as) ? this.as : "span";
    if (this.#display.localName !== want) {
      const next = this.#createDisplay();
      this.#display.replaceWith(next);
      this.#display = next;
      if (this.isConnected) this.#trigger.addEventListener("click", this.#onTriggerClick);
    }

    const filled = Boolean(this.value);
    this.#text.textContent = filled ? this.value : this.placeholder;
    this.#trigger.toggleAttribute("data-empty", !filled);
    this.#trigger.disabled = this.disabled;
    this.#trigger.setAttribute(
      "aria-label",
      `${filled ? this.value : this.placeholder} 편집`,
    );

    const editing = this.editing && !this.disabled;
    this.#display.hidden = editing;
    this.#input.hidden = !editing;
    this.#input.disabled = this.disabled;
    // 표시 폭 근사 — 편집 중 입력이 텍스트와 비슷한 너비를 갖도록
    this.#input.size = Math.max(4, (filled ? this.value : this.placeholder).length);

    if (editing && !this.#wasEditing) {
      // 진입 시에만 초안 주입 + 포커스 (편집 중 재대입은 IME·캐럿을 깬다)
      this.#input.value = this.value;
      this.#input.focus();
      this.#input.select();
    }
    this.#wasEditing = editing;
  }

  /** 편집 시작 — 외부에서도 호출 가능 */
  edit(): void {
    if (this.disabled) return;
    this.editing = true;
  }

  /** 초안을 버리고 편집 종료 */
  cancel(): void {
    if (!this.editing) return;
    this.editing = false;
    this.#input.value = this.value;
  }

  #onTriggerClick = (): void => {
    this.edit();
  };

  #onInput = (): void => {
    this.emit("jd-input", { value: this.#input.value });
  };

  /** blur·Enter 공통 확정 경로 — 멱등(editing이 이미 false면 no-op) */
  #commit(): void {
    if (!this.editing) return;
    const next = this.#input.value;
    this.editing = false;
    if (next === this.value) return;
    this.value = next;
    this.emit("jd-change", { value: next });
  }

  #onBlur = (): void => {
    this.#commit();
  };

  #onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      this.#commit();
      this.#refocusTrigger();
    } else if (e.key === "Escape") {
      e.preventDefault();
      this.cancel();
      this.#refocusTrigger();
    }
  };

  /** update()가 입력을 감춘 뒤에 트리거로 포커스 복귀 (update는 마이크로태스크 배칭) */
  #refocusTrigger(): void {
    queueMicrotask(() => {
      if (this.isConnected && !this.editing) this.#trigger.focus();
    });
  }

  override focus(options?: FocusOptions): void {
    if (this.editing) this.#input?.focus(options);
    else this.#trigger?.focus(options);
  }
}
