/**
 * <jd-rating> — 0.5 단위까지 지원하는 평점 입력 (v2 composites/Rating).
 *
 * 네이티브 radio 묶음 위임(§1.6-1 · DEC-023-3 RadioGroup 선례, jd-star-rating과 같은 축):
 * 단일 탭스톱 + 화살표 순회 + 폼 참여가 공짜다. v2는 `role="radio"` 스팬 max개를 **전부**
 * tabIndex=0으로 두고 ArrowLeft/Right를 손수 처리했다 — 별 5개짜리 위젯이 탭스톱 5개를
 * 먹고, 화살표는 **포커스를 옮기지 않은 채 값만** 바꿨다(라디오 그룹의 계약 위반).
 * 반칸은 별 하나에 radio 두 개(i-0.5, i)를 DOM 오름차순으로 두어 표현한다 —
 * 화살표 한 번이 0.5씩 움직이는 v2 동작이 브라우저 기본으로 재현된다.
 *
 * 반칸 렌더는 SVG 2장 겹침 + clip-path다. v2는 `<linearGradient id={`half-${i}`}>`를
 * 썼는데 그 id는 **문서 전역**이라 한 페이지에 Rating이 둘 이상이면 서로의 그라디언트를
 * 참조한다(실사고 등급 결함). clip-path는 id가 없어 그 경로가 원천 봉쇄된다.
 *
 * 호버 미리보기는 포인터가 얹힌 **히트 영역이 스스로 알려준다** — v2의
 * getBoundingClientRect + clientX 산술이 사라지고(§3.1-3 결정적 렌더) RTL도 자동이다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import ratingStyles from "./rating.css.js";

const NS = "http://www.w3.org/2000/svg";
/** v2 Rating의 별 path 그대로 */
const STAR_PATH =
  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

export class JdRating extends JdElement {
  static override tag = "jd-rating";
  static override props = {
    value: { type: Number, default: 0 },
    max: { type: Number, default: 5 },
    /** 0.5 단위 허용 — 별마다 좌/우 반칸 히트 영역이 생긴다 */
    half: { type: Boolean, reflect: true },
    size: { type: String, default: "md", reflect: true }, // sm | md | lg
    disabled: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    /** 폼 필드명. 없으면 문서 유일 name을 발급한다 */
    name: { type: String },
    /** 그룹의 접근 이름 */
    label: { type: String },
  };

  declare value: number;
  declare max: number;
  declare half: boolean;
  declare size: string;
  declare disabled: boolean;
  declare readonly: boolean;
  declare name: string;
  declare label: string;

  #stars: HTMLSpanElement[] = [];
  #radios: HTMLInputElement[] = [];
  #group = "";
  #builtMax = -1;
  #builtHalf = false;
  #preview = 0; // 0 = 미리보기 없음

  protected render(): void {
    adoptStyles(ratingStyles);
    this.setAttribute("role", "radiogroup");
    this.#sync();
    this.update();
  }

  /** 별 개수는 max, half 여부가 바뀔 때만 재구축. 그 외에는 update()가 상태만 반영 */
  #sync(): void {
    const count = this.#starCount();
    const existing = Array.from(
      this.querySelectorAll<HTMLSpanElement>(":scope > .jd-rating__star"),
    );
    // 입양(§3.3): 개수와 반칸 여부가 맞으면 SSR/프리렌더 골격을 그대로 쓴다
    if (existing.length === count && this.#hitsPerStar(existing[0]) === (this.half ? 2 : 1)) {
      this.#stars = existing;
      this.#radios = Array.from(
        this.querySelectorAll<HTMLInputElement>(":scope > .jd-rating__star .jd-rating__radio"),
      );
      this.#group = this.#radios[0]?.name || this.#group || this.name || jdUid("jd-rating");
      this.#builtMax = count;
      this.#builtHalf = this.half;
      return;
    }

    for (const node of existing) node.remove();
    if (!this.#group) this.#group = this.name || jdUid("jd-rating"); // Math.random 금지(§3.1-3)
    this.#stars = [];
    this.#radios = [];
    for (let i = 1; i <= count; i++) {
      const star = document.createElement("span");
      star.className = "jd-rating__star";
      star.dataset.fill = "none";
      star.append(this.#icon("empty"), this.#icon("fill"));
      if (this.half) star.append(this.#hit("half", i - 0.5));
      star.append(this.#hit("full", i));
      this.#stars.push(star);
      this.append(star);
    }
    this.#builtMax = count;
    this.#builtHalf = this.half;
  }

  #starCount(): number {
    const n = Math.floor(this.max);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  #hitsPerStar(star: HTMLSpanElement | undefined): number {
    return star ? star.querySelectorAll(":scope > .jd-rating__hit").length : 0;
  }

  /** 채움은 CSS clip-path가 결정 — 노드 교체도, 문서 전역 id도 없다 */
  #icon(kind: "empty" | "fill"): SVGSVGElement {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", `jd-rating__icon jd-rating__icon--${kind}`);
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", STAR_PATH);
    svg.append(path);
    return svg;
  }

  #hit(side: "half" | "full", value: number): HTMLLabelElement {
    const hit = document.createElement("label");
    hit.className = "jd-rating__hit";
    hit.dataset.side = side;
    hit.dataset.value = String(value);
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.className = "jd-rating__radio";
    radio.name = this.#group;
    radio.value = String(value);
    radio.setAttribute("aria-label", `${value}점`);
    hit.append(radio);
    this.#radios.push(radio);
    return hit;
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

  #interactive(): boolean {
    return !this.disabled && !this.readonly;
  }

  #onChange = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    if (!input.classList?.contains("jd-rating__radio")) return;
    this.value = Number(input.value);
    this.emit("jd-change", { value: this.value });
  };

  #onOver = (e: Event): void => {
    if (!this.#interactive()) return;
    const hit = (e.target as Element).closest?.(".jd-rating__hit") as HTMLElement | null;
    if (!hit) return;
    const next = Number(hit.dataset.value);
    if (this.#preview === next) return;
    this.#preview = next;
    this.requestUpdate();
  };

  #onLeave = (): void => {
    if (!this.#preview) return;
    this.#preview = 0;
    this.requestUpdate();
  };

  protected override update(): void {
    if (this.#builtMax !== this.#starCount() || this.#builtHalf !== this.half) this.#sync();

    const shown = this.#preview || this.value;
    for (let i = 0; i < this.#stars.length; i++) {
      const star = i + 1;
      // v2: filled = display >= star / halfFilled = half && display >= star-0.5 && display < star
      const fill = shown >= star ? "full" : this.half && shown >= star - 0.5 ? "half" : "none";
      this.#stars[i]!.dataset.fill = fill;
    }

    const name = this.name || this.#group;
    const locked = !this.#interactive();
    for (const radio of this.#radios) {
      if (radio.name !== name) radio.name = name;
      radio.checked = Number(radio.value) === this.value;
      radio.disabled = locked;
    }

    this.setAttribute("aria-label", this.label || "평점"); // v2 aria-label="평점"
    if (this.readonly) this.setAttribute("aria-readonly", "true");
    else this.removeAttribute("aria-readonly");
    if (this.disabled) this.setAttribute("aria-disabled", "true");
    else this.removeAttribute("aria-disabled");
  }

  /** 선택된 별이 있으면 그쪽, 없으면 라디오 그룹 진입점(첫 칸) */
  override focus(options?: FocusOptions): void {
    const target = this.#radios.find((r) => r.checked) ?? this.#radios[0];
    target?.focus(options);
  }
}
