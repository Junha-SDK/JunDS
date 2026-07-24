/**
 * <jd-pagination> — 페이지 이동 (v2 composites/Pagination).
 *
 * 페이지 번호 배열 계산은 v2 알고리즘(siblings 기준 앞뒤 확장 + 생략기호) 그대로다.
 *
 * v2 대비 교정 4건:
 *  1. **이전/다음 버튼에 이름이 없었다.** 아이콘만 든 `<button>` 2개가 접근 이름 없이
 *     나갔다 — 스크린리더에는 "버튼"으로만 읽힌다. v3는 `prevLabel`/`nextLabel`을
 *     aria-label로 붙인다(기본 한국어).
 *  2. **현재 페이지 표시가 시각뿐이었다.** v3는 활성 버튼에 `aria-current="page"`.
 *  3. **생략기호를 읽어줬다.** "..." 텍스트가 그대로 접근성 트리에 있었다 —
 *     `aria-hidden="true"`로 감춘다.
 *  4. **목록이 목록이 아니었다.** 번호를 `<ol>/<li>`로 낸다(총 개수·위치가 전달된다).
 *
 * v2가 `totalPages <= 1`에서 null을 반환하던 것은 호스트 `hidden`으로 옮겼다 —
 * 요소는 남고 렌더 결과만 사라진다(CE는 자기 자신을 지울 수 없다).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import paginationStyles from "./pagination.css.js";

const PREV_SVG =
  `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">` +
  `<path d="M10 4l-4 4 4 4" stroke="currentColor" stroke-width="1.5" ` +
  `stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const NEXT_SVG =
  `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">` +
  `<path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" ` +
  `stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** v2 useMemo 계산식 그대로 — 1 … (page±siblings) … totalPages */
export function paginationRange(
  page: number,
  totalPages: number,
  siblings: number,
): (number | "…")[] {
  const items: (number | "…")[] = [];
  const start = Math.max(2, page - siblings);
  const end = Math.min(totalPages - 1, page + siblings);
  items.push(1);
  if (start > 2) items.push("…");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < totalPages - 1) items.push("…");
  if (totalPages > 1) items.push(totalPages);
  return items;
}

export class JdPagination extends JdElement {
  static override tag = "jd-pagination";
  static override props = {
    /** 현재 페이지 (1-base) */
    page: { type: Number, default: 1, reflect: true },
    /** 전체 페이지 수 */
    totalPages: { type: Number, default: 1 },
    /** 현재 페이지 좌우로 보여줄 이웃 수 */
    siblings: { type: Number, default: 1 },
    /** 내비게이션 랜드마크 접근 이름 */
    label: { type: String, default: "Pagination" },
    prevLabel: { type: String, default: "이전 페이지" },
    nextLabel: { type: String, default: "다음 페이지" },
  };

  declare page: number;
  declare totalPages: number;
  declare siblings: number;
  declare label: string;
  declare prevLabel: string;
  declare nextLabel: string;

  #prev: HTMLButtonElement | null = null;
  #next: HTMLButtonElement | null = null;
  #list: HTMLOListElement | null = null;
  /** 마지막으로 그린 페이지 배열의 서명 — 같으면 골격을 건드리지 않는다 */
  #signature = "";

  protected render(): void {
    adoptStyles(paginationStyles);
    this.setAttribute("role", "navigation");
    // 입양(§3.3)
    this.#prev = this.querySelector<HTMLButtonElement>(':scope > button[data-dir="prev"]');
    this.#list = this.querySelector<HTMLOListElement>(":scope > ol.jd-pagination__list");
    this.#next = this.querySelector<HTMLButtonElement>(':scope > button[data-dir="next"]');
    if (!this.#prev || !this.#list || !this.#next) {
      this.textContent = "";
      this.#prev = this.#createArrow("prev", PREV_SVG);
      this.#list = document.createElement("ol");
      this.#list.className = "jd-pagination__list";
      this.#next = this.#createArrow("next", NEXT_SVG);
      this.append(this.#prev, this.#list, this.#next);
    }
    this.update();
  }

  protected override connected(): void {
    this.addEventListener("click", this.#onClick);
  }

  protected override disconnected(): void {
    this.removeEventListener("click", this.#onClick);
  }

  #createArrow(dir: "prev" | "next", svg: string): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "jd-pagination__arrow";
    btn.dataset.dir = dir;
    btn.innerHTML = svg;
    return btn;
  }

  /** 실제 이동 가능한 페이지로 자른 값 */
  #clamp(n: number): number {
    const total = Math.max(1, Math.floor(this.totalPages) || 1);
    return Math.min(Math.max(1, Math.floor(n) || 1), total);
  }

  #go(next: number): void {
    const page = this.#clamp(next);
    if (page === this.page) return;
    this.page = page;
    this.emit("jd-change", { page });
  }

  #onClick = (e: Event): void => {
    const btn = (e.target as Element | null)?.closest("button");
    if (!btn || !this.contains(btn)) return;
    if (btn.dataset.dir === "prev") return this.#go(this.page - 1);
    if (btn.dataset.dir === "next") return this.#go(this.page + 1);
    const value = btn.dataset.page;
    if (value) this.#go(Number(value));
  };

  protected override update(): void {
    this.setAttribute("aria-label", this.label);
    const total = Math.max(1, Math.floor(this.totalPages) || 1);
    // v2: totalPages <= 1이면 렌더하지 않는다
    this.hidden = total <= 1;

    const page = this.#clamp(this.page);
    const siblings = Math.max(0, Math.floor(this.siblings) || 0);
    const range = paginationRange(page, total, siblings);
    const signature = range.join("|");

    const list = this.#list;
    if (list && signature !== this.#signature) {
      this.#signature = signature;
      list.textContent = "";
      for (const entry of range) list.append(this.#createEntry(entry));
    }
    if (list) {
      for (const node of Array.from(list.children)) {
        const btn = node.querySelector<HTMLButtonElement>(".jd-pagination__page");
        if (!btn) continue;
        const active = Number(btn.dataset.page) === page;
        if (active) btn.setAttribute("aria-current", "page");
        else btn.removeAttribute("aria-current");
      }
    }

    if (this.#prev) {
      this.#prev.disabled = page <= 1;
      this.#prev.setAttribute("aria-label", this.prevLabel);
    }
    if (this.#next) {
      this.#next.disabled = page >= total;
      this.#next.setAttribute("aria-label", this.nextLabel);
    }
  }

  #createEntry(entry: number | "…"): HTMLLIElement {
    const row = document.createElement("li");
    row.className = "jd-pagination__item";
    if (entry === "…") {
      const gap = document.createElement("span");
      gap.className = "jd-pagination__ellipsis";
      gap.setAttribute("aria-hidden", "true");
      gap.textContent = "…";
      row.append(gap);
      return row;
    }
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "jd-pagination__page";
    btn.dataset.page = String(entry);
    btn.textContent = String(entry);
    row.append(btn);
    return row;
  }
}
