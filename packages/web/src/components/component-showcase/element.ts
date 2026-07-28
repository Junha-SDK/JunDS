/**
 * <jd-component-showcase> — 검색·분류 필터가 붙은 컴포넌트 카탈로그 격자
 * (v2 composites/ComponentShowcase).
 *
 * 데이터 입력 2경로(§1.3 — 복합 데이터는 attribute 금지):
 *  1. `items` 프로퍼티 (Array<JdShowcaseItem>)
 *  2. 자식 `<script type="application/json">[…]</script>` 슬롯
 *     (jd-radio-group·jd-action-sheet·jd-floating-action-button 선례)
 *
 * v2의 `preview`/`hoverDemo`는 ReactNode였다. 바닐라 대응은 <template> 슬롯 —
 * 문자열 HTML 주입이 없고, template 안의 <svg>는 파서가 SVG 네임스페이스로 만들어
 * 주므로 §6-1 네임스페이스 함정이 없다(FAB 선례):
 *
 *   <template data-key="button"><jd-button>저장</jd-button></template>
 *   <template data-key="button" data-demo><jd-button loading>저장</jd-button></template>
 *
 * 문자·이모지 한 글자면 항목의 `preview` 필드로 충분하다(template 없을 때만 쓰인다).
 *
 * v2 대비 교정 5건:
 *  1. **카드가 키보드로 열린다.** v2 카드는 onClick만 달린 <div>였다 — 탭 순서에 없고
 *     role도 없어 키보드·AT 사용자는 카탈로그를 아예 쓸 수 없었다. v3는 카드마다
 *     제목 안에 진짜 <a href>(없으면 <button>)를 두고 ::after로 카드 전면을 덮는다
 *     ("stretched link") — 접근 이름은 제목 그대로고 히트 영역은 카드 전체다.
 *     v2에서 타입에만 있고 아무 데도 쓰이지 않던 `href`가 여기서 실제 링크가 된다.
 *  2. **호버 데모가 포커스에도 뜬다.** v2는 onMouseEnter/Leave state라 포인터 없이는
 *     절대 보이지 않았다. v3는 :hover와 :focus-within 양쪽에 반응하는 CSS 전용이라
 *     JS 상태가 0이고 프리렌더 결정성(§3.1-3)도 공짜다.
 *  3. **미리보기는 inert.** 데모 안의 버튼·입력이 탭 순서에 섞여 들어가면 카드 하나가
 *     탭스톱 여러 개가 된다(v2의 실제 동작). 미리보기 영역에 inert를 걸어 장식으로
 *     고정한다 — 카드당 탭스톱은 항상 1개다.
 *  4. **분류 칩이 네이티브 radio 묶음.** v2는 <button> n개라 선택 상태가 AT에 전달되지
 *     않았고 전부 탭 순서에 들어갔다. 네이티브 위임(§1.6-1 · DEC-023-3)으로 단일
 *     탭스톱·화살표 순회·선택 상태 노출이 브라우저 기본이 된다. jd-radio-group을
 *     상속하지 않은 이유는 jd-filter-button-group과 같다 — 여기서 칩은 컴포넌트의
 *     한 부품이지 컴포넌트 자체가 아니다.
 *  5. **결과 수가 낭독된다.** 필터는 화면을 통째로 바꾸는데 v2는 아무 통지도 없었다.
 *     시각적으로 숨긴 role=status 한 줄이 결과 수를 알린다.
 *
 * v2 기본 참(true) 불리언 `searchable`/`filterable`은 attribute로 끌 수 없어
 * `no-search`/`no-filter` 반전 플래그로 뒤집었다(DEC-029-5).
 *
 * 이벤트 (전부 과거형 = cancelable:false, §1.5):
 *  | jd-search | `{ value }`              | 검색어가 바뀐 직후. 걸러내기는 로컬·즉시라
 *  |           |                          | 디바운스가 없다(v2 동형) — 원격 검색을 붙일
 *  |           |                          | 소비자는 이 이벤트를 직접 디바운스한다 |
 *  | jd-change | `{ category }`           | 분류 칩이 바뀐 직후. ""는 "전체" |
 *  | jd-select | `{ key, index, item }`   | 카드 활성화(클릭·Enter). href가 있으면
 *  |           |                          | 네이티브 이동이 함께 일어난다 |
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import componentShowcaseStyles from "./component-showcase.css.js";

export interface JdShowcaseItem {
  /** 식별자 — jd-select detail로 전달되고 <template data-key> 매칭 키가 된다 */
  key: string;
  label: string;
  description?: string;
  category: string;
  /** 있으면 카드 제목이 진짜 링크가 된다(v2 미사용 프롭의 실현) */
  href?: string;
  /** 문자·이모지 미리보기. 마크업 미리보기는 <template data-key> 슬롯으로 */
  preview?: string;
}

interface Slots {
  preview?: HTMLTemplateElement;
  demo?: HTMLTemplateElement;
}

const CLS = "jd-component-showcase";

const SEARCH_SVG =
  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
  `stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/>` +
  `<path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>`;
const EMPTY_SVG =
  `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
  `stroke-width="1" aria-hidden="true"><circle cx="11" cy="11" r="8"/>` +
  `<path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>`;
const EYE_SVG =
  `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
  `stroke-width="2.5" aria-hidden="true">` +
  `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;

export class JdComponentShowcase extends JdElement {
  static override tag = "jd-component-showcase";
  static override props = {
    /** 검색어 — 입력창과 양방향 */
    search: { type: String },
    /** 선택된 분류. 빈 문자열이 "전체" */
    category: { type: String, reflect: true },
    /** 최대 열 수 1|2|3|4 (좁은 화면에서는 단계적으로 줄어든다) */
    columns: { type: Number, default: 3, reflect: true },
    /** v2 searchable=false */
    noSearch: { type: Boolean, reflect: true },
    /** v2 filterable=false */
    noFilter: { type: Boolean, reflect: true },
    allLabel: { type: String, default: "전체" },
    searchPlaceholder: { type: String, default: "컴포넌트 검색..." },
    emptyTitle: { type: String, default: "검색 결과가 없습니다" },
    emptyHint: { type: String, default: "다른 키워드로 검색해 보세요" },
    /** 호버 데모가 있는 카드에 뜨는 배지 문구 */
    demoHint: { type: String, default: "인터랙션 미리보기" },
    /** 격자·분류줄의 접근 이름 밑말 */
    label: { type: String, default: "컴포넌트" },
  };

  declare search: string;
  declare category: string;
  declare columns: number;
  declare noSearch: boolean;
  declare noFilter: boolean;
  declare allLabel: string;
  declare searchPlaceholder: string;
  declare emptyTitle: string;
  declare emptyHint: string;
  declare demoHint: string;
  declare label: string;

  #items: JdShowcaseItem[] = [];
  #visible: JdShowcaseItem[] = [];

  #controls!: HTMLElement;
  #searchWrap!: HTMLElement;
  #searchInput!: HTMLInputElement;
  #chips!: HTMLElement;
  #grid!: HTMLElement;
  #empty!: HTMLElement;
  #status!: HTMLElement;

  #chipItems: HTMLLabelElement[] = [];
  #cards: HTMLElement[] = [];
  /** 마지막으로 골격을 세운 칩/카드 서열. null이면 아직 세운 적 없음 */
  #chipSig: string | null = null;
  #cardSig: string | null = null;
  #groupName = "";

  get items(): JdShowcaseItem[] {
    return this.#items;
  }
  set items(v: JdShowcaseItem[]) {
    this.#items = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  /** 검색·분류를 적용한 현재 목록 */
  get visibleItems(): JdShowcaseItem[] {
    return this.#visible;
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(componentShowcaseStyles);
    this.#readJson();
    this.#recoverItems();
    if (!this.#groupName) this.#groupName = jdUid("jd-cs");
    const grid = this.querySelector<HTMLElement>(`:scope > .${CLS}__grid`);
    if (grid) this.#adopt(grid);
    else this.#build();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdShowcaseItem[];
      if (Array.isArray(parsed)) this.#items = parsed;
    } catch {
      console.warn("[junds] <jd-component-showcase> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /**
   * 업그레이드 전 `el.items = […]`로 대입된 own property 회수.
   * 베이스의 #upgradeProps는 static props만 훑는데 items는 복합 데이터라
   * props 밖의 클래스 접근자다 — 그대로 두면 own 데이터 프로퍼티가 접근자를 영영 가린다.
   */
  #recoverItems(): void {
    if (!Object.prototype.hasOwnProperty.call(this, "items")) return;
    const v = (this as unknown as { items: JdShowcaseItem[] }).items;
    delete (this as unknown as Record<string, unknown>).items;
    this.items = v;
  }

  #adopt(grid: HTMLElement): void {
    this.#grid = grid;
    this.#controls = this.querySelector<HTMLElement>(`:scope > .${CLS}__controls`)!;
    this.#searchWrap = this.querySelector<HTMLElement>(`.${CLS}__search`)!;
    this.#searchInput = this.querySelector<HTMLInputElement>(`.${CLS}__search-input`)!;
    this.#chips = this.querySelector<HTMLElement>(`.${CLS}__chips`)!;
    this.#empty = this.querySelector<HTMLElement>(`:scope > .${CLS}__empty`)!;
    this.#status = this.querySelector<HTMLElement>(`:scope > .${CLS}__status`)!;
    this.#chipItems = Array.from(this.#chips.querySelectorAll<HTMLLabelElement>(`.${CLS}__chip`));
    this.#cards = Array.from(this.#grid.children) as HTMLElement[];
    // 입양(§3.3): 프리렌더가 그린 카드 서열이 현재 목록과 같으면 재구축하지 않는다
    const list = this.#compute();
    const domKeys = this.#cards.map((c) => c.dataset.key ?? "").join("//");
    if (this.#cards.length > 0 && domKeys === list.map((i) => i.key).join("//")) {
      this.#cardSig = this.#cardSignature(list, this.#collectSlots());
    }
    const domCats = this.#chipItems
      .map((c) => c.querySelector<HTMLInputElement>(`.${CLS}__chip-input`)?.value ?? "")
      .join("//");
    if (this.#chipItems.length > 0 && domCats === this.#categories().join("//")) {
      this.#chipSig = domCats;
    }
  }

  #build(): void {
    this.#controls = document.createElement("div");
    this.#controls.className = `${CLS}__controls`;

    this.#searchWrap = document.createElement("div");
    this.#searchWrap.className = `${CLS}__search`;
    const icon = document.createElement("span");
    icon.className = `${CLS}__search-icon`;
    icon.innerHTML = SEARCH_SVG;
    this.#searchInput = document.createElement("input");
    this.#searchInput.type = "search";
    this.#searchInput.className = `${CLS}__search-input`;
    this.#searchInput.autocomplete = "off";
    this.#searchWrap.append(icon, this.#searchInput);

    this.#chips = document.createElement("div");
    this.#chips.className = `${CLS}__chips`;
    this.#chips.setAttribute("role", "radiogroup");
    this.#controls.append(this.#searchWrap, this.#chips);

    this.#grid = document.createElement("ul");
    this.#grid.className = `${CLS}__grid`;
    // list-style:none이 Safari에서 목록 의미를 지운다 — 명시 role로 되살린다
    this.#grid.setAttribute("role", "list");

    this.#empty = document.createElement("div");
    this.#empty.className = `${CLS}__empty`;
    const emptyIcon = document.createElement("span");
    emptyIcon.className = `${CLS}__empty-icon`;
    emptyIcon.innerHTML = EMPTY_SVG;
    const emptyTitle = document.createElement("p");
    emptyTitle.className = `${CLS}__empty-title`;
    const emptyHint = document.createElement("p");
    emptyHint.className = `${CLS}__empty-hint`;
    this.#empty.append(emptyIcon, emptyTitle, emptyHint);

    this.#status = document.createElement("p");
    this.#status.className = `${CLS}__status`;
    this.#status.setAttribute("role", "status");

    this.append(this.#controls, this.#grid, this.#empty, this.#status);
  }

  /* ── 수명 ─────────────────────────────────────────────────────────── */

  protected override connected(): void {
    this.#searchInput.addEventListener("input", this.#onSearch);
    this.#chips.addEventListener("change", this.#onCategory);
    this.#grid.addEventListener("click", this.#onCardClick);
  }

  protected override disconnected(): void {
    this.#searchInput?.removeEventListener("input", this.#onSearch);
    this.#chips?.removeEventListener("change", this.#onCategory);
    this.#grid?.removeEventListener("click", this.#onCardClick);
  }

  #onSearch = (): void => {
    const value = this.#searchInput.value;
    this.search = value;
    this.emit("jd-search", { value });
  };

  #onCategory = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    if (!input.classList.contains(`${CLS}__chip-input`)) return;
    this.category = input.value;
    this.emit("jd-change", { category: input.value });
  };

  #onCardClick = (e: Event): void => {
    const link = (e.target as Element | null)?.closest<HTMLElement>(`.${CLS}__link`);
    if (!link) return;
    const card = link.closest<HTMLElement>(`.${CLS}__card`);
    const index = card ? this.#cards.indexOf(card) : -1;
    const item = index >= 0 ? this.#visible[index] : undefined;
    if (item) this.emit("jd-select", { key: item.key, index, item });
  };

  /* ── 목록 계산 ────────────────────────────────────────────────────── */

  /** 등장 순 유일 분류. 맨 앞의 ""가 "전체"다 */
  #categories(): string[] {
    const seen = new Set<string>();
    const out: string[] = [""];
    for (const item of this.#items) {
      if (!item.category || seen.has(item.category)) continue;
      seen.add(item.category);
      out.push(item.category);
    }
    return out;
  }

  #compute(): JdShowcaseItem[] {
    const q = this.search.trim().toLowerCase();
    const cat = this.category;
    return this.#items.filter((item) => {
      if (cat && item.category !== cat) return false;
      if (!q) return true;
      return (
        item.label.toLowerCase().includes(q) || (item.description ?? "").toLowerCase().includes(q)
      );
    });
  }

  #collectSlots(): Map<string, Slots> {
    const map = new Map<string, Slots>();
    for (const t of this.querySelectorAll<HTMLTemplateElement>(":scope > template[data-key]")) {
      const key = t.dataset.key;
      if (!key) continue;
      const entry = map.get(key) ?? {};
      if (t.hasAttribute("data-demo")) entry.demo = t;
      else entry.preview = t;
      map.set(key, entry);
    }
    return map;
  }

  /** 골격에 박히는 값만 담는다 — label/description/분류 배지는 update()가 동기화 */
  #cardSignature(list: JdShowcaseItem[], slots: Map<string, Slots>): string {
    return list
      .map((item) => {
        const s = slots.get(item.key);
        return [
          item.key,
          item.href ?? "",
          item.preview ?? "",
          s?.preview ? "t" : "",
          s?.demo ? "d" : "",
        ].join("|");
      })
      .join("//");
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    const slots = this.#collectSlots();

    this.#controls.hidden = this.noSearch && this.noFilter;
    this.#searchWrap.hidden = this.noSearch;
    this.#chips.hidden = this.noFilter;

    this.#searchInput.placeholder = this.searchPlaceholder;
    this.#searchInput.setAttribute("aria-label", this.searchPlaceholder);
    // 입력 중인 값을 덮어쓰지 않는다(IME 안전 — jd-text-field 관용구)
    if (
      this.#searchInput !== this.ownerDocument.activeElement &&
      this.#searchInput.value !== this.search
    ) {
      this.#searchInput.value = this.search;
    }

    this.#syncChips();

    const list = this.#compute();
    this.#visible = list;
    const sig = this.#cardSignature(list, slots);
    if (sig !== this.#cardSig) {
      this.#cardSig = sig;
      this.#rebuildCards(list, slots);
    }
    this.#syncCards(list);

    const found = list.length > 0;
    this.#grid.hidden = !found;
    this.#grid.setAttribute("aria-label", this.label);
    this.#empty.hidden = found;
    this.#empty.querySelector(`.${CLS}__empty-title`)!.textContent = this.emptyTitle;
    this.#empty.querySelector(`.${CLS}__empty-hint`)!.textContent = this.emptyHint;
    this.#status.textContent = found ? `${list.length}개 ${this.label}` : this.emptyTitle;
  }

  #syncChips(): void {
    const cats = this.#categories();
    const sig = cats.join("//");
    if (sig !== this.#chipSig) {
      this.#chipSig = sig;
      this.#chips.textContent = "";
      this.#chipItems = cats.map(() => {
        const chip = document.createElement("label");
        chip.className = `${CLS}__chip`;
        const input = document.createElement("input");
        input.type = "radio";
        input.className = `${CLS}__chip-input`;
        const text = document.createElement("span");
        text.className = `${CLS}__chip-label`;
        const count = document.createElement("span");
        count.className = `${CLS}__chip-count`;
        chip.append(input, text, count);
        this.#chips.append(chip);
        return chip;
      });
    }

    this.#chips.setAttribute("aria-label", `${this.label} 분류`);
    this.#chipItems.forEach((chip, i) => {
      const cat = cats[i];
      if (cat === undefined) return;
      const input = chip.querySelector<HTMLInputElement>(`.${CLS}__chip-input`)!;
      const text = chip.querySelector<HTMLElement>(`.${CLS}__chip-label`)!;
      const count = chip.querySelector<HTMLElement>(`.${CLS}__chip-count`)!;
      const active = cat === this.category;
      input.name = this.#groupName;
      input.value = cat;
      input.checked = active;
      text.textContent = cat || this.allLabel;
      if (cat) {
        count.textContent = String(this.#items.filter((it) => it.category === cat).length);
        count.hidden = false;
      } else {
        count.textContent = "";
        count.hidden = true;
      }
      chip.toggleAttribute("data-active", active);
      // 분류색은 CSS가 data-category로 고른다("전체"는 중립색)
      if (cat) chip.dataset.category = cat;
      else chip.removeAttribute("data-category");
    });
  }

  #rebuildCards(list: JdShowcaseItem[], slots: Map<string, Slots>): void {
    this.#grid.textContent = "";
    this.#cards = list.map((item, i) => {
      const card = this.#buildCard(item, i, slots.get(item.key));
      this.#grid.append(card);
      return card;
    });
  }

  #buildCard(item: JdShowcaseItem, index: number, slots: Slots | undefined): HTMLElement {
    const card = document.createElement("li");
    card.className = `${CLS}__card`;
    card.dataset.key = item.key;
    // 등장 스태거(v2 index*30ms) — 인덱스의 결정 함수라 프리렌더 스냅샷이 흔들리지 않는다
    card.style.setProperty(`--${CLS}-i`, String(index));

    const preview = document.createElement("div");
    preview.className = `${CLS}__preview`;
    // 미리보기는 장식이다 — 데모 안의 컨트롤이 탭 순서에 섞이지 않게 통째로 inert
    preview.toggleAttribute("inert", true);

    const pattern = document.createElement("span");
    pattern.className = `${CLS}__pattern`;

    const still = document.createElement("div");
    still.className = `${CLS}__still`;
    if (slots?.preview) still.append(slots.preview.content.cloneNode(true));
    else still.textContent = item.preview ?? "";
    preview.append(pattern, still);

    if (slots?.demo) {
      const demo = document.createElement("div");
      demo.className = `${CLS}__demo`;
      demo.append(slots.demo.content.cloneNode(true));
      preview.append(demo);
    }

    const scrim = document.createElement("span");
    scrim.className = `${CLS}__scrim`;
    preview.append(scrim);

    if (slots?.demo) {
      card.toggleAttribute("data-has-demo", true);
      const hint = document.createElement("span");
      hint.className = `${CLS}__hint`;
      hint.innerHTML = EYE_SVG;
      const hintText = document.createElement("span");
      hintText.className = `${CLS}__hint-text`;
      hint.append(hintText);
      preview.append(hint);
    }

    const info = document.createElement("div");
    info.className = `${CLS}__info`;
    const head = document.createElement("div");
    head.className = `${CLS}__head`;
    const title = document.createElement("h3");
    title.className = `${CLS}__title`;
    let link: HTMLAnchorElement | HTMLButtonElement;
    if (item.href) {
      link = document.createElement("a");
    } else {
      link = document.createElement("button");
      link.type = "button";
    }
    link.className = `${CLS}__link`;
    title.append(link);
    const badge = document.createElement("span");
    badge.className = `${CLS}__badge`;
    head.append(title, badge);
    const desc = document.createElement("p");
    desc.className = `${CLS}__desc`;
    info.append(head, desc);

    card.append(preview, info);
    return card;
  }

  #syncCards(list: JdShowcaseItem[]): void {
    this.#cards.forEach((card, i) => {
      const item = list[i];
      if (!item) return;
      card.dataset.category = item.category;
      const link = card.querySelector<HTMLElement>(`.${CLS}__link`)!;
      link.textContent = item.label;
      if (link instanceof HTMLAnchorElement && item.href) link.href = item.href;
      const badge = card.querySelector<HTMLElement>(`.${CLS}__badge`)!;
      badge.textContent = item.category;
      badge.hidden = !item.category;
      const desc = card.querySelector<HTMLElement>(`.${CLS}__desc`)!;
      desc.textContent = item.description ?? "";
      desc.hidden = !item.description;
      const hint = card.querySelector<HTMLElement>(`.${CLS}__hint-text`);
      if (hint) hint.textContent = this.demoHint;
    });
  }
}
