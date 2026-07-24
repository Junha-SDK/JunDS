/**
 * <jd-post-card> — SNS 게시물 카드 (v2 composites/PostCard).
 *
 * 작성자·본문·미디어·액션 바. 작성자는 복합 데이터라 `author` 프로퍼티(§1.3), 본문은
 * 무슬롯 children, 미디어는 `slot="media"` children으로 받는다(chat-bubble 슬롯 선례).
 *
 * v2 대비 개선:
 *  1. **시각이 결정적이다.** v2 relativeTime()은 render 중 `Date.now()`를 읽어 프리렌더
 *     스냅샷이 실행 시각마다 달라졌다(§3.1-3 위반). v3는 render/update에서 결정적 절대
 *     날짜만 찍고, "3분 전" 상대 표기는 connected() 이후에만 계산한다(§3.4-4).
 *  2. **시각이 `<time datetime>`이다** — 기계 판독 가능(chat-bubble 교정과 동형).
 *  3. **클릭 카드가 키보드로 눌린다.** v2는 `onClick`을 그냥 `<div>`에 걸어 포커스도
 *     Enter도 없었다. `clickable`이면 role=button + tabindex + Enter/Space를 준다.
 *
 * 액션 버튼은 콜백 유무로 노출을 가르던 v2와 달리(콜백이 없는 CE에선 불가능) `likeable`
 * /`commentable`/`shareable` boolean으로 노출하고, 카운트는 해당 attribute가 있을 때만
 * 보인다(badge count-mode 선례). 좋아요는 내부 상태를 뒤집지 않고 `jd-like`만 발행 —
 * likes/liked는 부모가 소유한다(v2 의미 유지).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import postCardStyles from "./post-card.css.js";

export interface JdPostAuthor {
  name: string;
  handle?: string;
  avatar?: string;
  verified?: boolean;
}

/** ISO/Date 문자열 → 결정적 절대 표기(now 미사용, SSG 안전) */
function absoluteDate(raw: string): string {
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return "";
  return new Intl.DateTimeFormat("ko", { month: "short", day: "numeric" }).format(dt);
}

/** now 기준 상대 표기 — connected() 이후에만 호출(§3.4-4) */
function relativeDate(raw: string, now: number): string {
  const dt = new Date(raw);
  const t = dt.getTime();
  if (Number.isNaN(t)) return "";
  const diffMin = (now - t) / 60000;
  if (diffMin < 1) return "방금";
  if (diffMin < 60) return `${Math.floor(diffMin)}분 전`;
  if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)}시간 전`;
  if (diffMin < 60 * 24 * 7) return `${Math.floor(diffMin / 60 / 24)}일 전`;
  return absoluteDate(raw);
}

export class JdPostCard extends JdElement {
  static override tag = "jd-post-card";
  static override props = {
    /** ISO 8601 작성 시각 */
    createdAt: { type: String },
    likes: { type: Number },
    comments: { type: Number },
    shares: { type: Number },
    liked: { type: Boolean, reflect: true },
    likeable: { type: Boolean, reflect: true },
    commentable: { type: Boolean, reflect: true },
    shareable: { type: Boolean, reflect: true },
    /** 카드 전체 클릭 가능 */
    clickable: { type: Boolean, reflect: true },
    // author(객체)는 property 전용(§1.3)
  };

  declare createdAt: string;
  declare likes: number;
  declare comments: number;
  declare shares: number;
  declare liked: boolean;
  declare likeable: boolean;
  declare commentable: boolean;
  declare shareable: boolean;
  declare clickable: boolean;

  #author: JdPostAuthor = { name: "" };
  #mounted = false;

  #article!: HTMLElement;
  #avatar!: HTMLImageElement;
  #avatarFallback!: HTMLSpanElement;
  #name!: HTMLSpanElement;
  #verified!: HTMLSpanElement;
  #handle!: HTMLSpanElement;
  #dot!: HTMLSpanElement;
  #time!: HTMLTimeElement;
  #media!: HTMLElement;
  #footer!: HTMLElement;
  #likeBtn!: HTMLButtonElement;
  #likeIcon!: HTMLSpanElement;
  #likeCount!: HTMLSpanElement;
  #commentBtn!: HTMLButtonElement;
  #commentCount!: HTMLSpanElement;
  #shareBtn!: HTMLButtonElement;
  #shareCount!: HTMLSpanElement;

  get author(): JdPostAuthor {
    return this.#author;
  }
  set author(v: JdPostAuthor) {
    this.#author = v && typeof v === "object" ? v : { name: "" };
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(postCardStyles);
    const existing = this.querySelector<HTMLElement>(":scope > article.jd-post-card");
    if (existing) {
      this.#adopt(existing);
    } else {
      this.#build();
    }
    this.update();
  }

  #adopt(article: HTMLElement): void {
    this.#article = article;
    this.#avatar = article.querySelector(".jd-post-card__avatar-img")!;
    this.#avatarFallback = article.querySelector(".jd-post-card__avatar-fallback")!;
    this.#name = article.querySelector(".jd-post-card__name")!;
    this.#verified = article.querySelector(".jd-post-card__verified")!;
    this.#handle = article.querySelector(".jd-post-card__handle")!;
    this.#dot = article.querySelector(".jd-post-card__dot")!;
    this.#time = article.querySelector(".jd-post-card__time")!;
    this.#media = article.querySelector(".jd-post-card__media")!;
    this.#footer = article.querySelector(".jd-post-card__footer")!;
    this.#likeBtn = article.querySelector(".jd-post-card__like")!;
    this.#likeIcon = this.#likeBtn.querySelector(".jd-post-card__like-icon")!;
    this.#likeCount = this.#likeBtn.querySelector(".jd-post-card__count")!;
    this.#commentBtn = article.querySelector(".jd-post-card__comment")!;
    this.#commentCount = this.#commentBtn.querySelector(".jd-post-card__count")!;
    this.#shareBtn = article.querySelector(".jd-post-card__share")!;
    this.#shareCount = this.#shareBtn.querySelector(".jd-post-card__count")!;
  }

  #build(): void {
    // children 분류: slot="media" → 미디어, 나머지 → 본문
    const mediaNodes: Node[] = [];
    const contentNodes: Node[] = [];
    for (const node of Array.from(this.childNodes)) {
      const slot = node.nodeType === 1 ? (node as Element).getAttribute("slot") : null;
      (slot === "media" ? mediaNodes : contentNodes).push(node);
    }

    this.#article = document.createElement("article");
    this.#article.className = "jd-post-card";

    // header
    const header = document.createElement("header");
    header.className = "jd-post-card__header";
    this.#avatar = document.createElement("img");
    this.#avatar.className = "jd-post-card__avatar-img";
    this.#avatar.alt = "";
    this.#avatarFallback = document.createElement("span");
    this.#avatarFallback.className = "jd-post-card__avatar-fallback";
    this.#avatarFallback.setAttribute("aria-hidden", "true");

    const meta = document.createElement("div");
    meta.className = "jd-post-card__meta";
    const nameRow = document.createElement("div");
    nameRow.className = "jd-post-card__name-row";
    this.#name = document.createElement("span");
    this.#name.className = "jd-post-card__name";
    this.#verified = document.createElement("span");
    this.#verified.className = "jd-post-card__verified";
    this.#verified.textContent = "✓";
    this.#verified.setAttribute("aria-label", "인증됨");
    nameRow.append(this.#name, this.#verified);
    const sub = document.createElement("p");
    sub.className = "jd-post-card__sub";
    this.#handle = document.createElement("span");
    this.#handle.className = "jd-post-card__handle";
    this.#dot = document.createElement("span");
    this.#dot.className = "jd-post-card__dot";
    this.#dot.textContent = "·";
    this.#dot.setAttribute("aria-hidden", "true");
    this.#time = document.createElement("time");
    this.#time.className = "jd-post-card__time";
    sub.append(this.#handle, this.#dot, this.#time);
    meta.append(nameRow, sub);
    header.append(this.#avatar, this.#avatarFallback, meta);

    // content
    const content = document.createElement("div");
    content.className = "jd-post-card__content";
    content.append(...contentNodes);

    // media
    this.#media = document.createElement("div");
    this.#media.className = "jd-post-card__media";
    this.#media.append(...mediaNodes);

    // footer
    this.#footer = document.createElement("footer");
    this.#footer.className = "jd-post-card__footer";
    this.#likeBtn = this.#actionButton("like", "❤");
    this.#likeIcon = this.#likeBtn.querySelector(".jd-post-card__like-icon")!;
    this.#likeCount = this.#likeBtn.querySelector(".jd-post-card__count")!;
    this.#commentBtn = this.#actionButton("comment", "💬");
    this.#commentCount = this.#commentBtn.querySelector(".jd-post-card__count")!;
    this.#shareBtn = this.#actionButton("share", "↗");
    this.#shareCount = this.#shareBtn.querySelector(".jd-post-card__count")!;
    this.#footer.append(this.#likeBtn, this.#commentBtn, this.#shareBtn);

    this.#article.append(header, content, this.#media, this.#footer);
    this.append(this.#article);
  }

  #actionButton(kind: "like" | "comment" | "share", glyph: string): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `jd-post-card__action jd-post-card__${kind}`;
    const icon = document.createElement("span");
    icon.className = kind === "like" ? "jd-post-card__like-icon" : "jd-post-card__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = glyph;
    const count = document.createElement("span");
    count.className = "jd-post-card__count";
    b.append(icon, count);
    return b;
  }

  protected override connected(): void {
    this.#mounted = true;
    this.addEventListener("click", this.#onClick);
    this.addEventListener("keydown", this.#onKeydown);
    this.#applyRelativeTime();
  }

  protected override disconnected(): void {
    this.#mounted = false;
    this.removeEventListener("click", this.#onClick);
    this.removeEventListener("keydown", this.#onKeydown);
  }

  #onClick = (e: Event): void => {
    const target = e.target as HTMLElement;
    const action = target.closest<HTMLButtonElement>(".jd-post-card__action");
    if (action) {
      e.stopPropagation(); // 액션 클릭은 카드 활성화가 아니다(v2 footer stopPropagation)
      if (action === this.#likeBtn) this.emit("jd-like", { liked: this.liked });
      else if (action === this.#commentBtn) this.emit("jd-comment");
      else if (action === this.#shareBtn) this.emit("jd-share");
      return;
    }
    if (this.clickable) this.emit("jd-select");
  };

  #onKeydown = (e: KeyboardEvent): void => {
    if (!this.clickable || e.target !== this.#article) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.emit("jd-select");
    }
  };

  protected override update(): void {
    const a = this.#author;

    // 아바타
    const hasAvatar = Boolean(a.avatar);
    this.#avatar.hidden = !hasAvatar;
    this.#avatarFallback.hidden = hasAvatar;
    if (hasAvatar) {
      if (this.#avatar.getAttribute("src") !== a.avatar) this.#avatar.src = a.avatar!;
    } else {
      this.#avatar.removeAttribute("src");
      this.#avatarFallback.textContent = a.name ? a.name.slice(0, 1) : "";
    }

    this.#name.textContent = a.name ?? "";
    this.#verified.hidden = !a.verified;

    const hasHandle = Boolean(a.handle);
    this.#handle.textContent = hasHandle ? `@${a.handle}` : "";
    this.#handle.hidden = !hasHandle;

    // 시각 — 결정적 절대 표기(SSG). 상대 표기는 connected 이후 #applyRelativeTime()이 덮는다
    const dt = this.createdAt ? new Date(this.createdAt) : null;
    const valid = dt !== null && !Number.isNaN(dt.getTime());
    this.#time.hidden = !valid;
    if (valid) {
      this.#time.setAttribute("datetime", dt.toISOString());
      if (!this.#mounted) this.#time.textContent = absoluteDate(this.createdAt);
    } else {
      this.#time.removeAttribute("datetime");
      this.#time.textContent = "";
    }
    this.#dot.hidden = !(hasHandle && valid);
    if (this.#mounted) this.#applyRelativeTime();

    // 좋아요
    this.#likeBtn.hidden = !this.likeable;
    this.#likeIcon.textContent = this.liked ? "❤" : "🤍";
    this.#likeBtn.setAttribute("aria-pressed", String(this.liked));
    this.#likeBtn.setAttribute("aria-label", this.liked ? "좋아요 취소" : "좋아요");
    this.#syncCount(this.#likeCount, "likes", this.likes);

    // 댓글
    this.#commentBtn.hidden = !this.commentable;
    this.#commentBtn.setAttribute("aria-label", "댓글");
    this.#syncCount(this.#commentCount, "comments", this.comments);

    // 공유
    this.#shareBtn.hidden = !this.shareable;
    this.#shareBtn.setAttribute("aria-label", "공유");
    this.#syncCount(this.#shareCount, "shares", this.shares);

    this.#footer.hidden = !(this.likeable || this.commentable || this.shareable);

    // 클릭 카드 — role/tabindex는 clickable일 때만
    if (this.clickable) {
      this.#article.setAttribute("role", "button");
      this.#article.tabIndex = 0;
    } else {
      this.#article.removeAttribute("role");
      this.#article.removeAttribute("tabindex");
    }
  }

  /** 해당 카운트 attribute가 있을 때만 숫자 노출(badge count-mode 선례) */
  #syncCount(el: HTMLSpanElement, attr: string, value: number): void {
    if (this.hasAttribute(attr)) {
      el.hidden = false;
      el.textContent = value.toLocaleString();
    } else {
      el.hidden = true;
      el.textContent = "";
    }
  }

  #applyRelativeTime(): void {
    if (!this.createdAt) return;
    const label = relativeDate(this.createdAt, Date.now());
    if (label) this.#time.textContent = label;
  }
}
