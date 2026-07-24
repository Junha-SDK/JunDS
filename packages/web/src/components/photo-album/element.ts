/**
 * <jd-photo-album> — 사진 앨범 (v2 patterns/PhotoAlbum).
 * 태그 필터 + 반응형 그리드(grid|masonry) + 내장 라이트박스(prev/next/close).
 *
 * 데이터(§1.3): `photos`(배열)는 property 전용 + `<script type="application/json">` 슬롯.
 * 라이트박스는 오버레이지만 앨범의 하위 영역이라 jd-modal 상속이 아니라 내부 구성 —
 *   포커스 감금·복귀는 공용 createFocusTrap(§8, WEB-10)을 재사용하고, 스크롤 락/ESC/
 *   방향키는 모달과 동일 전략으로 붙인다.
 * 이벤트: jd-tag-change{tag} · jd-open{index,id} · jd-close.
 * a11y(v2 개선): 필터 role=radiogroup, 셀 <figure>, 라이트박스 role=dialog+aria-modal,
 *   ← → 방향키 이동·ESC 닫기·포커스 트랩.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createFocusTrap, type FocusTrap } from "../../behaviors/focus-trap.js";
import photoAlbumStyles from "./photo-album.css.js";

export interface JdPhoto {
  id: string;
  src: string;
  alt: string;
  title?: string;
  caption?: string;
  tag?: string;
  likes?: number;
  comments?: number;
}

export class JdPhotoAlbum extends JdElement {
  static override tag = "jd-photo-album";
  static override props = {
    layout: { type: String, default: "masonry", reflect: true }, // masonry | grid
    columns: { type: Number, default: 4, reflect: true },
    title: { type: String },
    emptyTitle: { type: String, default: "사진이 없습니다" }, // attr: empty-title
  };

  declare layout: string;
  declare columns: number;
  declare title: string;
  declare emptyTitle: string;

  #photos: JdPhoto[] = [];
  #dataDirty = true;
  get photos(): JdPhoto[] {
    return this.#photos;
  }
  set photos(v: JdPhoto[]) {
    this.#photos = Array.isArray(v) ? v : [];
    this.#dataDirty = true;
    this.requestUpdate();
  }

  #activeTag: string | null = null;
  #filtered: JdPhoto[] = [];
  #lightboxIndex = -1;
  #trap: FocusTrap | null = null;
  #prevBodyOverflow: string | null = null;

  #titleEl!: HTMLHeadingElement;
  #countEl!: HTMLElement;
  #filters!: HTMLElement;
  #grid!: HTMLElement;
  #empty!: HTMLElement;
  #emptyTitleEl!: HTMLElement;
  #lightbox!: HTMLElement;
  #lbImg!: HTMLImageElement;
  #lbCap!: HTMLElement;
  #lbCounter!: HTMLElement;
  #lbPanel!: HTMLElement;

  protected render(): void {
    adoptStyles(photoAlbumStyles);

    const json = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (json) {
      try {
        const parsed = JSON.parse(json.textContent || "[]") as JdPhoto[];
        if (Array.isArray(parsed)) this.#photos = parsed;
      } catch {
        console.warn("[junds] <jd-photo-album> JSON 슬롯 파싱 실패 — 무시합니다.");
      }
      json.remove();
    }

    if (!this.querySelector(":scope > .jd-photo-album__grid")) this.#build();
    this.#cacheRefs();
    this.update();
  }

  #build(): void {
    const header = document.createElement("header");
    header.className = "jd-photo-album__header";
    header.innerHTML =
      '<h2 class="jd-photo-album__title"></h2>' +
      '<p class="jd-photo-album__count"></p>';

    const filters = document.createElement("div");
    filters.className = "jd-photo-album__filters";
    filters.setAttribute("role", "radiogroup");
    filters.setAttribute("aria-label", "태그 필터");

    const grid = document.createElement("div");
    grid.className = "jd-photo-album__grid";

    const empty = document.createElement("div");
    empty.className = "jd-photo-album__empty";
    empty.hidden = true;
    empty.innerHTML =
      '<div class="jd-photo-album__empty-icon" aria-hidden="true">📷</div>' +
      '<p class="jd-photo-album__empty-title"></p>';

    const lightbox = document.createElement("div");
    lightbox.className = "jd-photo-album__lightbox";
    lightbox.hidden = true;
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "사진 크게 보기");
    lightbox.innerHTML =
      '<div class="jd-photo-album__lb-backdrop" data-lb-close></div>' +
      '<div class="jd-photo-album__lb-panel">' +
      '<button type="button" class="jd-photo-album__lb-close" data-lb-close aria-label="닫기"><span aria-hidden="true">✕</span></button>' +
      '<button type="button" class="jd-photo-album__lb-nav jd-photo-album__lb-prev" data-lb-prev aria-label="이전 사진"><span aria-hidden="true">‹</span></button>' +
      '<figure class="jd-photo-album__lb-figure">' +
      '<img class="jd-photo-album__lb-img" alt="" />' +
      '<figcaption class="jd-photo-album__lb-cap"></figcaption>' +
      "</figure>" +
      '<button type="button" class="jd-photo-album__lb-nav jd-photo-album__lb-next" data-lb-next aria-label="다음 사진"><span aria-hidden="true">›</span></button>' +
      '<p class="jd-photo-album__lb-counter" aria-live="polite"></p>' +
      "</div>";

    this.append(header, filters, grid, empty, lightbox);
  }

  #cacheRefs(): void {
    this.#titleEl = this.querySelector(".jd-photo-album__title")!;
    this.#countEl = this.querySelector(".jd-photo-album__count")!;
    this.#filters = this.querySelector(".jd-photo-album__filters")!;
    this.#grid = this.querySelector(".jd-photo-album__grid")!;
    this.#empty = this.querySelector(".jd-photo-album__empty")!;
    this.#emptyTitleEl = this.querySelector(".jd-photo-album__empty-title")!;
    this.#lightbox = this.querySelector(".jd-photo-album__lightbox")!;
    this.#lbImg = this.querySelector(".jd-photo-album__lb-img")!;
    this.#lbCap = this.querySelector(".jd-photo-album__lb-cap")!;
    this.#lbCounter = this.querySelector(".jd-photo-album__lb-counter")!;
    this.#lbPanel = this.querySelector(".jd-photo-album__lb-panel")!;
    this.setAttribute("role", "region");
    if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", this.title || "사진 앨범");
  }

  protected override connected(): void {
    this.#filters.addEventListener("click", this.#onFilterClick);
    this.#grid.addEventListener("click", this.#onCellClick);
    this.#lightbox.addEventListener("click", this.#onLightboxClick);
    this.#trap = this.own(createFocusTrap(this.#lbPanel));
  }

  protected override disconnected(): void {
    this.#filters.removeEventListener("click", this.#onFilterClick);
    this.#grid.removeEventListener("click", this.#onCellClick);
    this.#lightbox.removeEventListener("click", this.#onLightboxClick);
    if (this.#lightboxIndex >= 0) this.#closeLightbox({ silent: true });
  }

  #onFilterClick = (e: Event): void => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-tag]");
    if (!btn) return;
    const raw = btn.dataset.tag!;
    const tag = raw === "" ? null : raw;
    if (tag === this.#activeTag) return;
    this.#activeTag = tag;
    this.#dataDirty = true;
    this.emit("jd-tag-change", { tag });
    this.requestUpdate();
  };

  #onCellClick = (e: Event): void => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-index]");
    if (!cell) return;
    this.#openLightbox(Number(cell.dataset.index));
  };

  #onLightboxClick = (e: Event): void => {
    const t = e.target as HTMLElement;
    if (t.closest("[data-lb-close]")) this.#closeLightbox();
    else if (t.closest("[data-lb-prev]")) this.#step(-1);
    else if (t.closest("[data-lb-next]")) this.#step(1);
  };

  #onKeydown = (e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      e.stopPropagation();
      this.#closeLightbox();
    } else if (e.key === "ArrowLeft") {
      this.#step(-1);
    } else if (e.key === "ArrowRight") {
      this.#step(1);
    }
  };

  #openLightbox(index: number): void {
    if (index < 0 || index >= this.#filtered.length) return;
    this.#lightboxIndex = index;
    this.#lightbox.hidden = false;
    const doc = this.ownerDocument;
    doc.addEventListener("keydown", this.#onKeydown);
    this.#prevBodyOverflow = doc.body.style.overflow;
    doc.body.style.overflow = "hidden";
    this.#renderLightbox();
    this.#trap?.activate();
    const photo = this.#filtered[index]!;
    this.emit("jd-open", { index, id: photo.id });
  }

  #closeLightbox(opts?: { silent?: boolean }): void {
    if (this.#lightboxIndex < 0) return;
    this.#lightboxIndex = -1;
    this.#lightbox.hidden = true;
    const doc = this.ownerDocument;
    doc.removeEventListener("keydown", this.#onKeydown);
    this.#trap?.deactivate();
    if (this.#prevBodyOverflow !== null) {
      doc.body.style.overflow = this.#prevBodyOverflow;
      this.#prevBodyOverflow = null;
    }
    if (!opts?.silent) this.emit("jd-close");
  }

  #step(delta: number): void {
    if (this.#lightboxIndex < 0 || this.#filtered.length === 0) return;
    const n = this.#filtered.length;
    this.#lightboxIndex = (this.#lightboxIndex + delta + n) % n;
    this.#renderLightbox();
  }

  #renderLightbox(): void {
    const photo = this.#filtered[this.#lightboxIndex];
    if (!photo) return;
    this.#lbImg.src = photo.src;
    this.#lbImg.alt = photo.alt;
    const cap = photo.caption ?? photo.title ?? "";
    this.#lbCap.textContent = cap;
    this.#lbCap.hidden = !cap;
    this.#lbCounter.textContent = `${this.#lightboxIndex + 1} / ${this.#filtered.length}`;
  }

  protected override update(): void {
    this.#titleEl.textContent = this.title;
    this.#titleEl.hidden = !this.title;

    // 반응형 열 수: --cols-desktop만 인라인으로. --cols는 스타일시트가 미디어로 결정.
    this.#grid.style.setProperty("--cols-desktop", String(this.columns));

    if (this.#dataDirty) {
      this.#dataDirty = false;
      this.#rebuildFilters();
      this.#rebuildGrid();
    }

    this.#countEl.textContent = `${this.#filtered.length}장`;
    const isEmpty = this.#filtered.length === 0;
    this.#empty.hidden = !isEmpty;
    this.#grid.hidden = isEmpty;
    if (isEmpty) this.#emptyTitleEl.textContent = this.emptyTitle;
  }

  #rebuildFilters(): void {
    const tags: string[] = [];
    const seen = new Set<string>();
    for (const p of this.#photos) {
      if (p.tag && !seen.has(p.tag)) {
        seen.add(p.tag);
        tags.push(p.tag);
      }
    }
    // 활성 태그가 사라졌으면 전체로 복귀
    if (this.#activeTag && !seen.has(this.#activeTag)) this.#activeTag = null;

    this.#filters.hidden = tags.length === 0;
    this.#filters.textContent = "";
    const mk = (label: string, tag: string, checked: boolean): HTMLButtonElement => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "jd-photo-album__chip";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", String(checked));
      b.dataset.tag = tag;
      b.textContent = label;
      return b;
    };
    this.#filters.append(mk("전체", "", this.#activeTag === null));
    for (const t of tags) this.#filters.append(mk(t, t, this.#activeTag === t));
  }

  #rebuildGrid(): void {
    this.#filtered = this.#activeTag
      ? this.#photos.filter((p) => p.tag === this.#activeTag)
      : this.#photos.slice();

    this.#grid.textContent = "";
    this.#filtered.forEach((p, i) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "jd-photo-album__cell";
      cell.dataset.index = String(i);
      cell.setAttribute("aria-label", `${p.alt} 크게 보기`);
      const fig = document.createElement("figure");
      fig.className = "jd-photo-album__figure";
      const img = document.createElement("img");
      img.className = "jd-photo-album__img";
      img.src = p.src;
      img.alt = p.alt;
      img.loading = "lazy";
      fig.append(img);
      if (p.title || p.caption || p.likes !== undefined || p.comments !== undefined) {
        const cap = document.createElement("figcaption");
        cap.className = "jd-photo-album__caption";
        if (p.title) {
          const t = document.createElement("span");
          t.className = "jd-photo-album__caption-title";
          t.textContent = p.title;
          cap.append(t);
        }
        const meta: string[] = [];
        if (p.likes !== undefined) meta.push(`♥ ${p.likes}`);
        if (p.comments !== undefined) meta.push(`💬 ${p.comments}`);
        if (meta.length) {
          const m = document.createElement("span");
          m.className = "jd-photo-album__caption-meta";
          m.textContent = meta.join("  ");
          cap.append(m);
        }
        fig.append(cap);
      }
      cell.append(fig);
      this.#grid.append(cell);
    });
  }
}
