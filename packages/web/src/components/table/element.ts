/**
 * <jd-table> — 컬럼 정의 + 데이터 행으로 구성된 기본 테이블 (v2 composites/Table).
 *
 * 데이터 입력 2경로(§1.3 — 복합 데이터는 attribute 금지):
 *  1. `columns` / `data` 프로퍼티
 *  2. 자식 `<script type="application/json">{"columns":[…],"data":[…]}</script>`
 *     (배열만 주면 data로 읽는다. DEC-023-3 선례)
 *
 * v2 대비 교정 5건:
 *  1. **표에 이름이 없었다.** `<caption>`(+ captionHidden)으로 접근 이름을 준다.
 *  2. **th에 scope가 없었다.** 열 머리임을 `scope="col"`로 명시 — 셀-머리 연결이 생긴다.
 *  3. **행 클릭이 마우스 전용이었다.** v2는 `onRowClick`을 `<tr>` onClick으로만 걸어
 *     키보드 사용자에게 아예 닿지 않았다. v3는 `row-clickable`일 때 행을 포커스 가능
 *     하게 만들고 Enter/Space를 같은 활성화로 처리한다(`jd-select`).
 *  4. **행 안의 컨트롤과 행 활성화가 겹쳤다.** 셀 안 button/input/a/select/textarea에서
 *     시작된 클릭은 행 활성화로 올리지 않는다(파생 jd-data-grid의 체크박스 대응).
 *  5. **maxHeight가 stickyHeader와 묶여 있었다.** v2는 둘 다 줘야 스크롤 박스가 됐다 —
 *     v3는 max-height만으로 세로 스크롤이 성립하고 sticky는 독립 모디파이어다.
 *
 * 골격은 `호스트 > .jd-table__scroll > table.jd-table`이다. v2는 래퍼 1겹이었지만
 * 파생 jd-data-grid의 푸터가 가로 스크롤에 딸려가지 않으려면 스크롤러가 안쪽에
 * 있어야 한다(v2 DataGrid도 같은 2겹이었다) — 두 컴포넌트의 골격을 여기서 통일한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import tableStyles from "./table.css.js";

export type JdTableAlign = "left" | "center" | "right";
export type JdTableRow = Record<string, unknown>;
/** 셀 내용 — 문자열/숫자는 텍스트로, Node는 그대로 삽입 */
export type JdTableCell = string | number | Node | null | undefined;

export interface JdTableColumn {
  key: string;
  header: string;
  /** 셀 렌더러. v2 `(value, row)` + 인덱스 추가 */
  render?: (value: unknown, row: JdTableRow, index: number) => JdTableCell;
  /** 셀에 얹을 추가 클래스 */
  className?: string;
  align?: JdTableAlign;
  /** 열 너비 — 숫자는 px */
  width?: number | string;
}

export interface JdTableVisibleRow {
  row: JdTableRow;
  /** 데이터 원본(또는 정렬본) 기준 인덱스 — 페이징돼도 연속하지 않는다 */
  index: number;
}

const SIZES = new Set(["sm", "md", "lg"]);
/** 셀 안에서 자기 몫의 클릭을 갖는 요소 — 행 활성화로 올리지 않는다 */
const INTERACTIVE = "button, a[href], input, select, textarea";

/** 숫자면 px, 숫자 문자열도 px, 나머지는 CSS 길이 그대로 (v2 maxHeight 규칙 승계) */
export function jdCssLength(v: number | string | null | undefined): string {
  if (v === null || v === undefined || v === "") return "";
  if (typeof v === "number") return Number.isFinite(v) ? `${v}px` : "";
  const t = v.trim();
  return /^-?\d+(\.\d+)?$/.test(t) ? `${t}px` : t;
}

export class JdTable extends JdElement {
  static override tag = "jd-table";
  static override props = {
    /** sm | md | lg. 미지정이면 compact에 따라 sm/md (v2 폴백 규칙) */
    size: { type: String, default: "" },
    striped: { type: Boolean, reflect: true },
    hoverable: { type: Boolean, reflect: true },
    /** v2 하위호환 — size 미지정 시에만 sm으로 해석된다 */
    compact: { type: Boolean, reflect: true },
    stickyHeader: { type: Boolean, reflect: true }, // attr: sticky-header
    /** 스크롤 박스 최대 높이. 숫자 문자열은 px */
    maxHeight: { type: String }, // attr: max-height
    bordered: { type: Boolean, reflect: true },
    /** 행 활성화 허용 — 포커스 가능해지고 jd-select를 낸다 */
    rowClickable: { type: Boolean, reflect: true }, // attr: row-clickable
    emptyMessage: { type: String, default: "데이터가 없습니다" },
    /** 표 접근 이름 (<caption>) */
    caption: { type: String },
    /** caption을 시각적으로만 감춤 — 이름은 남는다 */
    captionHidden: { type: Boolean, reflect: true }, // attr: caption-hidden
  };

  declare size: string;
  declare striped: boolean;
  declare hoverable: boolean;
  declare compact: boolean;
  declare stickyHeader: boolean;
  declare maxHeight: string;
  declare bordered: boolean;
  declare rowClickable: boolean;
  declare emptyMessage: string;
  declare caption: string;
  declare captionHidden: boolean;

  protected columnList: JdTableColumn[] = [];
  protected rowData: JdTableRow[] = [];
  /** 골격 재구축 필요 표시 — 값 setter가 세운다(transfer의 renderedKey와 같은 역할) */
  protected headDirty = true;
  protected bodyDirty = true;

  protected scrollEl!: HTMLElement;
  protected tableEl!: HTMLTableElement;
  protected captionEl!: HTMLTableCaptionElement;
  protected headRow!: HTMLTableRowElement;
  protected bodyEl!: HTMLTableSectionElement;

  get columns(): JdTableColumn[] {
    return this.columnList;
  }
  set columns(v: JdTableColumn[]) {
    this.columnList = Array.isArray(v) ? v.slice() : [];
    this.headDirty = true;
    this.bodyDirty = true;
    this.requestUpdate();
  }

  get data(): JdTableRow[] {
    return this.rowData;
  }
  set data(v: JdTableRow[]) {
    this.rowData = Array.isArray(v) ? v.slice() : [];
    this.bodyDirty = true;
    this.requestUpdate();
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(tableStyles);
    this.upgradeOwnProp("columns");
    this.upgradeOwnProp("data");
    this.readJsonSlot();
    const existing = this.querySelector<HTMLElement>(":scope > .jd-table__scroll");
    this.scrollEl = existing ?? this.buildSkeleton();
    this.tableEl = this.scrollEl.querySelector<HTMLTableElement>("table.jd-table")!;
    this.captionEl = this.tableEl.querySelector<HTMLTableCaptionElement>(
      "caption.jd-table__caption",
    )!;
    this.headRow = this.tableEl.querySelector<HTMLTableRowElement>(
      "thead > tr.jd-table__head-row",
    )!;
    this.bodyEl = this.tableEl.querySelector<HTMLTableSectionElement>("tbody.jd-table__body")!;
    this.update();
  }

  /** 접근자 프로퍼티는 베이스 #upgradeProps(static props 전용)가 회수하지 못한다 */
  protected upgradeOwnProp(name: string): void {
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
      const parsed: unknown = JSON.parse(script.textContent);
      if (Array.isArray(parsed)) {
        this.rowData = parsed as JdTableRow[];
      } else if (parsed && typeof parsed === "object") {
        const o = parsed as { columns?: unknown; data?: unknown };
        if (Array.isArray(o.columns)) this.columnList = o.columns as JdTableColumn[];
        if (Array.isArray(o.data)) this.rowData = o.data as JdTableRow[];
      }
    } catch {
      console.warn("[junds] <jd-table> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected buildSkeleton(): HTMLElement {
    const scroll = document.createElement("div");
    scroll.className = "jd-table__scroll";
    const table = document.createElement("table");
    table.className = "jd-table";
    const caption = document.createElement("caption");
    caption.className = "jd-table__caption";
    caption.hidden = true;
    const head = document.createElement("thead");
    head.className = "jd-table__head";
    const headRow = document.createElement("tr");
    headRow.className = "jd-table__head-row";
    head.append(headRow);
    const body = document.createElement("tbody");
    body.className = "jd-table__body";
    table.append(caption, head, body);
    scroll.append(table);
    this.append(scroll);
    return scroll;
  }

  protected override connected(): void {
    this.addEventListener("click", this.onRootClick);
    this.addEventListener("keydown", this.onRootKeydown);
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.onRootClick);
    this.removeEventListener("keydown", this.onRootKeydown);
  }

  /* ── 행 활성화 ────────────────────────────────────────────────────── */

  protected onRootClick = (e: Event): void => {
    if (!this.rowClickable) return;
    const target = e.target as Element | null;
    if (!target || target.closest(INTERACTIVE)) return; // 셀 안 컨트롤이 먹은 클릭
    this.activateRowFrom(target);
  };

  /** Enter/Space는 포커스된 행에서만 — 셀 안 컨트롤의 기본 동작을 뺏지 않는다 */
  protected onRootKeydown = (e: Event): void => {
    if (!this.rowClickable) return;
    const ev = e as KeyboardEvent;
    if (ev.key !== "Enter" && ev.key !== " " && ev.key !== "Spacebar") return;
    const target = ev.target as Element | null;
    if (!target || !target.classList.contains("jd-table__row")) return;
    ev.preventDefault(); // Space 스크롤 차단
    this.activateRowFrom(target);
  };

  protected activateRowFrom(target: Element): void {
    const tr = target.closest<HTMLTableRowElement>("tr.jd-table__row");
    if (!tr || !this.bodyEl.contains(tr) || tr.classList.contains("jd-table__row--empty")) return;
    const index = Number(tr.dataset.index);
    const row = this.rowAt(index);
    if (!row) return;
    this.emit("jd-select", { row, index });
  }

  /** index → 행 객체. 파생이 정렬본을 쓰면 여기서 갈아끼운다 */
  protected rowAt(index: number): JdTableRow | undefined {
    return Number.isInteger(index) ? this.rowData[index] : undefined;
  }

  /* ── 골격 구축 ────────────────────────────────────────────────────── */

  /** 화면에 그릴 행 — 파생(jd-data-grid)이 정렬·페이징으로 갈아끼운다 */
  protected visibleRows(): JdTableVisibleRow[] {
    return this.rowData.map((row, index) => ({ row, index }));
  }

  protected get columnSpan(): number {
    return Math.max(1, this.columnList.length);
  }

  protected rebuildHead(): void {
    this.headRow.textContent = "";
    this.buildHeadCells(this.headRow);
  }

  protected buildHeadCells(tr: HTMLTableRowElement): void {
    for (const col of this.columnList) tr.append(this.buildHeadCell(col));
  }

  protected buildHeadCell(col: JdTableColumn): HTMLTableCellElement {
    const th = document.createElement("th");
    th.scope = "col";
    th.className = "jd-table__th";
    th.dataset.key = col.key;
    this.applyCellShape(th, col);
    th.textContent = col.header;
    return th;
  }

  protected rebuildBody(): void {
    this.bodyEl.textContent = "";
    const rows = this.visibleRows();
    if (rows.length === 0) {
      this.bodyEl.append(this.buildEmptyRow());
      return;
    }
    for (const entry of rows) this.bodyEl.append(this.buildBodyRow(entry.row, entry.index));
  }

  protected buildBodyRow(row: JdTableRow, index: number): HTMLTableRowElement {
    const tr = document.createElement("tr");
    tr.className = "jd-table__row";
    tr.dataset.index = String(index);
    this.buildRowCells(tr, row, index);
    return tr;
  }

  protected buildRowCells(tr: HTMLTableRowElement, row: JdTableRow, index: number): void {
    for (const col of this.columnList) tr.append(this.buildBodyCell(col, row, index));
  }

  protected buildBodyCell(
    col: JdTableColumn,
    row: JdTableRow,
    index: number,
  ): HTMLTableCellElement {
    const td = document.createElement("td");
    td.className = "jd-table__td";
    this.applyCellShape(td, col);
    this.fillCell(td, col, row, index);
    return td;
  }

  /** 정렬·너비·소비자 클래스 — th/td 공통 */
  protected applyCellShape(cell: HTMLTableCellElement, col: JdTableColumn): void {
    if (col.align) cell.dataset.align = col.align;
    if (col.className) {
      for (const c of col.className.split(/\s+/)) if (c) cell.classList.add(c);
    }
    const width = jdCssLength(col.width);
    if (width) cell.style.width = width;
  }

  /** 셀 내용 — 파생이 다른 render 시그니처를 쓰면 여기만 덮는다 */
  protected fillCell(
    cell: HTMLTableCellElement,
    col: JdTableColumn,
    row: JdTableRow,
    index: number,
  ): void {
    const out = col.render ? col.render(row[col.key], row, index) : (row[col.key] as JdTableCell);
    if (out instanceof Node) cell.append(out);
    else cell.textContent = out === null || out === undefined ? "" : String(out);
  }

  protected buildEmptyRow(): HTMLTableRowElement {
    const tr = document.createElement("tr");
    tr.className = "jd-table__row jd-table__row--empty";
    const td = document.createElement("td");
    td.className = "jd-table__empty";
    td.colSpan = this.columnSpan;
    td.textContent = this.emptyMessage;
    tr.append(td);
    return tr;
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    this.dataset.size = SIZES.has(this.size) ? this.size : this.compact ? "sm" : "md";
    const max = jdCssLength(this.maxHeight);
    if (max) this.style.setProperty("--_jd-table-max-height", max);
    else this.style.removeProperty("--_jd-table-max-height");

    this.captionEl.textContent = this.caption;
    this.captionEl.hidden = !this.caption;
    this.captionEl.classList.toggle("jd-table__caption--hidden", this.captionHidden);

    if (this.headDirty) {
      this.headDirty = false;
      this.rebuildHead();
    }
    if (this.bodyDirty) {
      this.bodyDirty = false;
      this.rebuildBody();
    }
    this.syncHead();
    this.syncRows();
  }

  /** 재구축 없이 머리 상태만 반영 — 파생(정렬 표시)의 훅 */
  protected syncHead(): void {}

  /** 재구축 없이 행 상태만 반영 */
  protected syncRows(): void {
    const rows = this.bodyEl.querySelectorAll<HTMLTableRowElement>(":scope > tr.jd-table__row");
    for (const tr of rows) {
      if (tr.classList.contains("jd-table__row--empty")) continue;
      if (this.rowClickable) tr.tabIndex = 0;
      else tr.removeAttribute("tabindex");
    }
    const empty = this.bodyEl.querySelector<HTMLTableCellElement>(".jd-table__empty");
    if (empty) {
      empty.colSpan = this.columnSpan;
      empty.textContent = this.emptyMessage;
    }
  }
}
