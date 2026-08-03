/**
 * <jd-gantt-chart> — 프로젝트 일정 타임라인 (v2 patterns/GanttChart).
 * v2처럼 **DOM 막대**로 그린다(SVG 아님) — 좌측 태스크명은 sticky, 우측은 절대배치
 * 막대. jd-funnel-chart와 같은 "보이는 DOM이 값을 말한다" 계열이라 별도 숨김 표를
 * 두지 않고, 막대 버튼의 aria-label에 기간·진행률을 담는다.
 *
 * 복합 데이터(§1.3): `tasks`는 property 전용 + 자식 `<script type="application/json">`
 * 슬롯. 날짜는 Date·number·"YYYY-MM-DD" 무엇이 와도 core/date의 파서가 로컬 자정
 * 기준으로 읽는다(§규범 2 — `new Date("2026-07-24")`의 UTC 하루 밀림 함정 회피).
 *
 * v2 대비 교정:
 *  1. **주 눈금이 `toLocaleDateString`이었다** — 실행 환경 로케일에 따라 결과가 달라져
 *     프리렌더 HTML과 방문자 렌더가 어긋난다(§3.1-3). 결정적 "월/일"로 끊는다.
 *  2. **막대가 이름·진행률만 시각으로 말하고 AT엔 없었다** — 버튼 aria-label에
 *     시작~종료·진행률을 담고, 호스트를 role=figure로 감싼다.
 *  3. **진행률이 클램프되지 않으면 채움 폭이 넘쳤다** — 0~100 클램프(v2도 클램프하지만
 *     명시).
 *
 * 이벤트(§1.5): `jd-select` {task} — 막대 클릭(v2 onSelect).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { formatDotDate, toDayStart, toEpochMs } from "../../core/date.js";
import ganttChartStyles from "./gantt-chart.css.js";

export interface JdGanttTask {
  id: string;
  name: string;
  /** 시작일 (Date · number · "YYYY-MM-DD" · ISO) */
  start: Date | string | number;
  /** 종료일(포함) */
  end: Date | string | number;
  /** 진행률 0~100 */
  progress?: number;
  /** 막대 색(임의 CSS 색) */
  color?: string;
  dependsOn?: string[];
}

const DAY_MS = 86_400_000;

function toDate(v: unknown): Date | null {
  const ms = toEpochMs(v);
  return Number.isFinite(ms) ? new Date(ms) : null;
}
function dayDiff(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

export class JdGanttChart extends JdElement {
  static override tag = "jd-gantt-chart";
  static override props = {
    dayWidth: { type: Number, default: 24, attribute: "day-width" },
    rowHeight: { type: Number, default: 32, attribute: "row-height" },
    labelWidth: { type: Number, default: 160, attribute: "label-width" },
    /** 좌측 헤더 문구 */
    labelHeader: { type: String, default: "태스크", attribute: "label-header" },
    /** 접근 이름 */
    label: { type: String, default: "간트 차트" },
    emptyText: { type: String, default: "표시할 태스크가 없습니다.", attribute: "empty-text" },
  };

  declare dayWidth: number;
  declare rowHeight: number;
  declare labelWidth: number;
  declare labelHeader: string;
  declare label: string;
  declare emptyText: string;

  #tasks: JdGanttTask[] = [];
  #scroll!: HTMLElement;

  get tasks(): JdGanttTask[] {
    return this.#tasks;
  }
  set tasks(v: JdGanttTask[]) {
    this.#tasks = Array.isArray(v) ? v.map((t) => ({ ...t })) : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(ganttChartStyles);
    this.#upgradeOwn("tasks");
    this.#readJson();

    if (!this.hasAttribute("role")) this.setAttribute("role", "figure");

    const existing = this.querySelector<HTMLElement>(":scope > .jd-gantt__scroll");
    if (existing) {
      this.#scroll = existing;
    } else {
      this.#scroll = document.createElement("div");
      this.#scroll.className = "jd-gantt__scroll";
      this.append(this.#scroll);
    }
    this.update();
  }

  #upgradeOwn(name: string): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const self = this as unknown as Record<string, unknown>;
    const v = self[name];
    delete self[name];
    self[name] = v;
  }

  #readJson(): void {
    if (this.#tasks.length > 0) return;
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]");
      if (Array.isArray(parsed)) this.#tasks = parsed.map((t) => ({ ...t }));
    } catch {
      console.warn("[junds] <jd-gantt-chart> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override connected(): void {
    this.#scroll.addEventListener("click", this.#onClick);
  }

  protected override disconnected(): void {
    this.#scroll?.removeEventListener("click", this.#onClick);
  }

  protected override update(): void {
    this.setAttribute("aria-label", this.label);
    this.#scroll.textContent = "";

    const tasks = this.#tasks.filter((t) => toDate(t.start) && toDate(t.end));
    if (tasks.length === 0) {
      const empty = document.createElement("p");
      empty.className = "jd-gantt__empty";
      empty.textContent = this.emptyText;
      this.#scroll.append(empty);
      return;
    }

    const dayW = Math.max(1, this.dayWidth);
    const rowH = Math.max(1, this.rowHeight);
    const labelW = Math.max(0, this.labelWidth);

    const starts = tasks.map((t) => toDate(t.start)!.getTime());
    const ends = tasks.map((t) => toDate(t.end)!.getTime());
    const min = toDayStart(new Date(Math.min(...starts)));
    const max = new Date(Math.max(...ends));
    const totalDays = dayDiff(min, max) + 1;
    const totalWidth = totalDays * dayW;

    const inner = document.createElement("div");
    inner.className = "jd-gantt__inner";
    inner.style.minWidth = `${labelW + totalWidth}px`;

    /* ── 좌측 라벨(sticky) ── */
    const labels = document.createElement("div");
    labels.className = "jd-gantt__labels";
    labels.style.width = `${labelW}px`;
    labels.style.minWidth = `${labelW}px`;
    const labelHead = document.createElement("div");
    labelHead.className = "jd-gantt__label-head";
    labelHead.style.height = "2rem";
    labelHead.textContent = this.labelHeader;
    labels.append(labelHead);
    for (const t of tasks) {
      const row = document.createElement("div");
      row.className = "jd-gantt__label-row";
      row.style.height = `${rowH}px`;
      row.title = t.name;
      row.textContent = t.name;
      labels.append(row);
    }

    /* ── 타임라인 ── */
    const timeline = document.createElement("div");
    timeline.className = "jd-gantt__timeline";
    timeline.style.width = `${totalWidth}px`;

    const header = document.createElement("div");
    header.className = "jd-gantt__timeline-header";
    header.style.height = "2rem";
    for (let i = 0; i < totalDays; i += 1) {
      const d = new Date(min.getTime() + i * DAY_MS);
      if (d.getDay() !== 1 && i !== 0) continue; // 월요일 또는 첫날에만 눈금(v2 동형)
      const tick = document.createElement("span");
      tick.className = "jd-gantt__week";
      tick.style.left = `${i * dayW}px`;
      tick.textContent = `${d.getMonth() + 1}/${d.getDate()}`;
      header.append(tick);
    }
    timeline.append(header);

    tasks.forEach((t, i) => {
      const start = toDate(t.start)!;
      const end = toDate(t.end)!;
      const offset = dayDiff(min, start) * dayW;
      const width = Math.max(dayW, (dayDiff(start, end) + 1) * dayW);
      const progress = Math.max(0, Math.min(100, t.progress ?? 0));

      const row = document.createElement("div");
      row.className = "jd-gantt__row";
      row.style.height = `${rowH}px`;

      const bar = document.createElement("button");
      bar.type = "button";
      bar.className = "jd-gantt__bar";
      bar.dataset.taskIndex = String(i);
      bar.style.left = `${offset}px`;
      bar.style.width = `${width}px`;
      if (t.color) bar.style.setProperty("--jd-bar-color", t.color);
      const range = `${formatDotDate(start)} ~ ${formatDotDate(end)}`;
      bar.setAttribute(
        "aria-label",
        progress > 0 ? `${t.name}: ${range}, ${progress}% 완료` : `${t.name}: ${range}`,
      );
      bar.title = `${t.name} (${range})`;

      const fill = document.createElement("span");
      fill.className = "jd-gantt__fill";
      fill.style.width = `${progress}%`;
      fill.setAttribute("aria-hidden", "true");
      const text = document.createElement("span");
      text.className = "jd-gantt__bar-text";
      text.textContent = progress > 0 ? `${t.name} · ${progress}%` : t.name;

      bar.append(fill, text);
      row.append(bar);
      timeline.append(row);
    });

    inner.append(labels, timeline);
    this.#scroll.append(inner);
  }

  #onClick = (e: Event): void => {
    const bar = (e.target as Element | null)?.closest<HTMLElement>(".jd-gantt__bar");
    if (!bar) return;
    const i = Number(bar.dataset.taskIndex);
    const tasks = this.#tasks.filter((t) => toDate(t.start) && toDate(t.end));
    const task = tasks[i];
    if (task) this.emit("jd-select", { task });
  };
}
