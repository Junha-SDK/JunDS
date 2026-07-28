/**
 * <jd-hero-section> — 마케팅/랜딩 hero (v2 patterns/HeroSection).
 * variant 4종: centered · split · imageBg · minimal.
 *
 * v2 대비:
 *  - CTA의 `onClick` 콜백은 href 없는 버튼일 때 `jd-primary` / `jd-secondary`
 *    이벤트로 승격(§1.5). href가 있으면 그냥 <a>다 — 네이티브 내비를 재발명하지 않는다.
 *  - eyebrow/title/subtitle은 attribute 텍스트가 기본, 리치 콘텐츠는 `slot="…"`
 *    자식으로 넣으면 텍스트를 덮는다. media/footer는 항상 슬롯.
 *  - `<h1>`은 항상 1개(랜딩 페이지의 문서 제목) — variant가 바뀌어도 헤딩 레벨 불변.
 *  - 레이아웃 4종은 전부 CSS(호스트 variant 셀렉터)가 처리, JS 분기 없음(§4.3).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import heroSectionStyles from "./hero-section.css.js";

/** 슬롯 대상 영역 이름 */
const SLOT_REGIONS = ["eyebrow", "title", "subtitle", "media", "footer"] as const;
type SlotRegion = (typeof SLOT_REGIONS)[number];

export class JdHeroSection extends JdElement {
  static override tag = "jd-hero-section";
  static override props = {
    variant: { type: String, default: "centered", reflect: true }, // centered|split|imageBg|minimal
    title: { type: String },
    subtitle: { type: String },
    eyebrow: { type: String },
    bgImage: { type: String }, // attr: bg-image (imageBg 전용)
    primaryLabel: { type: String }, // attr: primary-label
    primaryHref: { type: String }, // attr: primary-href
    secondaryLabel: { type: String },
    secondaryHref: { type: String },
  };

  declare variant: string;
  declare title: string;
  declare subtitle: string;
  declare eyebrow: string;
  declare bgImage: string;
  declare primaryLabel: string;
  declare primaryHref: string;
  declare secondaryLabel: string;
  declare secondaryHref: string;

  #inner!: HTMLElement;
  #content!: HTMLElement;
  #regions = new Map<SlotRegion, HTMLElement>();
  /** 저작이 slot="…"으로 넣은 리치 노드 — 있으면 attribute 텍스트를 덮는다 */
  #slotted = new Set<SlotRegion>();
  #actions!: HTMLElement;

  protected render(): void {
    adoptStyles(heroSectionStyles);

    // 저작 슬롯 자식을 골격 구축 전에 수거한다(골격이 childNodes를 옮기기 전에).
    const slots = new Map<SlotRegion, Element[]>();
    for (const child of Array.from(this.children)) {
      const name = child.getAttribute("slot");
      if (name && (SLOT_REGIONS as readonly string[]).includes(name)) {
        const region = name as SlotRegion;
        slots.set(region, [...(slots.get(region) ?? []), child]);
        this.#slotted.add(region);
      }
    }

    // 입양(§3.3): 기존 골격이 있으면 재사용
    const existing = this.querySelector<HTMLElement>(":scope > .jd-hero__inner");
    if (existing) {
      this.#inner = existing;
      this.#content = existing.querySelector(".jd-hero__content")!;
      for (const r of SLOT_REGIONS) {
        const el = existing.querySelector<HTMLElement>(`.jd-hero__${r}`);
        if (el) this.#regions.set(r, el);
      }
      this.#actions = existing.querySelector(".jd-hero__actions")!;
      this.update();
      return;
    }

    this.#inner = document.createElement("div");
    this.#inner.className = "jd-hero__inner";

    this.#content = document.createElement("div");
    this.#content.className = "jd-hero__content";

    const eyebrow = this.#mkRegion("eyebrow", "div");
    const title = this.#mkTitle();
    const subtitle = this.#mkRegion("subtitle", "p");

    this.#actions = document.createElement("div");
    this.#actions.className = "jd-hero__actions";

    const footer = this.#mkRegion("footer", "div");
    const media = this.#mkRegion("media", "div");

    this.#content.append(eyebrow, title, subtitle, this.#actions, footer);
    this.#inner.append(this.#content, media);
    this.append(this.#inner);

    // 수거한 슬롯 노드를 각 영역으로 이동
    for (const [region, nodes] of slots) {
      const target = this.#regions.get(region)!;
      target.textContent = "";
      target.append(...nodes);
    }

    this.update();
  }

  #mkRegion(region: SlotRegion, tag: "div" | "p"): HTMLElement {
    const el = document.createElement(tag);
    el.className = `jd-hero__${region}`;
    this.#regions.set(region, el);
    return el;
  }

  #mkTitle(): HTMLElement {
    const el = document.createElement("h1");
    el.className = "jd-hero__title";
    this.#regions.set("title", el);
    return el;
  }

  protected override update(): void {
    this.#syncText("eyebrow", this.eyebrow);
    this.#syncText("title", this.title);
    this.#syncText("subtitle", this.subtitle);

    // media 영역은 슬롯 콘텐츠 유무로만 노출(:empty CSS와 이중 안전망)
    const media = this.#regions.get("media");
    if (media) media.hidden = !this.#slotted.has("media");

    // 배경 이미지 — imageBg에서만 CSS가 그린다(다른 variant는 무시)
    if (this.bgImage) {
      // url() 문자열 탈출: 따옴표·역슬래시만 escape (CSS.escape는 식별자용이라 URL을 깬다)
      const safe = this.bgImage.replace(/["\\]/g, "\\$&");
      this.#inner.style.setProperty("--jd-hero-bg", `url("${safe}")`);
    } else {
      this.#inner.style.removeProperty("--jd-hero-bg");
    }

    this.#syncActions();
  }

  /** 슬롯 리치 노드가 있으면 그대로 두고, 없으면 attribute 텍스트를 채운다 */
  #syncText(region: SlotRegion, text: string): void {
    const el = this.#regions.get(region);
    if (!el) return;
    if (this.#slotted.has(region)) {
      el.hidden = false;
      return;
    }
    el.textContent = text;
    // title은 랜딩 문서 제목이라 비어도 헤딩을 유지하지 않는다 — 비면 숨긴다
    el.hidden = !text;
  }

  #syncActions(): void {
    const primary = this.#resolveCta("primary");
    const secondary = this.#resolveCta("secondary");
    this.#actions.textContent = "";
    this.#actions.hidden = !primary && !secondary;
    if (primary) this.#actions.append(this.#buildCta(primary, "primary"));
    if (secondary) this.#actions.append(this.#buildCta(secondary, "secondary"));
  }

  #resolveCta(kind: "primary" | "secondary"): { label: string; href: string } | null {
    const label = kind === "primary" ? this.primaryLabel : this.secondaryLabel;
    if (!label) return null;
    const href = kind === "primary" ? this.primaryHref : this.secondaryHref;
    return { label, href };
  }

  #buildCta(cta: { label: string; href: string }, kind: "primary" | "secondary"): HTMLElement {
    const el = document.createElement(cta.href ? "a" : "button");
    el.className = "jd-hero__cta";
    el.setAttribute("data-cta", kind);
    el.textContent = cta.label;
    if (el instanceof HTMLAnchorElement) {
      el.href = cta.href;
    } else {
      (el as HTMLButtonElement).type = "button";
      el.addEventListener("click", () =>
        this.emit(kind === "primary" ? "jd-primary" : "jd-secondary"),
      );
    }
    return el;
  }
}
