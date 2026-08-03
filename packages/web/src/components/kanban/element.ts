/**
 * <jd-kanban> — 컬럼별 카드 보드 (v2 patterns/Kanban). 네이티브 HTML5 드래그.
 *
 * 데이터 2경로(§1.3 — 복합 데이터는 attribute 금지):
 *  1. `columns` 프로퍼티 (Array<{id,title,color?,items:[{id, …}]}>)
 *  2. 자식 `<script type="application/json">[…]</script>` 슬롯 (jd-radio-group 선례)
 *
 * 카드 본문: v2는 `renderCard(item, columnId): ReactNode` 렌더 프롭이었다. 바닐라에는
 * JSX가 없으므로 두 경로를 준다 — 기본 카드(제목+설명 자동 렌더)와, JS 소비자용
 * `renderCard` **함수 프로퍼티**(`(item, columnId) => JdContent`). 문자열은 평문이며
 * 검증된 마크업만 `unsafeHtml()`로 표시한다. 함수는 복합값이라 property 전용.
 *
 * 상태 소유(uncontrolled): v2는 `columns`를 부모가 쥐고 `onMove`만 받았다. 바닐라에는
 * 상태를 되돌려줄 부모가 없으므로 jd-onboarding/jd-star-rating 선례대로 **요소가 상태를
 * 소유**한다 — 카드를 옮기면 스스로 내부 모델을 갱신하고 jd-move를 발행한다. 소비자가
 * `el.columns = […]`를 다시 대입하면 그 값이 이긴다(마지막 쓰기 승리 §1.3).
 *
 * v2 대비 교정(구조·접근성):
 *  1. **드래그가 유일한 이동 수단이었다** — 포인터 없는 사용자는 카드를 못 옮겼다.
 *     v3는 카드에 키보드 이동을 더한다(Ctrl/⌘+←/→ = 이웃 컬럼으로). 화살표만으로는
 *     스크롤·포커스와 충돌하므로 수식 키를 요구한다.
 *  2. **의미 없는 div 더미였다** — 컬럼 수·카드 수·"무엇의 목록"이 AT에 없었다.
 *     v3는 컬럼=role=list(제목이 이름), 카드=role=listitem + roledescription.
 */
import { JdElement } from "../../core/element.js";
import { setContent, type JdContent } from "../../core/content.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import kanbanStyles from "./kanban.css.js";

export interface JdKanbanItem {
  id: string;
  /** 기본 카드가 굵게 표시 — 없으면 id */
  title?: string;
  /** 기본 카드의 보조 줄 */
  description?: string;
  [key: string]: unknown;
}

export interface JdKanbanColumn<T extends JdKanbanItem = JdKanbanItem> {
  id: string;
  title: string;
  /** 컬럼 머리 점 색(임의 CSS 색) */
  color?: string;
  items: T[];
}

export type JdKanbanCardRenderer = (
  item: JdKanbanItem,
  columnId: string,
) => JdContent | null | undefined;

export class JdKanban extends JdElement {
  static override tag = "jd-kanban";
  static override props = {
    /** 카드 이동 후에도 jd-move만 발행하고 내부 모델은 그대로 둔다(완전 제어) */
    controlled: { type: Boolean, reflect: true },
    /** 카드 이동 지시문(스크린리더 안내) */
    moveHint: { type: String, default: "Ctrl과 좌우 화살표로 카드를 옮깁니다" },
  };

  declare controlled: boolean;
  declare moveHint: string;

  #columns: JdKanbanColumn[] = [];
  #renderCard: JdKanbanCardRenderer | null = null;
  #board!: HTMLElement;
  #hintId = "";
  /** 진행 중 드래그 — {카드 id, 원 컬럼 id} */
  #drag: { id: string; from: string } | null = null;

  get columns(): JdKanbanColumn[] {
    return this.#columns;
  }
  set columns(v: JdKanbanColumn[]) {
    this.#columns = this.#normalize(v);
    this.requestUpdate();
  }

  get renderCard(): JdKanbanCardRenderer | null {
    return this.#renderCard;
  }
  set renderCard(fn: JdKanbanCardRenderer | null) {
    this.#renderCard = typeof fn === "function" ? fn : null;
    this.requestUpdate();
  }

  /** 컬럼/아이템 배열을 얕게 복사해 소비자 데이터를 몰래 바꾸지 않는다 */
  #normalize(v: unknown): JdKanbanColumn[] {
    if (!Array.isArray(v)) return [];
    return v
      .filter((c): c is JdKanbanColumn => Boolean(c) && typeof c === "object")
      .map((c) => ({
        ...c,
        id: String(c.id),
        title: c.title ?? "",
        items: Array.isArray(c.items) ? c.items.map((it) => ({ ...it })) : [],
      }));
  }

  protected render(): void {
    adoptStyles(kanbanStyles);
    this.#upgradeOwn("columns");
    this.#upgradeOwn("renderCard");
    this.#readJson();

    const board = this.querySelector<HTMLElement>(":scope > .jd-kanban__board");
    if (board) {
      this.#board = board;
      this.#hintId = this.querySelector<HTMLElement>(":scope > .jd-kanban__hint")?.id ?? "";
    } else {
      this.#board = document.createElement("div");
      this.#board.className = "jd-kanban__board";
      const hint = document.createElement("span");
      hint.className = "jd-kanban__hint";
      hint.id = this.#hintId = jdUid("jd-kanban-hint");
      this.append(hint, this.#board);
    }
    this.update();
  }

  /** 업그레이드 전에 대입된 접근자 전용 프로퍼티 회수(§1.3 표준 CE 함정) */
  #upgradeOwn(name: string): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const self = this as unknown as Record<string, unknown>;
    const v = self[name];
    delete self[name];
    self[name] = v;
  }

  #readJson(): void {
    if (this.#columns.length > 0) return;
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      this.#columns = this.#normalize(JSON.parse(script.textContent || "[]"));
    } catch {
      console.warn("[junds] <jd-kanban> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override connected(): void {
    this.#board.addEventListener("dragstart", this.#onDragStart);
    this.#board.addEventListener("dragend", this.#onDragEnd);
    this.#board.addEventListener("dragover", this.#onDragOver);
    this.#board.addEventListener("dragleave", this.#onDragLeave);
    this.#board.addEventListener("drop", this.#onDrop);
    this.#board.addEventListener("keydown", this.#onKeyDown);
  }

  protected override disconnected(): void {
    this.#board?.removeEventListener("dragstart", this.#onDragStart);
    this.#board?.removeEventListener("dragend", this.#onDragEnd);
    this.#board?.removeEventListener("dragover", this.#onDragOver);
    this.#board?.removeEventListener("dragleave", this.#onDragLeave);
    this.#board?.removeEventListener("drop", this.#onDrop);
    this.#board?.removeEventListener("keydown", this.#onKeyDown);
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    if (!this.#board) return;
    const hint = this.querySelector<HTMLElement>(":scope > .jd-kanban__hint");
    if (hint) hint.textContent = this.moveHint;
    const cols = this.#columns;
    // 컬럼 골격은 개수가 맞으면 재사용, 아니면 통째로 다시 짓는다(입양은 컬럼 단위)
    if (this.#board.children.length !== cols.length) {
      this.#board.textContent = "";
      for (const col of cols) this.#board.append(this.#buildColumn(col));
    }
    cols.forEach((col, i) => this.#syncColumn(this.#board.children[i] as HTMLElement, col));
  }

  #buildColumn(col: JdKanbanColumn): HTMLElement {
    const el = document.createElement("section");
    el.className = "jd-kanban__column";
    el.dataset.column = col.id;

    const header = document.createElement("div");
    header.className = "jd-kanban__column-header";
    const dot = document.createElement("span");
    dot.className = "jd-kanban__column-dot";
    dot.setAttribute("aria-hidden", "true");
    const title = document.createElement("span");
    title.className = "jd-kanban__column-title";
    const count = document.createElement("span");
    count.className = "jd-kanban__column-count";
    header.append(dot, title, count);

    const list = document.createElement("ul");
    list.className = "jd-kanban__list";
    list.setAttribute("role", "list");

    el.append(header, list);
    return el;
  }

  #syncColumn(el: HTMLElement, col: JdKanbanColumn): void {
    el.dataset.column = col.id;
    const dot = el.querySelector<HTMLElement>(".jd-kanban__column-dot")!;
    if (col.color) {
      dot.style.background = col.color;
      dot.hidden = false;
    } else {
      dot.hidden = true;
    }
    el.querySelector<HTMLElement>(".jd-kanban__column-title")!.textContent = col.title;
    el.querySelector<HTMLElement>(".jd-kanban__column-count")!.textContent = String(
      col.items.length,
    );

    const list = el.querySelector<HTMLUListElement>(".jd-kanban__list")!;
    list.setAttribute("aria-label", `${col.title} (${col.items.length})`);
    // 카드는 매 반영마다 다시 그린다 — 이동 후 순서·소속이 바뀌므로 재사용 이득이 작다
    list.textContent = "";
    for (const item of col.items) list.append(this.#buildCard(item, col.id));
  }

  #buildCard(item: JdKanbanItem, columnId: string): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "jd-kanban__card";
    li.tabIndex = 0;
    li.draggable = true;
    li.dataset.card = item.id;
    li.setAttribute("aria-roledescription", "카드");
    li.setAttribute("aria-label", item.title || item.id);
    if (this.#hintId) li.setAttribute("aria-describedby", this.#hintId);

    const custom = this.#renderCard?.(item, columnId);
    if (custom !== undefined && custom !== null) {
      setContent(li, custom);
    } else {
      const title = document.createElement("p");
      title.className = "jd-kanban__card-title";
      title.textContent = item.title || item.id;
      li.append(title);
      if (typeof item.description === "string" && item.description) {
        const desc = document.createElement("p");
        desc.className = "jd-kanban__card-desc";
        desc.textContent = item.description;
        li.append(desc);
      }
    }
    return li;
  }

  /* ── 드래그 ───────────────────────────────────────────────────────── */

  #cardFrom(e: Event): { id: string; column: string } | null {
    const card = (e.target as Element | null)?.closest<HTMLElement>(".jd-kanban__card");
    if (!card || !this.#board.contains(card)) return null;
    const column = card.closest<HTMLElement>(".jd-kanban__column")?.dataset.column;
    if (!card.dataset.card || !column) return null;
    return { id: card.dataset.card, column };
  }

  #onDragStart = (e: DragEvent): void => {
    const found = this.#cardFrom(e);
    if (!found) return;
    this.#drag = { id: found.id, from: found.column };
    (e.target as HTMLElement).classList.add("jd-kanban__card--dragging");
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", found.id);
    }
  };

  #onDragEnd = (): void => {
    this.#board
      .querySelector(".jd-kanban__card--dragging")
      ?.classList.remove("jd-kanban__card--dragging");
    this.#clearDropTargets();
    this.#drag = null;
  };

  #onDragOver = (e: DragEvent): void => {
    if (!this.#drag) return;
    const col = (e.target as Element | null)?.closest<HTMLElement>(".jd-kanban__column");
    if (!col) return;
    e.preventDefault(); // drop 허용
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    this.#clearDropTargets();
    if (col.dataset.column !== this.#drag.from) col.dataset.dropTarget = "";
  };

  #onDragLeave = (e: DragEvent): void => {
    const col = (e.target as Element | null)?.closest<HTMLElement>(".jd-kanban__column");
    // 컬럼 내부 요소 간 이동은 무시 — 컬럼 밖으로 나갈 때만 해제
    if (col && !col.contains(e.relatedTarget as Node)) delete col.dataset.dropTarget;
  };

  #onDrop = (e: DragEvent): void => {
    if (!this.#drag) return;
    const col = (e.target as Element | null)?.closest<HTMLElement>(".jd-kanban__column");
    this.#clearDropTargets();
    if (!col?.dataset.column) return;
    e.preventDefault();
    this.#moveCard(this.#drag.id, this.#drag.from, col.dataset.column);
    this.#drag = null;
  };

  #clearDropTargets(): void {
    for (const el of this.#board.querySelectorAll<HTMLElement>("[data-drop-target]"))
      delete el.dataset.dropTarget;
  }

  /* ── 키보드 이동 ──────────────────────────────────────────────────── */

  #onKeyDown = (e: KeyboardEvent): void => {
    if (!(e.ctrlKey || e.metaKey)) return;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const found = this.#cardFrom(e);
    if (!found) return;
    const fromIndex = this.#columns.findIndex((c) => c.id === found.column);
    const toIndex = fromIndex + (e.key === "ArrowLeft" ? -1 : 1);
    const target = this.#columns[toIndex];
    if (!target) return;
    e.preventDefault();
    this.#moveCard(found.id, found.column, target.id);
    // 반영 후 옮겨진 카드로 포커스를 되돌린다
    this.requestUpdate();
    queueMicrotask(() =>
      this.#board
        .querySelector<HTMLElement>(
          `.jd-kanban__column[data-column="${cssEscape(
            target.id,
          )}"] .jd-kanban__card[data-card="${cssEscape(found.id)}"]`,
        )
        ?.focus(),
    );
  };

  /**
   * 카드를 from→to 컬럼으로 옮긴다. 제어 모드면 모델을 건드리지 않고 통지만.
   * @returns 실제로 옮겼으면 true
   */
  #moveCard(itemId: string, from: string, to: string): boolean {
    if (from === to) return false;
    if (!this.controlled) {
      const src = this.#columns.find((c) => c.id === from);
      const dst = this.#columns.find((c) => c.id === to);
      if (!src || !dst) return false;
      const idx = src.items.findIndex((it) => it.id === itemId);
      if (idx < 0) return false;
      const [moved] = src.items.splice(idx, 1);
      dst.items.push(moved!);
      this.requestUpdate();
    }
    this.emit("jd-move", { itemId, from, to });
    return true;
  }

  /** 프로그램 이동 — 클릭/키보드 경로와 같은 규칙 */
  moveCard(itemId: string, to: string): boolean {
    const from = this.#columns.find((c) => c.items.some((it) => it.id === itemId))?.id;
    if (!from) return false;
    return this.#moveCard(itemId, from, to);
  }
}

/** CSS.escape 폴백 — 셀렉터에 넣을 id 안전화(구형 환경 대비) */
function cssEscape(v: string): string {
  const g = globalThis as { CSS?: { escape?: (s: string) => string } };
  return g.CSS?.escape ? g.CSS.escape(v) : v.replace(/["\\\]]/g, "\\$&");
}
