/**
 * <jd-search-input> — 아이콘 + 네이티브 input[type=search] + 지우기 버튼 (v2 composites/SearchInput).
 * 같은 배치의 <jd-search-bar>가 이 클래스를 상속한다(§6 R12 — 골격·이벤트·디바운스 공유,
 * 파생은 기하와 단축키만 추가).
 *
 * - 네이티브 위임(§1.6-1): 값·폼 참여·IME·자동완성은 내부 <input name>이 담당한다.
 * - v2는 절대배치 아이콘 + `pl-9 pr-8` 패딩으로 자리를 비웠다. v3는 flex 박스 1개에
 *   아이콘·입력·스피너·지우기·끝슬롯을 나란히 두고 **테두리/포커스 링을 박스가** 갖는다
 *   — 시각 결과는 같고 아이콘 폭 변화에 패딩이 어긋나지 않는다.
 * - v2의 `role="searchbox"`는 input[type=search]의 암묵 role과 중복이라 제거하고,
 *   대신 placeholder를 aria-label로 승격한다(placeholder 단독 이름은 AT에서 불안정).
 * - 검색 실행은 debounce된 `jd-search`. 실시간은 `jd-input`, 확정은 `jd-change`(§1.5).
 *   지우기는 대기 중인 디바운스를 취소하고 즉시 `jd-search`를 낸다(v2 handleClear 동형).
 * - 끝 슬롯: 남은 light DOM children을 `.jd-search-input__end`로 옮긴다
 *   (v2 SearchBar의 endSlot을 노드로 받는 유일한 방법 — §1.3 복합값 attribute 금지).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { debounce } from "../../behaviors/timing.js";
import type { Cancellable } from "../../behaviors/timing.js";
import searchInputStyles from "./search-input.css.js";

const SEARCH_SVG =
  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.5"/>` +
  `<path d="M9.5 9.5L13 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const SPINNER_SVG =
  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">` +
  `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity=".25"/>` +
  `<path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity=".75"/></svg>`;
const CLEAR_SVG =
  `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">` +
  `<path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

type Debounced = ((value: string) => void) & Cancellable;

/** 골격 클래스 접두 — 파생(jd-search-bar)도 같은 클래스를 쓴다(시트는 호스트 델타만) */
const CLS = "jd-search-input";

export class JdSearchInput extends JdElement {
  static override tag = "jd-search-input";
  static override props = {
    value: { type: String },
    placeholder: { type: String, default: "검색..." },
    name: { type: String },
    size: { type: String, default: "md", reflect: true }, // sm | md | lg
    /** jd-search 지연(ms). 0 이하면 즉시 발행 */
    debounce: { type: Number, default: 300 },
    loading: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    clearLabel: { type: String, default: "검색어 지우기" },
  };

  declare value: string;
  declare placeholder: string;
  declare name: string;
  declare size: string;
  declare debounce: number;
  declare loading: boolean;
  declare disabled: boolean;
  declare clearLabel: string;

  protected box!: HTMLDivElement;
  protected input!: HTMLInputElement;
  #spinner!: HTMLSpanElement;
  #clear!: HTMLButtonElement;
  #end!: HTMLSpanElement;
  #debounced: Debounced | null = null;
  #debouncedMs = -1;

  protected render(): void {
    adoptStyles(searchInputStyles);
    const existing = this.querySelector<HTMLDivElement>(`:scope > .${CLS}__box`);
    if (existing) {
      this.box = existing;
      this.input = existing.querySelector<HTMLInputElement>(`.${CLS}__input`)!;
      this.#spinner = existing.querySelector<HTMLSpanElement>(`.${CLS}__spinner`)!;
      this.#clear = existing.querySelector<HTMLButtonElement>(`.${CLS}__clear`)!;
      this.#end = existing.querySelector<HTMLSpanElement>(`.${CLS}__end`)!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    const slotted = Array.from(this.childNodes); // 끝 슬롯 후보 — 골격을 붙이기 전에 회수

    this.box = document.createElement("div");
    this.box.className = `${CLS}__box`;

    const icon = document.createElement("span");
    icon.className = `${CLS}__icon`;
    icon.innerHTML = SEARCH_SVG;

    this.input = document.createElement("input");
    this.input.type = "search";
    this.input.className = `${CLS}__input`;

    this.#spinner = document.createElement("span");
    this.#spinner.className = `${CLS}__spinner`;
    this.#spinner.innerHTML = SPINNER_SVG;

    this.#clear = document.createElement("button");
    this.#clear.type = "button";
    this.#clear.className = `${CLS}__clear`;
    this.#clear.innerHTML = CLEAR_SVG;

    this.#end = document.createElement("span");
    this.#end.className = `${CLS}__end`;
    this.#end.append(...slotted);

    this.box.append(icon, this.input, this.#spinner, this.#clear, this.#end);
    this.append(this.box);
  }

  protected override connected(): void {
    this.input.addEventListener("input", this.#onInput);
    this.input.addEventListener("change", this.#onChange);
    this.#clear.addEventListener("click", this.#onClear);
  }

  protected override disconnected(): void {
    this.input?.removeEventListener("input", this.#onInput);
    this.input?.removeEventListener("change", this.#onChange);
    this.#clear?.removeEventListener("click", this.#onClear);
    this.#debounced?.cancel();
  }

  protected override update(): void {
    const input = this.input;
    input.placeholder = this.placeholder;
    input.disabled = this.disabled;
    if (this.name) input.name = this.name;
    else input.removeAttribute("name");
    if (this.placeholder) input.setAttribute("aria-label", this.placeholder);
    else input.removeAttribute("aria-label");
    this.box.setAttribute("aria-busy", this.loading ? "true" : "false");
    // IME 안전 — 실제로 다를 때만 되쓰기(jd-text-field 선례)
    if (input.value !== this.value) input.value = this.value;

    this.#spinner.hidden = !this.loading;
    this.#clear.hidden = this.loading || this.disabled || !this.value;
    this.#clear.setAttribute("aria-label", this.clearLabel);
    // 공백만 있는 슬롯은 접힌 것으로 본다(HTML 들여쓰기가 gap을 만들지 않도록)
    this.#end.hidden = !this.#end.firstElementChild && (this.#end.textContent ?? "").trim() === "";
  }

  /** 값을 비우고 즉시 재검색 — 지우기 버튼과 같은 경로 */
  clear(): void {
    if (this.value === "" && this.input.value === "") return;
    this.input.value = "";
    this.value = "";
    this.#debounced?.cancel();
    this.emit("jd-input", { value: "" });
    this.emit("jd-search", { value: "" });
  }

  #onInput = (): void => {
    const value = this.input.value;
    this.value = value; // update()는 값 동일로 no-op
    this.emit("jd-input", { value });
    this.#scheduleSearch(value);
  };

  #onChange = (): void => {
    this.emit("jd-change", { value: this.input.value });
  };

  #onClear = (): void => {
    this.clear();
    this.input.focus();
  };

  /** debounce 프로퍼티가 바뀌면 래퍼를 갈아끼운다(지연은 생성 시 고정) */
  #scheduleSearch(value: string): void {
    const ms = this.debounce;
    if (ms <= 0) {
      this.emit("jd-search", { value });
      return;
    }
    if (!this.#debounced || this.#debouncedMs !== ms) {
      this.#debounced?.cancel();
      this.#debouncedMs = ms;
      this.#debounced = debounce((v: string) => {
        this.emit("jd-search", { value: v });
      }, ms);
    }
    this.#debounced(value);
  }

  override focus(options?: FocusOptions): void {
    this.input?.focus(options);
  }
}
