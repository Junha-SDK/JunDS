/**
 * <jd-comparison-grid> — 비교 지표 카드 그리드 (v2 composites/ComparisonGrid).
 *
 * 데이터 입력 2경로(§1.3 — 복합 데이터는 attribute 금지):
 *  1. `cards` 프로퍼티 (Array<JdComparisonCard>)
 *  2. 선언적 초기화: 자식 `<script type="application/json">[…]</script>`
 *     (radio-group·action-sheet·tabs 선례)
 *
 * v2는 정보를 **색으로만** 전달했다. v3가 고친 3가지:
 *  1. `hasVariance`(차이 있음)가 왼쪽 앰버 보더 + 앰버 배경으로만 표시됐다 — 색을 못 보는
 *     사용자에게는 존재하지 않는 정보다(WCAG 1.4.1). 라벨 옆에 시각적으로 숨긴
 *     "차이 있음"을 붙인다.
 *  2. 증감이 "↑"/"↓" 글리프로만 전달됐다 — 스크린리더가 화살표 문자를 읽는 방식은
 *     제각각이다. 화살표는 aria-hidden으로 내리고 "증가"/"감소"를 숨은 텍스트로 준다.
 *  3. 카드 묶음에 구조가 없었다(div 나열) — role=list/listitem으로 "지표 N개"를 알린다.
 *
 * 색은 전부 semantic 토큰으로 번역해 다크에서도 성립한다(v2는 amber/white 리터럴이라
 * 라이트 전용이었다).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import comparisonGridStyles from "./comparison-grid.css.js";

export interface JdComparisonChange {
  /** 표시 문자열 (예: "+3", "12%") */
  value: string;
  /** up | down | neutral. 기본 neutral */
  direction?: "up" | "down" | "neutral";
}

export interface JdComparisonCard {
  /** 식별자(선택). CE는 React key가 필요 없다 — v2 표면 호환용으로만 받는다 */
  key?: string;
  label: string;
  value: string | number;
  subtext?: string;
  /** 차이가 있을 때 강조 */
  hasVariance?: boolean;
  change?: JdComparisonChange;
}

const ARROW: Record<string, string> = { up: "↑", down: "↓", neutral: "" };
const DIRECTION_LABEL: Record<string, string> = { up: "증가", down: "감소", neutral: "" };

export class JdComparisonGrid extends JdElement {
  static override tag = "jd-comparison-grid";
  static override props = {
    /** 2 | 3 | 4 — v2 columnStyles. 기본 4 */
    columns: { type: Number, default: 4, reflect: true },
  };

  declare columns: number;

  #cards: JdComparisonCard[] = [];
  /** 마지막으로 골격에 반영한 배열 — 동기화 1회 판정 (jd-tabs 선례) */
  #built: readonly JdComparisonCard[] | null = null;

  get cards(): JdComparisonCard[] {
    return this.#cards;
  }
  set cards(v: JdComparisonCard[]) {
    this.#cards = Array.isArray(v) ? v : [];
    this.#built = null; // 같은 배열을 다시 대입해도 재동기화한다
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(comparisonGridStyles);
    this.#readJson();
    this.setAttribute("role", "list");
    this.#sync();
  }

  protected override update(): void {
    if (this.#built !== this.#cards) this.#sync();
  }

  /** 선언적 초기화 슬롯 — 1회 소비 */
  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdComparisonCard[];
      if (Array.isArray(parsed)) this.#cards = parsed;
    } catch {
      console.warn("[junds] <jd-comparison-grid> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #items(): HTMLElement[] {
    return Array.from(
      this.querySelectorAll<HTMLElement>(":scope > .jd-comparison-grid__card"),
    );
  }

  /** 입양(§3.3): 개수가 같으면 만들지 않고 내용만 맞춘다 */
  #sync(): void {
    this.#built = this.#cards;
    let items = this.#items();
    if (items.length !== this.#cards.length) {
      for (const el of items) el.remove();
      for (let i = 0; i < this.#cards.length; i++) this.append(this.#createCard());
      items = this.#items();
    }
    items.forEach((item, i) => {
      const card = this.#cards[i];
      if (!card) return;
      this.#fill(item, card);
    });
  }

  #createCard(): HTMLElement {
    const doc = this.ownerDocument;
    const card = doc.createElement("div");
    card.className = "jd-comparison-grid__card";
    card.setAttribute("role", "listitem");

    const label = doc.createElement("span");
    label.className = "jd-comparison-grid__label";
    const labelText = doc.createElement("span");
    labelText.className = "jd-comparison-grid__label-text";
    const variance = doc.createElement("span");
    variance.className = "jd-comparison-grid__sr jd-comparison-grid__variance";
    label.append(labelText, variance);

    const row = doc.createElement("div");
    row.className = "jd-comparison-grid__row";
    const value = doc.createElement("span");
    value.className = "jd-comparison-grid__value";
    const change = doc.createElement("span");
    change.className = "jd-comparison-grid__change";
    const arrow = doc.createElement("span");
    arrow.className = "jd-comparison-grid__arrow";
    arrow.setAttribute("aria-hidden", "true");
    const changeValue = doc.createElement("span");
    changeValue.className = "jd-comparison-grid__change-value";
    const direction = doc.createElement("span");
    direction.className = "jd-comparison-grid__sr jd-comparison-grid__direction";
    change.append(arrow, changeValue, direction);
    row.append(value, change);

    const subtext = doc.createElement("p");
    subtext.className = "jd-comparison-grid__subtext";

    card.append(label, row, subtext);
    return card;
  }

  #fill(item: HTMLElement, card: JdComparisonCard): void {
    const q = <T extends HTMLElement>(cls: string): T =>
      item.querySelector<T>(`.jd-comparison-grid__${cls}`)!;

    q("label-text").textContent = card.label;
    q("variance").textContent = card.hasVariance ? "차이 있음" : "";
    item.toggleAttribute("data-variance", Boolean(card.hasVariance));

    q("value").textContent = String(card.value);

    const change = q("change");
    const dir = card.change?.direction ?? "neutral";
    change.hidden = !card.change;
    change.dataset.direction = dir;
    q("arrow").textContent = ARROW[dir] ?? "";
    q("change-value").textContent = card.change?.value ?? "";
    q("direction").textContent = DIRECTION_LABEL[dir] ?? "";

    const subtext = q("subtext");
    subtext.textContent = card.subtext ?? "";
    subtext.hidden = !card.subtext;
  }
}
