/**
 * <jd-slider> — 슬라이더 (v2 primitives/Slider).
 *
 * v2는 마우스·키보드를 수제 구현했으나 v3는 **네이티브 input[type=range] 위임**
 * (§1.6-1 원칙): 키보드(화살표/Home/End)·aria·폼 참여·터치가 브라우저 기본.
 * 채움(fill)은 트랙 그라디언트 % CSS 변수(--_jd-slider-pct)로 시각 패리티.
 * marks는 복합 데이터 — property 전용 + <script type="application/json"> 슬롯(§1.3 예외).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import sliderStyles from "./slider.css.js";

export interface JdSliderMark {
  value: number;
  label?: string;
}

export class JdSlider extends JdElement {
  static override tag = "jd-slider";
  static override props = {
    value: { type: Number, reflect: true },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    disabled: { type: Boolean, reflect: true },
    showValue: { type: Boolean, reflect: true }, // attr: show-value
    color: { type: String, default: "primary", reflect: true }, // primary|success|warning|danger
    size: { type: String, default: "md", reflect: true },       // sm | md
    name: { type: String },
  };

  declare value: number;
  declare min: number;
  declare max: number;
  declare step: number;
  declare disabled: boolean;
  declare showValue: boolean;
  declare color: string;
  declare size: string;
  declare name: string;

  #marks: JdSliderMark[] = [];
  /** 표시 포맷 함수 — property 전용 (v2 formatValue) */
  formatValue: ((value: number) => string) | null = null;

  get marks(): JdSliderMark[] {
    return this.#marks;
  }
  set marks(v: JdSliderMark[]) {
    this.#marks = Array.isArray(v) ? v : [];
    this.#rebuildMarks();
    this.requestUpdate();
  }

  #input!: HTMLInputElement;
  #header!: HTMLDivElement;
  #display!: HTMLSpanElement;
  #minLabel!: HTMLSpanElement;
  #maxLabel!: HTMLSpanElement;
  #marksBox!: HTMLDivElement;

  protected render(): void {
    adoptStyles(sliderStyles);
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (script) {
      try {
        const parsed = JSON.parse(script.textContent || "[]") as JdSliderMark[];
        if (Array.isArray(parsed)) this.#marks = parsed;
      } catch {
        console.warn("[junds] <jd-slider> JSON 슬롯 파싱 실패 — 무시합니다.");
      }
      script.remove();
    }
    const existing = this.querySelector<HTMLInputElement>(":scope > input.jd-slider__input");
    if (existing) {
      this.#input = existing;
      this.#header = this.querySelector(":scope > .jd-slider__header")!;
      this.#minLabel = this.#header.querySelector(".jd-slider__min")!;
      this.#display = this.#header.querySelector(".jd-slider__display")!;
      this.#maxLabel = this.#header.querySelector(".jd-slider__max")!;
      this.#marksBox = this.querySelector(":scope > .jd-slider__marks")!;
    } else {
      this.#build();
    }
    this.#rebuildMarks();
    this.update();
  }

  #build(): void {
    this.#header = document.createElement("div");
    this.#header.className = "jd-slider__header";
    this.#minLabel = document.createElement("span");
    this.#minLabel.className = "jd-slider__min";
    this.#display = document.createElement("span");
    this.#display.className = "jd-slider__display";
    this.#maxLabel = document.createElement("span");
    this.#maxLabel.className = "jd-slider__max";
    this.#header.append(this.#minLabel, this.#display, this.#maxLabel);

    this.#input = document.createElement("input");
    this.#input.type = "range";
    this.#input.className = "jd-slider__input";

    this.#marksBox = document.createElement("div");
    this.#marksBox.className = "jd-slider__marks";
    this.#marksBox.setAttribute("aria-hidden", "true");

    this.append(this.#header, this.#input, this.#marksBox);
  }

  #rebuildMarks(): void {
    if (!this.#marksBox) return;
    this.#marksBox.replaceChildren();
    this.#marksBox.hidden = this.#marks.length === 0;
    for (const mark of this.#marks) {
      const item = document.createElement("div");
      item.className = "jd-slider__mark";
      const tick = document.createElement("div");
      tick.className = "jd-slider__tick";
      item.append(tick);
      if (mark.label) {
        const text = document.createElement("span");
        text.className = "jd-slider__mark-label";
        text.textContent = mark.label;
        item.append(text);
      }
      this.#marksBox.append(item);
    }
  }

  protected override connected(): void {
    this.#input.addEventListener("input", this.#onInput);
    this.#input.addEventListener("change", this.#onChange);
  }

  protected override disconnected(): void {
    this.#input?.removeEventListener("input", this.#onInput);
    this.#input?.removeEventListener("change", this.#onChange);
  }

  #onInput = (): void => {
    this.value = Number(this.#input.value);
    this.emit("jd-input", { value: this.value });
  };

  #onChange = (): void => {
    this.emit("jd-change", { value: this.value });
  };

  protected override update(): void {
    const input = this.#input;
    input.min = String(this.min);
    input.max = String(this.max);
    input.step = String(this.step);
    input.disabled = this.disabled;
    if (this.name) input.name = this.name;
    else input.removeAttribute("name");
    if (Number(input.value) !== this.value) input.value = String(this.value);
    input.setAttribute(
      "aria-label",
      this.getAttribute("aria-label") || "슬라이더",
    );

    // 채움 % — 트랙 그라디언트가 소비
    const span = this.max - this.min || 1;
    const pct = Math.max(0, Math.min(100, ((this.value - this.min) / span) * 100));
    this.style.setProperty("--_jd-slider-pct", `${pct}%`);

    // 헤더(min / 현재값 / max) — v2 showValue 동형
    this.#header.hidden = !this.showValue;
    if (this.showValue) {
      this.#minLabel.textContent = String(this.min);
      this.#maxLabel.textContent = String(this.max);
      this.#display.textContent = this.formatValue
        ? this.formatValue(this.value)
        : String(this.value);
    }

    // 마크 위치
    const items = this.#marksBox.querySelectorAll<HTMLElement>(".jd-slider__mark");
    items.forEach((item, i) => {
      const mark = this.#marks[i];
      if (!mark) return;
      const mpct = ((mark.value - this.min) / span) * 100;
      item.style.setProperty("left", `${mpct}%`);
    });
  }

  override focus(options?: FocusOptions): void {
    this.#input?.focus(options);
  }
}
