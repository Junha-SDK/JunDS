/**
 * <jd-social-feed> — SNS 피드 (v2 patterns/SocialFeed).
 * 상단 스토리 바 + 무한 스크롤 게시물 리스트 + 하단 로딩/끝 표시.
 *
 * 데이터(§1.3): `stories`(배열)는 property 전용 + `<script type="application/json">` 슬롯.
 *   게시물은 light DOM children(입양) — 초기 children 또는 host가 추가 후 refresh() 호출.
 * Behavior: createInfiniteFeed(§5, IntersectionObserver + in-flight 가드)로 sentinel 감시.
 *   hasMore일 때만 jd-load-more를 발행한다.
 * 이벤트: jd-story-click{id} · jd-load-more.
 * a11y: 스토리/게시물은 실제 <ul>/<li>, sentinel은 aria-live=polite.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createInfiniteFeed } from "../../behaviors/scroll.js";
import socialFeedStyles from "./social-feed.css.js";

export interface JdSocialStory {
  id: string;
  name: string;
  avatar?: string;
  /** unseen(기본, 그라디언트 링) | seen(회색 링) | live(빨강) */
  state?: string;
}

const SPINNER_SVG =
  '<svg class="jd-social-feed__spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
  '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity=".25"/>' +
  '<path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity=".75"/></svg>';

export class JdSocialFeed extends JdElement {
  static override tag = "jd-social-feed";
  static override props = {
    hasMore: { type: Boolean, reflect: true }, // attr: has-more
    loading: { type: Boolean, reflect: true },
    emptyTitle: { type: String, default: "게시물이 없습니다" }, // attr: empty-title
    emptyDescription: { type: String }, // attr: empty-description
  };

  declare hasMore: boolean;
  declare loading: boolean;
  declare emptyTitle: string;
  declare emptyDescription: string;

  #stories: JdSocialStory[] = [];
  #storiesDirty = true;
  get stories(): JdSocialStory[] {
    return this.#stories;
  }
  set stories(v: JdSocialStory[]) {
    this.#stories = Array.isArray(v) ? v : [];
    this.#storiesDirty = true;
    this.requestUpdate();
  }

  #storiesBar!: HTMLElement;
  #storiesList!: HTMLUListElement;
  #list!: HTMLUListElement;
  #empty!: HTMLElement;
  #emptyTitleEl!: HTMLElement;
  #emptyDescEl!: HTMLElement;
  #sentinel!: HTMLElement;
  #end!: HTMLElement;

  protected render(): void {
    adoptStyles(socialFeedStyles);

    const json = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (json) {
      try {
        const parsed = JSON.parse(json.textContent || "[]") as JdSocialStory[];
        if (Array.isArray(parsed)) this.#stories = parsed;
      } catch {
        console.warn("[junds] <jd-social-feed> JSON 슬롯 파싱 실패 — 무시합니다.");
      }
      json.remove();
    }

    if (!this.querySelector(":scope > .jd-social-feed__list")) this.#build();
    this.#cacheRefs();
    this.update();
  }

  #build(): void {
    // 남은 children = 게시물
    const posts = Array.from(this.children);

    const storiesBar = document.createElement("div");
    storiesBar.className = "jd-social-feed__stories";
    storiesBar.innerHTML = '<ul class="jd-social-feed__stories-list"></ul>';

    const list = document.createElement("ul");
    list.className = "jd-social-feed__list";
    list.setAttribute("aria-label", "게시물");
    for (const p of posts) {
      const li = document.createElement("li");
      li.className = "jd-social-feed__item";
      li.append(p);
      list.append(li);
    }

    const empty = document.createElement("div");
    empty.className = "jd-social-feed__empty";
    empty.innerHTML =
      '<div class="jd-social-feed__empty-icon" aria-hidden="true">📭</div>' +
      '<p class="jd-social-feed__empty-title"></p>' +
      '<p class="jd-social-feed__empty-desc"></p>';

    const sentinel = document.createElement("div");
    sentinel.className = "jd-social-feed__sentinel";
    sentinel.setAttribute("aria-live", "polite");
    sentinel.innerHTML = '<p class="jd-social-feed__end">더 이상 게시물이 없습니다</p>';

    this.append(storiesBar, list, empty, sentinel);
  }

  #cacheRefs(): void {
    this.#storiesBar = this.querySelector(".jd-social-feed__stories")!;
    this.#storiesList = this.querySelector(".jd-social-feed__stories-list")!;
    this.#list = this.querySelector(".jd-social-feed__list")!;
    this.#empty = this.querySelector(".jd-social-feed__empty")!;
    this.#emptyTitleEl = this.querySelector(".jd-social-feed__empty-title")!;
    this.#emptyDescEl = this.querySelector(".jd-social-feed__empty-desc")!;
    this.#sentinel = this.querySelector(".jd-social-feed__sentinel")!;
    this.#end = this.querySelector(".jd-social-feed__end")!;
    if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", "피드");
    this.setAttribute("role", "feed");
  }

  protected override connected(): void {
    this.#storiesList.addEventListener("click", this.#onStoryClick);
    // 바닥 근처 진입 시 loadMore — hasMore일 때만 통지(§5 InfiniteFeed는 in-flight 가드만)
    this.own(
      createInfiniteFeed(this.#sentinel, () => {
        if (this.hasMore && !this.loading) this.emit("jd-load-more");
      }),
    );
  }

  protected override disconnected(): void {
    this.#storiesList.removeEventListener("click", this.#onStoryClick);
  }

  #onStoryClick = (e: Event): void => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-story-id]");
    if (!btn) return;
    this.emit("jd-story-click", { id: btn.dataset.storyId! });
  };

  /** host가 게시물을 host에 직접 추가한 뒤 호출 — stray children을 리스트로 입양 */
  refresh(): void {
    this.requestUpdate();
  }

  #projectStray(): void {
    // 리스트 밖으로 새어 나온 직계 자식(=host가 추가한 게시물)을 li로 감싸 리스트에 편입
    const chrome = new Set<Element>([this.#storiesBar, this.#list, this.#empty, this.#sentinel]);
    for (const child of Array.from(this.children)) {
      if (chrome.has(child)) continue;
      const li = document.createElement("li");
      li.className = "jd-social-feed__item";
      li.append(child);
      this.#list.insertBefore(li, null);
    }
  }

  protected override update(): void {
    this.#projectStray();

    if (this.#storiesDirty) {
      this.#storiesDirty = false;
      this.#storiesBar.hidden = this.#stories.length === 0;
      this.#storiesList.textContent = "";
      for (const s of this.#stories) {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "jd-social-feed__story";
        btn.dataset.storyId = s.id;
        if (s.state) btn.dataset.state = s.state;
        btn.setAttribute("aria-label", `${s.name} 스토리`);
        const ring = document.createElement("span");
        ring.className = "jd-social-feed__story-ring";
        if (s.avatar) {
          const img = document.createElement("img");
          img.className = "jd-social-feed__story-avatar";
          img.src = s.avatar;
          img.alt = "";
          ring.append(img);
        } else {
          const ph = document.createElement("span");
          ph.className = "jd-social-feed__story-avatar jd-social-feed__story-avatar--ph";
          ph.textContent = s.name.slice(0, 1);
          ring.append(ph);
        }
        const name = document.createElement("span");
        name.className = "jd-social-feed__story-name";
        name.textContent = s.name;
        btn.append(ring, name);
        li.append(btn);
        this.#storiesList.append(li);
      }
    }

    const count = this.#list.childElementCount;
    const showEmpty = count === 0 && !this.loading;
    this.#empty.hidden = !showEmpty;
    this.#list.hidden = count === 0;
    if (showEmpty) {
      this.#emptyTitleEl.textContent = this.emptyTitle;
      this.#emptyDescEl.textContent = this.emptyDescription;
      this.#emptyDescEl.hidden = !this.emptyDescription;
    }

    this.#sentinel.dataset.loading = this.loading ? "1" : "";
    let spin = this.#sentinel.querySelector(".jd-social-feed__spinner");
    if (this.loading && !spin) this.#sentinel.insertAdjacentHTML("afterbegin", SPINNER_SVG);
    else if (!this.loading && spin) spin.remove();
    this.#end.hidden = this.loading || this.hasMore || count === 0;
  }
}
