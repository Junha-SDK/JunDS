/**
 * <jd-spoiler-block> — 블러로 가린 뒤 클릭으로 여는 블록 (v2 composites/SpoilerBlock).
 *
 * v2 대비 교정 4건:
 *  1. **가린 내용이 여전히 탭 순서에 있었다.** v2는 `aria-hidden={!revealed}`만 걸었다 —
 *     안에 링크·버튼이 있으면 "AT에는 없는데 포커스는 가는" 상태가 되어 axe가 위반으로
 *     잡는 전형적인 조합이다. v3는 `inert`를 함께 걸어 포커스까지 막는다.
 *  2. **버튼이 무엇을 여는지 알 수 없었다.** v3는 `aria-expanded` + `aria-controls`로
 *     내용 영역과 결선한다(jdUid로 문서 유일 id 발급 — §8).
 *  3. **한 번 열면 되돌릴 수 없었다.** 상태가 컴포넌트 안의 useState뿐이라 밖에서
 *     제어할 수 없었다. v3는 `revealed` 프로퍼티/attribute + reveal()/hide() 메서드.
 *  4. **블러 전환이 reduced-motion을 무시했다.** CSS 미디어쿼리로 존중한다.
 *
 * type(spoiler|caution) 분기는 호스트 속성 셀렉터(§4.3) — 기본 라벨만 JS가 고른다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import spoilerBlockStyles from "./spoiler-block.css.js";

const DEFAULT_LABEL: Record<string, string> = {
  spoiler: "스포일러 보기",
  caution: "내용 보기",
};

export class JdSpoilerBlock extends JdElement {
  static override tag = "jd-spoiler-block";
  static override props = {
    /** spoiler | caution */
    type: { type: String, default: "spoiler", reflect: true },
    /** 공개 버튼 라벨. 비면 type별 기본 문구 */
    label: { type: String },
    /** 공개 상태 */
    revealed: { type: Boolean, reflect: true },
  };

  declare type: string;
  declare label: string;
  declare revealed: boolean;

  #content!: HTMLElement;
  #cover!: HTMLElement;
  #btn!: HTMLButtonElement;

  protected render(): void {
    adoptStyles(spoilerBlockStyles);
    // 입양(§3.3)
    const found = this.querySelector<HTMLElement>(":scope > .jd-spoiler-block__content");
    if (found) {
      this.#content = found;
      this.#cover = this.querySelector(".jd-spoiler-block__cover")!;
      this.#btn = this.querySelector(".jd-spoiler-block__reveal")!;
      this.update();
      return;
    }

    this.#content = document.createElement("div");
    this.#content.className = "jd-spoiler-block__content";
    this.#content.id = jdUid("jd-spoiler");
    this.#content.append(...this.childNodes);

    this.#btn = document.createElement("button");
    this.#btn.type = "button";
    this.#btn.className = "jd-spoiler-block__reveal";
    this.#btn.setAttribute("aria-controls", this.#content.id);
    this.#cover = document.createElement("div");
    this.#cover.className = "jd-spoiler-block__cover";
    this.#cover.append(this.#btn);

    this.append(this.#content, this.#cover);
    this.update();
  }

  protected override connected(): void {
    this.#btn.addEventListener("click", this.#onClick);
  }

  protected override disconnected(): void {
    this.#btn?.removeEventListener("click", this.#onClick);
  }

  #onClick = (): void => {
    this.reveal();
  };

  /** 내용을 공개한다 */
  reveal(): void {
    if (this.revealed) return;
    this.revealed = true;
    this.emit("jd-open", { type: this.type });
  }

  /** 다시 가린다 (v2에는 없던 경로 — 상태가 밖에서 제어 가능해졌다) */
  hide(): void {
    if (!this.revealed) return;
    this.revealed = false;
    this.emit("jd-close", { type: this.type });
  }

  protected override update(): void {
    const hidden = !this.revealed;
    // aria-hidden만으로는 안쪽 포커스 가능 요소가 남는다 — inert가 그것까지 막는다
    this.#content.toggleAttribute("inert", hidden);
    this.#content.setAttribute("aria-hidden", String(hidden));
    this.#cover.hidden = this.revealed;
    this.#btn.textContent = this.label || DEFAULT_LABEL[this.type] || DEFAULT_LABEL.spoiler!;
    this.#btn.setAttribute("aria-expanded", String(this.revealed));
  }

  override focus(options?: FocusOptions): void {
    this.#btn?.focus(options);
  }
}
