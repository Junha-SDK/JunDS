/**
 * <jd-date-range-picker> — 2개월 달력 범위 선택기 (v2 composites/DateRangePicker)
 *                          = JdPickerField 파생.
 *
 * 값 모델 변경(v2 `value: {start: Date|null, end: Date|null}` → `startDate`/`endDate` 문자열):
 * Date 객체는 attribute로 못 싣고 폼에도 못 실린다. "YYYY-MM-DD" 문자열이면 선언적
 * 초기화·SSR 직렬화·폼 제출이 전부 성립한다(§1.3 복합 데이터 회피). Date 표면이 필요한
 * 소비자를 위해 `value` 접근자({start,end}: Date|null)를 병행 유지한다.
 *
 * v2 대비 접근성 보정 4건:
 *  1. 날짜 격자가 `div.grid` 무의미 컨테이너였다 → 실제 <table> + <th scope="col">
 *     요일 헤더 + <caption> 월 이름. 스크린리더가 "7월 24일, 금요일"을 읽는다.
 *  2. 키보드로 날짜를 고를 수 없었다(버튼 42개가 전부 탭스톱) → 로빙 탭인덱스 1개 +
 *     화살표(±1일/±7일)·Home/End(주)·PageUp/Down(월) 이동. 보이는 달 밖으로 나가면
 *     뷰가 따라 넘어간다.
 *  3. 오늘·범위 시작/끝이 색으로만 구분됐다 → aria-current="date" · aria-pressed.
 *  4. 달을 넘겨도 아무 통지가 없었다 → 시각적으로 숨긴 aria-live 상태 줄.
 */
import { JdPickerField } from "../../core/picker-field.js";
import { adoptStyles } from "../../core/styles.js";
import {
  WEEKDAY_LABELS_KO,
  compareDay,
  formatDotDate,
  formatISODate,
  isDayOutOfRange,
  isSameDay,
  monthGrid,
  parseISODate,
  toDayStart,
} from "../../core/date.js";
import dateRangePickerStyles from "./date-range-picker.css.js";

const CALENDAR_SVG =
  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<rect x="1.5" y="2.5" width="11" height="9.5" rx="1.5" stroke="currentColor" stroke-width="1.5"/>` +
  `<path d="M1.5 5.5h11" stroke="currentColor" stroke-width="1.5"/>` +
  `<path d="M4.5 1v2M9.5 1v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

const CHEVRON_LEFT =
  `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">` +
  `<path d="M10 4L6 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const CHEVRON_RIGHT =
  `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">` +
  `<path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const WEEKDAY_FULL_KO = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
] as const;

export interface JdDateRange {
  start: Date | null;
  end: Date | null;
}

export class JdDateRangePicker extends JdPickerField {
  static override tag = "jd-date-range-picker";
  static override props = {
    ...JdPickerField.props,
    /** "YYYY-MM-DD" */
    startDate: { type: String },
    endDate: { type: String },
    /** 선택 가능 하한/상한 "YYYY-MM-DD" */
    min: { type: String },
    max: { type: String },
    /** 나란히 보일 달 수 (v2는 2 고정) */
    months: { type: Number, default: 2 },
    placeholder: { type: String, default: "날짜 범위 선택" },
  };

  declare startDate: string;
  declare endDate: string;
  declare min: string;
  declare max: string;
  declare months: number;

  #weekdayLabels: readonly string[] = WEEKDAY_LABELS_KO;
  /** 왼쪽 달 (0-based month) */
  #viewYear = 0;
  #viewMonth = 0;
  /** 뷰가 실제 값/오늘로 정해졌는지 — 정해지기 전에는 격자를 그리지 않는다 */
  #viewReady = false;
  /** 마지막으로 그린 격자의 키 — 달라질 때만 테이블을 재구축 */
  #renderedKey = "";
  #selecting: "start" | "end" = "start";
  #hover: Date | null = null;
  #focusDate: Date | null = null;
  /** connected() 이후에만 채워진다 (§3.1-3 — render는 시계를 읽지 않는다) */
  #today: Date | null = null;

  #monthsEl!: HTMLDivElement;
  #status!: HTMLParagraphElement;

  /** 요일 라벨(7개, 일요일 시작) — 복합 데이터라 property 전용(§1.3) */
  get weekdayLabels(): readonly string[] {
    return this.#weekdayLabels;
  }
  set weekdayLabels(v: readonly string[]) {
    if (!v || v.length !== 7) return;
    this.#weekdayLabels = v;
    this.#renderedKey = ""; // 헤더가 바뀌므로 재구축
    this.requestUpdate();
  }

  /** v2 표면 호환 — Date 객체로 읽고 쓰기 */
  get value(): JdDateRange {
    return { start: parseISODate(this.startDate), end: parseISODate(this.endDate) };
  }
  set value(v: JdDateRange | null) {
    this.startDate = v?.start ? formatISODate(v.start) : "";
    this.endDate = v?.end ? formatISODate(v.end) : "";
  }

  protected override render(): void {
    adoptStyles(dateRangePickerStyles);
    super.render(); // 트리거·패널 골격 + buildPanel()
    this.#syncViewFromValue(); // 값이 있으면 시계 없이 뷰가 정해진다
    this.update();
  }

  protected override connected(): void {
    super.connected();
    // "오늘"은 여기서 1회만 읽는다 — render()는 결정적으로 유지(§3.1-3)
    this.#today = toDayStart(new Date());
    if (!this.#viewReady) {
      this.#viewYear = this.#today.getFullYear();
      this.#viewMonth = this.#today.getMonth();
      this.#viewReady = true;
      this.#renderedKey = "";
    }
    this.update();
  }

  protected override triggerIcon(): string {
    return CALENDAR_SVG;
  }

  protected override panelLabel(): string {
    return "날짜 범위 선택";
  }

  protected override displayText(): string {
    const { start, end } = this.value;
    if (!start) return "";
    if (!end) return formatDotDate(start);
    return `${formatDotDate(start)} ~ ${formatDotDate(end)}`;
  }

  /** 멱등 — 이미 골격이 있으면(프리렌더 스냅샷) 붙잡기만 한다(§3.3) */
  protected override buildPanel(panel: HTMLElement): void {
    if (!panel.querySelector(":scope > .jd-date-range-picker__nav")) {
      const nav = document.createElement("div");
      nav.className = "jd-date-range-picker__nav";
      const prev = document.createElement("button");
      prev.type = "button";
      prev.className = "jd-date-range-picker__nav-btn";
      prev.dataset.nav = "prev";
      prev.setAttribute("aria-label", "이전 달");
      prev.innerHTML = CHEVRON_LEFT;
      const next = document.createElement("button");
      next.type = "button";
      next.className = "jd-date-range-picker__nav-btn";
      next.dataset.nav = "next";
      next.setAttribute("aria-label", "다음 달");
      next.innerHTML = CHEVRON_RIGHT;
      const spacer = document.createElement("span");
      spacer.className = "jd-date-range-picker__nav-spacer";
      nav.append(prev, spacer, next);

      const months = document.createElement("div");
      months.className = "jd-date-range-picker__months";

      const status = document.createElement("p");
      status.className = "jd-date-range-picker__status";
      status.setAttribute("aria-live", "polite");

      panel.append(nav, months, status);
    }

    this.#monthsEl = panel.querySelector<HTMLDivElement>(".jd-date-range-picker__months")!;
    this.#status = panel.querySelector<HTMLParagraphElement>(".jd-date-range-picker__status")!;
    this.#renderedKey = ""; // 입양한 격자도 현재 뷰 기준으로 다시 그린다
    panel.querySelector('[data-nav="prev"]')?.addEventListener("click", () => this.#shiftView(-1));
    panel.querySelector('[data-nav="next"]')?.addEventListener("click", () => this.#shiftView(1));
    this.#monthsEl.addEventListener("click", this.#onGridClick);
    this.#monthsEl.addEventListener("mouseover", this.#onGridHover);
    this.#monthsEl.addEventListener("mouseleave", this.#onGridLeave);
    this.#monthsEl.addEventListener("keydown", this.#onGridKeydown);
  }

  /** 열 때마다 뷰를 현재 값에 맞추고 선택 단계를 처음으로 되돌린다(v2 동형) */
  protected override onPanelOpen(): void {
    this.#selecting = "start";
    this.#hover = null;
    this.#syncViewFromValue();
    const start = parseISODate(this.startDate);
    this.#focusDate = start ?? this.#today;
    this.#paint();
  }

  protected override focusPanel(): void {
    const target =
      this.#monthsEl.querySelector<HTMLButtonElement>('[data-date][tabindex="0"]') ??
      this.#monthsEl.querySelector<HTMLButtonElement>("[data-date]:not([disabled])");
    target?.focus();
  }

  protected override update(): void {
    super.update();
    this.#renderMonths();
    this.#paint();
  }

  /** 값에서 뷰를 유도 — 시계를 읽지 않는다. 값이 없으면 뷰 미정 상태 유지 */
  #syncViewFromValue(): void {
    const base = parseISODate(this.startDate) ?? parseISODate(this.endDate);
    if (!base) return;
    if (this.#viewReady && this.#viewYear === base.getFullYear() && this.#viewMonth === base.getMonth()) {
      return;
    }
    this.#viewYear = base.getFullYear();
    this.#viewMonth = base.getMonth();
    this.#viewReady = true;
    this.#renderedKey = "";
  }

  #monthCount(): number {
    return Math.max(1, Math.min(3, Math.round(this.months) || 2));
  }

  #shiftView(delta: number): void {
    if (!this.#viewReady) return;
    const shifted = new Date(this.#viewYear, this.#viewMonth + delta, 1);
    this.#viewYear = shifted.getFullYear();
    this.#viewMonth = shifted.getMonth();
    this.#renderedKey = "";
    this.#renderMonths();
    this.#paint();
  }

  /** 격자 재구축 — 뷰/달 수가 바뀐 경우에만 (셀 상태 반영은 #paint 몫) */
  #renderMonths(): void {
    if (!this.#viewReady) return;
    const count = this.#monthCount();
    const key = `${this.#viewYear}-${this.#viewMonth}-${count}-${this.#weekdayLabels.join("")}`;
    if (key === this.#renderedKey) return;
    this.#renderedKey = key;
    this.#monthsEl.textContent = "";
    const captions: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const first = new Date(this.#viewYear, this.#viewMonth + i, 1);
      captions.push(`${first.getFullYear()}년 ${first.getMonth() + 1}월`);
      this.#monthsEl.append(this.#buildCalendar(first));
    }
    this.#status.textContent = captions.join(" ~ ");
  }

  #buildCalendar(first: Date): HTMLTableElement {
    const year = first.getFullYear();
    const month = first.getMonth();
    const table = document.createElement("table");
    table.className = "jd-date-range-picker__calendar";

    const caption = document.createElement("caption");
    caption.className = "jd-date-range-picker__caption";
    caption.textContent = `${year}년 ${month + 1}월`;
    table.append(caption);

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    for (let i = 0; i < 7; i += 1) {
      const th = document.createElement("th");
      th.scope = "col";
      const abbr = document.createElement("abbr");
      abbr.title = WEEKDAY_FULL_KO[i] ?? "";
      abbr.textContent = this.#weekdayLabels[i] ?? "";
      th.append(abbr);
      headRow.append(th);
    }
    thead.append(headRow);
    table.append(thead);

    const tbody = document.createElement("tbody");
    const cells = monthGrid(year, month);
    for (let i = 0; i < cells.length; i += 7) {
      const tr = document.createElement("tr");
      for (let c = 0; c < 7; c += 1) {
        const td = document.createElement("td");
        const date = cells[i + c];
        if (date) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "jd-date-range-picker__day";
          btn.dataset.date = formatISODate(date);
          btn.tabIndex = -1;
          btn.textContent = String(date.getDate());
          td.append(btn);
        }
        tr.append(td);
      }
      tbody.append(tr);
    }
    table.append(tbody);
    return table;
  }

  /** 셀 상태(선택·범위·오늘·비활성·탭스톱) 반영 — 구조는 건드리지 않는다 */
  #paint(): void {
    if (!this.#viewReady) return;
    const start = parseISODate(this.startDate);
    const end = parseISODate(this.endDate);
    const min = parseISODate(this.min);
    const max = parseISODate(this.max);
    // 끝을 고르는 중이면 hover가 임시 끝 — v2의 범위 미리보기
    const previewEnd = this.#selecting === "end" && this.#hover ? this.#hover : end;
    let from: Date | null = null;
    let to: Date | null = null;
    if (start && previewEnd) {
      const ascending = compareDay(start, previewEnd) <= 0;
      from = ascending ? start : previewEnd;
      to = ascending ? previewEnd : start;
    }

    const buttons = this.#monthsEl.querySelectorAll<HTMLButtonElement>("[data-date]");
    let tabStop: HTMLButtonElement | null = null;
    let firstEnabled: HTMLButtonElement | null = null;

    for (const btn of buttons) {
      const date = parseISODate(btn.dataset.date ?? "");
      if (!date) continue;
      const disabled = isDayOutOfRange(date, min, max);
      btn.disabled = disabled;
      if (!disabled && !firstEnabled) firstEnabled = btn;

      const isStart = isSameDay(date, start);
      const isEnd = previewEnd ? isSameDay(date, previewEnd) : false;
      const inRange = Boolean(from && to && compareDay(date, from) > 0 && compareDay(date, to) < 0);
      const isToday = isSameDay(date, this.#today);

      btn.toggleAttribute("data-range-start", isStart);
      btn.toggleAttribute("data-range-end", isEnd);
      btn.toggleAttribute("data-in-range", inRange);
      btn.toggleAttribute("data-today", isToday);
      if (isToday) btn.setAttribute("aria-current", "date");
      else btn.removeAttribute("aria-current");
      btn.setAttribute("aria-pressed", String(isStart || isEnd));

      let label = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${
        WEEKDAY_FULL_KO[date.getDay()] ?? ""
      }`;
      if (isStart) label += ", 시작일";
      else if (isEnd && end) label += ", 종료일";
      btn.setAttribute("aria-label", label);

      btn.tabIndex = -1;
      if (!tabStop && !disabled && isSameDay(date, this.#focusDate ?? start ?? this.#today)) {
        tabStop = btn;
      }
    }
    const stop = tabStop ?? firstEnabled;
    if (stop) stop.tabIndex = 0;
  }

  #onGridClick = (e: Event): void => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-date]");
    if (!btn || btn.disabled) return;
    const date = parseISODate(btn.dataset.date ?? "");
    if (!date) return;
    this.#select(date);
  };

  /** v2 선택 상태기 그대로: start → end, 단 end가 start보다 앞서면 start로 되감는다 */
  #select(date: Date): void {
    this.#focusDate = date;
    const start = parseISODate(this.startDate);
    if (this.#selecting === "start" || !start || compareDay(date, start) < 0) {
      this.startDate = formatISODate(date);
      this.endDate = "";
      this.#selecting = "end";
      this.#hover = null;
      this.#emitChange();
      this.#paint();
      return;
    }
    this.endDate = formatISODate(date);
    this.#selecting = "start";
    this.#hover = null;
    this.#emitChange();
    this.closeAndRestore(); // 범위가 완성되면 닫는다(v2 동형) — 포커스는 트리거로
  }

  #emitChange(): void {
    const { start, end } = this.value;
    this.emit("jd-change", {
      startDate: this.startDate,
      endDate: this.endDate,
      start,
      end,
    });
  }

  #onGridHover = (e: Event): void => {
    if (this.#selecting !== "end") return;
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-date]");
    const date = btn && !btn.disabled ? parseISODate(btn.dataset.date ?? "") : null;
    // 둘 다 null이면 === 로 걸린다 — 날짜 밖을 지날 때마다 다시 칠하지 않도록
    if (date === this.#hover || isSameDay(date, this.#hover)) return;
    this.#hover = date;
    this.#paint();
  };

  #onGridLeave = (): void => {
    if (!this.#hover) return;
    this.#hover = null;
    this.#paint();
  };

  /** 화살표 ±1일 / 상하 ±7일 / Home·End 주 경계 / PageUp·Down ±1달 */
  #onGridKeydown = (e: KeyboardEvent): void => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-date]");
    if (!btn) return;
    const current = parseISODate(btn.dataset.date ?? "");
    if (!current) return;
    let next: Date | null = null;
    switch (e.key) {
      case "ArrowRight":
        next = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
        break;
      case "ArrowLeft":
        next = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1);
        break;
      case "ArrowDown":
        next = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7);
        break;
      case "ArrowUp":
        next = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 7);
        break;
      case "Home":
        next = new Date(current.getFullYear(), current.getMonth(), current.getDate() - current.getDay());
        break;
      case "End":
        next = new Date(
          current.getFullYear(),
          current.getMonth(),
          current.getDate() + (6 - current.getDay()),
        );
        break;
      case "PageUp":
        next = new Date(current.getFullYear(), current.getMonth() - 1, current.getDate());
        break;
      case "PageDown":
        next = new Date(current.getFullYear(), current.getMonth() + 1, current.getDate());
        break;
      default:
        return;
    }
    e.preventDefault();
    this.#focusDate = next;
    this.#ensureVisible(next);
    this.#paint();
    this.#monthsEl
      .querySelector<HTMLButtonElement>(`[data-date="${formatISODate(next)}"]`)
      ?.focus();
  };

  /** 이동한 날짜가 보이는 달 밖이면 뷰를 그쪽으로 넘긴다 */
  #ensureVisible(date: Date): void {
    const count = this.#monthCount();
    const firstIndex = this.#viewYear * 12 + this.#viewMonth;
    const target = date.getFullYear() * 12 + date.getMonth();
    if (target >= firstIndex && target < firstIndex + count) return;
    const nextFirst = target < firstIndex ? target : target - (count - 1);
    this.#viewYear = Math.floor(nextFirst / 12);
    this.#viewMonth = nextFirst % 12;
    this.#renderedKey = "";
    this.#renderMonths();
  }
}
