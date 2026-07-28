/**
 * <jd-cron-expression> — cron 표현식 시각 편집기 (v2 composites/CronExpression).
 *
 * - 5칸 네이티브 <input> 위임(§1.6-1): 폼 참여·IME·자동완성이 브라우저 기본.
 *   리스너는 호스트 위임 2종(input·change)이라 칸 재구축과 무관하다.
 * - a11y 상위집합: v2의 `<label>`은 htmlFor가 없어 **어느 입력과도 연결되지 않았다**.
 *   여기서는 jd-uid로 id를 발급해 for/id를 잇고(§8), 호스트에 role="group" +
 *   aria-label, 해설 행은 role="status"(live) + 각 칸의 aria-describedby 대상이다.
 * - 편집 중 칸은 덮어쓰지 않는다: v2는 controlled라 칸을 비우는 순간 "*"가 되돌아와
 *   커서가 튀었다. 여기서는 빈 값→"*" 정규화를 **모델에만** 적용하고, 포커스가 떠난
 *   뒤(change) 화면에 반영한다 (jd-text-field의 IME 되쓰기 방어와 같은 계열).
 * - 파싱은 `split(" ")`이 아니라 공백 런(\\s+) 분할 — v2는 "0  * * * *"(이중 공백)를
 *   6칸으로 읽어 전량 "*"로 무너뜨렸다.
 * - v2 FIELDS의 `options`(0~59 등 목록)는 v2에서도 **어디에도 쓰이지 않는 죽은 값**이라
 *   이식하지 않았다. 칸은 v2와 동일하게 자유 텍스트다(스텝·범위 표기 허용).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import cronExpressionStyles from "./cron-expression.css.js";

const FIELD_LABELS = ["분", "시", "일", "월", "요일"] as const;
const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"] as const;
const WILDCARD = "*";
const DEFAULT_VALUE = "* * * * *";

/** 표현식 → 5칸. 형식이 어긋나면 v2처럼 전량 와일드카드 */
export function cronParts(value: string): string[] {
  const parts = String(value ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return parts.length === 5 ? parts : [WILDCARD, WILDCARD, WILDCARD, WILDCARD, WILDCARD];
}

/** 한국어 요약 (v2 describeCron 동형) */
export function describeCron(value: string | string[]): string {
  const parts = Array.isArray(value) ? value : cronParts(value);
  if (parts.length !== 5) return "잘못된 형식";
  const [min, hour, day, month, dow] = parts as [string, string, string, string, string];
  const descs: string[] = [];
  if (min !== WILDCARD) descs.push(`${min}분`);
  if (hour !== WILDCARD) descs.push(`${hour}시`);
  if (day !== WILDCARD) descs.push(`${day}일`);
  if (month !== WILDCARD) descs.push(`${month}월`);
  if (dow !== WILDCARD) {
    descs.push(
      dow
        .split(",")
        .map((d) => DAY_NAMES[Number(d)] ?? d)
        .join(",") + "요일",
    );
  }
  if (descs.length === 0) return "매 분마다";
  return descs.join(" ") + " 실행";
}

export interface JdCronChangeDetail {
  value: string;
  parts: string[];
}

export class JdCronExpression extends JdElement {
  static override tag = "jd-cron-expression";
  static override props = {
    /** cron 표현식 5필드. attribute는 초기값, 이후 입력·property가 덮는다(§1.3) */
    value: { type: String, default: DEFAULT_VALUE },
    /** 그룹 접근 이름 */
    label: { type: String, default: "cron 표현식" },
    disabled: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
  };

  declare value: string;
  declare label: string;
  declare disabled: boolean;
  declare readonly: boolean;

  #inputs: HTMLInputElement[] = [];
  #valueEl: HTMLElement | undefined;
  #descEl: HTMLElement | undefined;

  /** 정규화된 5칸 */
  get parts(): string[] {
    return cronParts(this.value);
  }

  /** 사람이 읽는 요약 */
  get description(): string {
    return describeCron(this.parts);
  }

  protected render(): void {
    adoptStyles(cronExpressionStyles);
    this.setAttribute("role", "group");
    if (!this.#collect()) this.#build();
    this.update();
  }

  protected override connected(): void {
    this.addEventListener("input", this.#onInput);
    this.addEventListener("change", this.#onChange);
  }

  protected override disconnected(): void {
    this.removeEventListener("input", this.#onInput);
    this.removeEventListener("change", this.#onChange);
  }

  /** 기존 골격 입양(§3.3). 구조가 어긋나면 false */
  #collect(): boolean {
    const inputs = Array.from(this.querySelectorAll<HTMLInputElement>("input.jd-cron__input"));
    const valueEl = this.querySelector<HTMLElement>(".jd-cron__value");
    const descEl = this.querySelector<HTMLElement>(".jd-cron__desc");
    if (inputs.length !== FIELD_LABELS.length || !valueEl || !descEl) return false;
    this.#inputs = inputs;
    this.#valueEl = valueEl;
    this.#descEl = descEl;
    return true;
  }

  #build(): void {
    for (const n of Array.from(this.children)) n.remove();
    const uid = jdUid("jd-cron");
    const descId = `${uid}-desc`;

    const fields = document.createElement("div");
    fields.className = "jd-cron__fields";
    this.#inputs = FIELD_LABELS.map((text, i) => {
      const cell = document.createElement("div");
      cell.className = "jd-cron__field";
      const label = document.createElement("label");
      label.className = "jd-cron__label";
      label.htmlFor = `${uid}-${i}`;
      label.textContent = text;
      const input = document.createElement("input");
      input.className = "jd-cron__input";
      input.id = `${uid}-${i}`;
      input.type = "text";
      input.placeholder = WILDCARD;
      input.autocomplete = "off";
      input.spellcheck = false;
      input.setAttribute("aria-describedby", descId);
      cell.append(label, input);
      fields.append(cell);
      return input;
    });

    const summary = document.createElement("div");
    summary.className = "jd-cron__summary";
    const valueEl = document.createElement("code");
    valueEl.className = "jd-cron__value";
    const descEl = document.createElement("span");
    descEl.className = "jd-cron__desc";
    descEl.id = descId;
    descEl.setAttribute("role", "status");
    summary.append(valueEl, descEl);

    this.append(fields, summary);
    this.#valueEl = valueEl;
    this.#descEl = descEl;
  }

  /* ── 입력 ────────────────────────────────────────────── */

  #onInput = (e: Event): void => {
    this.#commit(e, "jd-input");
  };

  #onChange = (e: Event): void => {
    this.#commit(e, "jd-change");
  };

  #commit(e: Event, name: "jd-input" | "jd-change"): void {
    const input = e.target as HTMLInputElement;
    const i = this.#inputs.indexOf(input);
    if (i < 0) return;
    const next = this.parts.slice();
    next[i] = input.value.trim() || WILDCARD; // 빈 칸 = 와일드카드 (v2 동형)
    const value = next.join(" ");
    this.value = value;
    this.emit<JdCronChangeDetail>(name, { value, parts: next });
  }

  protected override update(): void {
    const parts = this.parts;
    const active = this.ownerDocument.activeElement;
    this.#inputs.forEach((input, i) => {
      const part = parts[i] ?? WILDCARD;
      // 편집 중인 칸은 건드리지 않는다 — 커서·조합 보호
      if (input !== active && input.value !== part) input.value = part;
      input.disabled = this.disabled;
      input.readOnly = this.readonly;
    });
    if (this.#valueEl) this.#valueEl.textContent = this.value.trim() || DEFAULT_VALUE;
    if (this.#descEl) this.#descEl.textContent = this.description;
    this.setAttribute("aria-label", this.label);
  }

  /** 첫 칸으로 포커스 */
  override focus(options?: FocusOptions): void {
    this.#inputs[0]?.focus(options);
  }
}
