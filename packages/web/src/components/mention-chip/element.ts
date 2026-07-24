/**
 * <jd-mention-chip> — `@handle` 정적 링크 칩 (v2 primitives/MentionChip).
 * composites/Mention(에디터 입력)과 다른 표시 전용 표면이다.
 * v2 인증 마크는 텍스트 "✓" + aria-label — 그대로 승계하되 라벨은 프롭으로 연다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import mentionChipStyles from "./mention-chip.css.js";

export class JdMentionChip extends JdElement {
  static override tag = "jd-mention-chip";
  static override props = {
    /** @ 없는 핸들 */
    handle: { type: String },
    /** 표시 라벨. 미지정이면 @handle */
    label: { type: String },
    href: { type: String },
    verified: { type: Boolean, reflect: true },
    verifiedLabel: { type: String, default: "인증됨" },
  };

  declare handle: string;
  declare label: string;
  declare href: string;
  declare verified: boolean;
  declare verifiedLabel: string;

  #a!: HTMLAnchorElement;
  #text!: HTMLSpanElement;
  #mark!: HTMLSpanElement;

  protected render(): void {
    adoptStyles(mentionChipStyles);
    const existing = this.querySelector<HTMLAnchorElement>(":scope > a.jd-mention-chip");
    if (existing) {
      this.#a = existing;
      this.#text = existing.querySelector(".jd-mention-chip__text")!;
      this.#mark = existing.querySelector(".jd-mention-chip__verified")!;
    } else {
      this.#a = document.createElement("a");
      this.#a.className = "jd-mention-chip";
      this.#text = document.createElement("span");
      this.#text.className = "jd-mention-chip__text";
      this.#mark = document.createElement("span");
      this.#mark.className = "jd-mention-chip__verified";
      this.#mark.textContent = "✓";
      this.#a.append(this.#text, this.#mark);
      this.append(this.#a);
    }
    this.update();
  }

  protected override update(): void {
    if (this.href) this.#a.href = this.href;
    else this.#a.removeAttribute("href");
    this.#text.textContent = this.label || `@${this.handle}`;
    this.#mark.hidden = !this.verified;
    this.#mark.setAttribute("aria-label", this.verifiedLabel);
  }

  override focus(options?: FocusOptions): void {
    this.#a?.focus(options);
  }
}
