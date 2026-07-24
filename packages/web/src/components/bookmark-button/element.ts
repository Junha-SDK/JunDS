/**
 * <jd-bookmark-button> — 북마크 토글 (v2 primitives/BookmarkButton).
 * LikeButton과 같은 aria-pressed 토글 관용구, 표면 차는 아이콘·색(amber)·크기 프롭뿐.
 * v2 size는 px 수치라 --_jd-bookmark-size 변수로 받는다(토큰 스케일이 아니다).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import bookmarkButtonStyles from "./bookmark-button.css.js";

const BOOKMARK_PATH = "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z";

export class JdBookmarkButton extends JdElement {
  static override tag = "jd-bookmark-button";
  static override props = {
    bookmarked: { type: Boolean, reflect: true },
    /** 아이콘 px 크기 (v2 동형) */
    size: { type: Number, default: 18 },
    disabled: { type: Boolean, reflect: true },
  };

  declare bookmarked: boolean;
  declare size: number;
  declare disabled: boolean;

  #btn!: HTMLButtonElement;

  protected render(): void {
    adoptStyles(bookmarkButtonStyles);
    const existing = this.querySelector<HTMLButtonElement>(":scope > button.jd-bookmark-button");
    if (existing) {
      this.#btn = existing;
    } else {
      this.#btn = document.createElement("button");
      this.#btn.type = "button";
      this.#btn.className = "jd-bookmark-button";
      const ns = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(ns, "svg");
      svg.setAttribute("class", "jd-bookmark-button__icon");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("aria-hidden", "true");
      const path = document.createElementNS(ns, "path");
      path.setAttribute("d", BOOKMARK_PATH);
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

  #onClick = (): void => {
    if (this.disabled) return;
    this.bookmarked = !this.bookmarked;
    this.emit("jd-change", { bookmarked: this.bookmarked });
  };

  protected override update(): void {
    this.#btn.disabled = this.disabled;
    this.#btn.setAttribute("aria-pressed", String(this.bookmarked));
    this.#btn.setAttribute("aria-label", this.bookmarked ? "북마크 해제" : "북마크 추가");
    this.style.setProperty("--_jd-bookmark-size", `${this.size}px`);
  }

  override focus(options?: FocusOptions): void {
    this.#btn?.focus(options);
  }
}
