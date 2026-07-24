/**
 * <jd-quantity-selector> — 수량 선택기 (v2 composites/QuantitySelector) = jd-number-input 파생.
 *
 * v2 QuantitySelector는 NumberInput과 **같은 위젯을 처음부터 다시 만든 것**이다
 * (− / input / + 한 줄, min 클램프, 상/하한에서 버튼 비활성). 다른 것은 기본값(min=1)과
 * `editable=false` 표시 모드뿐이라 §6 R12에 따라 파생으로 낸다 — 입력 중 클램프 금지
 * (v2 NumberInput 실측 결함 교정)·네이티브 숫자 키패드·폼 참여가 공짜로 따라온다.
 *
 * v2 `editable={false}` → `readonly`: v2는 값을 `<span aria-live="polite">`로 그렸다.
 * 그 스팬은 (1) 폼에 아무것도 제출하지 않고 (2) 포커스가 안 가 스크린리더 사용자가
 * 현재 수량을 **읽으러 갈 수 없으며** (3) 버튼을 누를 때마다 라이브 영역이 발화한다.
 * v3는 같은 자리에 네이티브 `readonly` input을 둔다 — 시각은 동일, 값은 제출되고
 * 포커스로 읽을 수 있다. 대신 readonly면 네이티브 ↑↓가 값을 못 바꾸므로 스텝 버튼을
 * 탭 순서에 올려 키보드 경로를 복구한다(편집 가능 모드에서는 베이스대로 tabindex=-1).
 */
import { JdNumberInput } from "../number-input/element.js";
import { adoptStyles } from "../../core/styles.js";
import quantitySelectorStyles from "./quantity-selector.css.js";

export class JdQuantitySelector extends JdNumberInput {
  static override tag = "jd-quantity-selector";
  static override props = {
    ...JdNumberInput.props,
    /** v2 defaultValue=1 */
    value: { type: Number, default: 1 },
    /** v2 min=1 — 장바구니 수량은 0으로 내려가지 않는다 */
    min: { type: Number, default: 1 },
    /** v2 editable=false의 역표현(참이면 직접 편집 불가) */
    readonly: { type: Boolean, reflect: true },
    /** 그룹·입력의 접근 이름 */
    label: { type: String, default: "수량" },
  };

  declare readonly: boolean;

  protected override render(): void {
    super.render(); // − / input / + 구축 또는 입양 + number-input 시트 채택
    adoptStyles(quantitySelectorStyles);
    this.setAttribute("role", "group"); // v2 role="group"
    this.update();
  }

  protected override update(): void {
    super.update(); // 값·min/max·버튼 비활성·클램프 표시
    const input = this.querySelector<HTMLInputElement>(":scope > input.jd-number-input__input");
    const dec = this.querySelector<HTMLButtonElement>(':scope > button[data-dir="-1"]');
    const inc = this.querySelector<HTMLButtonElement>(':scope > button[data-dir="1"]');
    if (!input || !dec || !inc) return;

    const name = this.label || "수량";
    this.setAttribute("aria-label", name);
    dec.setAttribute("aria-label", `${name} 감소`); // v2 "수량 감소"
    inc.setAttribute("aria-label", `${name} 증가`);

    input.readOnly = this.readonly;
    // readonly에서는 input의 ↑↓가 죽는다 — 버튼이 유일한 키보드 경로가 되므로 탭에 올린다
    dec.tabIndex = this.readonly ? 0 : -1;
    inc.tabIndex = this.readonly ? 0 : -1;
  }
}
