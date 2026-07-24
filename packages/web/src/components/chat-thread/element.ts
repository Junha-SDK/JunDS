/**
 * <jd-chat-thread> — 채팅 스레드 (v2 patterns/ChatThread).
 * 작성자 연속 메시지 그룹핑 + 좌/우 정렬 + 읽음/전송중/실패 상태 + 타이핑 인디케이터 +
 * 새 메시지 자동 하단 스크롤. 입력창은 `[slot="composer"]`.
 *
 * 데이터(§1.3): `messages`(배열)는 property 전용 + `<script type="application/json">` 슬롯,
 *   `typingUsers`(문자열 배열)는 property 전용.
 * 결정성(§3.1-3): 시간 라벨은 메시지 자체 createdAt만 포맷(now 미사용). 자동 스크롤은
 *   레이아웃 부수효과라 update 말미에서만 수행.
 * 이벤트: jd-message-click{id} · jd-retry{id}.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import chatThreadStyles from "./chat-thread.css.js";

export interface JdChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  /** 텍스트 본문 */
  body: string;
  createdAt: string | number;
  attachmentUrl?: string;
  readBy?: string[];
  status?: "sending" | "sent" | "failed";
}

function timeLabel(d: string | number): string {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return new Intl.DateTimeFormat("ko", { hour: "2-digit", minute: "2-digit" }).format(dt);
}

function groupMessages(msgs: JdChatMessage[]): JdChatMessage[][] {
  const groups: JdChatMessage[][] = [];
  for (const m of msgs) {
    const last = groups[groups.length - 1];
    if (last && last[0]!.authorId === m.authorId) last.push(m);
    else groups.push([m]);
  }
  return groups;
}

export class JdChatThread extends JdElement {
  static override tag = "jd-chat-thread";
  static override props = {
    currentUserId: { type: String }, // attr: current-user-id
    noAutoScroll: { type: Boolean }, // attr: no-auto-scroll — 새 메시지 자동 하단 스크롤을 끈다
  };

  declare currentUserId: string;
  declare noAutoScroll: boolean;

  #messages: JdChatMessage[] = [];
  #typingUsers: string[] = [];
  #dirty = true;
  #lastRenderedId: string | null = null;

  get messages(): JdChatMessage[] {
    return this.#messages;
  }
  set messages(v: JdChatMessage[]) {
    this.#messages = Array.isArray(v) ? v : [];
    this.#dirty = true;
    this.requestUpdate();
  }
  get typingUsers(): string[] {
    return this.#typingUsers;
  }
  set typingUsers(v: string[]) {
    this.#typingUsers = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  #scroll!: HTMLElement;
  #groups!: HTMLElement;
  #typing!: HTMLElement;
  #typingText!: HTMLElement;
  #composer!: HTMLElement;

  protected render(): void {
    adoptStyles(chatThreadStyles);

    const json = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (json) {
      try {
        const parsed = JSON.parse(json.textContent || "[]") as JdChatMessage[];
        if (Array.isArray(parsed)) this.#messages = parsed;
      } catch {
        console.warn("[junds] <jd-chat-thread> JSON 슬롯 파싱 실패 — 무시합니다.");
      }
      json.remove();
    }

    if (!this.querySelector(":scope > .jd-chat-thread__scroll")) this.#build();
    this.#cacheRefs();
    this.update();
  }

  #build(): void {
    const composerSlot = this.querySelector<HTMLElement>(':scope > [slot="composer"]');
    // 데이터 구동 — composer 외 원본 노드는 제거
    for (const n of Array.from(this.childNodes)) {
      if (n !== composerSlot) n.remove();
    }

    const scroll = document.createElement("div");
    scroll.className = "jd-chat-thread__scroll";
    scroll.setAttribute("aria-live", "polite");
    scroll.innerHTML =
      '<div class="jd-chat-thread__groups"></div>' +
      '<div class="jd-chat-thread__typing" hidden aria-live="polite">' +
      '<span class="jd-chat-thread__typing-dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '<span class="jd-chat-thread__typing-text"></span>' +
      "</div>";

    const composer = document.createElement("div");
    composer.className = "jd-chat-thread__composer";
    if (composerSlot) composer.append(composerSlot);

    this.append(scroll, composer);
  }

  #cacheRefs(): void {
    this.#scroll = this.querySelector(".jd-chat-thread__scroll")!;
    this.#groups = this.querySelector(".jd-chat-thread__groups")!;
    this.#typing = this.querySelector(".jd-chat-thread__typing")!;
    this.#typingText = this.querySelector(".jd-chat-thread__typing-text")!;
    this.#composer = this.querySelector(".jd-chat-thread__composer")!;
    this.setAttribute("role", "log");
    if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", "채팅");
  }

  protected override connected(): void {
    this.#groups.addEventListener("click", this.#onClick);
  }
  protected override disconnected(): void {
    this.#groups.removeEventListener("click", this.#onClick);
  }

  #onClick = (e: Event): void => {
    const t = e.target as HTMLElement;
    const retry = t.closest<HTMLElement>("[data-retry]");
    if (retry) {
      e.stopPropagation();
      this.emit("jd-retry", { id: retry.dataset.retry! });
      return;
    }
    const bubble = t.closest<HTMLElement>("[data-msg-id]");
    if (bubble) this.emit("jd-message-click", { id: bubble.dataset.msgId! });
  };

  protected override update(): void {
    if (this.#dirty) {
      this.#dirty = false;
      this.#rebuild();
    }

    // 타이핑 인디케이터
    const typing = this.#typingUsers;
    this.#typing.hidden = typing.length === 0;
    if (typing.length) this.#typingText.textContent = `${typing.join(", ")} 입력 중…`;

    // 자동 스크롤 — 마지막 메시지 id가 바뀐 경우에만(레이아웃 부수효과는 update 말미)
    const lastId = this.#messages.length ? this.#messages[this.#messages.length - 1]!.id : null;
    if (!this.noAutoScroll && lastId !== this.#lastRenderedId) {
      this.#lastRenderedId = lastId;
      this.#scroll.scrollTop = this.#scroll.scrollHeight;
    }
  }

  #rebuild(): void {
    this.#groups.textContent = "";
    const me = this.currentUserId;
    for (const g of groupMessages(this.#messages)) {
      const author = g[0]!;
      const mine = author.authorId === me;
      const group = document.createElement("div");
      group.className = "jd-chat-thread__group";
      group.toggleAttribute("data-mine", mine);

      if (!mine) {
        const av = document.createElement("div");
        av.className = "jd-chat-thread__avatar";
        if (author.authorAvatar) {
          const img = document.createElement("img");
          img.src = author.authorAvatar;
          img.alt = "";
          av.append(img);
        } else {
          av.classList.add("jd-chat-thread__avatar--ph");
          av.textContent = author.authorName.slice(0, 1);
        }
        group.append(av);
      }

      const col = document.createElement("div");
      col.className = "jd-chat-thread__col";
      if (!mine) {
        const name = document.createElement("p");
        name.className = "jd-chat-thread__name";
        name.textContent = author.authorName;
        col.append(name);
      }

      g.forEach((m, mi) => {
        const isLast = mi === g.length - 1;
        const row = document.createElement("div");
        row.className = "jd-chat-thread__row";

        if (mine && isLast) row.append(this.#statusEl(m));

        const bubble = document.createElement("button");
        bubble.type = "button";
        bubble.className = "jd-chat-thread__bubble";
        bubble.dataset.msgId = m.id;
        if (m.status === "failed") bubble.toggleAttribute("data-failed", true);
        const text = document.createElement("span");
        text.className = "jd-chat-thread__text";
        text.textContent = m.body;
        bubble.append(text);
        if (m.attachmentUrl) {
          const img = document.createElement("img");
          img.className = "jd-chat-thread__attachment";
          img.src = m.attachmentUrl;
          img.alt = "";
          bubble.append(img);
        }
        row.append(bubble);

        if (!mine && isLast) {
          const time = document.createElement("span");
          time.className = "jd-chat-thread__time";
          time.textContent = timeLabel(m.createdAt);
          row.append(time);
        }
        col.append(row);
      });

      group.append(col);
      this.#groups.append(group);
    }
  }

  /** mine 마지막 메시지의 상태 라벨(실패=재전송 버튼 / 전송중 / 읽음 N) + 시간 */
  #statusEl(m: JdChatMessage): HTMLElement {
    const wrap = document.createElement("span");
    wrap.className = "jd-chat-thread__status";
    if (m.status === "failed") {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "jd-chat-thread__retry";
      btn.dataset.retry = m.id;
      btn.textContent = "재전송";
      wrap.append(btn);
    } else if (m.status === "sending") {
      const s = document.createElement("span");
      s.setAttribute("aria-label", "전송 중");
      s.textContent = "…";
      wrap.append(s);
    } else if ((m.readBy?.length ?? 0) > 0) {
      const s = document.createElement("span");
      s.setAttribute("aria-label", `${m.readBy!.length}명 읽음`);
      s.textContent = `읽음 ${m.readBy!.length}`;
      wrap.append(s);
    }
    const time = document.createElement("span");
    time.className = "jd-chat-thread__time";
    time.textContent = timeLabel(m.createdAt);
    wrap.append(time);
    return wrap;
  }
}
