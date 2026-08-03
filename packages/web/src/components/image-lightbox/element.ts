/**
 * <jd-image-lightbox> — 썸네일을 눌러 전체 화면으로 확대해 보는 라이트박스
 * (v2 composites/ImageLightbox) = **jd-modal 파생**(§6 R12 · DEC-033-1).
 *
 * v2는 오버레이를 손수 만들었다 — `createPortal` + 자체 ESC 리스너 +
 * `document.body.style.overflow = "hidden"`. jd-modal이 이미 그 셋을 전부 갖고 있고
 * **v2에 없던 것**까지 갖고 있으므로 상속으로 끝난다:
 *  1. **포커스 감금과 복귀.** v2는 오버레이가 열려도 포커스가 뒤 페이지에 남아 Tab이
 *     썸네일 목록을 계속 훑었고, 닫은 뒤 포커스가 어디로 갈지도 정해져 있지 않았다.
 *  2. **닫기 요청을 막을 수 있다** — `jd-request-close`(cancelable).
 *  3. **스크롤 락 복원이 정확하다.** v2는 닫을 때 `overflow = ""`로 되돌려, 원래
 *     `overflow`가 지정돼 있던 페이지에서는 그 값을 지워 버렸다.
 *  4. **재연결 복원** — 열린 채로 DOM을 옮겨도 상태가 유지된다.
 *
 * 구조 규약: 호스트의 children은 **썸네일(트리거)**이다 — 확대될 내용이 아니다.
 * 그래서 모달 골격을 세우기 **전에** children을 트리거 버튼으로 떼어 두고, 패널에는
 * 라이트박스가 자기 내용(줌 컨트롤 + 확대 이미지)을 채운다. children이 없으면 v2처럼
 * `src`로 썸네일을 만든다.
 *
 * 확대 배율은 v2와 같이 0.5~3(0.5씩). 이미지 자체는 클릭해도 닫히지 않고, 패널의
 * 빈 곳을 누르면 닫힌다(v2 stopPropagation 동형).
 */
import { JdModal } from "../modal/element.js";
import { adoptStyles } from "../../core/styles.js";
import { on } from "../../behaviors/input.js";
import imageLightboxStyles from "./image-lightbox.css.js";

export class JdImageLightbox extends JdModal {
  static override tag = "jd-image-lightbox";
  static override props = {
    ...JdModal.props,
    src: { type: String },
    alt: { type: String },
    /** 현재 배율 — 열 때마다 1로 되돌아간다(v2 동형) */
    scale: { type: Number, default: 1 },
    minScale: { type: Number, default: 0.5 },
    maxScale: { type: Number, default: 3 },
    step: { type: Number, default: 0.5 },
    zoomInLabel: { type: String, default: "확대" },
    zoomOutLabel: { type: String, default: "축소" },
    closeLabel: { type: String, default: "닫기" },
  };

  declare src: string;
  declare alt: string;
  declare scale: number;
  declare minScale: number;
  declare maxScale: number;
  declare step: number;
  declare zoomInLabel: string;
  declare zoomOutLabel: string;
  declare closeLabel: string;

  #trigger!: HTMLButtonElement;
  #thumb: HTMLImageElement | null = null;
  #panelEl!: HTMLElement;
  #figure!: HTMLImageElement;
  #outBtn!: HTMLButtonElement;
  #inBtn!: HTMLButtonElement;
  #closeBtn!: HTMLButtonElement;
  #offs: Array<() => void> = [];

  /* ── 골격 ────────────────────────────────────────────────── */

  protected override render(): void {
    const doc = this.ownerDocument;
    // 트리거는 모달 골격 구축 **전에** 호스트에서 떼어낸다 —
    // 그러지 않으면 jd-modal의 render()가 썸네일을 패널 안으로 옮겨 버린다.
    let trigger = this.querySelector<HTMLButtonElement>(":scope > .jd-image-lightbox__trigger");
    if (!trigger) {
      trigger = doc.createElement("button");
      trigger.type = "button";
      trigger.className = "jd-image-lightbox__trigger";
      trigger.append(...this.childNodes);
    }
    trigger.remove();

    super.render(); // 백드롭 + 패널(빈 호스트라 패널도 빈다)
    adoptStyles(imageLightboxStyles);

    this.prepend(trigger);
    this.#trigger = trigger;
    // children이 없으면 v2처럼 src로 썸네일을 만든다
    this.#thumb = trigger.querySelector<HTMLImageElement>(".jd-image-lightbox__thumb");
    if (!this.#thumb && !trigger.firstElementChild && !trigger.textContent?.trim()) {
      this.#thumb = doc.createElement("img");
      this.#thumb.className = "jd-image-lightbox__thumb";
      this.#thumb.loading = "lazy";
      trigger.append(this.#thumb);
    }

    this.#mountPanel();
    this.update();
  }

  #mountPanel(): void {
    const doc = this.ownerDocument;
    this.#panelEl = this.querySelector<HTMLElement>(":scope > .jd-modal__panel")!;
    const figure = this.#panelEl.querySelector<HTMLImageElement>(".jd-image-lightbox__figure");
    if (figure) {
      this.#figure = figure;
      this.#outBtn = this.#panelEl.querySelector<HTMLButtonElement>(
        ".jd-image-lightbox__zoom-out",
      )!;
      this.#inBtn = this.#panelEl.querySelector<HTMLButtonElement>(".jd-image-lightbox__zoom-in")!;
      this.#closeBtn = this.#panelEl.querySelector<HTMLButtonElement>(".jd-image-lightbox__close")!;
      return;
    }
    const zoom = doc.createElement("div");
    zoom.className = "jd-image-lightbox__zoom";
    this.#outBtn = this.#zoomButton(doc, "zoom-out", "−"); // −
    this.#inBtn = this.#zoomButton(doc, "zoom-in", "+");
    this.#closeBtn = this.#zoomButton(doc, "close", "×"); // ×
    zoom.append(this.#outBtn, this.#inBtn, this.#closeBtn);

    this.#figure = doc.createElement("img");
    this.#figure.className = "jd-image-lightbox__figure";
    this.#figure.loading = "lazy";
    this.#figure.draggable = false;

    this.#panelEl.append(zoom, this.#figure);
  }

  #zoomButton(doc: Document, kind: string, glyph: string): HTMLButtonElement {
    const b = doc.createElement("button");
    b.type = "button";
    b.className = `jd-image-lightbox__button jd-image-lightbox__${kind}`;
    b.textContent = glyph;
    return b;
  }

  /* ── 수명주기 ─────────────────────────────────────────────── */

  protected override connected(): void {
    super.connected(); // 포커스 트랩 등록 + 열림 상태 복원
    this.#offs.push(
      on(this.#trigger, "click", this.#onTriggerClick),
      on(this.#outBtn, "click", this.#onZoomOut),
      on(this.#inBtn, "click", this.#onZoomIn),
      on(this.#closeBtn, "click", this.#onCloseClick),
      // 패널의 빈 곳(=이미지·컨트롤 밖)을 누르면 닫힌다. 백드롭은 패널 아래에 깔려
      // 있어 클릭이 닿지 않으므로 여기가 v2의 배경 클릭 자리다.
      on(this.#panelEl, "click", this.#onPanelClick),
    );
  }

  protected override disconnected(): void {
    for (const off of this.#offs) off();
    this.#offs = [];
    super.disconnected();
  }

  protected override update(): void {
    super.update();
    // jd-modal의 render()가 골격 도중 update()를 부른다 — 아직 우리 패널이 없다
    // (jd-drawer와 같은 가드).
    if (!this.#figure) return;
    const scale = this.#clampScale(this.scale);
    this.style.setProperty("--_jd-lightbox-scale", String(scale));

    if (this.src) {
      if (this.#figure.getAttribute("src") !== this.src) this.#figure.setAttribute("src", this.src);
      if (this.#thumb && this.#thumb.getAttribute("src") !== this.src) {
        this.#thumb.setAttribute("src", this.src);
      }
    }
    this.#figure.alt = this.alt;
    if (this.#thumb) this.#thumb.alt = ""; // 트리거 버튼이 접근 이름을 갖는다
    this.#trigger.setAttribute("aria-label", this.alt || "이미지 확대");
    this.#trigger.setAttribute("aria-haspopup", "dialog");
    this.#trigger.setAttribute("aria-expanded", String(this.open));

    this.#outBtn.setAttribute("aria-label", this.zoomOutLabel);
    this.#inBtn.setAttribute("aria-label", this.zoomInLabel);
    this.#closeBtn.setAttribute("aria-label", this.closeLabel);
    this.#outBtn.disabled = scale <= this.minScale;
    this.#inBtn.disabled = scale >= this.maxScale;
    this.#panelEl.setAttribute("aria-label", this.alt || "이미지 확대 보기");
  }

  /* ── 상태 ────────────────────────────────────────────────── */

  #clampScale(v: number): number {
    const lo = Math.min(this.minScale, this.maxScale);
    const hi = Math.max(this.minScale, this.maxScale);
    if (!Number.isFinite(v)) return 1;
    return Math.max(lo, Math.min(hi, v));
  }

  #setScale(next: number): void {
    const scale = this.#clampScale(next);
    if (scale === this.scale) return;
    this.scale = scale;
    this.emit("jd-change", { scale });
  }

  /** 배율을 1로 되돌리고 연다(v2 handleOpen 동형) */
  override showModal(): void {
    this.scale = 1;
    this.open = true;
  }

  zoomIn(): void {
    this.#setScale(this.#clampScale(this.scale) + this.step);
  }

  zoomOut(): void {
    this.#setScale(this.#clampScale(this.scale) - this.step);
  }

  /* ── 핸들러 ──────────────────────────────────────────────── */

  #onTriggerClick = (): void => {
    this.showModal();
  };

  #onZoomIn = (): void => {
    this.zoomIn();
  };

  #onZoomOut = (): void => {
    this.zoomOut();
  };

  #onCloseClick = (): void => {
    this.close();
  };

  #onPanelClick = (e: Event): void => {
    if (e.target === this.#panelEl) this.close();
  };
}
