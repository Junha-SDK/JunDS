/**
 * <jd-loading-overlay> — 로딩 중 자식 영역을 덮는 오버레이 (v2 composites/LoadingOverlay).
 *
 * v2는 `active`일 때만 덮개를 렌더하고 children은 래퍼 div 직속에 두었다. v3는
 * **노드를 유지하고 표시만 attribute로 전환**한다(jd-back-top 선례) — 덮개가 생겼다
 * 사라지길 반복하면 role=status live region이 매번 새로 만들어져 낭독이 어긋난다.
 *
 * v2 대비 접근성 보강 2건:
 *  1. **호스트 aria-busy** — 덮개의 role=status만으로는 "이 영역이 지금 갱신 중"이
 *     AT에 전달되지 않는다. 표준 신호를 호스트에 얹는다.
 *  2. **본문 inert** — v2의 덮개는 포인터만 막았고 **키보드는 그대로 통과**했다
 *     (Tab으로 로딩 중인 폼의 버튼에 도달·제출 가능). 본문 래퍼에 inert를 걸어
 *     포커스·포인터를 함께 차단한다. 래퍼는 display:contents라 레이아웃은 v2와 동일.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import loadingOverlayStyles from "./loading-overlay.css.js";

/** jd-button·jd-spinner와 동일 SVG (같은 스피너를 세 번 그리지 않는다) */
const SPINNER_SVG =
  `<svg class="jd-loading-overlay__spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">` +
  `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity=".25"/>` +
  `<path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity=".75"/></svg>`;

export class JdLoadingOverlay extends JdElement {
  static override tag = "jd-loading-overlay";
  static override props = {
    active: { type: Boolean, reflect: true },
    label: { type: String, default: "로딩 중..." },
    /**
     * 프로퍼티명 blurred / attribute blur — `blur`는 HTMLElement.blur() 메서드와
     * 충돌한다(jd-overlay 선례 동형).
     */
    blurred: { type: Boolean, reflect: true, attribute: "blur" },
  };

  declare active: boolean;
  declare label: string;
  declare blurred: boolean;

  #content!: HTMLElement;
  #veil!: HTMLElement;
  #label!: HTMLElement;

  protected render(): void {
    adoptStyles(loadingOverlayStyles);
    // 입양 규칙(§3.3): SSR/어댑터가 그린 골격이 있으면 재사용
    const content = this.querySelector<HTMLElement>(":scope > .jd-loading-overlay__content");
    const veil = this.querySelector<HTMLElement>(":scope > .jd-loading-overlay__veil");
    if (content && veil) {
      this.#content = content;
      this.#veil = veil;
    } else {
      this.#content = document.createElement("div");
      this.#content.className = "jd-loading-overlay__content";
      this.#content.append(...this.childNodes); // children을 본문 래퍼로 이동
      this.#veil = document.createElement("div");
      this.#veil.className = "jd-loading-overlay__veil";
      this.#veil.innerHTML = SPINNER_SVG;
      this.append(this.#content, this.#veil);
    }
    this.#veil.setAttribute("role", "status");
    this.#label =
      this.#veil.querySelector<HTMLElement>(".jd-loading-overlay__label") ?? this.#buildLabel();
    this.update();
  }

  #buildLabel(): HTMLElement {
    const p = document.createElement("p");
    p.className = "jd-loading-overlay__label";
    this.#veil.append(p);
    return p;
  }

  protected override update(): void {
    // aria-busy는 true/false 문자열이 정본 — 빈 값(toggleAttribute)은 false로 해석된다
    this.setAttribute("aria-busy", this.active ? "true" : "false");
    this.#content.toggleAttribute("inert", this.active);
    this.#label.textContent = this.label;
    this.#label.hidden = !this.label;
    // 라벨이 비어도 status 리전은 이름을 가져야 한다(v2 aria-label={label} 승계)
    this.#veil.setAttribute("aria-label", this.label || "로딩 중");
  }
}
