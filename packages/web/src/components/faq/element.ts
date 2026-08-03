/**
 * <jd-faq> — FAQ 섹션: 검색 + 카테고리 필터 + 단일/다중 펼침 (v2 patterns/FAQ).
 *
 * 행은 **<jd-disclosure>로 짓는다**(jd-accordion 선례, §6 R12). 개폐 상태·
 * aria-expanded/controls·region·접힘 애니메이션·닫힌 본문의 탭 순서·AT 제외를 다시
 * 구현하지 않기 위해서다. 행 골격(질문 버튼 + 셰브런 + 답변)은 이 컴포넌트가 미리 그려서
 * 넘기고 jd-disclosure가 **입양**한다(§3.3) — v2의 분리형 카드 외관(space-y-2 rounded-lg)은
 * 아코디언의 단일 테두리 컨테이너와 다르므로 아코디언을 재사용하지 않고 원형을 직접 조립한다.
 *
 * 항목 입력 2경로(§1.3 — 복합 데이터는 attribute 금지):
 *  1. `items` 프로퍼티 (Array<JdFaqItem>)
 *  2. 자식 `<script type="application/json">[…]</script>` 슬롯 (radio-group·accordion 선례)
 *
 * v2 대비 개선:
 *  - **화살표 키 내비게이션**(APG Disclosure/Accordion): ↑/↓로 보이는 질문 이동, Home/End로
 *    처음·끝. v2에는 없었다.
 *  - 닫힌 답변이 탭 순서·AT에서 빠진다(jd-disclosure inert). v2는 조건부 언마운트라
 *    닫힘 자체는 됐지만 애니메이션이 없었다 — v3는 접힘 전이 + AT 제외를 함께 가진다.
 *  - 검색 입력에 aria-label, 필터 그룹은 role/aria-pressed로 상태 노출.
 *
 * 이벤트(§1.5): 행의 jd-open/jd-close가 그대로 버블(light DOM). 컨트롤은
 *  jd-search({ query }) · jd-filter({ category })를 추가 발행한다.
 */
import { JdElement } from "../../core/element.js";
import { syncAriaIdRefs, syncOwnedAttribute } from "../../core/aria.js";
import { contentText, setContent, type JdContent } from "../../core/content.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import { on, createKeyHandler } from "../../behaviors/input.js";
import type { JdDisclosure } from "../disclosure/element.js";
import faqStyles from "./faq.css.js";

export interface JdFaqItem {
  /** ID (선택) — 없으면 인덱스 */
  id?: string;
  /** 질문. 문자열(평문), DOM 노드 또는 `unsafeHtml()`로 표시한 값 */
  question: JdContent;
  /** 답변. 문자열(평문), DOM 노드 또는 `unsafeHtml()`로 표시한 값 */
  answer: JdContent;
  /** 카테고리 — 필터 칩으로 파생 */
  category?: string;
}

const CHEVRON_SVG =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">` +
  `<path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export class JdFaq extends JdElement {
  static override tag = "jd-faq";
  static override props = {
    title: { type: String },
    subtitle: { type: String },
    /** 다중 펼침 허용 (기본 false = 하나만 열림) */
    multiple: { type: Boolean, reflect: true },
    /** 검색 입력 노출 */
    searchable: { type: Boolean, reflect: true },
    /** 카테고리 필터 노출 */
    showCategoryFilter: { type: Boolean, reflect: true }, // attr: show-category-filter
    // items(Array)는 property 전용(§1.3) — 아래 접근자.
  };

  declare title: string;
  declare subtitle: string;
  declare multiple: boolean;
  declare searchable: boolean;
  declare showCategoryFilter: boolean;

  #items: JdFaqItem[] = [];
  #built: readonly JdFaqItem[] | null = null;
  #categories: string[] = [];
  #query = "";
  #category: string | null = null;
  #offs: Array<() => void> = [];

  #header!: HTMLElement;
  #titleEl!: HTMLHeadingElement;
  #subtitleEl!: HTMLParagraphElement;
  #controls!: HTMLElement;
  #search!: HTMLInputElement;
  #filters!: HTMLElement;
  #list!: HTMLElement;
  #empty!: HTMLElement;
  #titleId = "";

  get items(): JdFaqItem[] {
    return this.#items;
  }
  set items(v: JdFaqItem[]) {
    this.#items = Array.isArray(v) ? v : [];
    this.#built = null;
    this.requestUpdate();
  }

  /* ── 골격 ────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(faqStyles);
    this.#readJson();
    const list = this.querySelector<HTMLElement>(":scope > .jd-faq__list");
    if (list) {
      this.#header = this.querySelector<HTMLElement>(":scope > .jd-faq__header")!;
      this.#titleEl = this.#header.querySelector<HTMLHeadingElement>(".jd-faq__title")!;
      this.#subtitleEl = this.#header.querySelector<HTMLParagraphElement>(".jd-faq__subtitle")!;
      this.#controls = this.querySelector<HTMLElement>(":scope > .jd-faq__controls")!;
      this.#search = this.#controls.querySelector<HTMLInputElement>(".jd-faq__search")!;
      this.#filters = this.#controls.querySelector<HTMLElement>(".jd-faq__filters")!;
      this.#list = list;
      this.#empty = list.querySelector<HTMLElement>(".jd-faq__empty")!;
      this.#titleId = this.#titleEl.id || "";
    } else {
      this.#build();
    }
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdFaqItem[];
      if (Array.isArray(parsed)) this.#items = parsed;
    } catch {
      console.warn("[junds] <jd-faq> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #build(): void {
    // 헤더
    this.#header = document.createElement("div");
    this.#header.className = "jd-faq__header";
    this.#titleEl = document.createElement("h2");
    this.#titleEl.className = "jd-faq__title";
    this.#titleId = jdUid("jd-faq-title");
    this.#titleEl.id = this.#titleId;
    this.#subtitleEl = document.createElement("p");
    this.#subtitleEl.className = "jd-faq__subtitle";
    this.#header.append(this.#titleEl, this.#subtitleEl);

    // 컨트롤(검색 + 필터) — 항상 존재하고 노출은 update()가 hidden으로 제어
    this.#controls = document.createElement("div");
    this.#controls.className = "jd-faq__controls";
    this.#search = document.createElement("input");
    this.#search.type = "search";
    this.#search.className = "jd-faq__search";
    this.#search.placeholder = "검색...";
    this.#search.setAttribute("aria-label", "검색");
    this.#filters = document.createElement("div");
    this.#filters.className = "jd-faq__filters";
    this.#filters.setAttribute("role", "group");
    this.#filters.setAttribute("aria-label", "카테고리 필터");
    this.#controls.append(this.#search, this.#filters);

    // 목록 + 빈 상태
    this.#list = document.createElement("div");
    this.#list.className = "jd-faq__list";
    this.#empty = document.createElement("div");
    this.#empty.className = "jd-faq__empty";
    this.#empty.textContent = "결과가 없습니다.";
    this.#list.append(this.#empty);

    this.append(this.#header, this.#controls, this.#list);
  }

  /* ── 행 골격 (jd-disclosure 입양) ──────────────────────────── */

  #rows(): HTMLElement[] {
    return Array.from(this.#list.querySelectorAll<HTMLElement>(":scope > jd-disclosure"));
  }

  /** 개수가 같으면 만들지 않고 내용만 맞춘다(§3.3 · accordion 선례) */
  #syncRows(): void {
    this.#built = this.#items;
    let rows = this.#rows();
    if (rows.length !== this.#items.length) {
      for (const r of rows) r.remove();
      for (let i = 0; i < this.#items.length; i++) this.#list.append(this.#createRow());
      rows = this.#rows();
    }
    rows.forEach((row, i) => {
      const item = this.#items[i];
      if (!item) return;
      row.dataset.faqId = item.id ?? String(i);
      row.dataset.category = item.category ?? "";
      row.dataset.search = `${contentText(item.question)} ${contentText(
        item.answer,
      )}`.toLowerCase();
      setContent(row.querySelector<HTMLElement>(".jd-faq__question")!, item.question);
      setContent(row.querySelector<HTMLElement>(".jd-faq__answer")!, item.answer);
    });
  }

  /** jd-disclosure가 입양할 골격을 미리 그린다 (accordion #createRow와 동형) */
  #createRow(): HTMLElement {
    const row = document.createElement("jd-disclosure");
    row.className = "jd-faq__item";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "jd-disclosure__trigger jd-faq__trigger";
    const question = document.createElement("span");
    question.className = "jd-faq__question";
    const chevron = document.createElement("span");
    chevron.className = "jd-faq__chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.innerHTML = CHEVRON_SVG;
    btn.append(question, chevron);

    const panel = document.createElement("div");
    panel.className = "jd-disclosure__panel";
    const inner = document.createElement("div");
    inner.className = "jd-disclosure__inner";
    const answer = document.createElement("div");
    answer.className = "jd-faq__answer";
    inner.append(answer);
    panel.append(inner);

    row.append(btn, panel);
    return row;
  }

  /* ── 컨트롤(필터 칩) ──────────────────────────────────────── */

  #syncControls(): void {
    const cats: string[] = [];
    const seen = new Set<string>();
    for (const it of this.#items) {
      if (it.category && !seen.has(it.category)) {
        seen.add(it.category);
        cats.push(it.category);
      }
    }
    this.#categories = cats;
    if (this.#category && !cats.includes(this.#category)) this.#category = null;

    this.#filters.textContent = "";
    if (cats.length > 0) {
      this.#filters.append(this.#chip("전체", ""));
      for (const c of cats) this.#filters.append(this.#chip(c, c));
    }
  }

  #chip(label: string, category: string): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "jd-faq__chip";
    b.textContent = label;
    b.dataset.category = category;
    b.addEventListener("click", () => {
      this.#category = category || null;
      this.requestUpdate();
      this.emit("jd-filter", { category: this.#category });
    });
    return b;
  }

  /* ── 수명주기 ─────────────────────────────────────────────── */

  protected override connected(): void {
    this.#search.addEventListener("input", this.#onSearch);
    // single 모드: 행이 열리면 나머지를 닫는다
    this.#offs.push(on(this as EventTarget, "jd-open", this.#onOpen as (e: never) => void));
    // 화살표 키 내비 — 트리거 버튼 위에서만(검색 input은 form 태그라 무시됨)
    this.own(
      createKeyHandler(
        this,
        {
          arrowdown: (e) => this.#move(e, 1),
          arrowup: (e) => this.#move(e, -1),
          home: (e) => this.#moveTo(e, 0),
          end: (e) => this.#moveTo(e, -1),
        },
        { preventDefault: false },
      ),
    );
    this.requestUpdate();
  }

  protected override disconnected(): void {
    this.#search?.removeEventListener("input", this.#onSearch);
    for (const off of this.#offs) off();
    this.#offs = [];
  }

  #onSearch = (): void => {
    this.#query = this.#search.value;
    this.requestUpdate();
    this.emit("jd-search", { query: this.#query });
  };

  #onOpen = (e: Event): void => {
    if (this.multiple) return;
    const opened = (e.target as Element | null)?.closest?.("jd-disclosure") as HTMLElement | null;
    if (!opened || opened.parentElement !== this.#list) return;
    for (const row of this.#rows()) {
      if (row !== opened) (row as unknown as JdDisclosure).open = false;
    }
  };

  /* ── 반영 ─────────────────────────────────────────────────── */

  protected override update(): void {
    setContent(this.#titleEl, this.title);
    this.#titleEl.hidden = !this.title;
    setContent(this.#subtitleEl, this.subtitle);
    this.#subtitleEl.hidden = !this.subtitle;
    this.#header.hidden = !this.title && !this.subtitle;

    if (this.title) {
      if (!this.#titleEl.id) this.#titleEl.id = this.#titleId ||= jdUid("jd-faq-title");
      syncOwnedAttribute(this, "role", "region", { preserveExisting: true });
      syncAriaIdRefs(this, "aria-labelledby", this.#titleEl.id);
    } else {
      syncOwnedAttribute(this, "role", null);
      syncAriaIdRefs(this, "aria-labelledby", null);
    }

    if (this.#built !== this.#items) {
      this.#syncRows();
      this.#syncControls();
    }

    // 컨트롤 노출
    this.#search.hidden = !this.searchable;
    const showFilter = this.showCategoryFilter && this.#categories.length > 0;
    this.#filters.hidden = !showFilter;
    this.#controls.hidden = !this.searchable && !showFilter;

    // 검색 입력 값 동기화 — 다를 때만(IME 안전, text-field 선례)
    if (this.#search.value !== this.#query) this.#search.value = this.#query;

    // 칩 활성 상태
    const chips = Array.from(this.#filters.querySelectorAll<HTMLButtonElement>(".jd-faq__chip"));
    for (const chip of chips) {
      const cat = chip.dataset.category ? chip.dataset.category : null;
      const active = cat === this.#category;
      chip.toggleAttribute("data-active", active);
      chip.setAttribute("aria-pressed", String(active));
    }

    // 행 필터링 (query + category)
    const q = this.#query.trim().toLowerCase();
    let visible = 0;
    for (const row of this.#rows()) {
      const matchesCat = !this.#category || row.dataset.category === this.#category;
      const matchesQ = !q || (row.dataset.search ?? "").includes(q);
      const show = matchesCat && matchesQ;
      row.hidden = !show;
      if (show) visible += 1;
    }
    this.#empty.hidden = visible > 0;
  }

  /* ── 키보드 (APG) — 보이는 트리거만 순회 ──────────────────── */

  #visibleTriggers(): HTMLElement[] {
    return this.#rows()
      .filter((row) => !row.hidden)
      .map((row) => row.querySelector<HTMLElement>(".jd-faq__trigger"))
      .filter((t): t is HTMLElement => t !== null);
  }

  #focusIndex(e: KeyboardEvent): { triggers: HTMLElement[]; from: number } | null {
    const current = (e.target as Element | null)?.closest?.(".jd-faq__trigger");
    if (!current) return null;
    const triggers = this.#visibleTriggers();
    const from = triggers.indexOf(current as HTMLElement);
    return from < 0 ? null : { triggers, from };
  }

  #move(e: KeyboardEvent, delta: 1 | -1): void {
    const found = this.#focusIndex(e);
    if (!found) return;
    e.preventDefault();
    const n = found.triggers.length;
    found.triggers[(((found.from + delta) % n) + n) % n]?.focus();
  }

  #moveTo(e: KeyboardEvent, index: 0 | -1): void {
    const found = this.#focusIndex(e);
    if (!found) return;
    e.preventDefault();
    const list = found.triggers;
    (index === 0 ? list[0] : list[list.length - 1])?.focus();
  }
}
