/**
 * <jd-star-rating> — 별점 입력·표시 (v2 primitives/StarRating).
 *
 * - 네이티브 radio 묶음 위임(§1.6-1 · DEC-023-3 RadioGroup 선례): 단일 탭스톱 +
 *   화살표 순회 + 폼 참여가 공짜. v2는 버튼 max개를 전부 탭 순서에 넣고
 *   `aria-checked={starValue <= value}`로 여러 개를 동시에 checked로 노출했다 —
 *   네이티브 위임이 그 두 결함을 함께 없앤다(a11y 상위집합).
 * - 소수 값(4.5)은 v2와 동일하게 내림 표시 — 어떤 radio도 checked가 아니다.
 * - 호버 미리보기는 렌더가 아니라 포인터 이벤트에서만 갱신(§3.1-3 결정적 렌더).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import starRatingStyles from "./star-rating.css.js";

const STAR_PATH =
  "M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988" +
  "l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0" +
  "L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988" +
  "l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z";

export class JdStarRating extends JdElement {
  static override tag = "jd-star-rating";
  static override props = {
    value: { type: Number, default: 0 },
    max: { type: Number, default: 5 },
    size: { type: String, default: "md", reflect: true }, // sm | md | lg
    readonly: { type: Boolean, reflect: true },
    name: { type: String },
    label: { type: String },
  };

  declare value: number;
  declare max: number;
  declare size: string;
  declare readonly: boolean;
  declare name: string;
  declare label: string;

  #items: HTMLLabelElement[] = [];
  #radios: HTMLInputElement[] = [];
  #preview = 0; // 0 = 미리보기 없음
  #group = "";

  protected render(): void {
    adoptStyles(starRatingStyles);
    this.setAttribute("role", "radiogroup");
    this.#sync();
    this.update();
  }

  #sync(): void {
    const existing = Array.from(
      this.querySelectorAll<HTMLLabelElement>(":scope > label.jd-star-rating__item"),
    );
    if (existing.length === this.max) {
      this.#items = existing;
      this.#radios = existing.map((l) => l.querySelector("input")!);
      this.#group = this.#radios[0]?.name ?? "";
      return;
    }
    for (const n of Array.from(this.children)) n.remove();
    // 문서 유일 그룹명 — Math.random 금지(§3.1-3), 증분 uid 사용
    this.#group = this.name || jdUid("jd-star");
    this.#items = [];
    this.#radios = [];
    for (let i = 1; i <= this.max; i++) {
      const item = document.createElement("label");
      item.className = "jd-star-rating__item";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.className = "jd-star-rating__radio";
      radio.name = this.#group;
      radio.value = String(i);
      radio.setAttribute("aria-label", `${i}점`);
      item.append(radio, this.#star());
      this.#items.push(item);
      this.#radios.push(radio);
      this.append(item);
    }
  }

  /** 채움 여부는 CSS(fill/stroke)가 결정 — 노드 교체 없음 */
  #star(): SVGSVGElement {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "jd-star-rating__icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", STAR_PATH);
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.append(path);
    return svg;
  }

  protected override connected(): void {
    this.addEventListener("change", this.#onChange);
    this.addEventListener("mouseover", this.#onOver);
    this.addEventListener("mouseleave", this.#onLeave);
  }

  protected override disconnected(): void {
    this.removeEventListener("change", this.#onChange);
    this.removeEventListener("mouseover", this.#onOver);
    this.removeEventListener("mouseleave", this.#onLeave);
  }

  #onChange = (e: Event): void => {
    const i = this.#radios.indexOf(e.target as HTMLInputElement);
    if (i < 0) return;
    this.value = i + 1;
    this.emit("jd-change", { value: this.value });
  };

  #onOver = (e: Event): void => {
    if (this.readonly) return;
    const item = (e.target as Element).closest?.(".jd-star-rating__item");
    const i = this.#items.indexOf(item as HTMLLabelElement);
    if (i < 0 || this.#preview === i + 1) return;
    this.#preview = i + 1;
    this.requestUpdate();
  };

  #onLeave = (): void => {
    if (!this.#preview) return;
    this.#preview = 0;
    this.requestUpdate();
  };

  protected override update(): void {
    if (this.#items.length !== this.max) this.#sync();
    const shown = this.#preview || this.value;
    for (let i = 0; i < this.#items.length; i++) {
      const star = i + 1;
      this.#items[i]!.toggleAttribute("data-filled", star <= shown);
      const radio = this.#radios[i]!;
      radio.disabled = this.readonly;
      radio.checked = star === this.value; // 4.5 같은 소수는 어느 것도 checked 아님
      if (this.name && radio.name !== this.name) radio.name = this.name;
    }
    this.setAttribute("aria-label", this.label || "별점");
    if (this.readonly) this.setAttribute("aria-readonly", "true");
    else this.removeAttribute("aria-readonly");
  }
}
