/**
 * <jd-form-array> — 추가/삭제 가능한 반복 항목(배열형 폼 필드) (v2 patterns/FormArray).
 *
 * v2는 render-prop(renderItem)으로 각 행을 그렸다. 바닐라에도 그 표면을 유지한다 —
 * `renderItem`은 함수라 property 전용(§1.3), `(item, index, helpers) => Node|string`.
 * JS 없는 소비자를 위해 자식 `<template>` 폴백도 지원한다(행마다 clone,
 * [name]/[data-field] 입력을 item에 시드하고 input마다 되수집).
 *
 * 재렌더 정책: **구조 변경(add/remove)만 행을 재구축**한다. 편집 중 값 갱신
 * (helpers.update)은 모델·이벤트만 갱신하고 이미 렌더된 컨트롤 DOM을 건드리지 않아
 * 포커스가 유지된다(render-prop 이식의 핵심 함정 회피).
 *
 * - value/defaultItem은 복합 데이터 → property 전용. 초기값은 자식 <script type="application/json">
 *   슬롯으로도 시드 가능(WEB-03 예외).
 * - 이벤트(§1.5): jd-change { value } — 항목 추가·삭제·편집 후 새 배열.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import formArrayStyles from "./form-array.css.js";

type Item = unknown;
type Helpers = { remove: () => void; update: (val: Item) => void };
type RenderItem = (item: Item, index: number, helpers: Helpers) => Node | string | null | undefined;

const ADD_SVG =
  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<path d="M7 3v8M3 7h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const REMOVE_SVG =
  `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">` +
  `<path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export class JdFormArray extends JdElement {
  static override tag = "jd-form-array";
  static override props = {
    addLabel: { type: String, default: "항목 추가" }, // attr: add-label
    minItems: { type: Number, default: 0 }, // attr: min-items
    maxItems: { type: Number, default: 0 }, // attr: max-items — 0 = 무제한
  };

  declare addLabel: string;
  declare minItems: number;
  declare maxItems: number;

  #value: Item[] = [];
  #defaultItem: Item = null;
  #renderItem: RenderItem | null = null;
  #template: HTMLTemplateElement | null = null;

  #list!: HTMLElement;
  #add!: HTMLButtonElement;
  #renderedCount = -1;

  /* ── 복합 데이터 표면(property 전용) ─────────────────────────────── */

  get value(): Item[] {
    return this.#value;
  }
  set value(v: Item[]) {
    this.#value = Array.isArray(v) ? v : [];
    this.#renderedCount = -1; // 외부에서 통째로 갈면 강제 재구축
    this.requestUpdate();
  }

  get defaultItem(): Item {
    return this.#defaultItem;
  }
  set defaultItem(v: Item) {
    this.#defaultItem = v;
  }

  get renderItem(): RenderItem | null {
    return this.#renderItem;
  }
  set renderItem(fn: RenderItem | null) {
    this.#renderItem = typeof fn === "function" ? fn : null;
    this.#renderedCount = -1;
    this.requestUpdate();
  }

  /* ── 렌더 ─────────────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(formArrayStyles);
    this.#upgradeOwn("value");
    this.#upgradeOwn("defaultItem");
    this.#upgradeOwn("renderItem");
    this.#template = this.querySelector<HTMLTemplateElement>(":scope > template");
    this.#readJson();

    const existing = this.querySelector<HTMLElement>(":scope > .jd-form-array");
    if (existing) {
      this.#list = existing.querySelector(".jd-form-array__list")!;
      this.#add = existing.querySelector(".jd-form-array__add")!;
    } else {
      this.#build();
    }
    this.update();
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent);
      if (Array.isArray(parsed)) this.#value = parsed;
    } catch {
      console.warn("[junds] <jd-form-array> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #build(): void {
    const root = document.createElement("div");
    root.className = "jd-form-array";
    this.#list = document.createElement("div");
    this.#list.className = "jd-form-array__list";
    this.#add = document.createElement("button");
    this.#add.type = "button";
    this.#add.className = "jd-form-array__add";
    root.append(this.#list, this.#add);
    this.append(root);
  }

  #upgradeOwn(name: string): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const self = this as unknown as Record<string, unknown>;
    const v = self[name];
    delete self[name];
    self[name] = v;
  }

  protected override connected(): void {
    this.#add.addEventListener("click", this.#onAdd);
    this.#list.addEventListener("click", this.#onListClick);
  }

  protected override disconnected(): void {
    this.#add?.removeEventListener("click", this.#onAdd);
    this.#list?.removeEventListener("click", this.#onListClick);
  }

  /* ── 상태 전이 ─────────────────────────────────────────────────────── */

  #onAdd = (): void => {
    if (this.maxItems > 0 && this.#value.length >= this.maxItems) return;
    this.#value = [...this.#value, this.#cloneDefault()];
    this.#renderedCount = -1;
    this.emit("jd-change", { value: this.#value });
    this.requestUpdate();
  };

  #onListClick = (e: Event): void => {
    const btn = (e.target as Element | null)?.closest<HTMLButtonElement>(".jd-form-array__remove");
    if (!btn || !this.#list.contains(btn)) return;
    const row = btn.closest<HTMLElement>(".jd-form-array__item");
    if (!row) return;
    const i = Array.prototype.indexOf.call(this.#list.children, row);
    if (i >= 0) this.#remove(i);
  };

  #cloneDefault(): Item {
    const d = this.#defaultItem;
    if (d === null || typeof d !== "object") return d;
    try {
      return structuredClone(d);
    } catch {
      return JSON.parse(JSON.stringify(d));
    }
  }

  #remove(index: number): void {
    if (this.#value.length <= this.minItems) return;
    this.#value = this.#value.filter((_, i) => i !== index);
    this.#renderedCount = -1;
    this.emit("jd-change", { value: this.#value });
    this.requestUpdate();
  }

  /** helpers.update — 모델만 갱신(재구축 없음: 포커스 유지) */
  #update(index: number, val: Item): void {
    if (index < 0 || index >= this.#value.length) return;
    this.#value = this.#value.map((item, i) => (i === index ? val : item));
    this.emit("jd-change", { value: this.#value });
  }

  /* ── 반영 ─────────────────────────────────────────────────────────── */

  protected override update(): void {
    let addLabelEl = this.#add.querySelector<HTMLSpanElement>(".jd-form-array__add-label");
    if (!addLabelEl) {
      this.#add.innerHTML = ADD_SVG;
      addLabelEl = document.createElement("span");
      addLabelEl.className = "jd-form-array__add-label";
      this.#add.append(addLabelEl);
    }
    addLabelEl.textContent = this.addLabel;
    const atMax = this.maxItems > 0 && this.#value.length >= this.maxItems;
    this.#add.hidden = atMax;

    if (this.#renderedCount !== this.#value.length) {
      this.#rebuild();
      this.#renderedCount = this.#value.length;
    }
    // 삭제 버튼 노출은 minItems 경계에서만 바뀐다 — 항상 동기화(재렌더 불필요)
    const canRemove = this.#value.length > this.minItems;
    for (const row of Array.from(this.#list.children)) {
      const rm = row.querySelector<HTMLElement>(".jd-form-array__remove");
      if (rm) rm.hidden = !canRemove;
    }
  }

  #rebuild(): void {
    this.#list.textContent = "";
    this.#value.forEach((item, i) => this.#list.append(this.#buildRow(item, i)));
  }

  #buildRow(item: Item, index: number): HTMLElement {
    const row = document.createElement("div");
    row.className = "jd-form-array__item";
    const control = document.createElement("div");
    control.className = "jd-form-array__control";

    const helpers: Helpers = {
      remove: () => this.#remove(index),
      update: (v) => this.#update(index, v),
    };

    if (this.#renderItem) {
      const out = this.#renderItem(item, index, helpers);
      if (typeof out === "string") control.innerHTML = out;
      else if (out) control.append(out);
    } else if (this.#template) {
      this.#bindTemplate(control, item, index);
    }

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "jd-form-array__remove";
    remove.setAttribute("aria-label", "항목 삭제");
    remove.innerHTML = REMOVE_SVG;

    row.append(control, remove);
    return row;
  }

  /** <template> 폴백: clone → item 시드 → input마다 재수집 */
  #bindTemplate(control: HTMLElement, item: Item, index: number): void {
    const frag = this.#template!.content.cloneNode(true) as DocumentFragment;
    const fields = Array.from(
      frag.querySelectorAll<HTMLInputElement>("[data-field], [name]"),
    );
    const isObject = item !== null && typeof item === "object";
    const fieldName = (el: HTMLInputElement): string => el.dataset.field || el.name || "";

    for (const el of fields) {
      const key = fieldName(el);
      const seed = isObject ? (item as Record<string, unknown>)[key] : item;
      if (seed != null) el.value = String(seed);
    }

    const collect = (): void => {
      if (isObject) {
        const next: Record<string, unknown> = { ...(item as Record<string, unknown>) };
        for (const el of fields) next[fieldName(el)] = el.value;
        this.#update(index, next);
      } else {
        this.#update(index, fields[0]?.value ?? "");
      }
    };
    control.addEventListener("input", collect);
    control.append(frag);
  }
}
