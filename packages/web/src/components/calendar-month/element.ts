/**
 * <jd-calendar-month> — 월 그리드 + 이벤트 도트 + 키보드 화살표 네비
 * (v2 patterns/CalendarMonth). 6주(42칸) 고정 그리드, 인접 월 날짜는 딤 처리.
 *
 * 결정적 render(§3.1-3): "오늘"과 기본 표시 월은 **connected() 이후** 한 번 읽어
 * 주입한다(core/date.ts 규범 1). render()는 골격(헤더·요일줄·빈 그리드)만 세우고,
 * 날짜 셀은 update()에서 그린다.
 *
 * 복합 데이터(§1.3): `month`/`selectedDate`(Date)와 `events`(배열)는 property 전용.
 * events는 선언적 초기화용 자식 `<script type="application/json">` 슬롯도 받는다.
 *
 * v2 대비 교정(접근성): grid 컨테이너 포커스 + `aria-activedescendant`로 이동 중인
 * 셀을 가리켜, 화살표 이동이 스크린리더에 실제로 전달되게 했다(v2는 시각 하이라이트만).
 *
 * 이벤트(§1.5):
 *  - `jd-month-change` {month: Date} — 이전/오늘/다음 또는 경계 넘는 화살표
 *  - `jd-select-date` {date: Date}
 *  - `jd-event-click` {event}
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import {
  WEEKDAY_LABELS_KO,
  addDays,
  addMonths,
  formatISODate,
  isSameDay,
  parseISODate,
  toDayStart,
} from "../../core/date.js";
import calendarMonthStyles from "./calendar-month.css.js";

export interface JdCalendarEvent {
  id: string;
  title: string;
  /** 시작일 "YYYY-MM-DD" 또는 ISO */
  start: string;
  /** 종료일(포함) — 생략 시 단일 일자 */
  end?: string;
  /** 색 토큰 */
  color?: "primary" | "success" | "warning" | "danger" | "info" | "accent";
}

const CHEVRON_LEFT = `<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M8.5 3l-4 4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CHEVRON_RIGHT = `<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M5.5 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export class JdCalendarMonth extends JdElement {
  static override tag = "jd-calendar-month";
  static override props = {
    /** 주의 시작 요일(0=일, 1=월) */
    weekStartsOn: { type: Number, default: 0, attribute: "week-starts-on", reflect: true },
    /** 최대 표시 이벤트 수(초과분은 +N) */
    maxEvents: { type: Number, default: 3 },
  };

  declare weekStartsOn: number;
  declare maxEvents: number;

  #month: Date | null = null;
  #selected: Date | null = null;
  #events: JdCalendarEvent[] = [];
  #today: Date | null = null;
  #focus: Date | null = null;

  #titleEl!: HTMLElement;
  #weekRow!: HTMLElement;
  #grid!: HTMLElement;
  #gridId = "";

  /* ── 프로퍼티 표면 ─────────────────────────────────────────────────── */

  get month(): Date | null {
    return this.#month;
  }
  set month(v: Date | null) {
    this.#month = v instanceof Date && !Number.isNaN(v.getTime()) ? startOfMonth(v) : null;
    this.requestUpdate();
  }

  get selectedDate(): Date | null {
    return this.#selected;
  }
  set selectedDate(v: Date | null) {
    this.#selected = v instanceof Date && !Number.isNaN(v.getTime()) ? toDayStart(v) : null;
    this.requestUpdate();
  }

  get events(): JdCalendarEvent[] {
    return this.#events;
  }
  set events(v: JdCalendarEvent[]) {
    this.#events = Array.isArray(v) ? v.map((e) => ({ ...e })) : [];
    this.requestUpdate();
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(calendarMonthStyles);
    this.#upgradeOwn("month");
    this.#upgradeOwn("selectedDate");
    this.#upgradeOwn("events");
    this.#readJson();

    const existing = this.querySelector<HTMLElement>(":scope > .jd-cm");
    if (existing) {
      this.#titleEl = existing.querySelector(".jd-cm__title")!;
      this.#weekRow = existing.querySelector(".jd-cm__weekdays")!;
      this.#grid = existing.querySelector(".jd-cm__grid")!;
      this.#gridId = this.#grid.id;
    } else {
      this.#build();
    }
    this.#renderWeekdays();
    this.update();
  }

  #build(): void {
    const root = document.createElement("section");
    root.className = "jd-cm";
    root.setAttribute("aria-label", "달력");

    const header = document.createElement("header");
    header.className = "jd-cm__header";
    this.#titleEl = document.createElement("h2");
    this.#titleEl.className = "jd-cm__title";
    const nav = document.createElement("div");
    nav.className = "jd-cm__nav";
    const prev = this.#navButton("prev", "이전 달", CHEVRON_LEFT);
    const today = document.createElement("button");
    today.type = "button";
    today.className = "jd-cm__today";
    today.dataset.nav = "today";
    today.textContent = "오늘";
    const next = this.#navButton("next", "다음 달", CHEVRON_RIGHT);
    nav.append(prev, today, next);
    header.append(this.#titleEl, nav);

    this.#weekRow = document.createElement("div");
    this.#weekRow.className = "jd-cm__weekdays";
    this.#weekRow.setAttribute("aria-hidden", "true");

    this.#grid = document.createElement("div");
    this.#grid.className = "jd-cm__grid";
    this.#grid.id = this.#gridId = jdUid("jd-cm-grid");
    this.#grid.setAttribute("role", "grid");
    this.#grid.tabIndex = 0;

    root.append(header, this.#weekRow, this.#grid);
    this.append(root);
  }

  #navButton(nav: string, label: string, svg: string): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "jd-cm__arrow";
    b.dataset.nav = nav;
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
      if (Array.isArray(parsed)) this.#events = parsed.map((e) => ({ ...e }));
    } catch {
      console.warn("[junds] <jd-calendar-month> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override connected(): void {
    this.#today = toDayStart(new Date());
    if (!this.#month) this.#month = startOfMonth(this.#today);
    if (!this.#focus) this.#focus = this.#selected ?? this.#today;
    this.#grid.addEventListener("click", this.#onGridClick);
    this.#grid.addEventListener("keydown", this.#onKeyDown);
    this.querySelector(".jd-cm__nav")!.addEventListener("click", this.#onNavClick);
    this.requestUpdate();
  }

  protected override disconnected(): void {
    this.#grid?.removeEventListener("click", this.#onGridClick);
    this.#grid?.removeEventListener("keydown", this.#onKeyDown);
    this.querySelector(".jd-cm__nav")?.removeEventListener("click", this.#onNavClick);
  }

  /* ── 요일 헤더 ────────────────────────────────────────────────────── */

  #renderWeekdays(): void {
    const start = normWeekStart(this.weekStartsOn);
    this.#weekRow.textContent = "";
    for (let i = 0; i < 7; i += 1) {
      const cell = document.createElement("div");
      cell.className = "jd-cm__weekday";
      cell.textContent = WEEKDAY_LABELS_KO[(i + start) % 7]!;
      this.#weekRow.append(cell);
    }
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    this.#renderWeekdays();
    const month = this.#month;
    if (!month) {
      this.#titleEl.textContent = "";
      this.#grid.textContent = "";
      return;
    }
    this.#titleEl.textContent = `${month.getFullYear()}년 ${month.getMonth() + 1}월`;
    this.#grid.setAttribute("aria-label", `${month.getFullYear()}년 ${month.getMonth() + 1}월 달력`);

    const cells = buildMonthCells(month, this.weekStartsOn);
    const byDay = this.#eventsByDay();
    const cap = Math.max(0, this.maxEvents);

    if (this.#grid.childElementCount !== cells.length) {
      this.#grid.textContent = "";
      for (let i = 0; i < cells.length; i += 1) this.#grid.append(this.#buildCell(i));
    }

    let activeId = "";
    cells.forEach((date, i) => {
      const cell = this.#grid.children[i] as HTMLElement;
      const isCur = date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
      const isToday = isSameDay(date, this.#today);
      const isSelected = isSameDay(date, this.#selected);
      const isFocus = isSameDay(date, this.#focus);
      cell.dataset.date = formatISODate(date);
      cell.toggleAttribute("data-outside", !isCur);
      cell.toggleAttribute("data-today", isToday);
      cell.toggleAttribute("data-selected", isSelected);
      cell.toggleAttribute("data-focus", isFocus && !isSelected);
      if (isSelected) cell.setAttribute("aria-selected", "true");
      else cell.removeAttribute("aria-selected");
      if (isFocus) activeId = cell.id;

      const num = cell.querySelector<HTMLElement>(".jd-cm__num")!;
      num.textContent = String(date.getDate());

      const list = cell.querySelector<HTMLElement>(".jd-cm__events")!;
      const dayEvents = byDay.get(formatISODate(date)) ?? [];
      this.#syncCellEvents(list, dayEvents, cap);
    });

    if (activeId) this.#grid.setAttribute("aria-activedescendant", activeId);
    else this.#grid.removeAttribute("aria-activedescendant");
  }

  #buildCell(index: number): HTMLElement {
    const cell = document.createElement("div");
    cell.className = "jd-cm__cell";
    cell.id = `${this.#gridId}-c${index}`;
    cell.setAttribute("role", "gridcell");
    const num = document.createElement("span");
    num.className = "jd-cm__num";
    const list = document.createElement("ul");
    list.className = "jd-cm__events";
    cell.append(num, list);
    return cell;
  }

  #syncCellEvents(list: HTMLElement, events: JdCalendarEvent[], cap: number): void {
    list.textContent = "";
    const shown = events.slice(0, cap);
    for (const ev of shown) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "jd-cm__event";
      if (ev.color) btn.dataset.color = ev.color;
      btn.dataset.eventId = ev.id;
      btn.textContent = ev.title;
      btn.title = ev.title;
      li.append(btn);
      list.append(li);
    }
    if (events.length > cap) {
      const more = document.createElement("li");
      more.className = "jd-cm__more";
      more.textContent = `+${events.length - cap}`;
      list.append(more);
    }
  }

  /** 이벤트를 일자별로 펼친다(start..end 포함 스팬) */
  #eventsByDay(): Map<string, JdCalendarEvent[]> {
    const map = new Map<string, JdCalendarEvent[]>();
    for (const ev of this.#events) {
      const start = parseISODate(ev.start);
      if (!start) continue;
      const end = ev.end ? parseISODate(ev.end) ?? start : start;
      let cur = start;
      // 폭주 방지 — 최대 366일 스팬
      for (let guard = 0; cur.getTime() <= end.getTime() && guard < 366; guard += 1) {
        const key = formatISODate(cur);
        let bucket = map.get(key);
        if (!bucket) map.set(key, (bucket = []));
        bucket.push(ev);
        cur = addDays(cur, 1);
      }
    }
    return map;
  }

  /* ── 상호작용 ─────────────────────────────────────────────────────── */

  #onNavClick = (e: Event): void => {
    const nav = (e.target as Element | null)?.closest<HTMLElement>("[data-nav]")?.dataset.nav;
    if (!nav || !this.#month) return;
    if (nav === "today") {
      const t = this.#today ?? toDayStart(new Date());
      this.#setMonth(startOfMonth(t));
    } else {
      this.#setMonth(addMonths(this.#month, nav === "prev" ? -1 : 1));
    }
  };

  #onGridClick = (e: Event): void => {
    const evBtn = (e.target as Element | null)?.closest<HTMLElement>(".jd-cm__event");
    if (evBtn?.dataset.eventId) {
      e.stopPropagation();
      const ev = this.#events.find((x) => x.id === evBtn.dataset.eventId);
      if (ev) this.emit("jd-event-click", { event: ev });
      return;
    }
    const cell = (e.target as Element | null)?.closest<HTMLElement>(".jd-cm__cell");
    const iso = cell?.dataset.date;
    if (!iso) return;
    const date = parseISODate(iso);
    if (date) this.#select(date);
  };

  #onKeyDown = (e: KeyboardEvent): void => {
    if (!this.#focus || !this.#month) return;
    let next: Date | null = null;
    switch (e.key) {
      case "ArrowLeft": next = addDays(this.#focus, -1); break;
      case "ArrowRight": next = addDays(this.#focus, 1); break;
      case "ArrowUp": next = addDays(this.#focus, -7); break;
      case "ArrowDown": next = addDays(this.#focus, 7); break;
      case "Home": next = startOfMonth(this.#focus); break;
      case "End": next = endOfMonth(this.#focus); break;
      case "PageUp": next = addMonths(this.#focus, -1); break;
      case "PageDown": next = addMonths(this.#focus, 1); break;
      case "Enter":
      case " ":
        e.preventDefault();
        this.#select(this.#focus);
        return;
      default:
        return;
    }
    e.preventDefault();
    this.#focus = next;
    if (next.getMonth() !== this.#month.getMonth() || next.getFullYear() !== this.#month.getFullYear()) {
      this.#setMonth(startOfMonth(next));
    } else {
      this.requestUpdate();
    }
  };

  #setMonth(month: Date): void {
    this.#month = month;
    this.requestUpdate();
    this.emit("jd-month-change", { month: new Date(month) });
  }

  #select(date: Date): void {
    this.#selected = toDayStart(date);
    this.#focus = this.#selected;
    this.requestUpdate();
    this.emit("jd-select-date", { date: new Date(this.#selected) });
  }
}

/* ── 순수 헬퍼 ──────────────────────────────────────────────────────── */

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function normWeekStart(v: number): 0 | 1 {
  return v === 1 ? 1 : 0;
}

/** 6주(42칸) 셀 — 앞쪽은 이전 달 꼬리, 뒤쪽은 다음 달 머리로 채운다(v2 동형) */
function buildMonthCells(month: Date, weekStartsOn: number): Date[] {
  const start = normWeekStart(weekStartsOn);
  const first = startOfMonth(month);
  const offset = (first.getDay() - start + 7) % 7;
  const days: Date[] = [];
  for (let i = offset; i > 0; i -= 1) days.push(addDays(first, -i));
  const total = endOfMonth(month).getDate();
  for (let d = 0; d < total; d += 1) days.push(addDays(first, d));
  while (days.length < 42) days.push(addDays(days[days.length - 1]!, 1));
  return days;
}
