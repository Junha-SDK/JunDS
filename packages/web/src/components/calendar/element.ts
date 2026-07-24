/**
 * <jd-calendar> — 월간/주간 이벤트 캘린더 (v2 patterns/Calendar, export명 DsCalendar).
 * 월/주 뷰, 단일·범위 선택, 이벤트 표시, 월 선택 팝오버, 키보드 로빙 네비, 반응형
 * 컴팩트(도트) 모드.
 *
 * 결정적 render(§3.1-3): "오늘"과 표시 월/주는 connected() 이후 한 번 읽어 주입한다
 * (core/date.ts 규범 1). render()는 골격만 세우고 셀은 update()가 그린다.
 *
 * 제어/비제어 이중 표면을 접었다: v2는 selectedDate/selectedRange가 있으면 제어,
 * 없으면 내부 상태였다. CE는 jd-month-picker 선례대로 **요소가 값을 소유**한다 —
 * 프로퍼티 대입이 곧 값이고, 클릭도 같은 값을 갱신한다(마지막 쓰기 승리 §1.3).
 *
 * 복합 데이터(§1.3): events/selectedDate/selectedRange/minDate/maxDate는 property 전용.
 * events는 자식 `<script type="application/json">` 슬롯도 받는다.
 *
 * 이벤트(§1.5):
 *  - `jd-date-click` {date} — 날짜 클릭(항상)
 *  - `jd-date-select` {date} — 단일 모드 확정
 *  - `jd-range-select` {start, end} — 범위 모드 확정
 *  - `jd-view-change` {view}
 *  - `jd-month-change` {year, month} — 표시 월 변경(0-based month)
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { on } from "../../behaviors/input.js";
import { createSizeObserver } from "../../behaviors/viewport.js";
import type { Behavior } from "../../behaviors/types.js";
import {
  WEEKDAY_LABELS_KO,
  MONTH_LABELS_KO,
  addDays,
  compareDay,
  formatISODate,
  isDayOutOfRange,
  isSameDay,
  toDayStart,
} from "../../core/date.js";
import calendarStyles from "./calendar.css.js";

export interface JdCalendarDayEvent {
  id: string;
  /** "YYYY-MM-DD" */
  date: string;
  label: string;
  color?: string;
  time?: string;
  allDay?: boolean;
}

export interface JdCalendarRange {
  start: Date | null;
  end: Date | null;
}

const CHEVRON_LEFT = `<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M8.5 3l-4 4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CHEVRON_RIGHT = `<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M5.5 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CHEVRON_DOWN = `<svg class="jd-cal__caret" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export class JdCalendar extends JdElement {
  static override tag = "jd-calendar";
  static override props = {
    selectionMode: { type: String, default: "single", attribute: "selection-mode", reflect: true },
    view: { type: String, default: "month", reflect: true }, // month | week
    /** 컴팩트(도트) 전환 폭. v2 300 */
    compactWidth: { type: Number, default: 300, attribute: "compact-width" },
  };

  declare selectionMode: string;
  declare view: string;
  declare compactWidth: number;

  #events: JdCalendarDayEvent[] = [];
  #eventMap = new Map<string, JdCalendarDayEvent[]>();
  #selected: Date | null = null;
  #range: JdCalendarRange = { start: null, end: null };
  #rangeStep: "start" | "end" = "start";
  #min: Date | null = null;
  #max: Date | null = null;

  #today: Date | null = null;
  #current = { year: 0, month: 0 };
  #weekAnchor: Date | null = null;
  #focused: Date | null = null;
  #isCompact = false;
  #pendingFocus = false;
  #pickerOpen = false;
  #pickerYear = 0;

  #root!: HTMLElement;
  #monthBtn!: HTMLButtonElement;
  #monthLabel!: HTMLElement;
  #grid!: HTMLElement;
  #picker!: HTMLElement;
  #pickerYearLabel!: HTMLElement;
  #sizeObs: Behavior | null = null;
  #offPickerOutside: (() => void) | null = null;

  /* ── 프로퍼티 표면 ─────────────────────────────────────────────────── */

  get events(): JdCalendarDayEvent[] {
    return this.#events;
  }
  set events(v: JdCalendarDayEvent[]) {
    this.#events = Array.isArray(v) ? v.map((e) => ({ ...e })) : [];
    this.#rebuildEventMap();
    this.requestUpdate();
  }

  get selectedDate(): Date | null {
    return this.#selected;
  }
  set selectedDate(v: Date | null) {
    this.#selected = v instanceof Date && !Number.isNaN(v.getTime()) ? toDayStart(v) : null;
    this.requestUpdate();
  }

  get selectedRange(): JdCalendarRange {
    return this.#range;
  }
  set selectedRange(v: JdCalendarRange) {
    const start = v?.start instanceof Date ? toDayStart(v.start) : null;
    const end = v?.end instanceof Date ? toDayStart(v.end) : null;
    this.#range = { start, end };
    this.#rangeStep = start && !end ? "end" : "start";
    this.requestUpdate();
  }

  get minDate(): Date | null {
    return this.#min;
  }
  set minDate(v: Date | null) {
    this.#min = v instanceof Date && !Number.isNaN(v.getTime()) ? toDayStart(v) : null;
    this.requestUpdate();
  }

  get maxDate(): Date | null {
    return this.#max;
  }
  set maxDate(v: Date | null) {
    this.#max = v instanceof Date && !Number.isNaN(v.getTime()) ? toDayStart(v) : null;
    this.requestUpdate();
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(calendarStyles);
    for (const p of ["events", "selectedDate", "selectedRange", "minDate", "maxDate"]) {
      this.#upgradeOwn(p);
    }
    this.#readJson();

    const existing = this.querySelector<HTMLElement>(":scope > .jd-cal");
    if (existing) {
      this.#root = existing;
      this.#monthBtn = existing.querySelector(".jd-cal__month-btn")!;
      this.#monthLabel = existing.querySelector(".jd-cal__month-label")!;
      this.#grid = existing.querySelector(".jd-cal__grid")!;
      this.#picker = existing.querySelector(".jd-cal__picker")!;
      this.#pickerYearLabel = existing.querySelector(".jd-cal__picker-year")!;
    } else {
      this.#build();
    }
    this.#renderWeekdays();
    this.update();
  }

  #build(): void {
    this.#root = document.createElement("div");
    this.#root.className = "jd-cal";

    /* 헤더 */
    const header = document.createElement("div");
    header.className = "jd-cal__header";

    const left = document.createElement("div");
    left.className = "jd-cal__header-left";
    this.#monthBtn = document.createElement("button");
    this.#monthBtn.type = "button";
    this.#monthBtn.className = "jd-cal__month-btn";
    this.#monthBtn.setAttribute("aria-haspopup", "true");
    this.#monthBtn.setAttribute("aria-expanded", "false");
    this.#monthLabel = document.createElement("span");
    this.#monthLabel.className = "jd-cal__month-label";
    this.#monthBtn.append(this.#monthLabel);
    this.#monthBtn.insertAdjacentHTML("beforeend", CHEVRON_DOWN);
    const todayBtn = document.createElement("button");
    todayBtn.type = "button";
    todayBtn.className = "jd-cal__today";
    todayBtn.dataset.act = "today";
    todayBtn.textContent = "오늘";
    left.append(this.#monthBtn, todayBtn, this.#buildPicker());

    const right = document.createElement("div");
    right.className = "jd-cal__header-right";
    const toggle = document.createElement("div");
    toggle.className = "jd-cal__view-toggle";
    toggle.setAttribute("role", "group");
    toggle.setAttribute("aria-label", "보기 전환");
    const monthTab = this.#viewTab("month", "월");
    const weekTab = this.#viewTab("week", "주");
    toggle.append(monthTab, weekTab);
    const prev = this.#arrow("prev", "이전", CHEVRON_LEFT);
    const next = this.#arrow("next", "다음", CHEVRON_RIGHT);
    right.append(toggle, prev, next);

    header.append(left, right);

    /* 요일 헤더 + 그리드 */
    const weekdays = document.createElement("div");
    weekdays.className = "jd-cal__weekdays";
    weekdays.setAttribute("aria-hidden", "true");

    this.#grid = document.createElement("div");
    this.#grid.className = "jd-cal__grid";
    this.#grid.setAttribute("role", "grid");

    this.#root.append(header, weekdays, this.#grid);
    this.append(this.#root);
  }

  #buildPicker(): HTMLElement {
    this.#picker = document.createElement("div");
    this.#picker.className = "jd-cal__picker";
    this.#picker.hidden = true;
    const yearRow = document.createElement("div");
    yearRow.className = "jd-cal__picker-yearrow";
    const py = this.#arrow("picker-prev", "이전 년도", CHEVRON_LEFT);
    py.classList.add("jd-cal__picker-arrow");
    this.#pickerYearLabel = document.createElement("span");
    this.#pickerYearLabel.className = "jd-cal__picker-year";
    const ny = this.#arrow("picker-next", "다음 년도", CHEVRON_RIGHT);
    ny.classList.add("jd-cal__picker-arrow");
    yearRow.append(py, this.#pickerYearLabel, ny);
    const grid = document.createElement("div");
    grid.className = "jd-cal__picker-grid";
    for (let i = 0; i < 12; i += 1) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "jd-cal__picker-month";
      b.dataset.month = String(i);
      b.textContent = MONTH_LABELS_KO[i]!;
      grid.append(b);
    }
    this.#picker.append(yearRow, grid);
    return this.#picker;
  }

  #viewTab(view: string, label: string): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "jd-cal__view-tab";
    b.dataset.view = view;
    b.textContent = label;
    return b;
  }

  #arrow(act: string, label: string, svg: string): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "jd-cal__arrow";
    b.dataset.act = act;
    b.setAttribute("aria-label", label);
    b.innerHTML = svg;
    return b;
  }

  #upgradeOwn(name: string): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const self = this as unknown as Record<string, unknown>;
    const v = self[name];
    delete self[name];
    self[name] = v;
  }

  #readJson(): void {
    if (this.#events.length > 0) return;
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]");
      if (Array.isArray(parsed)) {
        this.#events = parsed.map((e) => ({ ...e }));
        this.#rebuildEventMap();
      }
    } catch {
      console.warn("[junds] <jd-calendar> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #rebuildEventMap(): void {
    const map = new Map<string, JdCalendarDayEvent[]>();
    for (const ev of this.#events) {
      let bucket = map.get(ev.date);
      if (!bucket) map.set(ev.date, (bucket = []));
      bucket.push(ev);
    }
    this.#eventMap = map;
  }

  /* ── 수명 ─────────────────────────────────────────────────────────── */

  protected override connected(): void {
    const t = toDayStart(new Date());
    this.#today = t;
    if (!this.#current.year) this.#current = { year: t.getFullYear(), month: t.getMonth() };
    if (!this.#weekAnchor) this.#weekAnchor = addDays(t, -t.getDay());
    if (!this.#focused) this.#focused = this.#selected ?? t;
    this.#pickerYear = this.#current.year;

    this.#root.addEventListener("click", this.#onClick);
    this.#grid.addEventListener("click", this.#onGridClick);
    this.#grid.addEventListener("keydown", this.#onKeyDown);
    this.#sizeObs = this.own(createSizeObserver(this, this.#onResize));
    this.requestUpdate();
  }

  protected override disconnected(): void {
    this.#root?.removeEventListener("click", this.#onClick);
    this.#grid?.removeEventListener("click", this.#onGridClick);
    this.#grid?.removeEventListener("keydown", this.#onKeyDown);
    this.#offPickerOutside?.();
    this.#offPickerOutside = null;
    this.#sizeObs = null;
  }

  #onResize = (size: { width: number }): void => {
    const compact = size.width > 0 && size.width < Math.max(0, this.compactWidth);
    if (compact === this.#isCompact) return;
    this.#isCompact = compact;
    this.requestUpdate();
  };

  /* ── 요일 헤더 ────────────────────────────────────────────────────── */

  #renderWeekdays(): void {
    const row = this.#root.querySelector<HTMLElement>(".jd-cal__weekdays");
    if (!row) return;
    row.textContent = "";
    WEEKDAY_LABELS_KO.forEach((d, i) => {
      const cell = document.createElement("div");
      cell.className = "jd-cal__weekday";
      if (i === 0) cell.dataset.sun = "";
      else if (i === 6) cell.dataset.sat = "";
      cell.textContent = d;
      row.append(cell);
    });
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    if (!this.#today) return; // connected 전 — 골격만
    const days = this.#viewDays();
    const headYear = this.#headerYear(days);
    const headMonth = this.#headerMonth(days);
    this.#monthLabel.textContent = `${headYear}년 ${headMonth + 1}월`;
    this.#monthBtn.setAttribute("aria-expanded", String(this.#pickerOpen));
    this.#root.toggleAttribute("data-compact", this.#isCompact);

    for (const tab of this.#root.querySelectorAll<HTMLElement>(".jd-cal__view-tab")) {
      tab.toggleAttribute("data-active", tab.dataset.view === this.view);
      tab.setAttribute("aria-pressed", String(tab.dataset.view === this.view));
    }

    this.#syncGrid(days);
    this.#syncPicker();

    if (this.#pendingFocus) {
      this.#pendingFocus = false;
      const key = this.#focused ? formatISODate(this.#focused) : "";
      this.#grid.querySelector<HTMLElement>(`[data-date="${key}"]`)?.focus();
    }
  }

  #viewDays(): (Date | null)[] {
    if (this.view === "week") {
      const anchor = this.#weekAnchor!;
      return Array.from({ length: 7 }, (_, i) => addDays(anchor, i));
    }
    // 월: 앞 빈칸 + 1일~말일 + 뒤 빈칸(7의 배수) — v2 동형(인접 월은 비운다)
    const { year, month } = this.#current;
    const first = new Date(year, month, 1);
    const cells: (Date | null)[] = [];
    for (let i = 0; i < first.getDay(); i += 1) cells.push(null);
    const total = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= total; d += 1) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  #headerYear(days: (Date | null)[]): number {
    return this.view === "month" ? this.#current.year : days[0]!.getFullYear();
  }
  #headerMonth(days: (Date | null)[]): number {
    return this.view === "month" ? this.#current.month : days[0]!.getMonth();
  }

  #syncGrid(days: (Date | null)[]): void {
    this.#grid.toggleAttribute("data-week", this.view === "week");
    if (this.#grid.childElementCount !== days.length) {
      this.#grid.textContent = "";
      for (let i = 0; i < days.length; i += 1) this.#grid.append(this.#buildCell());
    }
    days.forEach((date, i) => this.#syncCell(this.#grid.children[i] as HTMLElement, date));
  }

  #buildCell(): HTMLElement {
    const cell = document.createElement("div");
    cell.className = "jd-cal__cell";
    const num = document.createElement("span");
    num.className = "jd-cal__num";
    const events = document.createElement("div");
    events.className = "jd-cal__cell-events";
    cell.append(num, events);
    return cell;
  }

  #syncCell(cell: HTMLElement, date: Date | null): void {
    if (!date) {
      cell.toggleAttribute("data-empty", true);
      cell.removeAttribute("role");
      cell.removeAttribute("tabindex");
      cell.removeAttribute("data-date");
      cell.removeAttribute("aria-selected");
      cell.removeAttribute("aria-disabled");
      for (const k of ["today", "selected", "in-range", "disabled", "sun", "sat", "focus"])
        cell.removeAttribute(`data-${k}`);
      cell.querySelector(".jd-cal__num")!.textContent = "";
      cell.querySelector(".jd-cal__cell-events")!.textContent = "";
      return;
    }
    cell.removeAttribute("data-empty");
    cell.setAttribute("role", "gridcell");
    cell.dataset.date = formatISODate(date);

    const disabled = isDayOutOfRange(date, this.#min, this.#max);
    const isToday = isSameDay(date, this.#today);
    const isFocus = isSameDay(date, this.#focused);
    let selected = false;
    let endpoint = false;
    let inRange = false;
    if (this.selectionMode === "range") {
      endpoint = isSameDay(date, this.#range.start) || isSameDay(date, this.#range.end);
      inRange = this.#inRange(date);
    } else {
      selected = isSameDay(date, this.#selected);
    }
    const highlighted = selected || endpoint;

    cell.toggleAttribute("data-today", isToday);
    cell.toggleAttribute("data-selected", highlighted);
    cell.toggleAttribute("data-in-range", inRange);
    cell.toggleAttribute("data-disabled", disabled);
    cell.toggleAttribute("data-focus", isFocus && !highlighted);
    cell.toggleAttribute("data-sun", date.getDay() === 0);
    cell.toggleAttribute("data-sat", date.getDay() === 6);
    cell.setAttribute("aria-disabled", String(disabled));
    if (highlighted) cell.setAttribute("aria-selected", "true");
    else cell.removeAttribute("aria-selected");
    cell.tabIndex = isFocus ? 0 : -1;

    cell.querySelector<HTMLElement>(".jd-cal__num")!.textContent = String(date.getDate());
    this.#syncCellEvents(
      cell.querySelector<HTMLElement>(".jd-cal__cell-events")!,
      this.#eventMap.get(formatISODate(date)) ?? [],
    );
  }

  #syncCellEvents(box: HTMLElement, events: JdCalendarDayEvent[]): void {
    box.textContent = "";
    if (events.length === 0) return;
    if (this.#isCompact) {
      box.append(this.#dotRow(events, 4));
      return;
    }
    for (const ev of events.slice(0, 2)) box.append(this.#chip(ev));
    if (events.length > 2) box.append(this.#dotRow(events.slice(2, 5), 3, events.length - 2));
  }

  #chip(ev: JdCalendarDayEvent): HTMLElement {
    const chip = document.createElement("div");
    chip.className = "jd-cal__chip";
    if (ev.color) {
      chip.style.color = ev.color;
      chip.style.background = `color-mix(in srgb, ${ev.color} 15%, transparent)`;
    }
    if (ev.time && !ev.allDay) {
      const t = document.createElement("span");
      t.className = "jd-cal__chip-meta";
      t.textContent = ev.time;
      chip.append(t);
    } else if (ev.allDay) {
      const t = document.createElement("span");
      t.className = "jd-cal__chip-meta";
      t.textContent = "종일";
      chip.append(t);
    }
    chip.append(document.createTextNode(ev.label));
    return chip;
  }

  #dotRow(events: JdCalendarDayEvent[], max: number, overflowBase?: number): HTMLElement {
    const row = document.createElement("div");
    row.className = "jd-cal__dots";
    for (const ev of events.slice(0, max)) {
      const dot = document.createElement("span");
      dot.className = "jd-cal__dot";
      dot.style.background = ev.color || "var(--jd-color-primary)";
      row.append(dot);
    }
    const overflow = (overflowBase ?? events.length) - max;
    if (overflow > 0) {
      const more = document.createElement("span");
      more.className = "jd-cal__dots-more";
      more.textContent = `+${overflow}`;
      row.append(more);
    }
    return row;
  }

  #inRange(date: Date): boolean {
    const { start, end } = this.#range;
    if (!start || !end) return false;
    const lo = compareDay(start, end) <= 0 ? start : end;
    const hi = compareDay(start, end) <= 0 ? end : start;
    return compareDay(date, lo) > 0 && compareDay(date, hi) < 0;
  }

  #syncPicker(): void {
    this.#picker.hidden = !this.#pickerOpen;
    if (!this.#pickerOpen) return;
    this.#pickerYearLabel.textContent = `${this.#pickerYear}년`;
    for (const b of this.#picker.querySelectorAll<HTMLElement>(".jd-cal__picker-month")) {
      const m = Number(b.dataset.month);
      b.toggleAttribute(
        "data-current",
        this.#pickerYear === this.#current.year && m === this.#current.month,
      );
    }
  }

  /* ── 상호작용 ─────────────────────────────────────────────────────── */

  #onClick = (e: Event): void => {
    const act = (e.target as Element | null)?.closest<HTMLElement>("[data-act]")?.dataset.act;
    if (act) {
      this.#handleAct(act);
      return;
    }
    const tab = (e.target as Element | null)?.closest<HTMLElement>(".jd-cal__view-tab");
    if (tab?.dataset.view) {
      this.#setView(tab.dataset.view);
      return;
    }
    const monthBtn = (e.target as Element | null)?.closest(".jd-cal__month-btn");
    if (monthBtn) {
      this.#togglePicker();
      return;
    }
    const monthCell = (e.target as Element | null)?.closest<HTMLElement>(".jd-cal__picker-month");
    if (monthCell?.dataset.month) {
      this.#current = { year: this.#pickerYear, month: Number(monthCell.dataset.month) };
      this.#closePicker();
      this.requestUpdate();
      this.emit("jd-month-change", { year: this.#current.year, month: this.#current.month });
    }
  };

  #handleAct(act: string): void {
    switch (act) {
      case "today":
        this.#goToday();
        break;
      case "prev":
        this.#shift(-1);
        break;
      case "next":
        this.#shift(1);
        break;
      case "picker-prev":
        this.#pickerYear -= 1;
        this.requestUpdate();
        break;
      case "picker-next":
        this.#pickerYear += 1;
        this.requestUpdate();
        break;
    }
  }

  #onGridClick = (e: Event): void => {
    const cell = (e.target as Element | null)?.closest<HTMLElement>(".jd-cal__cell");
    const iso = cell?.dataset.date;
    if (!iso || cell!.hasAttribute("data-disabled")) return;
    const [y, m, d] = iso.split("-").map(Number);
    this.#clickDate(new Date(y!, m! - 1, d!));
  };

  #clickDate(date: Date): void {
    if (isDayOutOfRange(date, this.#min, this.#max)) return;
    this.#focused = date;
    this.emit("jd-date-click", { date: new Date(date) });

    if (this.selectionMode === "range") {
      if (this.#rangeStep === "start") {
        this.#range = { start: date, end: null };
        this.#rangeStep = "end";
      } else {
        const start = this.#range.start ?? date;
        const forward = compareDay(start, date) <= 0;
        const actualStart = forward ? start : date;
        const actualEnd = forward ? date : start;
        this.#range = { start: actualStart, end: actualEnd };
        this.#rangeStep = "start";
        this.emit("jd-range-select", {
          start: new Date(actualStart),
          end: new Date(actualEnd),
        });
      }
    } else {
      this.#selected = date;
      this.emit("jd-date-select", { date: new Date(date) });
    }
    this.requestUpdate();
  }

  #onKeyDown = (e: KeyboardEvent): void => {
    if (!this.#focused) return;
    let next: Date | null = null;
    switch (e.key) {
      case "ArrowLeft": next = addDays(this.#focused, -1); break;
      case "ArrowRight": next = addDays(this.#focused, 1); break;
      case "ArrowUp": next = addDays(this.#focused, -7); break;
      case "ArrowDown": next = addDays(this.#focused, 7); break;
      case "Enter":
      case " ":
        e.preventDefault();
        this.#clickDate(this.#focused);
        return;
      default:
        return;
    }
    e.preventDefault();
    this.#focused = next;
    this.#ensureVisible(next);
    this.#pendingFocus = true;
    this.requestUpdate();
  };

  /** 포커스가 현재 뷰를 벗어나면 뷰를 따라 이동(v2 동형) */
  #ensureVisible(date: Date): void {
    if (this.view === "month") {
      if (date.getMonth() !== this.#current.month || date.getFullYear() !== this.#current.year) {
        this.#current = { year: date.getFullYear(), month: date.getMonth() };
        this.emit("jd-month-change", { year: this.#current.year, month: this.#current.month });
      }
    } else {
      const anchor = this.#weekAnchor!;
      const t = toDayStart(date).getTime();
      if (t < anchor.getTime() || t >= addDays(anchor, 7).getTime()) {
        this.#weekAnchor = addDays(date, -date.getDay());
      }
    }
  }

  #shift(dir: number): void {
    if (this.view === "month") {
      const m = this.#current.month + dir;
      this.#current = normalizeYm(this.#current.year, m);
      this.emit("jd-month-change", { year: this.#current.year, month: this.#current.month });
    } else {
      this.#weekAnchor = addDays(this.#weekAnchor!, dir * 7);
    }
    this.requestUpdate();
  }

  #goToday(): void {
    const t = this.#today ?? toDayStart(new Date());
    this.#current = { year: t.getFullYear(), month: t.getMonth() };
    this.#weekAnchor = addDays(t, -t.getDay());
    this.#pickerYear = t.getFullYear();
    this.requestUpdate();
    this.emit("jd-month-change", { year: this.#current.year, month: this.#current.month });
  }

  #setView(view: string): void {
    if (view !== "month" && view !== "week") return;
    if (view === this.view) return;
    this.view = view;
    this.emit("jd-view-change", { view });
  }

  #togglePicker(): void {
    if (this.#pickerOpen) this.#closePicker();
    else this.#openPicker();
    this.requestUpdate();
  }

  #openPicker(): void {
    this.#pickerOpen = true;
    this.#pickerYear = this.#current.year;
    this.#offPickerOutside?.();
    // 열린 뒤 바로 오는 같은 클릭에 닫히지 않게 다음 프레임에 바인딩
    this.#offPickerOutside = on(this.ownerDocument, "click", this.#onDocClickForPicker, true);
  }

  #closePicker(): void {
    this.#pickerOpen = false;
    this.#offPickerOutside?.();
    this.#offPickerOutside = null;
  }

  #onDocClickForPicker = (e: Event): void => {
    const path = e.target as Node;
    if (this.#picker.contains(path) || this.#monthBtn.contains(path)) return;
    this.#closePicker();
    this.requestUpdate();
  };

  /* ── 공개 메서드 ─────────────────────────────────────────────────── */

  goToMonth(year: number, month: number): void {
    this.#current = normalizeYm(year, month);
    this.requestUpdate();
    this.emit("jd-month-change", { year: this.#current.year, month: this.#current.month });
  }
}

function normalizeYm(year: number, month: number): { year: number; month: number } {
  const base = new Date(year, month, 1);
  return { year: base.getFullYear(), month: base.getMonth() };
}
