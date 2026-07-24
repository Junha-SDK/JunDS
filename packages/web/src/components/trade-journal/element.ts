/**
 * <jd-trade-journal> — 매매 일지 (v2 finance/TradeJournal).
 *
 * v2는 useTradeJournal(LocalStorage) + useLivePrice로 저장·회고를 내부에서 했다. DS 컴포넌트는
 * **저장을 소유하지 않는다**: 앱이 `entries`를 싣고, 추가/삭제는 jd-add / jd-remove 이벤트로
 * 위임한다(로컬 저장·실시간가는 앱 책임). 회고값(pct·classification)은 옵션 — 있으면 표시한다.
 * 스탯 바(총/매수/매도/이번달)는 entries에서 순수 집계한다.
 *
 * 종목 검색은 `stocks` property를 클라이언트 필터(단순 UI 로직). 서제스트 팝업은
 * createClickOutside Behavior로 바깥 클릭 시 닫는다(직접 리스너 금지).
 *
 * v2 대비 개선: 폼이 <form>+제출 시맨틱(엔터 제출·필수 표시), 각 필드 label 연결.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { createClickOutside } from "../../behaviors/input.js";
import tradeJournalStyles from "./trade-journal.css.js";

export type JdTradeSide = "buy" | "sell";

export interface JdTradeEntry {
  id: string;
  name: string;
  side: JdTradeSide;
  qty: number;
  price: number;
  /** ISO 날짜 */
  at: string;
  note?: string;
  /** 현재가 대비 손익률(옵션, 앱이 계산). 0.05 = +5% */
  pct?: number;
  /** 회고 분류(옵션) */
  classification?: "유지" | "수익실현" | "손절" | "추격매수" | "물타기";
}

export interface JdTradeStock {
  name: string;
  sector?: string;
}

const SVG_NS = "http://www.w3.org/2000/svg";
const ICON_NEWSPAPER =
  '<path d="M15 18h-5"/><path d="M18 14h-8"/><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="10" y="6" rx="1"/>';
const ICON_PLUS = '<path d="M5 12h14"/><path d="M12 5v14"/>';
const ICON_CLOSE = '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>';

function iconSvg(paths: string, size: number, cls: string, sw = "2.4"): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", cls);
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", sw);
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = paths;
  return svg;
}

function searchStocks(list: JdTradeStock[], query: string, limit: number): JdTradeStock[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: { s: JdTradeStock; score: number }[] = [];
  for (const s of list) {
    let score = 0;
    const name = s.name.toLowerCase();
    if (name.startsWith(q)) score += 100;
    else if (name.includes(q)) score += 50;
    if (s.sector?.toLowerCase().includes(q)) score += 10;
    if (score > 0) scored.push({ s, score });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
}

export class JdTradeJournal extends JdElement {
  static override tag = "jd-trade-journal";
  static override props = {
    heading: { type: String, default: "매매 일지" },
    loading: { type: Boolean, reflect: true },
    /** 폼 열림 상태(외부에서도 제어 가능) */
    open: { type: Boolean, reflect: true },
  };

  declare heading: string;
  declare loading: boolean;
  declare open: boolean;

  #entries: JdTradeEntry[] = [];
  #stocks: JdTradeStock[] = [];

  #skeleton!: HTMLElement;
  #panel!: HTMLElement;
  #headingEl!: HTMLElement;
  #toggle!: HTMLButtonElement;
  #stats!: HTMLElement;
  #form!: HTMLFormElement;
  #nameInput!: HTMLInputElement;
  #sideSelect!: HTMLSelectElement;
  #qtyInput!: HTMLInputElement;
  #priceInput!: HTMLInputElement;
  #noteInput!: HTMLInputElement;
  #submitBtn!: HTMLButtonElement;
  #suggest!: HTMLElement;
  #listWrap!: HTMLElement;
  #list!: HTMLUListElement;
  #empty!: HTMLElement;

  get entries(): JdTradeEntry[] {
    return this.#entries;
  }
  set entries(v: JdTradeEntry[]) {
    this.#entries = Array.isArray(v) ? v : [];
    if (this.#list) this.#renderList();
    this.requestUpdate();
  }

  get stocks(): JdTradeStock[] {
    return this.#stocks;
  }
  set stocks(v: JdTradeStock[]) {
    this.#stocks = Array.isArray(v) ? v : [];
  }

  protected render(): void {
    adoptStyles(tradeJournalStyles);
    this.#readJson();
    this.#build();
    this.#renderList();
    this.update();
  }

  protected override connected(): void {
    this.own(
      createClickOutside(this.#suggest, (e) => {
        if (e.target === this.#nameInput) return;
        this.#hideSuggest();
      }),
    );
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script?.textContent) return;
    try {
      const parsed = JSON.parse(script.textContent) as JdTradeEntry[];
      if (Array.isArray(parsed)) this.#entries = parsed;
    } catch {
      /* 무시 */
    }
    script.remove();
  }

  #build(): void {
    this.textContent = "";

    this.#skeleton = document.createElement("div");
    this.#skeleton.className = "jd-trade-journal__skeleton";

    this.#panel = document.createElement("div");
    this.#panel.className = "jd-trade-journal__panel";

    // 헤더
    const head = document.createElement("div");
    head.className = "jd-trade-journal__head";
    const titleGroup = document.createElement("div");
    titleGroup.className = "jd-trade-journal__title";
    titleGroup.append(iconSvg(ICON_NEWSPAPER, 14, "jd-trade-journal__icon"));
    this.#headingEl = document.createElement("span");
    titleGroup.append(this.#headingEl);
    this.#toggle = document.createElement("button");
    this.#toggle.type = "button";
    this.#toggle.className = "jd-trade-journal__toggle";
    this.#toggle.append(iconSvg(ICON_PLUS, 12, "jd-trade-journal__toggle-icon", "2.6"));
    const toggleLabel = document.createElement("span");
    toggleLabel.textContent = "기록 추가";
    this.#toggle.append(toggleLabel);
    this.#toggle.addEventListener("click", () => {
      this.open = !this.open;
      if (this.open) queueMicrotask(() => this.#nameInput.focus());
    });
    head.append(titleGroup, this.#toggle);

    // 스탯 바
    this.#stats = document.createElement("div");
    this.#stats.className = "jd-trade-journal__stats";
    for (const [label, tone] of [
      ["총 매매", ""],
      ["매수", "up"],
      ["매도", "down"],
      ["이번달", ""],
    ] as const) {
      const tile = document.createElement("div");
      tile.className = "jd-trade-journal__stat";
      const l = document.createElement("span");
      l.className = "jd-trade-journal__stat-label";
      l.textContent = label;
      const v = document.createElement("span");
      v.className = "jd-trade-journal__stat-value";
      if (tone) v.dataset.tone = tone;
      tile.append(l, v);
      this.#stats.append(tile);
    }

    // 폼
    this.#form = this.#buildForm();

    // 목록
    this.#listWrap = document.createElement("div");
    this.#listWrap.className = "jd-trade-journal__list-wrap";
    this.#list = document.createElement("ul");
    this.#list.className = "jd-trade-journal__list";
    this.#empty = document.createElement("div");
    this.#empty.className = "jd-trade-journal__empty";
    this.#empty.append(iconSvg(ICON_NEWSPAPER, 20, "jd-trade-journal__empty-icon", "2"));
    const et = document.createElement("div");
    et.className = "jd-trade-journal__empty-title";
    et.textContent = "기록된 매매가 없습니다";
    const ed = document.createElement("div");
    ed.className = "jd-trade-journal__empty-desc";
    ed.textContent = "첫 매매를 기록하면 회고와 분류가 자동 생성됩니다.";
    this.#empty.append(et, ed);
    this.#listWrap.append(this.#empty, this.#list);

    this.#panel.append(head, this.#stats, this.#form, this.#listWrap);
    this.append(this.#skeleton, this.#panel);
  }

  #buildForm(): HTMLFormElement {
    const form = document.createElement("form");
    form.className = "jd-trade-journal__form";
    form.hidden = true;

    const grid = document.createElement("div");
    grid.className = "jd-trade-journal__form-grid";

    // 종목 + 서제스트
    const nameField = document.createElement("div");
    nameField.className = "jd-trade-journal__name-field";
    this.#nameInput = document.createElement("input");
    this.#nameInput.className = "jd-trade-journal__input";
    this.#nameInput.placeholder = "종목명";
    this.#nameInput.setAttribute("aria-label", "종목명");
    this.#nameInput.autocomplete = "off";
    this.#nameInput.addEventListener("input", () => this.#onNameInput());
    this.#nameInput.addEventListener("focus", () => this.#onNameInput());
    this.#suggest = document.createElement("ul");
    this.#suggest.className = "jd-trade-journal__suggest";
    this.#suggest.hidden = true;
    nameField.append(this.#nameInput, this.#suggest);

    // 매수/매도
    this.#sideSelect = document.createElement("select");
    this.#sideSelect.className = "jd-trade-journal__input";
    this.#sideSelect.setAttribute("aria-label", "매수/매도");
    for (const [value, label] of [["buy", "매수"], ["sell", "매도"]] as const) {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = label;
      this.#sideSelect.append(opt);
    }

    // 수량
    this.#qtyInput = document.createElement("input");
    this.#qtyInput.type = "number";
    this.#qtyInput.min = "0";
    this.#qtyInput.placeholder = "수량";
    this.#qtyInput.setAttribute("aria-label", "수량");
    this.#qtyInput.className = "jd-trade-journal__input jd-trade-journal__num";
    this.#qtyInput.addEventListener("input", () => this.#syncValid());

    // 단가
    this.#priceInput = document.createElement("input");
    this.#priceInput.type = "number";
    this.#priceInput.min = "0";
    this.#priceInput.placeholder = "단가";
    this.#priceInput.setAttribute("aria-label", "단가");
    this.#priceInput.className = "jd-trade-journal__input jd-trade-journal__num";
    this.#priceInput.addEventListener("input", () => this.#syncValid());

    grid.append(nameField, this.#sideSelect, this.#qtyInput, this.#priceInput);

    // 메모
    this.#noteInput = document.createElement("input");
    this.#noteInput.className = "jd-trade-journal__input jd-trade-journal__note";
    this.#noteInput.placeholder = "이유 (선택, 예: 1분기 호실적 기대)";
    this.#noteInput.setAttribute("aria-label", "매매 이유");

    // 액션
    const actions = document.createElement("div");
    actions.className = "jd-trade-journal__form-actions";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "jd-trade-journal__btn jd-trade-journal__btn--ghost";
    cancel.textContent = "취소";
    cancel.addEventListener("click", () => (this.open = false));
    this.#submitBtn = document.createElement("button");
    this.#submitBtn.type = "submit";
    this.#submitBtn.className = "jd-trade-journal__btn jd-trade-journal__btn--primary";
    this.#submitBtn.textContent = "기록 저장";
    actions.append(cancel, this.#submitBtn);

    form.append(grid, this.#noteInput, actions);
    form.addEventListener("submit", (e) => this.#onSubmit(e));
    return form;
  }

  #onNameInput(): void {
    const matches = searchStocks(this.#stocks, this.#nameInput.value, 6);
    this.#syncValid();
    if (matches.length === 0) {
      this.#hideSuggest();
      return;
    }
    this.#suggest.textContent = "";
    for (const s of matches) {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.className = "jd-trade-journal__suggest-item";
      b.textContent = s.name;
      if (s.sector) {
        const sec = document.createElement("span");
        sec.className = "jd-trade-journal__suggest-sector";
        sec.textContent = `· ${s.sector}`;
        b.append(sec);
      }
      b.addEventListener("click", () => {
        this.#nameInput.value = s.name;
        this.#hideSuggest();
        this.#syncValid();
        this.#nameInput.focus();
      });
      li.append(b);
      this.#suggest.append(li);
    }
    this.#suggest.hidden = false;
  }

  #hideSuggest(): void {
    this.#suggest.hidden = true;
    this.#suggest.textContent = "";
  }

  #isValid(): boolean {
    return (
      this.#nameInput.value.trim().length > 0 &&
      Number(this.#qtyInput.value) > 0 &&
      Number(this.#priceInput.value) > 0
    );
  }

  #syncValid(): void {
    this.#submitBtn.disabled = !this.#isValid();
  }

  #onSubmit(e: Event): void {
    e.preventDefault();
    if (!this.#isValid()) return;
    const detail = {
      name: this.#nameInput.value.trim(),
      side: this.#sideSelect.value as JdTradeSide,
      qty: Number(this.#qtyInput.value),
      price: Number(this.#priceInput.value),
      note: this.#noteInput.value.trim() || undefined,
    };
    this.emit("jd-add", detail);
    this.#resetForm();
    this.open = false;
  }

  #resetForm(): void {
    this.#form.reset();
    this.#hideSuggest();
    this.#syncValid();
  }

  #renderList(): void {
    this.#list.textContent = "";
    for (const entry of this.#entries) this.#list.append(this.#buildRow(entry));
  }

  #buildRow(entry: JdTradeEntry): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "jd-trade-journal__row";

    const side = document.createElement("span");
    side.className = "jd-trade-journal__side";
    side.dataset.side = entry.side;
    side.textContent = entry.side === "buy" ? "매수" : "매도";

    const main = document.createElement("div");
    main.className = "jd-trade-journal__row-main";
    const top = document.createElement("div");
    top.className = "jd-trade-journal__row-top";
    const name = document.createElement("span");
    name.className = "jd-trade-journal__row-name";
    name.textContent = entry.name;
    const spec = document.createElement("span");
    spec.className = "jd-trade-journal__row-spec";
    spec.textContent = `${entry.qty}주 × ${entry.price.toLocaleString("ko-KR")}원`;
    top.append(name, spec);
    const meta = document.createElement("div");
    meta.className = "jd-trade-journal__row-meta";
    const date = document.createElement("span");
    date.className = "jd-trade-journal__row-date";
    date.textContent = this.#fmtDate(entry.at);
    meta.append(date);
    if (entry.note) {
      const note = document.createElement("span");
      note.className = "jd-trade-journal__row-note";
      note.textContent = `· ${entry.note}`;
      meta.append(note);
    }
    main.append(top, meta);

    // 회고(옵션)
    const review = document.createElement("div");
    review.className = "jd-trade-journal__review";
    if (typeof entry.pct === "number") {
      const pct = document.createElement("span");
      pct.className = "jd-trade-journal__pct";
      pct.dataset.tone = entry.pct >= 0 ? "up" : "down";
      pct.textContent = `${entry.pct >= 0 ? "+" : ""}${(entry.pct * 100).toFixed(2)}%`;
      review.append(pct);
    }
    if (entry.classification) {
      const cls = document.createElement("span");
      cls.className = "jd-trade-journal__class";
      cls.dataset.class = entry.classification;
      cls.textContent = entry.classification;
      review.append(cls);
    }

    const del = document.createElement("button");
    del.type = "button";
    del.className = "jd-trade-journal__delete";
    del.setAttribute("aria-label", `${entry.name} 기록 삭제`);
    del.append(iconSvg(ICON_CLOSE, 14, "jd-trade-journal__delete-icon", "2.2"));
    del.addEventListener("click", () => this.emit("jd-remove", { id: entry.id }));

    li.append(side, main, review, del);
    return li;
  }

  #fmtDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("ko-KR");
  }

  protected override update(): void {
    this.#headingEl.textContent = this.heading;

    // 스탯 — v2와 동형: '이번달'은 데이터에 존재하는 마지막 달 버킷(캘린더 now 아님 → 결정적)
    const total = this.#entries.length;
    const buys = this.#entries.filter((t) => t.side === "buy").length;
    const sells = this.#entries.filter((t) => t.side === "sell").length;
    const monthCounts = new Map<string, number>();
    for (const t of this.#entries) {
      const m = t.at.slice(0, 7);
      monthCounts.set(m, (monthCounts.get(m) ?? 0) + 1);
    }
    const months = [...monthCounts.keys()].sort((a, b) => a.localeCompare(b));
    const thisMonth = months.length ? (monthCounts.get(months[months.length - 1]!) ?? 0) : 0;
    const values = [total, buys, sells, thisMonth];
    const tiles = this.#stats.querySelectorAll(".jd-trade-journal__stat-value");
    tiles.forEach((tile, i) => {
      tile.textContent = `${values[i]!}건`;
    });

    // 폼 열림
    this.#form.hidden = !this.open;
    this.#toggle.dataset.active = String(this.open);
    this.#toggle.setAttribute("aria-expanded", String(this.open));
    if (!this.open) this.#hideSuggest();
    this.#syncValid();

    // 상태 전환
    this.#skeleton.hidden = !this.loading;
    this.#panel.hidden = this.loading;
    const empty = this.#entries.length === 0;
    this.#empty.hidden = !empty;
    this.#list.hidden = empty;
  }
}
