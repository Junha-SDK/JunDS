/**
 * <jd-month-picker> — 연-월 선택기 (v2 composites/MonthPicker) = JdGridPicker 파생.
 * 12개월 3열 격자 + 연도 네비게이션. 셀 의미만 채우고 골격·키보드·로빙은 베이스가 갖는다.
 *
 * 값 표면: v2 `value: {year, month}` 객체 → `year`/`month` 숫자 프로퍼티(둘 다 attribute).
 * 객체는 attribute로 못 싣는다(§1.3). Date 없이 숫자 2개면 선언적 초기화가 성립한다.
 * v2의 제어/비제어(value vs defaultValue) 이중 표면은 CE의 단일 값 모델로 접었다 —
 * attribute가 초기값이고 이후 프로퍼티 대입이 덮는다(§1.3 마지막 쓰기 승리).
 */
import { JdGridPicker } from "../../core/grid-picker.js";
import { adoptStyles } from "../../core/styles.js";
import {
  MONTH_LABELS_KO,
  formatYearMonth,
  isYearMonthBefore,
  parseYearMonth,
} from "../../core/date.js";
import monthPickerStyles from "./month-picker.css.js";

export class JdMonthPicker extends JdGridPicker {
  static override tag = "jd-month-picker";
  static override props = {
    ...JdGridPicker.props,
    year: { type: Number, reflect: true },
    /** 1-12. 0이면 미선택 */
    month: { type: Number, reflect: true },
    /** "YYYY-MM" 하한/상한 (포함) */
    min: { type: String },
    max: { type: String },
  };

  declare year: number;
  declare month: number;
  declare min: string;
  declare max: string;

  #monthLabels: readonly string[] = MONTH_LABELS_KO;

  /** 월 이름 12개 — 복합 데이터라 property 전용(§1.3) */
  get monthLabels(): readonly string[] {
    return this.#monthLabels;
  }
  set monthLabels(v: readonly string[]) {
    if (!v || v.length !== 12) return;
    this.#monthLabels = v;
    this.requestUpdate();
  }

  /** "YYYY-MM" 편의 표면 */
  get value(): string {
    return this.year && this.month ? formatYearMonth(this.year, this.month) : "";
  }
  set value(v: string) {
    const ym = parseYearMonth(v);
    if (!ym) return;
    this.year = ym.year;
    this.month = ym.month;
  }

  protected override render(): void {
    adoptStyles(monthPickerStyles);
    super.render();
  }

  protected override columns(): number {
    return 3;
  }

  protected override cellCount(): number {
    return 12;
  }

  protected override cellText(index: number): string {
    return this.#monthLabels[index] ?? String(index + 1);
  }

  protected override cellAriaLabel(index: number): string {
    return `${this.viewBase}년 ${index + 1}월`;
  }

  protected override cellSelected(index: number): boolean {
    return this.year === this.viewBase && this.month === index + 1;
  }

  protected override cellDisabled(index: number): boolean {
    const candidate = { year: this.viewBase, month: index + 1 };
    const min = parseYearMonth(this.min);
    if (min && isYearMonthBefore(candidate, min)) return true;
    const max = parseYearMonth(this.max);
    if (max && isYearMonthBefore(max, candidate)) return true;
    return false;
  }

  protected override headerText(): string {
    return `${this.viewBase}년`;
  }

  protected override groupLabel(): string {
    return "연월 선택";
  }

  protected override prevLabel(): string {
    return "이전 연도";
  }

  protected override nextLabel(): string {
    return "다음 연도";
  }

  protected override pageDelta(): number {
    return 1; // 한 페이지 = 1년
  }

  protected override selectIndex(index: number): void {
    this.year = this.viewBase;
    this.month = index + 1;
    this.emit("jd-change", {
      year: this.year,
      month: this.month,
      value: formatYearMonth(this.year, this.month),
    });
  }

  protected override syncViewFromValue(): void {
    if (!this.year) return; // 시계 없이는 정할 수 없다 — connected()로 미룬다
    this.viewBase = this.year;
    this.viewReady = true;
  }

  protected override resolveDefaults(today: Date): void {
    if (!this.year) this.year = today.getFullYear();
    if (!this.month) this.month = today.getMonth() + 1;
    this.viewBase = this.year;
  }
}
