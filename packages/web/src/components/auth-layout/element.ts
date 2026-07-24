/**
 * <jd-auth-layout> — 인증 페이지 표준 레이아웃 (v2 patterns/AuthLayout, login/signup/reset 공용).
 *
 * light DOM 슬롯(app-shell 선례): slot="brand"(split/branded 좌측 브랜드),
 * slot="logo"(카드 상단 로고), slot="footer"(카드 하단), slot="page-footer"(페이지 하단).
 * 나머지 children = 카드 본문(폼).
 *
 * v2는 variant마다 다른 JSX 트리를 렌더했지만(centered/branded/split), CE는 **단일 골격 +
 * [variant] 속성 훅**으로 CSS가 레이아웃을 갈아끼운다 — 콘텐츠 이동이 없어 입양(§3.3)과
 * 프리렌더 스냅샷이 안정하고, 런타임 variant 변경도 재구축 없이 CSS만 전환된다.
 *
 * v2 대비 접근성 가산: 페이지 본문을 <main> 랜드마크로, 브랜드 패널을 <aside>로 명시한다
 * (v2는 전부 <div>였다).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import authLayoutStyles from "./auth-layout.css.js";

export type JdAuthVariant = "centered" | "split" | "branded";

export class JdAuthLayout extends JdElement {
  static override tag = "jd-auth-layout";
  static override props = {
    variant: { type: String, default: "centered", reflect: true }, // enum → reflect(§1.3)
    title: { type: String },
    subtitle: { type: String },
  };

  declare variant: string;
  declare title: string;
  declare subtitle: string;

  #header!: HTMLElement;
  #title!: HTMLHeadingElement;
  #subtitle!: HTMLParagraphElement;

  protected render(): void {
    adoptStyles(authLayoutStyles);
    const existing = this.querySelector<HTMLElement>(":scope > main.jd-auth-layout__main");
    if (existing) {
      this.#header = existing.querySelector(".jd-auth-layout__header")!;
      this.#title = this.#header.querySelector(".jd-auth-layout__title")!;
      this.#subtitle = this.#header.querySelector(".jd-auth-layout__subtitle")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    const pick = (name: string): Element[] =>
      Array.from(this.children).filter((n) => n.getAttribute("slot") === name);
    const brandNodes = pick("brand");
    const logoNodes = pick("logo");
    const footerNodes = pick("footer");
    const pageFooterNodes = pick("page-footer");
    const bodyNodes = Array.from(this.childNodes).filter(
      (n) =>
        !(
          n instanceof Element &&
          ["brand", "logo", "footer", "page-footer"].includes(n.getAttribute("slot") ?? "")
        ),
    );

    // 브랜드 패널 — split/branded에서만 CSS가 노출한다. 슬롯이 없으면 v2 기본 문구.
    const brand = document.createElement("aside");
    brand.className = "jd-auth-layout__brand";
    if (brandNodes.length) {
      brand.append(...brandNodes);
    } else {
      const inner = document.createElement("div");
      inner.className = "jd-auth-layout__brand-inner";
      const bt = document.createElement("div");
      bt.className = "jd-auth-layout__brand-title";
      bt.textContent = "Welcome";
      const bp = document.createElement("p");
      bp.className = "jd-auth-layout__brand-text";
      bp.textContent = "로그인하고 모든 기능을 사용해보세요.";
      inner.append(bt, bp);
      brand.append(inner);
    }

    const main = document.createElement("main");
    main.className = "jd-auth-layout__main";

    const wrap = document.createElement("div");
    wrap.className = "jd-auth-layout__wrap";

    const logo = document.createElement("div");
    logo.className = "jd-auth-layout__logo";
    if (logoNodes.length) logo.append(...logoNodes);
    else logo.hidden = true;

    const card = document.createElement("div");
    card.className = "jd-auth-layout__card";

    this.#header = document.createElement("div");
    this.#header.className = "jd-auth-layout__header";
    this.#title = document.createElement("h1");
    this.#title.className = "jd-auth-layout__title";
    this.#subtitle = document.createElement("p");
    this.#subtitle.className = "jd-auth-layout__subtitle";
    this.#header.append(this.#title, this.#subtitle);

    const body = document.createElement("div");
    body.className = "jd-auth-layout__body";
    body.append(...bodyNodes);

    card.append(this.#header, body);
    if (footerNodes.length) {
      const footer = document.createElement("div");
      footer.className = "jd-auth-layout__footer";
      footer.append(...footerNodes);
      card.append(footer);
    }

    wrap.append(logo, card);
    if (pageFooterNodes.length) {
      const pf = document.createElement("div");
      pf.className = "jd-auth-layout__page-footer";
      pf.append(...pageFooterNodes);
      wrap.append(pf);
    }

    main.append(wrap);
    this.append(brand, main);
  }

  protected override update(): void {
    this.#title.textContent = this.title;
    this.#title.hidden = !this.title;
    this.#subtitle.textContent = this.subtitle;
    this.#subtitle.hidden = !this.subtitle;
    this.#header.hidden = !this.title && !this.subtitle;
  }
}
