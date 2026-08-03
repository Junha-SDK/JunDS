/**
 * <jd-infinite-list> — 센티넬 교차로 더 불러오는 무한 스크롤 목록 (v2 patterns/InfiniteList).
 *
 * 데이터 2경로(§1.3): `items` 프로퍼티 또는 자식 <script type="application/json">.
 * 항목 렌더는 `renderItem` 프로퍼티(함수 — attribute 불가). 목록 끝 센티넬이 뷰포트에
 * 들어오면 `jd-load-more`를 낸다 — 소비자가 데이터를 붙이고 `items`/`has-more`를 갱신한다.
 * 교차 감지는 behaviors/createInfiniteFeed 재사용(§5.1 — IntersectionObserver를 새로 만들지 않음).
 *
 * v2 대비 교정 4건:
 * 1. **목록이 목록이 아니었다.** v2는 `<div>` 래퍼였다 — role=list/listitem +
 *    aria-setsize/posinset으로 AT에 "N개 중 몇 번째"를 준다(가상화가 아니라 전량이 DOM에
 *    있으므로 setsize는 실제 개수와 같다).
 * 2. **로딩·완료 상태가 조용했다.** 로딩 스피너에 `role=status`(+aria-label), 완료 문구는
 *    aria-live로 한 번 알린다 — 스크린리더가 "더 불러오는 중"·"모두 불러옴"을 듣는다.
 * 3. **키가 없으면 매번 전부 다시 그렸다.** v2는 React 재조정에 기댔다. v3는 `keyExtractor`가
 *    있으면 기존 행을 **키로 재사용**해 append 시 앞 항목을 다시 그리지 않는다(§WEB-02 명령형 반영).
 * 4. **threshold를 rootMargin으로.** v2와 같은 의미(아래쪽 여유 트리거 거리)를 관찰자
 *    rootMargin 하단값으로 옮긴다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createInfiniteFeed } from "../../behaviors/scroll.js";
import type { Behavior } from "../../behaviors/types.js";
import infiniteListStyles from "./infinite-list.css.js";

export type JdListItemContent = string | number | Node | null | undefined;
export type JdListRenderItem = (item: unknown, index: number) => JdListItemContent;
export type JdListKeyExtractor = (item: unknown, index: number) => string;

const SPINNER_SVG =
  `<svg class="jd-infinite-list__spinner-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">` +
  `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity=".2"/>` +
  `<path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity=".8"/></svg>`;

export class JdInfiniteList extends JdElement {
  static override tag = "jd-infinite-list";
  static override props = {
    /** 더 불러올 항목 존재 여부 */
    hasMore: { type: Boolean, reflect: true }, // attr: has-more
    loading: { type: Boolean, reflect: true },
    /** 트리거 여유 거리(px) — 관찰자 rootMargin 하단값 (v2 기본 100) */
    threshold: { type: Number, default: 100 },
    emptyMessage: { type: String, default: "항목이 없습니다" }, // attr: empty-message
    endMessage: { type: String, default: "모두 불러왔습니다" }, // attr: end-message
    loadingLabel: { type: String, default: "더 불러오는 중" }, // attr: loading-label
  };

  declare hasMore: boolean;
  declare loading: boolean;
  declare threshold: number;
  declare emptyMessage: string;
  declare endMessage: string;
  declare loadingLabel: string;

  #items: unknown[] = [];
  /** 함수라 property 전용(§1.3) */
  renderItem: JdListRenderItem | null = null;
  keyExtractor: JdListKeyExtractor | null = null;

  #list!: HTMLElement;
  #sentinel!: HTMLElement;
  #spinner!: HTMLElement;
  #end!: HTMLElement;
  #empty!: HTMLElement;
  /** refresh()/키 없음 시 전량 재채움 강제 (append는 키가 있으면 앞 항목을 건드리지 않는다) */
  #force = false;

  #feed: Behavior | null = null;
  #feedThreshold = NaN;

  get items(): unknown[] {
    return this.#items;
  }
  set items(v: unknown[]) {
    this.#items = Array.isArray(v) ? v.slice() : [];
    this.requestUpdate();
  }

  /** renderItem/keyExtractor를 갈아끼웠거나 항목 내부가 바뀌었을 때 현재 목록을 다시 채운다 */
  refresh(): void {
    this.#force = true;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(infiniteListStyles);
    if (Object.prototype.hasOwnProperty.call(this, "items")) {
      const v = (this as unknown as Record<string, unknown>).items;
      delete (this as unknown as Record<string, unknown>).items;
      (this as unknown as Record<string, unknown>).items = v;
    }
    this.#readJsonSlot();

    const found = this.querySelector<HTMLElement>(":scope > .jd-infinite-list__items");
    if (found) {
      this.#list = found;
      this.#sentinel = this.querySelector(":scope > .jd-infinite-list__sentinel")!;
      this.#spinner = this.querySelector(":scope > .jd-infinite-list__spinner")!;
      this.#end = this.querySelector(":scope > .jd-infinite-list__end")!;
      this.#empty = this.querySelector(":scope > .jd-infinite-list__empty")!;
    } else {
      this.#buildSkeleton();
    }
    this.update();
  }

  #buildSkeleton(): void {
    this.#list = document.createElement("div");
    this.#list.className = "jd-infinite-list__items";
    this.#list.setAttribute("role", "list");

    this.#sentinel = document.createElement("div");
    this.#sentinel.className = "jd-infinite-list__sentinel";
    this.#sentinel.setAttribute("aria-hidden", "true");

    this.#spinner = document.createElement("div");
    this.#spinner.className = "jd-infinite-list__spinner";
    this.#spinner.setAttribute("role", "status");
    this.#spinner.insertAdjacentHTML("beforeend", SPINNER_SVG);

    this.#end = document.createElement("p");
    this.#end.className = "jd-infinite-list__end";
    this.#end.setAttribute("aria-live", "polite");

    this.#empty = document.createElement("p");
    this.#empty.className = "jd-infinite-list__empty";

    this.append(this.#list, this.#sentinel, this.#spinner, this.#end, this.#empty);
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent);
      if (Array.isArray(parsed)) this.#items = parsed;
    } catch {
      console.warn("[junds] <jd-infinite-list> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override connected(): void {
    this.#ensureFeed();
  }

  protected override disconnected(): void {
    this.#feed?.destroy();
    this.#feed = null;
    this.#feedThreshold = NaN;
  }

  /** threshold가 바뀌면 관찰자를 다시 만든다(createInfiniteFeed는 rootMargin 갱신을 지원 안 함) */
  #ensureFeed(): void {
    if (this.#feed && this.#feedThreshold === this.threshold) return;
    this.#feed?.destroy();
    const margin = Math.max(0, Math.floor(this.threshold) || 0);
    this.#feedThreshold = this.threshold;
    this.#feed = createInfiniteFeed(this.#sentinel, () => this.#requestMore(), {
      rootMargin: `0px 0px ${margin}px 0px`,
    });
  }

  #requestMore(): void {
    // hasMore/loading은 콜백 시점에 읽는다 — 상태가 바뀌어도 옳게 판단한다
    if (!this.hasMore || this.loading) return;
    this.emit("jd-load-more");
  }

  protected override update(): void {
    const count = this.#items.length;
    const isEmpty = count === 0 && !this.loading;

    this.#list.hidden = isEmpty;
    this.#empty.hidden = !isEmpty;
    this.#empty.textContent = this.emptyMessage;

    if (!isEmpty) this.#fillRows();

    // 센티넬: 더 불러올 게 있을 때만 관찰 대상이 화면에 남는다
    this.#sentinel.hidden = !this.hasMore || isEmpty;

    this.#spinner.hidden = !this.loading;
    this.#spinner.setAttribute("aria-label", this.loadingLabel);

    const showEnd = !this.hasMore && count > 0 && !this.loading;
    this.#end.hidden = !showEnd;
    this.#end.textContent = showEnd ? this.endMessage : "";

    if (this.isConnected) this.#ensureFeed();
  }

  #fillRows(): void {
    const items = this.#items;
    const list = this.#list;
    const rows = list.children;
    while (rows.length > items.length) list.lastElementChild!.remove();
    while (rows.length < items.length) list.append(this.#buildRow());

    // 키가 있으면 키 일치로 재사용(append 시 앞 항목 보존). 키가 없으면 인덱스 재사용은
    // 내용 교체를 감지 못 하므로 전량 재채움한다(v2 전체 재렌더와 동형, 교정 3).
    const force = this.#force || !this.keyExtractor;
    this.#force = false;
    for (let i = 0; i < items.length; i++) {
      const row = rows[i] as HTMLElement;
      row.setAttribute("aria-setsize", String(items.length));
      row.setAttribute("aria-posinset", String(i + 1));
      const key = this.keyExtractor ? this.keyExtractor(items[i], i) : String(i);
      if (!force && row.dataset.key === key) continue; // 같은 항목 — 다시 그리지 않음(교정 3)
      row.dataset.key = key;
      this.#fillRow(row, items[i], i);
    }
  }

  #buildRow(): HTMLElement {
    const row = document.createElement("div");
    row.className = "jd-infinite-list__item";
    row.setAttribute("role", "listitem");
    return row;
  }

  #fillRow(row: HTMLElement, item: unknown, index: number): void {
    row.textContent = "";
    const out = this.renderItem ? this.renderItem(item, index) : (item as JdListItemContent);
    if (out instanceof Node) row.append(out);
    else if (out !== null && out !== undefined) row.textContent = String(out);
  }
}
