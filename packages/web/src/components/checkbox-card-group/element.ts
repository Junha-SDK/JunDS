/**
 * <jd-checkbox-card-group> — 다중 선택 카드 그룹 (v2 composites/CheckboxCardGroup)
 * = <jd-radio-card-group> 파생 (§6 R12).
 *
 * v2는 RadioCardGroup과 CheckboxCardGroup을 98줄씩 **따로** 썼다. 두 파일의 차이는
 * input type과 선택 상태 계산뿐이었고, 카드 골격·컬럼 그리드·비활성 처리는 문자
 * 단위로 같았다(그래서 미묘하게 어긋나기도 쉬웠다). v3는 골격을 기반 클래스가 갖고
 * 파생은 훅 5개만 재정의한다 — aria-labelledby/describedby 분리, 화살표 순회,
 * 폼 참여가 공짜로 따라온다.
 *
 * 상태 표면(§1.3): 다중 선택이므로 문자열 `value`가 아니라 배열 `values`(property
 * 전용)다. 기반의 `value` 프롭은 상속 목록에서 제외했다 — 체크박스 그룹에서는
 * 의미가 없다.
 */
import { JdRadioCardGroup } from "../radio-card-group/element.js";
import { adoptStyles } from "../../core/styles.js";
import checkboxCardGroupStyles from "./checkbox-card-group.css.js";

export class JdCheckboxCardGroup extends JdRadioCardGroup {
  static override tag = "jd-checkbox-card-group";
  // 기반 props를 스프레드하지 않고 다시 적는다 — `value`(단일 선택 표면)를
  // 상속 목록에서 빼기 위해서다. 나머지는 기반과 같은 정의.
  static override props = {
    name: { type: String },
    columns: { type: Number, default: 1 },
    disabled: { type: Boolean, reflect: true },
    label: { type: String },
    /** 최대 선택 개수. 0 = 무제한 (v2 max?: number의 CE 표현) */
    max: { type: Number, default: 0 },
  };

  declare max: number;

  #values: string[] = [];

  get values(): string[] {
    return this.#values;
  }
  set values(v: string[]) {
    this.#values = Array.isArray(v) ? [...v] : [];
    this.requestUpdate();
  }

  protected override get inputType(): "radio" | "checkbox" {
    return "checkbox";
  }
  /** 다중 선택은 radiogroup이 아니다 — 단순 group + 각 체크박스가 자기 상태를 말한다 */
  protected override get groupRole(): string {
    return "group";
  }
  protected override isSelected(value: string): boolean {
    return this.#values.includes(value);
  }
  /** v2 reachedMax 동형: 상한에 닿으면 아직 안 고른 카드만 잠근다 */
  protected override isBlocked(value: string): boolean {
    return this.max > 0 && !this.#values.includes(value) && this.#values.length >= this.max;
  }
  protected override commit(value: string, checked: boolean): void {
    this.#values = checked
      ? [...this.#values, value]
      : this.#values.filter((v) => v !== value);
    this.emit("jd-change", { values: this.#values });
  }

  protected override render(): void {
    super.render(); // 카드 골격 구축 + 기반 시트 채택
    adoptStyles(checkboxCardGroupStyles); // 호스트 태그 그리드 규칙만 추가
    this.update();
  }
}
