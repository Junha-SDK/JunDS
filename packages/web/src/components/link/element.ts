/**
 * <jd-link> — 앵커 프리미티브 (v2 primitives/Link).
 *
 * - 내부 <a>에 위임: 미들클릭·컨텍스트 메뉴·드래그·상태바 URL 미리보기·라우터 가로채기가
 *   전부 네이티브. 호스트에 role/tabindex를 얹는 방식은 그 전부를 잃는다(§1.6-1).
 * - 외부 링크 판정은 3상태다(v2 `external ?? 자동판정`). Boolean attribute는 부재를
 *   "거짓"으로만 읽으므로 반전 플래그 한 쌍으로 표현한다(DEC-029-5 관용구):
 *   둘 다 없으면 href 자동 판정 · `external` 강제 참 · `internal` 강제 거짓.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import linkStyles from "./link.css.js";

const EXTERNAL_SVG =
  `<svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">` +
  `<path d="M3 3h6v6M9 3L3 9" stroke="currentColor" stroke-width="1.5" ` +
  `stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export class JdLink extends JdElement {
  static override tag = "jd-link";
  static override props = {
    href: { type: String },
    variant: { type: String, default: "default", reflect: true }, // default | subtle | muted | danger
    underline: { type: String, default: "hover", reflect: true }, // always | hover | none
    /** 강제 외부 링크 */
    external: { type: Boolean, reflect: true },
    /** 강제 내부 링크 — 자동 판정 무력화 */
    internal: { type: Boolean, reflect: true },
    target: { type: String },
    rel: { type: String },
    download: { type: String },
  };

  declare href: string;
  declare variant: string;
  declare underline: string;
  declare external: boolean;
  declare internal: boolean;
  declare target: string;
  declare rel: string;
  declare download: string;

  #a!: HTMLAnchorElement;
  #icon: HTMLSpanElement | null = null;

  /** 실효 외부 여부 */
  get isExternal(): boolean {
    if (this.internal) return false;
    if (this.external) return true;
    return /^https?:\/\//.test(this.href);
  }

  protected render(): void {
    adoptStyles(linkStyles);
    const existing = this.querySelector<HTMLAnchorElement>(":scope > a.jd-link");
    if (existing) {
      this.#a = existing;
      this.#icon = existing.querySelector(".jd-link__external");
    } else {
      this.#a = document.createElement("a");
      this.#a.className = "jd-link";
      this.#a.append(...Array.from(this.childNodes));
      this.append(this.#a);
    }
    this.update();
  }

  protected override update(): void {
    const a = this.#a;
    if (this.href) a.href = this.href;
    else a.removeAttribute("href"); // href 없는 <a>는 비활성 — 탭 순서에서도 빠진다

    const ext = this.isExternal;
    // 명시 지정이 자동값을 이긴다
    const target = this.target || (ext ? "_blank" : "");
    const rel = this.rel || (ext ? "noopener noreferrer" : "");
    if (target) a.target = target;
    else a.removeAttribute("target");
    if (rel) a.rel = rel;
    else a.removeAttribute("rel");
    if (this.download) a.setAttribute("download", this.download);
    else a.removeAttribute("download");

    if (ext && !this.#icon) {
      this.#icon = document.createElement("span");
      this.#icon.className = "jd-link__external";
      this.#icon.innerHTML = EXTERNAL_SVG;
      a.append(this.#icon);
    } else if (!ext && this.#icon) {
      this.#icon.remove();
      this.#icon = null;
    }
  }

  override focus(options?: FocusOptions): void {
    this.#a?.focus(options);
  }
}
