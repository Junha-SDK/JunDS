/**
 * <jd-signature-pad> — 포인터로 서명을 그리는 캔버스 + 지우기·저장 (v2 composites/SignaturePad).
 *
 * v2 대비 실질 개선 4건:
 *  1. **Pointer Events 단일 경로**: v2는 mouse·touch 핸들러 두 벌을 달았고 캔버스 밖으로
 *     나가면 획이 끊겼다. v3는 pointerdown에서 setPointerCapture — 밖으로 나갔다
 *     돌아와도 한 획이 이어지고 펜 입력도 그대로 동작한다.
 *  2. **DPR 백킹스토어**: v2는 CSS 픽셀 = 백킹 픽셀이라 레티나에서 서명이 뭉갰다.
 *     v3는 connected()에서 devicePixelRatio로 백킹을 키우고 ctx를 스케일한다.
 *     render()는 논리 픽셀만 쓴다 — 프리렌더 스냅샷이 기기와 무관하게 동일(§3.1-3).
 *  3. **탭(점) 획**: v2는 move가 없으면 아무것도 그려지지 않았다(도장 찍듯 누르면 빈 값).
 *  4. **상태 통지**: 서명 유무를 role="status"로 알리고, 버튼 disabled가 실제 의미를
 *     갖는다. v2 aria-label만으로는 캔버스 상태가 AT에 전달되지 않았다.
 *
 * 좌표는 getBoundingClientRect 기준 논리 픽셀 — CSS로 캔버스를 늘려도 어긋나지 않는다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import signaturePadStyles from "./signature-pad.css.js";

const EMPTY_TEXT = "서명이 비어 있습니다";
const FILLED_TEXT = "서명이 입력되었습니다";

export class JdSignaturePad extends JdElement {
  static override tag = "jd-signature-pad";
  static override props = {
    width: { type: Number, default: 400 },
    height: { type: Number, default: 200 },
    /** 선 색. 비우면 캔버스의 currentColor(= --jd-color-foreground) */
    strokeColor: { type: String },
    strokeWidth: { type: Number, default: 2 },
    disabled: { type: Boolean, reflect: true },
    label: { type: String, default: "서명 패드" },
    clearLabel: { type: String, default: "지우기" },
    saveLabel: { type: String, default: "저장" },
  };

  declare width: number;
  declare height: number;
  declare strokeColor: string;
  declare strokeWidth: number;
  declare disabled: boolean;
  declare label: string;
  declare clearLabel: string;
  declare saveLabel: string;

  #canvas!: HTMLCanvasElement;
  #clearBtn!: HTMLButtonElement;
  #saveBtn!: HTMLButtonElement;
  #status!: HTMLParagraphElement;
  #ctx: CanvasRenderingContext2D | null = null;
  #dpr = 1; // connected()에서 실제 값으로 승격 — render()는 항상 1(결정적)
  #drawing = false;
  #empty = true;

  /** 아직 아무 획도 없으면 true */
  get empty(): boolean {
    return this.#empty;
  }

  protected render(): void {
    adoptStyles(signaturePadStyles);
    const existing = this.querySelector<HTMLCanvasElement>(".jd-signature-pad__canvas");
    if (existing) {
      this.#canvas = existing;
      this.#clearBtn = this.querySelector<HTMLButtonElement>(".jd-signature-pad__clear")!;
      this.#saveBtn = this.querySelector<HTMLButtonElement>(".jd-signature-pad__save")!;
      this.#status = this.querySelector<HTMLParagraphElement>(".jd-signature-pad__status")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #build(): void {
    this.#canvas = document.createElement("canvas");
    this.#canvas.className = "jd-signature-pad__canvas";

    const actions = document.createElement("div");
    actions.className = "jd-signature-pad__actions";
    this.#clearBtn = document.createElement("button");
    this.#clearBtn.type = "button";
    this.#clearBtn.className = "jd-signature-pad__button jd-signature-pad__clear";
    this.#saveBtn = document.createElement("button");
    this.#saveBtn.type = "button";
    this.#saveBtn.className =
      "jd-signature-pad__button jd-signature-pad__button--primary jd-signature-pad__save";
    actions.append(this.#clearBtn, this.#saveBtn);

    this.#status = document.createElement("p");
    this.#status.className = "jd-signature-pad__status";
    this.#status.setAttribute("role", "status");

    this.append(this.#canvas, actions, this.#status);
  }

  protected override connected(): void {
    // 백킹스토어를 기기 픽셀비로 승격 — render 이후라 프리렌더 결정성과 무관(§3.1-3)
    const dpr = Math.min(Math.max(globalThis.devicePixelRatio || 1, 1), 3);
    if (dpr !== this.#dpr) {
      this.#dpr = dpr;
      this.requestUpdate();
    }
    this.#canvas.addEventListener("pointerdown", this.#onPointerDown);
    this.#canvas.addEventListener("pointermove", this.#onPointerMove);
    this.#canvas.addEventListener("pointerup", this.#onPointerUp);
    this.#canvas.addEventListener("pointercancel", this.#onPointerUp);
    this.#clearBtn.addEventListener("click", this.#onClear);
    this.#saveBtn.addEventListener("click", this.#onSave);
  }

  protected override disconnected(): void {
    this.#canvas?.removeEventListener("pointerdown", this.#onPointerDown);
    this.#canvas?.removeEventListener("pointermove", this.#onPointerMove);
    this.#canvas?.removeEventListener("pointerup", this.#onPointerUp);
    this.#canvas?.removeEventListener("pointercancel", this.#onPointerUp);
    this.#clearBtn?.removeEventListener("click", this.#onClear);
    this.#saveBtn?.removeEventListener("click", this.#onSave);
    this.#drawing = false;
  }

  protected override update(): void {
    const c = this.#canvas;
    c.style.width = `${this.width}px`;
    c.style.height = `${this.height}px`;
    c.setAttribute("aria-label", this.label);

    // 백킹 크기가 바뀌면 캔버스 내용이 사라진다 — 실제로 달라질 때만 손댄다
    const bw = Math.round(this.width * this.#dpr);
    const bh = Math.round(this.height * this.#dpr);
    if (c.width !== bw || c.height !== bh) {
      c.width = bw;
      c.height = bh;
      this.#context()?.setTransform(this.#dpr, 0, 0, this.#dpr, 0, 0);
      this.#setEmpty(true, false);
    }

    this.#clearBtn.textContent = this.clearLabel;
    this.#saveBtn.textContent = this.saveLabel;
    const locked = this.disabled || this.#empty;
    this.#clearBtn.disabled = locked;
    this.#saveBtn.disabled = locked;
  }

  /** 캔버스를 비운다 (jd-change 발행) */
  clear(): void {
    const ctx = this.#context();
    if (ctx) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
      ctx.restore();
    }
    this.#setEmpty(true, true);
  }

  /** 서명 이미지 데이터 URL (v2 onSave 인자와 동형) */
  toDataURL(type = "image/png", quality?: number): string {
    return this.#canvas.toDataURL(type, quality);
  }

  #context(): CanvasRenderingContext2D | null {
    if (!this.#ctx) this.#ctx = this.#canvas.getContext("2d");
    return this.#ctx;
  }

  #setEmpty(next: boolean, notify: boolean): void {
    if (this.#empty === next) return;
    this.#empty = next;
    this.#status.textContent = next ? EMPTY_TEXT : FILLED_TEXT;
    this.#clearBtn.disabled = this.disabled || next;
    this.#saveBtn.disabled = this.disabled || next;
    if (notify) this.emit("jd-change", { empty: next });
  }

  /** clientX/Y → 캔버스 논리 좌표 (CSS 확대·축소에도 어긋나지 않는다) */
  #pos(e: PointerEvent): { x: number; y: number } {
    const rect = this.#canvas.getBoundingClientRect();
    const sx = rect.width ? this.width / rect.width : 1;
    const sy = rect.height ? this.height / rect.height : 1;
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  }

  #onPointerDown = (e: PointerEvent): void => {
    if (this.disabled) return;
    const ctx = this.#context();
    if (!ctx) return;
    e.preventDefault();
    this.#canvas.setPointerCapture(e.pointerId);
    ctx.strokeStyle = this.strokeColor || getComputedStyle(this.#canvas).color;
    ctx.lineWidth = this.strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const { x, y } = this.#pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y); // 탭만 해도 점이 찍힌다(v2는 빈 획)
    ctx.stroke();
    this.#drawing = true;
    this.#setEmpty(false, false);
  };

  #onPointerMove = (e: PointerEvent): void => {
    if (!this.#drawing) return;
    const ctx = this.#context();
    if (!ctx) return;
    const { x, y } = this.#pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  #onPointerUp = (e: PointerEvent): void => {
    if (!this.#drawing) return;
    this.#drawing = false;
    if (this.#canvas.hasPointerCapture(e.pointerId)) {
      this.#canvas.releasePointerCapture(e.pointerId);
    }
    this.emit("jd-change", { empty: this.#empty });
  };

  #onClear = (): void => {
    this.clear();
  };

  #onSave = (): void => {
    if (this.#empty) return;
    this.emit("jd-save", { dataUrl: this.toDataURL() });
  };
}
