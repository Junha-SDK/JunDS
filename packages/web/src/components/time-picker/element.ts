/**
 * <jd-time-picker> — 시/분(+오전·오후) 열 선택기 (v2 composites/TimePicker)
 *                    = JdPickerField 파생.
 *
 * 값은 항상 24시제 "HH:mm"이고 `format="12h"`는 **표시 방식만** 바꾼다(v2 동형) —
 * 표시 형식이 값 형식을 오염시키면 폼 제출·비교가 형식에 물든다.
 *
 * v2 대비 접근성 보정 3건:
 *  1. 열이 `div.overflow-auto` + 버튼 86개였다. 24+60+2 전부가 탭스톱이라 키보드로는
 *     사실상 통과 불가능했다 → 열마다 role="listbox" 1개 탭스톱 +
 *     aria-activedescendant 이동(APG Listbox 패턴). 탭스톱이 86 → 3이 된다.
 *  2. 선택 상태가 배경색뿐이었다 → role="option" + aria-selected.
 *  3. 열에 이름이 없었다 → aria-label "시"/"분"/"오전 오후".
 *
 * 열기 시 선택값으로 스크롤하는 v2 동작은 유지하되 `idx * 32`(하드코딩 행 높이) 대신
 * 실측 offsetTop을 쓴다 — 폰트 크기·줌이 바뀌어도 어긋나지 않는다.
 */
import { JdPickerField } from "../../core/picker-field.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { formatTime, from12Hour, pad2, parseTime, to12Hour } from "../../core/date.js";
import timePickerStyles from "./time-picker.css.js";

const CLOCK_SVG =
  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.5"/>` +
  `<path d="M7 4v3.5l2.5 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

type ColumnKind = "hour" | "minute" | "period";

export class JdTimePicker extends JdPickerField {
  static override tag = "jd-time-picker";
  static override props = {
    ...JdPickerField.props,
    /** 24시제 "HH:mm" */
    value: { type: String },
    /** 12h | 24h — 표시 전용 */
    format: { type: String, default: "24h", reflect: true },
    /** 분 간격 (1~60) */
    minuteStep: { type: Number, default: 1 },
    placeholder: { type: String, default: "시간 선택" },
  };

  declare value: string;
  declare format: string;
  declare minuteStep: number;

  #uid = "";
  #cols = new Map<ColumnKind, HTMLDivElement>();
  #active = new Map<ColumnKind, number>();
  /** 값이 없을 때의 오전/오후 기준 — 값이 생기면 값에서 유도한다 */
  #period: "AM" | "PM" = "AM";
  #renderedKey = "";

  protected override render(): void {
    adoptStyles(timePickerStyles);
    super.render();
    this.update();
  }

  protected override triggerIcon(): string {
    return CLOCK_SVG;
  }

  protected override panelLabel(): string {
    return "시간 선택";
  }

  protected override displayText(): string {
    const t = parseTime(this.value);
    if (!t) return "";
    if (!this.#is12h()) return formatTime(t.hour, t.minute);
    return `${to12Hour(t.hour)}:${pad2(t.minute)} ${t.hour >= 12 ? "PM" : "AM"}`;
  }

  /** 멱등 — 이미 골격이 있으면(프리렌더 스냅샷) 붙잡기만 한다(§3.3) */
  protected override buildPanel(panel: HTMLElement): void {
    this.#uid = jdUid("jd-tp");
    this.#renderedKey = ""; // 입양한 항목도 새 uid 기준으로 다시 그린다
    panel.classList.add("jd-time-picker__panel");
    for (const kind of ["hour", "minute", "period"] as const) {
      let col = panel.querySelector<HTMLDivElement>(`:scope > [data-col="${kind}"]`);
      if (!col) {
        col = document.createElement("div");
        col.className = "jd-time-picker__col";
        col.dataset.col = kind;
        col.setAttribute("role", "listbox");
        col.setAttribute(
          "aria-label",
          kind === "hour" ? "시" : kind === "minute" ? "분" : "오전 오후",
        );
        col.tabIndex = 0;
        if (kind === "hour") col.setAttribute("data-autofocus", "");
        panel.append(col);
      }
      col.addEventListener("click", this.#onColClick);
      col.addEventListener("keydown", this.#onColKeydown);
      this.#cols.set(kind, col);
    }
  }

  protected override onPanelOpen(): void {
    this.#syncPeriodFromValue();
    this.#rebuild();
    this.#active.clear(); // 열 때는 현재 값 위치에서 시작한다
    this.#paint(true);
    this.#scrollActiveIntoView();
  }

  protected override update(): void {
    super.update();
    this.#syncPeriodFromValue();
    this.#rebuild();
    this.#paint(true);
  }

  #is12h(): boolean {
    return this.format === "12h";
  }

  #step(): number {
    const s = Math.round(this.minuteStep) || 1;
    return Math.max(1, Math.min(60, s));
  }

  #syncPeriodFromValue(): void {
    const t = parseTime(this.value);
    if (t) this.#period = t.hour >= 12 ? "PM" : "AM";
  }

  /** 열 옵션 재구축 — format·minuteStep이 바뀔 때만 */
  #rebuild(): void {
    const key = `${this.#is12h() ? "12" : "24"}-${this.#step()}`;
    if (key === this.#renderedKey) return;
    this.#renderedKey = key;

    const hourValues = this.#is12h()
      ? Array.from({ length: 12 }, (_, i) => i + 1)
      : Array.from({ length: 24 }, (_, i) => i);
    const minuteValues: number[] = [];
    for (let m = 0; m < 60; m += this.#step()) minuteValues.push(m);

    this.#fillColumn("hour", hourValues, (v) => pad2(v), (v) => `${v}시`);
    this.#fillColumn("minute", minuteValues, (v) => pad2(v), (v) => `${v}분`);
    this.#fillColumn(
      "period",
      [0, 1],
      (v) => (v === 0 ? "AM" : "PM"),
      (v) => (v === 0 ? "오전" : "오후"),
    );

    const period = this.#cols.get("period");
    if (period) period.hidden = !this.#is12h();
  }

  #fillColumn(
    kind: ColumnKind,
    values: number[],
    text: (v: number) => string,
    label: (v: number) => string,
  ): void {
    const col = this.#cols.get(kind);
    if (!col) return;
    col.textContent = "";
    for (const v of values) {
      const opt = document.createElement("div");
      opt.className = "jd-time-picker__opt";
      opt.id = `${this.#uid}-${kind}-${v}`;
      opt.setAttribute("role", "option");
      opt.setAttribute("aria-label", label(v));
      opt.dataset.value = String(v);
      opt.textContent = text(v);
      col.append(opt);
    }
  }

  /**
   * 선택·활성 상태 반영.
   * @param follow true면 활성 항목을 현재 값 위치로 되돌린다(값이 밖에서 바뀐 경우).
   *   화살표 이동 중에는 false — 사용자가 옮겨둔 활성 위치를 값이 덮지 않는다.
   */
  #paint(follow: boolean): void {
    const t = parseTime(this.value);
    const selected: Record<ColumnKind, number | null> = {
      hour: t ? (this.#is12h() ? to12Hour(t.hour) : t.hour) : null,
      minute: t ? t.minute : null,
      period: this.#is12h() ? (this.#period === "PM" ? 1 : 0) : null,
    };
    for (const kind of ["hour", "minute", "period"] as const) {
      const col = this.#cols.get(kind);
      if (!col) continue;
      const opts = col.children;
      const want = selected[kind];
      let activeIndex = this.#active.get(kind) ?? -1;
      let selectedIndex = -1;
      for (let i = 0; i < opts.length; i += 1) {
        const opt = opts[i] as HTMLElement;
        const isSelected = want !== null && Number(opt.dataset.value) === want;
        opt.setAttribute("aria-selected", String(isSelected));
        if (isSelected) selectedIndex = i;
      }
      if ((follow && selectedIndex >= 0) || activeIndex < 0 || activeIndex >= opts.length) {
        activeIndex = selectedIndex >= 0 ? selectedIndex : 0;
      }
      this.#active.set(kind, activeIndex);
      const activeOpt = opts[activeIndex] as HTMLElement | undefined;
      for (let i = 0; i < opts.length; i += 1) {
        (opts[i] as HTMLElement).toggleAttribute("data-active", i === activeIndex);
      }
      if (activeOpt) col.setAttribute("aria-activedescendant", activeOpt.id);
      else col.removeAttribute("aria-activedescendant");
    }
  }

  /** 열 때 선택값이 가운데 오도록 — v2의 하드코딩 행 높이(32px) 대신 실측 */
  #scrollActiveIntoView(): void {
    for (const [kind, col] of this.#cols) {
      if (col.hidden) continue;
      const index = this.#active.get(kind) ?? 0;
      const opt = col.children[index] as HTMLElement | undefined;
      if (!opt) continue;
      col.scrollTop = Math.max(0, opt.offsetTop - col.clientHeight / 2 + opt.offsetHeight / 2);
    }
  }

  #onColClick = (e: Event): void => {
    const opt = (e.target as HTMLElement).closest<HTMLElement>(".jd-time-picker__opt");
    const col = (e.currentTarget as HTMLDivElement) ?? null;
    if (!opt || !col) return;
    const kind = col.dataset.col as ColumnKind | undefined;
    if (!kind) return;
    const index = Array.prototype.indexOf.call(col.children, opt);
    this.#active.set(kind, index);
    this.#commit(kind, Number(opt.dataset.value));
    col.focus();
  };

  #onColKeydown = (e: KeyboardEvent): void => {
    const col = e.currentTarget as HTMLDivElement;
    const kind = col.dataset.col as ColumnKind | undefined;
    if (!kind) return;
    const count = col.children.length;
    if (!count) return;
    const current = this.#active.get(kind) ?? 0;
    let next = current;
    switch (e.key) {
      case "ArrowDown":
        next = Math.min(count - 1, current + 1);
        break;
      case "ArrowUp":
        next = Math.max(0, current - 1);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = count - 1;
        break;
      case "Enter":
      case " ": {
        e.preventDefault();
        const opt = col.children[current] as HTMLElement | undefined;
        if (opt) this.#commit(kind, Number(opt.dataset.value));
        return;
      }
      default:
        return;
    }
    e.preventDefault();
    this.#active.set(kind, next);
    this.#paint(false);
    const opt = col.children[next] as HTMLElement | undefined;
    // 활성 항목이 열 밖으로 나가지 않게 — 열 내부 스크롤만 움직인다
    if (opt) {
      if (opt.offsetTop < col.scrollTop) col.scrollTop = opt.offsetTop;
      else if (opt.offsetTop + opt.offsetHeight > col.scrollTop + col.clientHeight) {
        col.scrollTop = opt.offsetTop + opt.offsetHeight - col.clientHeight;
      }
    }
  };

  /** 열 선택 → 24시제 값 재조립 (v2 handleHourSelect/MinuteSelect/PeriodChange 통합) */
  #commit(kind: ColumnKind, raw: number): void {
    const t = parseTime(this.value);
    if (kind === "period") {
      const pm = raw === 1;
      this.#period = pm ? "PM" : "AM";
      if (!t) {
        // v2도 값이 없을 때는 통지하지 않는다 — 기준만 바꾼다
        this.#paint(false);
        return;
      }
      this.#setValue(from12Hour(to12Hour(t.hour), pm), t.minute);
      return;
    }
    if (kind === "hour") {
      const hour = this.#is12h() ? from12Hour(raw, this.#period === "PM") : raw;
      this.#setValue(hour, t?.minute ?? 0);
      return;
    }
    this.#setValue(t?.hour ?? 0, raw);
  }

  #setValue(hour: number, minute: number): void {
    const next = formatTime(hour, minute);
    if (next === this.value) {
      this.#paint(false);
      return;
    }
    this.value = next;
    this.emit("jd-change", { value: next, hour, minute });
    this.#paint(false);
  }
}
