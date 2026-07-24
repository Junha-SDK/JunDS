/**
 * <jd-combobox> — 자동완성 + 셀렉트 + 생성 (v2 composites/Combobox).
 *
 * 이 배치의 **입력형 콤보박스 정본**이다. AutoComplete는 이 클래스의 파생으로
 * "무엇이 value인가"만 갈아끼운다(§6 R12): Combobox는 value=선택된 옵션 값이고
 * 입력 텍스트는 별도 질의(query), AutoComplete는 value=입력 텍스트 그 자체다.
 * 나머지(팝업·필터·화살표 내비·로딩·빈 상태·클릭아웃·디바운스)는 전부 공유한다.
 *
 * 옵션 입력 2경로: `options` 프로퍼티 / 자식 `<script type="application/json">`.
 *
 * 이벤트(§1.5):
 *  - `jd-input`  {value}  입력 즉시 (실시간)
 *  - `jd-search` {query}  searchDelay(기본 200ms) 디바운스 — v2 onInputChange 대응.
 *                         behaviors/timing의 debounce를 그대로 쓴다(자체 구현 금지).
 *  - `jd-create` {value}  creatable 행을 골랐을 때 (jd-change보다 먼저)
 *  - `jd-change` {value}  값 확정
 *  - `jd-open` / `jd-close`
 *
 * v2 대비 교정 3건:
 *  1. **role 구조**: v2 팝업은 `<button>` 나열이라 리스트박스가 아니었고
 *     aria-expanded/activedescendant도 없었다. v3는 APG Combobox 그대로다.
 *  2. **IME 안전**: 입력값 되쓰기는 실제로 다를 때만 한다(text-field 규칙).
 *     열려 있는 동안 query는 input.value의 거울이라 되쓰기가 발생하지 않는다.
 *  3. **폼 참여**: `name`을 주면 hidden input으로 조상 form에 값이 실린다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { createClickOutside, createKeyHandler } from "../../behaviors/input.js";
import { debounce, type Cancellable } from "../../behaviors/timing.js";
import comboboxStyles from "./combobox.css.js";

export interface JdComboboxOption {
  value: string;
  label: string;
  description?: string;
  /** 이모지·기호 등 텍스트 아이콘 (v2 ReactNode의 바닐라 축약) */
  icon?: string;
  disabled?: boolean;
}

const SEARCH_SVG =
  `<svg class="jd-combobox__icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.5"/>` +
  `<path d="M9.5 9.5L13 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

const SPINNER_SVG =
  `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">` +
  `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity=".25"/>` +
  `<path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity=".75"/></svg>`;

const CHECK_SVG =
  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<path d="M3 7.5l3 3 5-5" stroke="currentColor" stroke-width="1.5" ` +
  `stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** 목록 항목 = 옵션 + creatable 합성 행 표식 */
export interface JdComboboxItem extends JdComboboxOption {
  create?: boolean;
}

export class JdCombobox extends JdElement {
  static override tag = "jd-combobox";
  static override props = {
    value: { type: String }, // 타이핑마다 attribute를 되쓰지 않는다(text-field 선례)
    name: { type: String },
    placeholder: { type: String, default: "검색..." },
    createLabel: { type: String, default: "새로 만들기:" },
    emptyMessage: { type: String, default: "결과 없음" },
    creatable: { type: Boolean, reflect: true },
    loading: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    error: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true },
    /** jd-search 디바운스(ms). v2 useDebounce 200 */
    searchDelay: { type: Number, default: 200 },
  };

  declare value: string;
  declare name: string;
  declare placeholder: string;
  declare createLabel: string;
  declare emptyMessage: string;
  declare creatable: boolean;
  declare loading: boolean;
  declare disabled: boolean;
  declare error: boolean;
  declare open: boolean;
  declare searchDelay: number;

  protected fallbackAriaLabel = "검색";

  protected optionList: JdComboboxOption[] = [];
  protected items: JdComboboxItem[] = [];
  protected query = "";
  protected activeIndex = 0;
  protected renderedKey: string | null = null;
  protected wasOpen = false;
  protected pendingScroll = false;

  protected control!: HTMLElement;
  protected inputEl!: HTMLInputElement;
  protected spinnerEl!: HTMLElement;
  protected popup!: HTMLElement;
  protected listEl!: HTMLUListElement;
  protected emptyEl!: HTMLElement;
  protected loadingEl!: HTMLElement;
  protected listId = "";
  protected searchEmit?: ((q: string) => void) & Cancellable;

  get options(): JdComboboxOption[] {
    return this.optionList;
  }
  set options(v: JdComboboxOption[]) {
    this.optionList = Array.isArray(v) ? this.normalizeOptions(v) : [];
    this.renderedKey = null;
    this.requestUpdate();
  }

  /** AutoComplete가 v2의 `key` 필드를 value로 접기 위해 재정의 */
  protected normalizeOptions(v: JdComboboxOption[]): JdComboboxOption[] {
    return v;
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(comboboxStyles);
    this.adoptStyleHook();
    this.upgradeOwn("options");
    this.readJsonSlot();
    if (!this.querySelector(":scope > .jd-combobox__control")) this.buildSkeleton();
    this.control = this.querySelector<HTMLElement>(":scope > .jd-combobox__control")!;
    this.inputEl = this.control.querySelector<HTMLInputElement>(".jd-combobox__input")!;
    this.spinnerEl = this.control.querySelector<HTMLElement>(".jd-combobox__spinner")!;
    this.popup = this.querySelector<HTMLElement>(":scope > .jd-combobox__popup")!;
    this.listEl = this.popup.querySelector<HTMLUListElement>(".jd-combobox__list")!;
    this.emptyEl = this.popup.querySelector<HTMLElement>(".jd-combobox__empty")!;
    this.loadingEl = this.popup.querySelector<HTMLElement>(".jd-combobox__loading")!;
    this.listId = this.listEl.id;
    this.bindSkeleton();
    this.update();
  }

  protected adoptStyleHook(): void {}

  protected upgradeOwn(name: string): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const self = this as unknown as Record<string, unknown>;
    const v = self[name];
    delete self[name];
    self[name] = v;
  }

  protected readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as JdComboboxOption[];
      if (Array.isArray(parsed)) this.optionList = this.normalizeOptions(parsed);
    } catch {
      console.warn(`[junds] <${(this.constructor as typeof JdCombobox).tag}> JSON 슬롯 파싱 실패 — 무시합니다.`);
    }
    script.remove();
  }

  protected buildSkeleton(): void {
    const id = jdUid("jd-combobox");
    const control = document.createElement("div");
    control.className = "jd-combobox__control";
    control.insertAdjacentHTML("beforeend", SEARCH_SVG);
    const input = document.createElement("input");
    input.type = "text";
    input.className = "jd-combobox__input";
    input.autocomplete = "off";
    input.id = `${id}-input`;
    const spinner = document.createElement("span");
    spinner.className = "jd-combobox__spinner";
    spinner.setAttribute("aria-hidden", "true");
    spinner.innerHTML = SPINNER_SVG;
    control.append(input, spinner);

    const popup = document.createElement("div");
    popup.className = "jd-combobox__popup";
    const list = document.createElement("ul");
    list.className = "jd-combobox__list";
    list.id = `${id}-list`;
    list.setAttribute("role", "listbox");
    const empty = document.createElement("div");
    empty.className = "jd-combobox__empty";
    const loading = document.createElement("div");
    loading.className = "jd-combobox__loading";
    loading.innerHTML = SPINNER_SVG;
    popup.append(list, empty, loading);
    this.append(control, popup);
  }

  protected bindSkeleton(): void {
    this.control.addEventListener("mousedown", this.onControlPointer);
    this.inputEl.addEventListener("input", this.onInput);
    this.inputEl.addEventListener("focus", this.onInputFocus);
    this.popup.addEventListener("mousedown", this.onPopupPointer);
    this.listEl.addEventListener("click", this.onListClick);
  }

  /* ── 수명주기 ─────────────────────────────────────────────────────── */

  protected override connected(): void {
    this.searchEmit = debounce((q: string) => this.emit("jd-search", { query: q }), this.searchDelay);
    this.own(
      createClickOutside(this, () => {
        if (this.open) this.setOpen(false);
      }),
    );
    this.own(
      createKeyHandler(
        this,
        {
          escape: this.onEscape,
          arrowdown: (e) => this.onArrow(e, 1),
          arrowup: (e) => this.onArrow(e, -1),
          home: (e) => this.onEdge(e, "first"),
          end: (e) => this.onEdge(e, "last"),
          enter: this.onEnter,
        },
        { enableOnFormTags: true, preventDefault: false },
      ),
    );
    this.addEventListener("focusout", this.onFocusOut);
  }

  protected override disconnected(): void {
    this.searchEmit?.cancel();
    this.removeEventListener("focusout", this.onFocusOut);
  }

  /* ── 상태 전이 ─────────────────────────────────────────────────────── */

  protected setOpen(next: boolean): void {
    if (next && this.disabled) return;
    if (this.open === next) return;
    this.open = next;
  }

  protected setActive(i: number): void {
    if (this.activeIndex === i) return;
    this.activeIndex = i;
    this.pendingScroll = true;
    this.requestUpdate();
  }

  /** 필터에 쓰는 질의 문자열. AutoComplete는 value 자체가 질의다 */
  protected queryText(): string {
    return this.query;
  }

  /** 타이핑을 어디에 저장할지. AutoComplete는 value에 넣는다 */
  protected acceptTyped(v: string): void {
    this.query = v;
  }

  /** 닫혔을 때 입력창에 보일 텍스트 */
  protected inputText(): string {
    if (this.open) return this.query;
    return this.selectedOption()?.label ?? "";
  }

  protected selectedOption(): JdComboboxOption | undefined {
    return this.value ? this.optionList.find((o) => o.value === this.value) : undefined;
  }

  protected isSelected(opt: JdComboboxItem): boolean {
    return !opt.create && Boolean(this.value) && opt.value === this.value;
  }

  protected pick(opt: JdComboboxItem): void {
    if (opt.disabled) return;
    if (opt.create) this.emit("jd-create", { value: opt.value });
    this.value = opt.value;
    this.query = "";
    this.emit("jd-change", { value: opt.value });
    this.setOpen(false);
    this.requestUpdate();
  }

  /* ── 이벤트 ────────────────────────────────────────────────────────── */

  protected onControlPointer = (e: MouseEvent): void => {
    if (this.disabled) return;
    // 입력창 자체를 눌렀을 때는 기본 동작을 남긴다(네이티브 캐럿 배치)
    if (e.target !== this.inputEl) {
      e.preventDefault();
      this.inputEl.focus();
    }
    this.setOpen(true);
  };

  protected onInputFocus = (): void => {
    if (!this.disabled) this.setOpen(true);
  };

  protected onInput = (): void => {
    const v = this.inputEl.value;
    this.acceptTyped(v);
    this.activeIndex = 0;
    this.renderedKey = null;
    if (!this.open) this.setOpen(true);
    this.requestUpdate();
    this.emit("jd-input", { value: v });
    this.searchEmit?.(v);
  };

  /** 팝업 mousedown 차단 — 포커스가 입력창을 떠나 click이 유실되는 것을 막는다 */
  protected onPopupPointer = (e: MouseEvent): void => {
    e.preventDefault();
  };

  protected onListClick = (e: Event): void => {
    const row = (e.target as Element | null)?.closest<HTMLElement>(".jd-combobox__option");
    if (!row || !this.listEl.contains(row)) return;
    const i = Array.prototype.indexOf.call(this.listEl.children, row);
    const opt = this.items[i];
    if (opt) this.pick(opt);
  };

  protected onFocusOut = (e: FocusEvent): void => {
    if (!this.open) return;
    const next = e.relatedTarget as Node | null;
    if (next && this.contains(next)) return;
    this.setOpen(false);
  };

  protected onEscape = (e: KeyboardEvent): void => {
    if (!this.open) return;
    e.preventDefault();
    e.stopPropagation();
    this.setOpen(false);
  };

  protected onArrow = (e: KeyboardEvent, delta: number): void => {
    e.preventDefault();
    if (!this.open) {
      this.setOpen(true);
      return;
    }
    this.moveActive(delta);
  };

  protected onEdge = (e: KeyboardEvent, edge: "first" | "last"): void => {
    if (!this.open) return;
    e.preventDefault();
    this.activeIndex = edge === "first" ? -1 : this.items.length;
    this.moveActive(edge === "first" ? 1 : -1);
  };

  protected onEnter = (e: KeyboardEvent): void => {
    if (!this.open) return;
    e.preventDefault();
    const opt = this.items[this.activeIndex];
    if (opt) this.pick(opt);
  };

  protected moveActive(delta: number): void {
    const n = this.items.length;
    if (n === 0) return;
    let i = this.activeIndex;
    if (i < 0 || i >= n) i = delta > 0 ? -1 : n;
    for (let step = 0; step < n; step++) {
      i += delta;
      if (i < 0 || i >= n) return; // 클램프 — v2 동형
      if (!this.items[i]!.disabled) {
        this.setActive(i);
        return;
      }
    }
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    const opening = this.open && !this.wasOpen;
    const closing = !this.open && this.wasOpen;
    if (closing) {
      this.query = "";
      this.renderedKey = null;
    }
    if (opening) {
      this.activeIndex = 0;
      this.renderedKey = null;
    }

    this.inputEl.disabled = this.disabled;
    this.inputEl.placeholder = this.placeholderText();
    if (!this.inputEl.hasAttribute("aria-label") && !this.inputEl.getAttribute("aria-labelledby")) {
      this.inputEl.setAttribute("aria-label", this.fallbackAriaLabel);
    }
    // IME 안전: 실제로 다를 때만 되쓴다(조합 중 재대입이 조합을 끊는다)
    const want = this.inputText();
    if (this.inputEl.value !== want) this.inputEl.value = want;

    this.spinnerEl.hidden = !this.loading;
    this.syncList();
    this.syncFormField();

    this.popup.hidden = !this.open;
    this.inputEl.setAttribute("role", "combobox");
    this.inputEl.setAttribute("aria-autocomplete", "list");
    this.inputEl.setAttribute("aria-controls", this.listId);
    this.inputEl.setAttribute("aria-expanded", String(this.open));
    const row = this.open ? (this.listEl.children[this.activeIndex] as HTMLElement | undefined) : undefined;
    if (row) this.inputEl.setAttribute("aria-activedescendant", row.id);
    else this.inputEl.removeAttribute("aria-activedescendant");

    if (this.pendingScroll) {
      this.pendingScroll = false;
      if (row && typeof row.scrollIntoView === "function") row.scrollIntoView({ block: "nearest" });
    }

    if (opening) {
      this.wasOpen = true;
      this.emit("jd-open");
    }
    if (closing) {
      this.wasOpen = false;
      this.emit("jd-close");
    }
  }

  /** v2: 선택된 값이 있으면 그 라벨이 placeholder가 된다(열면 입력창이 비므로) */
  protected placeholderText(): string {
    return this.selectedOption()?.label ?? this.placeholder;
  }

  protected buildItems(): JdComboboxItem[] {
    const q = this.queryText().trim();
    const lower = q.toLowerCase();
    const filtered = !lower
      ? this.optionList.slice()
      : this.optionList.filter(
          (o) =>
            o.label.toLowerCase().includes(lower) ||
            Boolean(o.description?.toLowerCase().includes(lower)),
        );
    if (this.creatable && q && !filtered.some((o) => o.label.toLowerCase() === lower)) {
      return [...filtered, { value: q, label: `${this.createLabel} "${q}"`, create: true }];
    }
    return filtered;
  }

  protected syncList(): void {
    this.items = this.buildItems();
    const key = JSON.stringify(this.items.map((o) => [o.value, o.create === true]));
    if (key !== this.renderedKey || this.listEl.childElementCount !== this.items.length) {
      this.listEl.textContent = "";
      this.items.forEach((opt, i) => this.listEl.append(this.buildRow(opt, `${this.listId}-opt-${i}`)));
      this.renderedKey = key;
    }
    this.items.forEach((opt, i) => this.syncRow(this.listEl.children[i] as HTMLElement, opt, i));
    const empty = this.items.length === 0;
    this.emptyEl.textContent = this.emptyMessage;
    this.emptyEl.hidden = !empty || this.loading;
    this.loadingEl.hidden = !(empty && this.loading);
  }

  protected buildRow(_opt: JdComboboxItem, id: string): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "jd-combobox__option";
    li.id = id;
    li.setAttribute("role", "option");
    const icon = document.createElement("span");
    icon.className = "jd-combobox__option-icon";
    icon.setAttribute("aria-hidden", "true");
    const body = document.createElement("span");
    body.className = "jd-combobox__option-body";
    const label = document.createElement("span");
    label.className = "jd-combobox__option-label";
    const desc = document.createElement("span");
    desc.className = "jd-combobox__option-desc";
    body.append(label, desc);
    const check = document.createElement("span");
    check.className = "jd-combobox__option-check";
    check.setAttribute("aria-hidden", "true");
    check.innerHTML = CHECK_SVG;
    li.append(icon, body, check);
    return li;
  }

  protected syncRow(row: HTMLElement, opt: JdComboboxItem, i: number): void {
    row.dataset.value = opt.value;
    const icon = row.querySelector<HTMLElement>(".jd-combobox__option-icon");
    if (icon) {
      icon.textContent = opt.icon ?? "";
      icon.hidden = !opt.icon;
    }
    const label = row.querySelector<HTMLElement>(".jd-combobox__option-label");
    if (label) label.textContent = opt.label;
    const desc = row.querySelector<HTMLElement>(".jd-combobox__option-desc");
    if (desc) {
      desc.textContent = opt.description ?? "";
      desc.hidden = !opt.description;
    }
    row.toggleAttribute("data-create", Boolean(opt.create));
    row.toggleAttribute("data-active", this.open && i === this.activeIndex);
    row.setAttribute("aria-selected", String(this.isSelected(opt)));
    row.toggleAttribute("data-disabled", Boolean(opt.disabled));
    if (opt.disabled) row.setAttribute("aria-disabled", "true");
    else row.removeAttribute("aria-disabled");
  }

  /* ── 폼 참여 (light DOM 위임 §1.6-1) ─────────────────────────────── */

  protected formValue(): string {
    return this.value;
  }

  protected syncFormField(): void {
    let field = this.querySelector<HTMLInputElement>(":scope > input.jd-combobox__field");
    if (!this.name) {
      field?.remove();
      return;
    }
    if (!field) {
      field = document.createElement("input");
      field.type = "hidden";
      field.className = "jd-combobox__field";
      this.append(field);
    }
    field.name = this.name;
    field.value = this.formValue();
    field.disabled = this.disabled;
  }

  override focus(options?: FocusOptions): void {
    this.inputEl?.focus(options);
  }
}
