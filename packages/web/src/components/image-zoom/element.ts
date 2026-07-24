/**
 * <jd-image-zoom> — 휠·더블클릭 확대 + 드래그 이동 (v2 composites/ImageZoom).
 *
 * v2 대비 실질 개선 5건:
 *  1. **휠 줌이 실제로 동작한다.** v2는 `onWheel`에서 `preventDefault()`를 불렀지만
 *     React는 wheel을 루트에 **passive**로 위임한다 — 취소가 무시되고 페이지가 같이
 *     스크롤됐다. v3는 `{ passive: false }`로 직접 붙인다. 그리고 **줌이 실제로
 *     일어날 때만** 취소한다 — 최대/최소에 닿으면 스크롤이 페이지로 넘어가, 확대
 *     영역이 스크롤 블랙홀이 되지 않는다.
 *  2. **이미지를 화면 밖으로 잃어버리지 않는다.** v2는 이동량에 한계가 없어 크게
 *     끌면 이미지가 사라졌고 되돌릴 방법은 초기화 버튼뿐이었다. v3는 확대 배율이
 *     허용하는 범위로 이동을 가둔다.
 *  3. **키보드로 조작할 수 있다.** v2는 마우스 전용이었다(버튼 셋만 탭 대상).
 *     화살표=이동 · Shift+↑/↓=확대/축소 · Enter/Space=1x↔2x · 0=원래 크기.
 *  4. **배율 축소 시 이동이 함께 풀린다.** v2는 배율만 1로 돌려 이미지가 치우친 채
 *     남았다(축소 버튼으로 1x에 도달했을 때 초기화와 결과가 달랐다).
 *  5. **상태가 AT에 보인다** — 배율 표시가 `role="status"`이고 호스트에 접근 이름이 있다.
 *
 * 이벤트: 배율 확정 시 `jd-change`({ scale }).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { on, createKeyHandler } from "../../behaviors/input.js";
import imageZoomStyles from "./image-zoom.css.js";

/** 키보드 1회 이동량(px) */
const PAN_STEP = 24;

export class JdImageZoom extends JdElement {
  static override tag = "jd-image-zoom";
  static override props = {
    src: { type: String },
    alt: { type: String },
    minZoom: { type: Number, default: 1 },
    maxZoom: { type: Number, default: 4 },
    /** 버튼·키보드 1회 배율 변화량 */
    step: { type: Number, default: 0.5 },
    /** CSS aspect-ratio 값. v2 기본 "16 / 9" */
    ratio: { type: String, default: "16 / 9" },
    /** 현재 배율 — 살아 있는 상태(attribute는 초기값) */
    scale: { type: Number, default: 1 },
    zoomInLabel: { type: String, default: "확대" },
    zoomOutLabel: { type: String, default: "축소" },
    resetLabel: { type: String, default: "원래 크기" },
  };

  declare src: string;
  declare alt: string;
  declare minZoom: number;
  declare maxZoom: number;
  declare step: number;
  declare ratio: string;
  declare scale: number;
  declare zoomInLabel: string;
  declare zoomOutLabel: string;
  declare resetLabel: string;

  #img!: HTMLImageElement;
  #controls!: HTMLElement;
  #outBtn!: HTMLButtonElement;
  #inBtn!: HTMLButtonElement;
  #resetBtn!: HTMLButtonElement;
  #valueEl!: HTMLElement;
  #offs: Array<() => void> = [];

  #x = 0;
  #y = 0;
  #drag: { x: number; y: number } | null = null;

  /* ── 골격 ────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(imageZoomStyles);
    const img = this.querySelector<HTMLImageElement>(":scope > .jd-image-zoom__image");
    const controls = this.querySelector<HTMLElement>(":scope > .jd-image-zoom__controls");
    if (img && controls) {
      // 입양 규칙(§3.3)
      this.#img = img;
      this.#controls = controls;
      this.#outBtn = controls.querySelector<HTMLButtonElement>(".jd-image-zoom__button--out")!;
      this.#valueEl = controls.querySelector<HTMLElement>(".jd-image-zoom__value")!;
      this.#inBtn = controls.querySelector<HTMLButtonElement>(".jd-image-zoom__button--in")!;
      this.#resetBtn = controls.querySelector<HTMLButtonElement>(".jd-image-zoom__button--reset")!;
    } else {
      this.#build();
    }
    if (!this.hasAttribute("role")) this.setAttribute("role", "group");
    if (!this.hasAttribute("tabindex")) this.tabIndex = 0;
    this.update();
  }

  #build(): void {
    const doc = this.ownerDocument;
    this.#img = doc.createElement("img");
    this.#img.className = "jd-image-zoom__image";
    this.#img.draggable = false;

    this.#outBtn = this.#button(doc, "out", "−"); // −
    this.#valueEl = doc.createElement("span");
    this.#valueEl.className = "jd-image-zoom__value";
    this.#valueEl.setAttribute("role", "status");
    this.#inBtn = this.#button(doc, "in", "+");
    this.#resetBtn = this.#button(doc, "reset", "⟳"); // ⟳

    this.#controls = doc.createElement("div");
    this.#controls.className = "jd-image-zoom__controls";
    this.#controls.append(this.#outBtn, this.#valueEl, this.#inBtn, this.#resetBtn);

    this.append(this.#img, this.#controls);
  }

  #button(doc: Document, kind: string, glyph: string): HTMLButtonElement {
    const b = doc.createElement("button");
    b.type = "button";
    b.className = `jd-image-zoom__button jd-image-zoom__button--${kind}`;
    b.textContent = glyph;
    return b;
  }

  /* ── 수명주기 ─────────────────────────────────────────────── */

  protected override connected(): void {
    this.#offs.push(
      // React가 passive로 위임해 취소가 먹히지 않던 자리 — 직접 non-passive로 붙인다
      on(this, "wheel", this.#onWheel as (e: never) => void, { passive: false }),
      on(this, "dblclick", this.#onDoubleClick),
      on(this, "pointerdown", this.#onDown as (e: never) => void),
      on(this, "pointermove", this.#onMove as (e: never) => void),
      on(this, "pointerup", this.#onUp as (e: never) => void),
      on(this, "pointercancel", this.#onUp as (e: never) => void),
      on(this.#outBtn, "click", this.#onZoomOut),
      on(this.#inBtn, "click", this.#onZoomIn),
      on(this.#resetBtn, "click", this.#onReset),
    );
    // 키는 **호스트 자신이 포커스일 때만** 듣는다. 컨트롤 버튼에서 올라온 keydown까지
    // 삼키면 Enter가 버튼 클릭 대신 줌 토글이 되어 버튼이 죽는다 —
    // 그래서 createHotkeys의 자동 preventDefault도 끄고 직접 부른다.
    const self =
      (fn: () => void) =>
      (e: KeyboardEvent): void => {
        if (e.target !== this) return;
        e.preventDefault();
        fn();
      };
    this.own(
      createKeyHandler(
        this,
        {
          arrowleft: self(() => this.#pan(-PAN_STEP, 0)),
          arrowright: self(() => this.#pan(PAN_STEP, 0)),
          arrowup: self(() => this.#pan(0, -PAN_STEP)),
          arrowdown: self(() => this.#pan(0, PAN_STEP)),
          "shift+arrowup": self(() => this.zoomIn()),
          "shift+arrowdown": self(() => this.zoomOut()),
          "0": self(() => this.reset()),
          enter: self(() => this.#toggleZoom()),
          space: self(() => this.#toggleZoom()),
        },
        { preventDefault: false },
      ),
    );
    this.requestUpdate(); // 재부모화 생존 규율(DEC-031-1)
  }

  protected override disconnected(): void {
    for (const off of this.#offs) off();
    this.#offs = [];
    this.#drag = null;
  }

  protected override update(): void {
    if (this.src) {
      if (this.#img.getAttribute("src") !== this.src) this.#img.setAttribute("src", this.src);
    } else if (this.#img.hasAttribute("src")) {
      this.#img.removeAttribute("src");
    }
    this.#img.alt = this.alt;
    if (this.ratio) this.style.setProperty("--_jd-zoom-ratio", this.ratio);
    else this.style.removeProperty("--_jd-zoom-ratio");

    const scale = this.#clampScale(this.scale);
    if (scale <= 1) {
      this.#x = 0;
      this.#y = 0;
    }
    this.toggleAttribute("data-zoomed", scale > 1);
    this.#valueEl.textContent = `${scale.toFixed(1)}x`;
    this.#outBtn.setAttribute("aria-label", this.zoomOutLabel);
    this.#inBtn.setAttribute("aria-label", this.zoomInLabel);
    this.#resetBtn.setAttribute("aria-label", this.resetLabel);
    this.#outBtn.disabled = scale <= this.minZoom;
    this.#inBtn.disabled = scale >= this.maxZoom;
    if (!this.hasAttribute("aria-label")) {
      this.setAttribute("aria-label", this.alt ? `${this.alt} — 확대 보기` : "이미지 확대 보기");
    }
    this.#applyTransform(scale);
  }

  /* ── 상태 ────────────────────────────────────────────────── */

  #clampScale(v: number): number {
    const min = Number.isFinite(this.minZoom) ? this.minZoom : 1;
    const max = Number.isFinite(this.maxZoom) ? this.maxZoom : 4;
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    if (!Number.isFinite(v)) return lo;
    return Math.max(lo, Math.min(hi, v));
  }

  /** 확대 배율이 허용하는 만큼만 이동 — v2는 한계가 없어 이미지를 잃어버릴 수 있었다 */
  #clampPan(scale: number): void {
    const rect = this.getBoundingClientRect();
    const maxX = (Math.max(scale, 1) - 1) * rect.width * 0.5;
    const maxY = (Math.max(scale, 1) - 1) * rect.height * 0.5;
    this.#x = Math.max(-maxX, Math.min(maxX, this.#x));
    this.#y = Math.max(-maxY, Math.min(maxY, this.#y));
  }

  #applyTransform(scale = this.#clampScale(this.scale)): void {
    this.#clampPan(scale);
    this.style.setProperty("--_jd-zoom-scale", String(scale));
    this.style.setProperty("--_jd-zoom-x", `${this.#x}px`);
    this.style.setProperty("--_jd-zoom-y", `${this.#y}px`);
  }

  /** 배율 확정 — 실제로 변할 때만 jd-change */
  #setScale(next: number): void {
    const scale = this.#clampScale(next);
    if (scale === this.scale) return;
    this.scale = scale; // → update()가 전이 반영
    this.emit("jd-change", { scale });
  }

  #pan(dx: number, dy: number): void {
    if (this.#clampScale(this.scale) <= 1) return; // 확대되지 않았으면 이동할 것이 없다
    this.#x += dx;
    this.#y += dy;
    this.#applyTransform();
  }

  #toggleZoom(): void {
    this.#setScale(this.#clampScale(this.scale) > 1 ? 1 : 2);
  }

  /* ── 공개 표면 ────────────────────────────────────────────── */

  zoomIn(): void {
    this.#setScale(this.#clampScale(this.scale) + this.step);
  }

  zoomOut(): void {
    this.#setScale(this.#clampScale(this.scale) - this.step);
  }

  /** 배율·이동을 함께 되돌린다 */
  reset(): void {
    this.#x = 0;
    this.#y = 0;
    this.#applyTransform(this.#clampScale(1));
    this.#setScale(1);
  }

  /* ── 핸들러 ──────────────────────────────────────────────── */

  #onWheel = (e: WheelEvent): void => {
    const current = this.#clampScale(this.scale);
    const next = this.#clampScale(current - e.deltaY * 0.005);
    // 배율이 실제로 변할 때만 스크롤을 삼킨다 — 한계에 닿으면 페이지가 계속 스크롤된다
    if (next === current) return;
    e.preventDefault();
    this.#setScale(next);
  };

  #onDoubleClick = (): void => {
    this.#toggleZoom();
  };

  #onDown = (e: PointerEvent): void => {
    if (this.#clampScale(this.scale) <= 1) return;
    if (e.button !== undefined && e.button !== 0) return;
    // 컨트롤 버튼 위에서 시작한 포인터는 드래그가 아니다
    if (this.#controls.contains(e.target as Node)) return;
    this.#drag = { x: e.clientX - this.#x, y: e.clientY - this.#y };
    this.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  #onMove = (e: PointerEvent): void => {
    const drag = this.#drag;
    if (!drag) return;
    this.#x = e.clientX - drag.x;
    this.#y = e.clientY - drag.y;
    this.#applyTransform();
  };

  #onUp = (e: PointerEvent): void => {
    if (!this.#drag) return;
    this.#drag = null;
    if (this.hasPointerCapture(e.pointerId)) this.releasePointerCapture(e.pointerId);
  };

  #onZoomIn = (): void => {
    this.zoomIn();
  };

  #onZoomOut = (): void => {
    this.zoomOut();
  };

  #onReset = (): void => {
    this.reset();
  };
}
