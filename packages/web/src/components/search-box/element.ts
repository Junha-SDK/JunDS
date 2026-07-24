/**
 * <jd-search-box> — 종목 검색 입력 + 결과 드롭다운 (v2 finance/SearchBox).
 *
 * JdCombobox를 상속한다(§6 R12). v2 SearchBox는 마우스 전용 드롭다운이었지만(화살표
 * 내비·aria 없음), Combobox 골격을 물려받아 **APG Combobox 패턴**(role=combobox/listbox,
 * aria-activedescendant, 화살표·Home/End·Esc, 클릭아웃, 디바운스 검색)을 공짜로 얻는다 —
 * v2보다 접근성이 오른다. 외형(⌘K 힌트·지우기·풍부한 행·"전체 검색결과" 푸터)만 덧입힌다.
 *
 * DEC-003: v2는 local searchStocks + `/api/search` fetch를 **직접** 했다. v3는 결과를
 * property `results`로 **받고**, 입력이 바뀌면 `jd-search {query}`(searchDelay 디바운스)를
 * 발행해 호출부가 결과를 채운다. 선택은 `jd-select {hit}`, 전체검색은 `jd-submit {query}`.
 *
 * AutoComplete와 같은 결(입력 텍스트 자체가 value)이라 Combobox의 "선택된 옵션 라벨"
 * 표시 로직을 끈다(selectedOption 없음, 로컬 필터 없음 — 결과는 이미 앱이 필터한 것).
 */
import { JdCombobox } from "../combobox/element.js";
import type { JdComboboxItem } from "../combobox/element.js";
import { adoptStyles } from "../../core/styles.js";
import searchBoxStyles from "./search-box.css.js";

export interface JdSearchHit {
  /** 안정 키(행 재사용·중복 제거) */
  key: string;
  name: string;
  href?: string;
  sub?: string;
  badge?: "KOSPI" | "KOSDAQ";
  price?: number;
  change?: number;
  code?: string;
  source?: "local" | "remote";
}

const COMMAND_SVG =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
  `<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/></svg>`;

const CLOSE_SVG =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
  `<path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

const CHEVRON_SVG =
  `<svg class="jd-search-box__footer-chevron" viewBox="0 0 24 24" fill="none" ` +
  `stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" ` +
  `aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>`;

const TRENDING_UP_SVG =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
  `<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/></svg>`;
const TRENDING_DOWN_SVG =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
  `<path d="M16 17h6v-6"/><path d="m22 17-8.5-8.5-5 5L2 7"/></svg>`;

/** 로케일 무관 천단위 구분(§3.1-3) */
function grp(v: number): string {
  const neg = v < 0;
  const [int = "0", frac] = Math.abs(v).toString().split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}${grouped}${frac ? `.${frac}` : ""}`;
}

export class JdSearchBox extends JdCombobox {
  static override tag = "jd-search-box";
  static override props = {
    ...JdCombobox.props,
    placeholder: { type: String, default: "종목, 테마명을 입력하세요." },
    /** 마운트 시 입력창 포커스 */
    autoFocus: { type: Boolean, attribute: "auto-focus" },
  };

  declare autoFocus: boolean;

  #results: JdSearchHit[] = [];
  #hits: JdSearchHit[] = [];
  #clearBtn: HTMLButtonElement | null = null;
  #footerBtn: HTMLButtonElement | null = null;
  #footerText: HTMLElement | null = null;

  /** 검색 결과 — property 전용(§1.3). 앱이 jd-search에 응답해 채운다 */
  get results(): JdSearchHit[] {
    return this.#results;
  }
  set results(v: JdSearchHit[]) {
    this.#results = Array.isArray(v) ? v : [];
    this.renderedKey = null; // 목록 재구축 강제
    this.requestUpdate();
  }

  /** Combobox.render가 adoptStyles 직후 부르는 훅 — 여기서 검색박스 CSS·업그레이드 회수 */
  protected override adoptStyleHook(): void {
    adoptStyles(searchBoxStyles);
    this.upgradeOwn("results");
  }

  protected override connected(): void {
    super.connected();
    if (this.autoFocus) this.inputEl.focus();
  }

  /* ── 스켈레톤 확장: ⌘K 힌트 · 지우기 · 결과 푸터 ─────────────────── */

  protected override buildSkeleton(): void {
    super.buildSkeleton();
    const control = this.querySelector<HTMLElement>(":scope > .jd-combobox__control")!;
    const spinner = control.querySelector<HTMLElement>(".jd-combobox__spinner");

    const kbd = document.createElement("kbd");
    kbd.className = "jd-search-box__kbd";
    kbd.setAttribute("aria-hidden", "true");
    kbd.insertAdjacentHTML("beforeend", COMMAND_SVG);
    kbd.append("K");

    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "jd-search-box__clear";
    clear.setAttribute("aria-label", "지우기");
    clear.hidden = true;
    clear.insertAdjacentHTML("beforeend", CLOSE_SVG);

    control.insertBefore(kbd, spinner);
    control.insertBefore(clear, spinner);

    const popup = this.querySelector<HTMLElement>(":scope > .jd-combobox__popup")!;
    const footer = document.createElement("button");
    footer.type = "button";
    footer.className = "jd-search-box__footer";
    footer.hidden = true;
    const text = document.createElement("span");
    text.className = "jd-search-box__footer-text";
    footer.append(text);
    footer.insertAdjacentHTML("beforeend", CHEVRON_SVG);
    popup.append(footer);
  }

  protected override bindSkeleton(): void {
    super.bindSkeleton();
    this.#clearBtn = this.querySelector(".jd-search-box__clear");
    this.#footerBtn = this.querySelector(".jd-search-box__footer");
    this.#footerText = this.querySelector(".jd-search-box__footer-text");
    this.#clearBtn?.addEventListener("click", this.#onClear);
    this.#footerBtn?.addEventListener("click", this.#onSubmit);
  }

  /* ── AutoComplete식 값 의미(입력 텍스트 = value) ──────────────────── */

  protected override queryText(): string {
    return this.value;
  }
  protected override acceptTyped(v: string): void {
    this.value = v;
  }
  protected override inputText(): string {
    return this.value;
  }
  protected override selectedOption(): undefined {
    return undefined;
  }
  protected override isSelected(): boolean {
    return false;
  }
  protected override placeholderText(): string {
    return this.placeholder;
  }

  /** 결과는 앱이 필터해 넘긴 것 — 로컬 필터·creatable 없음 */
  protected override buildItems(): JdComboboxItem[] {
    this.#hits = this.#results.slice();
    return this.#hits.map((h) => ({ value: h.key, label: h.name }));
  }

  /* ── 선택·전체검색 ────────────────────────────────────────────── */

  protected override pick(opt: JdComboboxItem): void {
    if (opt.disabled) return;
    const i = this.items.indexOf(opt);
    const hit = i >= 0 ? this.#hits[i] : undefined;
    if (!hit) return;
    this.emit("jd-select", { hit });
    this.setOpen(false);
  }

  protected override onEnter = (e: KeyboardEvent): void => {
    if (!this.open) return;
    e.preventDefault();
    const item = this.items[this.activeIndex];
    if (item) this.pick(item);
    else if (this.value.trim()) this.#submit();
  };

  #onClear = (): void => {
    this.value = "";
    this.setOpen(false);
    this.inputEl.focus();
    this.requestUpdate();
    this.emit("jd-input", { value: "" });
  };

  #onSubmit = (): void => {
    this.#submit();
  };

  #submit(): void {
    const q = this.value.trim();
    if (!q) return;
    this.setOpen(false);
    this.emit("jd-submit", { query: q });
  }

  /* ── 풍부한 결과 행 ───────────────────────────────────────────── */

  protected override buildRow(_opt: JdComboboxItem, id: string): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "jd-combobox__option jd-search-box__hit"; // 두 클래스: 콤보 기계 + 검색 외형
    li.id = id;
    li.setAttribute("role", "option");

    const main = document.createElement("span");
    main.className = "jd-search-box__main";
    const name = document.createElement("span");
    name.className = "jd-search-box__name";
    const badge = document.createElement("span");
    badge.className = "jd-search-box__badge";
    badge.hidden = true;
    const sub = document.createElement("span");
    sub.className = "jd-search-box__sub";
    sub.hidden = true;
    main.append(name, badge, sub);

    const aside = document.createElement("span");
    aside.className = "jd-search-box__aside";
    const price = document.createElement("span");
    price.className = "jd-search-box__price";
    price.hidden = true;
    const change = document.createElement("span");
    change.className = "jd-search-box__change";
    change.hidden = true;
    const code = document.createElement("span");
    code.className = "jd-search-box__code";
    code.hidden = true;
    aside.append(price, change, code);

    li.append(main, aside);
    return li;
  }

  protected override syncRow(row: HTMLElement, _opt: JdComboboxItem, i: number): void {
    const hit = this.#hits[i];
    if (!hit) return;
    row.dataset.value = hit.key;
    row.toggleAttribute("data-active", this.open && i === this.activeIndex);
    row.setAttribute("aria-selected", "false");

    row.querySelector<HTMLElement>(".jd-search-box__name")!.textContent = hit.name;

    const badge = row.querySelector<HTMLElement>(".jd-search-box__badge")!;
    if (hit.badge) {
      badge.textContent = hit.badge;
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }

    const sub = row.querySelector<HTMLElement>(".jd-search-box__sub")!;
    if (hit.sub) {
      sub.textContent = `· ${hit.sub}`;
      sub.hidden = false;
    } else {
      sub.hidden = true;
    }

    const price = row.querySelector<HTMLElement>(".jd-search-box__price")!;
    const change = row.querySelector<HTMLElement>(".jd-search-box__change")!;
    const code = row.querySelector<HTMLElement>(".jd-search-box__code")!;
    const isRemote = hit.source === "remote";

    if (isRemote) {
      price.hidden = true;
      change.hidden = true;
      code.textContent = hit.code ?? "";
      code.hidden = false;
    } else {
      code.hidden = true;
      price.textContent = typeof hit.price === "number" ? grp(hit.price) : "—";
      price.hidden = false;
      const pct = hit.change ?? 0;
      const up = pct > 0;
      const flat = pct === 0;
      change.hidden = false;
      change.dataset.dir = flat ? "flat" : up ? "up" : "down";
      change.innerHTML = flat ? "" : up ? TRENDING_UP_SVG : TRENDING_DOWN_SVG;
      change.append(`${pct > 0 ? "+" : ""}${pct.toFixed(2)}%`);
    }
  }

  /* ── 팝업 가시성 + 지우기/푸터 (v2: 결과·로딩·질의 있을 때만 노출) ── */

  protected override update(): void {
    super.update();
    if (this.#clearBtn) this.#clearBtn.hidden = !this.value;

    const q = this.value.trim();
    if (this.#footerBtn) {
      this.#footerBtn.hidden = !q;
      if (this.#footerText) this.#footerText.textContent = `‘${q}’ 전체 검색결과 보기`;
    }

    const show = this.open && (this.items.length > 0 || this.loading || Boolean(q));
    this.popup.hidden = !show;
    this.inputEl.setAttribute("aria-expanded", String(show));
  }
}
