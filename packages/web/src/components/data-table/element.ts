/**
 * <jd-data-table> — 검색·밀도·내보내기·행번호가 붙은 고급 데이터 테이블
 * (v2 patterns/DataTable) = **jd-data-grid 파생**.
 *
 * v2 DataTable(1192줄)은 Table→DataGrid가 이미 가진 정렬·선택·페이징 위에 글로벌 검색,
 * 밀도, CSV/JSON 내보내기, 행 번호, 로딩 스켈레톤 등을 얹은 것이었다. v3는 그 계보를 그대로
 * 살려 골격·정렬 머리·선택 열·페이징 푸터·행 활성화·입양 규칙을 jd-data-grid가 전부 갖고,
 * 여기서는 §6 R12대로 **툴바(검색·밀도·내보내기) · 행 번호 열 · 로딩 스켈레톤**만 얹는다.
 *
 * 검색 설계(핵심): v2는 filter→sort→paginate 순서였다. v3는 원본을 `#master`에 두고
 * 검색으로 거른 부분집합을 베이스(jd-data-grid)의 `rowData`로 **주입**한다 — 그러면
 * 정렬·페이징·푸터 요약·총 페이지 수가 전부 '걸러진 집합' 위에서 그대로 성립한다(베이스
 * 코드를 건드리지 않고 v2 파이프라인을 재현). `data` 프로퍼티는 언제나 원본 전량을 돌려준다.
 *
 * v2 대비 교정 5건:
 * 1. **검색이 접근 이름 없는 input이었다.** type=search + aria-label(placeholder)로 이름을 준다.
 * 2. **밀도 메뉴가 버튼 그룹인데 상태 표시가 없었다.** 세그먼트 버튼에 `aria-pressed`로 현재
 *    밀도를 알린다.
 * 3. **행 번호가 데이터 셀처럼 보였다.** 번호 열 머리를 `scope=col`로, 셀은 `--jd-color-muted`
 *    보조 색으로 내려 데이터와 구분한다.
 * 4. **로딩이 조용했다.** 표에 `aria-busy`, 스켈레톤 행은 `aria-hidden`으로 낭독에서 뺀다.
 * 5. **내보내기가 렌더된 노드를 못 읽었다.** v2 exportCSV는 render 결과가 문자열일 때만
 *    담았다 — v3는 render 문자열 우선, 없으면 원본 값 문자열로 폴백해 더 많은 열을 담는다
 *    (검색 매칭도 같은 규칙 — 두 기능의 '셀 텍스트' 정의를 하나로 통일).
 *
 * 의도적 후속 과제(v2에 있으나 이 배치에서 미구현 — 별도 파생/후속): 컬럼 리사이즈·숨김·고정,
 * 인라인 편집, 멀티소트, 컬럼 그룹핑, 가상 스크롤, 컨텍스트 메뉴, 행 드래그·핀, 풀스크린,
 * 벌크 액션, 컬럼별 필터, 서버사이드 모드. 골격이 jd-data-grid로 통일돼 있어 이후 파생으로 얹는다.
 */
import { JdDataGrid } from "../data-grid/element.js";
import type { JdTableColumn, JdTableRow } from "../table/element.js";
import { adoptStyles } from "../../core/styles.js";
import dataTableStyles from "./data-table.css.js";

export type JdDensity = "compact" | "normal" | "comfortable";

const DENSITIES: JdDensity[] = ["compact", "normal", "comfortable"];
const DENSITY_LABEL: Record<JdDensity, string> = {
  compact: "좁게",
  normal: "보통",
  comfortable: "넓게",
};

const SEARCH_ICON =
  `<svg class="jd-data-table__search-icon" width="14" height="14" viewBox="0 0 14 14" ` +
  `fill="none" aria-hidden="true" focusable="false">` +
  `<circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.5"/>` +
  `<path d="M9.5 9.5L13 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const CLEAR_ICON =
  `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">` +
  `<path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

/** CSV 필드 이스케이프 — 구분자/따옴표/개행이 있으면 감싸고 따옴표 이중화 */
function csvField(s: string): string {
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** 사용자 클릭으로 시작되는 파일 저장 — Blob + 임시 앵커 */
function downloadText(text: string, filename: string, mime: string): void {
  if (typeof document === "undefined" || typeof URL === "undefined") return;
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export class JdDataTable extends JdDataGrid {
  static override tag = "jd-data-table";
  static override props = {
    ...JdDataGrid.props,
    /** 툴바 글로벌 검색 표시 */
    searchable: { type: Boolean, reflect: true },
    /** 검색어 — filter→sort→paginate의 filter 단계 */
    search: { type: String },
    searchPlaceholder: { type: String, default: "테이블 검색..." }, // attr: search-placeholder
    /** compact | normal | comfortable (v2 기본 normal) */
    density: { type: String, default: "normal", reflect: true },
    /** 밀도 세그먼트 버튼 표시 */
    densityToggle: { type: Boolean, reflect: true }, // attr: density-toggle
    /** 왼쪽에 1-base 행 번호 열 */
    showRowNumbers: { type: Boolean, reflect: true }, // attr: show-row-numbers
    rowNumberHeader: { type: String, default: "#" }, // attr: row-number-header
    /** CSV/JSON 내보내기 버튼 표시 */
    exportable: { type: Boolean, reflect: true },
    exportFilename: { type: String, default: "data" }, // attr: export-filename
    /** 로딩 — 스켈레톤 행 + aria-busy */
    loading: { type: Boolean, reflect: true },
  };

  declare searchable: boolean;
  declare search: string;
  declare searchPlaceholder: string;
  declare density: string;
  declare densityToggle: boolean;
  declare showRowNumbers: boolean;
  declare rowNumberHeader: string;
  declare exportable: boolean;
  declare exportFilename: string;
  declare loading: boolean;

  /** 검색 이전 원본 전량 — data 프로퍼티의 진짜 소스 */
  #master: JdTableRow[] = [];
  #appliedSearch = "";
  #appliedLoading = false;
  #appliedRowNumbers = false;

  #toolbar: HTMLElement | null = null;
  #searchWrap: HTMLElement | null = null;
  #searchInput: HTMLInputElement | null = null;
  #searchClear: HTMLButtonElement | null = null;
  #densityGroup: HTMLElement | null = null;
  #exportGroup: HTMLElement | null = null;

  /* ── data: 원본은 #master, rowData엔 걸러진 부분집합을 주입 ──────────── */

  override get data(): JdTableRow[] {
    return this.#master;
  }
  override set data(v: JdTableRow[]) {
    this.#master = Array.isArray(v) ? v.slice() : [];
    this.#recomputeFiltered();
    this.requestUpdate();
  }

  /** 현재 검색어로 #master를 걸러 베이스의 rowData에 주입 — 정렬/페이징이 그 위에서 성립 */
  #recomputeFiltered(): void {
    const q = this.search.trim().toLowerCase();
    const rows = q
      ? this.#master.filter((row) => this.columnList.some((col) => this.#cellText(col, row).toLowerCase().includes(q)))
      : this.#master;
    this.rowData = rows; // 새 배열 참조 → 베이스 정렬 캐시가 참조 비교로 무효화된다
    this.bodyDirty = true;
  }

  /** 검색/내보내기 공통 '셀 텍스트' 정의(교정 5): render 문자열 우선, 없으면 원본 값 */
  #cellText(col: JdTableColumn, row: JdTableRow): string {
    const value = row[col.key];
    if (col.render) {
      const out = col.render(value, row, 0);
      if (typeof out === "string" || typeof out === "number") return String(out);
    }
    return value === null || value === undefined ? "" : String(value);
  }

  protected override readJsonSlot(): void {
    super.readJsonSlot(); // columns/data를 rowData·columnList에 채운다
    if (this.#master.length === 0 && this.rowData.length > 0) {
      this.#master = this.rowData.slice();
      this.#recomputeFiltered();
    }
  }

  /* ── 렌더: 툴바 마운트 ────────────────────────────────────────────── */

  protected override render(): void {
    adoptStyles(dataTableStyles);
    super.render(); // 베이스(그리드) 시트 + 골격 + 푸터 + update()
    this.#mountToolbar();
    this.update();
  }

  #mountToolbar(): void {
    this.#toolbar = this.querySelector<HTMLElement>(":scope > .jd-data-table__toolbar");
    if (this.#toolbar) {
      this.#searchWrap = this.#toolbar.querySelector(".jd-data-table__search");
      this.#searchInput = this.#toolbar.querySelector(".jd-data-table__search-input");
      this.#searchClear = this.#toolbar.querySelector(".jd-data-table__search-clear");
      this.#densityGroup = this.#toolbar.querySelector(".jd-data-table__density");
      this.#exportGroup = this.#toolbar.querySelector(".jd-data-table__export");
      return;
    }
    const bar = document.createElement("div");
    bar.className = "jd-data-table__toolbar";

    // 검색
    this.#searchWrap = document.createElement("div");
    this.#searchWrap.className = "jd-data-table__search";
    this.#searchWrap.insertAdjacentHTML("afterbegin", SEARCH_ICON);
    this.#searchInput = document.createElement("input");
    this.#searchInput.type = "search";
    this.#searchInput.className = "jd-data-table__search-input";
    this.#searchClear = document.createElement("button");
    this.#searchClear.type = "button";
    this.#searchClear.className = "jd-data-table__search-clear";
    this.#searchClear.setAttribute("aria-label", "검색어 지우기");
    this.#searchClear.innerHTML = CLEAR_ICON;
    this.#searchWrap.append(this.#searchInput, this.#searchClear);

    // 밀도 세그먼트
    this.#densityGroup = document.createElement("div");
    this.#densityGroup.className = "jd-data-table__density";
    this.#densityGroup.setAttribute("role", "group");
    this.#densityGroup.setAttribute("aria-label", "행 밀도");
    for (const d of DENSITIES) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "jd-data-table__density-button";
      b.dataset.density = d;
      b.textContent = DENSITY_LABEL[d];
      this.#densityGroup.append(b);
    }

    // 내보내기
    this.#exportGroup = document.createElement("div");
    this.#exportGroup.className = "jd-data-table__export";
    for (const fmt of ["csv", "json"] as const) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "jd-data-table__export-button";
      b.dataset.format = fmt;
      b.textContent = fmt.toUpperCase();
      this.#exportGroup.append(b);
    }

    const spacer = document.createElement("div");
    spacer.className = "jd-data-table__toolbar-spacer";

    bar.append(this.#searchWrap, spacer, this.#densityGroup, this.#exportGroup);
    this.#toolbar = bar;
    this.prepend(bar); // 스크롤러 앞
  }

  protected override connected(): void {
    super.connected();
    this.#searchInput?.addEventListener("input", this.#onSearchInput);
    this.#searchClear?.addEventListener("click", this.#onSearchClear);
    this.#toolbar?.addEventListener("click", this.#onToolbarClick);
  }

  protected override disconnected(): void {
    super.disconnected();
    this.#searchInput?.removeEventListener("input", this.#onSearchInput);
    this.#searchClear?.removeEventListener("click", this.#onSearchClear);
    this.#toolbar?.removeEventListener("click", this.#onToolbarClick);
  }

  #onSearchInput = (): void => {
    this.search = this.#searchInput!.value; // setter → update()가 검색 변화를 잡아 필터+페이지1
  };

  #onSearchClear = (): void => {
    this.search = "";
    this.#searchInput?.focus();
  };

  #onToolbarClick = (e: Event): void => {
    const btn = (e.target as Element | null)?.closest("button");
    if (!btn || !this.#toolbar!.contains(btn)) return;
    if (btn.classList.contains("jd-data-table__density-button")) {
      this.density = btn.dataset.density!;
    } else if (btn.classList.contains("jd-data-table__export-button")) {
      this.#export(btn.dataset.format as "csv" | "json");
    }
  };

  #export(format: "csv" | "json"): void {
    const rows = this.sortedRows(); // 걸러진 + 정렬된 전량(현재 페이지 아님 — v2 동형)
    const name = this.exportFilename || "data";
    if (format === "json") {
      downloadText(JSON.stringify(rows, null, 2), `${name}.json`, "application/json");
    } else {
      const cols = this.columnList;
      const header = cols.map((c) => csvField(c.header));
      const body = rows.map((r) => cols.map((c) => csvField(this.#cellText(c, r))));
      const text = [header, ...body].map((line) => line.join(",")).join("\r\n");
      // BOM — Excel의 CJK 깨짐 방지
      downloadText(`﻿${text}`, `${name}.csv`, "text/csv;charset=utf-8");
    }
    this.emit("jd-export", { format, count: rows.length });
  }

  /* ── 행 번호 열 (선택 열 앞) ──────────────────────────────────────── */

  protected override get columnSpan(): number {
    return super.columnSpan + (this.showRowNumbers ? 1 : 0);
  }

  protected override buildHeadCells(tr: HTMLTableRowElement): void {
    if (this.showRowNumbers) {
      const th = document.createElement("th");
      th.scope = "col";
      th.className = "jd-table__th jd-data-table__num-cell";
      th.textContent = this.rowNumberHeader || "#";
      tr.append(th);
    }
    super.buildHeadCells(tr); // 그리드: 선택 열 + 데이터 머리
  }

  protected override buildRowCells(tr: HTMLTableRowElement, row: JdTableRow, index: number): void {
    if (this.showRowNumbers) {
      const td = document.createElement("td");
      td.className = "jd-table__td jd-data-table__num-cell";
      td.textContent = String(index + 1); // index = 정렬본 좌표 = 표시 순번
      tr.append(td);
    }
    super.buildRowCells(tr, row, index);
  }

  /* ── 로딩 스켈레톤 ────────────────────────────────────────────────── */

  protected override rebuildBody(): void {
    if (this.loading) {
      this.#renderSkeleton();
      return;
    }
    super.rebuildBody();
  }

  #renderSkeleton(): void {
    this.bodyEl.textContent = "";
    const rowCount = Math.min(this.resolvedPageSize, 5);
    const span = this.columnSpan;
    for (let r = 0; r < rowCount; r++) {
      const tr = document.createElement("tr");
      // .jd-table__row는 일부러 붙이지 않는다 — syncRows/행 활성화가 스켈레톤을
      // tabindex·aria-rowindex 대상으로 삼지 않도록(구분선은 CSS가 이 클래스로 준다)
      tr.className = "jd-data-table__skeleton-row";
      tr.setAttribute("aria-hidden", "true");
      for (let c = 0; c < span; c++) {
        const td = document.createElement("td");
        td.className = "jd-table__td";
        const bar = document.createElement("span");
        bar.className = "jd-data-table__skeleton";
        td.append(bar);
        tr.append(td);
      }
      this.bodyEl.append(tr);
    }
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    // 검색 변화 → 필터 재계산 + 페이지 1 (super.update 전에 rowData가 갱신돼야 visibleRows가 맞다)
    if (this.search !== this.#appliedSearch) {
      this.#appliedSearch = this.search;
      this.#recomputeFiltered();
      this.page = 1; // setter가 requestUpdate를 걸지만 다음 사이클에서 검색이 같아 값싸게 끝난다
    }
    // 로딩·행번호 토글은 본문/머리 재구축이 필요
    if (this.loading !== this.#appliedLoading) {
      this.#appliedLoading = this.loading;
      this.bodyDirty = true;
    }
    if (this.showRowNumbers !== this.#appliedRowNumbers) {
      this.#appliedRowNumbers = this.showRowNumbers;
      this.headDirty = true;
      this.bodyDirty = true;
    }

    super.update(); // 그리드: 페이지 클램프 + 머리/본문 재구축(dirty 시) + 푸터

    // aria-busy는 "true" 토큰이라야 로딩으로 읽힌다(빈 문자열은 false로 처리됨) — 명시 설정/제거
    if (this.loading) this.tableEl.setAttribute("aria-busy", "true");
    else this.tableEl.removeAttribute("aria-busy");
    this.#syncToolbar();
  }

  #syncToolbar(): void {
    const bar = this.#toolbar;
    if (!bar) return;
    const showSearch = this.searchable;
    const showDensity = this.densityToggle;
    const showExport = this.exportable;
    bar.hidden = !showSearch && !showDensity && !showExport;

    if (this.#searchWrap) this.#searchWrap.hidden = !showSearch;
    if (this.#searchInput) {
      this.#searchInput.placeholder = this.searchPlaceholder;
      this.#searchInput.setAttribute("aria-label", this.searchPlaceholder || "테이블 검색");
      if (this.#searchInput.value !== this.search) this.#searchInput.value = this.search;
    }
    if (this.#searchClear) this.#searchClear.hidden = this.search.length === 0;

    if (this.#densityGroup) {
      this.#densityGroup.hidden = !showDensity;
      for (const b of this.#densityGroup.querySelectorAll<HTMLButtonElement>(".jd-data-table__density-button")) {
        const active = b.dataset.density === this.density;
        b.setAttribute("aria-pressed", String(active));
        b.toggleAttribute("data-active", active);
      }
    }
    if (this.#exportGroup) this.#exportGroup.hidden = !showExport;
  }
}
