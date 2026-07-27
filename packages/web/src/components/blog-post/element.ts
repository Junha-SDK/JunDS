/**
 * <jd-blog-post> — 블로그/아티클 페이지 표준 레이아웃 (v2 patterns/BlogPost).
 * cover + meta(작성자·발행일·읽기시간) + prose 본문 + 선택 사이드바 + 하단 푸터.
 *
 * 데이터 표면(§1.3):
 *  - 스칼라(title·excerpt·published-at·reading-minutes·cover-image·author-*)는 attribute.
 *  - `tags`(배열)는 property 전용 + 자식 `<script type="application/json">` 슬롯(WEB-03 예외).
 *  - `author`(객체)는 편의 property — 내부 author-* 스칼라로 분해한다.
 * 본문은 light DOM children(입양). 부가 영역은 `[slot="sidebar"]` / `[slot="footer"]`.
 *
 * a11y(v2 개선): 호스트에 role="article" + aria-labelledby(제목 id, jd-uid §8),
 * `<time datetime>`로 기계 판독 날짜, 태그 목록은 실제 <ul>/<li>.
 */
import { JdElement } from "../../core/element.js";
import {
  syncAriaIdRefs,
  syncOwnedAttribute,
} from "../../core/aria.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import blogPostStyles from "./blog-post.css.js";

export interface JdBlogAuthor {
  name: string;
  avatar?: string;
  href?: string;
  bio?: string;
}

/** ISO/파싱 가능한 문자열을 ko-KR 긴 날짜로. 파싱 실패 시 원문 유지(결정적 — now 미사용 §3.1-3) */
function fmtDate(d: string): string {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

export class JdBlogPost extends JdElement {
  static override tag = "jd-blog-post";
  static override props = {
    title: { type: String },
    excerpt: { type: String },
    publishedAt: { type: String }, // attr: published-at
    readingMinutes: { type: Number }, // attr: reading-minutes — 0/미지정이면 미노출
    coverImage: { type: String }, // attr: cover-image
    authorName: { type: String }, // attr: author-name
    authorAvatar: { type: String }, // attr: author-avatar
    authorHref: { type: String }, // attr: author-href
  };

  declare title: string;
  declare excerpt: string;
  declare publishedAt: string;
  declare readingMinutes: number;
  declare coverImage: string;
  declare authorName: string;
  declare authorAvatar: string;
  declare authorHref: string;

  #tags: string[] = [];
  get tags(): string[] {
    return this.#tags;
  }
  set tags(v: string[]) {
    this.#tags = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  /** 편의: 객체 하나로 작성자 지정. 내부 author-* 스칼라로 분해(§1.3 복합→스칼라) */
  set author(a: JdBlogAuthor | null) {
    this.authorName = a?.name ?? "";
    this.authorAvatar = a?.avatar ?? "";
    this.authorHref = a?.href ?? "";
  }
  get author(): JdBlogAuthor {
    return { name: this.authorName, avatar: this.authorAvatar, href: this.authorHref };
  }

  #tagsEl!: HTMLUListElement;
  #title!: HTMLHeadingElement;
  #excerpt!: HTMLParagraphElement;
  #authorEl!: HTMLElement;
  #authorImg!: HTMLImageElement;
  #authorName!: HTMLElement;
  #date!: HTMLTimeElement;
  #dateSep!: HTMLElement;
  #reading!: HTMLElement;
  #readingSep!: HTMLElement;
  #cover!: HTMLElement;
  #coverImg!: HTMLImageElement;
  #layout!: HTMLElement;
  #titleId = "";

  protected render(): void {
    adoptStyles(blogPostStyles);

    // 선언적 태그 초기화 슬롯 — 1회 소비(§1.3)
    const json = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (json) {
      try {
        const parsed = JSON.parse(json.textContent || "[]") as string[];
        if (Array.isArray(parsed)) this.#tags = parsed;
      } catch {
        console.warn("[junds] <jd-blog-post> JSON 슬롯 파싱 실패 — 무시합니다.");
      }
      json.remove();
    }

    if (!this.querySelector(":scope > .jd-blog-post__header")) this.#build();
    this.#cacheRefs();
    this.update();
  }

  /** 골격 없을 때만 — children을 본문으로 이동(입양 §3.3) */
  #build(): void {
    const sidebar = this.querySelector<HTMLElement>(':scope > [slot="sidebar"]');
    const footerSlot = this.querySelector<HTMLElement>(':scope > [slot="footer"]');
    const bodyNodes = Array.from(this.childNodes).filter(
      (n) => n !== sidebar && n !== footerSlot,
    );

    const header = document.createElement("header");
    header.className = "jd-blog-post__header";
    header.innerHTML =
      '<ul class="jd-blog-post__tags" aria-label="태그"></ul>' +
      '<h1 class="jd-blog-post__title"></h1>' +
      '<p class="jd-blog-post__excerpt"></p>' +
      '<div class="jd-blog-post__meta">' +
      '<span class="jd-blog-post__author">' +
      '<img class="jd-blog-post__avatar" alt="" />' +
      '<span class="jd-blog-post__author-name"></span></span>' +
      '<span class="jd-blog-post__sep" data-sep="date" aria-hidden="true">·</span>' +
      '<time class="jd-blog-post__date"></time>' +
      '<span class="jd-blog-post__sep" data-sep="reading" aria-hidden="true">·</span>' +
      '<span class="jd-blog-post__reading"></span>' +
      "</div>";

    const cover = document.createElement("div");
    cover.className = "jd-blog-post__cover";
    cover.innerHTML = '<img class="jd-blog-post__cover-img" alt="" />';

    const layout = document.createElement("div");
    layout.className = "jd-blog-post__layout";
    const body = document.createElement("div");
    body.className = "jd-blog-post__body";
    body.append(...bodyNodes);
    const aside = document.createElement("aside");
    aside.className = "jd-blog-post__sidebar";
    if (sidebar) aside.append(sidebar);
    layout.append(body, aside);

    const footer = document.createElement("footer");
    footer.className = "jd-blog-post__footer";
    if (footerSlot) footer.append(footerSlot);

    this.append(header, cover, layout, footer);
  }

  #cacheRefs(): void {
    this.#tagsEl = this.querySelector(".jd-blog-post__tags")!;
    this.#title = this.querySelector(".jd-blog-post__title")!;
    this.#excerpt = this.querySelector(".jd-blog-post__excerpt")!;
    this.#authorEl = this.querySelector(".jd-blog-post__author")!;
    this.#authorImg = this.querySelector(".jd-blog-post__avatar")!;
    this.#authorName = this.querySelector(".jd-blog-post__author-name")!;
    this.#date = this.querySelector(".jd-blog-post__date")!;
    this.#dateSep = this.querySelector('.jd-blog-post__sep[data-sep="date"]')!;
    this.#reading = this.querySelector(".jd-blog-post__reading")!;
    this.#readingSep = this.querySelector('.jd-blog-post__sep[data-sep="reading"]')!;
    this.#cover = this.querySelector(".jd-blog-post__cover")!;
    this.#coverImg = this.querySelector(".jd-blog-post__cover-img")!;
    this.#layout = this.querySelector(".jd-blog-post__layout")!;
    if (!this.#titleId) {
      this.#titleId = this.#title.id || jdUid("jd-blog-title");
      this.#title.id = this.#titleId;
    }
    syncOwnedAttribute(this, "role", "article", { preserveExisting: true });
    syncAriaIdRefs(this, "aria-labelledby", this.#titleId);
  }

  protected override update(): void {
    // 태그
    const tags = this.#tags;
    this.#tagsEl.hidden = tags.length === 0;
    if (this.#tagsEl.childElementCount !== tags.length) {
      this.#tagsEl.textContent = "";
      for (const t of tags) {
        const li = document.createElement("li");
        li.className = "jd-blog-post__tag";
        li.textContent = t;
        this.#tagsEl.append(li);
      }
    } else {
      tags.forEach((t, i) => {
        (this.#tagsEl.children[i] as HTMLElement).textContent = t;
      });
    }

    this.#title.textContent = this.title;
    this.#excerpt.textContent = this.excerpt;
    this.#excerpt.hidden = !this.excerpt;

    // 작성자
    const hasAuthor = Boolean(this.authorName);
    this.#authorEl.hidden = !hasAuthor;
    this.#authorImg.hidden = !this.authorAvatar;
    if (this.authorAvatar) {
      this.#authorImg.src = this.authorAvatar;
      this.#authorImg.alt = this.authorName;
    }
    // href가 있으면 링크로, 없으면 텍스트로
    const linked = hasAuthor && Boolean(this.authorHref);
    if (linked) {
      let a = this.#authorName.querySelector("a");
      if (!a) {
        a = document.createElement("a");
        this.#authorName.textContent = "";
        this.#authorName.append(a);
      }
      a.href = this.authorHref;
      a.textContent = this.authorName;
    } else {
      this.#authorName.textContent = this.authorName;
    }

    // 발행일
    const dateText = fmtDate(this.publishedAt);
    this.#date.hidden = !dateText;
    this.#date.textContent = dateText;
    if (this.publishedAt) this.#date.setAttribute("datetime", this.publishedAt);
    else this.#date.removeAttribute("datetime");
    this.#dateSep.hidden = !(hasAuthor && dateText);

    // 읽기 시간
    const showReading = this.readingMinutes > 0;
    this.#reading.hidden = !showReading;
    this.#reading.textContent = showReading ? `${this.readingMinutes}분 읽기` : "";
    this.#readingSep.hidden = !(showReading && (hasAuthor || dateText));

    // 커버
    this.#cover.hidden = !this.coverImage;
    if (this.coverImage) this.#coverImg.src = this.coverImage;

    // 사이드바 유무 → 2열 레이아웃 훅
    const hasSidebar = Boolean(this.querySelector(".jd-blog-post__sidebar")?.childElementCount);
    this.#layout.toggleAttribute("data-has-sidebar", hasSidebar);
  }
}
