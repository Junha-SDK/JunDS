/**
 * <jd-select> — 드롭다운 단일 선택 (v2 composites/Select).
 *
 * 이 배치(선택 입력 1)의 **팝업 리스트박스 정본**이다. MultiSelect는 이 클래스의
 * 파생으로 행 골격·선택 의미론만 갈아끼운다(§6 R12 · Modal→Drawer 선례).
 *
 * 옵션 입력 2경로(§1.3 — 복합 데이터는 attribute 금지):
 *  1. `options` 프로퍼티 (Array<{value,label,icon?,disabled?}>)
 *  2. 자식 `<script type="application/json">[…]</script>` 슬롯 (WEB-03 명시 예외)
 *
 * v2 대비 교정 4건:
 *  1. **role 구조**: v2는 `<ul role="listbox">` 안에 검색 `<input>`을 `<li>`로 넣었다
 *     (리스트박스 자식은 option이어야 한다). v3는 검색창을 목록 **밖**으로 빼고,
 *     APG Combobox 패턴대로 aria-activedescendant로 활성 옵션을 가리킨다.
 *  2. **키보드**: v2는 트리거에만 keydown이 걸려 있어 검색창에 포커스가 가면
 *     화살표·Enter가 죽었다. v3는 호스트 위임 1곳(createKeyHandler)에서 처리하고
 *     Home/End·비활성 옵션 건너뛰기·활성 행 스크롤 추종을 더했다.
 *  3. **폼 참여**: `name`을 주면 hidden input을 유지해 조상 `<form>`에 값이 실린다
 *     (light DOM 실리 §1.6-1). v2에는 폼 참여 경로가 아예 없었다.
 *  4. **체크 아이콘 색**: v2는 선택 행이 `bg-primary text-white`인데 체크만
 *     `text-primary`여서 사실상 보이지 않았다 — currentColor로 교정.
 *
 * 포인터 함정: 팝업 mousedown의 기본 동작을 막아(검색창 제외) 포커스가 트리거를
 * 떠나지 않게 한다. 막지 않으면 focusout이 먼저 터져 팝업이 닫히고 click이 유실된다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { createClickOutside, createKeyHandler } from "../../behaviors/input.js";
import selectStyles from "./select.css.js";

export interface JdSelectOption {
  value: string;
  label: string;
  /** 이모지·기호 등 **텍스트** 아이콘. v2 ReactNode의 바닐라 축약이며 innerHTML 경로를 두지 않는다(highlight 선례) */
  icon?: string;
  disabled?: boolean;
}

const CHEVRON_SVG =
  `<svg class="jd-select__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
  `stroke-width="2" aria-hidden="true">` +
  `<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>`;

const CHECK_SVG =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">` +
  `<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;

export class JdSelect extends JdElement {
  static override tag = "jd-select";
  static override props = {
    value: { type: String, reflect: true },
    /** 지정하면 hidden input으로 조상 form에 참여 */
    name: { type: String },
    placeholder: { type: String, default: "선택하세요" },
    searchPlaceholder: { type: String, default: "검색..." },
    emptyMessage: { type: String, default: "결과 없음" },
    /** sm | md | lg */
    size: { type: String, default: "md", reflect: true },
    open: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    error: { type: Boolean, reflect: true },
    searchable: { type: Boolean, reflect: true },
    fullWidth: { type: Boolean, reflect: true },
  };

  declare value: string;
  declare name: string;
  declare placeholder: string;
  declare searchPlaceholder: string;
  declare emptyMessage: string;
  declare size: string;
  declare open: boolean;
  declare disabled: boolean;
  declare error: boolean;
  declare searchable: boolean;
  declare fullWidth: boolean;

  /** 트리거 접근 이름(라벨이 따로 없을 때) */
  protected fallbackAriaLabel = "선택";
  /** 옵션을 고르면 팝업을 닫는가. MultiSelect가 false로 재정의 */
  protected get closeOnPick(): boolean {
    return true;
  }
  /** 리스트박스 다중 선택 여부 */
  protected get multiSelectable(): boolean {
    return false;
  }

  protected optionList: JdSelectOption[] = [];
  protected filtered: JdSelectOption[] = [];
  protected activeIndex = -1;
  protected searchText = "";
  /** 목록 재구축 판정 키. null이면 무효화 — 다음 update가 강제 재구축한다 */
  protected renderedKey: string | null = null;
  protected wasOpen = false;
  protected pendingScroll = false;

  protected trigger!: HTMLButtonElement;
  protected valueEl!: HTMLElement;
  protected valueIcon!: HTMLElement;
  protected valueText!: HTMLElement;
  protected popup!: HTMLElement;
  protected searchWrap!: HTMLElement;
  protected searchInput!: HTMLInputElement;
  protected listEl!: HTMLUListElement;
  protected emptyEl!: HTMLElement;
  protected listId = "";

  get options(): JdSelectOption[] {
    return this.optionList;
  }
  set options(v: JdSelectOption[]) {
    this.optionList = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(selectStyles);
    this.adoptStyleHook();
    this.upgradeOwn("options");
    this.readJsonSlot();
    if (!this.querySelector(":scope > .jd-select__trigger")) this.buildSkeleton();
    this.trigger = this.querySelector<HTMLButtonElement>(":scope > .jd-select__trigger")!;
    this.valueEl = this.trigger.querySelector<HTMLElement>(".jd-select__value")!;
    this.valueIcon = this.trigger.querySelector<HTMLElement>(".jd-select__value-icon")!;
    this.valueText = this.trigger.querySelector<HTMLElement>(".jd-select__value-text")!;
    this.popup = this.querySelector<HTMLElement>(":scope > .jd-select__popup")!;
    this.searchWrap = this.popup.querySelector<HTMLElement>(".jd-select__search")!;
    this.searchInput = this.popup.querySelector<HTMLInputElement>(".jd-select__search-input")!;
    this.listEl = this.popup.querySelector<HTMLUListElement>(".jd-select__list")!;
    this.emptyEl = this.popup.querySelector<HTMLElement>(".jd-select__empty")!;
    this.listId = this.listEl.id;
    this.bindSkeleton();
    this.update();
  }

  /** 파생이 자기 시트를 추가로 채택하는 훅 (drawer 선례) */
  protected adoptStyleHook(): void {}

  /**
   * 업그레이드 전에 `el.options = [...]`로 대입된 own property 회수.
   * 베이스의 #upgradeProps는 static props 키만 다루므로 복합 데이터는 여기서 처리한다.
   */
  protected upgradeOwn(name: string): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const self = this as unknown as Record<string, unknown>;
    const v = self[name];
    delete self[name];
    self[name] = v;
  }

  protected readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as JdSelectOption[];
      if (Array.isArray(parsed)) this.optionList = parsed;
    } catch {
      console.warn("[junds] <jd-select> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected buildSkeleton(): void {
    const id = jdUid("jd-select");
    this.trigger = document.createElement("button");
    this.trigger.type = "button";
    this.trigger.className = "jd-select__trigger";
    const value = document.createElement("span");
    value.className = "jd-select__value";
    const icon = document.createElement("span");
    icon.className = "jd-select__value-icon";
    icon.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.className = "jd-select__value-text";
    value.append(icon, text);
    this.trigger.append(value);
    this.trigger.insertAdjacentHTML("beforeend", CHEVRON_SVG);

    const popup = document.createElement("div");
    popup.className = "jd-select__popup";
    const searchWrap = document.createElement("div");
    searchWrap.className = "jd-select__search";
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.className = "jd-select__search-input";
    searchInput.autocomplete = "off";
    searchWrap.append(searchInput);
    const list = document.createElement("ul");
    list.className = "jd-select__list";
    list.id = `${id}-list`;
    list.setAttribute("role", "listbox");
    const empty = document.createElement("div");
    empty.className = "jd-select__empty";
    popup.append(searchWrap, list, empty);
    this.append(this.trigger, popup);
  }

  protected bindSkeleton(): void {
    this.trigger.addEventListener("click", this.onTriggerClick);
    this.popup.addEventListener("mousedown", this.onPopupPointer);
    this.listEl.addEventListener("click", this.onListClick);
    this.searchInput.addEventListener("input", this.onSearchInput);
  }

  /* ── 수명주기 ─────────────────────────────────────────────────────── */

  protected override connected(): void {
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
          space: this.onSpace,
        },
        // 검색창(INPUT) 안에서도 동작해야 한다 + preventDefault는 핸들러가 선별한다
        { enableOnFormTags: true, preventDefault: false },
      ),
    );
    this.addEventListener("focusout", this.onFocusOut);
  }

  protected override disconnected(): void {
    this.removeEventListener("focusout", this.onFocusOut);
  }

  /* ── 상태 전이 ─────────────────────────────────────────────────────── */

  protected setOpen(next: boolean): void {
    if (next && this.disabled) return;
    if (this.open === next) return;
    this.open = next; // → update()가 전이 부수효과 수행
  }

  protected setActive(i: number): void {
    if (this.activeIndex === i) return;
    this.activeIndex = i;
    this.pendingScroll = true;
    this.requestUpdate();
  }

  /** 열릴 때 활성 행 = 선택된 행(없으면 없음). v2는 항상 -1이었다 */
  protected initialActiveIndex(): number {
    return this.filtered.findIndex((o) => this.isSelected(o) && !o.disabled);
  }

  protected isSelected(opt: JdSelectOption): boolean {
    return Boolean(this.value) && opt.value === this.value;
  }

  protected pick(opt: JdSelectOption): void {
    if (opt.disabled) return;
    this.value = opt.value;
    this.emit("jd-change", { value: opt.value });
    if (this.closeOnPick) {
      this.setOpen(false);
      this.trigger.focus();
    } else {
      this.requestUpdate();
    }
  }

  /* ── 이벤트 ────────────────────────────────────────────────────────── */

  protected onTriggerClick = (): void => {
    this.setOpen(!this.open);
  };

  /**
   * 팝업 안 mousedown 기본 동작 차단 — 포커스가 트리거를 떠나지 않게 한다.
   * (검색창은 예외: 실제로 포커스를 받아야 한다)
   */
  protected onPopupPointer = (e: MouseEvent): void => {
    if (e.target === this.searchInput) return;
    e.preventDefault();
  };

  protected onListClick = (e: Event): void => {
    const row = (e.target as Element | null)?.closest<HTMLElement>(".jd-select__option");
    if (!row || !this.listEl.contains(row)) return;
    const i = Array.prototype.indexOf.call(this.listEl.children, row);
    const opt = this.filtered[i];
    if (opt) this.pick(opt);
  };

  protected onSearchInput = (): void => {
    this.searchText = this.searchInput.value;
    this.activeIndex = -1;
    this.renderedKey = null; // 필터 결과 재구축 강제
    this.requestUpdate();
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
    e.stopPropagation(); // 조상 Modal의 ESC와 겹치지 않게
    this.setOpen(false);
    this.trigger.focus();
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
    this.activeIndex = edge === "first" ? -1 : this.filtered.length;
    this.moveActive(edge === "first" ? 1 : -1);
  };

  protected onEnter = (e: KeyboardEvent): void => {
    e.preventDefault();
    if (!this.open) {
      this.setOpen(true);
      return;
    }
    const opt = this.filtered[this.activeIndex];
    if (opt) this.pick(opt);
  };

  protected onSpace = (e: KeyboardEvent): void => {
    if (e.target === this.searchInput) return; // 검색어에 공백을 칠 수 있어야 한다
    e.preventDefault();
    if (!this.open) {
      this.setOpen(true);
      return;
    }
    const opt = this.filtered[this.activeIndex];
    if (opt) this.pick(opt);
  };

  /** 클램프 이동(v2 동형 — 순환 없음) + 비활성 옵션 건너뛰기 */
  protected moveActive(delta: number): void {
    const n = this.filtered.length;
    if (n === 0) return;
    let i = this.activeIndex;
    if (i < 0 || i >= n) i = delta > 0 ? -1 : n;
    for (let step = 0; step < n; step++) {
      i += delta;
      if (i < 0 || i >= n) return;
      if (!this.filtered[i]!.disabled) {
        this.setActive(i);
        return;
      }
    }
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    const opening = this.open && !this.wasOpen;
    const closing = !this.open && this.wasOpen;
    if (opening || closing) {
      this.searchText = "";
      this.searchInput.value = "";
      this.activeIndex = -1;
      this.renderedKey = null;
    }

    this.trigger.disabled = this.disabled;
    this.searchWrap.hidden = !this.searchable;
    this.searchInput.placeholder = this.searchPlaceholder;
    this.emptyEl.textContent = this.emptyMessage;
    if (!this.trigger.hasAttribute("aria-label") && !this.trigger.getAttribute("aria-labelledby")) {
      this.trigger.setAttribute("aria-label", this.ariaLabelText());
    }

    this.syncList();
    if (opening) {
      this.activeIndex = this.initialActiveIndex();
      if (this.activeIndex >= 0) this.pendingScroll = true; // 선택 행이 보이게 열린다
    }
    this.syncActiveRow();
    this.syncTrigger();
    this.syncFormField();

    this.popup.hidden = !this.open;
    this.trigger.setAttribute("aria-haspopup", "listbox");
    this.trigger.setAttribute("aria-controls", this.listId);
    this.trigger.setAttribute("aria-expanded", String(this.open));
    this.syncComboRole();

    if (this.pendingScroll) {
      this.pendingScroll = false;
      const row = this.listEl.children[this.activeIndex] as HTMLElement | undefined;
      if (row && typeof row.scrollIntoView === "function") row.scrollIntoView({ block: "nearest" });
    }

    if (opening) {
      this.wasOpen = true;
      if (this.searchable) this.searchInput.focus();
      this.emit("jd-open");
    }
    if (closing) {
      this.wasOpen = false;
      this.emit("jd-close");
    }
  }

  protected ariaLabelText(): string {
    return this.fallbackAriaLabel;
  }

  /**
   * APG Combobox: 활성 옵션을 가리키는 주체는 포커스를 가진 요소여야 한다.
   * 검색 가능하면 검색창이, 아니면 트리거 자신이 combobox 역할을 맡는다.
   */
  protected syncComboRole(): void {
    if (this.searchable) {
      this.trigger.removeAttribute("role");
      this.trigger.removeAttribute("aria-activedescendant");
      this.searchInput.setAttribute("role", "combobox");
      this.searchInput.setAttribute("aria-autocomplete", "list");
      this.searchInput.setAttribute("aria-controls", this.listId);
      this.searchInput.setAttribute("aria-expanded", String(this.open));
      this.applyActiveDescendant(this.searchInput);
    } else {
      this.searchInput.removeAttribute("role");
      this.searchInput.removeAttribute("aria-activedescendant");
      this.trigger.setAttribute("role", "combobox");
      this.applyActiveDescendant(this.trigger);
    }
  }

  protected applyActiveDescendant(host: HTMLElement): void {
    const row = this.open
      ? (this.listEl.children[this.activeIndex] as HTMLElement | undefined)
      : undefined;
    if (row) host.setAttribute("aria-activedescendant", row.id);
    else host.removeAttribute("aria-activedescendant");
  }

  protected filterOptions(): JdSelectOption[] {
    const q = this.searchText.trim().toLowerCase();
    if (!this.searchable || !q) return this.optionList;
    return this.optionList.filter((o) => o.label.toLowerCase().includes(q));
  }

  protected syncList(): void {
    this.filtered = this.filterOptions();
    this.listEl.setAttribute("aria-multiselectable", String(this.multiSelectable));
    const key = JSON.stringify(this.filtered.map((o) => o.value));
    if (key !== this.renderedKey || this.listEl.childElementCount !== this.filtered.length) {
      this.listEl.textContent = "";
      this.filtered.forEach((opt, i) =>
        this.listEl.append(this.buildRow(opt, `${this.listId}-opt-${i}`)),
      );
      this.renderedKey = key;
    }
    this.filtered.forEach((opt, i) => this.syncRow(this.listEl.children[i] as HTMLElement, opt));
    this.emptyEl.hidden = this.filtered.length > 0;
  }

  protected syncActiveRow(): void {
    const rows = this.listEl.children;
    for (let i = 0; i < rows.length; i++) {
      (rows[i] as HTMLElement).toggleAttribute("data-active", this.open && i === this.activeIndex);
    }
  }

  protected buildRow(_opt: JdSelectOption, id: string): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "jd-select__option";
    li.id = id;
    li.setAttribute("role", "option");
    const icon = document.createElement("span");
    icon.className = "jd-select__option-icon";
    icon.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "jd-select__option-label";
    const check = document.createElement("span");
    check.className = "jd-select__option-check";
    check.setAttribute("aria-hidden", "true");
    check.innerHTML = CHECK_SVG;
    li.append(icon, label, check);
    return li;
  }

  /** 활성(data-active) 표시는 syncActiveRow가 전담한다 — 여기선 내용·선택 상태만 */
  protected syncRow(row: HTMLElement, opt: JdSelectOption): void {
    row.dataset.value = opt.value;
    const icon = row.querySelector<HTMLElement>(".jd-select__option-icon");
    if (icon) {
      icon.textContent = opt.icon ?? "";
      icon.hidden = !opt.icon;
    }
    const label = row.querySelector<HTMLElement>(".jd-select__option-label");
    if (label) label.textContent = opt.label;
    row.setAttribute("aria-selected", String(this.isSelected(opt)));
    row.toggleAttribute("data-disabled", Boolean(opt.disabled));
    if (opt.disabled) row.setAttribute("aria-disabled", "true");
    else row.removeAttribute("aria-disabled");
  }

  protected syncTrigger(): void {
    const sel = this.optionList.find((o) => this.isSelected(o));
    this.valueIcon.textContent = sel?.icon ?? "";
    this.valueIcon.hidden = !sel?.icon;
    this.valueText.textContent = sel ? sel.label : this.placeholder;
    this.valueEl.toggleAttribute("data-placeholder", !sel);
  }

  /* ── 폼 참여 (light DOM 위임 §1.6-1) ─────────────────────────────── */

  /** 제출될 값 목록. MultiSelect가 다중으로 재정의 */
  protected formValues(): string[] {
    return this.value ? [this.value] : [];
  }

  protected syncFormField(): void {
    const wanted = this.name ? this.formValues() : [];
    const fields = Array.from(
      this.querySelectorAll<HTMLInputElement>(":scope > input.jd-select__field"),
    );
    while (fields.length > wanted.length) fields.pop()!.remove();
    while (fields.length < wanted.length) {
      const f = document.createElement("input");
      f.type = "hidden";
      f.className = "jd-select__field";
      this.append(f);
      fields.push(f);
    }
    fields.forEach((f, i) => {
      f.name = this.name;
      f.value = wanted[i]!;
      f.disabled = this.disabled;
    });
  }

  /** 네이티브 위임 표면 — 포커스 편의 */
  override focus(options?: FocusOptions): void {
    this.trigger?.focus(options);
  }
}
