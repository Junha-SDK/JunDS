/**
 * <jd-emoji-picker> — 분류·검색이 있는 이모지 판 (v2 composites/EmojiPicker).
 *
 * 분류 데이터 2경로(§1.3): `categories` 프로퍼티(Record<string, string[]>) 또는 자식
 * `<script type="application/json">{"표정": ["😀", …]}</script>` 슬롯. 미지정 시
 * v2 CATEGORIES 그대로.
 *
 * v2 대비 개선 3가지:
 *  1. **검색이 실제로 걸린다.** v2 useMemo는 `if (search) return 전체 이모지 유니크`
 *     였다 — 무엇을 쳐도 200여 개가 그대로 나왔다(사실상 무동작). v3는 분류명 매칭 +
 *     이모지 문자 매칭 + 선택적 `keywords` 사전으로 좁히고, 없으면 빈 상태를 알린다.
 *  2. **로빙 탭인덱스.** v2는 이모지 버튼 200여 개가 전부 탭 순서에 들어가 키보드
 *     사용자가 판을 빠져나갈 수 없었다. v3는 탭스톱 1개 + 화살표/Home/End 순회다
 *     (키 엔진은 behaviors/createKeyHandler 재사용 — 새로 만들지 않는다).
 *  3. 분류 버튼이 선택 상태를 aria-pressed로 노출한다(v2는 색으로만 표시).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createKeyHandler } from "../../behaviors/input.js";
import emojiPickerStyles from "./emoji-picker.css.js";

/** v2 CATEGORIES 그대로 */
const DEFAULT_CATEGORIES: Record<string, string[]> = {
  "자주 쓰는": ["😀","😂","❤️","👍","🎉","🔥","✨","💯","🙏","😍","🤔","👀","💪","🚀","⭐"],
  "표정": ["😀","😃","😄","😁","😅","😂","🤣","😊","😇","🙂","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕"],
  "손": ["👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏"],
  "동물": ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🦅","🦆","🦉","🐴","🦄","🐝","🐛","🦋","🐌","🐞"],
  "음식": ["🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🥑","🍕","🍔","🍟","🌭","🍿","🧁","🍰","🎂","🍫","🍬"],
  "활동": ["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🎮","🎯","🎲","🧩","🎭","🎨","🎵","🎶","🎤","🎧","🎸","🎹","🥁","🎺","🎻"],
  "기호": ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💝","💘","💌","💤","💢","💥","💦","💨","🕳️","💣","💬","🔔","🔕","📢"],
};

const DEFAULT_CATEGORY = "자주 쓰는";

const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));

export class JdEmojiPicker extends JdElement {
  static override tag = "jd-emoji-picker";
  static override props = {
    /** 현재 분류 (검색 중에는 무시된다) */
    category: { type: String, default: DEFAULT_CATEGORY, reflect: true },
    /** 검색어 — 입력창과 양방향 */
    search: { type: String },
    /** 격자 열 수. v2 grid-cols-8 */
    columns: { type: Number, default: 8 },
    searchPlaceholder: { type: String, default: "이모지 검색..." },
    emptyText: { type: String, default: "결과가 없습니다" },
    /** 판 전체 접근 이름 */
    label: { type: String },
  };

  declare category: string;
  declare search: string;
  declare columns: number;
  declare searchPlaceholder: string;
  declare emptyText: string;
  declare label: string;

  #categories: Record<string, string[]> = DEFAULT_CATEGORIES;
  #keywords: Record<string, string[]> = {};

  #searchInput!: HTMLInputElement;
  #tabs!: HTMLElement;
  #grid!: HTMLElement;
  #empty!: HTMLElement;
  #tabButtons: HTMLButtonElement[] = [];
  #buttons: HTMLButtonElement[] = [];
  #visible: string[] = [];
  #activeIndex = 0;

  get categories(): Record<string, string[]> {
    return this.#categories;
  }
  set categories(v: Record<string, string[]>) {
    this.#categories = v && typeof v === "object" ? v : {};
    this.requestUpdate();
  }

  /** 이모지 → 검색 키워드 사전. 있으면 검색이 이름으로도 걸린다 */
  get keywords(): Record<string, string[]> {
    return this.#keywords;
  }
  set keywords(v: Record<string, string[]>) {
    this.#keywords = v && typeof v === "object" ? v : {};
    this.requestUpdate();
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(emojiPickerStyles);
    this.#readJson();
    const existing = this.querySelector<HTMLElement>(":scope > .jd-emoji-picker__grid");
    if (existing) this.#adopt(existing);
    else this.#build();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "{}") as Record<string, string[]>;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) this.#categories = parsed;
    } catch {
      console.warn("[junds] <jd-emoji-picker> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #adopt(grid: HTMLElement): void {
    this.#grid = grid;
    this.#searchInput = this.querySelector(".jd-emoji-picker__search-input")!;
    this.#tabs = this.querySelector(".jd-emoji-picker__tabs")!;
    this.#empty = this.querySelector(".jd-emoji-picker__empty")!;
  }

  #build(): void {
    const searchRow = document.createElement("div");
    searchRow.className = "jd-emoji-picker__search";
    this.#searchInput = document.createElement("input");
    this.#searchInput.type = "search";
    this.#searchInput.className = "jd-emoji-picker__search-input";
    this.#searchInput.autocomplete = "off";
    this.#searchInput.setAttribute("aria-label", "이모지 검색");
    searchRow.append(this.#searchInput);

    this.#tabs = document.createElement("div");
    this.#tabs.className = "jd-emoji-picker__tabs";
    this.#tabs.setAttribute("role", "group");
    this.#tabs.setAttribute("aria-label", "이모지 분류");

    this.#grid = document.createElement("div");
    this.#grid.className = "jd-emoji-picker__grid";
    this.#grid.setAttribute("role", "group");
    this.#grid.setAttribute("aria-label", "이모지");

    this.#empty = document.createElement("p");
    this.#empty.className = "jd-emoji-picker__empty";
    this.#empty.hidden = true;

    this.append(searchRow, this.#tabs, this.#grid, this.#empty);
  }

  /* ── 수명 ─────────────────────────────────────────────────────────── */

  protected override connected(): void {
    this.#searchInput.addEventListener("input", this.#onSearch);
    this.#tabs.addEventListener("click", this.#onTabClick);
    this.#grid.addEventListener("click", this.#onEmojiClick);
    // 키 엔진 재사용(WEB-10) — 격자 로빙은 이 맵이 전부다
    this.own(
      createKeyHandler(this.#grid, {
        arrowright: () => this.#move(1),
        arrowleft: () => this.#move(-1),
        arrowdown: () => this.#move(this.#cols()),
        arrowup: () => this.#move(-this.#cols()),
        home: () => this.#focusIndex(0),
        end: () => this.#focusIndex(this.#buttons.length - 1),
      }),
    );
  }

  protected override disconnected(): void {
    this.#searchInput?.removeEventListener("input", this.#onSearch);
    this.#tabs?.removeEventListener("click", this.#onTabClick);
    this.#grid?.removeEventListener("click", this.#onEmojiClick);
  }

  #cols(): number {
    return this.columns > 0 ? this.columns : 8;
  }

  #onSearch = (): void => {
    this.search = this.#searchInput.value;
  };

  #onTabClick = (e: Event): void => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".jd-emoji-picker__tab");
    if (!btn) return;
    this.category = btn.value;
  };

  #onEmojiClick = (e: Event): void => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".jd-emoji-picker__emoji");
    if (!btn) return;
    const i = this.#buttons.indexOf(btn);
    if (i >= 0) this.#activeIndex = i;
    this.emit("jd-select", { emoji: btn.value });
  };

  #move(delta: number): void {
    if (this.#buttons.length === 0) return;
    this.#focusIndex(clamp(this.#activeIndex + delta, 0, this.#buttons.length - 1));
  }

  #focusIndex(i: number): void {
    const btn = this.#buttons[i];
    if (!btn) return;
    this.#activeIndex = i;
    this.#syncRoving();
    btn.focus();
  }

  /** 탭스톱 1개 — 나머지는 -1 (로빙) */
  #syncRoving(): void {
    this.#buttons.forEach((b, i) => {
      b.tabIndex = i === this.#activeIndex ? 0 : -1;
    });
  }

  /* ── 목록 계산 ────────────────────────────────────────────────────── */

  /**
   * v2의 무동작 검색을 실제 필터로 교체한다.
   * 분류명 매칭 → 그 분류 전체, 이모지 문자 매칭(붙여넣기 검색), keywords 사전 매칭.
   */
  #computeVisible(): string[] {
    const raw = this.search.trim();
    const entries = Object.entries(this.#categories);
    if (!raw) {
      return this.#categories[this.category] ?? entries[0]?.[1] ?? [];
    }
    const q = raw.toLowerCase();
    const out: string[] = [];
    const seen = new Set<string>();
    for (const [name, list] of entries) {
      const nameHit = name.toLowerCase().includes(q);
      for (const emoji of list) {
        if (seen.has(emoji)) continue;
        const kwHit = this.#keywords[emoji]?.some((k) => k.toLowerCase().includes(q)) ?? false;
        if (nameHit || kwHit || emoji.includes(raw)) {
          seen.add(emoji);
          out.push(emoji);
        }
      }
    }
    return out;
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    this.#searchInput.placeholder = this.searchPlaceholder;
    // 입력 중인 값을 덮어쓰지 않는다(IME 안전 — text-field 관용구)
    if (
      this.#searchInput !== this.ownerDocument.activeElement &&
      this.#searchInput.value !== this.search
    ) {
      this.#searchInput.value = this.search;
    }

    const searching = this.search.trim().length > 0;
    this.#tabs.hidden = searching; // v2: 검색 중에는 분류 줄을 감춘다
    this.#syncTabs();

    const list = this.#computeVisible();
    this.#visible = list;
    this.#syncGrid(list);

    this.#empty.textContent = this.emptyText;
    this.#empty.hidden = list.length > 0;
    this.#grid.hidden = list.length === 0;

    // 열 수만 변수로 넘긴다 — grid-template-columns 선언 자체는 CSS에 남아
    // 소비자가 @layer 밖에서 덮을 수 있다(인라인 선언이면 못 덮는다)
    this.#grid.style.setProperty("--jd-emoji-picker-columns", String(this.#cols()));

    if (this.label) this.setAttribute("aria-label", this.label);
    else this.removeAttribute("aria-label");
  }

  #syncTabs(): void {
    const names = Object.keys(this.#categories);
    if (this.#tabButtons.length !== names.length) {
      this.#tabs.textContent = "";
      this.#tabButtons = names.map(() => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "jd-emoji-picker__tab";
        this.#tabs.append(b);
        return b;
      });
    }
    this.#tabButtons.forEach((b, i) => {
      const name = names[i];
      if (name === undefined) return;
      b.value = name;
      b.textContent = name;
      const active = name === this.category;
      b.setAttribute("aria-pressed", active ? "true" : "false");
      b.toggleAttribute("data-active", active);
    });
  }

  #syncGrid(list: string[]): void {
    if (this.#buttons.length !== list.length) {
      this.#grid.textContent = "";
      this.#buttons = list.map(() => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "jd-emoji-picker__emoji";
        this.#grid.append(b);
        return b;
      });
      this.#activeIndex = 0;
    }
    this.#buttons.forEach((b, i) => {
      const emoji = list[i];
      if (emoji === undefined) return;
      b.value = emoji;
      b.textContent = emoji;
    });
    this.#activeIndex = clamp(this.#activeIndex, 0, Math.max(0, this.#buttons.length - 1));
    this.#syncRoving();
  }

  /** 현재 화면에 보이는 이모지 목록 (검색·분류 적용 후) */
  get visibleEmojis(): string[] {
    return this.#visible;
  }
}
