/**
 * <jd-cta-section> — 랜딩 하단 행동 유도 섹션 (v2 composites/CTASection).
 *
 * v2 프롭 표면 승계: variant 4종(default·gradient·subtle·split), title/description,
 * primaryCta/secondaryCta({label, href?}). onClick 콜백은 바닐라에서 이벤트로 승격 —
 * href 없는 버튼 클릭 시 jd-cta(detail {cta,label}) 발행(§1.5). href 있으면 <a> 네이티브.
 *
 * v2는 variant마다 DOM을 통째로 갈아끼웠다(split만 2단 그리드). v3는 골격 1개로 통일하고
 * 배치·정렬·미디어 노출은 호스트 속성 셀렉터가 CSS로 처리한다(§4.3) — variant 런타임
 * 변경에도 재구축이 없다. 미디어(split 전용)는 slot="media" light DOM.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import ctaSectionStyles from "./cta-section.css.js";

interface Cta {
  label: string;
  href?: string;
}

export class JdCtaSection extends JdElement {
  static override tag = "jd-cta-section";
  static override props = {
    variant: { type: String, default: "default", reflect: true }, // default | gradient | subtle | split
    title: { type: String },
    description: { type: String },
    /** 선언적(HTML) 편의 attribute — property(primaryCta)가 있으면 그쪽이 이긴다 */
    primaryLabel: { type: String }, // attr: primary-label
    primaryHref: { type: String }, // attr: primary-href
    secondaryLabel: { type: String },
    secondaryHref: { type: String },
  };

  declare variant: string;
  declare title: string;
  declare description: string;
  declare primaryLabel: string;
  declare primaryHref: string;
  declare secondaryLabel: string;
  declare secondaryHref: string;

  #titleEl!: HTMLHeadingElement;
  #descEl!: HTMLParagraphElement;
  #actions!: HTMLDivElement;
  #media!: HTMLDivElement;
  #primaryCta: Cta | null = null;
  #secondaryCta: Cta | null = null;
  /** 현재 그려진 버튼 시그니처 — 변경 시에만 재구축 */
  #sig = "";

  /** JS 데이터 경로 — onClick은 jd-cta 이벤트로 대체 */
  get primaryCta(): Cta | null {
    return this.#primaryCta;
  }
  set primaryCta(v: Cta | null) {
    this.#primaryCta = v && typeof v === "object" ? v : null;
    this.requestUpdate();
  }
  get secondaryCta(): Cta | null {
    return this.#secondaryCta;
  }
  set secondaryCta(v: Cta | null) {
    this.#secondaryCta = v && typeof v === "object" ? v : null;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(ctaSectionStyles);
    // 입양(§3.3)
    const inner = this.querySelector<HTMLElement>(":scope > .jd-cta-section__inner");
    if (inner) {
      this.#titleEl = inner.querySelector<HTMLHeadingElement>(".jd-cta-section__title")!;
      this.#descEl = inner.querySelector<HTMLParagraphElement>(".jd-cta-section__desc")!;
      this.#actions = inner.querySelector<HTMLDivElement>(".jd-cta-section__actions")!;
      this.#media = inner.querySelector<HTMLDivElement>(".jd-cta-section__media")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    const slottedMedia = this.querySelector(':scope > [slot="media"]');
    const inner = document.createElement("div");
    inner.className = "jd-cta-section__inner";
    const content = document.createElement("div");
    content.className = "jd-cta-section__content";
    this.#titleEl = document.createElement("h2");
    this.#titleEl.className = "jd-cta-section__title";
    this.#descEl = document.createElement("p");
    this.#descEl.className = "jd-cta-section__desc";
    this.#actions = document.createElement("div");
    this.#actions.className = "jd-cta-section__actions";
    content.append(this.#titleEl, this.#descEl, this.#actions);
    this.#media = document.createElement("div");
    this.#media.className = "jd-cta-section__media";
    if (slottedMedia) this.#media.append(slottedMedia);
    inner.append(content, this.#media);
    this.append(inner);
  }

  #effective(kind: "primary" | "secondary"): Cta | null {
    if (kind === "primary") {
      if (this.#primaryCta) return this.#primaryCta;
      return this.primaryLabel
        ? { label: this.primaryLabel, href: this.primaryHref || undefined }
        : null;
    }
    if (this.#secondaryCta) return this.#secondaryCta;
    return this.secondaryLabel
      ? { label: this.secondaryLabel, href: this.secondaryHref || undefined }
      : null;
  }

  protected override update(): void {
    this.#titleEl.textContent = this.title;
    this.#titleEl.hidden = !this.title;
    this.#descEl.textContent = this.description;
    this.#descEl.hidden = !this.description;
    this.#media.hidden = this.variant !== "split" || this.#media.childElementCount === 0;

    const primary = this.#effective("primary");
    const secondary = this.#effective("secondary");
    const sig = JSON.stringify([primary, secondary]);
    if (sig !== this.#sig) {
      this.#sig = sig;
      this.#actions.textContent = "";
      if (primary) this.#actions.append(this.#buildBtn(primary, "primary"));
      if (secondary) this.#actions.append(this.#buildBtn(secondary, "secondary"));
      this.#actions.hidden = !primary && !secondary;
    }
  }

  #buildBtn(cta: Cta, kind: "primary" | "secondary"): HTMLElement {
    const cls = `jd-cta-section__btn jd-cta-section__btn--${kind}`;
    if (cta.href) {
      const a = document.createElement("a");
      a.className = cls;
      a.href = cta.href;
      a.textContent = cta.label;
      return a;
    }
    const b = document.createElement("button");
    b.type = "button";
    b.className = cls;
    b.textContent = cta.label;
    b.addEventListener("click", () => this.emit("jd-cta", { cta: kind, label: cta.label }));
    return b;
  }
}
