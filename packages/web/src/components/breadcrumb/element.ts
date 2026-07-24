/**
 * <jd-breadcrumb> — 경로 내비게이션 (v2 composites/Breadcrumb).
 *
 * 항목은 property(Array) 또는 자식 `<script type="application/json">` 슬롯(§1.3).
 *
 * v2 대비 교정 3건:
 *  1. **목록이 목록이 아니었다.** v2는 `<nav>` 안에 `<span>`을 나열했다 — AT에는
 *     "항목 3개 중 2번째"가 전달되지 않는다. v3는 `<ol>/<li>`로 낸다(빵부스러기는
 *     순서 있는 목록이라는 것이 이 패턴의 정의다).
 *  2. **현재 위치 표시가 시각뿐이었다.** 마지막 항목의 굵은 글씨가 유일한 단서였다.
 *     v3는 `aria-current="page"`를 준다.
 *  3. **구분자를 읽어줬다.** v2 구분자 svg에 aria-hidden이 없어 스크린리더가 그래픽을
 *     항목마다 통과했다. v3는 `aria-hidden="true"` + 텍스트 구분자 옵션(`separator`).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import breadcrumbStyles from "./breadcrumb.css.js";

export interface JdBreadcrumbItem {
  label: string;
  /** 링크 주소 — 없거나 마지막 항목이면 텍스트로 렌더된다 */
  href?: string;
  /** 아이콘. "<svg…>" 마크업 문자열(신뢰된 값만) 또는 DOM 노드 */
  icon?: string | Node;
}

/** v2 기본 구분자 — 14×14 셰브론 */
const SEPARATOR_SVG =
  `<svg viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" ` +
  `stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function fillIcon(slot: HTMLElement, icon: string | Node | undefined): void {
  slot.textContent = "";
  if (icon === undefined || icon === null || icon === "") {
    slot.hidden = true;
    return;
  }
  slot.hidden = false;
  if (typeof icon === "string") {
    if (icon.trimStart().startsWith("<")) slot.innerHTML = icon;
    else slot.textContent = icon;
  } else {
    slot.append(icon);
  }
}

export class JdBreadcrumb extends JdElement {
  static override tag = "jd-breadcrumb";
  static override props = {
    /** 내비게이션 랜드마크 접근 이름 */
    label: { type: String, default: "Breadcrumb" },
    /** 텍스트 구분자. 비우면 기본 셰브론 그래픽 */
    separator: { type: String },
  };

  declare label: string;
  declare separator: string;

  #items: JdBreadcrumbItem[] = [];
  #built: readonly JdBreadcrumbItem[] | null = null;
  #list: HTMLOListElement | null = null;

  get items(): JdBreadcrumbItem[] {
    return this.#items;
  }
  set items(v: JdBreadcrumbItem[]) {
    this.#items = Array.isArray(v) ? v : [];
    this.#built = null;
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(breadcrumbStyles);
    this.#readJson();
    this.setAttribute("role", "navigation");
    // 입양(§3.3): SSR/어댑터가 그린 목록이 있으면 재사용
    this.#list = this.querySelector<HTMLOListElement>(":scope > ol.jd-breadcrumb__list");
    if (!this.#list) {
      this.#list = document.createElement("ol");
      this.#list.className = "jd-breadcrumb__list";
      this.append(this.#list);
    }
    this.#sync();
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdBreadcrumbItem[];
      if (Array.isArray(parsed)) this.#items = parsed;
    } catch {
      console.warn("[junds] <jd-breadcrumb> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  /** 항목이 링크로 렌더되는가 — 마지막(현재 위치)은 항상 텍스트 */
  #isLink(item: JdBreadcrumbItem, index: number): boolean {
    return Boolean(item.href) && index < this.#items.length - 1;
  }

  #sync(): void {
    this.#built = this.#items;
    const list = this.#list;
    if (!list) return;
    const rows = Array.from(list.children) as HTMLLIElement[];
    // 링크/텍스트 전환이 있으면 골격을 다시 만든다 — 그 외에는 입양
    const shapeChanged =
      rows.length !== this.#items.length ||
      this.#items.some((item, i) => {
        const content = rows[i]?.querySelector(".jd-breadcrumb__content");
        return content?.tagName !== (this.#isLink(item, i) ? "A" : "SPAN");
      });
    if (shapeChanged) {
      list.textContent = "";
      this.#items.forEach((item, i) => list.append(this.#createRow(item, i)));
    }
    Array.from(list.children).forEach((node, i) => {
      const item = this.#items[i];
      if (!item) return;
      const row = node as HTMLLIElement;
      const content = row.querySelector<HTMLElement>(".jd-breadcrumb__content")!;
      fillIcon(content.querySelector<HTMLElement>(".jd-breadcrumb__icon")!, item.icon);
      content.querySelector<HTMLElement>(".jd-breadcrumb__label")!.textContent = item.label;
      if (content instanceof HTMLAnchorElement) content.href = item.href ?? "";
      const last = i === this.#items.length - 1;
      if (last) content.setAttribute("aria-current", "page");
      else content.removeAttribute("aria-current");
      row.toggleAttribute("data-current", last);
    });
  }

  #createRow(item: JdBreadcrumbItem, index: number): HTMLLIElement {
    const row = document.createElement("li");
    row.className = "jd-breadcrumb__item";
    if (index > 0) {
      const sep = document.createElement("span");
      sep.className = "jd-breadcrumb__separator";
      sep.setAttribute("aria-hidden", "true");
      row.append(sep);
    }
    const content = document.createElement(this.#isLink(item, index) ? "a" : "span");
    content.className = "jd-breadcrumb__content";
    const icon = document.createElement("span");
    icon.className = "jd-breadcrumb__icon";
    icon.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "jd-breadcrumb__label";
    content.append(icon, label);
    row.append(content);
    return row;
  }

  protected override update(): void {
    if (this.#built !== this.#items) this.#sync();
    this.setAttribute("aria-label", this.label);
    // 구분자는 데이터가 아니라 프로퍼티라 update()가 담당한다
    const seps = this.querySelectorAll<HTMLElement>(".jd-breadcrumb__separator");
    for (const sep of seps) {
      if (this.separator) sep.textContent = this.separator;
      else if (!sep.querySelector("svg")) sep.innerHTML = SEPARATOR_SVG;
    }
  }
}
