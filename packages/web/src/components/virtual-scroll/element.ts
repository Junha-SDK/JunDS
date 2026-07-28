/**
 * <jd-virtual-scroll> — 고정 높이 항목의 가상 스크롤러 (v2 composites/VirtualScroll).
 *
 * 데이터 입력 2경로(§1.3): `items` 프로퍼티 또는 자식
 * `<script type="application/json">[…]</script>`. 항목 렌더는 `renderItem` 프로퍼티
 * (함수 — attribute 불가). 미지정이면 값의 문자열이 그대로 들어간다.
 *
 * SSG 규칙(§3.1-3): render()는 **측정하지 않는다**. 최초 창은 뷰포트 높이 0 기준으로
 * overscan만큼만 그려지고(문자 단위 결정적), 실측은 connected() 이후 ResizeObserver가
 * 채운다. 프리렌더 스냅샷이 실행 환경에 따라 달라지지 않는다.
 *
 * v2 대비 교정 4건:
 *  1. **목록이 목록이 아니었다.** 창 밖 항목이 DOM에 없으므로 AT에는 "3개짜리 목록"으로
 *     보였다 — role=list/listitem + `aria-setsize`/`aria-posinset`으로 전체 크기와
 *     현재 위치를 알린다.
 *  2. **매 스크롤마다 DOM을 새로 만들었다.** v2는 React 재조정에 기대 창 전체를
 *     다시 그렸다. v3는 행 노드를 **재사용**하고(인덱스가 바뀐 행만 다시 채운다),
 *     창이 그대로면 DOM을 아예 건드리지 않는다.
 *  3. **top으로 배치했다.** transform으로 옮겨 레이아웃 재계산을 뺀다(05-perf).
 *  4. **높이를 소비자 CSS에만 맡겼다.** 높이 없는 컨테이너에서는 가상화가 무의미해지므로
 *     `height` 프로퍼티를 두고, 미지정 시에도 max-height 없는 흐름을 그대로 둔다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createSizeObserver } from "../../behaviors/viewport.js";
import virtualScrollStyles from "./virtual-scroll.css.js";

export type JdVirtualItemContent = string | number | Node | null | undefined;
export type JdVirtualRenderItem = (item: unknown, index: number) => JdVirtualItemContent;

export class JdVirtualScroll extends JdElement {
  static override tag = "jd-virtual-scroll";
  static override props = {
    /** 항목 고정 높이(px) */
    itemHeight: { type: Number, default: 48 }, // attr: item-height
    /** 뷰포트 밖 여유 렌더 개수 (v2 기본 5) */
    overscan: { type: Number, default: 5 },
    /** 스크롤러 높이 — 숫자 문자열은 px. 미지정이면 소비자 CSS 몫 */
    height: { type: String },
  };

  declare itemHeight: number;
  declare overscan: number;
  declare height: string;

  #items: unknown[] = [];
  /** 항목 렌더러 — 함수라 property 전용(§1.3) */
  renderItem: JdVirtualRenderItem | null = null;

  #sizer!: HTMLElement;
  #viewport = 0;
  #scrollTop = 0;
  #start = -1;
  #end = -1;
  /** 창이 그대로여도 내용을 다시 채워야 하는 상태(항목 교체·renderItem 교체) */
  #contentDirty = true;

  get items(): unknown[] {
    return this.#items;
  }
  set items(v: unknown[]) {
    this.#items = Array.isArray(v) ? v.slice() : [];
    this.#contentDirty = true;
    this.requestUpdate();
  }

  /** renderItem을 갈아끼웠거나 항목 내부가 바뀌었을 때 — 현재 창을 다시 채운다 */
  refresh(): void {
    this.#contentDirty = true;
    this.requestUpdate();
  }

  /** 현재 그려진 창 [start, end) */
  get range(): { start: number; end: number } {
    return { start: Math.max(0, this.#start), end: Math.max(0, this.#end) };
  }

  protected render(): void {
    adoptStyles(virtualScrollStyles);
    if (Object.prototype.hasOwnProperty.call(this, "items")) {
      const v = (this as unknown as Record<string, unknown>).items;
      delete (this as unknown as Record<string, unknown>).items;
      (this as unknown as Record<string, unknown>).items = v;
    }
    this.#readJsonSlot();
    const existing = this.querySelector<HTMLElement>(":scope > .jd-virtual-scroll__sizer");
    if (existing) {
      this.#sizer = existing;
    } else {
      this.#sizer = document.createElement("div");
      this.#sizer.className = "jd-virtual-scroll__sizer";
      this.#sizer.setAttribute("role", "list");
      this.append(this.#sizer);
    }
    this.update();
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
      console.warn("[junds] <jd-virtual-scroll> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override connected(): void {
    this.addEventListener("scroll", this.#onScroll, { passive: true });
    // 실측은 연결 이후에만 — render()는 결정적으로 남는다(§3.1-3)
    this.own(createSizeObserver(this, ({ height }) => this.#setViewport(height)));
    this.#setViewport(this.clientHeight);
    this.#scrollTop = this.scrollTop;
    this.requestUpdate();
  }

  protected override disconnected(): void {
    this.removeEventListener("scroll", this.#onScroll);
  }

  #onScroll = (): void => {
    this.#scrollTop = this.scrollTop;
    this.update(); // 스크롤은 즉시 반영 — 마이크로태스크 배칭을 기다리면 빈 칸이 보인다
  };

  #setViewport(height: number): void {
    if (height === this.#viewport) return;
    this.#viewport = height;
    this.requestUpdate();
  }

  protected override update(): void {
    const h = Math.max(1, this.itemHeight || 1);
    const overscan = Math.max(0, Math.floor(this.overscan) || 0);
    const count = this.#items.length;

    const size = this.height.trim();
    if (size)
      this.style.setProperty(
        "--_jd-virtual-scroll-height",
        /^\d+(\.\d+)?$/.test(size) ? `${size}px` : size,
      );
    else this.style.removeProperty("--_jd-virtual-scroll-height");

    this.#sizer.style.height = `${count * h}px`;

    const force = this.#contentDirty;
    this.#contentDirty = false;
    const start = Math.max(0, Math.floor(this.#scrollTop / h) - overscan);
    const end = Math.min(count, Math.ceil((this.#scrollTop + this.#viewport) / h) + overscan);
    if (!force && start === this.#start && end === this.#end) return; // 창 불변 — DOM 무접촉
    this.#start = start;
    this.#end = end;

    const needed = Math.max(0, end - start);
    const rows = this.#sizer.children;
    while (rows.length > needed) this.#sizer.lastElementChild?.remove();
    while (rows.length < needed) this.#sizer.append(this.#buildRow());

    for (let i = 0; i < needed; i++) {
      const index = start + i;
      const row = rows[i] as HTMLElement;
      row.style.height = `${h}px`;
      row.style.transform = `translateY(${index * h}px)`;
      row.setAttribute("aria-setsize", String(count));
      row.setAttribute("aria-posinset", String(index + 1));
      if (!force && row.dataset.index === String(index)) continue; // 같은 항목 — 내용 유지
      row.dataset.index = String(index);
      this.#fillRow(row, this.#items[index], index);
    }
    this.emit("jd-range-change", { start, end, total: count });
  }

  #buildRow(): HTMLElement {
    const row = document.createElement("div");
    row.className = "jd-virtual-scroll__item";
    row.setAttribute("role", "listitem");
    return row;
  }

  #fillRow(row: HTMLElement, item: unknown, index: number): void {
    row.textContent = "";
    const out = this.renderItem ? this.renderItem(item, index) : (item as JdVirtualItemContent);
    if (out instanceof Node) row.append(out);
    else if (out !== null && out !== undefined) row.textContent = String(out);
  }
}
