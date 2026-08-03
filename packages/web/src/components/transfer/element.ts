/**
 * <jd-transfer> — 두 목록 사이 항목 이동 (v2 composites/Transfer).
 *
 * 체크 항목은 진짜 `<input type="checkbox">`다(§1.6-1 네이티브 위임) — 체크 상태
 * 노출·스페이스 토글·라벨 연결이 브라우저 기본이다. v2도 같은 마크업이었고
 * 여기서는 유지가 정답이라 리스트박스로 바꾸지 않았다(MultiSelect와 달리 이 패널은
 * "선택 목록"이 아니라 "체크박스 그룹"이다).
 *
 * 데이터 입력 2경로: `source`/`target` 프로퍼티 또는 자식
 * `<script type="application/json">{"source":[…],"target":[…]}</script>`.
 *
 * v2 대비 교정 3건:
 *  1. **자기 상태 소유**: v2는 완전 제어형이라 onChange를 안 붙이면 아무 일도
 *     일어나지 않았다. v3는 이동을 스스로 반영하고 `jd-change`로 결과를 알린다
 *     (소비자는 프로퍼티를 다시 세팅해 제어형으로 쓸 수 있다).
 *  2. **그룹 이름**: 각 목록이 role="group" + aria-labelledby로 패널 제목과 묶인다.
 *     v2 목록은 이름 없는 체크박스 뭉치였다.
 *  3. **i18n 의존 제거**: v2는 이동 버튼 aria-label을 I18nProvider(useT)에서 받았다.
 *     의존성 0 원칙상 프로퍼티(sourceTitle/targetTitle) 기반 한국어 기본값으로 바꾼다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import transferStyles from "./transfer.css.js";

export interface JdTransferItem {
  key: string;
  label: string;
  disabled?: boolean;
}

export type JdTransferSide = "source" | "target";

interface PanelRefs {
  root: HTMLElement;
  title: HTMLElement;
  count: HTMLElement;
  search: HTMLElement;
  searchInput: HTMLInputElement;
  list: HTMLElement;
  empty: HTMLElement;
}

const ARROW_RIGHT_SVG =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">` +
  `<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>`;

const ARROW_LEFT_SVG =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">` +
  `<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>`;

export class JdTransfer extends JdElement {
  static override tag = "jd-transfer";
  static override props = {
    sourceTitle: { type: String, default: "소스" },
    targetTitle: { type: String, default: "대상" },
    searchPlaceholder: { type: String, default: "검색..." },
    emptyMessage: { type: String, default: "항목 없음" },
    searchable: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  declare sourceTitle: string;
  declare targetTitle: string;
  declare searchPlaceholder: string;
  declare emptyMessage: string;
  declare searchable: boolean;
  declare disabled: boolean;

  protected lists: Record<JdTransferSide, JdTransferItem[]> = { source: [], target: [] };
  protected checked: Record<JdTransferSide, Set<string>> = {
    source: new Set(),
    target: new Set(),
  };
  protected searchText: Record<JdTransferSide, string> = { source: "", target: "" };
  protected renderedKey: Record<JdTransferSide, string | null> = { source: null, target: null };
  protected panels!: Record<JdTransferSide, PanelRefs>;
  protected moveToTargetBtn!: HTMLButtonElement;
  protected moveToSourceBtn!: HTMLButtonElement;

  get source(): JdTransferItem[] {
    return this.lists.source;
  }
  set source(v: JdTransferItem[]) {
    this.lists.source = Array.isArray(v) ? v.slice() : [];
    this.renderedKey.source = null;
    this.requestUpdate();
  }

  get target(): JdTransferItem[] {
    return this.lists.target;
  }
  set target(v: JdTransferItem[]) {
    this.lists.target = Array.isArray(v) ? v.slice() : [];
    this.renderedKey.target = null;
    this.requestUpdate();
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(transferStyles);
    this.upgradeOwn("source");
    this.upgradeOwn("target");
    this.readJsonSlot();
    if (!this.querySelector(':scope > .jd-transfer__panel[data-side="source"]'))
      this.buildSkeleton();
    this.panels = { source: this.readPanel("source"), target: this.readPanel("target") };
    this.moveToTargetBtn = this.querySelector<HTMLButtonElement>(
      '.jd-transfer__move[data-dir="to-target"]',
    )!;
    this.moveToSourceBtn = this.querySelector<HTMLButtonElement>(
      '.jd-transfer__move[data-dir="to-source"]',
    )!;
    // 내부 노드 리스너는 render 1회 — 노드와 수명을 같이 한다
    this.moveToTargetBtn.addEventListener("click", () => this.move("source", "target"));
    this.moveToSourceBtn.addEventListener("click", () => this.move("target", "source"));
    this.update();
  }

  /** 호스트 위임 리스너는 connected/disconnected 쌍 — 재연결 시 대칭 회수·재부착 */
  protected override connected(): void {
    this.addEventListener("change", this.onCheckChange);
    this.addEventListener("input", this.onSearchInput);
  }

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
      const parsed = JSON.parse(script.textContent) as Partial<
        Record<JdTransferSide, JdTransferItem[]>
      >;
      if (Array.isArray(parsed.source)) this.lists.source = parsed.source;
      if (Array.isArray(parsed.target)) this.lists.target = parsed.target;
    } catch {
      console.warn("[junds] <jd-transfer> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected buildSkeleton(): void {
    const id = jdUid("jd-transfer");
    const actions = document.createElement("div");
    actions.className = "jd-transfer__actions";
    const toTarget = document.createElement("button");
    toTarget.type = "button";
    toTarget.className = "jd-transfer__move";
    toTarget.dataset.dir = "to-target";
    toTarget.innerHTML = ARROW_RIGHT_SVG;
    const toSource = document.createElement("button");
    toSource.type = "button";
    toSource.className = "jd-transfer__move";
    toSource.dataset.dir = "to-source";
    toSource.innerHTML = ARROW_LEFT_SVG;
    actions.append(toTarget, toSource);
    this.append(this.buildPanel("source", id), actions, this.buildPanel("target", id));
  }

  protected buildPanel(side: JdTransferSide, id: string): HTMLElement {
    const root = document.createElement("section");
    root.className = "jd-transfer__panel";
    root.dataset.side = side;

    const head = document.createElement("div");
    head.className = "jd-transfer__head";
    const title = document.createElement("span");
    title.className = "jd-transfer__title";
    title.id = `${id}-${side}-title`;
    const count = document.createElement("span");
    count.className = "jd-transfer__count";
    head.append(title, count);

    const search = document.createElement("div");
    search.className = "jd-transfer__search";
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.className = "jd-transfer__search-input";
    searchInput.autocomplete = "off";
    searchInput.setAttribute("aria-label", `${side === "source" ? "소스" : "대상"} 검색`);
    search.append(searchInput);

    const list = document.createElement("div");
    list.className = "jd-transfer__list";
    list.setAttribute("role", "group");
    list.setAttribute("aria-labelledby", title.id);

    const empty = document.createElement("p");
    empty.className = "jd-transfer__empty";

    root.append(head, search, list, empty);
    return root;
  }

  protected readPanel(side: JdTransferSide): PanelRefs {
    const root = this.querySelector<HTMLElement>(
      `:scope > .jd-transfer__panel[data-side="${side}"]`,
    )!;
    return {
      root,
      title: root.querySelector<HTMLElement>(".jd-transfer__title")!,
      count: root.querySelector<HTMLElement>(".jd-transfer__count")!,
      search: root.querySelector<HTMLElement>(".jd-transfer__search")!,
      searchInput: root.querySelector<HTMLInputElement>(".jd-transfer__search-input")!,
      list: root.querySelector<HTMLElement>(".jd-transfer__list")!,
      empty: root.querySelector<HTMLElement>(".jd-transfer__empty")!,
    };
  }

  protected override disconnected(): void {
    this.removeEventListener("change", this.onCheckChange);
    this.removeEventListener("input", this.onSearchInput);
  }

  /* ── 이벤트 ────────────────────────────────────────────────────────── */

  protected onCheckChange = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    if (!input.classList.contains("jd-transfer__check")) return;
    const side = input.dataset.side as JdTransferSide | undefined;
    const key = input.value;
    if (!side) return;
    if (input.checked) this.checked[side].add(key);
    else this.checked[side].delete(key);
    this.requestUpdate();
  };

  protected onSearchInput = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    if (!input.classList.contains("jd-transfer__search-input")) return;
    const side = (input.closest<HTMLElement>(".jd-transfer__panel")?.dataset.side ??
      "source") as JdTransferSide;
    this.searchText[side] = input.value;
    this.renderedKey[side] = null;
    this.requestUpdate();
  };

  /* ── 이동 ─────────────────────────────────────────────────────────── */

  move(from: JdTransferSide, to: JdTransferSide): void {
    if (this.disabled) return;
    const picked = this.checked[from];
    const moving = this.lists[from].filter((it) => picked.has(it.key) && !it.disabled);
    if (moving.length === 0) return;
    this.lists[from] = this.lists[from].filter((it) => !picked.has(it.key) || it.disabled);
    this.lists[to] = [...this.lists[to], ...moving];
    this.checked[from] = new Set();
    this.renderedKey.source = null;
    this.renderedKey.target = null;
    this.emit("jd-change", {
      source: this.lists.source.slice(),
      target: this.lists.target.slice(),
      moved: moving.slice(),
      to,
    });
    this.requestUpdate();
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    this.syncPanel("source", this.sourceTitle);
    this.syncPanel("target", this.targetTitle);
    this.moveToTargetBtn.disabled = this.disabled || this.movableCount("source") === 0;
    this.moveToSourceBtn.disabled = this.disabled || this.movableCount("target") === 0;
    this.moveToTargetBtn.setAttribute("aria-label", `${this.targetTitle}(으)로 이동`);
    this.moveToSourceBtn.setAttribute("aria-label", `${this.sourceTitle}(으)로 이동`);
  }

  protected movableCount(side: JdTransferSide): number {
    return this.lists[side].filter((it) => this.checked[side].has(it.key) && !it.disabled).length;
  }

  protected filterItems(side: JdTransferSide): JdTransferItem[] {
    const q = this.searchable ? this.searchText[side].trim().toLowerCase() : "";
    if (!q) return this.lists[side];
    return this.lists[side].filter((it) => it.label.toLowerCase().includes(q));
  }

  protected syncPanel(side: JdTransferSide, title: string): void {
    const p = this.panels[side];
    const items = this.filterItems(side);
    p.title.textContent = title;
    p.count.textContent = `${this.checked[side].size}/${items.length}`;
    p.search.hidden = !this.searchable;
    p.searchInput.placeholder = this.searchPlaceholder;
    p.searchInput.disabled = this.disabled;

    const key = JSON.stringify(items.map((it) => it.key));
    if (key !== this.renderedKey[side] || p.list.childElementCount !== items.length) {
      p.list.textContent = "";
      for (const it of items) p.list.append(this.buildRow(side, it));
      this.renderedKey[side] = key;
    }
    items.forEach((it, i) => {
      const row = p.list.children[i] as HTMLElement | undefined;
      if (!row) return;
      const input = row.querySelector<HTMLInputElement>("input")!;
      input.value = it.key;
      input.dataset.side = side;
      input.checked = this.checked[side].has(it.key);
      input.disabled = this.disabled || Boolean(it.disabled);
      row.toggleAttribute("data-disabled", input.disabled);
      const label = row.querySelector<HTMLElement>(".jd-transfer__item-label");
      if (label) label.textContent = it.label;
    });

    p.empty.textContent = this.emptyMessage;
    p.empty.hidden = items.length > 0;
  }

  protected buildRow(side: JdTransferSide, item: JdTransferItem): HTMLElement {
    const row = document.createElement("label");
    row.className = "jd-transfer__item";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "jd-transfer__check";
    input.value = item.key;
    input.dataset.side = side;
    const label = document.createElement("span");
    label.className = "jd-transfer__item-label";
    label.textContent = item.label;
    row.append(input, label);
    return row;
  }
}
