/**
 * <jd-date-range-filter> — 시작일/종료일 입력 + 조회·초기화 + 기간 프리셋 (v2 composites/DateRangeFilter).
 *
 * 프리셋 데이터 모델 변경: v2 `DatePreset.getRange: () => {start, end}`는 **함수**라
 * 선언적 초기화(JSON 슬롯)·SSR 직렬화가 불가능하고, 렌더마다 호출돼 시계를 읽는다
 * (§3.1-3 위반). v3는 선언형 서술(`kind: "today"|"month"` · `days: N` · 명시
 * `start`/`end`)을 1급으로 두고, 함수형 `getRange`는 JS 소비자용 탈출구로만 남긴다.
 * "오늘"은 connected() 이후에 1회 읽어 주입된다 — render()는 시계를 읽지 않는다.
 *
 * 자식 <jd-date-input>을 쓰지 않는 이유: element.ts는 부작용 0이어야 하고(§6.2)
 * 다른 컴포넌트의 index.js(define 부작용)를 import하면 그 계약이 깨진다. 네이티브
 * <input type="date">를 직접 쓰면 폼 참여·달력 UI가 그대로이면서 의존이 생기지 않는다.
 *
 * v2 대비 보정 3건:
 *  1. 프리셋 활성 상태가 색뿐이었다 → aria-pressed.
 *  2. 필드 묶음에 이름이 없었다 → role="group" + aria-label(입력·프리셋 각각).
 *  3. 시작>종료 역전을 막지 않았다 → 네이티브 min/max를 서로 물려 브라우저가 막는다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { addDays, formatISODate } from "../../core/date.js";
import dateRangeFilterStyles from "./date-range-filter.css.js";

export interface JdDatePreset {
  key: string;
  label: string;
  /** 명시 범위 "YYYY-MM-DD" — 시계와 무관한 고정 구간 */
  start?: string;
  end?: string;
  /** 오늘 포함 최근 N일 */
  days?: number;
  /** today: 오늘 하루 · month: 이번 달 1일~오늘 */
  kind?: "today" | "month";
  /** JS 소비자용 탈출구. 있으면 최우선 (선언형으로 표현 못 하는 구간용) */
  getRange?: () => { start: Date; end: Date };
}

const DEFAULT_PRESETS: readonly JdDatePreset[] = [
  { key: "today", label: "오늘", kind: "today" },
  { key: "7days", label: "최근 7일", days: 7 },
  { key: "30days", label: "최근 30일", days: 30 },
  { key: "month", label: "이번 달", kind: "month" },
];

export class JdDateRangeFilter extends JdElement {
  static override tag = "jd-date-range-filter";
  static override props = {
    startDate: { type: String },
    endDate: { type: String },
    applyLabel: { type: String, default: "조회" },
    resetLabel: { type: String, default: "초기화" },
    startLabel: { type: String, default: "시작일" },
    endLabel: { type: String, default: "종료일" },
    /** 초기화 버튼 노출 (v2는 onReset 전달 여부가 곧 노출 조건이었다) */
    resettable: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  declare startDate: string;
  declare endDate: string;
  declare applyLabel: string;
  declare resetLabel: string;
  declare startLabel: string;
  declare endLabel: string;
  declare resettable: boolean;
  declare disabled: boolean;

  #presets: readonly JdDatePreset[] = DEFAULT_PRESETS;
  /** connected() 이후에만 채워진다 (§3.1-3) */
  #today: Date | null = null;

  #start!: HTMLInputElement;
  #end!: HTMLInputElement;
  #apply!: HTMLButtonElement;
  #reset!: HTMLButtonElement;
  #presetRow!: HTMLDivElement;

  /** 프리셋 목록 — property 또는 자식 <script type="application/json"> 슬롯 */
  get presets(): readonly JdDatePreset[] {
    return this.#presets;
  }
  set presets(v: readonly JdDatePreset[]) {
    this.#presets = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(dateRangeFilterStyles);
    this.#readJsonSlot();
    // 입양 규칙(§3.3)
    const existing = this.querySelector<HTMLInputElement>('[data-field="start"]');
    if (existing) {
      this.#start = existing;
      this.#end = this.querySelector<HTMLInputElement>('[data-field="end"]')!;
      this.#apply = this.querySelector<HTMLButtonElement>(".jd-date-range-filter__apply")!;
      this.#reset = this.querySelector<HTMLButtonElement>(".jd-date-range-filter__reset")!;
      this.#presetRow = this.querySelector<HTMLDivElement>(".jd-date-range-filter__presets")!;
    } else {
      this.#build();
    }
    this.setAttribute("role", "group");
    if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", "날짜 범위 필터");
    this.#start.addEventListener("change", this.#onFieldChange);
    this.#end.addEventListener("change", this.#onFieldChange);
    this.#apply.addEventListener("click", this.#onApply);
    this.#reset.addEventListener("click", this.#onReset);
    this.#presetRow.addEventListener("click", this.#onPresetClick);
    this.update();
  }

  #build(): void {
    const row = document.createElement("div");
    row.className = "jd-date-range-filter__row";

    this.#start = document.createElement("input");
    this.#start.type = "date";
    this.#start.className = "jd-date-range-filter__input";
    this.#start.dataset.field = "start";

    const sep = document.createElement("span");
    sep.className = "jd-date-range-filter__sep";
    sep.setAttribute("aria-hidden", "true");
    sep.textContent = "~";

    this.#end = document.createElement("input");
    this.#end.type = "date";
    this.#end.className = "jd-date-range-filter__input";
    this.#end.dataset.field = "end";

    this.#apply = document.createElement("button");
    this.#apply.type = "button";
    this.#apply.className = "jd-date-range-filter__apply";

    this.#reset = document.createElement("button");
    this.#reset.type = "button";
    this.#reset.className = "jd-date-range-filter__reset";

    row.append(this.#start, sep, this.#end, this.#apply, this.#reset);

    this.#presetRow = document.createElement("div");
    this.#presetRow.className = "jd-date-range-filter__presets";
    this.#presetRow.setAttribute("role", "group");
    this.#presetRow.setAttribute("aria-label", "기간 프리셋");

    this.append(row, this.#presetRow);
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as JdDatePreset[];
      if (Array.isArray(parsed)) this.#presets = parsed;
    } catch {
      console.warn("[junds] <jd-date-range-filter> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override connected(): void {
    // "오늘"은 여기서 1회만 읽는다 — render()는 결정적으로 유지(§3.1-3)
    this.#today = new Date();
    this.update();
  }

  protected override update(): void {
    this.#start.value = this.startDate;
    this.#end.value = this.endDate;
    this.#start.setAttribute("aria-label", this.startLabel);
    this.#end.setAttribute("aria-label", this.endLabel);
    // 역전 방지 — 브라우저가 직접 막는다(v2에는 없던 보정)
    if (this.endDate) this.#start.max = this.endDate;
    else this.#start.removeAttribute("max");
    if (this.startDate) this.#end.min = this.startDate;
    else this.#end.removeAttribute("min");

    this.#start.disabled = this.disabled;
    this.#end.disabled = this.disabled;
    this.#apply.textContent = this.applyLabel;
    this.#apply.disabled = this.disabled;
    this.#reset.textContent = this.resetLabel;
    this.#reset.disabled = this.disabled;
    this.#reset.hidden = !this.resettable;

    this.#renderPresets();
  }

  #renderPresets(): void {
    const list = this.#presets;
    const row = this.#presetRow;
    row.hidden = list.length === 0;
    if (row.children.length !== list.length) {
      row.textContent = "";
      for (const p of list) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "jd-date-range-filter__preset";
        btn.dataset.key = p.key;
        row.append(btn);
      }
    }
    for (let i = 0; i < list.length; i += 1) {
      const preset = list[i]!;
      const btn = row.children[i] as HTMLButtonElement;
      btn.textContent = preset.label;
      btn.dataset.key = preset.key;
      btn.disabled = this.disabled;
      const range = this.#resolve(preset);
      const active = Boolean(
        range && range.start === this.startDate && range.end === this.endDate && this.startDate,
      );
      btn.setAttribute("aria-pressed", String(active));
    }
  }

  /** 프리셋 서술 → 실제 구간. "오늘"이 아직 없으면(=connected 이전) null */
  #resolve(preset: JdDatePreset): { start: string; end: string } | null {
    if (typeof preset.getRange === "function") {
      try {
        const r = preset.getRange();
        return { start: formatISODate(r.start), end: formatISODate(r.end) };
      } catch {
        return null;
      }
    }
    if (preset.start || preset.end) {
      return { start: preset.start ?? "", end: preset.end ?? "" };
    }
    const today = this.#today;
    if (!today) return null;
    if (preset.kind === "month") {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: formatISODate(first), end: formatISODate(today) };
    }
    if (preset.kind === "today") {
      const iso = formatISODate(today);
      return { start: iso, end: iso };
    }
    if (typeof preset.days === "number" && preset.days > 0) {
      // v2: 최근 7일 = 오늘 포함 6일 전부터
      return { start: formatISODate(addDays(today, -(preset.days - 1))), end: formatISODate(today) };
    }
    return null;
  }

  #onFieldChange = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    if (input.dataset.field === "start") this.startDate = input.value;
    else this.endDate = input.value;
    this.#emitChange();
  };

  #onPresetClick = (e: Event): void => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-key]");
    if (!btn || btn.disabled) return;
    const preset = this.#presets.find((p) => p.key === btn.dataset.key);
    if (!preset) return;
    const range = this.#resolve(preset);
    if (!range) return;
    this.startDate = range.start;
    this.endDate = range.end;
    this.emit("jd-select", { key: preset.key, ...range });
    this.#emitChange();
  };

  #onApply = (): void => {
    this.emit("jd-apply", { startDate: this.startDate, endDate: this.endDate });
  };

  #onReset = (): void => {
    this.startDate = "";
    this.endDate = "";
    this.emit("jd-reset");
    this.#emitChange();
  };

  #emitChange(): void {
    this.emit("jd-change", { startDate: this.startDate, endDate: this.endDate });
  }
}
