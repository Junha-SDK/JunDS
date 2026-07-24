/**
 * <jd-image-cropper> — 이미지에서 잘라낼 영역을 고르는 크로퍼 (v2 composites/ImageCropper).
 *
 * v2 대비 실질 개선 6건(전부 v2에 실제로 있던 결함이다):
 *  1. **모서리 손잡이가 진짜 손잡이다.** v2는 흰 사각형 4개를 그려 놓고 아무 이벤트도
 *     달지 않았다 — 크기를 바꿀 방법이 아예 없었고(`size`는 50% 고정), 손잡이는
 *     "조절할 수 있다"는 거짓 신호였다.
 *  2. **크롭 상자의 종횡비가 실제로 `aspectRatio`다.** v2는 높이를 `size / aspectRatio`
 *     **%**로 줬는데, %의 기준이 가로는 컨테이너 폭·세로는 컨테이너 높이라 정사각형
 *     이미지가 아닌 한 상자의 비율이 요청값과 달랐다(예: 16:9 사진에 ratio=1이면
 *     상자는 16:9로 늘어졌다). v3는 CSS `aspect-ratio`로 상자를 만든다 — 이 교정으로
 *     v2의 크롭 산식(`sh = sw / aspectRatio`)이 비로소 화면과 일치한다.
 *  3. **미리보기 정렬이 정확하다.** v2는 배경 이미지 + `backgroundPosition`을 %로
 *     계산했는데(`-x / (size/100)`), 배경 % 정렬의 기준이 "컨테이너-이미지 차"라
 *     상자를 옮길수록 어긋났다. v3는 실제 `<img>`를 상자 안에 두고 자기 크기 기준
 *     `translate(-x%, -y%)`로 민다 — 정의상 어긋날 수 없다.
 *  4. **마우스 밖으로 나가도 드래그가 이어진다** — pointerdown + setPointerCapture.
 *     v2는 `onMouseLeave`로 드래그를 끝냈고 터치·펜은 아예 지원하지 않았다.
 *  5. **키보드로 조작할 수 있다** — ←↑→↓(1%p, Shift 10%p) · PageUp/Down(크기 ±5%p) ·
 *     Home(초기화). v2는 마우스 전용이었다.
 *  6. **실패가 보인다.** v2 `handleCrop`은 교차 출처 이미지에서 `toDataURL()`이
 *     SecurityError로 터지면 조용히 죽었다(콜백도 오지 않는다). v3는 `jd-error`.
 *
 * 이벤트: 드래그 중 `jd-input`({x,y,size}) · 확정 시 `jd-change` · 결과는
 * `jd-crop`({ dataUrl }) · 실패는 `jd-error`({ reason }).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { on, createKeyHandler } from "../../behaviors/input.js";
import imageCropperStyles from "./image-cropper.css.js";

type Corner = "nw" | "ne" | "sw" | "se";
type DragMode = "move" | Corner;

interface DragStart {
  mode: DragMode;
  pointerX: number;
  pointerY: number;
  x: number;
  y: number;
  size: number;
  /** 크기 1%p당 세로 %p — 드래그 시작 시점의 실측 비율 */
  hFactor: number;
  frameW: number;
  frameH: number;
}

const CORNERS: Corner[] = ["nw", "ne", "sw", "se"];

export class JdImageCropper extends JdElement {
  static override tag = "jd-image-cropper";
  static override props = {
    src: { type: String },
    alt: { type: String },
    /** 크롭 영역 종횡비(가로/세로). v2 기본 1 */
    aspectRatio: { type: Number, default: 1 },
    /** 크롭 영역 왼쪽 위 좌표와 가로 크기 — 전부 컨테이너 대비 % */
    x: { type: Number, default: 25 },
    y: { type: Number, default: 25 },
    size: { type: Number, default: 50 },
    minSize: { type: Number, default: 10 },
    /** 결과 MIME. v2는 image/png 고정이었다 */
    type: { type: String, default: "image/png" },
    cropLabel: { type: String, default: "자르기" },
    label: { type: String, default: "크롭 영역" },
  };

  declare src: string;
  declare alt: string;
  declare aspectRatio: number;
  declare x: number;
  declare y: number;
  declare size: number;
  declare minSize: number;
  declare type: string;
  declare cropLabel: string;
  declare label: string;

  #frame!: HTMLElement;
  #image!: HTMLImageElement;
  #area!: HTMLElement;
  #preview!: HTMLImageElement;
  #status!: HTMLElement;
  #cropBtn!: HTMLButtonElement;
  #offs: Array<() => void> = [];
  #drag: DragStart | null = null;

  /* ── 골격 ────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(imageCropperStyles);
    const frame = this.querySelector<HTMLElement>(":scope > .jd-image-cropper__frame");
    if (frame) {
      // 입양 규칙(§3.3)
      this.#frame = frame;
      this.#image = frame.querySelector<HTMLImageElement>(".jd-image-cropper__image")!;
      this.#area = frame.querySelector<HTMLElement>(".jd-image-cropper__area")!;
      this.#preview = frame.querySelector<HTMLImageElement>(".jd-image-cropper__preview")!;
      this.#status = this.querySelector<HTMLElement>(":scope > .jd-image-cropper__status")!;
      this.#cropBtn = this.querySelector<HTMLButtonElement>(":scope > .jd-image-cropper__crop")!;
    } else {
      this.#build();
    }
    this.#area.setAttribute("role", "group");
    if (!this.#area.hasAttribute("tabindex")) this.#area.tabIndex = 0;
    this.update();
  }

  #build(): void {
    const doc = this.ownerDocument;
    this.#image = doc.createElement("img");
    this.#image.className = "jd-image-cropper__image";
    this.#image.draggable = false;

    const dim = doc.createElement("div");
    dim.className = "jd-image-cropper__dim";
    dim.setAttribute("aria-hidden", "true");

    this.#preview = doc.createElement("img");
    this.#preview.className = "jd-image-cropper__preview";
    this.#preview.draggable = false;
    this.#preview.alt = ""; // 같은 그림의 확대 사본 — AT에는 중복이다

    this.#area = doc.createElement("div");
    this.#area.className = "jd-image-cropper__area";
    this.#area.append(this.#preview);
    for (const corner of CORNERS) {
      const handle = doc.createElement("span");
      handle.className = "jd-image-cropper__handle";
      handle.dataset.corner = corner;
      this.#area.append(handle);
    }

    this.#frame = doc.createElement("div");
    this.#frame.className = "jd-image-cropper__frame";
    this.#frame.append(this.#image, dim, this.#area);

    this.#status = doc.createElement("p");
    this.#status.className = "jd-image-cropper__status";
    this.#status.setAttribute("role", "status");

    this.#cropBtn = doc.createElement("button");
    this.#cropBtn.type = "button";
    this.#cropBtn.className = "jd-image-cropper__crop";

    this.append(this.#frame, this.#status, this.#cropBtn);
  }

  /* ── 수명주기 ─────────────────────────────────────────────── */

  protected override connected(): void {
    this.#offs.push(
      on(this.#frame, "pointerdown", this.#onDown as (e: never) => void),
      on(this.#frame, "pointermove", this.#onMove as (e: never) => void),
      on(this.#frame, "pointerup", this.#onUp as (e: never) => void),
      on(this.#frame, "pointercancel", this.#onUp as (e: never) => void),
      on(this.#cropBtn, "click", this.#onCropClick),
      // 이미지가 도착해야 세로 비율 실측이 가능하다 — 도착 시 클램프를 다시 건다
      on(this.#image, "load", this.#onImageLoad),
    );
    // 크롭 영역에 포커스가 있을 때만 도는 요소 스코프 핸들러
    this.own(
      createKeyHandler(this.#area, {
        arrowleft: () => this.#nudge(-1, 0),
        arrowright: () => this.#nudge(1, 0),
        arrowup: () => this.#nudge(0, -1),
        arrowdown: () => this.#nudge(0, 1),
        "shift+arrowleft": () => this.#nudge(-10, 0),
        "shift+arrowright": () => this.#nudge(10, 0),
        "shift+arrowup": () => this.#nudge(0, -10),
        "shift+arrowdown": () => this.#nudge(0, 10),
        pageup: () => this.#resizeBy(5),
        pagedown: () => this.#resizeBy(-5),
        home: () => this.#commit(25, 25, 50),
      }),
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
      if (this.#image.getAttribute("src") !== this.src) this.#image.setAttribute("src", this.src);
      if (this.#preview.getAttribute("src") !== this.src) {
        this.#preview.setAttribute("src", this.src);
      }
    } else {
      this.#image.removeAttribute("src");
      this.#preview.removeAttribute("src");
    }
    this.#image.alt = this.alt;
    this.#cropBtn.textContent = this.cropLabel;
    this.#area.setAttribute("aria-label", this.label);

    const rect = this.#clampCrop(this.x, this.y, this.size);
    this.style.setProperty("--_jd-crop-x", String(rect.x));
    this.style.setProperty("--_jd-crop-y", String(rect.y));
    this.style.setProperty("--_jd-crop-size", String(rect.size));
    this.style.setProperty("--_jd-crop-ratio", String(this.#ratio()));
    // 좌표 문구는 role="status" 문단이 갖는다(role="group"에 aria-valuetext는 무효 조합).
    // 드래그 중에는 갱신하지 않는다 — 라이브 리전이 초당 수십 번 말하게 된다.
    if (!this.#status.textContent) this.#announce();
  }

  /* ── 기하 ────────────────────────────────────────────────── */

  #ratio(): number {
    const r = this.aspectRatio;
    return Number.isFinite(r) && r > 0 ? r : 1;
  }

  #floorSize(): number {
    const m = Number.isFinite(this.minSize) ? this.minSize : 10;
    return Math.max(1, Math.min(100, m)); // 0이면 CSS의 100/size 나눗셈이 무효가 된다
  }

  /**
   * 크기 1%p당 세로 %p. 상자는 CSS aspect-ratio로 그려지므로 실측이 정본이고,
   * 아직 그릴 수 없을 때(비표시·이미지 미도착·happy-dom)만 자연 비율로 근사한다.
   */
  #hFactor(): number {
    const frame = this.#frame?.getBoundingClientRect();
    const area = this.#area?.getBoundingClientRect();
    if (frame && area && frame.width > 0 && frame.height > 0 && area.width > 0 && area.height > 0) {
      const sizePct = (area.width / frame.width) * 100;
      if (sizePct > 0) return ((area.height / frame.height) * 100) / sizePct;
    }
    const nw = this.#image?.naturalWidth ?? 0;
    const nh = this.#image?.naturalHeight ?? 0;
    const natural = nw > 0 && nh > 0 ? nw / nh : 1;
    return natural / this.#ratio();
  }

  #clampCrop(
    x: number,
    y: number,
    size: number,
    hFactor = this.#hFactor(),
  ): { x: number; y: number; size: number } {
    const floor = this.#floorSize();
    const ceil = hFactor > 0 ? Math.min(100, 100 / hFactor) : 100;
    const s = Math.max(floor, Math.min(Math.max(floor, ceil), Number.isFinite(size) ? size : 50));
    const h = s * hFactor;
    const cx = Math.max(0, Math.min(Math.max(0, 100 - s), Number.isFinite(x) ? x : 0));
    const cy = Math.max(0, Math.min(Math.max(0, 100 - h), Number.isFinite(y) ? y : 0));
    return { x: cx, y: cy, size: s };
  }

  /* ── 상태 ────────────────────────────────────────────────── */

  #apply(x: number, y: number, size: number, hFactor?: number): boolean {
    const next = this.#clampCrop(x, y, size, hFactor);
    if (next.x === this.x && next.y === this.y && next.size === this.size) return false;
    this.x = next.x;
    this.y = next.y;
    this.size = next.size;
    return true;
  }

  /** 확정 변경 — 상태 문구까지 갱신한다(드래그 중에는 부르지 않는다) */
  #commit(x: number, y: number, size: number): void {
    if (!this.#apply(x, y, size)) return;
    this.#announce();
    this.emit("jd-change", { x: this.x, y: this.y, size: this.size });
  }

  #nudge(dx: number, dy: number): void {
    this.#commit(this.x + dx, this.y + dy, this.size);
  }

  #resizeBy(delta: number): void {
    this.#commit(this.x, this.y, this.size + delta);
  }

  #announce(): void {
    this.#status.textContent =
      `가로 ${Math.round(this.x)}%, 세로 ${Math.round(this.y)}%, ` +
      `크기 ${Math.round(this.size)}%`;
  }

  /* ── 드래그 ──────────────────────────────────────────────── */

  #onDown = (e: PointerEvent): void => {
    if (e.button !== undefined && e.button !== 0) return;
    const target = e.target instanceof Element ? e.target : null;
    const handle = target?.closest<HTMLElement>(".jd-image-cropper__handle") ?? null;
    const inArea = Boolean(target?.closest(".jd-image-cropper__area"));
    if (!handle && !inArea) return; // 상자 밖을 누른 것은 조작이 아니다(v2 동형)
    const frame = this.#frame.getBoundingClientRect();
    if (frame.width <= 0 || frame.height <= 0) return;
    const corner = handle?.dataset.corner as Corner | undefined;
    this.#drag = {
      mode: corner ?? "move",
      pointerX: e.clientX,
      pointerY: e.clientY,
      x: this.x,
      y: this.y,
      size: this.size,
      hFactor: this.#hFactor(),
      frameW: frame.width,
      frameH: frame.height,
    };
    this.#frame.setPointerCapture(e.pointerId); // 프레임 밖으로 나가도 이어진다
    e.preventDefault();
  };

  #onMove = (e: PointerEvent): void => {
    const d = this.#drag;
    if (!d) return;
    const dx = ((e.clientX - d.pointerX) / d.frameW) * 100;
    const dy = ((e.clientY - d.pointerY) / d.frameH) * 100;

    let x = d.x;
    let y = d.y;
    let size = d.size;
    if (d.mode === "move") {
      x = d.x + dx;
      y = d.y + dy;
    } else {
      // 가로 드래그가 크기를 정하고, 세로는 종횡비가 따라온다(비율 고정 크로퍼)
      const grow = d.mode === "ne" || d.mode === "se" ? dx : -dx;
      size = d.size + grow;
      const clamped = this.#clampCrop(d.x, d.y, size, d.hFactor);
      const shrink = d.size - clamped.size;
      size = clamped.size;
      if (d.mode === "nw" || d.mode === "sw") x = d.x + shrink;
      if (d.mode === "nw" || d.mode === "ne") y = d.y + shrink * d.hFactor;
    }
    if (this.#apply(x, y, size, d.hFactor)) {
      this.emit("jd-input", { x: this.x, y: this.y, size: this.size });
    }
  };

  #onUp = (e: PointerEvent): void => {
    if (!this.#drag) return;
    this.#drag = null;
    if (this.#frame.hasPointerCapture(e.pointerId)) this.#frame.releasePointerCapture(e.pointerId);
    this.#announce();
    this.emit("jd-change", { x: this.x, y: this.y, size: this.size });
  };

  #onImageLoad = (): void => {
    // 자연 비율을 알게 되면 세로 클램프가 달라진다 — 다시 건다
    this.requestUpdate();
  };

  /* ── 크롭 ────────────────────────────────────────────────── */

  /**
   * 현재 영역을 잘라 data URL로 돌려준다. 실패(교차 출처 tainted canvas·로드 실패)는
   * reject하지 않고 `jd-error`로 알린 뒤 빈 문자열을 돌려준다 — 버튼 한 번에
   * 처리되지 않은 rejection이 남지 않도록.
   */
  crop(): Promise<string> {
    const src = this.src;
    if (!src) {
      this.emit("jd-error", { reason: "no-src" });
      return Promise.resolve("");
    }
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // 같은 출처면 무해, 교차 출처면 CORS 허용 시 오염 회피
      img.onload = (): void => {
        const nw = img.naturalWidth;
        const nh = img.naturalHeight;
        const sw = (this.size / 100) * nw;
        const sh = sw / this.#ratio();
        if (!(sw > 0) || !(sh > 0) || !(nh > 0)) {
          this.emit("jd-error", { reason: "empty" });
          resolve("");
          return;
        }
        const canvas = this.ownerDocument.createElement("canvas");
        canvas.width = Math.round(sw);
        canvas.height = Math.round(sh);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          this.emit("jd-error", { reason: "no-context" });
          resolve("");
          return;
        }
        ctx.drawImage(img, (this.x / 100) * nw, (this.y / 100) * nh, sw, sh, 0, 0, sw, sh);
        try {
          const dataUrl = canvas.toDataURL(this.type);
          this.emit("jd-crop", { dataUrl });
          resolve(dataUrl);
        } catch {
          // tainted canvas — v2는 여기서 조용히 죽었다(콜백조차 오지 않았다)
          this.emit("jd-error", { reason: "tainted" });
          resolve("");
        }
      };
      img.onerror = (): void => {
        this.emit("jd-error", { reason: "load" });
        resolve("");
      };
      img.src = src;
    });
  }

  override focus(options?: FocusOptions): void {
    this.#area?.focus(options);
  }

  #onCropClick = (): void => {
    void this.crop();
  };
}
