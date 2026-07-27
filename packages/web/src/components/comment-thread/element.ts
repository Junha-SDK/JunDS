/**
 * <jd-comment-thread> — 중첩 댓글 스레드 (v2 composites/CommentThread).
 *
 * 트리 데이터는 복합 데이터라 `comments` 프로퍼티 또는 자식
 * `<script type="application/json">` 슬롯으로 받는다(§1.3). 본문은 JSON 경로에선
 * 텍스트로만 렌더한다(v2 ReactNode body의 안전한 축소 — HTML 주입 금지).
 *
 * v2 대비 개선:
 *  1. **시각이 결정적이다.** v2는 render 중 `Date.now()`로 상대 시각을 계산했다(§3.1-3
 *     위반). v3는 트리 구축 시 `<time datetime>` + 절대 표기를 찍고, 상대 표기는
 *     connected() 이후 한 번에 덮는다(§3.4-4).
 *  2. 클릭 위임 1개로 전 좋아요/답글 버튼을 처리한다 — 행마다 리스너를 달지 않는다.
 *
 * 이벤트: `jd-toggle-like`{id} · `jd-reply`{id}. 둘 다 cancelable=false(§1.5).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import commentThreadStyles from "./comment-thread.css.js";

export interface JdComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  body: string;
  createdAt?: string;
  likes?: number;
  liked?: boolean;
  replies?: JdComment[];
}

function absoluteDate(raw: string): string {
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return "";
  return new Intl.DateTimeFormat("ko", { month: "short", day: "numeric" }).format(dt);
}

/** v2 CommentThread 상대 표기(접미 "전" 없음, 7일↑는 절대) */
function relativeShort(raw: string, now: number): string {
  const dt = new Date(raw);
  const t = dt.getTime();
  if (Number.isNaN(t)) return "";
  const diff = (now - t) / 60000;
  if (diff < 1) return "방금";
  if (diff < 60) return `${Math.floor(diff)}분`;
  if (diff < 1440) return `${Math.floor(diff / 60)}시간`;
  if (diff < 1440 * 7) return `${Math.floor(diff / 1440)}일`;
  return absoluteDate(raw);
}

export class JdCommentThread extends JdElement {
  static override tag = "jd-comment-thread";
  static override props = {
    /** 최대 표시·답글 깊이 */
    maxDepth: { type: Number, default: 3 },
    /** 스레드 접근 이름 */
    label: { type: String, default: "댓글" },
    // comments(배열)는 property 전용(§1.3)
  };

  declare maxDepth: number;
  declare label: string;

  #comments: JdComment[] = [];
  #mounted = false;
  #root!: HTMLUListElement;

  get comments(): JdComment[] {
    return this.#comments;
  }
  set comments(v: JdComment[]) {
    this.#comments = Array.isArray(v) ? v : [];
    if (this.#root) this.#rebuild();
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(commentThreadStyles);
    this.#readJson();
    this.#root =
      this.querySelector<HTMLUListElement>(":scope > ul.jd-comment-thread") ??
      (() => {
        const ul = document.createElement("ul");
        ul.className = "jd-comment-thread";
        this.append(ul);
        return ul;
      })();
    this.#rebuild();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdComment[];
      if (Array.isArray(parsed)) this.#comments = parsed;
    } catch {
      console.warn("[junds] <jd-comment-thread> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /** 트리 전체 재구축 — 중첩 구조라 키 기반 증분 대신 재빌드가 단순·정확 */
  #rebuild(): void {
    this.#builtDepth = this.maxDepth;
    this.#root.textContent = "";
    for (const c of this.#comments) this.#root.append(this.#buildRow(c, 0));
    if (this.#mounted) this.#applyRelativeTime();
  }

  #buildRow(comment: JdComment, depth: number): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "jd-comment-thread__row";
    if (depth > 0) li.style.marginInlineStart = `${depth * 32}px`;

    const avatarWrap = document.createElement("div");
    avatarWrap.className = "jd-comment-thread__avatar";
    if (comment.authorAvatar) {
      const img = document.createElement("img");
      img.className = "jd-comment-thread__avatar-img";
      img.alt = "";
      img.src = comment.authorAvatar;
      avatarWrap.append(img);
    } else {
      const fb = document.createElement("span");
      fb.className = "jd-comment-thread__avatar-fallback";
      fb.setAttribute("aria-hidden", "true");
      fb.textContent = comment.authorName ? comment.authorName.slice(0, 1) : "";
      avatarWrap.append(fb);
    }

    const main = document.createElement("div");
    main.className = "jd-comment-thread__main";

    const bubble = document.createElement("div");
    bubble.className = "jd-comment-thread__bubble";
    const head = document.createElement("div");
    head.className = "jd-comment-thread__head";
    const author = document.createElement("span");
    author.className = "jd-comment-thread__author";
    author.textContent = comment.authorName ?? "";
    head.append(author);
    if (comment.createdAt) {
      const time = document.createElement("time");
      time.className = "jd-comment-thread__time";
      const dt = new Date(comment.createdAt);
      if (!Number.isNaN(dt.getTime())) {
        time.setAttribute("datetime", dt.toISOString());
        time.textContent = absoluteDate(comment.createdAt);
      }
      head.append(time);
    }
    const body = document.createElement("p");
    body.className = "jd-comment-thread__body";
    body.textContent = typeof comment.body === "string" ? comment.body : "";
    bubble.append(head, body);

    const actions = document.createElement("div");
    actions.className = "jd-comment-thread__actions";
    const like = document.createElement("button");
    like.type = "button";
    like.className = "jd-comment-thread__like";
    like.dataset.id = comment.id;
    const liked = Boolean(comment.liked);
    like.toggleAttribute("data-liked", liked);
    like.setAttribute("aria-pressed", String(liked));
    like.setAttribute("aria-label", liked ? "좋아요 취소" : "좋아요");
    like.textContent = `${liked ? "❤" : "🤍"} ${comment.likes ?? 0}`;
    actions.append(like);
    if (depth < this.maxDepth) {
      const reply = document.createElement("button");
      reply.type = "button";
      reply.className = "jd-comment-thread__reply";
      reply.dataset.id = comment.id;
      reply.textContent = "답글";
      actions.append(reply);
    }
    main.append(bubble, actions);

    if (comment.replies && comment.replies.length > 0 && depth < this.maxDepth) {
      const sub = document.createElement("ul");
      sub.className = "jd-comment-thread__replies";
      for (const r of comment.replies) sub.append(this.#buildRow(r, depth + 1));
      main.append(sub);
    }

    li.append(avatarWrap, main);
    return li;
  }

  protected override connected(): void {
    this.#mounted = true;
    this.#root.addEventListener("click", this.#onClick);
    this.#applyRelativeTime();
  }

  protected override disconnected(): void {
    this.#mounted = false;
    this.#root?.removeEventListener("click", this.#onClick);
  }

  #onClick = (e: Event): void => {
    const target = e.target as HTMLElement;
    const like = target.closest<HTMLButtonElement>(".jd-comment-thread__like");
    if (like?.dataset.id) {
      this.emit("jd-toggle-like", { id: like.dataset.id });
      return;
    }
    const reply = target.closest<HTMLButtonElement>(".jd-comment-thread__reply");
    if (reply?.dataset.id) this.emit("jd-reply", { id: reply.dataset.id });
  };

  protected override update(): void {
    this.#root.setAttribute("aria-label", this.label);
    /* maxDepth 는 트리의 **모양**을 정하므로 골격을 다시 짜야 반영된다. update()에서
       읽지 않으면 마운트 뒤 값을 바꿔도 화면이 따라오지 않는다(DEC-044 스캐너 검출).
       매번 다시 짜면 낭비이자 스크롤 튐이라, 지난번 짠 깊이와 다를 때만 짓는다. */
    if (this.#builtDepth !== this.maxDepth) this.#rebuild();
  }

  /** #rebuild() 가 실제로 사용한 maxDepth — 미설정 표식은 도달 불가능한 -1 */
  #builtDepth = -1;

  /** 트리 안 모든 <time>을 now 기준 상대 표기로 갱신(connected 이후에만) */
  #applyRelativeTime(): void {
    const now = Date.now();
    const times = this.#root.querySelectorAll<HTMLTimeElement>(".jd-comment-thread__time[datetime]");
    times.forEach((t) => {
      const iso = t.getAttribute("datetime");
      if (iso) t.textContent = relativeShort(iso, now);
    });
  }
}
