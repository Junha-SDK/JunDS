/**
 * <jd-star-button> — 관심종목(워치리스트) 토글 별 버튼 (v2 finance/StarButton).
 *
 * v2는 `useWatchlist()`로 전역 localStorage 상태를 직접 읽고 썼다. v3는 그 데이터
 * 결합을 걷어내고(§6.3 finance: 컴포넌트는 상태를 property로 받고 fetch·storage를
 * 갖지 않는다) **제어형 토글**로 남긴다 — `active`를 받고, 클릭하면 뒤집어
 * `jd-change`로 알린다. 소비자가 그 이벤트를 받아 자기 워치리스트에 반영한다.
 *
 * like/bookmark/follow 토글과 같은 aria-pressed 관용구다(이 계열은 레포에서 공유
 * 베이스 없이 자립 컴포넌트로 유지되므로 파생하지 않는다 — bookmark-button 선례).
 * v2에는 없던 aria-pressed + 결정적 label로 접근성을 올렸다.
 *
 * SVG는 createElementNS로 만든다(§6-1 네임스페이스 함정): HTML 파서가 만든 <path>는
 * HTML NS라 화면에 그려지지 않는다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import starButtonStyles from "./star-button.css.js";

const SVG_NS = "http://www.w3.org/2000/svg";
/** lucide star (app-icon 세트와 동일 글리프) */
const STAR_PATH =
  "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756" +
  "a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14" +
  "a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01" +
  "a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795" +
  "a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z";

export class JdStarButton extends JdElement {
  static override tag = "jd-star-button";
  static override props = {
    /** 관심종목 등록 여부 — 제어형 상태 */
    active: { type: Boolean, reflect: true },
    /** 종목 식별자. jd-change detail·접근 이름 보강에 쓰인다 */
    name: { type: String },
    /** 아이콘 px 크기 (v2 동형, 기본 18) */
    size: { type: Number, default: 18 },
    disabled: { type: Boolean, reflect: true },
    /** 접근 이름 재정의 (미지정 시 상태 기반 기본값) */
    label: { type: String },
  };

  declare active: boolean;
  declare name: string;
  declare size: number;
  declare disabled: boolean;
  declare label: string;

  #btn!: HTMLButtonElement;

  protected render(): void {
    adoptStyles(starButtonStyles);
    const existing = this.querySelector<HTMLButtonElement>(":scope > button.jd-star-button");
    if (existing) {
      this.#btn = existing;
    } else {
      this.#btn = document.createElement("button");
      this.#btn.type = "button";
      this.#btn.className = "jd-star-button";
      const svg = document.createElementNS(SVG_NS, "svg");
      svg.setAttribute("class", "jd-star-button__icon");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("aria-hidden", "true");
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", STAR_PATH);
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      svg.append(path);
      this.#btn.append(svg);
      this.append(this.#btn);
    }
    this.update();
  }

  protected override connected(): void {
    this.#btn.addEventListener("click", this.#onClick);
  }

  protected override disconnected(): void {
    this.#btn?.removeEventListener("click", this.#onClick);
  }

  #onClick = (e: MouseEvent): void => {
    if (this.disabled) return;
    // v2: 카드/링크 안에 놓여도 별만 토글되도록 전파를 막는다
    e.preventDefault();
    e.stopPropagation();
    this.active = !this.active;
    this.emit("jd-change", { active: this.active, name: this.name });
  };

  protected override update(): void {
    this.#btn.disabled = this.disabled;
    this.#btn.setAttribute("aria-pressed", String(this.active));
    this.#btn.setAttribute("aria-label", this.#ariaLabel());
    this.style.setProperty("--_jd-star-size", `${this.size}px`);
  }

  #ariaLabel(): string {
    if (this.label) return this.label;
    const base = this.active ? "관심종목 제거" : "관심종목 추가";
    return this.name ? `${this.name} ${base}` : base;
  }

  override focus(options?: FocusOptions): void {
    this.#btn?.focus(options);
  }
}
