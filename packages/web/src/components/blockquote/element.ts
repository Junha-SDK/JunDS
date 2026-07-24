/**
 * <jd-blockquote> — 인용문 블록 (v2 composites/Blockquote).
 *
 * 본문은 무슬롯 children, 출처는 `cite` 프로퍼티(텍스트) 또는 `slot="cite"` children
 * (v2 `cite: ReactNode` 자리 — 링크·아이콘을 넣으려면 슬롯을 쓴다).
 *
 * v2 대비 교정 3건:
 *  1. **출처가 맨 텍스트였다.** `<footer>` 안에 그냥 문자열이라 인용 출처라는 의미가
 *     없었다. v3는 `<footer><cite>` — HTML이 정해 둔 자리다.
 *  2. **`cite` 프롭이 HTML `cite` 속성과 충돌했다.** v2는 `<blockquote {...props}>`로
 *     퍼뜨렸는데, HTML의 `cite`는 **출처 URL** 전용이라 "— 아인슈타인" 같은 텍스트가
 *     들어가면 잘못된 값이 실렸다. v3는 표시 텍스트(`cite`)와 출처 URL(`citeUrl`)을
 *     분리하고, URL만 내부 `<blockquote cite>`에 싣는다.
 *  3. **본문 이탤릭이 인용 전체를 덮었다.** v2는 출처에 not-italic을 덧발라 되돌렸다 —
 *     v3는 본문 노드에만 이탤릭을 준다(`<cite>`의 UA 이탤릭도 명시적으로 해제).
 *
 * variant 4종(default·bordered·filled·callout) 분기는 호스트 속성 셀렉터(§4.3).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import blockquoteStyles from "./blockquote.css.js";

export class JdBlockquote extends JdElement {
  static override tag = "jd-blockquote";
  static override props = {
    /** default | bordered | filled | callout */
    variant: { type: String, default: "default", reflect: true },
    /** 출처 표시 텍스트 (예: "— 알베르트 아인슈타인") */
    cite: { type: String },
    /** 출처 URL — 내부 `<blockquote cite>`에 실린다 (attr: cite-url) */
    citeUrl: { type: String },
  };

  declare variant: string;
  declare cite: string;
  declare citeUrl: string;

  #quote!: HTMLQuoteElement;
  #footer!: HTMLElement;
  #cite!: HTMLElement;
  /** slot="cite" children이 있으면 텍스트 프롭이 그것을 덮어쓰지 않는다 */
  #slottedCite = false;

  protected render(): void {
    adoptStyles(blockquoteStyles);
    // 입양(§3.3)
    const found = this.querySelector<HTMLQuoteElement>(":scope > blockquote.jd-blockquote");
    if (found) {
      this.#quote = found;
      this.#footer = found.querySelector(".jd-blockquote__footer")!;
      this.#cite = found.querySelector(".jd-blockquote__cite")!;
      this.#slottedCite = this.#cite.childElementCount > 0;
      this.update();
      return;
    }

    const slotted = this.querySelector(':scope > [slot="cite"]');
    const rest = Array.from(this.childNodes).filter((n) => n !== slotted);

    const body = document.createElement("div");
    body.className = "jd-blockquote__body";
    body.append(...rest);

    this.#cite = document.createElement("cite");
    this.#cite.className = "jd-blockquote__cite";
    if (slotted) {
      this.#cite.append(slotted);
      this.#slottedCite = true;
    }
    this.#footer = document.createElement("footer");
    this.#footer.className = "jd-blockquote__footer";
    this.#footer.append(this.#cite);

    this.#quote = document.createElement("blockquote");
    this.#quote.className = "jd-blockquote";
    this.#quote.append(body, this.#footer);
    this.append(this.#quote);
    this.update();
  }

  protected override update(): void {
    if (!this.#slottedCite) this.#cite.textContent = this.cite;
    this.#footer.hidden = !this.#slottedCite && !this.cite;
    // HTML `cite`는 URL 전용이다 — 표시 텍스트는 절대 여기 싣지 않는다
    if (this.citeUrl) this.#quote.setAttribute("cite", this.citeUrl);
    else this.#quote.removeAttribute("cite");
  }
}
