/**
 * <jd-email-inbox> — 3-pane 메일 인박스 (v2 patterns/EmailInbox).
 * 폴더 / 리스트(검색 필터) / 본문 패널. 모바일은 1-pane(리스트) 스택.
 *
 * 데이터(§1.3): `folders`·`messages`(배열)는 property 전용 + 자식 `<script type="application/json"
 *   data-jd-json="folders|messages">` 슬롯(다중 데이터라 data-jd-json 키로 구분).
 * 검색은 내부 상태(`search`) — 네이티브 <input> 위임(§1.6-1), IME 안전(값 동일 시 미갱신).
 * 결정성(§3.1-3): "오늘" 상대 시간은 now가 필요하므로 render/update에서 now를 읽지 않고
 *   절대 날짜로 그린 뒤, connected()에서 now를 심고 재갱신한다(프리렌더 스냅샷 안정).
 * 이벤트: jd-folder-change{id} · jd-message-select{id} · jd-toggle-star{id} · jd-search{value}.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import emailInboxStyles from "./email-inbox.css.js";

export interface JdEmailFolder {
  id: string;
  label: string;
  unreadCount?: number;
  /** 이모지/텍스트 아이콘 */
  icon?: string;
}

export interface JdEmailMessage {
  id: string;
  folderId: string;
  from: string;
  fromAvatar?: string;
  subject: string;
  preview: string;
  body?: string;
  receivedAt: string | number;
  unread?: boolean;
  starred?: boolean;
  attachments?: number;
  labels?: string[];
}

export class JdEmailInbox extends JdElement {
  static override tag = "jd-email-inbox";
  static override props = {
    activeFolderId: { type: String }, // attr: active-folder-id
    activeMessageId: { type: String }, // attr: active-message-id
    search: { type: String },
  };

  declare activeFolderId: string;
  declare activeMessageId: string;
  declare search: string;

  #folders: JdEmailFolder[] = [];
  #messages: JdEmailMessage[] = [];
  #foldersVer = 0;
  #messagesVer = 0;
  #now: number | null = null;

  get folders(): JdEmailFolder[] {
    return this.#folders;
  }
  set folders(v: JdEmailFolder[]) {
    this.#folders = Array.isArray(v) ? v : [];
    this.#foldersVer++;
    this.requestUpdate();
  }
  get messages(): JdEmailMessage[] {
    return this.#messages;
  }
  set messages(v: JdEmailMessage[]) {
    this.#messages = Array.isArray(v) ? v : [];
    this.#messagesVer++;
    this.requestUpdate();
  }

  #folderSig = "";
  #listSig = "";
  #readerSig = "";

  #folderList!: HTMLUListElement;
  #searchInput!: HTMLInputElement;
  #items!: HTMLUListElement;
  #listEmpty!: HTMLElement;
  #reader!: HTMLElement;

  protected render(): void {
    adoptStyles(emailInboxStyles);
    this.#readJsonSlots();

    if (!this.querySelector(":scope > .jd-email-inbox__list")) this.#build();
    this.#cacheRefs();
    this.update();
  }

  #readJsonSlots(): void {
    const scripts = this.querySelectorAll<HTMLScriptElement>(':scope > script[type="application/json"]');
    scripts.forEach((s) => {
      const key = s.dataset.jdJson || "messages";
      try {
        const parsed = JSON.parse(s.textContent || "[]");
        if (Array.isArray(parsed)) {
          if (key === "folders") this.#folders = parsed as JdEmailFolder[];
          else this.#messages = parsed as JdEmailMessage[];
        }
      } catch {
        console.warn(`[junds] <jd-email-inbox> JSON 슬롯(${key}) 파싱 실패 — 무시합니다.`);
      }
      s.remove();
    });
  }

  #build(): void {
    // 데이터 구동 — 원본 노드 제거
    this.textContent = "";
    const nav = document.createElement("nav");
    nav.className = "jd-email-inbox__folders";
    nav.setAttribute("aria-label", "폴더");
    nav.innerHTML = '<ul class="jd-email-inbox__folder-list"></ul>';

    const list = document.createElement("div");
    list.className = "jd-email-inbox__list";
    list.innerHTML =
      '<div class="jd-email-inbox__search">' +
      '<input type="search" class="jd-email-inbox__search-input" placeholder="검색…" aria-label="이메일 검색" />' +
      "</div>" +
      '<ul class="jd-email-inbox__items" aria-label="메일 목록"></ul>' +
      '<div class="jd-email-inbox__list-empty" hidden>' +
      '<div class="jd-email-inbox__empty-icon" aria-hidden="true">📭</div>' +
      '<p class="jd-email-inbox__empty-title">메일이 없습니다</p>' +
      '<p class="jd-email-inbox__empty-desc"></p>' +
      "</div>";

    const reader = document.createElement("article");
    reader.className = "jd-email-inbox__reader";
    reader.setAttribute("aria-label", "메일 본문");

    this.append(nav, list, reader);
  }

  #cacheRefs(): void {
    this.#folderList = this.querySelector(".jd-email-inbox__folder-list")!;
    this.#searchInput = this.querySelector(".jd-email-inbox__search-input")!;
    this.#items = this.querySelector(".jd-email-inbox__items")!;
    this.#listEmpty = this.querySelector(".jd-email-inbox__list-empty")!;
    this.#reader = this.querySelector(".jd-email-inbox__reader")!;
    this.setAttribute("role", "region");
    if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", "이메일 인박스");
  }

  protected override connected(): void {
    this.#folderList.addEventListener("click", this.#onFolderClick);
    this.#items.addEventListener("click", this.#onItemClick);
    this.#searchInput.addEventListener("input", this.#onSearchInput);
    // now 주입 후 상대 시간으로 재갱신(§3.1-3) — 강제 재빌드
    this.#now = Date.now();
    this.#listSig = "";
    this.#readerSig = "";
    this.requestUpdate();
  }

  protected override disconnected(): void {
    this.#folderList.removeEventListener("click", this.#onFolderClick);
    this.#items.removeEventListener("click", this.#onItemClick);
    this.#searchInput.removeEventListener("input", this.#onSearchInput);
  }

  #onFolderClick = (e: Event): void => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-folder-id]");
    if (!btn) return;
    const id = btn.dataset.folderId!;
    this.activeFolderId = id;
    this.emit("jd-folder-change", { id });
  };

  #onItemClick = (e: Event): void => {
    const t = e.target as HTMLElement;
    const star = t.closest<HTMLElement>("[data-star-id]");
    if (star) {
      e.stopPropagation();
      this.emit("jd-toggle-star", { id: star.dataset.starId! });
      return;
    }
    const item = t.closest<HTMLElement>("[data-message-id]");
    if (!item) return;
    const id = item.dataset.messageId!;
    this.activeMessageId = id;
    this.emit("jd-message-select", { id });
  };

  #onSearchInput = (): void => {
    this.search = this.#searchInput.value;
    this.emit("jd-search", { value: this.#searchInput.value });
  };

  /** now가 없으면 절대 날짜(결정적), 있으면 오늘=시간 / 그 외=월·일 */
  #fmt(d: string | number): string {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    if (this.#now !== null) {
      const n = new Date(this.#now);
      if (dt.toDateString() === n.toDateString()) {
        return new Intl.DateTimeFormat("ko", { hour: "2-digit", minute: "2-digit" }).format(dt);
      }
    }
    return new Intl.DateTimeFormat("ko", { month: "short", day: "numeric" }).format(dt);
  }

  #filtered(): JdEmailMessage[] {
    const base = this.#messages.filter((m) => m.folderId === this.activeFolderId);
    const q = (this.search || "").trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (m) =>
        m.subject.toLowerCase().includes(q) ||
        m.preview.toLowerCase().includes(q) ||
        m.from.toLowerCase().includes(q),
    );
  }

  protected override update(): void {
    // 검색 입력 미러(IME 안전)
    if (this.#searchInput.value !== (this.search || "")) this.#searchInput.value = this.search || "";

    const folderSig = `${this.#foldersVer}|${this.activeFolderId}`;
    if (folderSig !== this.#folderSig) {
      this.#folderSig = folderSig;
      this.#rebuildFolders();
    }

    const listSig = `${this.#messagesVer}|${this.activeFolderId}|${this.activeMessageId}|${this.search || ""}|${this.#now !== null}`;
    if (listSig !== this.#listSig) {
      this.#listSig = listSig;
      this.#rebuildList();
    }

    const readerSig = `${this.#messagesVer}|${this.activeMessageId}|${this.#now !== null}`;
    if (readerSig !== this.#readerSig) {
      this.#readerSig = readerSig;
      this.#rebuildReader();
    }
  }

  #rebuildFolders(): void {
    this.#folderList.textContent = "";
    for (const f of this.#folders) {
      const active = f.id === this.activeFolderId;
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "jd-email-inbox__folder";
      btn.dataset.folderId = f.id;
      btn.toggleAttribute("data-active", active);
      if (active) btn.setAttribute("aria-current", "true");

      const left = document.createElement("span");
      left.className = "jd-email-inbox__folder-label";
      if (f.icon) {
        const ic = document.createElement("span");
        ic.setAttribute("aria-hidden", "true");
        ic.textContent = f.icon;
        left.append(ic);
      }
      const label = document.createElement("span");
      label.className = "jd-email-inbox__folder-name";
      label.textContent = f.label;
      left.append(label);
      btn.append(left);

      if (f.unreadCount !== undefined && f.unreadCount > 0) {
        const count = document.createElement("span");
        count.className = "jd-email-inbox__folder-count";
        count.textContent = String(f.unreadCount);
        btn.append(count);
      }
      li.append(btn);
      this.#folderList.append(li);
    }
  }

  #rebuildList(): void {
    const filtered = this.#filtered();
    this.#items.textContent = "";
    const empty = filtered.length === 0;
    this.#listEmpty.hidden = !empty;
    this.#items.hidden = empty;
    if (empty) {
      const desc = this.#listEmpty.querySelector(".jd-email-inbox__empty-desc")!;
      desc.textContent = this.search ? "검색 결과 없음" : "받은 편지함이 비었습니다";
      return;
    }

    for (const m of filtered) {
      const active = m.id === this.activeMessageId;
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "jd-email-inbox__item";
      btn.dataset.messageId = m.id;
      btn.toggleAttribute("data-active", active);
      btn.toggleAttribute("data-unread", Boolean(m.unread));
      if (active) btn.setAttribute("aria-current", "true");

      const dot = document.createElement("span");
      dot.className = "jd-email-inbox__item-dot";
      dot.setAttribute("aria-hidden", "true");

      const main = document.createElement("div");
      main.className = "jd-email-inbox__item-main";
      main.innerHTML =
        '<div class="jd-email-inbox__item-top">' +
        '<span class="jd-email-inbox__item-from"></span>' +
        '<span class="jd-email-inbox__item-time"></span>' +
        "</div>" +
        '<p class="jd-email-inbox__item-subject"></p>' +
        '<p class="jd-email-inbox__item-preview"></p>';
      main.querySelector(".jd-email-inbox__item-from")!.textContent = m.from;
      main.querySelector(".jd-email-inbox__item-time")!.textContent = this.#fmt(m.receivedAt);
      main.querySelector(".jd-email-inbox__item-subject")!.textContent = m.subject;
      main.querySelector(".jd-email-inbox__item-preview")!.textContent = m.preview;

      const star = document.createElement("button");
      star.type = "button";
      star.className = "jd-email-inbox__star";
      star.dataset.starId = m.id;
      star.toggleAttribute("data-on", Boolean(m.starred));
      star.setAttribute("aria-label", m.starred ? "별표 해제" : "별표");
      star.setAttribute("aria-pressed", String(Boolean(m.starred)));
      star.textContent = m.starred ? "★" : "☆";

      btn.append(dot, main, star);
      li.append(btn);
      this.#items.append(li);
    }
  }

  #rebuildReader(): void {
    const msg = this.#messages.find((m) => m.id === this.activeMessageId) ?? null;
    this.#reader.textContent = "";
    if (!msg) {
      this.#reader.append(
        this.#emptyBlock("✉️", "메일을 선택하세요", "좌측 목록에서 읽을 메일을 클릭하세요."),
      );
      return;
    }

    const header = document.createElement("header");
    header.className = "jd-email-inbox__reader-header";
    const h2 = document.createElement("h2");
    h2.className = "jd-email-inbox__reader-subject";
    h2.textContent = msg.subject;
    header.append(h2);

    const meta = document.createElement("div");
    meta.className = "jd-email-inbox__reader-meta";
    if (msg.fromAvatar) {
      const img = document.createElement("img");
      img.className = "jd-email-inbox__reader-avatar";
      img.src = msg.fromAvatar;
      img.alt = "";
      meta.append(img);
    } else {
      const ph = document.createElement("span");
      ph.className = "jd-email-inbox__reader-avatar jd-email-inbox__reader-avatar--ph";
      ph.textContent = msg.from.slice(0, 1);
      meta.append(ph);
    }
    const from = document.createElement("span");
    from.className = "jd-email-inbox__reader-from";
    from.textContent = msg.from;
    meta.append(from);
    const time = document.createElement("span");
    time.textContent = this.#fmt(msg.receivedAt);
    meta.append(this.#sep(), time);
    if (msg.attachments !== undefined && msg.attachments > 0) {
      const att = document.createElement("span");
      att.setAttribute("aria-label", `첨부 ${msg.attachments}개`);
      att.textContent = `📎 ${msg.attachments}`;
      meta.append(this.#sep(), att);
    }
    header.append(meta);

    if (msg.labels && msg.labels.length) {
      const labels = document.createElement("div");
      labels.className = "jd-email-inbox__reader-labels";
      for (const l of msg.labels) {
        const chip = document.createElement("span");
        chip.className = "jd-email-inbox__reader-label";
        chip.textContent = l;
        labels.append(chip);
      }
      header.append(labels);
    }

    const body = document.createElement("div");
    body.className = "jd-email-inbox__reader-body";
    const p = document.createElement("p");
    p.textContent = msg.body ?? msg.preview;
    if (!msg.body) p.className = "jd-email-inbox__reader-fallback";
    body.append(p);

    this.#reader.append(header, body);
  }

  #sep(): HTMLElement {
    const s = document.createElement("span");
    s.setAttribute("aria-hidden", "true");
    s.textContent = "·";
    return s;
  }

  #emptyBlock(icon: string, title: string, desc: string): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "jd-email-inbox__reader-empty";
    wrap.innerHTML =
      `<div class="jd-email-inbox__empty-icon" aria-hidden="true">${icon}</div>` +
      '<p class="jd-email-inbox__empty-title"></p>' +
      '<p class="jd-email-inbox__empty-desc"></p>';
    wrap.querySelector(".jd-email-inbox__empty-title")!.textContent = title;
    wrap.querySelector(".jd-email-inbox__empty-desc")!.textContent = desc;
    return wrap;
  }
}
