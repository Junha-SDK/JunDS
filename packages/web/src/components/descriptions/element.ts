/**
 * <jd-descriptions> — 키-값 쌍 표시의 **원형** (v2 composites/Descriptions).
 * jd-key-value-grid가 기본값과 스킨만 바꿔 파생한다(§6 R12).
 *
 * 항목 입력 2경로(§1.3 — 복합 데이터는 attribute 금지):
 *  1. `items` 프로퍼티 (Array<JdDescriptionItem>)
 *  2. 자식 `<script type="application/json">[…]</script>` 슬롯 (DEC-023-3 선례)
 *
 * v2 대비 개선 3건:
 *  1. **테이블이 아니라 <dl>이다.** v2 bordered는 `<table><tbody><tr><td>`로 그렸는데
 *     `<th>`도 scope도 caption도 없었다 — AT는 "머리글 없는 표"라고만 읽었다. 키-값
 *     목록의 네이티브 의미론은 dl/dt/dd이고, 그러면 "설명 목록, 항목 N개"로 읽힌다.
 *     외관(라벨 셀 틴트·1px 격자)은 CSS로 그대로 재현한다.
 *  2. **행 나누기를 CSS 그리드 자동 배치에 맡긴다.** v2는 span 합을 세어 손으로 행을
 *     쪼갰고(그 결과가 그리드 자동 배치와 같았다) bordered/비bordered 골격을 두 벌
 *     유지했다. 골격이 한 벌로 접히면서 layout×bordered 4조합의 JSX 복제가 사라진다.
 *  3. **제목이 목록의 접근 이름이 된다** (aria-labelledby) — v2는 그냥 위에 놓인 h3였다.
 *
 * 스타일 훅은 호스트 attribute가 아니라 `.jd-descriptions__box`의 `data-layout`·
 * `data-bordered`다. 파생 태그(jd-key-value-grid)가 `jd-descriptions[bordered]` 같은
 * 호스트 셀렉터를 통째로 복제하지 않도록 하기 위한 것으로, jd-disclosure의 data-state와
 * 같은 이유다.
 *
 * 주의: `title` 프롭은 v2 표면 승계이자 jd-drawer·jd-action-sheet 선례지만,
 * `<jd-descriptions title="…">`로 쓰면 브라우저 기본 툴팁이 함께 뜬다.
 * 툴팁이 거슬리면 attribute 대신 프로퍼티(`el.title = "…"`)로 넣는다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { jdUid } from "../../core/uid.js";
import descriptionsStyles from "./descriptions.css.js";

export interface JdDescriptionItem {
  /** 항목 식별자 */
  key: string;
  label: string;
  /** 값. "<a …>" 마크업 문자열(신뢰된 값만) 또는 DOM 노드 */
  value?: string | Node;
  /** 차지할 열 수. 기본 1 */
  span?: number;
}

/** 마크업 문자열이면 innerHTML(신뢰된 값만), 아니면 텍스트 (jd-tabs fillIcon 선례) */
function fillSlot(slot: HTMLElement, value: string | Node | undefined): void {
  slot.textContent = "";
  if (value === undefined || value === null || value === "") return;
  if (typeof value === "string") {
    if (value.trimStart().startsWith("<")) slot.innerHTML = value;
    else slot.textContent = value;
  } else {
    slot.append(value);
  }
}

export class JdDescriptions extends JdElement {
  static override tag = "jd-descriptions";
  static override props = {
    /** 상단 제목 */
    title: { type: String },
    /** 한 행의 열 수 */
    columns: { type: Number, default: 2, reflect: true },
    /** 격자 테두리 */
    bordered: { type: Boolean, reflect: true },
    /** horizontal(라벨 왼쪽) | vertical(라벨 위) */
    layout: { type: String, default: "horizontal", reflect: true },
  };

  declare title: string;
  declare columns: number;
  declare bordered: boolean;
  declare layout: string;

  #items: JdDescriptionItem[] = [];
  /** 마지막으로 골격에 반영한 배열 — 데이터 동기화 1회 판정 (jd-tabs 선례) */
  #built: readonly JdDescriptionItem[] | null = null;
  #box: HTMLElement | null = null;
  #titleEl: HTMLElement | null = null;
  #list: HTMLElement | null = null;

  get items(): JdDescriptionItem[] {
    return this.#items;
  }
  set items(v: JdDescriptionItem[]) {
    this.#items = Array.isArray(v) ? v : [];
    this.#built = null; // 같은 배열을 다시 대입해도 재동기화한다
    this.requestUpdate();
  }

  /* ── 골격 ────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(descriptionsStyles);
    this.#readJson();
    // 입양 규칙(§3.3): 세 노드가 온전할 때만 재사용한다
    let box = this.querySelector<HTMLElement>(":scope > .jd-descriptions__box");
    let title = box?.querySelector<HTMLElement>(":scope > .jd-descriptions__title") ?? null;
    let list = box?.querySelector<HTMLElement>(":scope > .jd-descriptions__list") ?? null;
    if (!box || !title || !list) {
      box?.remove();
      box = document.createElement("div");
      box.className = "jd-descriptions__box";
      title = document.createElement("h3");
      title.className = "jd-descriptions__title";
      list = document.createElement("dl");
      list.className = "jd-descriptions__list";
      box.append(title, list);
      this.append(box);
    }
    this.#box = box;
    this.#titleEl = title;
    this.#list = list;
    if (!title.id) title.id = jdUid(`${(this.constructor as typeof JdDescriptions).tag}-title`);
    this.#sync();
    this.update();
  }

  /** 선언적 초기화 슬롯 — 1회 소비 (radio-group·tabs 선례) */
  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdDescriptionItem[];
      if (Array.isArray(parsed)) this.#items = parsed;
    } catch {
      console.warn("[junds] <jd-descriptions> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #rows(): HTMLElement[] {
    const list = this.#list;
    if (!list) return [];
    return Array.from(list.querySelectorAll<HTMLElement>(":scope > .jd-descriptions__item"));
  }

  /** 항목 골격 구축·데이터 반영. 개수가 같으면 만들지 않고 내용만 맞춘다(§3.3) */
  #sync(): void {
    const list = this.#list;
    if (!list) return;
    this.#built = this.#items;
    let rows = this.#rows();
    if (rows.length !== this.#items.length) {
      for (const r of rows) r.remove();
      for (let i = 0; i < this.#items.length; i++) list.append(this.#createItem());
      rows = this.#rows();
    }
    rows.forEach((row, i) => {
      const item = this.#items[i];
      if (!item) return;
      const span = Math.max(1, Math.round(item.span ?? 1));
      row.dataset.key = item.key;
      // span은 인라인 style이 아니라 커스텀 프로퍼티 + data-span으로 낸다 —
      // 인라인이면 파생(jd-key-value-grid)의 반응형 span 규칙이 이길 수 없다
      row.dataset.span = String(span);
      row.style.setProperty("--jd-desc-span", String(span));
      row.querySelector<HTMLElement>(".jd-descriptions__label")!.textContent = item.label;
      fillSlot(row.querySelector<HTMLElement>(".jd-descriptions__value")!, item.value);
    });
  }

  /** dl 안의 div 래퍼는 HTML 표준 허용 — dt/dd 쌍을 하나의 그리드 셀로 묶는다 */
  #createItem(): HTMLElement {
    const row = document.createElement("div");
    row.className = "jd-descriptions__item";
    const label = document.createElement("dt");
    label.className = "jd-descriptions__label";
    const value = document.createElement("dd");
    value.className = "jd-descriptions__value";
    row.append(label, value);
    return row;
  }

  /* ── 상태 반영 ────────────────────────────────────────────── */

  protected override update(): void {
    if (this.#built !== this.#items) this.#sync();
    const box = this.#box;
    const title = this.#titleEl;
    const list = this.#list;
    if (!box || !title || !list) return;
    title.textContent = this.title;
    title.hidden = !this.title;
    if (this.title) list.setAttribute("aria-labelledby", title.id);
    else list.removeAttribute("aria-labelledby");
    box.dataset.layout = this.layout === "vertical" ? "vertical" : "horizontal";
    box.toggleAttribute("data-bordered", this.bordered);
    // 열 수는 열거할 수 없으므로 커스텀 프로퍼티로 — CSS가 repeat()에서 소비한다
    list.style.setProperty("--jd-desc-cols", String(Math.max(1, Math.round(this.columns))));
  }
}
