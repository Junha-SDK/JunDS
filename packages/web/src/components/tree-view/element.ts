/**
 * <jd-tree-view> — 파일 탐색기형 트리 (v2 composites/TreeView).
 *
 * 노드는 property(Array) 또는 자식 `<script type="application/json">` 슬롯(§1.3).
 * `<jd-tree-nav>`가 이 클래스를 상속한다(§6 R12) — v2 TreeView/TreeNav는 재귀 렌더·
 * 확장 상태·깊이 들여쓰기·셰브론이 같은 코드 두 벌이었고, 다른 것은 배지와 랜드마크뿐이다.
 *
 * v2 결함 4건 교정:
 *  1. **role=tree인데 treeitem이 없었다.** v2 TreeView는 컨테이너에만 role="tree"를
 *     주고 자식은 맨 `<button>`이었다 — AT에는 "트리인데 항목이 하나도 없는" 상태다.
 *     v3는 `ul[role=tree] > li[role=treeitem] > ul[role=group]` APG 구조를 낸다.
 *  2. **노드 전부가 탭 순서에 있었다.** 100개 노드면 Tab을 100번 눌러야 트리를
 *     빠져나갔다(v2 TreeNav는 div마다 tabIndex=0, TreeView는 button). v3는 로빙
 *     tabindex — 트리 전체가 탭스톱 1개이고 안에서는 화살표로 움직인다.
 *  3. **화살표 키가 없었다.** APG Tree 패턴대로 ↑/↓(보이는 노드 순회) · →(닫힘이면
 *     펼치고, 열려 있으면 첫 자식) · ←(열려 있으면 접고, 아니면 부모) · Home/End ·
 *     Enter/Space(선택)를 구현한다.
 *  4. **펼침 상태가 시각뿐이었다.** v2 TreeView에는 aria-expanded가 없었다.
 *     v3는 aria-expanded·aria-selected·aria-disabled를 실제 상태와 묶는다.
 *
 * 추가 개선: 셰브론만 누르면 **선택 없이 펼치기/접기**만 한다(v2는 폴더를 선택하려면
 * 반드시 접히는 구조였다). 행 전체 클릭은 v2 그대로 토글+선택.
 */
import { JdElement } from "../../core/element.js";
import { isContentEmpty, setContent, type JdContent } from "../../core/content.js";
import { adoptStyles } from "../../core/styles.js";
import { createKeyHandler } from "../../behaviors/input.js";
import treeViewStyles from "./tree-view.css.js";

export interface JdTreeNode {
  /** 트리 안에서 유일해야 한다 — 선택·확장 상태의 식별자 */
  key: string;
  label: string;
  /** 아이콘. 문자열(평문), DOM 노드 또는 `unsafeHtml()`로 표시한 값 */
  icon?: JdContent;
  children?: JdTreeNode[];
  disabled?: boolean;
  /** 우측 카운트 배지 */
  badge?: number | string;
  /** 링크 주소 — 요소가 직접 이동하지는 않고 jd-select detail로 전달한다 */
  href?: string;
}

const CHEVRON_SVG =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
  `<path d="M9 18l6-6-6-6"/></svg>`;

function fillIcon(slot: HTMLElement, icon: JdContent | undefined): void {
  if (isContentEmpty(icon)) {
    slot.hidden = true;
    setContent(slot, icon);
    return;
  }
  slot.hidden = false;
  setContent(slot, icon);
}

const hasChildren = (node: JdTreeNode): boolean =>
  Array.isArray(node.children) && node.children.length > 0;

export class JdTreeView extends JdElement {
  static override tag = "jd-tree-view";
  static override props = {
    /** 선택된 노드 key */
    selected: { type: String, reflect: true },
    /** 트리 접근 이름 */
    label: { type: String, default: "트리" },
  };

  declare selected: string;
  declare label: string;

  #nodes: JdTreeNode[] = [];
  #built: readonly JdTreeNode[] | null = null;
  #expanded = new Set<string>();
  #tree: HTMLUListElement | null = null;
  #byKey = new Map<string, HTMLLIElement>();
  #nodeByKey = new Map<string, JdTreeNode>();
  /** 로빙 tabindex가 놓인 노드 */
  #focusKey: string | null = null;

  get nodes(): JdTreeNode[] {
    return this.#nodes;
  }
  set nodes(v: JdTreeNode[]) {
    this.#nodes = Array.isArray(v) ? v : [];
    this.#built = null;
    this.requestUpdate();
  }

  /** 펼쳐진 노드 key 목록 (라이브 상태) */
  get expanded(): string[] {
    return [...this.#expanded];
  }
  set expanded(v: string[]) {
    this.#expanded = new Set(Array.isArray(v) ? v : []);
    this.requestUpdate();
  }

  /** v2 defaultExpanded 표면 — expanded의 별칭(최초 대입용) */
  get defaultExpanded(): string[] {
    return this.expanded;
  }
  set defaultExpanded(v: string[]) {
    this.expanded = v;
  }

  protected render(): void {
    adoptStyles(treeViewStyles);
    this.readJson();
    // 입양(§3.3)
    this.#tree = this.querySelector<HTMLUListElement>(":scope > ul.jd-tree-view__tree");
    if (!this.#tree) {
      this.#tree = document.createElement("ul");
      this.#tree.className = "jd-tree-view__tree";
      this.#tree.setAttribute("role", "tree");
      this.append(this.#tree);
    }
    this.#sync();
    this.update();
  }

  protected override connected(): void {
    this.addEventListener("click", this.#onClick);
    this.addEventListener("focusin", this.#onFocusIn);
    this.own(
      createKeyHandler(this, {
        arrowdown: () => this.#move(1),
        arrowup: () => this.#move(-1),
        arrowright: () => this.#onRight(),
        arrowleft: () => this.#onLeft(),
        home: () => this.#focusEdge(1),
        end: () => this.#focusEdge(-1),
        enter: () => this.#activate(this.#focusKey),
        " ": () => this.#activate(this.#focusKey),
      }),
    );
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.#onClick);
    this.removeEventListener("focusin", this.#onFocusIn);
  }

  /** 선언적 초기화 슬롯 — 1회 소비. 파생 클래스가 태그명만 바꿔 재사용한다 */
  protected readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdTreeNode[];
      if (Array.isArray(parsed)) this.#nodes = parsed;
    } catch {
      console.warn(`[junds] <${this.localName}> JSON 슬롯 파싱 실패 — 무시합니다.`);
    }
    script.remove();
  }

  /* ── 골격 ────────────────────────────────────────────────── */

  #sync(): void {
    this.#built = this.#nodes;
    this.#byKey.clear();
    this.#nodeByKey.clear();
    if (this.#tree) this.#syncLevel(this.#tree, this.#nodes, 0);
  }

  /** 한 단계 동기화 — 개수가 같으면 골격을 재사용(입양)하고 내용만 맞춘다 */
  #syncLevel(container: HTMLElement, nodes: JdTreeNode[], depth: number): void {
    let rows = Array.from(
      container.querySelectorAll<HTMLLIElement>(":scope > li.jd-tree-view__item"),
    );
    if (rows.length !== nodes.length) {
      for (const row of rows) row.remove();
      for (let i = 0; i < nodes.length; i++) container.append(this.#createRow());
      rows = Array.from(
        container.querySelectorAll<HTMLLIElement>(":scope > li.jd-tree-view__item"),
      );
    }
    rows.forEach((row, i) => {
      const node = nodes[i];
      if (!node) return;
      this.#byKey.set(node.key, row);
      this.#nodeByKey.set(node.key, node);
      row.dataset.key = node.key;
      row.setAttribute("aria-level", String(depth + 1));
      row.setAttribute("aria-setsize", String(nodes.length));
      row.setAttribute("aria-posinset", String(i + 1));
      const rowEl = row.querySelector<HTMLElement>(":scope > .jd-tree-view__row")!;
      rowEl.style.setProperty("--jd-tree-depth", String(depth));
      const branch = hasChildren(node);
      // 잎 노드의 셰브론 칸은 비워 둔다 — 자리는 유지되어 깊이 정렬이 흔들리지 않는다
      const chevron = rowEl.querySelector<HTMLElement>(".jd-tree-view__chevron")!;
      if (!branch) chevron.textContent = "";
      else if (!chevron.firstChild) chevron.innerHTML = CHEVRON_SVG;
      fillIcon(rowEl.querySelector<HTMLElement>(".jd-tree-view__icon")!, node.icon);
      rowEl.querySelector<HTMLElement>(".jd-tree-view__label")!.textContent = node.label;
      const badge = rowEl.querySelector<HTMLElement>(".jd-tree-view__badge")!;
      const showBadge = node.badge !== undefined && node.badge !== null;
      badge.textContent = showBadge ? String(node.badge) : "";
      badge.hidden = !showBadge;

      let group = row.querySelector<HTMLUListElement>(":scope > ul.jd-tree-view__group");
      if (branch) {
        if (!group) {
          group = document.createElement("ul");
          group.className = "jd-tree-view__group";
          group.setAttribute("role", "group");
          row.append(group);
        }
        this.#syncLevel(group, node.children ?? [], depth + 1);
      } else if (group) {
        group.remove();
      }
    });
  }

  #createRow(): HTMLLIElement {
    const row = document.createElement("li");
    row.className = "jd-tree-view__item";
    row.setAttribute("role", "treeitem");
    row.tabIndex = -1;
    const inner = document.createElement("span");
    inner.className = "jd-tree-view__row";
    const chevron = document.createElement("span");
    chevron.className = "jd-tree-view__chevron";
    const icon = document.createElement("span");
    icon.className = "jd-tree-view__icon";
    icon.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "jd-tree-view__label";
    const badge = document.createElement("span");
    badge.className = "jd-tree-view__badge";
    inner.append(chevron, icon, label, badge);
    row.append(inner);
    return row;
  }

  protected override update(): void {
    if (this.#built !== this.#nodes) this.#sync();
    this.#tree?.setAttribute("aria-label", this.label);
    this.applyState();
  }

  /* ── 상태 ────────────────────────────────────────────────── */

  /** aria/펼침/로빙 반영. #setExpanded는 update()를 기다리지 않고 직접 부른다 */
  protected applyState(): void {
    const visible = this.#visibleKeys();
    if (!this.#focusKey || !visible.includes(this.#focusKey)) {
      this.#focusKey =
        this.selected && visible.includes(this.selected) ? this.selected : visible[0] ?? null;
    }
    for (const [key, row] of this.#byKey) {
      const node = this.#nodeByKey.get(key);
      if (!node) continue;
      const branch = hasChildren(node);
      const open = branch && this.#expanded.has(key);
      if (branch) row.setAttribute("aria-expanded", String(open));
      else row.removeAttribute("aria-expanded");
      row.setAttribute("aria-selected", String(this.selected === key));
      if (node.disabled) row.setAttribute("aria-disabled", "true");
      else row.removeAttribute("aria-disabled");
      row.tabIndex = key === this.#focusKey ? 0 : -1;
      const group = row.querySelector<HTMLUListElement>(":scope > ul.jd-tree-view__group");
      if (group) group.hidden = !open;
    }
  }

  /** 펼침 상태 기준으로 보이는 노드 key를 순서대로 (키보드 이동의 정본) */
  #visibleKeys(): string[] {
    const out: string[] = [];
    const walk = (nodes: JdTreeNode[]): void => {
      for (const node of nodes) {
        out.push(node.key);
        if (hasChildren(node) && this.#expanded.has(node.key)) walk(node.children ?? []);
      }
    };
    walk(this.#nodes);
    return out;
  }

  #setExpanded(key: string, open: boolean): void {
    const node = this.#nodeByKey.get(key);
    if (!node || !hasChildren(node)) return;
    if (this.#expanded.has(key) === open) return;
    if (open) this.#expanded.add(key);
    else this.#expanded.delete(key);
    // 즉시 반영 — 펼친 직후 자식으로 포커스를 옮겨야 하는데 hidden은 포커스를 못 받는다
    this.applyState();
    this.emit(open ? "jd-open" : "jd-close", { key });
  }

  #focusRow(key: string | null): void {
    if (!key) return;
    this.#focusKey = key;
    this.applyState();
    this.#byKey.get(key)?.focus();
  }

  #move(delta: 1 | -1): void {
    const visible = this.#visibleKeys();
    if (visible.length === 0) return;
    const at = this.#focusKey ? visible.indexOf(this.#focusKey) : -1;
    const next = at < 0 ? (delta === 1 ? 0 : visible.length - 1) : at + delta;
    if (next < 0 || next >= visible.length) return; // 트리 끝에서는 멈춘다(APG)
    this.#focusRow(visible[next] ?? null);
  }

  #focusEdge(dir: 1 | -1): void {
    const visible = this.#visibleKeys();
    this.#focusRow((dir === 1 ? visible[0] : visible[visible.length - 1]) ?? null);
  }

  #onRight(): void {
    const key = this.#focusKey;
    if (!key) return;
    const node = this.#nodeByKey.get(key);
    if (!node || !hasChildren(node)) return;
    if (!this.#expanded.has(key)) {
      this.#setExpanded(key, true);
      return;
    }
    this.#focusRow(node.children?.[0]?.key ?? null);
  }

  #onLeft(): void {
    const key = this.#focusKey;
    if (!key) return;
    if (this.#expanded.has(key)) {
      this.#setExpanded(key, false);
      return;
    }
    const parent = this.#byKey
      .get(key)
      ?.parentElement?.closest<HTMLLIElement>("li.jd-tree-view__item");
    this.#focusRow(parent?.dataset.key ?? null);
  }

  /** Enter/Space·행 클릭 공통 — v2 동작(가지면 토글 + 선택) */
  #activate(key: string | null): void {
    if (!key) return;
    const node = this.#nodeByKey.get(key);
    if (!node) return;
    if (hasChildren(node)) this.#setExpanded(key, !this.#expanded.has(key));
    if (node.disabled) return;
    this.selected = key;
    this.#focusKey = key;
    this.emit("jd-select", { key, href: node.href });
  }

  #onClick = (e: Event): void => {
    const row = (e.target as Element | null)?.closest<HTMLLIElement>("li.jd-tree-view__item");
    if (!row || !this.contains(row)) return;
    const key = row.dataset.key;
    if (!key) return;
    // 셰브론만 눌렀으면 선택하지 않고 펼치기만 한다 (v2에 없던 분리)
    if ((e.target as Element | null)?.closest(".jd-tree-view__chevron")) {
      this.#setExpanded(key, !this.#expanded.has(key));
      this.#focusRow(key);
      return;
    }
    this.#activate(key);
    this.#focusRow(key);
  };

  #onFocusIn = (e: Event): void => {
    const row = (e.target as Element | null)?.closest<HTMLLIElement>("li.jd-tree-view__item");
    const key = row?.dataset.key;
    if (!key || key === this.#focusKey) return;
    this.#focusKey = key;
    this.applyState();
  };
}
