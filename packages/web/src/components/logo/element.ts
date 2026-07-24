/**
 * <jd-logo> — 버터머니 워드마크 (v2 finance/Logo).
 *
 * v2는 `버터` + 점(브랜드색) + 선택적 `BUTTERMONEY` 부제를 `next/link` 또는 소재 없이 그렸고,
 * 크기(sm/md/lg)에 따라 폰트·간격·점 지름을 계산했다. DS는 프레임워크 링크 의존을 지우고
 * href가 있으면 순수 <a>, 없으면 <span>으로 감싼다.
 *
 * v2 대비 교정 2건:
 *  1. **점 지름을 JS로 매번 계산**(Math.round(fs*0.22))했다 → 세 크기가 유한하므로 CSS
 *     [size]에 상수로 굳힌다(sm/md 4px · lg 5px, v2 계산 결과와 동일). render()에 산술 없음.
 *  2. **접근 이름이 텍스트뿐**이었다. 링크일 때 aria-label("버터머니 홈")을 부여하고 점은
 *     aria-hidden으로 내린다 — 부제가 없어도 로고의 목적지가 낭독된다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import logoStyles from "./logo.css.js";

const WORDMARK = "버터";
const SUBTITLE = "BUTTERMONEY";

export class JdLogo extends JdElement {
  static override tag = "jd-logo";
  static override props = {
    /** sm | md | lg — v2 SIZE 맵 */
    size: { type: String, default: "md", reflect: true },
    /** 링크 목적지. 비우면 링크 아닌 인라인 표시 */
    href: { type: String },
    /** BUTTERMONEY 부제 노출 (v2 showSubtitle) */
    showSubtitle: { type: Boolean, reflect: true, attribute: "show-subtitle" },
  };

  declare size: string;
  declare href: string;
  declare showSubtitle: boolean;

  /** 현재 마운트된 래퍼가 링크인지 — href 토글 시 재구성 판정 */
  #wrapperIsLink = false;
  #wrapper!: HTMLElement;
  #brand!: HTMLElement;
  #subtitle!: HTMLElement;

  protected render(): void {
    adoptStyles(logoStyles);
    this.#brand = document.createElement("span");
    this.#brand.className = "jd-logo__brand";
    const text = document.createElement("span");
    text.className = "jd-logo__word";
    text.textContent = WORDMARK;
    const dot = document.createElement("span");
    dot.className = "jd-logo__dot";
    dot.setAttribute("aria-hidden", "true");
    this.#brand.append(text, dot);

    this.#subtitle = document.createElement("span");
    this.#subtitle.className = "jd-logo__subtitle";
    this.#subtitle.textContent = SUBTITLE;

    this.#mountWrapper();
    this.update();
  }

  /** href 유무에 맞는 래퍼(<a> | <span>)를 세우고 내용을 옮긴다 */
  #mountWrapper(): void {
    const isLink = Boolean(this.href);
    const tag = isLink ? "a" : "span";
    if (this.#wrapper && this.#wrapperIsLink === isLink) return;
    const wrapper = document.createElement(tag);
    wrapper.className = "jd-logo__link";
    wrapper.append(this.#brand, this.#subtitle);
    if (this.#wrapper) this.#wrapper.replaceWith(wrapper);
    else this.replaceChildren(wrapper);
    this.#wrapper = wrapper;
    this.#wrapperIsLink = isLink;
  }

  protected override update(): void {
    this.#mountWrapper();
    if (this.#wrapper instanceof HTMLAnchorElement) {
      this.#wrapper.href = this.href;
      this.#wrapper.setAttribute("aria-label", `${WORDMARK}머니 홈`);
    }
    this.#subtitle.hidden = !this.showSubtitle;
  }
}
