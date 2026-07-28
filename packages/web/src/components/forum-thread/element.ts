/**
 * <jd-forum-thread> — Stack Overflow 스타일 질문/답변 스레드 (v2 patterns/ForumThread).
 *
 * 질문(opening) + 답변(answers, 중첩 replies) + 투표 + 채택으로 구성한다.
 * 트리 데이터는 복합 데이터라(§1.3) `opening`/`answers`/`tags` 프로퍼티 또는 자식
 * `<script type="application/json">` 슬롯(`{ title?, tags?, opening, answers }`)으로 받는다.
 * 답변 작성 폼은 `[slot="composer"]` 자식으로 투영한다. 본문은 텍스트로만 렌더한다
 * (v2 ReactNode body의 안전한 축소 — HTML 주입 금지).
 *
 * v2 대비 개선:
 *  1. **시각이 결정적이다.** v2는 render 중 `Date.now()`로 상대 시각을 계산했다(§3.1-3
 *     위반). v3는 트리 구축 시 `<time datetime>` + 절대 표기를 찍고(문자 단위 결정적),
 *     상대 표기는 connected() 이후 한 번에 덮는다.
 *  2. 클릭 위임 1개로 전 투표/채택 버튼을 처리한다 — 행마다 리스너를 달지 않는다.
 *  3. `role="region"` + 실제 제목(h1)을 가리키는 `aria-labelledby`로 랜드마크를 명명한다
 *     (v2는 정적 aria-label "포럼 스레드"였다). 시각은 `<span>`이 아닌 `<time>`으로 표기.
 *
 * 이벤트: `jd-vote`{id,dir} · `jd-accept`{id}. 둘 다 cancelable=false(§1.5).
 * dir은 토글 결과값(1=추천, -1=비추천, 0=취소) — 소비자가 데이터를 갱신해 되먹인다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import forumThreadStyles from "./forum-thread.css.js";

export interface ForumPost {
  id: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  /** 본문 텍스트. JSON/프로퍼티 경로 모두 텍스트로만 렌더한다(HTML 주입 금지). */
  body: string;
  createdAt?: string | number | Date;
  upvotes?: number;
  myVote?: 1 | -1 | 0;
  accepted?: boolean;
  replies?: ForumPost[];
}

interface ThreadConfig {
  title?: string;
  tags?: string[];
  opening?: ForumPost | null;
  answers?: ForumPost[];
}

const CLS = "jd-forum-thread";

function toDate(raw: ForumPost["createdAt"]): Date | null {
  if (raw == null) return null;
  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

/** 결정적 초기 표기 — now에 의존하지 않는다(§3.1-3). */
function absoluteDate(dt: Date): string {
  return new Intl.DateTimeFormat("ko", { year: "2-digit", month: "short", day: "numeric" }).format(
    dt,
  );
}

/** v2 relativeTime 재현("전" 접미, 30일↑는 절대). connected() 이후에만 호출. */
function relativeTime(dt: Date, now: number): string {
  const diffMin = (now - dt.getTime()) / 60000;
  if (diffMin < 1) return "방금";
  if (diffMin < 60) return `${Math.floor(diffMin)}분 전`;
  if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)}시간 전`;
  if (diffMin < 60 * 24 * 30) return `${Math.floor(diffMin / 60 / 24)}일 전`;
  return absoluteDate(dt);
}

export class JdForumThread extends JdElement {
  static override tag = CLS;
  static override props = {
    /** 질문 제목(h1). 네이티브 title 접근자를 덮지만 이 레포의 house style이다(§1.3 스칼라). */
    title: { type: String },
    /** 답변에 채택 버튼을 노출할지 — v2의 onAccept 존재 게이트를 대체(depth>0·미채택 한정). */
    acceptable: { type: Boolean },
    // tags / opening / answers 는 복합 데이터라 property 전용(§1.3)
  };

  declare title: string;
  declare acceptable: boolean;

  #tags: string[] = [];
  #opening: ForumPost | null = null;
  #answers: ForumPost[] = [];

  #mounted = false;
  #builtAcceptable = false;

  #root!: HTMLElement;
  #titleEl!: HTMLHeadingElement;
  #tagsEl!: HTMLDivElement;
  #openingSlot!: HTMLDivElement;
  #answersHeading!: HTMLHeadingElement;
  #answersList!: HTMLDivElement;

  get tags(): string[] {
    return this.#tags;
  }
  set tags(v: string[]) {
    this.#tags = Array.isArray(v) ? v : [];
    if (this.#root) this.#renderHeader();
    this.requestUpdate();
  }

  get opening(): ForumPost | null {
    return this.#opening;
  }
  set opening(v: ForumPost | null) {
    this.#opening = v && typeof v === "object" ? v : null;
    if (this.#root) this.#rebuildPosts();
    this.requestUpdate();
  }

  get answers(): ForumPost[] {
    return this.#answers;
  }
  set answers(v: ForumPost[]) {
    this.#answers = Array.isArray(v) ? v : [];
    if (this.#root) this.#rebuildPosts();
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(forumThreadStyles);
    this.#readJson();

    const existing = this.querySelector<HTMLElement>(`:scope > .${CLS}`);
    if (existing) {
      // 입양(§3.3) — SSR/프리렌더 골격의 컨테이너를 재사용하고 포스트만 재구축한다.
      this.#root = existing;
      this.#titleEl = existing.querySelector(`.${CLS}__title`)!;
      this.#tagsEl = existing.querySelector(`.${CLS}__tags`)!;
      this.#openingSlot = existing.querySelector(`.${CLS}__opening`)!;
      this.#answersHeading = existing.querySelector(`.${CLS}__answers-heading`)!;
      this.#answersList = existing.querySelector(`.${CLS}__answers-list`)!;
    } else {
      this.#build();
    }

    this.#renderHeader();
    this.#rebuildPosts();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "{}") as ThreadConfig;
      if (typeof parsed.title === "string") this.title = parsed.title;
      if (Array.isArray(parsed.tags)) this.#tags = parsed.tags;
      if (parsed.opening && typeof parsed.opening === "object") this.#opening = parsed.opening;
      if (Array.isArray(parsed.answers)) this.#answers = parsed.answers;
    } catch {
      console.warn("[junds] <jd-forum-thread> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /** 최초 골격 1회 구축(멱등·입양 규칙 §3.3). 답변 작성 폼은 [slot="composer"]로 투영. */
  #build(): void {
    const composer = this.querySelector<HTMLElement>(':scope > [slot="composer"]');

    this.#root = document.createElement("div");
    this.#root.className = CLS;

    const header = document.createElement("header");
    header.className = `${CLS}__header`;
    this.#titleEl = document.createElement("h1");
    this.#titleEl.className = `${CLS}__title`;
    this.#titleEl.id = jdUid(`${CLS}-title`);
    this.#tagsEl = document.createElement("div");
    this.#tagsEl.className = `${CLS}__tags`;
    header.append(this.#titleEl, this.#tagsEl);

    this.#openingSlot = document.createElement("div");
    this.#openingSlot.className = `${CLS}__opening`;

    const answers = document.createElement("section");
    answers.className = `${CLS}__answers`;
    answers.setAttribute("aria-labelledby", jdUid(`${CLS}-answers`));
    this.#answersHeading = document.createElement("h2");
    this.#answersHeading.className = `${CLS}__answers-heading`;
    this.#answersHeading.id = answers.getAttribute("aria-labelledby")!;
    this.#answersList = document.createElement("div");
    this.#answersList.className = `${CLS}__answers-list`;
    answers.append(this.#answersHeading, this.#answersList);

    this.#root.append(header, this.#openingSlot, answers);

    if (composer) {
      const footer = document.createElement("div");
      footer.className = `${CLS}__composer`;
      const h3 = document.createElement("h3");
      h3.className = `${CLS}__composer-title`;
      h3.textContent = "답변 작성";
      footer.append(h3, composer); // composer 노드를 골격으로 이동
      this.#root.append(footer);
    }

    this.replaceChildren(this.#root);
  }

  #renderHeader(): void {
    this.#titleEl.textContent = this.title;
    this.#tagsEl.replaceChildren();
    for (const t of this.#tags) {
      const span = document.createElement("span");
      span.className = `${CLS}__tag`;
      span.textContent = `#${t}`;
      this.#tagsEl.append(span);
    }
    this.#tagsEl.hidden = this.#tags.length === 0;
  }

  /** 포스트 트리 재구축 — 중첩 구조라 키 증분 대신 재빌드가 단순·정확. */
  #rebuildPosts(): void {
    this.#builtAcceptable = this.acceptable;

    this.#openingSlot.replaceChildren();
    if (this.#opening) this.#openingSlot.append(this.#buildPost(this.#opening, 0));

    this.#answersHeading.textContent = `${this.#answers.length}개의 답변`;
    this.#answersList.replaceChildren();
    for (const a of this.#answers) this.#answersList.append(this.#buildPost(a, 1));

    if (this.#mounted) this.#applyRelativeTime();
  }

  #buildPost(post: ForumPost, depth: number): HTMLElement {
    const article = document.createElement("article");
    article.className = `${CLS}__post`;
    article.dataset.depth = String(depth);
    const accepted = Boolean(post.accepted);
    if (accepted) article.dataset.accepted = "";

    // 투표 열
    const votes = document.createElement("div");
    votes.className = `${CLS}__votes`;
    votes.setAttribute("role", "group");
    votes.setAttribute("aria-label", "투표");
    const score = post.upvotes ?? 0;
    votes.append(this.#voteButton("up", post.id, post.myVote === 1, "추천"));
    const scoreEl = document.createElement("span");
    scoreEl.className = `${CLS}__score`;
    scoreEl.textContent = String(score);
    scoreEl.setAttribute("aria-label", `추천 점수 ${score}`);
    votes.append(scoreEl, this.#voteButton("down", post.id, post.myVote === -1, "비추천"));
    if (accepted) {
      const mark = document.createElement("span");
      mark.className = `${CLS}__accepted-mark`;
      mark.setAttribute("aria-label", "채택된 답변");
      mark.textContent = "✓";
      votes.append(mark);
    }

    // 본문 열
    const bodyCol = document.createElement("div");
    bodyCol.className = `${CLS}__body-col`;

    const meta = document.createElement("header");
    meta.className = `${CLS}__meta`;
    meta.append(this.#avatar(post));
    const author = document.createElement("span");
    author.className = `${CLS}__author`;
    author.textContent = post.authorName ?? "";
    meta.append(author);
    if (post.authorRole) {
      const role = document.createElement("span");
      role.className = `${CLS}__role`;
      role.textContent = post.authorRole;
      meta.append(role);
    }
    const dt = toDate(post.createdAt);
    if (dt) {
      const dot = document.createElement("span");
      dot.className = `${CLS}__dot`;
      dot.setAttribute("aria-hidden", "true");
      dot.textContent = "·";
      const time = document.createElement("time");
      time.className = `${CLS}__time`;
      time.setAttribute("datetime", dt.toISOString());
      time.textContent = absoluteDate(dt); // 결정적 초기값 — connected()에서 상대 표기로 덮음
      meta.append(dot, time);
    }
    if (this.acceptable && depth > 0 && !accepted) {
      const accept = document.createElement("button");
      accept.type = "button";
      accept.className = `${CLS}__accept`;
      accept.dataset.accept = post.id;
      accept.textContent = "채택";
      meta.append(accept);
    }
    bodyCol.append(meta);

    const content = document.createElement("div");
    content.className = `${CLS}__content`;
    content.textContent = typeof post.body === "string" ? post.body : "";
    bodyCol.append(content);

    if (post.replies && post.replies.length > 0) {
      const replies = document.createElement("div");
      replies.className = `${CLS}__replies`;
      for (const r of post.replies) replies.append(this.#buildPost(r, depth + 1));
      bodyCol.append(replies);
    }

    article.append(votes, bodyCol);
    return article;
  }

  #voteButton(dir: "up" | "down", id: string, active: boolean, label: string): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `${CLS}__vote`;
    btn.dataset.dir = dir;
    btn.dataset.id = id;
    btn.setAttribute("aria-pressed", String(active));
    btn.setAttribute("aria-label", label);
    btn.textContent = dir === "up" ? "▲" : "▼";
    return btn;
  }

  #avatar(post: ForumPost): HTMLElement {
    if (post.authorAvatar) {
      const img = document.createElement("img");
      img.className = `${CLS}__avatar-img`;
      img.alt = "";
      img.src = post.authorAvatar;
      return img;
    }
    const fb = document.createElement("span");
    fb.className = `${CLS}__avatar-fallback`;
    fb.setAttribute("aria-hidden", "true");
    fb.textContent = post.authorName ? post.authorName.slice(0, 1) : "";
    return fb;
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
    const vote = target.closest<HTMLButtonElement>(`.${CLS}__vote`);
    if (vote?.dataset.id) {
      const pressed = vote.getAttribute("aria-pressed") === "true";
      const base = vote.dataset.dir === "up" ? 1 : -1;
      const dir = (pressed ? 0 : base) as 1 | -1 | 0;
      this.emit("jd-vote", { id: vote.dataset.id, dir });
      return;
    }
    const accept = target.closest<HTMLButtonElement>(`.${CLS}__accept`);
    if (accept?.dataset.accept) this.emit("jd-accept", { id: accept.dataset.accept });
  };

  protected override update(): void {
    if (!this.#root) return;
    this.#root.setAttribute("role", "region");
    this.#root.setAttribute("aria-labelledby", this.#titleEl.id);
    this.#renderHeader();
    if (this.acceptable !== this.#builtAcceptable) this.#rebuildPosts();
  }

  /** 트리 안 모든 <time>을 now 기준 상대 표기로 갱신(connected 이후에만). */
  #applyRelativeTime(): void {
    const now = Date.now();
    const times = this.#root.querySelectorAll<HTMLTimeElement>(`.${CLS}__time[datetime]`);
    times.forEach((t) => {
      const iso = t.getAttribute("datetime");
      const dt = iso ? toDate(iso) : null;
      if (dt) t.textContent = relativeTime(dt, now);
    });
  }
}
