/**
 * <jd-progress-bar> — 진행 바 (v2 composites/Progress ProgressBar).
 *
 * v2 대비 교정 3건:
 *  1. **role=progressbar가 엉뚱한 노드에 있었다.** v2는 폭이 0%면 사실상 사라지는
 *     **채움 div**에 role을 얹었다 — 0%일 때 접근성 트리에서 크기 0으로 눌리고,
 *     트랙(실제 위젯 경계)에는 아무 의미도 없었다. v3는 **트랙**이 progressbar다.
 *  2. **aria-valuemin이 없었고 이름도 없었다.** v2는 valuenow/valuemax만 줘서
 *     "몇 중 몇"의 기준점이 비었고, 시각 라벨은 위젯과 연결되지 않아 AT에는
 *     떠도는 텍스트였다. v3는 valuemin=0 + aria-valuetext("42%") +
 *     라벨이 있으면 aria-labelledby로 **그 라벨 자체**를 이름으로 묶는다.
 *  3. **값 정규화가 표시에만 걸려 있었다.** v2는 폭만 clamp하고 aria-valuenow에는
 *     원본(음수·초과 가능)을 그대로 실었다. v3는 두 경로가 같은 clamp를 쓴다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import progressBarStyles from "./progress-bar.css.js";

export class JdProgressBar extends JdElement {
  static override tag = "jd-progress-bar";
  static override props = {
    value: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    /** default | success | warning | danger */
    variant: { type: String, default: "default", reflect: true },
    /** sm | md | lg */
    size: { type: String, default: "md", reflect: true },
    /** 오른쪽에 백분율 숫자 표시 */
    showLabel: { type: Boolean, reflect: true },
    /** 왼쪽 라벨 텍스트 */
    label: { type: String },
    /** 마운트 시 0에서 차오르는 연출 */
    animated: { type: Boolean, reflect: true },
  };

  declare value: number;
  declare max: number;
  declare variant: string;
  declare size: string;
  declare showLabel: boolean;
  declare label: string;
  declare animated: boolean;

  #header!: HTMLElement;
  #labelEl!: HTMLElement;
  #valueEl!: HTMLElement;
  #track!: HTMLElement;
  #fill!: HTMLElement;

  /** 0~100. max가 0 이하면 진행률을 정의할 수 없으므로 0 */
  get percent(): number {
    const max = Number(this.max);
    const value = Number(this.value);
    if (!Number.isFinite(max) || max <= 0 || !Number.isFinite(value)) return 0;
    return Math.min(100, Math.max(0, (value / max) * 100));
  }

  protected render(): void {
    adoptStyles(progressBarStyles);
    // 입양(§3.3)
    const track = this.querySelector<HTMLElement>(":scope > .jd-progress-bar__track");
    if (track) {
      this.#track = track;
      this.#fill = track.querySelector(".jd-progress-bar__fill")!;
      this.#header = this.querySelector(":scope > .jd-progress-bar__header")!;
      this.#labelEl = this.#header.querySelector(".jd-progress-bar__label")!;
      this.#valueEl = this.#header.querySelector(".jd-progress-bar__value")!;
      this.update();
      return;
    }

    this.#labelEl = document.createElement("span");
    this.#labelEl.className = "jd-progress-bar__label";
    this.#labelEl.id = jdUid("jd-progress-bar-label");
    this.#valueEl = document.createElement("span");
    this.#valueEl.className = "jd-progress-bar__value";
    // 값은 aria-valuetext가 이미 말한다 — 눈에만 보이는 사본
    this.#valueEl.setAttribute("aria-hidden", "true");
    this.#header = document.createElement("div");
    this.#header.className = "jd-progress-bar__header";
    this.#header.append(this.#labelEl, this.#valueEl);

    this.#fill = document.createElement("div");
    this.#fill.className = "jd-progress-bar__fill";
    this.#track = document.createElement("div");
    this.#track.className = "jd-progress-bar__track";
    this.#track.setAttribute("role", "progressbar");
    this.#track.setAttribute("aria-valuemin", "0");
    this.#track.append(this.#fill);

    this.append(this.#header, this.#track);
    this.update();
  }

  protected override update(): void {
    const pct = this.percent;
    const max = Number.isFinite(Number(this.max)) ? Number(this.max) : 100;
    const value = Number.isFinite(Number(this.value)) ? Number(this.value) : 0;
    const rounded = Math.round(pct);

    this.#fill.style.width = `${pct}%`;
    this.#track.setAttribute("aria-valuemax", String(max));
    this.#track.setAttribute("aria-valuenow", String(Math.min(Math.max(value, 0), max)));
    this.#track.setAttribute("aria-valuetext", `${rounded}%`);

    if (this.label) {
      this.#track.setAttribute("aria-labelledby", this.#labelEl.id);
      this.#track.removeAttribute("aria-label");
    } else {
      this.#track.removeAttribute("aria-labelledby");
      this.#track.setAttribute("aria-label", "진행률");
    }

    this.#labelEl.textContent = this.label;
    this.#labelEl.hidden = !this.label;
    this.#valueEl.textContent = `${rounded}%`;
    this.#valueEl.hidden = !this.showLabel;
    this.#header.hidden = !this.label && !this.showLabel;
  }
}
