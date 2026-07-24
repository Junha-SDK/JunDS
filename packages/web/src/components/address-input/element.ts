/**
 * <jd-address-input> — 우편번호 + 도로명 주소 + 상세주소 3단 입력 (v2 composites/AddressInput).
 *
 * - **v2의 하드코딩 샘플 주소는 이식하지 않는다.** v2 검색 버튼은 "06134 / 서울특별시
 *   강남구 테헤란로 123"을 직접 채워 넣었는데, 이는 데모 스캐폴딩이지 컴포넌트 동작이
 *   아니다(디자인 시스템이 특정 주소를 알 이유가 없다). v3는 버튼을 누르면
 *   `jd-search`를 발행하고, 앱이 우편번호 서비스를 띄운 뒤 `setAddress()`로 결과를
 *   되돌려 준다. 데이터 소스 비의존은 DEC-003(finance-data 분리)과 같은 방향이다.
 * - 세 칸은 전부 진짜 <input>이라 `name`을 주면 폼에 그대로 참여한다(§1.6-1) —
 *   v2에는 name이 없어 폼 제출에 값이 실리지 않았다.
 * - 접근성 가산: v2는 placeholder만으로 세 칸을 구분했다(읽기전용 칸은 AT에서 이름 없음).
 *   v3는 aria-label을 명시하고 읽기전용 칸에 readonly를 유지한다(disabled가 아니라
 *   readonly라야 값이 제출되고 포커스·복사가 가능하다).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import addressInputStyles from "./address-input.css.js";

export interface JdAddressValue {
  zonecode: string;
  address: string;
  detail: string;
}

const ZONECODE_LABEL = "우편번호";
const ADDRESS_LABEL = "주소";
const DETAIL_LABEL = "상세주소";

export class JdAddressInput extends JdElement {
  static override tag = "jd-address-input";
  static override props = {
    zonecode: { type: String },
    address: { type: String },
    detail: { type: String },
    /** 주소 칸 placeholder (v2 placeholder 프롭 위치 그대로) */
    placeholder: { type: String, default: "주소 검색" },
    searchLabel: { type: String, default: "주소 검색" },
    /** 폼 필드명 접두 — `${name}-zonecode` / `-address` / `-detail` */
    name: { type: String },
    disabled: { type: Boolean, reflect: true },
  };

  declare zonecode: string;
  declare address: string;
  declare detail: string;
  declare placeholder: string;
  declare searchLabel: string;
  declare name: string;
  declare disabled: boolean;

  #zonecodeEl!: HTMLInputElement;
  #addressEl!: HTMLInputElement;
  #detailEl!: HTMLInputElement;
  #searchEl!: HTMLButtonElement;

  /** 현재 값 스냅샷 */
  get value(): JdAddressValue {
    return { zonecode: this.zonecode, address: this.address, detail: this.detail };
  }

  protected render(): void {
    adoptStyles(addressInputStyles);
    const existing = this.querySelector<HTMLInputElement>(".jd-address-input__zonecode");
    if (existing) {
      this.#zonecodeEl = existing;
      this.#addressEl = this.querySelector<HTMLInputElement>(".jd-address-input__address")!;
      this.#detailEl = this.querySelector<HTMLInputElement>(".jd-address-input__detail")!;
      this.#searchEl = this.querySelector<HTMLButtonElement>(".jd-address-input__search")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    const row = document.createElement("div");
    row.className = "jd-address-input__row";

    this.#zonecodeEl = document.createElement("input");
    this.#zonecodeEl.className = "jd-address-input__field jd-address-input__zonecode";
    this.#zonecodeEl.readOnly = true;
    this.#zonecodeEl.placeholder = ZONECODE_LABEL;
    this.#zonecodeEl.setAttribute("aria-label", ZONECODE_LABEL);
    this.#zonecodeEl.inputMode = "numeric";

    this.#searchEl = document.createElement("button");
    this.#searchEl.type = "button";
    this.#searchEl.className = "jd-address-input__search";
    row.append(this.#zonecodeEl, this.#searchEl);

    this.#addressEl = document.createElement("input");
    this.#addressEl.className = "jd-address-input__field jd-address-input__address";
    this.#addressEl.readOnly = true;
    this.#addressEl.setAttribute("aria-label", ADDRESS_LABEL);

    this.#detailEl = document.createElement("input");
    this.#detailEl.className = "jd-address-input__field jd-address-input__detail";
    this.#detailEl.placeholder = `${DETAIL_LABEL} 입력`;
    this.#detailEl.setAttribute("aria-label", DETAIL_LABEL);

    this.append(row, this.#addressEl, this.#detailEl);
  }

  protected override connected(): void {
    this.#searchEl.addEventListener("click", this.#onSearch);
    this.#detailEl.addEventListener("input", this.#onDetailInput);
    this.#detailEl.addEventListener("change", this.#onDetailChange);
  }

  protected override disconnected(): void {
    this.#searchEl?.removeEventListener("click", this.#onSearch);
    this.#detailEl?.removeEventListener("input", this.#onDetailInput);
    this.#detailEl?.removeEventListener("change", this.#onDetailChange);
  }

  protected override update(): void {
    this.#zonecodeEl.value = this.zonecode;
    this.#addressEl.value = this.address;
    this.#addressEl.placeholder = this.placeholder;
    // IME 안전 — 조합 중 되쓰기 금지(상세주소만 편집 가능한 칸)
    if (this.#detailEl.value !== this.detail) this.#detailEl.value = this.detail;

    this.#searchEl.textContent = this.searchLabel;
    this.#searchEl.disabled = this.disabled;
    this.#zonecodeEl.disabled = this.disabled;
    this.#addressEl.disabled = this.disabled;
    this.#detailEl.disabled = this.disabled;

    const base = this.name;
    this.#applyName(this.#zonecodeEl, base && `${base}-zonecode`);
    this.#applyName(this.#addressEl, base && `${base}-address`);
    this.#applyName(this.#detailEl, base && `${base}-detail`);
  }

  #applyName(el: HTMLInputElement, value: string): void {
    if (value) el.name = value;
    else el.removeAttribute("name");
  }

  /**
   * 앱(우편번호 검색 서비스)이 결과를 되돌려 주는 진입점.
   * 지정한 키만 갱신하고 `jd-change`를 1회 발행한다.
   */
  setAddress(next: Partial<JdAddressValue>): void {
    if (next.zonecode !== undefined) this.zonecode = next.zonecode;
    if (next.address !== undefined) this.address = next.address;
    if (next.detail !== undefined) this.detail = next.detail;
    this.emit("jd-change", this.value);
  }

  #onSearch = (): void => {
    // 앱이 우편번호 검색 UI를 띄우고 setAddress()로 결과를 넣는다
    this.emit("jd-search", this.value);
  };

  #onDetailInput = (): void => {
    this.detail = this.#detailEl.value;
    this.emit("jd-input", this.value);
  };

  #onDetailChange = (): void => {
    this.emit("jd-change", this.value);
  };

  override focus(options?: FocusOptions): void {
    this.#detailEl?.focus(options);
  }
}
