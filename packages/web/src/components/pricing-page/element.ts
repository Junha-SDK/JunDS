/**
 * <jd-pricing-page> — 마케팅 요금제 페이지 (v2 patterns/PricingPage).
 * 헤더(제목/설명) + 월간/연간 토글 + <jd-pricing-table> + FAQ(<details>) + 푸터 CTA.
 *
 * v2 대비:
 *  - 내부 표는 이미 만들어진 `<jd-pricing-table>`을 **합성**한다 — 요금 카드 시각을
 *    한 곳(pricing-table)에 둔다(§6 R12, 중복 구현 금지).
 *  - `useState(yearly)`는 내부 상태 + `jd-change`(detail {yearly}) 이벤트로 승격(§1.5).
 *  - 토글은 `role="group"` + `aria-pressed`로 두 버튼의 선택 상태를 AT에 전한다
 *    (v2는 시각 색상만 있었다).
 *  - 데이터는 property(monthlyPlans/yearlyPlans/faqs) 또는 자식
 *    <script type="application/json"> 슬롯(§1.3 예외).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import type { JdPricingPlan } from "../pricing-table/element.js";
import pricingPageStyles from "./pricing-page.css.js";

export interface JdPricingFaq {
  question: string;
  answer: string;
}

export interface JdPricingToggleLabels {
  monthly?: string;
  yearly?: string;
  saveLabel?: string;
}

const DEFAULT_LABELS: Required<JdPricingToggleLabels> = {
  monthly: "월간",
  yearly: "연간",
  saveLabel: "20% 절약",
};

export class JdPricingPage extends JdElement {
  static override tag = "jd-pricing-page";
  static override props = {
    title: { type: String },
    description: { type: String },
  };

  declare title: string;
  declare description: string;

  #monthly: JdPricingPlan[] = [];
  #yearlyPlans: JdPricingPlan[] = [];
  #faqs: JdPricingFaq[] = [];
  #labels: Required<JdPricingToggleLabels> = { ...DEFAULT_LABELS };
  /** 현재 연간 선택 여부 — 초기 렌더는 항상 월간(결정적, §3.1-3) */
  #yearly = false;

  #titleEl!: HTMLHeadingElement;
  #descEl!: HTMLParagraphElement;
  #toggle!: HTMLElement;
  #monthlyBtn!: HTMLButtonElement;
  #yearlyBtn!: HTMLButtonElement;
  #yearlyLabelEl!: HTMLSpanElement;
  #saveEl!: HTMLSpanElement;
  #table!: HTMLElement & { plans?: JdPricingPlan[] };
  #faqSection!: HTMLElement;
  #faqList!: HTMLElement;
  #footer!: HTMLElement;
  #plansSig = "";
  #faqSig = "";

  get monthlyPlans(): JdPricingPlan[] {
    return this.#monthly;
  }
  set monthlyPlans(v: JdPricingPlan[]) {
    this.#monthly = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  get yearlyPlans(): JdPricingPlan[] {
    return this.#yearlyPlans;
  }
  set yearlyPlans(v: JdPricingPlan[]) {
    this.#yearlyPlans = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  get faqs(): JdPricingFaq[] {
    return this.#faqs;
  }
  set faqs(v: JdPricingFaq[]) {
    this.#faqs = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  get toggleLabels(): Required<JdPricingToggleLabels> {
    return this.#labels;
  }
  set toggleLabels(v: JdPricingToggleLabels) {
    this.#labels = { ...DEFAULT_LABELS, ...(v ?? {}) };
    this.requestUpdate();
  }

  /** 연간 선택 상태(프로그램 제어용) */
  get yearly(): boolean {
    return this.#yearly;
  }
  set yearly(v: boolean) {
    this.#setYearly(Boolean(v), false);
  }

  protected render(): void {
    adoptStyles(pricingPageStyles);
    this.#readJson();

    // 저작 푸터 CTA 수거
    const footerNodes = Array.from(this.children).filter((c) => c.getAttribute("slot") === "footer");

    const head = document.createElement("div");
    head.className = "jd-pricing-page__head";

    this.#titleEl = document.createElement("h1");
    this.#titleEl.className = "jd-pricing-page__title";
    this.#descEl = document.createElement("p");
    this.#descEl.className = "jd-pricing-page__desc";

    this.#toggle = document.createElement("div");
    this.#toggle.className = "jd-pricing-page__toggle";
    this.#toggle.setAttribute("role", "group");
    this.#toggle.setAttribute("aria-label", "결제 주기");
    this.#monthlyBtn = this.#mkPeriodBtn("monthly");
    this.#yearlyBtn = this.#mkPeriodBtn("yearly");
    this.#yearlyLabelEl = document.createElement("span");
    this.#yearlyLabelEl.className = "jd-pricing-page__period-label";
    this.#saveEl = document.createElement("span");
    this.#saveEl.className = "jd-pricing-page__save";
    this.#yearlyBtn.append(this.#yearlyLabelEl, this.#saveEl);
    this.#toggle.append(this.#monthlyBtn, this.#yearlyBtn);

    head.append(this.#titleEl, this.#descEl, this.#toggle);

    this.#table = document.createElement("jd-pricing-table") as HTMLElement & {
      plans?: JdPricingPlan[];
    };
    this.#table.className = "jd-pricing-page__table";

    this.#faqSection = document.createElement("section");
    this.#faqSection.className = "jd-pricing-page__faq";
    const faqTitle = document.createElement("h2");
    faqTitle.className = "jd-pricing-page__faq-title";
    faqTitle.textContent = "자주 묻는 질문";
    this.#faqList = document.createElement("div");
    this.#faqList.className = "jd-pricing-page__faq-list";
    this.#faqSection.append(faqTitle, this.#faqList);

    this.#footer = document.createElement("section");
    this.#footer.className = "jd-pricing-page__footer";
    this.#footer.append(...footerNodes);

    this.append(head, this.#table, this.#faqSection, this.#footer);
    this.update();
  }

  #mkPeriodBtn(period: "monthly" | "yearly"): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "jd-pricing-page__period";
    b.setAttribute("data-period", period);
    b.addEventListener("click", () => this.#setYearly(period === "yearly", true));
    return b;
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const j = JSON.parse(script.textContent) as {
        monthlyPlans?: JdPricingPlan[];
        yearlyPlans?: JdPricingPlan[];
        faqs?: JdPricingFaq[];
        toggleLabels?: JdPricingToggleLabels;
      };
      if (Array.isArray(j.monthlyPlans) && this.#monthly.length === 0) this.#monthly = j.monthlyPlans;
      if (Array.isArray(j.yearlyPlans) && this.#yearlyPlans.length === 0)
        this.#yearlyPlans = j.yearlyPlans;
      if (Array.isArray(j.faqs) && this.#faqs.length === 0) this.#faqs = j.faqs;
      if (j.toggleLabels) this.#labels = { ...DEFAULT_LABELS, ...j.toggleLabels };
    } catch {
      console.warn("[junds] <jd-pricing-page> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #setYearly(next: boolean, notify: boolean): void {
    if (this.#yearly === next) return;
    this.#yearly = next;
    this.requestUpdate();
    if (notify) this.emit("jd-change", { yearly: next });
  }

  protected override update(): void {
    this.#titleEl.textContent = this.title;
    this.#titleEl.hidden = !this.title;
    this.#descEl.textContent = this.description;
    this.#descEl.hidden = !this.description;

    // 토글은 연간 플랜이 있을 때만
    const hasYearly = this.#yearlyPlans.length > 0;
    this.#toggle.hidden = !hasYearly;
    this.#monthlyBtn.textContent = this.#labels.monthly;
    this.#yearlyLabelEl.textContent = this.#labels.yearly;
    this.#saveEl.textContent = this.#labels.saveLabel;
    const yearly = this.#yearly && hasYearly;
    this.#monthlyBtn.toggleAttribute("data-active", !yearly);
    this.#monthlyBtn.setAttribute("aria-pressed", String(!yearly));
    this.#yearlyBtn.toggleAttribute("data-active", yearly);
    this.#yearlyBtn.setAttribute("aria-pressed", String(yearly));

    const plans = yearly ? this.#yearlyPlans : this.#monthly;
    const sig = `${yearly}|${JSON.stringify(plans)}`;
    if (sig !== this.#plansSig) {
      this.#plansSig = sig;
      this.#table.plans = plans;
    }

    this.#syncFaqs();
  }

  #syncFaqs(): void {
    this.#faqSection.hidden = this.#faqs.length === 0;
    const sig = JSON.stringify(this.#faqs);
    if (sig === this.#faqSig) return;
    this.#faqSig = sig;
    this.#faqList.textContent = "";
    for (const faq of this.#faqs) {
      const details = document.createElement("details");
      details.className = "jd-pricing-page__faq-item";
      const summary = document.createElement("summary");
      summary.className = "jd-pricing-page__faq-q";
      const q = document.createElement("span");
      q.textContent = faq.question;
      const caret = document.createElement("span");
      caret.className = "jd-pricing-page__faq-caret";
      caret.setAttribute("aria-hidden", "true");
      caret.textContent = "⌄";
      summary.append(q, caret);
      const answer = document.createElement("div");
      answer.className = "jd-pricing-page__faq-a";
      answer.textContent = faq.answer;
      details.append(summary, answer);
      this.#faqList.append(details);
    }
  }
}
