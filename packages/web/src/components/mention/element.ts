/**
 * <jd-mention> — `@` 트리거 멘션 입력 (v2 composites/Mention).
 *
 * **파생 판단(§6 R12) 2건, 둘 다 접었다.**
 *  - `jd-combobox` 상속: 팝업·필터·화살표 내비 골격은 닮았지만 상속의 축인
 *    `inputEl: HTMLInputElement`가 여기서는 **textarea**이고, `value`의 의미도
 *    정반대다(콤보박스는 선택된 옵션 값, 멘션은 본문 전체 텍스트). 물려받는 즉시
 *    전 protected 훅을 갈아끼워야 해서 남는 것이 없다.
 *  - `jd-textarea` 합성: 값·자동 리사이즈를 공짜로 얻지만, 안쪽에서 올라오는
 *    `jd-input`/`jd-change`가 같은 이름으로 이중 발행되고(§1.5 위반) aria-controls·
 *    activedescendant를 붙일 네이티브 노드를 남의 골격에서 꺼내 써야 한다.
 *    대신 입력 표면의 **시각 언어**(card 80% 유리 배경·글로우 포커스·radius xl)는
 *    jd-textarea와 같게 맞췄다 — 물려받을 값어치가 있던 것은 그쪽이다.
 *
 * **팝업은 포털하지 않는다**(jd-auto-complete와 같은 결정): v2는 body로 포털해
 * `getBoundingClientRect()`로 fixed 좌표를 매 입력마다 다시 쟀다. 스크롤·리사이즈에는
 * 갱신이 없어 팝업이 입력창을 떠났고, 좌표 측정은 프리렌더에서 비결정적이다.
 * v3는 호스트 안 absolute다 — light DOM이라 포털 없이도 aria id 참조가 성립한다.
 *
 * v2 대비 교정 5건:
 *  1. **접근성이 0이었다.** 팝업이 `<button>` 나열이라 목록도 옵션도 아니었고
 *     입력창은 팝업의 존재조차 알리지 않았다. v3는 role=listbox/option +
 *     `aria-controls`/`aria-activedescendant`/`aria-autocomplete="list"` +
 *     결과 수를 알리는 live 리전이다. (textarea에는 role을 덮지 않는다 —
 *     ARIA in HTML이 textarea에 다른 role을 허용하지 않고, 덮으면 multiline
 *     의미까지 잃는다. 그래서 combobox role 대신 textbox+activedescendant 조합.)
 *  2. **입력창을 클릭하면 팝업이 닫혔다.** 클릭아웃 대상이 드롭다운이어서
 *     textarea 클릭이 "바깥"이었다. v3는 호스트 기준이라 캐럿 이동으로 닫히지 않고,
 *     대신 캐럿이 움직이면 **트리거 문맥을 다시 판정**한다(v2에 없던 동작).
 *  3. **결과가 없어도 열린 상태였다.** 화면엔 아무것도 없는데 ↓/Esc를 삼켰다.
 *     v3에서 `open`은 곧 "팝업이 보인다"이다.
 *  4. **IME 조합 중 Enter가 멘션을 확정했다.** 한글 조합을 끝내는 Enter가
 *     행 선택으로 새어 나갔다. v3는 `isComposing`을 먼저 본다.
 *  5. **Tab으로 나가도 팝업이 남았다.** v3는 focusout으로 닫는다.
 *
 * users는 복합 데이터라 property 전용 + 자식 `<script type="application/json">`
 * 슬롯(§1.3 · jd-radio-group 선례).
 *
 * 이벤트(§1.5):
 *  - `jd-input`  {value}            타이핑 즉시 (v2 onChange)
 *  - `jd-change` {value}            네이티브 change(포커스 이탈 시 확정)
 *  - `jd-select` {key, label, value} 멘션 삽입 확정 — value는 삽입 후 본문 전체
 *  - `jd-open` / `jd-close`         팝업 표시 상태 변화 후
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { createClickOutside, createKeyHandler } from "../../behaviors/input.js";
import mentionStyles from "./mention.css.js";

export interface JdMentionUser {
  key: string;
  label: string;
  /** 아바타 이미지 URL. 없으면 라벨 첫 글자 원 */
  avatar?: string;
  /** 추가 설명 — 필터 대상에도 포함된다(v2 동형) */
  description?: string;
}

/** IME 조합 중 확정키가 새어 나가는 것을 막는다(교정 4) */
function composing(e: KeyboardEvent): boolean {
  return e.isComposing === true || e.keyCode === 229;
}

export class JdMention extends JdElement {
  static override tag = "jd-mention";
  static override props = {
    /** 본문 전체 텍스트. 타이핑마다 attribute를 되쓰지 않는다(jd-text-field 선례) */
    value: { type: String },
    /** 멘션을 여는 문자 (v2 기본 "@") */
    trigger: { type: String, default: "@" },
    placeholder: { type: String, default: "내용을 입력하세요..." },
    /** 주면 안쪽 textarea가 조상 <form>에 참여한다(§1.6-1 light DOM 위임) */
    name: { type: String },
    /** 0이면 네이티브 기본 — 높이는 CSS min-height가 잡는다 */
    rows: { type: Number, default: 0 },
    disabled: { type: Boolean, reflect: true },
    /** 팝업 표시 여부 — 트리거 판정 결과로 내부에서 정해진다(스타일 훅) */
    open: { type: Boolean, reflect: true },
  };

  declare value: string;
  declare trigger: string;
  declare placeholder: string;
  declare name: string;
  declare rows: number;
  declare disabled: boolean;
  declare open: boolean;

  #users: JdMentionUser[] = [];
  #items: JdMentionUser[] = [];
  /** 트리거 문자의 인덱스. null이면 멘션 문맥 아님 */
  #mentionStart: number | null = null;
  #query = "";
  #activeIndex = 0;
  #wasOpen = false;
  #pendingScroll = false;
  #announced = "";

  #ta!: HTMLTextAreaElement;
  #popup!: HTMLElement;
  #list!: HTMLUListElement;
  #status!: HTMLElement;
  #listId = "";

  get users(): JdMentionUser[] {
    return this.#users;
  }
  set users(v: JdMentionUser[]) {
    this.#users = Array.isArray(v) ? v : [];
    this.#recompute();
  }

  /** 현재 팝업에 걸린(필터된) 사용자 목록 */
  get suggestions(): JdMentionUser[] {
    return this.#items;
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(mentionStyles);
    this.#upgradeOwn("users");
    this.#readJson();

    const existing = this.querySelector<HTMLTextAreaElement>(":scope > textarea.jd-mention__input");
    if (existing) {
      // 입양(§3.3)
      this.#ta = existing;
      this.#popup = this.querySelector(":scope > .jd-mention__popup")!;
      this.#list = this.#popup.querySelector(".jd-mention__list")!;
      this.#status =
        this.querySelector<HTMLElement>(":scope > .jd-mention__status") ?? this.#buildStatus();
    } else {
      this.#build();
    }
    this.#listId = this.#list.id;
    this.update();
  }

  #build(): void {
    const id = jdUid("jd-mention");

    this.#ta = document.createElement("textarea");
    this.#ta.className = "jd-mention__input";
    this.#ta.id = `${id}-input`;
    this.#ta.setAttribute("autocomplete", "off");
    // textarea의 textbox role은 유지한다 — 지원 프로퍼티만 얹는다(교정 1)
    this.#ta.setAttribute("aria-autocomplete", "list");
    this.#ta.setAttribute("aria-haspopup", "listbox");

    this.#list = document.createElement("ul");
    this.#list.className = "jd-mention__list";
    this.#list.id = `${id}-list`;
    this.#list.setAttribute("role", "listbox");
    this.#list.setAttribute("aria-label", "사용자 추천");

    this.#popup = document.createElement("div");
    this.#popup.className = "jd-mention__popup";
    this.#popup.hidden = true;
    this.#popup.append(this.#list);

    this.append(this.#ta, this.#popup);
    this.#status = this.#buildStatus();
  }

  /** 결과 수는 목록 밖에서만 알 수 있다 — activedescendant가 못 말하는 정보 */
  #buildStatus(): HTMLElement {
    const status = document.createElement("span");
    status.className = "jd-mention__status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    this.append(status);
    return status;
  }

  /** 업그레이드 전에 대입된 `users`는 베이스의 #upgradeProps 대상이 아니다(§1.3) */
  #upgradeOwn(name: string): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const self = this as unknown as Record<string, unknown>;
    const v = self[name];
    delete self[name];
    self[name] = v;
  }

  /** 선언적 초기화 슬롯 — 1회 소비 */
  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as unknown;
      if (Array.isArray(parsed)) this.#users = parsed as JdMentionUser[];
    } catch {
      console.warn("[junds] <jd-mention> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /* ── 수명주기 ─────────────────────────────────────────────────────── */

  protected override connected(): void {
    this.#ta.addEventListener("input", this.#onInput);
    this.#ta.addEventListener("change", this.#onChange);
    this.#ta.addEventListener("click", this.#onCaretMove);
    this.#ta.addEventListener("keyup", this.#onKeyUp);
    // 팝업 mousedown 차단 — 포커스가 입력창을 떠나 click이 유실되는 것을 막는다
    this.#popup.addEventListener("mousedown", this.#onPopupPointer);
    this.#list.addEventListener("click", this.#onListClick);
    this.addEventListener("focusout", this.#onFocusOut);

    this.own(
      createClickOutside(this, () => {
        if (this.open || this.#mentionStart !== null) this.#close();
      }),
    );
    this.own(
      createKeyHandler(
        this,
        {
          escape: this.#onEscape,
          arrowdown: (e) => this.#onArrow(e, 1),
          arrowup: (e) => this.#onArrow(e, -1),
          enter: this.#onEnter,
        },
        { enableOnFormTags: true, preventDefault: false },
      ),
    );
  }

  protected override disconnected(): void {
    this.#ta?.removeEventListener("input", this.#onInput);
    this.#ta?.removeEventListener("change", this.#onChange);
    this.#ta?.removeEventListener("click", this.#onCaretMove);
    this.#ta?.removeEventListener("keyup", this.#onKeyUp);
    this.#popup?.removeEventListener("mousedown", this.#onPopupPointer);
    this.#list?.removeEventListener("click", this.#onListClick);
    this.removeEventListener("focusout", this.#onFocusOut);
  }

  /* ── 트리거 판정 ──────────────────────────────────────────────────── */

  /**
   * 캐럿 앞 텍스트에서 멘션 문맥을 찾는다 (v2 handleChange 이식).
   * 유효 조건: 트리거 이후에 공백이 없고, 트리거 앞이 문자열 시작이거나 공백/줄바꿈.
   */
  #detect(): void {
    const value = this.#ta.value;
    const cursor = this.#ta.selectionStart ?? value.length;
    const trigger = this.trigger || "@";
    const before = value.slice(0, cursor);
    const at = before.lastIndexOf(trigger);
    if (at >= 0) {
      const between = before.slice(at + trigger.length);
      const prev = at === 0 ? "" : value[at - 1];
      if (!between.includes(" ") && (at === 0 || prev === " " || prev === "\n")) {
        if (this.#mentionStart !== at || this.#query !== between) this.#activeIndex = 0;
        this.#mentionStart = at;
        this.#query = between;
        return;
      }
    }
    this.#mentionStart = null;
    this.#query = "";
  }

  /** v2 filtered — 라벨/설명 부분일치, 질의가 비면 전량 */
  #filter(): JdMentionUser[] {
    if (this.#mentionStart === null) return [];
    const q = this.#query.toLowerCase();
    if (!q) return this.#users.slice();
    return this.#users.filter(
      (u) => u.label.toLowerCase().includes(q) || Boolean(u.description?.toLowerCase().includes(q)),
    );
  }

  /** 문맥 → 목록 → open 순으로 상태를 다시 세운다. update()에서 부르지 않는다 */
  #recompute(detect = false): void {
    if (detect) this.#detect();
    const next = this.#filter();
    this.#items = next;
    if (this.#activeIndex >= next.length) this.#activeIndex = 0;
    const shouldOpen = !this.disabled && this.#mentionStart !== null && next.length > 0;
    if (this.open !== shouldOpen) this.open = shouldOpen; // → requestUpdate
    else this.requestUpdate();
  }

  #close(): void {
    this.#mentionStart = null;
    this.#query = "";
    this.#items = [];
    this.#activeIndex = 0;
    if (this.open) this.open = false;
    else this.requestUpdate();
  }

  /* ── 이벤트 ────────────────────────────────────────────────────────── */

  #onInput = (): void => {
    this.value = this.#ta.value; // → requestUpdate
    this.#recompute(true);
    this.emit("jd-input", { value: this.#ta.value });
  };

  #onChange = (): void => {
    this.emit("jd-change", { value: this.#ta.value });
  };

  /** 캐럿이 움직이면 문맥이 달라진다 — v2에 없던 재판정(교정 2) */
  #onCaretMove = (): void => {
    this.#recompute(true);
  };

  #onKeyUp = (e: KeyboardEvent): void => {
    if (composing(e)) return;
    // ↑/↓/Enter는 목록 조작이다 — 캐럿 재판정 대상이 아니다
    if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Home" || e.key === "End") {
      this.#recompute(true);
    }
  };

  #onPopupPointer = (e: MouseEvent): void => {
    e.preventDefault();
  };

  #onListClick = (e: Event): void => {
    const row = (e.target as Element | null)?.closest<HTMLElement>(".jd-mention__option");
    if (!row || !this.#list.contains(row)) return;
    const i = Array.prototype.indexOf.call(this.#list.children, row);
    const user = this.#items[i];
    if (user) this.#pick(user);
  };

  #onFocusOut = (e: FocusEvent): void => {
    if (!this.open) return;
    const next = e.relatedTarget as Node | null;
    if (next && this.contains(next)) return;
    this.#close();
  };

  #onEscape = (e: KeyboardEvent): void => {
    if (!this.open) return;
    e.preventDefault();
    e.stopPropagation(); // 조상 오버레이가 함께 닫히지 않게(jd-modal 선례)
    this.#close();
  };

  #onArrow = (e: KeyboardEvent, delta: number): void => {
    if (!this.open || composing(e)) return;
    e.preventDefault(); // 캐럿 줄 이동 대신 목록 이동
    const n = this.#items.length;
    if (n === 0) return;
    // v2 동형 — 끝에서 멈춘다(순환 없음)
    const next = Math.min(n - 1, Math.max(0, this.#activeIndex + delta));
    if (next === this.#activeIndex) return;
    this.#activeIndex = next;
    this.#pendingScroll = true;
    this.requestUpdate();
  };

  #onEnter = (e: KeyboardEvent): void => {
    if (!this.open || composing(e)) return;
    if (e.shiftKey) return; // Shift+Enter는 줄바꿈 — 여기까지 오지도 않는다(chord 불일치)
    const user = this.#items[this.#activeIndex];
    if (!user) return;
    e.preventDefault();
    this.#pick(user);
  };

  /* ── 삽입 ─────────────────────────────────────────────────────────── */

  /** v2 handleSelect 이식 — 트리거~캐럿 구간을 `@라벨 `로 치환하고 캐럿을 뒤로 옮긴다 */
  #pick(user: JdMentionUser): void {
    const start = this.#mentionStart;
    if (start === null) return;
    const text = this.#ta.value;
    const cursor = this.#ta.selectionStart ?? text.length;
    const trigger = this.trigger || "@";
    const before = text.slice(0, start);
    const after = text.slice(Math.max(cursor, start));
    const mention = `${trigger}${user.label} `;
    const next = before + mention + after;
    const caret = before.length + mention.length;

    this.value = next;
    this.#ta.value = next;
    this.#close();

    // 포커스·캐럿 복원. 렌더 단계가 아니라 이벤트 시점이라 §3.1-3과 무관하다
    this.#ta.focus();
    this.#ta.setSelectionRange(caret, caret);

    this.emit("jd-select", { key: user.key, label: user.label, value: next });
    this.emit("jd-input", { value: next });
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  #buildRow(id: string): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "jd-mention__option";
    li.id = id;
    li.setAttribute("role", "option");
    const media = document.createElement("span");
    media.className = "jd-mention__media";
    media.setAttribute("aria-hidden", "true"); // 이름은 아래 라벨이 말한다
    const body = document.createElement("span");
    body.className = "jd-mention__body";
    const label = document.createElement("span");
    label.className = "jd-mention__label";
    const desc = document.createElement("span");
    desc.className = "jd-mention__desc";
    body.append(label, desc);
    li.append(media, body);
    return li;
  }

  #syncRow(row: HTMLElement, user: JdMentionUser, i: number, open: boolean): void {
    row.dataset.key = user.key;

    const media = row.querySelector<HTMLElement>(".jd-mention__media")!;
    const wantImage = Boolean(user.avatar);
    const hasImage = media.firstElementChild?.tagName === "IMG";
    if (wantImage !== hasImage) media.textContent = "";
    if (wantImage) {
      let img = media.firstElementChild as HTMLImageElement | null;
      if (!img) {
        img = document.createElement("img");
        img.className = "jd-mention__avatar";
        img.alt = ""; // 장식 — 라벨이 이름을 말한다
        media.append(img);
      }
      if (img.getAttribute("src") !== user.avatar) img.src = user.avatar!;
      media.removeAttribute("data-initial");
    } else {
      media.textContent = user.label.slice(0, 1);
      media.setAttribute("data-initial", "");
    }

    row.querySelector<HTMLElement>(".jd-mention__label")!.textContent = user.label;
    const desc = row.querySelector<HTMLElement>(".jd-mention__desc")!;
    desc.textContent = user.description ?? "";
    desc.hidden = !user.description;

    const active = open && i === this.#activeIndex;
    row.toggleAttribute("data-active", active);
    // activedescendant 모델에서 "지금 확정될 항목"이 곧 선택 항목이다
    row.setAttribute("aria-selected", String(active));
  }

  protected override update(): void {
    // disabled로 넘어가면 팝업이 남을 수 없다. 이번 패스부터 닫힌 것으로 그린다
    // (this.open 대입은 다음 update를 부르지만 값이 같아져 곧바로 수렴한다).
    if (this.disabled && this.open) this.open = false;
    const open = this.open && !this.disabled;

    const ta = this.#ta;
    ta.placeholder = this.placeholder;
    ta.disabled = this.disabled;
    if (this.name) ta.name = this.name;
    else ta.removeAttribute("name");
    if (this.rows > 0) ta.rows = this.rows;
    // IME 안전: 실제로 다를 때만 되쓴다(조합 중 재대입이 조합을 끊는다)
    if (ta.value !== this.value) ta.value = this.value;

    // 행 골격 재구축 판정은 **DOM에서 읽는다**(개수만) — 캐시 키를 쓰면 첫 update가
    // 무조건 재구축이라 SSR/프리렌더 골격 입양(§3.3)이 성립하지 않는다. 행 구조는
    // 전부 동일하고(아바타/이니셜 전환까지 #syncRow가 처리) 행 id는 인덱스 파생이다.
    if (this.#list.childElementCount !== this.#items.length) {
      this.#list.textContent = "";
      this.#items.forEach((_, i) => this.#list.append(this.#buildRow(`${this.#listId}-opt-${i}`)));
    }
    this.#items.forEach((user, i) =>
      this.#syncRow(this.#list.children[i] as HTMLElement, user, i, open),
    );

    this.#popup.hidden = !open;
    ta.setAttribute("aria-controls", this.#listId);
    const row = open
      ? (this.#list.children[this.#activeIndex] as HTMLElement | undefined)
      : undefined;
    if (row) ta.setAttribute("aria-activedescendant", row.id);
    else ta.removeAttribute("aria-activedescendant");

    if (this.#pendingScroll) {
      this.#pendingScroll = false;
      if (row && typeof row.scrollIntoView === "function") row.scrollIntoView({ block: "nearest" });
    }

    // 결과 수 공지 — 같은 문구를 반복 대입하면 AT가 무시하므로 변할 때만 쓴다
    const message = open ? `사용자 ${this.#items.length}명 추천됨` : "";
    if (message !== this.#announced) {
      this.#announced = message;
      this.#status.textContent = message;
    }

    if (open && !this.#wasOpen) {
      this.#wasOpen = true;
      this.emit("jd-open");
    } else if (!open && this.#wasOpen) {
      this.#wasOpen = false;
      this.emit("jd-close");
    }
  }

  override focus(options?: FocusOptions): void {
    this.#ta?.focus(options);
  }
}
