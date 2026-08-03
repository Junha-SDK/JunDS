/**
 * <jd-password-input> — 표시 토글 + 강도 게이지 + 규칙 체크리스트 (v2 primitives/PasswordInput).
 *
 * - 네이티브 input[type=password] 위임: 비밀번호 관리자·autocomplete="new-password"·
 *   폼 참여 전부 브라우저 기본. 토글은 type 전환만 한다(tabIndex=-1, v2 동형).
 * - 규칙 입력 2경로(§1.3 · DEC-023-3): `rules` 프로퍼티는 함수 test를 받고,
 *   자식 <script type="application/json">은 선언적 스펙 { label, pattern | minLength }.
 *   attribute에 함수를 실을 수 없어 갈라진 표면이며 둘 다 없으면 기본 5규칙.
 * - 강도 산식은 v2 그대로(통과율 + 길이보너스 0.2 상한, 임계 0.3/0.5/0.8). 색은
 *   weak/fair/good/strong이 danger/warning/info/success 의미축과 1:1이라 토큰 참조
 *   (DEC-025-1: semantic 축이 있으면 Tailwind 리터럴 승계 대신 토큰).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import passwordInputStyles from "./password-input.css.js";

export interface PasswordRule {
  key: string;
  label: string;
  test: (value: string) => boolean;
}

/** JSON 슬롯용 선언적 스펙 — 정규식 소스 또는 최소 길이 */
interface PasswordRuleSpec {
  key?: string;
  label: string;
  pattern?: string;
  flags?: string;
  minLength?: number;
}

export type PasswordStrengthLevel = "none" | "weak" | "fair" | "good" | "strong";

const DEFAULT_RULES: PasswordRule[] = [
  { key: "length", label: "8자 이상", test: (v) => v.length >= 8 },
  { key: "upper", label: "대문자 포함 (A-Z)", test: (v) => /[A-Z]/.test(v) },
  { key: "lower", label: "소문자 포함 (a-z)", test: (v) => /[a-z]/.test(v) },
  { key: "number", label: "숫자 포함 (0-9)", test: (v) => /[0-9]/.test(v) },
  {
    key: "special",
    label: "특수문자 포함 (!@#$...)",
    test: (v) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(v),
  },
];

const LEVEL_LABEL: Record<PasswordStrengthLevel, string> = {
  none: "",
  weak: "취약",
  fair: "보통",
  good: "양호",
  strong: "강력",
};
const LEVEL_BARS: Record<PasswordStrengthLevel, number> = {
  none: 0,
  weak: 1,
  fair: 2,
  good: 3,
  strong: 4,
};

const EYE_SVG =
  `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">` +
  `<path d="M2 8c0-1.7 2.7-4.5 6-4.5S14 6.3 14 8s-2.7 4.5-6 4.5S2 9.7 2 8z" stroke="currentColor" stroke-width="1.3"/>` +
  `<circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.3"/></svg>`;
const EYE_OFF_SVG =
  `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">` +
  `<path d="M2.5 2.5l11 11M6.5 6.8a2 2 0 002.7 2.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>` +
  `<path d="M4.3 4.6C2.9 5.7 2 7.2 2 8c0 1.7 2.7 4.5 6 4.5.9 0 1.7-.2 2.5-.5M8 3.5c3.3 0 6 2.8 6 4.5 0 .8-.8 2.2-2.2 3.3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`;
const CHECK_SVG =
  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<circle cx="7" cy="7" r="6" fill="currentColor" opacity="0.15"/>` +
  `<path d="M4 7.2l2 2 4-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const DOT_SVG =
  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1"/></svg>`;

export class JdPasswordInput extends JdElement {
  static override tag = "jd-password-input";
  static override props = {
    value: { type: String },
    placeholder: { type: String },
    name: { type: String },
    size: { type: String, default: "md", reflect: true }, // sm | md | lg
    error: { type: Boolean, reflect: true },
    showStrength: { type: Boolean, reflect: true },
    showRules: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    label: { type: String },
    /** 표시 상태 — 토글 버튼이 뒤집는다 */
    revealed: { type: Boolean, reflect: true },
  };

  declare value: string;
  declare placeholder: string;
  declare name: string;
  declare size: string;
  declare error: boolean;
  declare showStrength: boolean;
  declare showRules: boolean;
  declare disabled: boolean;
  declare required: boolean;
  declare label: string;
  declare revealed: boolean;

  #input!: HTMLInputElement;
  #toggle!: HTMLButtonElement;
  #strength!: HTMLDivElement;
  #bars: HTMLSpanElement[] = [];
  #level!: HTMLSpanElement;
  #rulesList!: HTMLUListElement;
  #rules: PasswordRule[] | null = null;

  /** 함수 test를 직접 넘기는 경로 (프로퍼티 전용 — attribute 불가) */
  set rules(v: PasswordRule[] | null) {
    this.#rules = v;
    this.requestUpdate();
  }
  get rules(): PasswordRule[] {
    return this.#rules ?? DEFAULT_RULES;
  }

  /** 현재 값의 강도 — 읽기 전용 파생 */
  get strength(): { level: PasswordStrengthLevel; score: number; passed: number } {
    const rules = this.rules;
    const v = this.value;
    if (!v) return { level: "none", score: 0, passed: 0 };
    const passed = rules.filter((r) => r.test(v)).length;
    const total = Math.min(passed / rules.length + Math.min(v.length / 16, 1) * 0.2, 1);
    const level: PasswordStrengthLevel =
      total < 0.3 ? "weak" : total < 0.5 ? "fair" : total < 0.8 ? "good" : "strong";
    return { level, score: total, passed };
  }

  protected render(): void {
    adoptStyles(passwordInputStyles);
    this.#readJsonRules();
    const existing = this.querySelector<HTMLInputElement>("input.jd-password-input__input");
    if (existing) {
      this.#input = existing;
      this.#toggle = this.querySelector(".jd-password-input__toggle")!;
      this.#strength = this.querySelector(".jd-password-input__strength")!;
      this.#bars = Array.from(this.querySelectorAll(".jd-password-input__bar"));
      this.#level = this.querySelector(".jd-password-input__level")!;
      this.#rulesList = this.querySelector(".jd-password-input__rules")!;
    } else {
      this.#build();
    }
    this.update();
  }

  /** <script type="application/json"> 선언적 규칙 (§1.3 명시 허용 슬롯) */
  #readJsonRules(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    let specs: PasswordRuleSpec[];
    try {
      specs = JSON.parse(script.textContent) as PasswordRuleSpec[];
    } catch {
      return; // 잘못된 JSON은 기본 규칙 유지 — 렌더를 깨뜨리지 않는다
    }
    if (!Array.isArray(specs)) return;
    this.#rules = specs.map((s, i) => ({
      key: s.key ?? String(i),
      label: s.label,
      test:
        s.minLength !== undefined
          ? (v: string) => v.length >= s.minLength!
          : s.pattern !== undefined
          ? (v: string) => new RegExp(s.pattern!, s.flags).test(v)
          : () => false,
    }));
    script.remove();
  }

  #build(): void {
    const field = document.createElement("div");
    field.className = "jd-password-input__field";
    this.#input = document.createElement("input");
    this.#input.className = "jd-password-input__input";
    this.#input.type = "password";
    this.#input.autocomplete = "new-password";
    this.#toggle = document.createElement("button");
    this.#toggle.type = "button";
    this.#toggle.className = "jd-password-input__toggle";
    this.#toggle.tabIndex = -1;
    field.append(this.#input, this.#toggle);

    this.#strength = document.createElement("div");
    this.#strength.className = "jd-password-input__strength";
    for (let i = 0; i < 4; i++) {
      const bar = document.createElement("span");
      bar.className = "jd-password-input__bar";
      this.#bars.push(bar);
      this.#strength.append(bar);
    }
    this.#level = document.createElement("span");
    this.#level.className = "jd-password-input__level";
    this.#strength.append(this.#level);

    this.#rulesList = document.createElement("ul");
    this.#rulesList.className = "jd-password-input__rules";

    this.append(field, this.#strength, this.#rulesList);
  }

  protected override connected(): void {
    this.#input.addEventListener("input", this.#onInput);
    this.#input.addEventListener("change", this.#onChange);
    this.#toggle.addEventListener("click", this.#onToggle);
  }

  protected override disconnected(): void {
    this.#input?.removeEventListener("input", this.#onInput);
    this.#input?.removeEventListener("change", this.#onChange);
    this.#toggle?.removeEventListener("click", this.#onToggle);
  }

  #onInput = (): void => {
    this.value = this.#input.value;
    this.emit("jd-input", { value: this.value, strength: this.strength });
  };

  #onChange = (): void => {
    this.emit("jd-change", { value: this.#input.value, strength: this.strength });
  };

  #onToggle = (): void => {
    this.revealed = !this.revealed;
  };

  protected override update(): void {
    const input = this.#input;
    input.type = this.revealed ? "text" : "password";
    input.placeholder = this.placeholder;
    input.disabled = this.disabled;
    input.required = this.required;
    if (this.name) input.name = this.name;
    else input.removeAttribute("name");
    if (this.label) input.setAttribute("aria-label", this.label);
    else input.removeAttribute("aria-label");
    input.setAttribute("aria-invalid", this.error ? "true" : "false");
    if (input.value !== this.value) input.value = this.value; // IME 안전(§B3 선례)

    this.#toggle.innerHTML = this.revealed ? EYE_OFF_SVG : EYE_SVG;
    this.#toggle.setAttribute("aria-label", this.revealed ? "비밀번호 숨기기" : "비밀번호 보기");

    const filled = Boolean(this.value);
    const s = this.strength;
    const showStrength = this.showStrength && filled;
    this.#strength.hidden = !showStrength;
    if (showStrength) {
      const on = LEVEL_BARS[s.level];
      for (let i = 0; i < this.#bars.length; i++) {
        this.#bars[i]!.toggleAttribute("data-on", i < on);
      }
      this.#strength.dataset.level = s.level;
      this.#level.textContent = LEVEL_LABEL[s.level];
    }

    const showRules = this.showRules && filled;
    this.#rulesList.hidden = !showRules;
    if (showRules) this.#renderRules();
  }

  /** 규칙 행은 개수가 바뀔 때만 재구축 — 통과 여부는 attribute 토글 */
  #renderRules(): void {
    const rules = this.rules;
    const list = this.#rulesList;
    if (list.children.length !== rules.length) {
      list.textContent = "";
      for (const r of rules) {
        const li = document.createElement("li");
        li.className = "jd-password-input__rule";
        const icon = document.createElement("span");
        icon.className = "jd-password-input__rule-icon";
        const text = document.createElement("span");
        text.textContent = r.label;
        li.append(icon, text);
        list.append(li);
      }
    }
    for (let i = 0; i < rules.length; i++) {
      const li = list.children[i] as HTMLLIElement;
      const ok = rules[i]!.test(this.value);
      li.toggleAttribute("data-passed", ok);
      const icon = li.firstElementChild!;
      const want = ok ? CHECK_SVG : DOT_SVG;
      if (icon.innerHTML !== want) icon.innerHTML = want;
    }
  }

  override focus(options?: FocusOptions): void {
    this.#input?.focus(options);
  }
}
