/**
 * <jd-pricing-table> — 요금제 카드 그리드 (v2 composites/PricingTable).
 *
 * 플랜 입력 2경로(§1.3): `plans` 프로퍼티(Array<JdPricingPlan>) 또는 자식
 * <script type="application/json">(WEB-03 예외). v2의 onCta 콜백은 jd-cta 이벤트로
 * 승격(detail { plan, label }, §1.5). 열 수는 columns 프로퍼티 또는 min(플랜수, 4).
 * 호스트가 곧 그리드 컨테이너(v2 root div와 동형)이며 열 수만 인라인 커스텀
 * 프로퍼티(--cols)로 전달, 나머지 시각은 전부 CSS(§4.3).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import pricingTableStyles from "./pricing-table.css.js";

export interface JdPricingPlan {
  id: string;
  name: string;
  price: string;
  priceSuffix?: string;
  description?: string;
  features: string[];
  ctaLabel?: string;
  highlighted?: boolean;
  badge?: string;
  disabled?: boolean;
}

const CHECK_SVG =
  `<svg class="jd-pricing-table__check" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">` +
  `<path d="M3 8l3.5 3.5L13 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export class JdPricingTable extends JdElement {
  static override tag = "jd-pricing-table";
  static override props = {
    columns: { type: Number, default: 0, reflect: true }, // 0 = 자동(min(플랜수,4))
  };

  declare columns: number;

  #plans: JdPricingPlan[] = [];
  #sig = "";

  get plans(): JdPricingPlan[] {
    return this.#plans;
  }
  set plans(v: JdPricingPlan[]) {
    this.#plans = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(pricingTableStyles);
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (script) {
      try {
        const parsed = JSON.parse(script.textContent || "[]") as JdPricingPlan[];
        if (Array.isArray(parsed)) this.#plans = parsed;
      } catch {
        console.warn("[junds] <jd-pricing-table> JSON 슬롯 파싱 실패 — 무시합니다.");
      }
      script.remove();
    }
    this.update();
  }

  protected override update(): void {
    const cols = this.columns > 0 ? this.columns : Math.min(Math.max(this.#plans.length, 1), 4);
    this.style.setProperty("--cols", String(cols));

    const sig = JSON.stringify(this.#plans);
    if (sig === this.#sig) return;
    this.#sig = sig;

    // 기존 플랜 카드만 제거(입양 script는 render에서 이미 소비)
    for (const el of this.querySelectorAll(":scope > .jd-pricing-table__plan")) el.remove();
    for (const plan of this.#plans) this.append(this.#buildPlan(plan));
  }

  #buildPlan(plan: JdPricingPlan): HTMLElement {
    const card = document.createElement("article");
    card.className = "jd-pricing-table__plan";
    card.toggleAttribute("data-highlighted", Boolean(plan.highlighted));
    card.toggleAttribute("data-disabled", Boolean(plan.disabled));

    if (plan.badge) {
      const badge = document.createElement("span");
      badge.className = "jd-pricing-table__badge";
      badge.textContent = plan.badge;
      card.append(badge);
    }

    const header = document.createElement("div");
    header.className = "jd-pricing-table__header";
    const name = document.createElement("h3");
    name.className = "jd-pricing-table__name";
    name.textContent = plan.name;
    header.append(name);
    if (plan.description) {
      const desc = document.createElement("p");
      desc.className = "jd-pricing-table__desc";
      desc.textContent = plan.description;
      header.append(desc);
    }
    card.append(header);

    const price = document.createElement("div");
    price.className = "jd-pricing-table__price";
    const amount = document.createElement("span");
    amount.className = "jd-pricing-table__amount";
    amount.textContent = plan.price;
    price.append(amount);
    if (plan.priceSuffix) {
      const suffix = document.createElement("span");
      suffix.className = "jd-pricing-table__suffix";
      suffix.textContent = plan.priceSuffix;
      price.append(suffix);
    }
    card.append(price);

    const list = document.createElement("ul");
    list.className = "jd-pricing-table__features";
    for (const f of plan.features ?? []) {
      const li = document.createElement("li");
      li.className = "jd-pricing-table__feature";
      li.innerHTML = CHECK_SVG;
      const span = document.createElement("span");
      span.textContent = f;
      li.append(span);
      list.append(li);
    }
    card.append(list);

    if (plan.ctaLabel) {
      const cta = document.createElement("button");
      cta.type = "button";
      cta.className = "jd-pricing-table__cta";
      cta.textContent = plan.ctaLabel;
      cta.disabled = Boolean(plan.disabled);
      cta.addEventListener("click", () =>
        this.emit("jd-cta", { plan: plan.id, label: plan.ctaLabel }),
      );
      card.append(cta);
    }
    return card;
  }
}
