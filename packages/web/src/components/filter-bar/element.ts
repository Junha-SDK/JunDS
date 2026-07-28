/**
 * <jd-filter-bar> — 검색 + 필터 컨트롤 + 액션 한 줄 배치 (v2 patterns/FilterBar).
 *
 * v2는 `filters`·`actions`를 ReactNode prop으로 받았다. 바닐라에서는 light DOM 슬롯으로
 * 받는다: 기본 자식은 가운데 필터 영역에 흐르고, `slot="actions"` 자식만 오른쪽으로
 * (margin-inline-start:auto) 밀린다. 검색은 내장 <input type=search>가 담당하고 값 변화는
 * `jd-input`(실시간) / `jd-change`(확정)로 알린다 — v2 onSearchChange의 바닐라 등가(§1.5).
 *
 * v2 대비 판단 4건:
 * 1. **검색 표시 조건.** v2는 `onSearchChange`가 있을 때만 검색을 그렸다(핸들러 존재 =
 *    의도). 바닐라엔 '핸들러 존재'가 없다. 검색은 기본 노출이 맞지만(FilterBar 대부분이
 *    검색을 쓴다) Boolean attribute는 존재=true라 기본 true를 attribute로 끌 수 없다.
 *    그래서 부정 플래그 `noSearch`(attr `no-search`)로 뒤집는다(DEC-029-5, showcase와 동일):
 *    기본(속성 없음)=검색 노출, `no-search`=검색 없이 필터만 있는 바.
 * 2. **검색 입력에 이름을 준다.** v2 Input에는 접근 이름이 없었다 — `aria-label`(=placeholder)과
 *    `type="search"`(브라우저 지우기 UI·시맨틱)를 붙인다.
 * 3. **초기화 배지가 장식이었다.** v2는 활성 수를 색 pill로만 보였다 — 스크린리더엔 숫자만
 *    낭독됐다. v3는 버튼 `aria-label`에 "필터 N개 초기화"를 실어 의미를 준다.
 * 4. **reset 조건은 v2 그대로** — activeCount>0일 때만 초기화 버튼을 낸다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import filterBarStyles from "./filter-bar.css.js";

const SEARCH_ICON =
  `<svg class="jd-filter-bar__search-icon" width="14" height="14" viewBox="0 0 14 14" ` +
  `fill="none" aria-hidden="true" focusable="false">` +
  `<circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.5"/>` +
  `<path d="M9.5 9.5L13 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export class JdFilterBar extends JdElement {
  static override tag = "jd-filter-bar";
  static override props = {
    /** 내장 검색 입력 숨김 — 부정 플래그 (판단 1). attr: no-search */
    noSearch: { type: Boolean, reflect: true },
    /** 검색어 — jd-input/jd-change로 양방향 */
    search: { type: String },
    searchPlaceholder: { type: String, default: "검색..." }, // attr: search-placeholder
    /** 활성 필터 수 — >0이면 초기화 버튼 노출 */
    activeCount: { type: Number, default: 0, reflect: true }, // attr: active-count
    resetLabel: { type: String, default: "초기화" }, // attr: reset-label
  };

  declare noSearch: boolean;
  declare search: string;
  declare searchPlaceholder: string;
  declare activeCount: number;
  declare resetLabel: string;

  #searchWrap!: HTMLElement;
  #input!: HTMLInputElement;
  #reset!: HTMLButtonElement;
  #resetText!: HTMLElement;
  #badge!: HTMLElement;
  #actions!: HTMLElement;

  protected render(): void {
    adoptStyles(filterBarStyles);
    const found = this.querySelector<HTMLElement>(":scope > .jd-filter-bar__search");
    if (found) {
      this.#searchWrap = found;
      this.#input = found.querySelector("input.jd-filter-bar__input")!;
      this.#reset = this.querySelector(":scope > .jd-filter-bar__reset")!;
      this.#resetText = this.#reset.querySelector(".jd-filter-bar__reset-text")!;
      this.#badge = this.#reset.querySelector(".jd-filter-bar__badge")!;
      this.#actions = this.querySelector(":scope > .jd-filter-bar__actions")!;
    } else {
      this.#buildSkeleton();
    }
    this.update();
  }

  protected override connected(): void {
    // 리스너는 connected/disconnected 쌍으로 — render()에서 걸면 재연결(disconnect→
    // reconnect) 시 render가 다시 돌지 않아 리스너가 되살아나지 않는다(검색이 죽는다).
    this.#input.addEventListener("input", this.#onInput);
    this.#input.addEventListener("change", this.#onChange);
    this.#reset.addEventListener("click", this.#onReset);
  }

  #buildSkeleton(): void {
    // 검색 래퍼 — 맨 앞
    this.#searchWrap = document.createElement("div");
    this.#searchWrap.className = "jd-filter-bar__search";
    this.#searchWrap.insertAdjacentHTML("afterbegin", SEARCH_ICON);
    this.#input = document.createElement("input");
    this.#input.type = "search";
    this.#input.className = "jd-filter-bar__input";
    this.#searchWrap.append(this.#input);

    // 초기화 버튼 + 액션 컨테이너 — 맨 뒤
    this.#reset = document.createElement("button");
    this.#reset.type = "button";
    this.#reset.className = "jd-filter-bar__reset";
    this.#resetText = document.createElement("span");
    this.#resetText.className = "jd-filter-bar__reset-text";
    this.#badge = document.createElement("span");
    this.#badge.className = "jd-filter-bar__badge";
    this.#badge.setAttribute("aria-hidden", "true"); // 숫자는 버튼 aria-label이 낭독(판단 3)
    this.#reset.append(this.#resetText, this.#badge);

    this.#actions = document.createElement("div");
    this.#actions.className = "jd-filter-bar__actions";
    // slot="actions" 자식만 오른쪽으로 이동 — 나머지 light 자식은 필터로 제자리에
    for (const child of Array.from(this.children)) {
      if (child.getAttribute("slot") === "actions") this.#actions.append(child);
    }

    this.prepend(this.#searchWrap); // 검색이 맨 앞
    this.append(this.#reset, this.#actions); // 초기화 → 액션 순으로 맨 뒤
  }

  protected override disconnected(): void {
    this.#input.removeEventListener("input", this.#onInput);
    this.#input.removeEventListener("change", this.#onChange);
    this.#reset.removeEventListener("click", this.#onReset);
  }

  #onInput = (): void => {
    this.search = this.#input.value; // setter → update()가 값을 되쓰지만 동일값이라 캐럿 무영향
    this.emit("jd-input", { value: this.#input.value });
  };

  #onChange = (): void => {
    this.emit("jd-change", { value: this.#input.value });
  };

  #onReset = (): void => {
    this.emit("jd-reset");
  };

  protected override update(): void {
    this.#searchWrap.hidden = this.noSearch;
    this.#input.placeholder = this.searchPlaceholder;
    this.#input.setAttribute("aria-label", this.searchPlaceholder || "검색");
    if (this.#input.value !== this.search) this.#input.value = this.search;

    const count = Math.max(0, Math.floor(this.activeCount) || 0);
    this.#reset.hidden = count <= 0;
    this.#resetText.textContent = this.resetLabel;
    this.#badge.textContent = count > 0 ? String(count) : "";
    this.#badge.hidden = count <= 0;
    this.#reset.setAttribute(
      "aria-label",
      `${this.resetLabel}${count > 0 ? ` (필터 ${count}개)` : ""}`,
    );

    this.#actions.hidden = this.#actions.childElementCount === 0;
  }
}
