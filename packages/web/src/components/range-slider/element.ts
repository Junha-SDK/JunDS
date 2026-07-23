/**
 * <jd-range-slider> — 듀얼 썸 범위 슬라이더 (v2 primitives/RangeSlider).
 * 네이티브 range는 단일 값뿐이라 v2의 포인터 캡처 구현을 이식한다(§1.6-2 예외 성격).
 * v2 value:[min,max] 튜플은 복합 attribute 금지(§1.3) → min-value/max-value 스칼라 2프롭.
 * 썸 = role="slider" + 키보드 화살표(v2 동형), 드래그 중 jd-input · 확정 시 jd-change.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import rangeSliderStyles from "./range-slider.css.js";

export class JdRangeSlider extends JdElement {
  static override tag = "jd-range-slider";
  static override props = {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    minValue: { type: Number, reflect: true }, // attr: min-value
    maxValue: { type: Number, default: 100, reflect: true }, // attr: max-value
    disabled: { type: Boolean, reflect: true },
    showValues: { type: Boolean, reflect: true }, // attr: show-values
  };

  declare min: number;
  declare max: number;
  declare step: number;
  declare minValue: number;
  declare maxValue: number;
  declare disabled: boolean;
  declare showValues: boolean;

  #track!: HTMLDivElement;
  #fill!: HTMLDivElement;
  #thumbMin!: HTMLDivElement;
  #thumbMax!: HTMLDivElement;
  #values!: HTMLDivElement;
  #dragging: "min" | "max" | null = null;

  protected render(): void {
    adoptStyles(rangeSliderStyles);
    const existing = this.querySelector<HTMLDivElement>(":scope > .jd-range-slider__track");
    if (existing) {
      this.#track = existing;
      this.#fill = existing.querySelector(".jd-range-slider__fill")!;
      const thumbs = existing.querySelectorAll<HTMLDivElement>(".jd-range-slider__thumb");
      this.#thumbMin = thumbs[0]!;
      this.#thumbMax = thumbs[1]!;
      this.#values = this.querySelector(":scope > .jd-range-slider__values")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    this.#values = document.createElement("div");
    this.#values.className = "jd-range-slider__values";

    this.#track = document.createElement("div");
    this.#track.className = "jd-range-slider__track";
    const rail = document.createElement("div");
    rail.className = "jd-range-slider__rail";
    this.#fill = document.createElement("div");
    this.#fill.className = "jd-range-slider__fill";
    this.#thumbMin = this.#buildThumb("최솟값");
    this.#thumbMax = this.#buildThumb("최댓값");
    this.#track.append(rail, this.#fill, this.#thumbMin, this.#thumbMax);

    this.append(this.#values, this.#track);
  }

  #buildThumb(label: string): HTMLDivElement {
    const t = document.createElement("div");
    t.className = "jd-range-slider__thumb";
    t.setAttribute("role", "slider");
    t.setAttribute("aria-label", label);
    t.tabIndex = 0;
    return t;
  }

  protected override connected(): void {
    this.#thumbMin.addEventListener("pointerdown", this.#onPointerDown);
    this.#thumbMax.addEventListener("pointerdown", this.#onPointerDown);
    this.#track.addEventListener("pointermove", this.#onPointerMove);
    this.#track.addEventListener("pointerup", this.#onPointerUp);
    this.addEventListener("keydown", this.#onKeydown);
  }

  protected override disconnected(): void {
    this.#thumbMin?.removeEventListener("pointerdown", this.#onPointerDown);
    this.#thumbMax?.removeEventListener("pointerdown", this.#onPointerDown);
    this.#track?.removeEventListener("pointermove", this.#onPointerMove);
    this.#track?.removeEventListener("pointerup", this.#onPointerUp);
    this.removeEventListener("keydown", this.#onKeydown);
    this.#dragging = null;
  }

  #valueFromX(clientX: number): number {
    const rect = this.#track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / (rect.width || 1)));
    const raw = this.min + ratio * (this.max - this.min);
    return Math.round(raw / this.step) * this.step;
  }

  #onPointerDown = (e: PointerEvent): void => {
    if (this.disabled) return;
    e.preventDefault();
    this.#dragging = e.currentTarget === this.#thumbMin ? "min" : "max";
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    this.toggleAttribute("data-dragging", true);
  };

  #onPointerMove = (e: PointerEvent): void => {
    if (!this.#dragging) return;
    const v = this.#valueFromX(e.clientX);
    // v2 동형: 반대편과 step 간격 유지 클램프
    if (this.#dragging === "min") this.minValue = Math.min(v, this.maxValue - this.step);
    else this.maxValue = Math.max(v, this.minValue + this.step);
    this.emit("jd-input", { min: this.minValue, max: this.maxValue });
  };

  #onPointerUp = (): void => {
    if (!this.#dragging) return;
    this.#dragging = null;
    this.removeAttribute("data-dragging");
    this.emit("jd-change", { min: this.minValue, max: this.maxValue });
  };

  #onKeydown = (e: KeyboardEvent): void => {
    if (this.disabled) return;
    const thumb = e.target as HTMLElement;
    const isMin = thumb === this.#thumbMin;
    const isMax = thumb === this.#thumbMax;
    if (!isMin && !isMax) return;
    const d =
      e.key === "ArrowRight" || e.key === "ArrowUp" ? this.step
      : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -this.step
      : 0;
    if (!d) return;
    e.preventDefault();
    if (isMin) this.minValue = Math.max(this.min, Math.min(this.minValue + d, this.maxValue - this.step));
    else this.maxValue = Math.min(this.max, Math.max(this.maxValue + d, this.minValue + this.step));
    this.emit("jd-change", { min: this.minValue, max: this.maxValue });
  };

  protected override update(): void {
    const span = this.max - this.min || 1;
    const pct = (v: number): number => Math.max(0, Math.min(100, ((v - this.min) / span) * 100));
    const lo = pct(this.minValue);
    const hi = pct(this.maxValue);

    this.#fill.style.left = `${lo}%`;
    this.#fill.style.right = `${100 - hi}%`;
    this.#thumbMin.style.left = `${lo}%`;
    this.#thumbMax.style.left = `${hi}%`;

    for (const [thumb, v] of [
      [this.#thumbMin, this.minValue],
      [this.#thumbMax, this.maxValue],
    ] as const) {
      thumb.setAttribute("aria-valuemin", String(this.min));
      thumb.setAttribute("aria-valuemax", String(this.max));
      thumb.setAttribute("aria-valuenow", String(v));
      thumb.tabIndex = this.disabled ? -1 : 0;
      if (this.disabled) thumb.setAttribute("aria-disabled", "true");
      else thumb.removeAttribute("aria-disabled");
    }

    this.#values.hidden = !this.showValues;
    if (this.showValues) {
      this.#values.textContent = "";
      const a = document.createElement("span");
      a.textContent = String(this.minValue);
      const b = document.createElement("span");
      b.textContent = String(this.maxValue);
      this.#values.append(a, b);
    }
  }
}
