/**
 * <jd-daily-themes-calendar> — 주간 5열 테마 캘린더 (v2 finance/DailyThemesCalendar).
 *
 * v2는 셀·주간요약 안에서 상태를 열고 DayDetailDrawer/ThemeDrillDown을 직접 띄웠다. DS
 * 컴포넌트는 오버레이 소유를 앱에 넘긴다: 날짜 클릭은 jd-day-select {date}, 테마 클릭은
 * jd-theme-select {theme}로 위임한다. 주간 요약 집계(코스피·평가 변동·주도 테마·왕관)는
 * week 배열에서 순수 계산한다.
 *
 * v2 대비 개선: v2는 <button> 안에 role=button div(테마칩)를 중첩해 유효하지 않은 마크업이었다.
 * v3는 셀을 <div>로 두고 셀 전체를 덮는 히트 <button>(pointer-events)로 날짜를 열되, 테마칩은
 * 그 위에 뜨는 별도 버튼으로 분리한다 — 버튼 중첩 없이 두 상호작용이 공존한다.
 * 결정적 렌더: colorFor는 해시(랜덤/Date 없음).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import dailyThemesCalendarStyles from "./daily-themes-calendar.css.js";

export interface JdThemeLeader {
  name: string;
  close: number;
  pct: number;
}
export interface JdDailyThemeEntry {
  date: string;
  weekday: number;
  isToday?: boolean;
  isHoliday?: boolean;
  holidayName?: string;
  kospiClose: number;
  "거래대금변동": number;
  "코스피변동": number;
  portfolio: number;
  themes: string[];
  leaders?: JdThemeLeader[];
}

const SVG_NS = "http://www.w3.org/2000/svg";
const ICON_LINE = '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>';
const ICON_WALLET =
  '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 1 1-1v-4"/>';
const ICON_CROWN =
  '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>';

const WEEKDAYS = ["월", "화", "수", "목", "금"];

function iconSvg(paths: string, size: number, cls: string, sw = "2.2"): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", cls);
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", sw);
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = paths;
  return svg;
}

/** 테마명 → 결정적 카테고리 색 슬롯(1..8) */
function colorVarFor(theme: string): string {
  let h = 0;
  for (let i = 0; i < theme.length; i++) h = (h * 31 + theme.charCodeAt(i)) | 0;
  return `var(--jd-fin-cat-${(Math.abs(h) % 8) + 1})`;
}

function fmtMoney(won: number): string {
  if (won >= 100_000_000) return `${(won / 100_000_000).toFixed(2)}억`;
  if (won >= 10_000) return `${Math.round(won / 10_000).toLocaleString("ko-KR")}만`;
  return won.toLocaleString("ko-KR");
}

const pct2 = (v: number): string => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;

export class JdDailyThemesCalendar extends JdElement {
  static override tag = "jd-daily-themes-calendar";
  static override props = {};

  #weeks: JdDailyThemeEntry[][] = [];
  #grid!: HTMLElement;

  get weeks(): JdDailyThemeEntry[][] {
    return this.#weeks;
  }
  set weeks(v: JdDailyThemeEntry[][]) {
    this.#weeks = Array.isArray(v) ? v : [];
    if (this.#grid) this.#renderWeeks();
  }

  protected render(): void {
    adoptStyles(dailyThemesCalendarStyles);
    this.#readJson();
    this.#grid = document.createElement("div");
    this.#grid.className = "jd-daily-themes-calendar__grid";
    this.append(this.#grid);
    this.#renderWeeks();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as JdDailyThemeEntry[][];
      if (Array.isArray(parsed)) this.#weeks = parsed;
    } catch {
      /* 무시 */
    }
    script.remove();
  }

  #renderWeeks(): void {
    this.#grid.textContent = "";

    // 요일 헤더
    const header = document.createElement("div");
    header.className = "jd-daily-themes-calendar__header";
    for (const d of WEEKDAYS) {
      const cell = document.createElement("span");
      cell.className = "jd-daily-themes-calendar__weekday";
      cell.textContent = d;
      header.append(cell);
    }
    const summaryHead = document.createElement("span");
    summaryHead.className = "jd-daily-themes-calendar__weekday jd-daily-themes-calendar__summary-head";
    summaryHead.textContent = "주간 요약";
    header.append(summaryHead);
    this.#grid.append(header);

    // 주별 행
    this.#weeks.forEach((week, wi) => {
      const row = document.createElement("div");
      row.className = "jd-daily-themes-calendar__week";
      if (wi === this.#weeks.length - 1) row.dataset.last = "";
      for (let ci = 0; ci < 5; ci++) {
        const entry = week.find((e) => e.weekday === ci + 1);
        row.append(entry ? this.#buildDayCell(entry) : this.#emptyCell());
      }
      row.append(this.#buildWeekSummary(week));
      this.#grid.append(row);
    });
  }

  #emptyCell(): HTMLElement {
    const cell = document.createElement("div");
    cell.className = "jd-daily-themes-calendar__cell jd-daily-themes-calendar__cell--blank";
    return cell;
  }

  #dayNumber(date: string): string {
    return String(Number(date.split("-")[2] ?? 0));
  }

  #buildDayCell(entry: JdDailyThemeEntry): HTMLElement {
    const day = this.#dayNumber(entry.date);

    // 휴장일
    if (entry.isHoliday) {
      const cell = document.createElement("div");
      cell.className = "jd-daily-themes-calendar__cell jd-daily-themes-calendar__cell--holiday";
      const num = document.createElement("div");
      num.className = "jd-daily-themes-calendar__holiday-day";
      num.textContent = day;
      const tag = document.createElement("div");
      tag.className = "jd-daily-themes-calendar__holiday-tag";
      const dot = document.createElement("span");
      dot.className = "jd-daily-themes-calendar__holiday-dot";
      tag.append(dot, document.createTextNode("휴장일"));
      cell.append(num, tag);
      if (entry.holidayName) {
        const name = document.createElement("div");
        name.className = "jd-daily-themes-calendar__holiday-name";
        name.textContent = entry.holidayName;
        cell.append(name);
      }
      return cell;
    }

    // 미래(데이터 없음)
    const isFuture = !entry.isToday && !entry.isHoliday && entry.kospiClose === 0;
    if (isFuture) {
      const cell = document.createElement("div");
      cell.className = "jd-daily-themes-calendar__cell jd-daily-themes-calendar__cell--future";
      const num = document.createElement("div");
      num.className = "jd-daily-themes-calendar__future-day";
      num.textContent = day;
      cell.append(num);
      return cell;
    }

    // 정상
    const cell = document.createElement("div");
    cell.className = "jd-daily-themes-calendar__cell jd-daily-themes-calendar__cell--day";
    if (entry.isToday) cell.dataset.today = "";

    // 셀 전체 히트 버튼 — 날짜 상세 열기
    const hit = document.createElement("button");
    hit.type = "button";
    hit.className = "jd-daily-themes-calendar__hit";
    hit.setAttribute("aria-label", `${day}일 상세 보기`);
    hit.addEventListener("click", () => this.emit("jd-day-select", { date: entry.date }));
    cell.append(hit);

    const content = document.createElement("div");
    content.className = "jd-daily-themes-calendar__content";

    // 헤더: 날짜 + pct 칩
    const head = document.createElement("header");
    head.className = "jd-daily-themes-calendar__day-head";
    const num = document.createElement("span");
    num.className = "jd-daily-themes-calendar__day-num";
    num.textContent = day;
    const chips = document.createElement("div");
    chips.className = "jd-daily-themes-calendar__pct-chips";
    chips.append(this.#pctChip("거", entry["거래대금변동"]));
    chips.append(this.#pctChip("코", entry["코스피변동"]));
    head.append(num, chips);
    content.append(head);

    // 데이터 행
    const data = document.createElement("div");
    data.className = "jd-daily-themes-calendar__data";
    data.append(
      this.#dataRow(ICON_LINE, "코스피",
        entry.kospiClose.toLocaleString("ko-KR", { maximumFractionDigits: 2 })),
    );
    const evalRow = this.#dataRow(ICON_WALLET, "평가", fmtMoney(entry.portfolio));
    if (entry.portfolio >= 70_000_000) evalRow.querySelector(".jd-daily-themes-calendar__data-value")!.setAttribute("data-tone", "up");
    data.append(evalRow);
    content.append(data);

    // 테마칩
    if (entry.themes.length) {
      const themeWrap = document.createElement("div");
      themeWrap.className = "jd-daily-themes-calendar__themes";
      for (const theme of entry.themes.slice(0, 4)) {
        themeWrap.append(this.#themeChip(theme, colorVarFor(theme)));
      }
      content.append(themeWrap);
    }

    // 왕관 종목
    if (entry.leaders?.length) {
      const list = document.createElement("ul");
      list.className = "jd-daily-themes-calendar__leaders";
      for (const leader of entry.leaders) {
        const up = leader.pct >= 0;
        const li = document.createElement("li");
        li.className = "jd-daily-themes-calendar__leader";
        li.append(iconSvg(ICON_CROWN, 10, "jd-daily-themes-calendar__crown", "2.4"));
        const name = document.createElement("span");
        name.className = "jd-daily-themes-calendar__leader-name";
        name.textContent = leader.name;
        const close = document.createElement("span");
        close.className = "jd-daily-themes-calendar__leader-close";
        close.textContent = leader.close.toLocaleString("ko-KR");
        const pctEl = document.createElement("span");
        pctEl.className = "jd-daily-themes-calendar__leader-pct";
        pctEl.dataset.tone = up ? "up" : "down";
        pctEl.textContent = `${up ? "+" : ""}${leader.pct.toFixed(1)}%`;
        li.append(name, close, pctEl);
        list.append(li);
      }
      content.append(list);
    }

    cell.append(content);
    return cell;
  }

  #pctChip(label: string, value: number): HTMLElement {
    const chip = document.createElement("span");
    chip.className = "jd-daily-themes-calendar__pct-chip";
    chip.dataset.tone = value >= 0 ? "up" : "down";
    const l = document.createElement("span");
    l.className = "jd-daily-themes-calendar__pct-chip-label";
    l.textContent = label;
    chip.append(l, document.createTextNode(pct2(value)));
    return chip;
  }

  #dataRow(icon: string, label: string, value: string): HTMLElement {
    const row = document.createElement("div");
    row.className = "jd-daily-themes-calendar__data-row";
    const left = document.createElement("span");
    left.className = "jd-daily-themes-calendar__data-label";
    left.append(iconSvg(icon, 10, "jd-daily-themes-calendar__data-icon"), document.createTextNode(label));
    const val = document.createElement("span");
    val.className = "jd-daily-themes-calendar__data-value";
    val.textContent = value;
    row.append(left, val);
    return row;
  }

  #themeChip(theme: string, colorVar: string): HTMLButtonElement {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "jd-daily-themes-calendar__theme-chip";
    chip.textContent = theme;
    chip.style.color = colorVar;
    chip.style.background = `color-mix(in srgb, ${colorVar} 10%, transparent)`;
    chip.style.borderColor = `color-mix(in srgb, ${colorVar} 20%, transparent)`;
    chip.addEventListener("click", (e) => {
      e.stopPropagation();
      this.emit("jd-theme-select", { theme });
    });
    return chip;
  }

  #buildWeekSummary(week: JdDailyThemeEntry[]): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "jd-daily-themes-calendar__summary";

    const trading = week.filter((e) => !e.isHoliday && e.kospiClose > 0);
    if (trading.length === 0) {
      wrap.dataset.empty = "";
      wrap.textContent = "—";
      return wrap;
    }

    const first = trading[0]!;
    const last = trading[trading.length - 1]!;
    const kospiPct = ((last.kospiClose - first.kospiClose) / first.kospiClose) * 100;
    const portfolioPct = first.portfolio
      ? ((last.portfolio - first.portfolio) / first.portfolio) * 100
      : 0;

    wrap.append(this.#summaryRow("코스피", pct2(kospiPct), kospiPct >= 0 ? "up" : "down"));
    wrap.append(this.#summaryRow("평가", pct2(portfolioPct), portfolioPct >= 0 ? "up" : "down"));
    wrap.append(this.#summaryRow("영업일", `${trading.length}일`));

    // 주도 테마
    const themeCount = new Map<string, number>();
    trading.forEach((d) => d.themes.forEach((t) => themeCount.set(t, (themeCount.get(t) ?? 0) + 1)));
    const dominant = [...themeCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([t]) => t);
    if (dominant.length) {
      const block = document.createElement("div");
      block.className = "jd-daily-themes-calendar__summary-block";
      const label = document.createElement("div");
      label.className = "jd-daily-themes-calendar__summary-label";
      label.textContent = "주도 테마";
      const chips = document.createElement("div");
      chips.className = "jd-daily-themes-calendar__summary-themes";
      for (const t of dominant) {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "jd-daily-themes-calendar__summary-theme";
        chip.textContent = t;
        chip.addEventListener("click", () => this.emit("jd-theme-select", { theme: t }));
        chips.append(chip);
      }
      block.append(label, chips);
      wrap.append(block);
    }

    // 왕관 종목
    const leaderSet = new Map<string, number>();
    trading.forEach((d) => d.leaders?.forEach((l) => leaderSet.set(l.name, (leaderSet.get(l.name) ?? 0) + 1)));
    const topLeaders = [...leaderSet.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([n]) => n);
    if (topLeaders.length) {
      const block = document.createElement("div");
      block.className = "jd-daily-themes-calendar__summary-block";
      const label = document.createElement("div");
      label.className = "jd-daily-themes-calendar__summary-label";
      label.textContent = "왕관 종목";
      const list = document.createElement("ul");
      list.className = "jd-daily-themes-calendar__summary-leaders";
      for (const n of topLeaders) {
        const li = document.createElement("li");
        li.className = "jd-daily-themes-calendar__summary-leader";
        li.append(iconSvg(ICON_CROWN, 9, "jd-daily-themes-calendar__crown", "2.4"));
        li.append(document.createTextNode(n));
        list.append(li);
      }
      block.append(label, list);
      wrap.append(block);
    }

    return wrap;
  }

  #summaryRow(label: string, value: string, tone?: "up" | "down"): HTMLElement {
    const row = document.createElement("div");
    row.className = "jd-daily-themes-calendar__summary-row";
    const l = document.createElement("span");
    l.className = "jd-daily-themes-calendar__summary-row-label";
    l.textContent = label;
    const v = document.createElement("span");
    v.className = "jd-daily-themes-calendar__summary-row-value";
    if (tone) v.dataset.tone = tone;
    v.textContent = value;
    row.append(l, v);
    return row;
  }
}
