/**
 * <jd-sortable-list> — 드래그로 재정렬하는 목록 (v2 patterns/SortableList, 네이티브 HTML5 DnD).
 *
 * 데이터 2경로(§1.3): `items` 프로퍼티(각 항목은 `id` 보유) 또는 자식
 * <script type="application/json">. 항목 렌더는 `renderItem` 프로퍼티(함수). 순서가 바뀌면
 * `jd-reorder`에 새 배열과 { from, to }를 실어 낸다 — 소비자가 상태를 갱신한다(v2 onReorder 등가).
 *
 * v2 대비 교정 4건:
 * 1. **키보드로 정렬이 불가능했다.** v2는 마우스 드래그 전용이라 키보드·스크린리더 사용자에게
 *    닫혀 있었다. v3는 핸들(또는 핸들이 없으면 행)을 포커스 가능하게 하고 ↑/↓·Home/End로
 *    항목을 옮긴다 — 이동 후 포커스가 옮긴 항목을 따라간다.
 * 2. **목록·핸들에 이름이 없었다.** role=list/listitem + 핸들 `aria-label`(항목 라벨 포함) +
 *    `aria-roledescription`으로 "정렬 가능한 항목"임을 알린다.
 * 3. **드롭 위치 표시가 색뿐이었다.** v2는 over 행에 border-top만 그렸다 — v3는 같은 표시에
 *    더해 `aria-live`로 이동 결과("N번째로 이동")를 알린다.
 * 4. **grabbed 상태를 CSS 훅으로.** 드래그 중 행은 `data-grabbed`, 드롭 대상 행은
 *    `data-drop-target`으로 표시해 시각 피드백을 준다(v2 opacity/border 동형).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import sortableListStyles from "./sortable-list.css.js";

export interface JdSortableItem {
  id: string;
  [key: string]: unknown;
}

export type JdSortableItemContent = string | number | Node | null | undefined;
export type JdSortableRenderItem = (item: JdSortableItem, index: number) => JdSortableItemContent;

const HANDLE_SVG =
  `<svg viewBox="0 0 14 14" fill="currentColor" aria-hidden="true" focusable="false">` +
  `<circle cx="5" cy="3" r="1"/><circle cx="9" cy="3" r="1"/>` +
  `<circle cx="5" cy="7" r="1"/><circle cx="9" cy="7" r="1"/>` +
  `<circle cx="5" cy="11" r="1"/><circle cx="9" cy="11" r="1"/></svg>`;

export class JdSortableList extends JdElement {
  static override tag = "jd-sortable-list";
  static override props = {
    /** 드래그 핸들 표시 (없으면 행 전체가 드래그 표면) */
    showHandle: { type: Boolean, reflect: true }, // attr: show-handle
    /** 항목 라벨로 쓸 필드 — 핸들 aria-label·안내 문구에 쓴다 */
    labelKey: { type: String, default: "label" }, // attr: label-key
  };

  declare showHandle: boolean;
  declare labelKey: string;

  #items: JdSortableItem[] = [];
  renderItem: JdSortableRenderItem | null = null;

  #dragIndex = -1;
  /** 재정렬 뒤 포커스를 옮길 인덱스 — 키보드 이동의 연속성 */
  #focusAfter = -1;
  /** 이동 결과를 알리는 로컬 live region(§8 로컬 라이브 리전 관례) */
  #live!: HTMLElement;

  get items(): JdSortableItem[] {
    return this.#items;
  }
  set items(v: JdSortableItem[]) {
    this.#items = Array.isArray(v) ? v.slice() : [];
    this.#rebuild();
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(sortableListStyles);
    if (Object.prototype.hasOwnProperty.call(this, "items")) {
      const v = (this as unknown as Record<string, unknown>).items;
      delete (this as unknown as Record<string, unknown>).items;
      (this as unknown as Record<string, unknown>).items = v;
    }
    this.#readJsonSlot();
    this.setAttribute("role", "list");
    this.#live =
      this.querySelector<HTMLElement>(":scope > .jd-sortable-list__live") ?? this.#buildLive();
    this.#rebuild();
    this.update();
  }

  /** 이동 결과 공지용 시각적 숨김 리전 — 입양(§3.3) */
  #buildLive(): HTMLElement {
    const live = document.createElement("div");
    live.className = "jd-sortable-list__live";
    live.setAttribute("aria-live", "polite");
    live.setAttribute("aria-atomic", "true");
    this.append(live);
    return live;
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script?.textContent) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent);
      if (Array.isArray(parsed)) this.#items = parsed as JdSortableItem[];
    } catch {
      console.warn("[junds] <jd-sortable-list> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /** 항목이 바뀌면 행을 다시 만든다 — 재정렬은 배열을 교체하므로 전량 재구축이 단순·안전 */
  #rebuild(): void {
    if (!this.isConnected && this.#items.length === 0 && this.childElementCount === 0) return;
    for (const row of Array.from(this.querySelectorAll(":scope > .jd-sortable-list__item"))) {
      row.remove();
    }
    for (let i = 0; i < this.#items.length; i++) this.append(this.#buildRow(this.#items[i]!, i));
  }

  #buildRow(item: JdSortableItem, index: number): HTMLElement {
    const row = document.createElement("div");
    row.className = "jd-sortable-list__item";
    row.setAttribute("role", "listitem");
    row.setAttribute("aria-roledescription", "정렬 가능한 항목");
    row.dataset.index = String(index);
    row.draggable = true;

    if (this.showHandle) {
      const handle = document.createElement("button");
      handle.type = "button";
      handle.className = "jd-sortable-list__handle";
      handle.innerHTML = HANDLE_SVG;
      row.append(handle);
    }

    const content = document.createElement("div");
    content.className = "jd-sortable-list__content";
    const out = this.renderItem ? this.renderItem(item, index) : (item[this.labelKey] as JdSortableItemContent);
    if (out instanceof Node) content.append(out);
    else if (out !== null && out !== undefined) content.textContent = String(out);
    row.append(content);
    return row;
  }

  protected override connected(): void {
    this.addEventListener("dragstart", this.#onDragStart);
    this.addEventListener("dragover", this.#onDragOver);
    this.addEventListener("dragleave", this.#onDragLeave);
    this.addEventListener("drop", this.#onDrop);
    this.addEventListener("dragend", this.#onDragEnd);
    this.addEventListener("keydown", this.#onKeydown);
  }

  protected override disconnected(): void {
    this.removeEventListener("dragstart", this.#onDragStart);
    this.removeEventListener("dragover", this.#onDragOver);
    this.removeEventListener("dragleave", this.#onDragLeave);
    this.removeEventListener("drop", this.#onDrop);
    this.removeEventListener("dragend", this.#onDragEnd);
    this.removeEventListener("keydown", this.#onKeydown);
  }

  #rowFrom(target: EventTarget | null): HTMLElement | null {
    const row = (target as Element | null)?.closest<HTMLElement>(".jd-sortable-list__item") ?? null;
    // 이 리스트의 행만 — 중첩 정렬 리스트에서 안쪽 이벤트를 바깥이 삼키지 않게
    return row && row.parentElement === this ? row : null;
  }

  #onDragStart = (e: DragEvent): void => {
    const row = this.#rowFrom(e.target);
    if (!row) return;
    this.#dragIndex = Number(row.dataset.index);
    row.dataset.grabbed = "";
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      // 일부 브라우저는 데이터가 있어야 드래그를 시작한다
      try {
        e.dataTransfer.setData("text/plain", String(this.#dragIndex));
      } catch {
        /* Safari 구버전 — 무시 */
      }
    }
  };

  #onDragOver = (e: DragEvent): void => {
    if (this.#dragIndex < 0) return;
    const row = this.#rowFrom(e.target);
    if (!row) return;
    e.preventDefault(); // drop 허용
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    const over = Number(row.dataset.index);
    for (const r of this.querySelectorAll<HTMLElement>(":scope > .jd-sortable-list__item")) {
      r.toggleAttribute("data-drop-target", Number(r.dataset.index) === over && over !== this.#dragIndex);
    }
  };

  #onDragLeave = (e: DragEvent): void => {
    const row = this.#rowFrom(e.target);
    row?.removeAttribute("data-drop-target");
  };

  #onDrop = (e: DragEvent): void => {
    const row = this.#rowFrom(e.target);
    if (!row || this.#dragIndex < 0) return;
    e.preventDefault();
    this.#move(this.#dragIndex, Number(row.dataset.index), false);
    this.#clearDragState();
  };

  #onDragEnd = (): void => {
    this.#clearDragState();
  };

  #clearDragState(): void {
    this.#dragIndex = -1;
    for (const r of this.querySelectorAll<HTMLElement>(":scope > .jd-sortable-list__item")) {
      r.removeAttribute("data-grabbed");
      r.removeAttribute("data-drop-target");
    }
  }

  #onKeydown = (e: KeyboardEvent): void => {
    const row = this.#rowFrom(e.target);
    if (!row) return;
    // 포커스가 핸들(있으면) 또는 행 자체일 때만 — 안쪽 컨트롤의 방향키를 뺏지 않는다
    const focusOwner = this.showHandle ? row.querySelector(".jd-sortable-list__handle") : row;
    if (e.target !== focusOwner) return;
    const i = Number(row.dataset.index);
    const last = this.#items.length - 1;
    let to = i;
    if (e.key === "ArrowUp") to = i - 1;
    else if (e.key === "ArrowDown") to = i + 1;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = last;
    else return;
    e.preventDefault();
    if (to < 0 || to > last || to === i) return;
    this.#focusAfter = to;
    this.#move(i, to, true);
  };

  #move(from: number, to: number, announceMove: boolean): void {
    if (from === to || from < 0 || to < 0 || from >= this.#items.length || to >= this.#items.length) {
      return;
    }
    const next = this.#items.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    this.#items = next;
    this.#rebuild();
    this.emit("jd-reorder", { items: next, from, to });
    if (announceMove && this.#live) {
      const label = String(moved![this.labelKey] ?? moved!.id ?? "항목");
      this.#live.textContent = `${label}, ${to + 1}번째로 이동`;
    }
    this.requestUpdate();
  }

  protected override update(): void {
    // 키보드 이동 뒤 포커스를 옮긴 항목으로 되돌린다(연속성 — 교정 1)
    if (this.#focusAfter >= 0) {
      const row = this.querySelector<HTMLElement>(
        `:scope > .jd-sortable-list__item[data-index="${this.#focusAfter}"]`,
      );
      this.#focusAfter = -1;
      const focusEl = this.showHandle
        ? row?.querySelector<HTMLElement>(".jd-sortable-list__handle")
        : row;
      focusEl?.focus();
    }
    // 핸들이 없으면 행이 키보드 진입점 — 포커스 가능하게 하고 이름을 준다
    for (const row of this.querySelectorAll<HTMLElement>(":scope > .jd-sortable-list__item")) {
      const i = Number(row.dataset.index);
      const label = String(this.#items[i]?.[this.labelKey] ?? this.#items[i]?.id ?? `${i + 1}번째 항목`);
      const handle = row.querySelector<HTMLElement>(".jd-sortable-list__handle");
      if (handle) {
        handle.setAttribute("aria-label", `${label} 정렬 핸들, 방향키로 이동`);
        row.removeAttribute("tabindex");
      } else {
        row.tabIndex = 0;
        row.setAttribute("aria-label", `${label}, 방향키로 이동`);
      }
    }
  }
}
