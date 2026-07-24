/**
 * <jd-accordion> — 아코디언 (v2 composites/Accordion).
 *
 * 행은 **<jd-disclosure>로 짓는다**. 개폐 상태·aria-expanded/controls·region·
 * 접힘 애니메이션·닫힌 본문의 탭 순서 제외를 다시 구현하지 않기 위해서다(§6 R12).
 * 행 골격은 이 컴포넌트가 미리 그려서 넘기고 jd-disclosure가 **입양**한다(§3.3) —
 * 아이콘·제목·셰브런 배치는 아코디언 고유 표면이므로 원형에 밀어 넣지 않았다.
 *
 * 항목 입력 2경로(§1.3 — 복합 데이터는 attribute 금지):
 *  1. `items` 프로퍼티 (Array<JdAccordionItem>)
 *  2. 자식 `<script type="application/json">[…]</script>` 슬롯 (DEC-023-3 선례)
 *
 * v2 대비 개선:
 *  - **화살표 키 내비게이션**(APG Accordion): ↑/↓로 헤더 이동, Home/End로 처음·끝.
 *    v2에는 없었다. 패널 본문 안에서 눌린 키는 건드리지 않는다(트리거 위에서만 동작).
 *  - **single 모드가 프로그램 변경에도 적용된다**: v2는 클릭 경로에서만 Set을 비웠다.
 *    v3는 행에서 올라오는 jd-open을 받아 닫으므로 `el.toggle(key)`·`openKeys` 대입에도
 *    같은 규칙이 선다.
 *
 * 이벤트: 행의 `jd-open`/`jd-close`가 그대로 버블한다(light DOM). 어느 항목인지가
 * 필요한 소비자를 위해 아코디언은 `jd-change`({ key, open, openKeys })를 추가 발행한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { on, createKeyHandler } from "../../behaviors/input.js";
import type { JdDisclosure } from "../disclosure/element.js";
import accordionStyles from "./accordion.css.js";

export interface JdAccordionItem {
  /** 항목 식별자 — openKeys·jd-change detail과 대응 */
  key: string;
  title: string;
  /** 본문. "<p>…</p>" 마크업 문자열(신뢰된 값만) 또는 DOM 노드 */
  content?: string | Node;
  /** 제목 왼쪽 아이콘. 마크업 문자열 또는 DOM 노드 */
  icon?: string | Node;
  /** 최초 반영 시 1회만 적용된다 — 사용자가 닫은 항목이 재동기화로 되살아나지 않는다 */
  defaultOpen?: boolean;
}

const CHEVRON_SVG =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">` +
  `<path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/**
 * 슬롯 채우기 — 문자열이 마크업이면 innerHTML(신뢰된 값만), 아니면 텍스트.
 * 마크업 경로는 HTML 파서 재파싱이라 SVG 네임스페이스도 올바르게 생긴다(DEC-030-1).
 */
function fillSlot(slot: HTMLElement, value: string | Node | undefined, keep = false): void {
  slot.textContent = "";
  const empty = value === undefined || value === null || value === "";
  if (!keep) slot.hidden = empty;
  if (empty) return;
  if (typeof value === "string") {
    if (value.trimStart().startsWith("<")) slot.innerHTML = value;
    else slot.textContent = value;
  } else {
    slot.append(value);
  }
}

export class JdAccordion extends JdElement {
  static override tag = "jd-accordion";
  static override props = {
    /** 하나만 열기 */
    single: { type: Boolean, reflect: true },
  };

  declare single: boolean;

  #items: JdAccordionItem[] = [];
  /** 마지막으로 골격에 반영한 배열 — 데이터 동기화 1회 판정 (jd-tabs 선례) */
  #built: readonly JdAccordionItem[] | null = null;
  #openKeys = new Set<string>();
  /** defaultOpen을 소비한 key — 재동기화가 사용자의 접기를 되돌리지 않게 한다 */
  #seeded = new Set<string>();
  #offs: Array<() => void> = [];

  get items(): JdAccordionItem[] {
    return this.#items;
  }
  set items(v: JdAccordionItem[]) {
    this.#items = Array.isArray(v) ? v : [];
    this.#built = null; // 같은 배열을 다시 대입해도 재동기화한다
    this.requestUpdate();
  }

  /** 열려 있는 항목 key 목록 (property 전용 — 복합 데이터 §1.3) */
  get openKeys(): string[] {
    return [...this.#openKeys];
  }
  set openKeys(v: string[]) {
    this.#openKeys = new Set(Array.isArray(v) ? v : []);
    this.requestUpdate();
  }

  /* ── 골격 ────────────────────────────────────────────────── */

  protected render(): void {
    adoptStyles(accordionStyles);
    this.#readJson();
    this.#sync();
    this.update();
  }

  /** 선언적 초기화 슬롯 — 1회 소비 (radio-group·tabs 선례) */
  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "[]") as JdAccordionItem[];
      if (Array.isArray(parsed)) this.#items = parsed;
    } catch {
      console.warn("[junds] <jd-accordion> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #rows(): HTMLElement[] {
    return Array.from(this.querySelectorAll<HTMLElement>(":scope > jd-disclosure"));
  }

  #triggers(): HTMLElement[] {
    return Array.from(
      this.querySelectorAll<HTMLElement>(":scope > jd-disclosure > .jd-accordion__trigger"),
    );
  }

  /** 행 골격 구축·데이터 반영. 개수가 같으면 만들지 않고 내용만 맞춘다(§3.3) */
  #sync(): void {
    this.#built = this.#items;
    let rows = this.#rows();
    if (rows.length !== this.#items.length) {
      for (const r of rows) r.remove();
      for (let i = 0; i < this.#items.length; i++) this.append(this.#createRow());
      rows = this.#rows();
    }
    rows.forEach((row, i) => {
      const item = this.#items[i];
      if (!item) return;
      if (!this.#seeded.has(item.key)) {
        this.#seeded.add(item.key);
        if (item.defaultOpen) this.#openKeys.add(item.key);
      }
      row.dataset.key = item.key;
      row.querySelector<HTMLElement>(".jd-accordion__title")!.textContent = item.title;
      fillSlot(row.querySelector<HTMLElement>(".jd-accordion__icon")!, item.icon);
      fillSlot(row.querySelector<HTMLElement>(".jd-accordion__content")!, item.content, true);
    });
  }

  /** jd-disclosure가 입양할 골격을 미리 그린다 — 원형의 클래스 이름을 그대로 쓴다 */
  #createRow(): HTMLElement {
    const row = document.createElement("jd-disclosure");
    row.className = "jd-accordion__item";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "jd-disclosure__trigger jd-accordion__trigger";
    const icon = document.createElement("span");
    icon.className = "jd-accordion__icon";
    icon.setAttribute("aria-hidden", "true");
    const title = document.createElement("span");
    title.className = "jd-accordion__title";
    const chevron = document.createElement("span");
    chevron.className = "jd-accordion__chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.innerHTML = CHEVRON_SVG;
    btn.append(icon, title, chevron);

    const panel = document.createElement("div");
    panel.className = "jd-disclosure__panel";
    const inner = document.createElement("div");
    inner.className = "jd-disclosure__inner";
    const body = document.createElement("div");
    body.className = "jd-accordion__content";
    inner.append(body);
    panel.append(inner);

    row.append(btn, panel);
    return row;
  }

  /* ── 수명주기 ─────────────────────────────────────────────── */

  protected override connected(): void {
    this.#offs.push(
      on(this as EventTarget, "jd-open", this.#onRowToggle as (e: never) => void),
      on(this as EventTarget, "jd-close", this.#onRowToggle as (e: never) => void),
    );
    // preventDefault는 트리거 위에서만 — 패널 본문의 스크롤·입력을 막지 않는다
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
    // 재부모화 생존 규율(DEC-031-1)
    this.requestUpdate();
  }

  protected override disconnected(): void {
    for (const off of this.#offs) off();
    this.#offs = [];
  }

  protected override update(): void {
    if (this.#built !== this.#items) this.#sync();
    this.#enforceSingle();
    for (const row of this.#rows()) {
      const next = this.#openKeys.has(row.dataset.key ?? "");
      const disclosure = row as unknown as JdDisclosure;
      if (disclosure.open !== next) disclosure.open = next;
    }
  }

  /* ── 공개 API ─────────────────────────────────────────────── */

  /** open 생략 시 토글 */
  toggle(key: string, open?: boolean): void {
    const next = open ?? !this.#openKeys.has(key);
    if (next) {
      if (this.single) this.#openKeys.clear();
      this.#openKeys.add(key);
    } else {
      this.#openKeys.delete(key);
    }
    this.requestUpdate();
  }

  /* ── 상태 ────────────────────────────────────────────────── */

  /** single이면 문서 순서상 첫 열림만 남긴다 (프로그램 변경에도 적용 — v2 결함 교정) */
  #enforceSingle(): void {
    if (!this.single || this.#openKeys.size <= 1) return;
    const first = this.#items.find((it) => this.#openKeys.has(it.key));
    this.#openKeys = new Set(first ? [first.key] : []);
  }

  #onRowToggle = (e: Event): void => {
    const row = (e.target as Element | null)?.closest?.("jd-disclosure") as HTMLElement | null;
    if (!row || row.parentElement !== this) return;
    const key = row.dataset.key;
    if (key === undefined) return;
    const open = e.type === "jd-open";
    // 우리가 만든 전이(update()의 되쓰기)면 이미 상태가 같다 — 되먹임 차단
    if (this.#openKeys.has(key) === open) return;
    if (open && this.single) this.#openKeys.clear();
    if (open) this.#openKeys.add(key);
    else this.#openKeys.delete(key);
    this.requestUpdate();
    this.emit("jd-change", { key, open, openKeys: [...this.#openKeys] });
  };

  /* ── 키보드 (APG Accordion) ───────────────────────────────── */

  #focusIndex(e: KeyboardEvent): { triggers: HTMLElement[]; from: number } | null {
    const current = (e.target as Element | null)?.closest?.(".jd-accordion__trigger");
    if (!current) return null;
    const triggers = this.#triggers();
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
