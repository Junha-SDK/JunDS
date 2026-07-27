/**
 * <jd-section> — 제목/설명 헤더 + 세로 흐름 본문 (v2 core/Section).
 * children은 __body로 이동(입양 §3.3). gap 프롭은 호스트가 아니라 본문 flex에
 * 적용되는 컴포넌트 고유 의미 — applyStyleProps에서 skip 후 직접 반영(v2 동형).
 * border는 Boolean 전환(스타일 프롭 border와 이름이 겹치나 v2 API도 boolean이 기본).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { STYLE_PROPS, applyStyleProps, resolveSpace } from "../../core/style-props.js";
import type { JdStyleProps } from "../../core/style-props.js";
import sectionStyles from "./section.css.js";

export class JdSection extends JdElement {
  static override tag = "jd-section";
  static override props = {
    ...STYLE_PROPS,
    title: { type: String },
    description: { type: String },
    headingLevel: { type: Number, default: 2, reflect: true },
    border: { type: Boolean, reflect: true }, // v2 boolean 표면 — CSS 훅
  };

  declare title: string;
  declare description: string;
  /** 섹션 제목의 시맨틱 레벨(1–6). 페이지 제목 다음 단계인 2가 기본값입니다. */
  declare headingLevel: number;
  declare border: boolean;

  #header!: HTMLDivElement;
  #title!: HTMLHeadingElement;
  #desc!: HTMLParagraphElement;
  #body!: HTMLDivElement;

  protected render(): void {
    adoptStyles(sectionStyles);
    const existing = this.querySelector<HTMLDivElement>(":scope > .jd-section__body");
    if (existing) {
      this.#header = this.querySelector(":scope > .jd-section__header")!;
      this.#title = this.#header.querySelector(".jd-section__title")!;
      this.#desc = this.#header.querySelector(".jd-section__desc")!;
      this.#body = existing;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    this.#header = document.createElement("div");
    this.#header.className = "jd-section__header";
    this.#title = document.createElement("h2");
    this.#title.className = "jd-section__title";
    this.#desc = document.createElement("p");
    this.#desc.className = "jd-section__desc";
    this.#header.append(this.#title, this.#desc);

    this.#body = document.createElement("div");
    this.#body.className = "jd-section__body";
    this.#body.append(...this.childNodes); // 사용자가 쓴 children → 본문
    this.append(this.#header, this.#body);
  }

  protected override update(): void {
    // border는 attr 셀렉터가, gap은 본문이 소비 — 호스트 스타일 프롭에서 제외
    applyStyleProps(this, { skip: ["border", "gap"] });

    this.#syncHeadingLevel();
    this.#title.textContent = this.title;
    this.#title.hidden = !this.title;
    this.#desc.textContent = this.description;
    this.#desc.hidden = !this.description;
    this.#header.hidden = !this.title && !this.description;

    const resolved = this.gap !== "" && this.gap != null ? resolveSpace(String(this.gap)) : null;
    if (resolved) this.#body.style.setProperty("gap", resolved);
    else this.#body.style.removeProperty("gap");
  }

  #syncHeadingLevel(): void {
    const level = Math.min(6, Math.max(1, Math.trunc(this.headingLevel || 2)));
    const tagName = `H${level}`;
    if (this.#title.tagName === tagName) return;

    const replacement = document.createElement(`h${level}`) as HTMLHeadingElement;
    replacement.className = this.#title.className;
    this.#title.replaceWith(replacement);
    this.#title = replacement;
  }
}

export interface JdSection extends Omit<JdStyleProps, "border"> {}
