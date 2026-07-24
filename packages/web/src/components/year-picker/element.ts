/**
 * <jd-year-picker> — 연도 선택기 (v2 composites/YearPicker) = JdGridPicker 파생.
 * pageSize개(기본 12) 3열 격자 + 페이지 네비게이션. 페이지 시작 연도는 v2와 동일하게
 * `floor(year / pageSize) * pageSize` — 2026·12면 2016~2027.
 *
 * min/max는 v2에서 number였지만 v3에서는 String 프로퍼티다 — attribute는 어차피
 * 문자열이고 Number 타입으로 두면 "미지정"과 0년을 구분할 수 없다(§1.3 typeDefault가
 * 0을 채운다). 빈 문자열이 곧 미지정이라 경계가 명확하다.
 */
import { JdGridPicker } from "../../core/grid-picker.js";
import { adoptStyles } from "../../core/styles.js";
import yearPickerStyles from "./year-picker.css.js";

export class JdYearPicker extends JdGridPicker {
  static override tag = "jd-year-picker";
  static override props = {
    ...JdGridPicker.props,
    year: { type: Number, reflect: true },
    /** 선택 가능 하한/상한 연도 (포함). 빈 문자열이면 무제한 */
    min: { type: String },
    max: { type: String },
    /** 한 페이지 연도 수 */
    pageSize: { type: Number, default: 12 },
  };

  declare year: number;
  declare min: string;
  declare max: string;
  declare pageSize: number;

  #size(): number {
    const n = Math.round(this.pageSize) || 12;
    return Math.max(1, Math.min(48, n));
  }

  #bound(raw: string): number | null {
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  protected override render(): void {
    adoptStyles(yearPickerStyles);
    super.render();
  }

  protected override columns(): number {
    return 3;
  }

  protected override cellCount(): number {
    return this.#size();
  }

  protected override cellText(index: number): string {
    return String(this.viewBase + index);
  }

  protected override cellAriaLabel(index: number): string {
    return `${this.viewBase + index}년`;
  }

  protected override cellSelected(index: number): boolean {
    return this.year === this.viewBase + index;
  }

  protected override cellDisabled(index: number): boolean {
    const y = this.viewBase + index;
    const min = this.#bound(this.min);
    if (min !== null && y < min) return true;
    const max = this.#bound(this.max);
    if (max !== null && y > max) return true;
    return false;
  }

  protected override headerText(): string {
    return `${this.viewBase} – ${this.viewBase + this.#size() - 1}`;
  }

  protected override groupLabel(): string {
    return "연도 선택";
  }

  protected override prevLabel(): string {
    return "이전 페이지";
  }

  protected override nextLabel(): string {
    return "다음 페이지";
  }

  protected override pageDelta(): number {
    return this.#size();
  }

  protected override selectIndex(index: number): void {
    this.year = this.viewBase + index;
    this.emit("jd-change", { year: this.year });
  }

  protected override syncViewFromValue(): void {
    if (!this.year) return; // 시계 없이는 정할 수 없다 — connected()로 미룬다
    this.viewBase = this.#pageStart(this.year);
    this.viewReady = true;
  }

  protected override resolveDefaults(today: Date): void {
    if (!this.year) this.year = today.getFullYear();
    this.viewBase = this.#pageStart(this.year);
  }

  /** v2 동형: floor(year / pageSize) * pageSize */
  #pageStart(year: number): number {
    const size = this.#size();
    return Math.floor(year / size) * size;
  }
}
