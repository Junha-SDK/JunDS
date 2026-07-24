/**
 * <jd-progress-ring> — 원형 진행률 (v2 composites/ProgressRing).
 *
 * SVG는 **createElementNS**로 만든다(§6-1): `document.createElement("circle")`는
 * HTML 네임스페이스의 미지 요소가 되어 화면에 아무것도 그려지지 않는다.
 *
 * v2 대비 교정 3건:
 *  1. **의미가 0이었다.** svg + div뿐이라 AT에는 "75%"라는 글자만 있었고(children을
 *     주면 그마저 없었다) 진행 위젯이라는 사실도, 최댓값도 전달되지 않았다.
 *     v3는 호스트가 `role="progressbar"`(valuemin/max/now/text + 이름).
 *  2. **r이 음수가 될 수 있었다.** `size < strokeWidth`면 radius가 음수 —
 *     SVG는 원을 통째로 지운다(에러도 없이 빈 화면). v3는 0으로 clamp한다.
 *  3. **중앙 텍스트가 값을 두 번 말했다.** v3는 자동 백분율 텍스트를 aria-hidden으로
 *     두고 aria-valuetext가 단독으로 말한다. 소비자가 넣은 children은 건드리지 않는다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import progressRingStyles from "./progress-ring.css.js";

const NS = "http://www.w3.org/2000/svg";

export class JdProgressRing extends JdElement {
  static override tag = "jd-progress-ring";
  static override props = {
    value: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    /** 링 바깥 지름(px) */
    size: { type: Number, default: 80 },
    /** 선 두께(px) */
    strokeWidth: { type: Number, default: 6 },
    /** 진행 색(CSS 색). 비우면 primary 토큰 */
    color: { type: String },
    /** 트랙 색(CSS 색). 비우면 border 토큰 */
    trackColor: { type: String },
    /** 접근 이름. 없으면 "진행률" */
    label: { type: String },
  };

  declare value: number;
  declare max: number;
  declare size: number;
  declare strokeWidth: number;
  declare color: string;
  declare trackColor: string;
  declare label: string;

  #svg!: SVGSVGElement;
  #track!: SVGCircleElement;
  #fill!: SVGCircleElement;
  #center!: HTMLElement;
  #auto!: HTMLElement | null;

  /** 0~1 */
  get progress(): number {
    const max = Number(this.max);
    const value = Number(this.value);
    if (!Number.isFinite(max) || max <= 0 || !Number.isFinite(value)) return 0;
    return Math.min(1, Math.max(0, value / max));
  }

  protected render(): void {
    adoptStyles(progressRingStyles);
    const svg = this.querySelector<SVGSVGElement>(":scope > .jd-progress-ring__svg");
    if (svg) {
      // 입양(§3.3)
      this.#svg = svg;
      this.#track = svg.querySelector(".jd-progress-ring__track")!;
      this.#fill = svg.querySelector(".jd-progress-ring__fill")!;
      this.#center = this.querySelector(":scope > .jd-progress-ring__center")!;
      this.#auto = this.#center.querySelector(".jd-progress-ring__value");
    } else {
      this.#svg = document.createElementNS(NS, "svg");
      this.#svg.setAttribute("class", "jd-progress-ring__svg");
      this.#svg.setAttribute("aria-hidden", "true"); // 값은 호스트 role이 말한다
      this.#track = this.#circle("track");
      this.#fill = this.#circle("fill");
      this.#svg.append(this.#track, this.#fill);

      // children이 있으면 그것이 중앙 콘텐츠(v2 children 표면), 없으면 자동 백분율
      const rest = Array.from(this.childNodes);
      this.#center = document.createElement("div");
      this.#center.className = "jd-progress-ring__center";
      if (rest.length > 0) {
        this.#center.append(...rest);
        this.#auto = null;
      } else {
        this.#auto = document.createElement("span");
        this.#auto.className = "jd-progress-ring__value";
        this.#auto.setAttribute("aria-hidden", "true");
        this.#center.append(this.#auto);
      }
      this.append(this.#svg, this.#center);
    }
    this.setAttribute("role", "progressbar");
    this.setAttribute("aria-valuemin", "0");
    this.update();
  }

  #circle(kind: "track" | "fill"): SVGCircleElement {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("class", `jd-progress-ring__${kind}`);
    c.setAttribute("fill", "none");
    return c;
  }

  protected override update(): void {
    const size = this.#px(this.size, 80);
    const stroke = this.#px(this.strokeWidth, 6);
    // v2는 size < strokeWidth를 방어하지 않아 r이 음수가 되면 링이 통째로 사라졌다
    const radius = Math.max(0, (size - stroke) / 2);
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - this.progress);

    this.style.width = `${size}px`;
    this.style.height = `${size}px`;
    this.#svg.setAttribute("width", String(size));
    this.#svg.setAttribute("height", String(size));
    this.#svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

    for (const c of [this.#track, this.#fill]) {
      c.setAttribute("cx", String(size / 2));
      c.setAttribute("cy", String(size / 2));
      c.setAttribute("r", String(radius));
      c.setAttribute("stroke-width", String(stroke));
    }
    this.#fill.setAttribute("stroke-dasharray", String(circumference));
    this.#fill.setAttribute("stroke-dashoffset", String(offset));

    this.#setColor("--jd-progress-ring-color", this.color);
    this.#setColor("--jd-progress-ring-track", this.trackColor);

    const percent = Math.round(this.progress * 100);
    const max = Number.isFinite(Number(this.max)) ? Number(this.max) : 100;
    const value = Number.isFinite(Number(this.value)) ? Number(this.value) : 0;
    this.setAttribute("aria-valuemax", String(max));
    this.setAttribute("aria-valuenow", String(Math.min(Math.max(value, 0), max)));
    this.setAttribute("aria-valuetext", `${percent}%`);
    this.setAttribute("aria-label", this.label || "진행률");
    if (this.#auto) this.#auto.textContent = `${percent}%`;
  }

  #px(v: number, fallback: number): number {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }

  #setColor(prop: string, value: string): void {
    if (value) this.style.setProperty(prop, value);
    else this.style.removeProperty(prop);
  }
}
