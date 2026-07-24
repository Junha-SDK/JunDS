/**
 * <jd-photo-lightbox> — 풀스크린 사진 뷰어 (v2 composites/PhotoLightbox) = **jd-modal 파생**.
 *
 * v2는 `role="dialog" aria-modal="true"`를 손으로 붙인 맨 div였다. 그래서 이름만 다이얼로그고
 * 실제로는 **포커스가 뒤 문서에 그대로 남았다** — Tab을 누르면 라이트박스 뒤의 링크로
 * 빠져나가고, 닫아도 원래 위치로 돌아오지 않았다. body 스크롤도 잠기지 않아 뒤 페이지가
 * 같이 스크롤됐다. jd-modal 파생으로 포커스 감금·복귀·스크롤 락·요청형 닫기
 * (jd-request-close)가 전부 공짜로 붙는다(DEC-033-1 오버레이 축 통합).
 *
 * 사진 입력 2경로(§1.3 — 복합 데이터는 attribute 금지): `photos` 프로퍼티 또는 자식
 * `<script type="application/json">[…]</script>` 슬롯(DEC-023-3 선례). 슬롯은
 * **super.render() 전에** 소비한다 — 기반이 children을 패널로 옮기기 때문(jd-action-sheet 선례).
 *
 * v2 대비 교정 5건:
 *  1. 포커스 감금·복귀 신설(위).
 *  2. **화살표 키가 문서 전역이었다.** v2는 open일 때 document에 keydown을 걸었지만
 *     입력 요소 위에서도 가로챘다 — behaviors/createKeyHandler는 폼 태그를 기본 제외한다.
 *  3. **이동을 알리지 않았다.** 캡션·카운터를 aria-live 영역으로 묶어 사진이 바뀌면 읽힌다.
 *  4. **다음 사진이 매번 새로 로드됐다.** 인덱스가 바뀌면 이웃 2장을 미리 받는다
 *     (behaviors/preloadImages = v2 useImagePreload). 네트워크는 update()가 아니라
 *     이벤트 경로에서만 건드린다(§3.1-3).
 *  5. **닫기 버튼이 첫 포커스**(data-autofocus) — 트랩의 initialFocus와 맞물린다.
 */
import { JdModal } from "../modal/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createKeyHandler } from "../../behaviors/input.js";
import { preloadImages } from "../../behaviors/document.js";
import photoLightboxStyles from "./photo-lightbox.css.js";

export interface JdLightboxPhoto {
  src: string;
  alt: string;
  caption?: string;
}

const CLOSE_SVG =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ` +
  `aria-hidden="true" focusable="false">` +
  `<path stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>`;
const PREV_SVG =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ` +
  `aria-hidden="true" focusable="false">` +
  `<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>`;
const NEXT_SVG =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ` +
  `aria-hidden="true" focusable="false">` +
  `<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>`;

export class JdPhotoLightbox extends JdModal {
  static override tag = "jd-photo-lightbox";
  static override props = {
    ...JdModal.props,
    /** 현재 사진 (0-base) */
    index: { type: Number, default: 0, reflect: true },
    /** 다이얼로그 접근 이름 (v2 t("ariaPhotoView")) */
    label: { type: String, default: "사진 보기" },
    closeLabel: { type: String, default: "닫기" },
    prevLabel: { type: String, default: "이전 사진" },
    nextLabel: { type: String, default: "다음 사진" },
  };

  declare index: number;
  declare label: string;
  declare closeLabel: string;
  declare prevLabel: string;
  declare nextLabel: string;

  #photos: JdLightboxPhoto[] = [];
  #img: HTMLImageElement | null = null;
  #close: HTMLButtonElement | null = null;
  #prev: HTMLButtonElement | null = null;
  #next: HTMLButtonElement | null = null;
  #caption: HTMLElement | null = null;
  #counter: HTMLElement | null = null;
  /** connected() 이후에만 네트워크를 건드린다 (§3.1-3) */
  #live = false;

  get photos(): JdLightboxPhoto[] {
    return this.#photos;
  }
  set photos(v: JdLightboxPhoto[]) {
    this.#photos = Array.isArray(v) ? v : [];
    if (this.index >= this.#photos.length) this.index = 0; // v2 클램프 이식
    this.requestUpdate();
  }

  get total(): number {
    return this.#photos.length;
  }

  /* ── 골격 ────────────────────────────────────────────────── */

  protected override render(): void {
    this.#readJson(); // 기반이 children을 패널로 옮기기 전에 소비한다
    super.render(); // 백드롭·패널 구축
    adoptStyles(photoLightboxStyles);
    this.#mount();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdLightboxPhoto[];
      if (Array.isArray(parsed)) this.#photos = parsed;
    } catch {
      console.warn("[junds] <jd-photo-lightbox> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /** 입양(§3.3): 패널 안 골격이 온전하면 재사용, 아니면 1회 구축 */
  #mount(): void {
    const panel = this.querySelector<HTMLElement>(":scope > .jd-modal__panel");
    if (!panel) return;
    panel.classList.add("jd-photo-lightbox__panel");
    let figure = panel.querySelector<HTMLElement>(":scope > .jd-photo-lightbox__figure");
    if (!figure) {
      this.#close = this.#button("close", CLOSE_SVG, "jd-photo-lightbox__close");
      this.#close.dataset.autofocus = "";
      this.#close.addEventListener("click", () => this.close());

      figure = document.createElement("figure");
      figure.className = "jd-photo-lightbox__figure";
      const stage = document.createElement("div");
      stage.className = "jd-photo-lightbox__stage";
      this.#prev = this.#button("prev", PREV_SVG, "jd-photo-lightbox__nav");
      this.#next = this.#button("next", NEXT_SVG, "jd-photo-lightbox__nav");
      this.#prev.addEventListener("click", () => this.prev());
      this.#next.addEventListener("click", () => this.next());
      this.#img = document.createElement("img");
      this.#img.className = "jd-photo-lightbox__img";
      this.#img.decoding = "async";
      stage.append(this.#prev, this.#img, this.#next);

      const info = document.createElement("figcaption");
      info.className = "jd-photo-lightbox__info";
      // 사진이 바뀌면 캡션·순번이 읽힌다 — v2는 아무것도 알리지 않았다
      info.setAttribute("aria-live", "polite");
      this.#caption = document.createElement("p");
      this.#caption.className = "jd-photo-lightbox__caption";
      this.#counter = document.createElement("p");
      this.#counter.className = "jd-photo-lightbox__counter";
      info.append(this.#caption, this.#counter);

      figure.append(stage, info);
      panel.append(this.#close, figure);
      return;
    }
    this.#close = panel.querySelector(".jd-photo-lightbox__close");
    this.#prev = figure.querySelector('[data-dir="prev"]');
    this.#next = figure.querySelector('[data-dir="next"]');
    this.#img = figure.querySelector(".jd-photo-lightbox__img");
    this.#caption = figure.querySelector(".jd-photo-lightbox__caption");
    this.#counter = figure.querySelector(".jd-photo-lightbox__counter");
  }

  #button(dir: string, svg: string, className: string): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = className;
    b.dataset.dir = dir;
    b.innerHTML = svg;
    return b;
  }

  /* ── 수명 ────────────────────────────────────────────────── */

  protected override connected(): void {
    super.connected();
    this.#live = true;
    // 폼 태그 위에서는 동작하지 않는다(createHotkeys 기본) — v2 전역 핸들러의 교정
    this.own(
      createKeyHandler(this.ownerDocument, {
        ArrowLeft: () => this.prev(),
        ArrowRight: () => this.next(),
      }),
    );
    this.addEventListener("jd-open", this.#onOpened);
    if (this.open) this.#preloadNeighbors();
  }

  protected override disconnected(): void {
    this.#live = false;
    this.removeEventListener("jd-open", this.#onOpened);
    super.disconnected();
  }

  #onOpened = (): void => {
    this.#preloadNeighbors();
  };

  /* ── 이동 ────────────────────────────────────────────────── */

  /** v2 (i ± 1 + total) % total 동형 — 항상 순환한다 */
  goTo(index: number): void {
    const total = this.total;
    if (total === 0) return;
    const target = ((index % total) + total) % total;
    if (target === this.index) return;
    this.index = target;
    this.emit("jd-change", { index: target, total });
    this.#preloadNeighbors();
  }

  prev(): void {
    if (this.open) this.goTo(this.index - 1);
  }

  next(): void {
    if (this.open) this.goTo(this.index + 1);
  }

  /** 이웃 2장 선로드 (v2 useImagePreload). 이벤트 경로에서만 — update()는 결정적이어야 한다 */
  #preloadNeighbors(): void {
    const total = this.total;
    if (!this.#live || total < 2) return;
    const at = (i: number): string | undefined => this.#photos[((i % total) + total) % total]?.src;
    const urls = [at(this.index + 1), at(this.index - 1)].filter(
      (u): u is string => typeof u === "string" && u.length > 0,
    );
    if (urls.length > 0) void preloadImages(urls, 2);
  }

  /* ── 반영 ────────────────────────────────────────────────── */

  protected override update(): void {
    super.update();
    const img = this.#img;
    if (!img || !this.#caption || !this.#counter) return;

    const panel = this.querySelector<HTMLElement>(":scope > .jd-modal__panel");
    panel?.setAttribute("aria-label", this.label);
    if (this.#close) this.#close.setAttribute("aria-label", this.closeLabel);

    const total = this.total;
    const photo = this.#photos[this.index];
    if (photo?.src) img.src = photo.src;
    else img.removeAttribute("src");
    img.alt = photo?.alt ?? "";
    img.hidden = !photo;

    const many = total > 1;
    if (this.#prev) {
      this.#prev.hidden = !many;
      this.#prev.setAttribute("aria-label", this.prevLabel);
    }
    if (this.#next) {
      this.#next.hidden = !many;
      this.#next.setAttribute("aria-label", this.nextLabel);
    }

    this.#caption.textContent = photo?.caption ?? "";
    this.#caption.hidden = !photo?.caption;
    this.#counter.textContent = many ? `${this.index + 1} / ${total}` : "";
    this.#counter.hidden = !many;
  }
}
