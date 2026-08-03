/**
 * <jd-radio-group> — 네이티브 radio 묶음 (v2 primitives/RadioGroup).
 *
 * 옵션 입력 2경로(§1.3 — 복합 데이터는 attribute 금지):
 *  1. `options` 프로퍼티 (Array<{value,label,disabled?}>)
 *  2. 선언적 초기화: 자식 `<script type="application/json">[…]</script>` 슬롯
 *     (WEB-03 예외로 명시 허용된 패턴)
 *
 * 네이티브 위임 실리: 같은 name의 radio 묶음은 화살표 순회·폼 참여·단일 tabstop이
 * 브라우저 기본 — roving Behavior 불필요. name 미지정 시 jdUid로 문서 유일 name 발급.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import radioGroupStyles from "./radio-group.css.js";

export interface JdRadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export class JdRadioGroup extends JdElement {
  static override tag = "jd-radio-group";
  static override props = {
    name: { type: String },
    value: { type: String, reflect: true },
    size: { type: String, default: "md", reflect: true }, // sm | md
    direction: { type: String, default: "vertical", reflect: true }, // vertical | horizontal
    disabled: { type: Boolean, reflect: true },
    // options(Array)는 property 전용(§1.3) — finalize 접근자와 겹치지 않도록
    // static props 밖에서 클래스 자체 접근자로 선언한다.
  };

  declare name: string;
  declare value: string;
  declare size: string;
  declare direction: string;
  declare disabled: boolean;

  #groupName = "";
  #options: JdRadioOption[] = [];

  get options(): JdRadioOption[] {
    return this.#options;
  }
  set options(v: JdRadioOption[]) {
    this.#options = Array.isArray(v) ? v : [];
    this.#rebuild();
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(radioGroupStyles);
    this.setAttribute("role", "radiogroup");
    // 선언적 초기화 슬롯 — 1회 소비
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (script) {
      try {
        const parsed = JSON.parse(script.textContent || "[]") as JdRadioOption[];
        if (Array.isArray(parsed)) this.#options = parsed;
      } catch {
        console.warn("[junds] <jd-radio-group> JSON 슬롯 파싱 실패 — 무시합니다.");
      }
      script.remove();
    }
    this.#rebuild();
    this.update();
  }

  /** 옵션 행 재구축 — 입양(§3.3): 동일 구조가 이미 있으면 재사용 */
  #rebuild(): void {
    if (!this.isConnected && !this.childElementCount && this.#options.length === 0) return;
    if (!this.#groupName) this.#groupName = this.name || jdUid("jd-rg");
    const existing = this.querySelectorAll<HTMLLabelElement>(":scope > label.jd-radio-group__item");
    if (existing.length === this.#options.length) {
      // 라벨·값만 동기화 (update()가 상태 처리)
      existing.forEach((row, i) => {
        const opt = this.#options[i]!;
        row.querySelector("input")!.value = opt.value;
        row.querySelector(".jd-radio-group__label")!.textContent = opt.label;
      });
      return;
    }
    for (const row of existing) row.remove();
    for (const opt of this.#options) {
      const row = document.createElement("label");
      row.className = "jd-radio-group__item";
      const input = document.createElement("input");
      input.type = "radio";
      input.className = "jd-radio-group__input";
      input.value = opt.value;
      const text = document.createElement("span");
      text.className = "jd-radio-group__label";
      text.textContent = opt.label;
      row.append(input, text);
      this.append(row);
    }
  }

  protected override connected(): void {
    this.addEventListener("change", this.#onChange);
  }

  protected override disconnected(): void {
    this.removeEventListener("change", this.#onChange);
  }

  #onChange = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    if (!input.classList.contains("jd-radio-group__input")) return;
    this.value = input.value;
    this.emit("jd-change", { value: input.value });
  };

  protected override update(): void {
    const name = this.name || this.#groupName;
    const rows = this.querySelectorAll<HTMLLabelElement>(":scope > label.jd-radio-group__item");
    rows.forEach((row, i) => {
      const opt = this.#options[i];
      const input = row.querySelector("input")!;
      input.name = name;
      input.checked = input.value === this.value;
      input.disabled = this.disabled || Boolean(opt?.disabled);
      row.toggleAttribute("data-disabled", input.disabled);
    });
  }
}
