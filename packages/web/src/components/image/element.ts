/**
 * <jd-image> — 로딩·실패 상태를 다루는 이미지 (v2 primitives/Image).
 *
 * - 호스트가 v2의 래퍼 div 역할(overflow·radius·aspect-ratio) — 노드 하나가 준다.
 * - placeholder/fallback은 light DOM 슬롯(DEC-014-4 규약): slot="placeholder" ·
 *   slot="fallback". ReactNode를 attribute로 실을 수 없기 때문.
 * - 캐시된 이미지는 리스너 부착 전에 load가 끝나 있을 수 있다 — connected()에서
 *   complete+naturalWidth로 **성공만** 보정한다(§3.1-3: render 단계가 아니라 connected).
 * - 이벤트는 canonical jd-load / jd-error(§1.5).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import imageStyles from "./image.css.js";

export class JdImage extends JdElement {
  static override tag = "jd-image";
  static override props = {
    src: { type: String },
    alt: { type: String },
    fit: { type: String, default: "cover", reflect: true }, // cover | contain | fill | none | scale-down
    radius: { type: String, default: "none", reflect: true }, // none | sm | md | lg | full
    /** CSS aspect-ratio 값 — "16/9" · "1" */
    ratio: { type: String },
    /** 네이티브 지연 로딩 */
    loading: { type: String },
    /** loading | loaded | error — 내부 상태, CSS 훅 */
    status: { type: String, default: "loading", reflect: true },
  };

  declare src: string;
  declare alt: string;
  declare fit: string;
  declare radius: string;
  declare ratio: string;
  declare loading: string;
  declare status: string;

  #img!: HTMLImageElement;

  protected render(): void {
    adoptStyles(imageStyles);
    const existing = this.querySelector<HTMLImageElement>(":scope > img.jd-image__img");
    if (existing) {
      this.#img = existing;
    } else {
      this.#img = document.createElement("img");
      this.#img.className = "jd-image__img";
      this.append(this.#img);
    }
    // src 없이 시작하면 v2와 동일하게 즉시 error(=fallback 표면)
    this.status = this.src ? "loading" : "error";
    this.update();
  }

  protected override connected(): void {
    this.#img.addEventListener("load", this.#onLoad);
    this.#img.addEventListener("error", this.#onError);
    // 캐시 히트로 리스너보다 먼저 끝난 **성공** 로드만 보정한다.
    // 실패는 여기서 추론하지 않는다: complete=true·naturalWidth=0은 "실패"뿐 아니라
    // "아직 아무것도 로드하지 않는 환경"에서도 참이라(happy-dom 실측) 오탐이 된다.
    // 실제 실패는 캐시된 것이라도 요소마다 error 이벤트가 다시 발화한다.
    if (this.#img.complete && this.#img.naturalWidth > 0) this.status = "loaded";
  }

  protected override disconnected(): void {
    this.#img?.removeEventListener("load", this.#onLoad);
    this.#img?.removeEventListener("error", this.#onError);
  }

  #onLoad = (): void => {
    this.status = "loaded";
    this.emit("jd-load", { src: this.src });
  };

  #onError = (): void => {
    this.status = "error";
    this.emit("jd-error", { src: this.src });
  };

  protected override update(): void {
    const img = this.#img;
    if (img.getAttribute("src") !== this.src) {
      if (this.src) {
        img.src = this.src;
        this.status = "loading"; // src 교체는 로딩 재시작
      } else {
        img.removeAttribute("src");
      }
    }
    img.alt = this.alt; // 장식 이미지는 빈 문자열이 정답 — 기본값이 ""
    if (this.loading) img.setAttribute("loading", this.loading);
    else img.removeAttribute("loading");

    if (this.ratio) this.style.setProperty("aspect-ratio", this.ratio);
    else this.style.removeProperty("aspect-ratio");

    // 실패 시 fallback이 대신 이름을 갖는다 — 이미지가 숨겨지므로 alt가 전달되지 않는다
    const fallback = this.querySelector<HTMLElement>(':scope > [slot="fallback"]');
    if (fallback) {
      fallback.setAttribute("role", "img");
      fallback.setAttribute("aria-label", this.alt);
    }
  }
}
