/**
 * <jd-multi-select> — 다중 선택 드롭다운 (v2 composites/MultiSelect) = Select 파생.
 *
 * 공유(§6 R12): 팝업 열고 닫기·클릭아웃·검색 필터·화살표 내비·활성 행 추종·
 * 폼 hidden input 유지 — 전부 <jd-select>가 갖고 있다. 파생이 재정의하는 것은
 *  (1) 선택 의미론(values 배열 토글, 골라도 닫히지 않음)
 *  (2) 트리거 표시(칩 + "+N")
 *  (3) 행 골격(체크 표시 + 좌측 정렬)
 * 셋뿐이다. v2는 Select와 코드가 거의 겹치는데도 별개 구현이라 키보드 내비가
 * MultiSelect에만 통째로 없었다.
 *
 * v2 대비 교정 3건:
 *  1. **중첩 버튼 제거**: v2 트리거는 `<button>` 안에 `<Tag closable>`의 닫기
 *     `<button>`을 넣어 HTML이 무효였다(버튼 안 버튼). v3 칩은 표시 전용이고
 *     해제는 목록 토글 또는 트리거에서 Backspace(마지막 항목)로 한다.
 *  2. **role**: 팝업이 `aria-multiselectable="true"` 리스트박스이고 각 행이
 *     `role="option" aria-selected`로 상태를 보고한다. v2는 label+checkbox 나열이라
 *     그룹 이름도, 키보드 내비도 없었다.
 *  3. **폼 참여**: 선택 개수만큼 hidden input을 유지해 FormData에 반복 항목으로 실린다.
 */
import { JdSelect, type JdSelectOption } from "../select/element.js";
import { adoptStyles } from "../../core/styles.js";
import multiSelectStyles from "./multi-select.css.js";

const BOX_CHECK_SVG =
  `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">` +
  `<path stroke-linecap="round" stroke-linejoin="round" d="M2.5 6.2l2.3 2.3L9.5 3.8"/></svg>`;

export class JdMultiSelect extends JdSelect {
  static override tag = "jd-multi-select";
  static override props = {
    ...JdSelect.props,
    /** 트리거에 한 번에 보일 최대 칩 수. 초과분은 "+N" 칩 1개로 접힌다 */
    maxDisplay: { type: Number, default: 3 },
  };

  declare maxDisplay: number;

  protected override fallbackAriaLabel = "다중 선택";
  protected override get closeOnPick(): boolean {
    return false; // v2 동형 — 연속 선택
  }
  protected override get multiSelectable(): boolean {
    return true;
  }

  protected selectedValues: string[] = [];

  /** 선택된 값 목록 (복합 데이터 — property 전용 §1.3) */
  get values(): string[] {
    return this.selectedValues;
  }
  set values(v: string[]) {
    this.selectedValues = Array.isArray(v) ? v.slice() : [];
    this.requestUpdate();
  }

  protected override adoptStyleHook(): void {
    adoptStyles(multiSelectStyles);
  }

  protected override render(): void {
    this.upgradeOwn("values");
    super.render();
  }

  protected override connected(): void {
    super.connected();
    this.trigger.addEventListener("keydown", this.onTriggerBackspace);
  }

  protected override disconnected(): void {
    super.disconnected();
    this.trigger?.removeEventListener("keydown", this.onTriggerBackspace);
  }

  /** 트리거에서 Backspace = 마지막 선택 해제 (칩 닫기 버튼의 대체 경로) */
  protected onTriggerBackspace = (e: KeyboardEvent): void => {
    if (e.key !== "Backspace" || this.disabled) return;
    if (this.selectedValues.length === 0) return;
    e.preventDefault();
    const removed = this.selectedValues[this.selectedValues.length - 1]!;
    this.selectedValues = this.selectedValues.slice(0, -1);
    this.emit("jd-remove", { value: removed });
    this.emitChange();
  };

  protected override isSelected(opt: JdSelectOption): boolean {
    return this.selectedValues.includes(opt.value);
  }

  protected override initialActiveIndex(): number {
    return this.filtered.findIndex((o) => this.isSelected(o) && !o.disabled);
  }

  protected override pick(opt: JdSelectOption): void {
    if (opt.disabled) return;
    this.selectedValues = this.selectedValues.includes(opt.value)
      ? this.selectedValues.filter((v) => v !== opt.value)
      : [...this.selectedValues, opt.value];
    this.emitChange();
  }

  protected emitChange(): void {
    this.emit("jd-change", { values: this.selectedValues.slice() });
    this.requestUpdate();
  }

  protected override buildRow(_opt: JdSelectOption, id: string): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "jd-select__option jd-multi-select__option";
    li.id = id;
    li.setAttribute("role", "option");
    const box = document.createElement("span");
    box.className = "jd-multi-select__box";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = BOX_CHECK_SVG;
    const icon = document.createElement("span");
    icon.className = "jd-select__option-icon";
    icon.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "jd-select__option-label";
    li.append(box, icon, label);
    return li;
  }

  /** 트리거 = 칩 나열 + 초과분 "+N" (v2 maxDisplay 동형) */
  protected override syncTrigger(): void {
    this.valueIcon.hidden = true;
    this.valueIcon.textContent = "";
    const selected = this.selectedValues
      .map((v) => this.optionList.find((o) => o.value === v))
      .filter((o): o is JdSelectOption => Boolean(o));

    this.valueEl.toggleAttribute("data-placeholder", selected.length === 0);
    if (selected.length === 0) {
      this.valueText.textContent = this.placeholder;
      this.clearChips();
      return;
    }
    this.valueText.textContent = "";
    const max = this.maxDisplay > 0 ? this.maxDisplay : selected.length;
    const shown = selected.slice(0, max);
    const overflow = selected.length - shown.length;

    const chips = Array.from(this.valueEl.querySelectorAll<HTMLElement>(".jd-multi-select__chip"));
    const want = shown.length + (overflow > 0 ? 1 : 0);
    while (chips.length > want) chips.pop()!.remove();
    while (chips.length < want) {
      const chip = document.createElement("span");
      chip.className = "jd-multi-select__chip";
      this.valueEl.insertBefore(chip, this.valueText);
      chips.push(chip);
    }
    shown.forEach((opt, i) => {
      const chip = chips[i]!;
      chip.textContent = opt.icon ? `${opt.icon} ${opt.label}` : opt.label;
      chip.removeAttribute("data-overflow");
    });
    if (overflow > 0) {
      const chip = chips[chips.length - 1]!;
      chip.textContent = `+${overflow}`;
      chip.setAttribute("data-overflow", "");
    }
  }

  protected clearChips(): void {
    for (const chip of this.valueEl.querySelectorAll(".jd-multi-select__chip")) chip.remove();
  }

  protected override formValues(): string[] {
    return this.selectedValues.slice();
  }
}
