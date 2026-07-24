/**
 * <jd-filter-button-group> — 붙어 있는 필터 버튼 묶음 (v2 composites/FilterButtonGroup).
 *
 * 옵션 입력 2경로(§1.3): `options` 프로퍼티 또는 자식
 * `<script type="application/json">` 슬롯 (DEC-023-3 선례).
 *
 * a11y — v2 대비 상위집합: v2는 <div role="group"> 안에 맨 <button> n개였다.
 * 어느 버튼이 선택됐는지 AT에 전달되지 않았고, 옵션 n개가 전부 탭 순서에 들어갔다.
 * v3는 RadioGroup·StarRating과 같은 **네이티브 radio 위임**(§1.6-1 · DEC-023-3)이다
 * — 시각은 버튼 그대로, 안쪽은 진짜 radio라서 단일 탭스톱·화살표 순회·선택 상태
 * 노출·폼 참여가 전부 브라우저 기본으로 붙는다.
 *
 * <jd-radio-group>을 상속하지 않은 이유: 기반의 옵션 저장소·행 재구축이 private
 * 필드(#options/#rebuild)라 파생이 끼어들 자리가 없고, 옵션 키 이름(key vs value)과
 * count 열까지 다르다. 기반을 손보려면 배정 밖 디렉터리를 고쳐야 해서 독립 구현했다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import filterButtonGroupStyles from "./filter-button-group.css.js";

export interface JdFilterOption {
  /** 식별자 (v2 FilterOption.key) */
  key: string;
  label: string;
  /** 우측 카운트 — 없으면 열 자체가 사라진다 */
  count?: number;
  disabled?: boolean;
}

export class JdFilterButtonGroup extends JdElement {
  static override tag = "jd-filter-button-group";
  static override props = {
    /** 선택된 key */
    value: { type: String, reflect: true },
    name: { type: String },
    disabled: { type: Boolean, reflect: true },
    /** 그룹 접근 이름 — role=radiogroup에는 이름이 있어야 한다 */
    label: { type: String },
  };

  declare value: string;
  declare name: string;
  declare disabled: boolean;
  declare label: string;

  #options: JdFilterOption[] = [];
  #items: HTMLLabelElement[] = [];
  #groupName = "";

  get options(): JdFilterOption[] {
    return this.#options;
  }
  set options(v: JdFilterOption[]) {
    this.#options = Array.isArray(v) ? v : [];
    this.#rebuild();
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(filterButtonGroupStyles);
    this.#readJson();
    this.setAttribute("role", "radiogroup");
    this.#rebuild();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdFilterOption[];
      if (Array.isArray(parsed)) this.#options = parsed;
    } catch {
      console.warn("[junds] <jd-filter-button-group> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /** 입양(§3.3): 개수가 같으면 골격 재사용, 다르면 재구축 */
  #rebuild(): void {
    if (!this.#groupName) this.#groupName = this.name || jdUid("jd-fbg");
    const existing = Array.from(
      this.querySelectorAll<HTMLLabelElement>(":scope > label.jd-filter-button-group__item"),
    );
    if (existing.length === this.#options.length) {
      this.#items = existing;
    } else {
      for (const el of existing) el.remove();
      this.#items = this.#options.map(() => {
        const item = this.#buildItem();
        this.append(item);
        return item;
      });
    }
  }

  #buildItem(): HTMLLabelElement {
    const item = document.createElement("label");
    item.className = "jd-filter-button-group__item";
    const input = document.createElement("input");
    input.type = "radio";
    input.className = "jd-filter-button-group__input";
    const label = document.createElement("span");
    label.className = "jd-filter-button-group__label";
    const count = document.createElement("span");
    count.className = "jd-filter-button-group__count";
    item.append(input, label, count);
    return item;
  }

  protected override connected(): void {
    this.addEventListener("change", this.#onChange);
  }

  protected override disconnected(): void {
    this.removeEventListener("change", this.#onChange);
  }

  #onChange = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    if (!input.classList.contains("jd-filter-button-group__input")) return;
    this.value = input.value;
    // detail.value가 정본, key는 v2 onChange(key) 표면과의 이름 다리
    this.emit("jd-change", { value: input.value, key: input.value });
  };

  protected override update(): void {
    if (this.#items.length !== this.#options.length) this.#rebuild();
    const name = this.name || this.#groupName;
    this.#items.forEach((item, i) => {
      const opt = this.#options[i];
      if (!opt) return;
      const input = item.querySelector<HTMLInputElement>(".jd-filter-button-group__input")!;
      const label = item.querySelector<HTMLElement>(".jd-filter-button-group__label")!;
      const count = item.querySelector<HTMLElement>(".jd-filter-button-group__count")!;
      const active = opt.key === this.value;
      input.name = name;
      input.value = opt.key;
      input.checked = active;
      input.disabled = this.disabled || Boolean(opt.disabled);
      label.textContent = opt.label;
      const hasCount = opt.count !== undefined;
      count.textContent = hasCount ? String(opt.count) : "";
      count.hidden = !hasCount;
      item.toggleAttribute("data-active", active);
      item.toggleAttribute("data-disabled", input.disabled);
    });

    if (this.label) this.setAttribute("aria-label", this.label);
    else this.removeAttribute("aria-label");
  }
}
