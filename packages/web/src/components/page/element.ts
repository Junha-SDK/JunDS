/**
 * <jd-page> / <jd-page-header> / <jd-page-body> — 페이지 셸 컴파운드 (v2 core/Page).
 * ledger 1행(Page)에 속하는 3태그 — Modal의 단일 행 다태그 전례와 동형.
 *
 * - jd-page: 중앙 정렬 + max-width 프리셋 + 반응형 기본 패딩(base 16px → md 24px).
 *   v2의 p={base:4,md:6} 기본은 정적 @media로 — 실측상 v2는 인라인 base에 눌려
 *   16px 고정이었으나 의도 스펙대로 정상화(DECISIONS B1).
 * - jd-page-header: title/description attribute + light DOM 슬롯 마커 —
 *   slot="breadcrumb" children은 브레드크럼 행, 나머지 children은 actions 영역
 *   (shadow 없는 슬롯 규약 — DECISIONS B1).
 * - jd-page-body: 세로 flex 흐름(gap base 16px → md 24px).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { STYLE_PROPS } from "../../core/style-props.js";
import type { JdStyleProps } from "../../core/style-props.js";
import { JdBox } from "../box/element.js";
import pageStyles from "./page.css.js";

export class JdPage extends JdBox {
  static override tag = "jd-page";
  static override styles = pageStyles;
  static override props = {
    ...STYLE_PROPS,
    maxWidth: { type: String, default: "xl", reflect: true }, // attr: max-width — CSS 훅
  };

  declare maxWidth: string;
}

export class JdPageHeader extends JdElement {
  static override tag = "jd-page-header";
  static override props = {
    title: { type: String },
    description: { type: String },
  };

  declare title: string;
  declare description: string;

  #title!: HTMLHeadingElement;
  #desc!: HTMLParagraphElement;
  #actions!: HTMLDivElement;

  protected render(): void {
    adoptStyles(pageStyles);
    const existing = this.querySelector<HTMLDivElement>(":scope > .jd-page-header__row");
    if (existing) {
      this.#title = existing.querySelector(".jd-page-header__title")!;
      this.#desc = existing.querySelector(".jd-page-header__desc")!;
      this.#actions = existing.querySelector(".jd-page-header__actions")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    // light DOM 슬롯 분류: [slot=breadcrumb] → 브레드크럼 행, 나머지 → actions
    const crumbs: Node[] = [];
    const rest: Node[] = [];
    for (const node of [...this.childNodes]) {
      if (node instanceof Element && node.getAttribute("slot") === "breadcrumb") crumbs.push(node);
      else rest.push(node);
    }

    if (crumbs.length) {
      const crumbRow = document.createElement("div");
      crumbRow.className = "jd-page-header__breadcrumb";
      crumbRow.append(...crumbs);
      this.append(crumbRow);
    }

    const row = document.createElement("div");
    row.className = "jd-page-header__row";
    const text = document.createElement("div");
    text.className = "jd-page-header__text";
    this.#title = document.createElement("h1");
    this.#title.className = "jd-page-header__title";
    this.#desc = document.createElement("p");
    this.#desc.className = "jd-page-header__desc";
    text.append(this.#title, this.#desc);
    this.#actions = document.createElement("div");
    this.#actions.className = "jd-page-header__actions";
    this.#actions.append(...rest);
    row.append(text, this.#actions);
    this.append(row);
  }

  protected override update(): void {
    this.#title.textContent = this.title;
    this.#desc.textContent = this.description;
    this.#desc.hidden = !this.description;
    this.#actions.hidden = this.#actions.childNodes.length === 0;
  }
}

export class JdPageBody extends JdBox {
  static override tag = "jd-page-body";
  static override styles = pageStyles;
}

export interface JdPage extends JdStyleProps {}
export interface JdPageBody extends JdStyleProps {}
