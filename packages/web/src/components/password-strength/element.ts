/**
 * <jd-password-strength> — 비밀번호 강도 미터 + 규칙 체크리스트 (v2 composites/PasswordStrength).
 *
 * 판단 3건:
 * 1. **비밀번호는 attribute로 받지 않는다**(`attribute: false`). attribute였다면 값이
 *    DOM 마크업에 그대로 남아 devtools·SSR 직렬화·확장 프로그램에 노출된다. property
 *    전용으로 두고, 선언적으로 쓰고 싶은 경우를 위해 `for`로 입력을 가리키게 했다 —
 *    이러면 값은 input 하나에만 존재한다.
 * 2. **v2에는 ARIA가 하나도 없었다**. 강도는 막대 색으로만, 규칙 통과 여부는 ✓/○로만
 *    전달됐고 그 글리프에는 `aria-hidden`이 붙어 있었다 — 스크린리더에는 "8자 이상"이
 *    통과인지 아닌지 알 방법이 없다. v3는 미터를 `role="meter"`(+aria-valuetext)로,
 *    규칙 상태를 항목마다 숨김 텍스트("충족"/"미충족")로 낸다.
 * 3. **규칙은 복합 데이터라 property 전용**(§1.3). 선언적 초기화가 필요하면
 *    자식 `<script type="application/json">` 슬롯을 쓴다(jd-radio-group 선례). 함수는
 *    JSON에 담기지 않으므로 슬롯 문법은 `pattern`/`minLength` 서술형이고, 컴포넌트가
 *    검사 함수로 컴파일한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { on } from "../../behaviors/input.js";
import passwordStrengthStyles from "./password-strength.css.js";

export interface JdPasswordRule {
  /** 규칙 ID — 통과 목록의 식별자 */
  id: string;
  /** 표시 라벨 */
  label: string;
  /** 검증 함수 */
  test: (pw: string) => boolean;
}

/** JSON 슬롯 문법 — `pattern`(정규식 소스) 또는 `minLength` 중 하나 */
export interface JdPasswordRuleSpec {
  id: string;
  label: string;
  pattern?: string;
  flags?: string;
  minLength?: number;
}

/** v2 DEFAULT_RULES 동형 */
export const DEFAULT_PASSWORD_RULES: JdPasswordRule[] = [
  { id: "len", label: "8자 이상", test: (p) => p.length >= 8 },
  { id: "upper", label: "대문자 포함", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "소문자 포함", test: (p) => /[a-z]/.test(p) },
  { id: "num", label: "숫자 포함", test: (p) => /\d/.test(p) },
  { id: "special", label: "특수문자 포함", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const LEVEL_LABEL = ["매우 약함", "약함", "보통", "강함", "매우 강함"];
const BAR_COUNT = 4;

/** JSON 슬롯 한 줄 → 검사 함수. 형식이 어긋나면 null(해당 규칙만 버린다) */
function compileRule(spec: JdPasswordRuleSpec): JdPasswordRule | null {
  if (typeof spec?.id !== "string" || typeof spec?.label !== "string") return null;
  if (typeof spec.minLength === "number") {
    const min = spec.minLength;
    return { id: spec.id, label: spec.label, test: (p) => p.length >= min };
  }
  if (typeof spec.pattern === "string") {
    try {
      const re = new RegExp(spec.pattern, typeof spec.flags === "string" ? spec.flags : "");
      return { id: spec.id, label: spec.label, test: (p) => re.test(p) };
    } catch {
      return null;
    }
  }
  return null;
}

export class JdPasswordStrength extends JdElement {
  static override tag = "jd-password-strength";
  static override props = {
    /** 검사 대상. 마크업에 남지 않도록 property 전용(§1.3 복합·민감 데이터) */
    password: { type: String, attribute: false as const },
    /** 값을 읽어올 input의 id. 요소 자체가 input이 아니면 안쪽 input을 찾는다 */
    htmlFor: { type: String, attribute: "for" },
    /** v2 showLabel=false — 디폴트가 true인 프롭은 부정형으로 뒤집는다(jd-number-input 선례) */
    hideLabel: { type: Boolean, reflect: true },
    /** v2 showChecklist */
    checklist: { type: Boolean, reflect: true },
  };

  declare password: string;
  declare htmlFor: string;
  declare hideLabel: boolean;
  declare checklist: boolean;

  #rules: JdPasswordRule[] = DEFAULT_PASSWORD_RULES;
  #meter!: HTMLDivElement;
  #bars: HTMLSpanElement[] = [];
  #label!: HTMLSpanElement;
  #list!: HTMLUListElement;
  #level = -1;
  #passed = "";
  #boundFor: string | null = null;
  #detach: (() => void) | null = null;
  #live = false; // connected() 이후에만 외부 DOM을 읽는다(§3.1-3)

  /** 현재 강도(0~4). 마지막 update() 결과 */
  get level(): number {
    return Math.max(0, this.#level);
  }

  get rules(): JdPasswordRule[] {
    return this.#rules;
  }
  set rules(v: JdPasswordRule[]) {
    this.#rules = Array.isArray(v) ? v : DEFAULT_PASSWORD_RULES; // 비우면 기본 5종 복귀
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(passwordStrengthStyles);
    this.#consumeJsonSlot();

    const row = this.querySelector<HTMLDivElement>(":scope > .jd-password-strength__row");
    if (row) {
      // 입양(§3.3)
      this.#meter = row.querySelector(".jd-password-strength__meter")!;
      this.#bars = Array.from(row.querySelectorAll(".jd-password-strength__bar"));
      this.#label = row.querySelector(".jd-password-strength__label")!;
      this.#list = this.querySelector(":scope > .jd-password-strength__rules")!;
      this.update();
      return;
    }

    const head = document.createElement("div");
    head.className = "jd-password-strength__row";

    this.#meter = document.createElement("div");
    this.#meter.className = "jd-password-strength__meter";
    this.#meter.setAttribute("role", "meter");
    this.#meter.setAttribute("aria-label", "비밀번호 강도");
    this.#meter.setAttribute("aria-valuemin", "0");
    this.#meter.setAttribute("aria-valuemax", String(BAR_COUNT));
    this.#bars = [];
    for (let i = 0; i < BAR_COUNT; i++) {
      const bar = document.createElement("span");
      bar.className = "jd-password-strength__bar";
      this.#bars.push(bar);
      this.#meter.append(bar);
    }

    // 미터가 aria-valuetext로 같은 문구를 이미 말한다 — 눈에만 보이는 사본
    this.#label = document.createElement("span");
    this.#label.className = "jd-password-strength__label";
    this.#label.setAttribute("aria-hidden", "true");

    head.append(this.#meter, this.#label);

    this.#list = document.createElement("ul");
    this.#list.className = "jd-password-strength__rules";

    this.append(head, this.#list);
    this.update();
  }

  /** 선언적 초기화 슬롯 — 1회 소비 (WEB-03 예외 패턴) */
  #consumeJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdPasswordRuleSpec[];
      if (Array.isArray(parsed)) {
        const compiled = parsed.map(compileRule).filter((r): r is JdPasswordRule => r !== null);
        if (compiled.length > 0) this.#rules = compiled;
      }
    } catch {
      console.warn("[junds] <jd-password-strength> JSON 슬롯 파싱 실패 — 기본 규칙을 씁니다.");
    }
    script.remove();
  }

  protected override connected(): void {
    this.#live = true;
    this.#bind();
  }

  protected override disconnected(): void {
    this.#live = false;
    this.#detach?.();
    this.#detach = null;
    this.#boundFor = null;
  }

  /**
   * `for`가 가리키는 입력을 구독한다 — 비밀번호 사본이 이 컴포넌트 밖에 남지 않는다.
   * render() 단계에서는 아무것도 하지 않는다: 최초 렌더 결과가 바깥 DOM 상태에
   * 의존하면 프리렌더 스냅샷이 흔들린다(§3.1-3). 구독은 connected() 이후에만.
   */
  #bind(): void {
    if (!this.#live || this.#boundFor === this.htmlFor) return;
    this.#detach?.();
    this.#detach = null;
    this.#boundFor = this.htmlFor;
    if (!this.htmlFor) return;
    const root = this.getRootNode() as Document | ShadowRoot;
    const host = root.getElementById?.(this.htmlFor) ?? null;
    const input = host instanceof HTMLInputElement ? host : host?.querySelector?.("input") ?? null;
    if (!input) return;
    this.password = input.value;
    this.#detach = on(input, "input", () => {
      this.password = input.value;
    });
  }

  /** 소비자가 넘긴 test는 남의 코드다 — 여기서 터지면 update() 전체가 멈춘다 */
  #passes(rule: JdPasswordRule, pw: string): boolean {
    try {
      return rule.test(pw) === true;
    } catch {
      return false;
    }
  }

  /** 규칙 목록 재구축 — 라벨만 바뀌었으면 텍스트만 갱신 */
  #syncList(): void {
    const rows = Array.from(
      this.#list.querySelectorAll<HTMLLIElement>(":scope > .jd-password-strength__rule"),
    );
    if (rows.length === this.#rules.length) {
      rows.forEach((row, i) => {
        row.querySelector(".jd-password-strength__text")!.textContent = this.#rules[i]!.label;
      });
      return;
    }
    for (const row of rows) row.remove();
    for (const rule of this.#rules) {
      const row = document.createElement("li");
      row.className = "jd-password-strength__rule";
      const mark = document.createElement("span");
      mark.className = "jd-password-strength__mark";
      mark.setAttribute("aria-hidden", "true"); // v2와 동일하게 글리프는 장식
      const text = document.createElement("span");
      text.className = "jd-password-strength__text";
      text.textContent = rule.label;
      const state = document.createElement("span");
      state.className = "jd-password-strength__state"; // 시각적으로만 숨김
      row.append(mark, text, state);
      this.#list.append(row);
    }
  }

  protected override update(): void {
    this.#bind();
    this.#syncList();

    const pw = this.password || "";
    const rules = this.#rules;
    const passedIds: string[] = [];
    const rows = this.#list.querySelectorAll<HTMLLIElement>(":scope > .jd-password-strength__rule");
    rules.forEach((rule, i) => {
      const ok = this.#passes(rule, pw);
      if (ok) passedIds.push(rule.id);
      const row = rows[i];
      if (!row) return;
      row.toggleAttribute("data-ok", ok);
      row.querySelector(".jd-password-strength__mark")!.textContent = ok ? "✓" : "○";
      row.querySelector(".jd-password-strength__state")!.textContent = ok ? "충족" : "미충족";
    });

    // v2 동형: ratio → 0~4. 채워진 막대는 **전부 현재 등급 색**을 쓴다
    const ratio = rules.length === 0 ? 0 : passedIds.length / rules.length;
    const level = Math.min(BAR_COUNT, Math.round(ratio * BAR_COUNT));
    const text = LEVEL_LABEL[level]!;

    this.dataset.level = String(level);
    for (let i = 0; i < this.#bars.length; i++)
      this.#bars[i]!.toggleAttribute("data-on", level >= i + 1);
    this.#meter.setAttribute("aria-valuenow", String(level));
    this.#meter.setAttribute("aria-valuetext", text);
    this.#label.textContent = text;
    this.#label.hidden = this.hideLabel;
    this.#list.hidden = !this.checklist;

    const passed = passedIds.join(",");
    if (level === this.#level && passed === this.#passed) return;
    this.#level = level;
    this.#passed = passed;
    this.emit("jd-change", { level, passed: passedIds });
  }
}
