/**
 * <jd-back-top> — 스크롤 후 나타나는 상단 이동 버튼 (v2 primitives/BackTop).
 *
 * - 프리렌더 결정성(§3.1-3): render()에서 window.scrollY를 읽지 않는다. 최초 골격은
 *   항상 "숨김"이고, 첫 측정은 connected() — junds.page.tsx의 useLayoutEffect 패턴과
 *   같은 규율. 초기 HTML이 실행 시점에 따라 달라지면 SSG 스냅샷이 흔들린다.
 * - v2는 invisible일 때 null을 반환(노드 제거)했지만 CE는 노드를 유지하고
 *   visible attribute로 표시만 바꾼다 — 호스트가 사라지면 재부착이 불가능하다.
 * - 스크롤 리스너는 passive(§05-perf) — 메인 스레드 스크롤 차단 금지.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import backTopStyles from "./back-top.css.js";

const ARROW_SVG =
  `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">` +
  `<path d="M10 16V4M10 4l-5 5M10 4l5 5" stroke="currentColor" stroke-width="1.5" ` +
  `stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export class JdBackTop extends JdElement {
  static override tag = "jd-back-top";
  static override props = {
    threshold: { type: Number, default: 400 },
    label: { type: String, default: "상단으로 이동" },
    /** 노출 상태 — 스크롤 측정 결과 */
    visible: { type: Boolean, reflect: true },
  };

  declare threshold: number;
  declare label: string;
  declare visible: boolean;

  #btn!: HTMLButtonElement;

  protected render(): void {
    adoptStyles(backTopStyles);
    const existing = this.querySelector<HTMLButtonElement>(":scope > button.jd-back-top__button");
    if (existing) {
      this.#btn = existing;
    } else {
      const custom = Array.from(this.children); // children이 있으면 아이콘 대체
      this.#btn = document.createElement("button");
      this.#btn.type = "button";
      this.#btn.className = "jd-back-top__button";
      if (custom.length > 0) this.#btn.append(...custom);
      else this.#btn.innerHTML = ARROW_SVG;
      this.append(this.#btn);
    }
    this.update();
  }

  protected override connected(): void {
    this.#btn.addEventListener("click", this.#onClick);
    window.addEventListener("scroll", this.#onScroll, { passive: true });
    this.#onScroll(); // 첫 측정은 여기 — render()가 아니다
  }

  protected override disconnected(): void {
    this.#btn?.removeEventListener("click", this.#onClick);
    window.removeEventListener("scroll", this.#onScroll);
  }

  #onScroll = (): void => {
    this.visible = window.scrollY > this.threshold;
  };

  #onClick = (): void => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    this.emit("jd-select", { top: 0 });
  };

  protected override update(): void {
    this.#btn.setAttribute("aria-label", this.label);
  }

  override focus(options?: FocusOptions): void {
    this.#btn?.focus(options);
  }
}
