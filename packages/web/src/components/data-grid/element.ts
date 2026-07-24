/**
 * <jd-data-grid> — 정렬·선택·페이징이 붙은 데이터 그리드 (v2 composites/DataGrid)
 * = <jd-table> 파생.
 *
 * v2는 Table과 DataGrid가 **같은 표를 두 번** 그렸다(래퍼·thead·tbody·셀 렌더가
 * 문자열만 다른 복붙). v3는 골격·빈 상태·행 활성화·입양 규칙을 jd-table이 전부 갖고
 * 여기서는 §6 R12대로 **정렬 머리 · 선택 열 · 페이징 푸터**만 얹는다.
 *
 * v2 대비 교정 5건:
 *  1. **정렬이 키보드로 불가능했다.** v2는 `<th onClick>`이라 탭으로 닿지 않았다 —
 *     v3는 정렬 가능한 머리를 진짜 `<button>`으로 내고 `aria-sort`를 붙인다.
 *  2. **체크박스에 이름이 없었다.** 전체 선택/행 선택 모두 aria-label을 갖는다.
 *  3. **선택이 정렬에 따라 어긋났다.** v2는 선택을 *정렬본 인덱스*로 들고 있어
 *     정렬을 바꾸면 다른 행이 선택된 상태가 됐다. v3는 **행 객체 동일성**으로 추적한다
 *     (정렬·페이지 이동에도 같은 행이 선택된 채로 남는다).
 *  4. **전체 선택이 '현재 페이지 전체'인데 표시가 없었다.** v2 toggleAll은 페이지 단위인데
 *     헤더 체크박스가 페이지 밖 선택을 무시했다 — v3는 페이지 일부만 선택된 상태를
 *     `indeterminate`로 표시한다.
 *  5. **총 행 수가 접근성 트리에 없었다.** 페이징된 표는 AT에 "몇 개 중 몇 번째"가
 *     보이지 않는다 — `aria-rowcount`/`aria-rowindex`로 원본 좌표를 준다.
 *
 * v2 두 컴포넌트의 셀 렌더 시그니처가 서로 달랐다(Table `(value,row)` · DataGrid `(row)`).
 * 파생으로 묶으면서 **`(value, row, index)` 하나로 통일**한다(jd-table 정본).
 */
import { JdTable } from "../table/element.js";
import type { JdTableColumn, JdTableRow, JdTableVisibleRow } from "../table/element.js";
import { adoptStyles } from "../../core/styles.js";
import dataGridStyles from "./data-grid.css.js";

export interface JdDataGridColumn extends JdTableColumn {
  /** 머리 클릭/Enter로 정렬 토글 */
  sortable?: boolean;
}

export type JdSortDirection = "asc" | "desc";

const SORT_ASC_SVG =
  `<svg viewBox="0 0 10 10" aria-hidden="true" focusable="false">` +
  `<path d="M2 6l3-3 3 3" stroke="currentColor" stroke-width="1.5" fill="none" ` +
  `stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SORT_DESC_SVG =
  `<svg viewBox="0 0 10 10" aria-hidden="true" focusable="false">` +
  `<path d="M2 4l3 3 3-3" stroke="currentColor" stroke-width="1.5" fill="none" ` +
  `stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export class JdDataGrid extends JdTable {
  static override tag = "jd-data-grid";
  static override props = {
    ...JdTable.props,
    /** 페이지당 행 수 (v2 기본 20) */
    pageSize: { type: Number, default: 20 }, // attr: page-size
    /** 현재 페이지 — jd-pagination과 같은 **1-base**(v2 내부 0-base를 표면에서 교정) */
    page: { type: Number, default: 1, reflect: true },
    selectable: { type: Boolean, reflect: true },
    /** 정렬 기준 열 key. 빈 값이면 원본 순서 */
    sortKey: { type: String }, // attr: sort-key
    /** asc | desc */
    sortDir: { type: String, default: "asc", reflect: true }, // attr: sort-dir
    prevLabel: { type: String, default: "이전" },
    nextLabel: { type: String, default: "다음" },
    selectAllLabel: { type: String, default: "현재 페이지 전체 선택" },
    emptyMessage: { type: String, default: "데이터가 없습니다" },
  };

  declare pageSize: number;
  declare page: number;
  declare selectable: boolean;
  declare sortKey: string;
  declare sortDir: string;
  declare prevLabel: string;
  declare nextLabel: string;
  declare selectAllLabel: string;

  /** 선택은 **행 객체 동일성**으로 — 정렬·페이징에 흔들리지 않는다 */
  #selected = new Set<JdTableRow>();
  #sortedCache: JdTableRow[] | null = null;
  #sortSignature = "";
  /** 캐시를 만든 원본 배열. data setter가 매번 slice()하므로 참조 비교로 무효화된다 */
  #sortSource: JdTableRow[] | null = null;

  #footer: HTMLElement | null = null;
  #summary: HTMLElement | null = null;
  #prev: HTMLButtonElement | null = null;
  #next: HTMLButtonElement | null = null;

  /** 데이터 원본 순서로 정렬된 선택 행 */
  get selected(): JdTableRow[] {
    return this.rowData.filter((r) => this.#selected.has(r));
  }
  set selected(v: JdTableRow[]) {
    this.#selected = new Set(Array.isArray(v) ? v : []);
    this.requestUpdate();
  }

  protected get gridColumns(): JdDataGridColumn[] {
    return this.columnList as JdDataGridColumn[];
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected override render(): void {
    // 파생 시트를 먼저 채택한다 — super.render()가 곧바로 update()를 부르기 때문에
    // 그 시점에 이미 그리드 기하가 살아 있어야 첫 페인트가 흔들리지 않는다.
    adoptStyles(dataGridStyles);
    super.render(); // 베이스 시트 + 골격 + update()(푸터 refs는 아직 null → 건너뜀)
    this.#mountFooter();
    this.update();
  }

  #mountFooter(): void {
    this.#footer = this.querySelector<HTMLElement>(":scope > .jd-data-grid__footer");
    if (!this.#footer) {
      this.#footer = document.createElement("div");
      this.#footer.className = "jd-data-grid__footer";
      this.#summary = document.createElement("span");
      this.#summary.className = "jd-data-grid__summary";
      const pager = document.createElement("div");
      pager.className = "jd-data-grid__pager";
      this.#prev = this.#buildPagerButton("prev");
      this.#next = this.#buildPagerButton("next");
      pager.append(this.#prev, this.#next);
      this.#footer.append(this.#summary, pager);
      this.append(this.#footer);
      return;
    }
    this.#summary = this.#footer.querySelector(".jd-data-grid__summary");
    this.#prev = this.#footer.querySelector('.jd-data-grid__pager-button[data-dir="prev"]');
    this.#next = this.#footer.querySelector('.jd-data-grid__pager-button[data-dir="next"]');
  }

  #buildPagerButton(dir: "prev" | "next"): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "jd-data-grid__pager-button";
    b.dataset.dir = dir;
    return b;
  }

  protected override connected(): void {
    super.connected();
    this.addEventListener("click", this.#onGridClick);
    this.addEventListener("change", this.#onCheckChange);
  }

  protected override disconnected(): void {
    super.disconnected();
    this.removeEventListener("click", this.#onGridClick);
    this.removeEventListener("change", this.#onCheckChange);
  }

  /* ── 데이터 파생 ──────────────────────────────────────────────────── */

  /** v2 알고리즘 그대로 — 문자열 localeCompare(numeric) */
  protected sortedRows(): JdTableRow[] {
    const key = this.sortKey;
    const signature = `${key}|${this.sortDir}`;
    if (this.#sortedCache && this.#sortSignature === signature && this.#sortSource === this.rowData) {
      return this.#sortedCache;
    }
    let out: JdTableRow[];
    if (!key) {
      out = this.rowData;
    } else {
      const sign = this.sortDir === "desc" ? -1 : 1;
      out = this.rowData
        .slice()
        .sort(
          (a, b) =>
            sign * String(a[key]).localeCompare(String(b[key]), undefined, { numeric: true }),
        );
    }
    this.#sortedCache = out;
    this.#sortSignature = signature;
    this.#sortSource = this.rowData;
    return out;
  }

  protected get resolvedPageSize(): number {
    return Math.max(1, Math.floor(this.pageSize) || 1);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.rowData.length / this.resolvedPageSize));
  }

  protected clampPage(n: number): number {
    return Math.min(Math.max(1, Math.floor(n) || 1), this.totalPages);
  }

  protected override visibleRows(): JdTableVisibleRow[] {
    const sorted = this.sortedRows();
    const size = this.resolvedPageSize;
    const start = (this.clampPage(this.page) - 1) * size;
    return sorted
      .slice(start, start + size)
      .map((row, i) => ({ row, index: start + i })); // index = 정렬본 좌표
  }

  protected override rowAt(index: number): JdTableRow | undefined {
    return Number.isInteger(index) ? this.sortedRows()[index] : undefined;
  }

  protected override get columnSpan(): number {
    return super.columnSpan + (this.selectable ? 1 : 0);
  }

  /* ── 골격: 선택 열 + 정렬 머리 ────────────────────────────────────── */

  protected override buildHeadCells(tr: HTMLTableRowElement): void {
    if (this.selectable) tr.append(this.#buildSelectAllCell());
    super.buildHeadCells(tr);
  }

  #buildSelectAllCell(): HTMLTableCellElement {
    const th = document.createElement("th");
    th.scope = "col";
    th.className = "jd-table__th jd-data-grid__select-cell";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "jd-data-grid__check jd-data-grid__check--all";
    th.append(input);
    return th;
  }

  protected override buildHeadCell(col: JdTableColumn): HTMLTableCellElement {
    const th = super.buildHeadCell(col);
    if (!(col as JdDataGridColumn).sortable) return th;
    th.textContent = "";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "jd-data-grid__sort";
    btn.dataset.key = col.key;
    const label = document.createElement("span");
    label.className = "jd-data-grid__sort-label";
    label.textContent = col.header;
    const icon = document.createElement("span");
    icon.className = "jd-data-grid__sort-icon";
    btn.append(label, icon);
    th.append(btn);
    return th;
  }

  protected override buildRowCells(
    tr: HTMLTableRowElement,
    row: JdTableRow,
    index: number,
  ): void {
    if (this.selectable) tr.append(this.#buildSelectCell(index));
    super.buildRowCells(tr, row, index);
  }

  #buildSelectCell(index: number): HTMLTableCellElement {
    const td = document.createElement("td");
    td.className = "jd-table__td jd-data-grid__select-cell";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "jd-data-grid__check jd-data-grid__check--row";
    input.dataset.index = String(index);
    td.append(input);
    return td;
  }

  /* ── 상호작용 ─────────────────────────────────────────────────────── */

  #onGridClick = (e: Event): void => {
    const el = (e.target as Element | null)?.closest("button");
    if (!el || !this.contains(el)) return;
    if (el.classList.contains("jd-data-grid__sort")) {
      const key = el.dataset.key;
      if (key) this.toggleSort(key);
      return;
    }
    if (el.classList.contains("jd-data-grid__pager-button")) {
      this.goToPage(this.clampPage(this.page) + (el.dataset.dir === "next" ? 1 : -1));
    }
  };

  #onCheckChange = (e: Event): void => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (!input.classList.contains("jd-data-grid__check")) return;
    if (input.classList.contains("jd-data-grid__check--all")) {
      this.togglePageSelection(input.checked);
      return;
    }
    const row = this.rowAt(Number(input.dataset.index));
    if (!row) return;
    if (input.checked) this.#selected.add(row);
    else this.#selected.delete(row);
    this.emitSelection();
    this.requestUpdate();
  };

  toggleSort(key: string): void {
    if (this.sortKey === key) this.sortDir = this.sortDir === "asc" ? "desc" : "asc";
    else {
      this.sortKey = key;
      this.sortDir = "asc";
    }
    this.#sortedCache = null;
    this.bodyDirty = true;
    this.emit("jd-sort", { key: this.sortKey, direction: this.sortDir as JdSortDirection });
    this.requestUpdate();
  }

  goToPage(next: number): void {
    const page = this.clampPage(next);
    if (page === this.clampPage(this.page)) return;
    this.page = page;
    this.bodyDirty = true;
    this.emit("jd-page", { page, totalPages: this.totalPages });
    this.requestUpdate();
  }

  /** v2 toggleAll 동형 — 대상은 **현재 페이지**다 */
  togglePageSelection(select: boolean): void {
    for (const { row } of this.visibleRows()) {
      if (select) this.#selected.add(row);
      else this.#selected.delete(row);
    }
    this.emitSelection();
    this.requestUpdate();
  }

  protected emitSelection(): void {
    this.emit("jd-change", { selected: this.selected });
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    // 데이터가 줄어 현재 페이지가 사라졌으면 끌어올린다 (같을 때만 대입 — 무한 루프 방지)
    const page = this.clampPage(this.page);
    if (page !== this.page) this.page = page;
    super.update();
    this.#syncFooter(page);
  }

  protected override syncHead(): void {
    const heads = this.headRow.querySelectorAll<HTMLTableCellElement>("th.jd-table__th");
    for (const th of heads) {
      const btn = th.querySelector<HTMLButtonElement>(".jd-data-grid__sort");
      if (!btn) continue;
      const active = btn.dataset.key === this.sortKey && Boolean(this.sortKey);
      const dir = this.sortDir === "desc" ? "descending" : "ascending";
      th.setAttribute("aria-sort", active ? dir : "none");
      const icon = btn.querySelector<HTMLElement>(".jd-data-grid__sort-icon");
      if (icon) {
        // v2도 활성 열에서만 화살표를 그렸다
        icon.innerHTML = active ? (this.sortDir === "desc" ? SORT_DESC_SVG : SORT_ASC_SVG) : "";
      }
    }
    const all = this.headRow.querySelector<HTMLInputElement>(".jd-data-grid__check--all");
    if (all) {
      const rows = this.visibleRows();
      const picked = rows.filter(({ row }) => this.#selected.has(row)).length;
      all.checked = rows.length > 0 && picked === rows.length;
      all.indeterminate = picked > 0 && picked < rows.length;
      all.setAttribute("aria-label", this.selectAllLabel);
      all.disabled = rows.length === 0;
    }
  }

  protected override syncRows(): void {
    super.syncRows();
    // aria-rowcount는 머리 행 1개를 포함한다(APG) — 페이징으로 잘려도
    // "전체 N행 중 몇 번째"가 현재 정렬 순서 기준으로 AT에 남는다
    this.tableEl.setAttribute("aria-rowcount", String(this.rowData.length + 1));
    const rows = this.bodyEl.querySelectorAll<HTMLTableRowElement>(":scope > tr.jd-table__row");
    for (const tr of rows) {
      if (tr.classList.contains("jd-table__row--empty")) continue;
      const index = Number(tr.dataset.index);
      tr.setAttribute("aria-rowindex", String(index + 2));
      const row = this.rowAt(index);
      const picked = Boolean(row && this.#selected.has(row));
      tr.toggleAttribute("data-selected", picked);
      const check = tr.querySelector<HTMLInputElement>(".jd-data-grid__check--row");
      if (check) {
        check.checked = picked;
        check.setAttribute("aria-label", `${index + 1}번째 행 선택`);
      }
    }
  }

  #syncFooter(page: number): void {
    const footer = this.#footer;
    if (!footer) return;
    const total = this.rowData.length;
    const totalPages = this.totalPages;
    // v2: totalPages <= 1이면 푸터를 그리지 않았다
    footer.hidden = totalPages <= 1;
    const size = this.resolvedPageSize;
    const from = total === 0 ? 0 : (page - 1) * size + 1;
    const to = Math.min(page * size, total);
    if (this.#summary) this.#summary.textContent = `${total}개 중 ${from}-${to}`;
    if (this.#prev) {
      this.#prev.textContent = this.prevLabel;
      this.#prev.disabled = page <= 1;
    }
    if (this.#next) {
      this.#next.textContent = this.nextLabel;
      this.#next.disabled = page >= totalPages;
    }
  }
}
