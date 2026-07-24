/**
 * <jd-trust-indicator> — 보안 신뢰 지표 (v2 composites/TrustIndicator).
 * 항목별 통과/실패 + 상단 점수 요약.
 *
 * 판단 5건:
 * 1. **항목은 property + JSON 슬롯**(§1.3 — 배열은 attribute 금지). 선언적 초기화는
 *    자식 `<script type="application/json">`으로(jd-radio-group·jd-action-sheet 선례).
 * 2. **목록을 진짜 목록으로 냈다.** v2는 div 나열이라 "5개 중 3번째" 같은 목록 문맥이
 *    없었다. `<ul>` + 명시적 `role="list"` — list-style을 지우면 WebKit이 목록 의미를
 *    떨어뜨리는 것이 알려진 동작이라 role을 지운 자리에 다시 박아 준다.
 * 3. **items가 비면 v2는 "NaN%"를 그렸다**(0/0). 점수 계산을 0으로 막고 헤더 점수는
 *    항목이 있을 때만 보인다.
 * 4. **점수·개수에 문맥을 붙였다.** v2 헤더는 "80%"와 "(4/5)"만 있고 무엇의 80%인지
 *    말하지 않는다. 숨김 텍스트로 "신뢰 점수"·"5개 중 4개 통과"를 낸다(시각은 그대로).
 * 5. **커스텀 아이콘(v2 item.icon: ReactNode)은 승계하지 않는다.** 데이터로 받은 HTML을
 *    주입하는 경로는 XSS 통로이고, JSON 슬롯에 노드를 담을 방법도 없다. 상태 아이콘 4종은
 *    CSS가 색을 주므로 도형만 고정이다. 임의 아이콘이 필요한 소비자는 React 어댑터 몫.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import trustIndicatorStyles from "./trust-indicator.css.js";

export type JdTrustStatus = "pass" | "fail" | "warning" | "pending";

export interface JdTrustItem {
  key: string;
  label: string;
  description?: string;
  status: JdTrustStatus;
}

/** 도형만 고정 — 색(fill/stroke)은 CSS가 상태별로 준다 */
const SHAPES: Record<JdTrustStatus, string> = {
  pass: `<circle cx="8" cy="8" r="7"/><path d="M5 8.2l2 2 4-4"/>`,
  fail: `<circle cx="8" cy="8" r="7"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5"/>`,
  warning: `<circle cx="8" cy="8" r="7"/><path d="M8 5v3.5M8 11h.01"/>`,
  pending: `<circle cx="8" cy="8" r="7"/><path d="M8 5v3l2 1"/>`,
};

const STATUS_LABEL: Record<JdTrustStatus, string> = {
  pass: "통과",
  fail: "실패",
  warning: "주의",
  pending: "대기",
};

const isStatus = (v: unknown): v is JdTrustStatus =>
  typeof v === "string" && Object.prototype.hasOwnProperty.call(SHAPES, v);

/** 알 수 없는 값은 pending으로 — 목록에서 항목을 통째로 잃는 것보다 낫다 */
function normalize(raw: unknown): JdTrustItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null)
    .map((x, i) => ({
      key: typeof x.key === "string" ? x.key : String(i),
      label: typeof x.label === "string" ? x.label : "",
      description: typeof x.description === "string" ? x.description : "",
      status: isStatus(x.status) ? x.status : "pending",
    }));
}

export class JdTrustIndicator extends JdElement {
  static override tag = "jd-trust-indicator";
  static override props = {
    /** 헤더 제목. 비우면 헤더(점수 포함)가 통째로 숨는다 — v2 동형 */
    title: { type: String },
  };

  declare title: string;

  #items: JdTrustItem[] = [];
  #header!: HTMLElement;
  #title!: HTMLElement;
  #score!: HTMLElement;
  #count!: HTMLElement;
  #countSr!: HTMLElement;
  #list!: HTMLElement;

  get items(): JdTrustItem[] {
    return this.#items;
  }
  set items(v: JdTrustItem[]) {
    this.#items = normalize(v);
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(trustIndicatorStyles);
    this.#readJsonSlot();
    const found = this.querySelector<HTMLElement>(":scope > .jd-trust-indicator__header");
    if (found) {
      this.#header = found;
      this.#title = found.querySelector(".jd-trust-indicator__title")!;
      this.#score = found.querySelector(".jd-trust-indicator__score")!;
      this.#count = found.querySelector(".jd-trust-indicator__count")!;
      this.#countSr = found.querySelector(".jd-trust-indicator__count-sr")!;
      this.#list = this.querySelector(".jd-trust-indicator__list")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    this.#title = span("jd-trust-indicator__title");
    this.#score = span("jd-trust-indicator__score");
    this.#count = span("jd-trust-indicator__count");
    this.#count.setAttribute("aria-hidden", "true"); // 아래 숨김 문장이 대신 읽힌다
    this.#countSr = span("jd-trust-indicator__count-sr jd-trust-indicator__sr");

    const scoreLabel = span("jd-trust-indicator__sr");
    scoreLabel.textContent = "신뢰 점수 ";
    const scoreBox = span("jd-trust-indicator__score-box");
    scoreBox.append(scoreLabel, this.#score, this.#count, this.#countSr);

    this.#header = document.createElement("div");
    this.#header.className = "jd-trust-indicator__header";
    this.#header.append(this.#title, scoreBox);

    this.#list = document.createElement("ul");
    this.#list.className = "jd-trust-indicator__list";
    this.#list.setAttribute("role", "list"); // 판단 2

    this.append(this.#header, this.#list);
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      this.#items = normalize(JSON.parse(script.textContent || "[]"));
    } catch {
      console.warn("[junds] <jd-trust-indicator> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override update(): void {
    const items = this.#items;
    const total = items.length;
    const passed = items.filter((i) => i.status === "pass").length;
    // 0개일 때 0/0 = NaN을 그리지 않는다(판단 3)
    const score = total === 0 ? 0 : Math.round((passed / total) * 100);

    this.#title.textContent = this.title;
    this.#header.hidden = !this.title;
    this.#score.textContent = `${score}%`;
    this.#score.hidden = total === 0;
    this.#count.textContent = `(${passed}/${total})`;
    this.#count.hidden = total === 0;
    this.#countSr.textContent = total === 0 ? "" : `${total}개 중 ${passed}개 통과`;
    this.setAttribute("data-score", score >= 80 ? "high" : score >= 50 ? "mid" : "low");

    this.#syncRows(items);
  }

  /** 행 개수를 맞춘 뒤 내용만 동기화 — 목록이 갱신돼도 노드를 버리지 않는다 */
  #syncRows(items: JdTrustItem[]): void {
    const list = this.#list;
    while (list.children.length > items.length) list.lastElementChild?.remove();
    while (list.children.length < items.length) list.append(buildRow());

    items.forEach((item, i) => {
      const row = list.children[i] as HTMLElement;
      if (row.dataset.status !== item.status) {
        row.dataset.status = item.status;
        row.querySelector(".jd-trust-indicator__icon")!.innerHTML =
          `<svg viewBox="0 0 16 16" focusable="false">${SHAPES[item.status]}</svg>`;
        row.querySelector(".jd-trust-indicator__status")!.textContent = STATUS_LABEL[item.status];
      }
      row.dataset.key = item.key;
      row.querySelector(".jd-trust-indicator__label")!.textContent = item.label;
      const desc = row.querySelector<HTMLElement>(".jd-trust-indicator__desc")!;
      desc.textContent = item.description ?? "";
      desc.hidden = !item.description;
    });
  }
}

function span(className: string): HTMLElement {
  const node = document.createElement("span");
  node.className = className;
  return node;
}

function buildRow(): HTMLLIElement {
  const row = document.createElement("li");
  row.className = "jd-trust-indicator__item";
  const icon = span("jd-trust-indicator__icon");
  icon.setAttribute("aria-hidden", "true"); // 상태는 오른쪽 낱말이 말한다
  const body = span("jd-trust-indicator__body");
  body.append(span("jd-trust-indicator__label"), span("jd-trust-indicator__desc"));
  row.append(icon, body, span("jd-trust-indicator__status"));
  return row;
}
