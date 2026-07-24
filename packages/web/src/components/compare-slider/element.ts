/**
 * <jd-compare-slider> — 두 이미지를 좌/우로 갈라 비교하는 슬라이더
 * (v2 composites/CompareSlider)이자 <jd-image-compare>의 **원형**(§6 R12).
 *
 * v2의 CompareSlider와 ImageCompare는 같은 위젯을 두 번 만든 것이었다 — 둘 다
 * `clipPath: inset(0 {100-x}% 0 0)` + 손잡이 드래그이고, 다른 것은 (a) 종횡비 고정
 * 여부, (b) object-fit, (c) 라벨 문구/토글, (d) 키보드 지원 여부뿐이다. 로직은
 * 이 원형이 갖고 파생은 **소스 매핑과 스킨만** 재정의한다.
 *
 * 좌우 배치 규약: **왼쪽(잘리는 쪽) = before, 오른쪽(바탕) = after**. v2 CompareSlider가
 * 그랬고, v2 ImageCompare는 같은 배치에 이름만 반대로 붙어 있었다(왼쪽이 afterSrc).
 * 원형은 배치를 고정하고, 이름 대응은 파생이 protected 게터로 뒤집는다.
 *
 * v2 대비 실질 개선 4건:
 *  1. **키보드로 조작할 수 있다.** v2 CompareSlider는 컨테이너에 `role="slider"`와
 *     `tabIndex={0}`을 붙여 놓고 **키 핸들러가 없었다** — AT에는 슬라이더라고 알리면서
 *     화살표에 아무 반응도 하지 않는, 접근성상 가장 나쁜 조합이다. v3는 role을 실제
 *     조작 대상인 손잡이로 옮기고 ←/→(step) · PageUp/Down(10) · Home/End를 붙인다.
 *  2. **손잡이를 놓치지 않는다.** v2는 mousemove/mouseup을 컨테이너에 걸고
 *     `onMouseLeave`로 드래그를 끝냈다 — 빨리 끌면 손을 떼기도 전에 멈춘다.
 *     v3는 pointerdown에서 setPointerCapture(펜·터치 포함).
 *  3. **터치가 드래그일 때만 반응한다.** v2는 `onTouchMove`만 있어 손잡이를 잡지
 *     않고 이미지 위를 훑기만 해도 분할선이 따라왔다.
 *  4. **이미지가 통짜로 드래그되지 않는다** — `draggable=false` + `user-select:none`은
 *     v2도 일부 가졌지만 클립 레이어 쪽에는 없었다.
 *
 * 이벤트: 드래그 중 `jd-input`({position}) · 확정 시 `jd-change`({position}).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { on, createKeyHandler } from "../../behaviors/input.js";
import compareSliderStyles from "./compare-slider.css.js";

/** DEC-030-1: SVG는 innerHTML 재파싱만이 SVG 네임스페이스를 만든다 */
const GRIP_SVG =
  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<path d="M4.5 5L2.5 7L4.5 9M9.5 5L11.5 7L9.5 9" stroke="currentColor" stroke-width="1.5" ` +
  `stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export class JdCompareSlider extends JdElement {
  static override tag = "jd-compare-slider";
  static override props = {
    /**
     * 왼쪽(잘리는 쪽) 이미지. v2 프롭명은 `before`였지만 **`before`/`after`는
     * `ChildNode`의 메서드**라 커스텀 엘리먼트에서 프로퍼티로 쓸 수 없다 —
     * DOM이 이미 소유한 이름이다(iOS 트랙의 UIControl 이름 충돌 규칙과 같은 계열).
     */
    beforeSrc: { type: String },
    /** 오른쪽(바탕) 이미지 */
    afterSrc: { type: String },
    beforeLabel: { type: String, default: "Before" },
    afterLabel: { type: String, default: "After" },
    /**
     * 분할 위치(%). v2 `initialPosition`/`initialSplit`이 이 자리다 — React의 "초기값"은
     * 비제어 시드였지만 CE에서는 attribute가 초기값이고 이후 살아 있는 상태다.
     * 드래그마다 attribute로 되쓰지는 않는다(포인터 이동마다 DOM이 요동친다).
     */
    position: { type: Number, default: 50 },
    /** 화살표 1회 이동량(%p) */
    step: { type: Number, default: 2 },
    /** 라벨 숨김 — v2 ImageCompare `showLabels`의 불리언 attribute 대응(존재=숨김) */
    hideLabels: { type: Boolean, reflect: true },
    /** 손잡이 접근 이름 */
    label: { type: String, default: "이미지 비교" },
  };

  declare beforeSrc: string;
  declare afterSrc: string;
  declare beforeLabel: string;
  declare afterLabel: string;
  declare position: number;
  declare step: number;
  declare hideLabels: boolean;
  declare label: string;

  protected baseImg!: HTMLImageElement;
  protected clipImg!: HTMLImageElement;
  protected clipEl!: HTMLElement;
  protected startLabelEl!: HTMLElement;
  protected endLabelEl!: HTMLElement;
  protected handle!: HTMLElement;
  protected offs: Array<() => void> = [];

  #dragging = false;

  /* ── 소스 매핑(파생이 뒤집는 지점) ─────────────────────────── */

  /** 왼쪽 = 잘리는 쪽 */
  protected get startSrc(): string {
    return this.beforeSrc;
  }
  protected get endSrc(): string {
    return this.afterSrc;
  }
  protected get startAlt(): string {
    return this.beforeLabel;
  }
  protected get endAlt(): string {
    return this.afterLabel;
  }
  protected get startLabel(): string {
    return this.beforeLabel;
  }
  protected get endLabel(): string {
    return this.afterLabel;
  }

  /* ── 골격 ────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(compareSliderStyles);
    const handle = this.querySelector<HTMLElement>(":scope > .jd-compare-slider__handle");
    if (handle) {
      // 입양 규칙(§3.3)
      this.handle = handle;
      this.baseImg = this.querySelector<HTMLImageElement>(".jd-compare-slider__image--end")!;
      this.clipEl = this.querySelector<HTMLElement>(":scope > .jd-compare-slider__clip")!;
      this.clipImg = this.querySelector<HTMLImageElement>(".jd-compare-slider__image--start")!;
      this.startLabelEl = this.querySelector<HTMLElement>(".jd-compare-slider__label--start")!;
      this.endLabelEl = this.querySelector<HTMLElement>(".jd-compare-slider__label--end")!;
    } else {
      this.#build();
    }
    this.handle.setAttribute("role", "slider");
    this.handle.setAttribute("aria-orientation", "horizontal");
    this.handle.setAttribute("aria-valuemin", "0");
    this.handle.setAttribute("aria-valuemax", "100");
    if (!this.handle.hasAttribute("tabindex")) this.handle.tabIndex = 0;
    this.update();
  }

  #build(): void {
    const doc = this.ownerDocument;
    this.baseImg = doc.createElement("img");
    this.baseImg.className = "jd-compare-slider__image jd-compare-slider__image--end";
    this.baseImg.draggable = false;

    this.clipImg = doc.createElement("img");
    this.clipImg.className = "jd-compare-slider__image jd-compare-slider__image--start";
    this.clipImg.draggable = false;
    this.clipEl = doc.createElement("div");
    this.clipEl.className = "jd-compare-slider__clip";
    this.clipEl.append(this.clipImg);

    this.startLabelEl = doc.createElement("span");
    this.startLabelEl.className = "jd-compare-slider__label jd-compare-slider__label--start";
    this.endLabelEl = doc.createElement("span");
    this.endLabelEl.className = "jd-compare-slider__label jd-compare-slider__label--end";

    this.handle = doc.createElement("div");
    this.handle.className = "jd-compare-slider__handle";
    const grip = doc.createElement("span");
    grip.className = "jd-compare-slider__grip";
    grip.innerHTML = GRIP_SVG;
    this.handle.append(grip);

    this.append(this.baseImg, this.clipEl, this.startLabelEl, this.endLabelEl, this.handle);
  }

  /* ── 수명주기 ─────────────────────────────────────────────── */

  protected override connected(): void {
    this.offs.push(
      on(this, "pointerdown", this.#onDown as (e: never) => void),
      on(this, "pointermove", this.#onMove as (e: never) => void),
      on(this, "pointerup", this.#onUp as (e: never) => void),
      on(this, "pointercancel", this.#onUp as (e: never) => void),
    );
    // 손잡이에 포커스가 있을 때만 도는 요소 스코프 핸들러 (APG Slider)
    this.own(
      createKeyHandler(this.handle, {
        arrowleft: () => this.#nudge(-this.step),
        arrowright: () => this.#nudge(this.step),
        arrowup: () => this.#nudge(this.step),
        arrowdown: () => this.#nudge(-this.step),
        pageup: () => this.#nudge(10),
        pagedown: () => this.#nudge(-10),
        home: () => this.#commit(0),
        end: () => this.#commit(100),
      }),
    );
    this.requestUpdate(); // 재부모화 생존 규율(DEC-031-1)
  }

  protected override disconnected(): void {
    for (const off of this.offs) off();
    this.offs = [];
    this.#dragging = false;
  }

  protected override update(): void {
    const pos = this.#clamp(this.position);
    this.style.setProperty("--_jd-compare-pos", `${pos}%`);

    this.#applySrc(this.baseImg, this.endSrc, this.endAlt);
    this.#applySrc(this.clipImg, this.startSrc, this.startAlt);

    this.startLabelEl.textContent = this.startLabel;
    this.endLabelEl.textContent = this.endLabel;
    this.startLabelEl.hidden = this.hideLabels || !this.startLabel;
    this.endLabelEl.hidden = this.hideLabels || !this.endLabel;

    this.handle.setAttribute("aria-valuenow", String(Math.round(pos)));
    this.handle.setAttribute(
      "aria-valuetext",
      `${this.startLabel} ${Math.round(pos)}% / ${this.endLabel} ${100 - Math.round(pos)}%`,
    );
    if (this.label) this.handle.setAttribute("aria-label", this.label);
    else this.handle.removeAttribute("aria-label");
  }

  /** src를 **달라졌을 때만** 쓴다 — 매번 쓰면 이미지가 다시 로드된다 */
  #applySrc(img: HTMLImageElement, src: string, alt: string): void {
    if (src) {
      if (img.getAttribute("src") !== src) img.setAttribute("src", src);
    } else if (img.hasAttribute("src")) {
      img.removeAttribute("src");
    }
    img.alt = alt;
  }

  /* ── 상태 ────────────────────────────────────────────────── */

  #clamp(v: number): number {
    if (!Number.isFinite(v)) return 50;
    return Math.max(0, Math.min(100, v));
  }

  #nudge(delta: number): void {
    this.#commit(this.position + delta);
  }

  /** 확정 변경 — 값이 실제로 움직였을 때만 jd-change */
  #commit(next: number): void {
    const pos = this.#clamp(next);
    if (pos === this.position) return;
    this.position = pos;
    this.emit("jd-change", { position: pos });
  }

  /** 포인터 x → 분할 % */
  #fromClientX(clientX: number): number | null {
    const rect = this.getBoundingClientRect();
    if (rect.width <= 0) return null; // 접힌 컨테이너 — 0 나눗셈 방지
    return this.#clamp(((clientX - rect.left) / rect.width) * 100);
  }

  #onDown = (e: PointerEvent): void => {
    if (e.button !== undefined && e.button !== 0) return; // 보조 버튼 무시
    const pos = this.#fromClientX(e.clientX);
    if (pos === null) return;
    this.#dragging = true;
    this.setPointerCapture(e.pointerId); // 호스트를 벗어나도 드래그가 이어진다
    e.preventDefault(); // 이미지 드래그·텍스트 선택 방지
    if (pos !== this.position) {
      this.position = pos;
      this.emit("jd-input", { position: pos });
    }
  };

  #onMove = (e: PointerEvent): void => {
    if (!this.#dragging) return;
    const pos = this.#fromClientX(e.clientX);
    if (pos === null || pos === this.position) return;
    this.position = pos;
    this.emit("jd-input", { position: pos });
  };

  #onUp = (e: PointerEvent): void => {
    if (!this.#dragging) return;
    this.#dragging = false;
    if (this.hasPointerCapture(e.pointerId)) this.releasePointerCapture(e.pointerId);
    this.emit("jd-change", { position: this.position });
  };

  override focus(options?: FocusOptions): void {
    this.handle?.focus(options);
  }
}
