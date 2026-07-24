/**
 * <jd-book-reader> — 책 리더 (v2 patterns/BookReader).
 * 상단 스크롤 진행바 + sticky 헤더(목차 토글·제목·북마크·닫기) + 페이지 진행 +
 * 좌측 챕터 목차 + 우측 prose 본문(children 입양).
 *
 * 데이터(§1.3): `chapters`(트리 배열)는 property 전용 + `<script type="application/json">`
 * 슬롯. 나머지 스칼라는 attribute.
 * Behavior: 상단 진행바는 createReadingProgress(§5, 스크롤 rAF 합산·passive) 구독으로만
 *   폭을 갱신한다 — render/update는 결정적으로 유지(§3.1-3, 스크롤값을 render에서 안 읽음).
 * 이벤트: jd-chapter-change{id} · jd-bookmark-change{bookmarked} · jd-close.
 * a11y(v2 개선): 진행바 role=progressbar + aria-valuenow, 목차 nav[aria-label],
 *   활성 챕터 aria-current, 토글 aria-expanded.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createReadingProgress } from "../../behaviors/scroll.js";
import bookReaderStyles from "./book-reader.css.js";

export interface JdChapter {
  id: string;
  title: string;
  href?: string;
  children?: JdChapter[];
}

export class JdBookReader extends JdElement {
  static override tag = "jd-book-reader";
  static override props = {
    title: { type: String },
    author: { type: String },
    activeChapterId: { type: String }, // attr: active-chapter-id
    currentPage: { type: Number }, // attr: current-page
    totalPages: { type: Number }, // attr: total-pages
    bookmarked: { type: Boolean, reflect: true },
    bookmarkable: { type: Boolean, reflect: true }, // 북마크 버튼 노출(v2: onBookmarkChange 있을 때)
    closable: { type: Boolean, reflect: true }, // 닫기 버튼 노출(v2: onClose 있을 때)
    tocOpen: { type: Boolean, default: true, reflect: true }, // attr: toc-open
  };

  declare title: string;
  declare author: string;
  declare activeChapterId: string;
  declare currentPage: number;
  declare totalPages: number;
  declare bookmarked: boolean;
  declare bookmarkable: boolean;
  declare closable: boolean;
  declare tocOpen: boolean;

  #chapters: JdChapter[] = [];
  get chapters(): JdChapter[] {
    return this.#chapters;
  }
  set chapters(v: JdChapter[]) {
    this.#chapters = Array.isArray(v) ? v : [];
    this.#chaptersDirty = true;
    this.requestUpdate();
  }
  #chaptersDirty = true;

  #fill!: HTMLElement;
  #progressbar!: HTMLElement;
  #tocToggle!: HTMLButtonElement;
  #titleEl!: HTMLElement;
  #authorEl!: HTMLElement;
  #bookmarkBtn!: HTMLButtonElement;
  #closeBtn!: HTMLButtonElement;
  #pageBarFill!: HTMLElement;
  #pageLabel!: HTMLElement;
  #pageProgress!: HTMLElement;
  #tocNav!: HTMLElement;
  #body!: HTMLElement;

  protected render(): void {
    adoptStyles(bookReaderStyles);

    const json = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (json) {
      try {
        const parsed = JSON.parse(json.textContent || "[]") as JdChapter[];
        if (Array.isArray(parsed)) this.#chapters = parsed;
      } catch {
        console.warn("[junds] <jd-book-reader> JSON 슬롯 파싱 실패 — 무시합니다.");
      }
      json.remove();
    }

    if (!this.querySelector(":scope > .jd-book-reader__header")) this.#build();
    this.#cacheRefs();
    this.update();
  }

  #build(): void {
    const bodyNodes = Array.from(this.childNodes);

    const bar = document.createElement("div");
    bar.className = "jd-book-reader__progressbar";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-label", "읽기 진행률");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.innerHTML = '<span class="jd-book-reader__progressbar-fill"></span>';

    const header = document.createElement("header");
    header.className = "jd-book-reader__header";
    header.innerHTML =
      '<div class="jd-book-reader__topbar">' +
      '<button type="button" class="jd-book-reader__toc-toggle" aria-expanded="true"><span aria-hidden="true">☰</span></button>' +
      '<div class="jd-book-reader__titles">' +
      '<p class="jd-book-reader__title"></p>' +
      '<p class="jd-book-reader__author"></p>' +
      "</div>" +
      '<button type="button" class="jd-book-reader__bookmark" aria-pressed="false"><span aria-hidden="true">🔖</span></button>' +
      '<button type="button" class="jd-book-reader__close" aria-label="닫기"><span aria-hidden="true">✕</span></button>' +
      "</div>" +
      '<div class="jd-book-reader__pageprogress">' +
      '<span class="jd-book-reader__pagebar"><span class="jd-book-reader__pagebar-fill"></span></span>' +
      '<span class="jd-book-reader__pagelabel"></span>' +
      "</div>";

    const layout = document.createElement("div");
    layout.className = "jd-book-reader__layout";
    const aside = document.createElement("aside");
    aside.className = "jd-book-reader__toc";
    const nav = document.createElement("nav");
    nav.className = "jd-book-reader__toc-nav";
    nav.setAttribute("aria-label", "목차");
    aside.append(nav);
    const main = document.createElement("main");
    main.className = "jd-book-reader__body";
    main.append(...bodyNodes);
    layout.append(aside, main);

    this.append(bar, header, layout);
  }

  #cacheRefs(): void {
    this.#progressbar = this.querySelector(".jd-book-reader__progressbar")!;
    this.#fill = this.querySelector(".jd-book-reader__progressbar-fill")!;
    this.#tocToggle = this.querySelector(".jd-book-reader__toc-toggle")!;
    this.#titleEl = this.querySelector(".jd-book-reader__title")!;
    this.#authorEl = this.querySelector(".jd-book-reader__author")!;
    this.#bookmarkBtn = this.querySelector(".jd-book-reader__bookmark")!;
    this.#closeBtn = this.querySelector(".jd-book-reader__close")!;
    this.#pageProgress = this.querySelector(".jd-book-reader__pageprogress")!;
    this.#pageBarFill = this.querySelector(".jd-book-reader__pagebar-fill")!;
    this.#pageLabel = this.querySelector(".jd-book-reader__pagelabel")!;
    this.#tocNav = this.querySelector(".jd-book-reader__toc-nav")!;
    this.#body = this.querySelector(".jd-book-reader__body")!;
  }

  protected override connected(): void {
    this.#tocToggle.addEventListener("click", this.#onToggleToc);
    this.#bookmarkBtn.addEventListener("click", this.#onBookmark);
    this.#closeBtn.addEventListener("click", this.#onClose);
    this.#tocNav.addEventListener("click", this.#onTocClick);

    // 상단 진행바 — 스크롤 파생값은 구독으로만(§3.1-3)
    const rp = this.own(createReadingProgress(this.#body));
    const apply = (percent: number): void => {
      this.#fill.style.width = `${percent}%`;
      this.#progressbar.setAttribute("aria-valuenow", String(Math.round(percent)));
    };
    apply(rp.get().percent);
    rp.subscribe((v) => apply(v.percent));
  }

  protected override disconnected(): void {
    this.#tocToggle.removeEventListener("click", this.#onToggleToc);
    this.#bookmarkBtn.removeEventListener("click", this.#onBookmark);
    this.#closeBtn.removeEventListener("click", this.#onClose);
    this.#tocNav.removeEventListener("click", this.#onTocClick);
  }

  #onToggleToc = (): void => {
    this.tocOpen = !this.tocOpen;
  };
  #onBookmark = (): void => {
    this.bookmarked = !this.bookmarked;
    this.emit("jd-bookmark-change", { bookmarked: this.bookmarked });
  };
  #onClose = (): void => {
    this.emit("jd-close");
  };
  #onTocClick = (e: Event): void => {
    const link = (e.target as HTMLElement).closest<HTMLElement>("[data-chapter-id]");
    if (!link) return;
    e.preventDefault();
    const id = link.dataset.chapterId!;
    this.activeChapterId = id;
    this.emit("jd-chapter-change", { id });
  };

  protected override update(): void {
    this.#titleEl.textContent = this.title;
    this.#authorEl.textContent = this.author;
    this.#authorEl.hidden = !this.author;

    this.#tocToggle.setAttribute("aria-expanded", String(this.tocOpen));
    this.#tocToggle.setAttribute("aria-label", this.tocOpen ? "목차 숨기기" : "목차 보기");
    this.#bookmarkBtn.setAttribute("aria-pressed", String(this.bookmarked));
    this.#bookmarkBtn.setAttribute("aria-label", this.bookmarked ? "북마크 해제" : "북마크");

    // 페이지 진행
    const total = this.totalPages;
    const showPage = total > 0;
    this.#pageProgress.hidden = !showPage;
    if (showPage) {
      const pct = Math.min(100, Math.max(0, (this.currentPage / total) * 100));
      this.#pageBarFill.style.width = `${pct}%`;
      this.#pageLabel.textContent = `${this.currentPage} / ${total}`;
    }

    if (this.#chaptersDirty) {
      this.#chaptersDirty = false;
      this.#tocNav.textContent = "";
      if (this.#chapters.length) this.#tocNav.append(this.#buildList(this.#chapters));
    }
    this.#syncActive();
  }

  #buildList(items: JdChapter[]): HTMLUListElement {
    const ul = document.createElement("ul");
    ul.className = "jd-book-reader__toc-list";
    for (const c of items) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.className = "jd-book-reader__toc-link";
      a.dataset.chapterId = c.id;
      a.href = c.href ?? `#${c.id}`;
      a.textContent = c.title;
      li.append(a);
      if (c.children?.length) li.append(this.#buildList(c.children));
      ul.append(li);
    }
    return ul;
  }

  #syncActive(): void {
    const links = this.#tocNav.querySelectorAll<HTMLElement>(".jd-book-reader__toc-link");
    links.forEach((l) => {
      const active = l.dataset.chapterId === this.activeChapterId;
      l.toggleAttribute("data-active", active);
      if (active) l.setAttribute("aria-current", "true");
      else l.removeAttribute("aria-current");
    });
  }
}
