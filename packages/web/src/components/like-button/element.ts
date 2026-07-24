/**
 * <jd-like-button> — 좋아요 토글 (v2 primitives/LikeButton).
 *
 * - 내부 <button aria-pressed> — 토글 버튼의 표준 표기다(role=switch가 아니다:
 *   좋아요는 "눌린 버튼"이지 켜짐/꺼짐 설정이 아니다. v2 aria-pressed 승계).
 * - v2는 제어형(liked + onChange)이었지만 CE 기본은 비제어다 — 클릭이 곧 토글이고
 *   jd-change로 알린다. 서버 반영 실패 시 소비자가 `liked`를 되돌리면 된다.
 * - count는 attribute 존재로 표시 여부를 판정한다(count=0도 표시 — B4 Badge 규약 동형).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import likeButtonStyles from "./like-button.css.js";

const HEART_PATH =
  "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z";

export class JdLikeButton extends JdElement {
  static override tag = "jd-like-button";
  static override props = {
    liked: { type: Boolean, reflect: true },
    /** 미지정(NaN)이면 숫자를 표시하지 않는다 */
    count: { type: Number, default: NaN },
    size: { type: String, default: "md", reflect: true }, // sm | md | lg
    disabled: { type: Boolean, reflect: true },
  };

  declare liked: boolean;
  declare count: number;
  declare size: string;
  declare disabled: boolean;

  #btn!: HTMLButtonElement;
  #count!: HTMLSpanElement;

  protected render(): void {
    adoptStyles(likeButtonStyles);
    const existing = this.querySelector<HTMLButtonElement>(":scope > button.jd-like-button");
    if (existing) {
      this.#btn = existing;
      this.#count = existing.querySelector(".jd-like-button__count")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    this.#btn = document.createElement("button");
    this.#btn.type = "button";
    this.#btn.className = "jd-like-button";
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "jd-like-button__icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", HEART_PATH);
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.append(path);
    this.#count = document.createElement("span");
    this.#count.className = "jd-like-button__count";
    this.#btn.append(svg, this.#count);
    this.append(this.#btn);
  }

  protected override connected(): void {
    this.#btn.addEventListener("click", this.#onClick);
  }

  protected override disconnected(): void {
    this.#btn?.removeEventListener("click", this.#onClick);
  }

  #onClick = (): void => {
    if (this.disabled) return;
    this.liked = !this.liked;
    if (!Number.isNaN(this.count)) this.count += this.liked ? 1 : -1;
    this.emit("jd-change", { liked: this.liked, count: this.count });
  };

  protected override update(): void {
    this.#btn.disabled = this.disabled;
    this.#btn.setAttribute("aria-pressed", String(this.liked));
    this.#btn.setAttribute("aria-label", this.liked ? "좋아요 취소" : "좋아요");
    const has = !Number.isNaN(this.count);
    this.#count.textContent = has ? this.count.toLocaleString() : "";
    this.#count.hidden = !has;
  }

  override focus(options?: FocusOptions): void {
    this.#btn?.focus(options);
  }
}
