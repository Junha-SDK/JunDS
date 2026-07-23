/**
 * <jd-heading> — 레벨 기반 제목 (v2 core/Heading).
 * 문서 아웃라인 시맨틱을 위해 내부에 실제 <h1>~<h6>을 렌더하고 children을 이동한다
 * (입양 규칙 §3.3). 타이포 기본값은 호스트 CSS(레벨 attr 셀렉터)가 담당하고 내부
 * h 태그는 상속 리셋만 — 스타일 프롭 인라인이 항상 이긴다.
 * level 변경 시 내부 태그를 교체한다(children·참조 보존).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { STYLE_PROPS, applyStyleProps } from "../../core/style-props.js";
import type { JdStyleProps } from "../../core/style-props.js";
import headingStyles from "./heading.css.js";

export class JdHeading extends JdElement {
  static override tag = "jd-heading";
  static override props = {
    ...STYLE_PROPS,
    level: { type: Number, default: 2, reflect: true }, // 레벨별 타이포는 attr 셀렉터 훅
    truncate: { type: Boolean, reflect: true },
  };

  declare level: number;
  declare truncate: boolean;

  #h!: HTMLHeadingElement;

  protected render(): void {
    adoptStyles(headingStyles);
    const existing = this.querySelector<HTMLHeadingElement>(":scope > .jd-heading");
    this.#h = existing ?? this.#build();
    this.update();
  }

  #build(): HTMLHeadingElement {
    const h = document.createElement(this.#tagFor(this.level)) as HTMLHeadingElement;
    h.className = "jd-heading";
    h.append(...this.childNodes);
    this.append(h);
    return h;
  }

  #tagFor(level: number): string {
    const n = Math.min(6, Math.max(1, Math.trunc(level) || 2));
    return `h${n}`;
  }

  protected override update(): void {
    const tag = this.#tagFor(this.level).toUpperCase();
    if (this.#h.tagName !== tag) {
      // 레벨 교체 — children 이동, 참조 갱신 (아웃라인 시맨틱 유지)
      const next = document.createElement(tag.toLowerCase()) as HTMLHeadingElement;
      next.className = this.#h.className;
      next.append(...this.#h.childNodes);
      this.#h.replaceWith(next);
      this.#h = next;
    }
    applyStyleProps(this);
  }
}

export interface JdHeading extends JdStyleProps {}
