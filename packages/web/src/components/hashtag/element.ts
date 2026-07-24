/**
 * <jd-hashtag> — `#tag` 링크 칩 (v2 primitives/Hashtag).
 * count는 축약 표기(1.2k · 3.4M) — v2 formatCount 이식. 미지정(NaN)이면 숨긴다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import hashtagStyles from "./hashtag.css.js";

/** v2 formatCount 그대로 — 1,000 미만은 원문, 이상은 k/M 한 자리 */
function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export class JdHashtag extends JdElement {
  static override tag = "jd-hashtag";
  static override props = {
    /** # 없는 태그 */
    tag: { type: String },
    href: { type: String },
    trending: { type: Boolean, reflect: true },
    /** 미지정(NaN)이면 게시물 수를 표시하지 않는다 */
    count: { type: Number, default: NaN },
    trendingLabel: { type: String, default: "인기 태그" },
  };

  declare tag: string;
  declare href: string;
  declare trending: boolean;
  declare count: number;
  declare trendingLabel: string;

  #a!: HTMLAnchorElement;
  #text!: HTMLSpanElement;
  #fire!: HTMLSpanElement;
  #count!: HTMLSpanElement;

  protected render(): void {
    adoptStyles(hashtagStyles);
    const existing = this.querySelector<HTMLAnchorElement>(":scope > a.jd-hashtag");
    if (existing) {
      this.#a = existing;
      this.#text = existing.querySelector(".jd-hashtag__text")!;
      this.#fire = existing.querySelector(".jd-hashtag__trending")!;
      this.#count = existing.querySelector(".jd-hashtag__count")!;
    } else {
      this.#a = document.createElement("a");
      this.#a.className = "jd-hashtag";
      this.#text = document.createElement("span");
      this.#text.className = "jd-hashtag__text";
      this.#fire = document.createElement("span");
      this.#fire.className = "jd-hashtag__trending";
      this.#fire.textContent = "\u{1F525}";
      this.#count = document.createElement("span");
      this.#count.className = "jd-hashtag__count";
      this.#a.append(this.#text, this.#fire, this.#count);
      this.append(this.#a);
    }
    this.update();
  }

  protected override update(): void {
    if (this.href) this.#a.href = this.href;
    else this.#a.removeAttribute("href");
    this.#text.textContent = `#${this.tag}`;
    this.#fire.hidden = !this.trending;
    this.#fire.setAttribute("aria-label", this.trendingLabel);
    const has = !Number.isNaN(this.count);
    this.#count.textContent = has ? `(${formatCount(this.count)})` : "";
    this.#count.hidden = !has;
  }

  override focus(options?: FocusOptions): void {
    this.#a?.focus(options);
  }
}
