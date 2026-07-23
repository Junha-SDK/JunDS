/**
 * <jd-text> — 본문 텍스트 (v2 core/Text).
 * 시맨틱을 위해 내부에 실제 요소(<p> 기본, as로 span/label/strong/em/small/div)를
 * 렌더하고 children을 이동한다. dimmed는 color 프롭보다 우선(v2 조건 분기 동형) —
 * overrides로 인라인 반영. lineClamp는 내부 요소에 -webkit-box 3종 세트.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { STYLE_PROPS, applyStyleProps } from "../../core/style-props.js";
import type { JdStyleProps } from "../../core/style-props.js";
import textStyles from "./text.css.js";

const AS_TAGS = new Set(["p", "span", "div", "label", "strong", "em", "small"]);

export class JdText extends JdElement {
  static override tag = "jd-text";
  static override props = {
    ...STYLE_PROPS,
    as: { type: String, default: "p", reflect: true }, // display 분기 attr 훅
    truncate: { type: Boolean, reflect: true },
    lineClamp: { type: Number }, // attr: line-clamp — 0이면 없음
    mono: { type: Boolean, reflect: true },
    dimmed: { type: Boolean, reflect: true },
  };

  declare as: string;
  declare truncate: boolean;
  declare lineClamp: number;
  declare mono: boolean;
  declare dimmed: boolean;

  #inner!: HTMLElement;

  protected render(): void {
    adoptStyles(textStyles);
    const existing = this.querySelector<HTMLElement>(":scope > .jd-text");
    this.#inner = existing ?? this.#build();
    this.update();
  }

  #tagFor(): string {
    return AS_TAGS.has(this.as) ? this.as : "p";
  }

  #build(): HTMLElement {
    const el = document.createElement(this.#tagFor());
    el.className = "jd-text";
    el.append(...this.childNodes);
    this.append(el);
    return el;
  }

  protected override update(): void {
    const tag = this.#tagFor().toUpperCase();
    if (this.#inner.tagName !== tag) {
      const next = document.createElement(tag.toLowerCase());
      next.className = this.#inner.className;
      next.append(...this.#inner.childNodes);
      this.#inner.replaceWith(next);
      this.#inner = next;
    }

    // dimmed가 color 프롭을 이긴다 (v2: color = dimmed ? "muted" : props.color)
    applyStyleProps(this, this.dimmed ? { overrides: { color: "muted" } } : undefined);

    const clamp = this.lineClamp;
    const st = this.#inner.style;
    if (clamp > 0) {
      st.display = "-webkit-box";
      st.setProperty("-webkit-line-clamp", String(clamp));
      st.setProperty("-webkit-box-orient", "vertical");
      st.overflow = "hidden";
    } else if (st.getPropertyValue("-webkit-line-clamp")) {
      st.removeProperty("display");
      st.removeProperty("-webkit-line-clamp");
      st.removeProperty("-webkit-box-orient");
      st.removeProperty("overflow");
    }
  }
}

export interface JdText extends JdStyleProps {}
