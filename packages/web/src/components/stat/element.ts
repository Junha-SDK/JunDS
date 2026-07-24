/**
 * <jd-stat> — 단일 지표 표시 (v2 composites/Stat).
 *
 * **지표 3종의 골격 정본이다.** StatCard·MetricCard가 이 클래스를 상속하고 카드 크롬과
 * 스파크라인만 얹는다(§6 R12). v2에서는 Stat·StatCard·MetricCard가 라벨/값/변화량
 * 마크업을 각자 다시 썼고, 그래서 같은 화면에 세 개를 놓으면 트렌드 화살표(↑ vs ↑ )·
 * 변화량 색(text-success vs bg 칩)·라벨 대문자 규칙이 미묘하게 달랐다.
 *
 * 판단 4건:
 * 1. **change는 String 프로퍼티 하나로 통합**. v2는 Stat·MetricCard가 number(5.2 →
 *    "↑ 5.2%")였고 StatCard는 문자열("+12%")이었다. attribute는 언제나 문자열이라
 *    타입을 갈라 두면 `<jd-stat-card change="+12%">`가 NaN으로 죽는다(§1.3 Number 규칙).
 *    → 순수 숫자 문자열이면 v2 숫자 경로(부호 떼고 "%" 붙임), 아니면 문자열 그대로.
 *    두 표면 모두 원본과 같은 것을 그린다.
 * 2. **trend는 미지정이면 change 부호로 자동 판정**(v2 Stat 동형). v2 StatCard의
 *    "neutral"은 같은 뜻의 다른 이름이라 "flat"으로 정규화한다. 판정 결과는
 *    `data-trend`로 호스트에 실어 CSS가 색을 고른다 — 저자가 쓴 `trend` attribute는
 *    건드리지 않는다(update()가 저자 입력을 덮어쓰지 않는다는 규칙).
 * 3. **화살표는 장식이 아니라 정보였다**. v2는 "↑"만 그렸고 스크린리더에서는 글리프가
 *    낭독되거나(제각각) 통째로 무시된다 — 방향이 색과 글리프로만 전달됐다. v3는
 *    화살표를 aria-hidden으로 내리고 "증가/감소/변동 없음"을 숨김 텍스트로 낸다.
 * 4. **값은 tabular-nums 고정**. 지표는 갱신될 때마다 폭이 흔들리면 읽기 어렵다
 *    (v2도 tabular-nums였다 — 승계).
 *
 * 아이콘은 light DOM 슬롯(`slot="icon"`), 그 외 children은 값 노드로 이동한다(§10.1
 * button 선례) — `<jd-stat label="MAU"><b>12,800</b></jd-stat>`가 그대로 동작한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import statStyles from "./stat.css.js";

export type JdTrend = "up" | "down" | "flat";

/** v2 trendStyles의 화살표 + 숨김 낱말(v3 신설 — 판단 3) */
const TREND: Record<JdTrend, { arrow: string; word: string }> = {
  up: { arrow: "↑", word: "증가" },
  down: { arrow: "↓", word: "감소" },
  flat: { arrow: "—", word: "변동 없음" },
};

/** 순수 숫자 문자열만 v2 숫자 경로로 그린다("5.2" → "5.2%") */
const BARE_NUMBER = /^[+-]?\d+(?:\.\d+)?$/;
/** 트렌드 자동 판정용 선두 숫자 — "+12%" → 12, "-5%" → -5 */
const LEADING_NUMBER = /[+-]?\d+(?:\.\d+)?/;

/** "neutral"(v2 StatCard)과 "flat"(v2 Stat)은 같은 뜻 */
function normalizeTrend(raw: string): JdTrend | null {
  if (raw === "up" || raw === "down" || raw === "flat") return raw;
  if (raw === "neutral") return "flat";
  return null;
}

export class JdStat extends JdElement {
  static override tag = "jd-stat";
  static override props = {
    label: { type: String },
    /** 표시 값. 비우면 호스트에 쓴 children이 값으로 남는다 */
    value: { type: String },
    /** 보조 단위/접미사 */
    unit: { type: String },
    /** "5.2"(숫자 경로) 또는 "+12%"(문자열 그대로) */
    change: { type: String },
    /** up | down | flat(=neutral). 비우면 change 부호로 자동 판정 */
    trend: { type: String, reflect: true },
    /** 부가 설명 */
    hint: { type: String },
    /** left | center */
    align: { type: String, default: "left", reflect: true },
  };

  declare label: string;
  declare value: string;
  declare unit: string;
  declare change: string;
  declare trend: string;
  declare hint: string;
  declare align: string;

  /** 파생(StatCard·MetricCard)이 추가 골격을 붙일 지점 */
  protected main!: HTMLElement;
  #label!: HTMLElement;
  #value!: HTMLElement;
  #unit!: HTMLElement;
  #delta!: HTMLElement;
  #change!: HTMLElement;
  #arrow!: HTMLElement;
  #trendWord!: HTMLElement;
  #changeText!: HTMLElement;
  #changeLabel!: HTMLElement;
  #hint!: HTMLElement;
  /** value 노드 내용을 프로퍼티가 소유한 적이 있는지 — children 값과 구분 */
  #valueOwned = false;

  protected render(): void {
    adoptStyles(statStyles);
    this.#buildSkeleton();
    this.update();
  }

  /** hint 노드에 넣을 문자열 — StatCard가 v2 description으로 재정의 */
  protected hintText(): string {
    return this.hint;
  }

  /** change 옆 보조 텍스트 — MetricCard가 v2 changeLabel로 재정의 */
  protected changeLabelText(): string {
    return "";
  }

  /** 입양 규칙(§3.3): 이미 그려진 골격이 있으면 재사용, 없을 때만 만든다 */
  #buildSkeleton(): void {
    const found = this.querySelector<HTMLElement>(":scope > .jd-stat__main");
    if (found) {
      this.main = found;
      this.#label = found.querySelector(".jd-stat__label")!;
      this.#value = found.querySelector(".jd-stat__value")!;
      this.#unit = found.querySelector(".jd-stat__unit")!;
      this.#delta = found.querySelector(".jd-stat__delta")!;
      this.#change = found.querySelector(".jd-stat__change")!;
      this.#arrow = found.querySelector(".jd-stat__arrow")!;
      this.#trendWord = found.querySelector(".jd-stat__trend-word")!;
      this.#changeText = found.querySelector(".jd-stat__change-text")!;
      this.#changeLabel = found.querySelector(".jd-stat__change-label")!;
      this.#hint = found.querySelector(".jd-stat__hint")!;
      return;
    }

    const icon = this.querySelector(':scope > [slot="icon"]');
    const rest = Array.from(this.childNodes).filter((n) => n !== icon);

    this.#label = el("span", "jd-stat__label");
    this.#value = el("span", "jd-stat__value");
    this.#value.append(...rest); // 사용자가 쓴 children = 값 (§10.1 선례)
    this.#unit = el("span", "jd-stat__unit");

    this.#arrow = el("span", "jd-stat__arrow");
    this.#arrow.setAttribute("aria-hidden", "true");
    this.#trendWord = el("span", "jd-stat__trend-word jd-stat__sr");
    this.#changeText = el("span", "jd-stat__change-text");
    this.#change = el("span", "jd-stat__change");
    this.#change.append(this.#arrow, this.#trendWord, this.#changeText);
    this.#changeLabel = el("span", "jd-stat__change-label");
    // delta는 기본이 display:contents인 투명 래퍼 — value와 같은 baseline 줄에
    // 참여한다. MetricCard만 실제 상자로 승격해 통째로 다음 줄로 내린다.
    this.#delta = el("span", "jd-stat__delta");
    this.#delta.append(this.#change, this.#changeLabel);

    const row = el("div", "jd-stat__row");
    row.append(this.#value, this.#unit, this.#delta);

    this.#hint = el("p", "jd-stat__hint");

    const text = el("div", "jd-stat__text");
    text.append(this.#label, row, this.#hint);

    this.main = el("div", "jd-stat__main");
    this.main.append(text);
    if (icon) this.main.append(icon);
    this.append(this.main);
  }

  protected override update(): void {
    this.#label.textContent = this.label;
    this.#label.hidden = !this.label;

    if (this.value) {
      this.#value.textContent = this.value;
      this.#valueOwned = true;
    } else if (this.#valueOwned) {
      this.#value.textContent = "";
      this.#valueOwned = false;
    }

    this.#unit.textContent = this.unit;
    this.#unit.hidden = !this.unit;

    this.#paintChange();

    const hint = this.hintText();
    this.#hint.textContent = hint;
    this.#hint.hidden = !hint;
  }

  #paintChange(): void {
    const raw = this.change.trim();
    const explicit = normalizeTrend(this.trend);
    const parsed = LEADING_NUMBER.exec(raw);
    const n = parsed ? Number(parsed[0]) : Number.NaN;
    const auto: JdTrend = Number.isNaN(n) ? "flat" : n > 0 ? "up" : n < 0 ? "down" : "flat";
    const trend = explicit ?? auto;

    // 판정 결과만 data-trend로 — 저자가 쓴 trend attribute는 건드리지 않는다
    this.setAttribute("data-trend", trend);

    const shown = raw && BARE_NUMBER.test(raw) ? `${Math.abs(n)}%` : raw;
    this.#arrow.textContent = TREND[trend].arrow;
    this.#trendWord.textContent = raw ? TREND[trend].word : "";
    this.#changeText.textContent = shown;
    this.#change.hidden = !raw;

    const changeLabel = this.changeLabelText();
    this.#changeLabel.textContent = changeLabel;
    this.#changeLabel.hidden = !changeLabel;
    this.#delta.hidden = !raw && !changeLabel;
  }
}

/** 골격 노드 생성 헬퍼 — 클래스 문자열까지 한 줄로 */
function el(tag: string, className: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}
