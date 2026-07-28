/**
 * <jd-collection-view> — 검색·카테고리 필터·뷰 전환이 붙은 컬렉션 (v2 composites/CollectionView).
 *
 * 데이터 입력 2경로(§1.3): `items` 프로퍼티 또는 자식
 * `<script type="application/json">[…]</script>`. 항목의 `preview`/`icon`은
 * 문자열(텍스트·이모지)이거나 Node다 — 뷰 전환 시 골격을 다시 만들므로 같은 Node가
 * 두 슬롯에 동시에 놓이는 일은 없다.
 *
 * v2 대비 교정 6건:
 *  1. **href가 무시됐다.** v2는 href가 있어도 `<button>`을 그려 링크로 동작하지 않았다
 *     (새 탭·복사·크롤링 전부 불가). v3는 href가 있으면 `<a>`로 낸다.
 *  2. **카드 격자가 목록이 아니었다.** `<ul>/<li>`로 내 총 개수·현재 위치가 전달된다.
 *  3. **검색 입력에 이름이 없었다.** placeholder는 접근 이름이 아니다 — aria-label을 붙이고
 *     `type="search"`로 지운다 버튼·IME 동작을 브라우저 기본에 맡긴다.
 *  4. **뷰 토글·필터 칩이 상태를 알리지 않았다.** 색만 달랐다 — `aria-pressed`를 준다.
 *  5. **결과 0건이 조용했다.** 빈 상태를 `role="status"`로 내 필터 결과를 읽어준다.
 *  6. **활성 카드 판정이 데이터에만 있었다.** 바닐라에서는 대개 호스트에서
 *     `jd-select`를 듣는다 — `interactive` 속성으로 항목 전체를 활성화할 수 있다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import collectionViewStyles from "./collection-view.css.js";

export interface JdCollectionItem {
  key: string;
  label: string;
  description?: string;
  category?: string;
  /** 그리드 미리보기 — 문자열은 텍스트, Node는 그대로 */
  preview?: string | Node;
  /** 리스트 아이콘(그리드에서는 미리보기 폴백) */
  icon?: string | Node;
  tags?: string[];
  href?: string;
  /** 링크 대상 — href와 함께일 때만 의미 있다 */
  target?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const GRID_ICON_SVG =
  `<svg viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">` +
  `<rect x="1" y="1" width="7" height="7" rx="1.5" fill="currentColor"/>` +
  `<rect x="10" y="1" width="7" height="7" rx="1.5" fill="currentColor"/>` +
  `<rect x="1" y="10" width="7" height="7" rx="1.5" fill="currentColor"/>` +
  `<rect x="10" y="10" width="7" height="7" rx="1.5" fill="currentColor"/></svg>`;

const LIST_ICON_SVG =
  `<svg viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">` +
  `<rect x="1" y="2" width="16" height="3" rx="1" fill="currentColor"/>` +
  `<rect x="1" y="7.5" width="16" height="3" rx="1" fill="currentColor"/>` +
  `<rect x="1" y="13" width="16" height="3" rx="1" fill="currentColor"/></svg>`;

const SEARCH_ICON_SVG =
  `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">` +
  `<circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/>` +
  `<path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export class JdCollectionView extends JdElement {
  static override tag = "jd-collection-view";
  static override props = {
    /** grid | list */
    view: { type: String, default: "grid", reflect: true },
    searchable: { type: Boolean, reflect: true },
    filterable: { type: Boolean, reflect: true },
    /** 그리드 열 수 2 | 3 | 4 (v2 기본 3) */
    columns: { type: Number, default: 3, reflect: true },
    /** 항목 전체를 활성화 — href/onClick이 없는 데이터에서 jd-select를 쓰려는 경우 */
    interactive: { type: Boolean, reflect: true },
    emptyMessage: { type: String, default: "항목이 없습니다." },
    searchPlaceholder: { type: String, default: "검색..." },
    searchLabel: { type: String, default: "컬렉션 검색" },
    allLabel: { type: String, default: "전체" },
    gridLabel: { type: String, default: "그리드 보기" },
    listLabel: { type: String, default: "리스트 보기" },
    /** 현재 검색어 — 외부에서 제어할 수 있게 프로퍼티로도 연다 */
    search: { type: String },
    /** 선택된 카테고리. 빈 값이면 전체 */
    category: { type: String },
  };

  declare view: string;
  declare searchable: boolean;
  declare filterable: boolean;
  declare columns: number;
  declare interactive: boolean;
  declare emptyMessage: string;
  declare searchPlaceholder: string;
  declare searchLabel: string;
  declare allLabel: string;
  declare gridLabel: string;
  declare listLabel: string;
  declare search: string;
  declare category: string;

  #items: JdCollectionItem[] = [];
  #itemsDirty = true;
  #filtersDirty = true;
  #renderedView = "";

  #bar!: HTMLElement;
  #searchBox!: HTMLElement;
  #searchInput!: HTMLInputElement;
  #views!: HTMLElement;
  #gridBtn!: HTMLButtonElement;
  #listBtn!: HTMLButtonElement;
  #filters!: HTMLElement;
  #list!: HTMLUListElement;
  #empty!: HTMLElement;

  get items(): JdCollectionItem[] {
    return this.#items;
  }
  set items(v: JdCollectionItem[]) {
    this.#items = Array.isArray(v) ? v.slice() : [];
    this.#itemsDirty = true;
    this.#filtersDirty = true;
    this.requestUpdate();
  }

  /** 현재 필터·검색을 통과한 항목 */
  get visibleItems(): JdCollectionItem[] {
    const category = this.category;
    const q = this.search.trim().toLowerCase();
    return this.#items.filter((item) => {
      if (category && item.category !== category) return false;
      if (!q) return true;
      return (
        item.label.toLowerCase().includes(q) ||
        Boolean(item.description?.toLowerCase().includes(q)) ||
        Boolean(item.tags?.some((t) => t.toLowerCase().includes(q)))
      );
    });
  }

  get categories(): string[] {
    const out: string[] = [];
    for (const item of this.#items) {
      if (item.category && !out.includes(item.category)) out.push(item.category);
    }
    return out;
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(collectionViewStyles);
    if (Object.prototype.hasOwnProperty.call(this, "items")) {
      const v = (this as unknown as Record<string, unknown>).items;
      delete (this as unknown as Record<string, unknown>).items;
      (this as unknown as Record<string, unknown>).items = v;
    }
    this.#readJsonSlot();
    const existing = this.querySelector<HTMLElement>(":scope > .jd-collection-view__bar");
    if (!existing) this.#buildSkeleton();
    this.#bar = this.querySelector<HTMLElement>(":scope > .jd-collection-view__bar")!;
    this.#searchBox = this.#bar.querySelector<HTMLElement>(".jd-collection-view__search")!;
    this.#searchInput = this.#bar.querySelector<HTMLInputElement>(
      ".jd-collection-view__search-input",
    )!;
    this.#views = this.#bar.querySelector<HTMLElement>(".jd-collection-view__views")!;
    this.#gridBtn = this.#views.querySelector<HTMLButtonElement>('[data-view="grid"]')!;
    this.#listBtn = this.#views.querySelector<HTMLButtonElement>('[data-view="list"]')!;
    this.#filters = this.querySelector<HTMLElement>(":scope > .jd-collection-view__filters")!;
    this.#list = this.querySelector<HTMLUListElement>(":scope > .jd-collection-view__items")!;
    this.#empty = this.querySelector<HTMLElement>(":scope > .jd-collection-view__empty")!;
    this.update();
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent);
      if (Array.isArray(parsed)) this.#items = parsed as JdCollectionItem[];
    } catch {
      console.warn("[junds] <jd-collection-view> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #buildSkeleton(): void {
    const bar = document.createElement("div");
    bar.className = "jd-collection-view__bar";

    const search = document.createElement("div");
    search.className = "jd-collection-view__search";
    const searchIcon = document.createElement("span");
    searchIcon.className = "jd-collection-view__search-icon";
    searchIcon.innerHTML = SEARCH_ICON_SVG;
    const input = document.createElement("input");
    input.type = "search";
    input.className = "jd-collection-view__search-input";
    input.autocomplete = "off";
    search.append(searchIcon, input);

    const views = document.createElement("div");
    views.className = "jd-collection-view__views";
    views.setAttribute("role", "group");
    views.append(
      this.#buildViewButton("grid", GRID_ICON_SVG),
      this.#buildViewButton("list", LIST_ICON_SVG),
    );
    bar.append(search, views);

    const filters = document.createElement("div");
    filters.className = "jd-collection-view__filters";
    filters.setAttribute("role", "group");

    const list = document.createElement("ul");
    list.className = "jd-collection-view__items";

    const empty = document.createElement("p");
    empty.className = "jd-collection-view__empty";
    empty.setAttribute("role", "status");

    this.append(bar, filters, list, empty);
  }

  #buildViewButton(view: string, svg: string): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "jd-collection-view__view";
    b.dataset.view = view;
    b.innerHTML = svg;
    return b;
  }

  protected override connected(): void {
    this.addEventListener("click", this.#onClick);
    this.addEventListener("input", this.#onInput);
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.#onClick);
    this.removeEventListener("input", this.#onInput);
  }

  /* ── 상호작용 ─────────────────────────────────────────────────────── */

  #onInput = (e: Event): void => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (!input.classList.contains("jd-collection-view__search-input")) return;
    this.search = input.value;
    this.#itemsDirty = true;
    this.emit("jd-input", { search: this.search });
    this.requestUpdate();
  };

  #onClick = (e: Event): void => {
    const target = e.target as Element | null;
    if (!target) return;

    const viewBtn = target.closest<HTMLButtonElement>(".jd-collection-view__view");
    if (viewBtn?.dataset.view) return this.#setView(viewBtn.dataset.view);

    const chip = target.closest<HTMLButtonElement>(".jd-collection-view__chip");
    if (chip) return this.#setCategory(chip.dataset.category ?? "");

    const card = target.closest<HTMLElement>(".jd-collection-view__card");
    if (card?.dataset.key) this.#activate(card.dataset.key);
  };

  #setView(view: string): void {
    if (view !== "grid" && view !== "list") return;
    if (this.view === view) return;
    this.view = view;
    this.#itemsDirty = true;
    this.#emitChange();
  }

  #setCategory(category: string): void {
    // v2와 동형 — 같은 칩을 다시 누르면 해제된다
    this.category = this.category === category ? "" : category;
    this.#itemsDirty = true;
    this.#emitChange();
  }

  #activate(key: string): void {
    const item = this.#items.find((it) => it.key === key);
    if (!item || item.disabled) return;
    item.onClick?.();
    this.emit("jd-select", { key, item });
  }

  #emitChange(): void {
    this.emit("jd-change", { view: this.view, category: this.category, search: this.search });
    this.requestUpdate();
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    const cols = [2, 3, 4].includes(this.columns) ? this.columns : 3;
    this.dataset.columns = String(cols);

    this.#searchBox.hidden = !this.searchable;
    this.#searchInput.placeholder = this.searchPlaceholder;
    this.#searchInput.setAttribute("aria-label", this.searchLabel);
    if (this.#searchInput.value !== this.search) this.#searchInput.value = this.search;

    this.#views.setAttribute("aria-label", "보기 방식");
    this.#gridBtn.setAttribute("aria-label", this.gridLabel);
    this.#listBtn.setAttribute("aria-label", this.listLabel);
    this.#gridBtn.setAttribute("aria-pressed", String(this.view !== "list"));
    this.#listBtn.setAttribute("aria-pressed", String(this.view === "list"));

    this.#syncFilters();

    const items = this.visibleItems;
    if (this.#itemsDirty || this.#renderedView !== this.view) {
      this.#itemsDirty = false;
      this.#renderedView = this.view;
      this.#rebuildItems(items);
    }
    this.#list.dataset.view = this.view === "list" ? "list" : "grid";
    this.#list.hidden = items.length === 0;
    this.#empty.textContent = this.emptyMessage;
    this.#empty.hidden = items.length > 0;
  }

  #syncFilters(): void {
    const categories = this.categories;
    this.#filters.hidden = !this.filterable || categories.length === 0;
    this.#filters.setAttribute("aria-label", "카테고리 필터");
    const signature = [this.allLabel, ...categories].join("|");
    if (this.#filtersDirty || this.#filters.dataset.signature !== signature) {
      this.#filtersDirty = false;
      this.#filters.dataset.signature = signature;
      this.#filters.textContent = "";
      this.#filters.append(this.#buildChip("", this.allLabel));
      for (const c of categories) this.#filters.append(this.#buildChip(c, c));
    }
    for (const chip of this.#filters.querySelectorAll<HTMLButtonElement>(
      ".jd-collection-view__chip",
    )) {
      const active = (chip.dataset.category ?? "") === this.category;
      chip.setAttribute("aria-pressed", String(active));
      chip.toggleAttribute("data-active", active);
    }
  }

  #buildChip(category: string, label: string): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "jd-collection-view__chip";
    b.dataset.category = category;
    b.textContent = label;
    return b;
  }

  #rebuildItems(items: JdCollectionItem[]): void {
    this.#list.textContent = "";
    for (const item of items) this.#list.append(this.#buildItem(item));
  }

  #buildItem(item: JdCollectionItem): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "jd-collection-view__item";
    const activatable =
      !item.disabled && (this.interactive || Boolean(item.href) || Boolean(item.onClick));

    let card: HTMLElement;
    if (item.href && !item.disabled) {
      const a = document.createElement("a");
      a.href = item.href;
      if (item.target) {
        a.target = item.target;
        // 새 창 링크의 opener 유출 차단 — v2에는 링크 자체가 없었다
        if (item.target === "_blank") a.rel = "noopener noreferrer";
      }
      card = a;
    } else if (activatable) {
      const b = document.createElement("button");
      b.type = "button";
      card = b;
    } else {
      card = document.createElement("div");
    }
    card.className = "jd-collection-view__card";
    card.dataset.key = item.key;
    if (activatable) card.toggleAttribute("data-activatable", true);
    if (item.disabled) card.toggleAttribute("data-disabled", true);

    if (this.view === "list") card.append(this.#buildIcon(item));
    else card.append(this.#buildPreview(item));

    const info = document.createElement("div");
    info.className = "jd-collection-view__info";
    const label = document.createElement("span");
    label.className = "jd-collection-view__label";
    label.textContent = item.label;
    info.append(label);
    if (item.description) {
      const desc = document.createElement("span");
      desc.className = "jd-collection-view__description";
      desc.textContent = item.description;
      info.append(desc);
    }
    if (item.tags?.length) info.append(this.#buildTags(item.tags));
    card.append(info);
    li.append(card);
    return li;
  }

  #buildPreview(item: JdCollectionItem): HTMLElement {
    const box = document.createElement("div");
    box.className = "jd-collection-view__preview";
    const content = item.preview ?? item.icon;
    if (content instanceof Node) {
      box.append(content);
      return box;
    }
    const fallback = document.createElement("span");
    fallback.className = "jd-collection-view__preview-fallback";
    fallback.setAttribute("aria-hidden", "true"); // 라벨 첫 글자는 정보가 아니다
    fallback.textContent = content ?? item.label.charAt(0);
    box.append(fallback);
    return box;
  }

  #buildIcon(item: JdCollectionItem): HTMLElement {
    const box = document.createElement("div");
    box.className = "jd-collection-view__icon";
    if (item.icon instanceof Node) {
      box.append(item.icon);
      return box;
    }
    const fallback = document.createElement("span");
    fallback.className = "jd-collection-view__icon-fallback";
    fallback.setAttribute("aria-hidden", "true");
    fallback.textContent = item.icon ?? item.label.charAt(0);
    box.append(fallback);
    return box;
  }

  #buildTags(tags: string[]): HTMLElement {
    const box = document.createElement("div");
    box.className = "jd-collection-view__tags";
    for (const tag of tags) {
      const el = document.createElement("span");
      el.className = "jd-collection-view__tag";
      el.textContent = tag;
      box.append(el);
    }
    return box;
  }
}
