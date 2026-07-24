/**
 * <jd-bottom-sheet> — 아래에서 올라오는 시트 (v2 composites/BottomSheet + Sheet) = Modal 파생.
 *
 * v2는 BottomSheet(정적)와 Sheet(드래그로 닫기)를 따로 뒀지만 표면 차이는
 * **드래그 가능 여부 하나뿐**이었다 — `draggable` 옵트인 하나로 합친다(§6 R12).
 * 드래그는 v2의 touch 전용 구현 대신 pointer 이벤트라 마우스·펜에서도 동작한다.
 */
import { JdModal } from "../modal/element.js";
import { adoptStyles } from "../../core/styles.js";
import bottomSheetStyles from "./bottom-sheet.css.js";

/** v2 DRAG_DISMISS_THRESHOLD */
const DISMISS_PX = 150;

export class JdBottomSheet extends JdModal {
  static override tag = "jd-bottom-sheet";
  static override props = {
    ...JdModal.props,
    /** auto | half | full — v2 heightMap */
    height: { type: String, default: "auto", reflect: true },
    title: { type: String },
    /** 손잡이를 끌어 닫기 (v2 Sheet 동작) */
    draggable: { type: Boolean, reflect: true },
  };

  declare height: string;
  declare title: string;
  declare draggable: boolean;

  #grabber: HTMLElement | null = null;
  #titleEl: HTMLElement | null = null;
  #panelEl: HTMLElement | null = null;
  #startY = 0;
  #dragging = false;

  protected override render(): void {
    super.render();
    adoptStyles(bottomSheetStyles);
    this.#panelEl = this.querySelector<HTMLElement>(":scope > .jd-modal__panel");
    if (this.#panelEl && !this.#panelEl.querySelector(":scope > .jd-bottom-sheet__grabber")) {
      this.#grabber = document.createElement("div");
      this.#grabber.className = "jd-bottom-sheet__grabber";
      this.#grabber.setAttribute("aria-hidden", "true");
      this.#titleEl = document.createElement("h2");
      this.#titleEl.className = "jd-bottom-sheet__title";
      this.#panelEl.prepend(this.#grabber, this.#titleEl);
    } else if (this.#panelEl) {
      this.#grabber = this.#panelEl.querySelector(".jd-bottom-sheet__grabber");
      this.#titleEl = this.#panelEl.querySelector(".jd-bottom-sheet__title");
    }
    this.update();
  }

  protected override connected(): void {
    super.connected?.();
    this.#grabber?.addEventListener("pointerdown", this.#onDown);
    this.#grabber?.addEventListener("pointermove", this.#onMove);
    this.#grabber?.addEventListener("pointerup", this.#onUp);
    this.#grabber?.addEventListener("pointercancel", this.#onUp);
  }

  protected override disconnected(): void {
    super.disconnected?.();
    this.#grabber?.removeEventListener("pointerdown", this.#onDown);
    this.#grabber?.removeEventListener("pointermove", this.#onMove);
    this.#grabber?.removeEventListener("pointerup", this.#onUp);
    this.#grabber?.removeEventListener("pointercancel", this.#onUp);
  }

  #onDown = (e: PointerEvent): void => {
    if (!this.draggable) return;
    this.#dragging = true;
    this.#startY = e.clientY;
    this.#grabber?.setPointerCapture(e.pointerId);
  };

  #onMove = (e: PointerEvent): void => {
    if (!this.#dragging || !this.#panelEl) return;
    const dy = e.clientY - this.#startY;
    if (dy <= 0) return; // 위로는 끌리지 않는다(v2 동형)
    this.#panelEl.style.transform = `translateY(${dy}px)`;
  };

  #onUp = (e: PointerEvent): void => {
    if (!this.#dragging || !this.#panelEl) return;
    this.#dragging = false;
    if (this.#grabber?.hasPointerCapture(e.pointerId)) {
      this.#grabber.releasePointerCapture(e.pointerId);
    }
    const dy = e.clientY - this.#startY;
    this.#panelEl.style.transform = "";
    if (dy > DISMISS_PX) this.close(); // 요청형 닫기 — 소비자가 막을 수 있다
  };

  protected override update(): void {
    super.update();
    if (this.#titleEl) {
      this.#titleEl.textContent = this.title;
      this.#titleEl.hidden = !this.title;
    }
    if (this.title) this.#panelEl?.setAttribute("aria-label", this.title);
    if (this.#grabber) this.#grabber.hidden = !this.draggable && !this.title;
  }
}
