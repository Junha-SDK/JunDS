/**
 * <jd-live-order-book> — 매도·매수 N단계 호가창 (v2 finance/LiveOrderBook).
 *
 * v2는 컴포넌트가 REST 스냅샷 + KIS SSE(H0STASP0)를 직접 물어 호가를 갱신했다. DS는
 * 연동을 앱에 남기고(DEC-003 데이터 의존 0) **표시 전용 호가표**로 둔다 — 앱이 `asks`/`bids`
 * 배열과 `current`(현재가)를 프로퍼티(또는 JSON 슬롯)로 싣는다. 잔량 막대·합계·현재가 띠는
 * 순수 렌더다.
 *
 * v2 대비 교정:
 *  1. **toLocaleString("ko-KR")**가 잔량·호가에 박혀 프리렌더/방문자 로케일이 갈렸다 →
 *     groupDigits(§3.1-3 결정성).
 *  2. **합계를 API가 줬다**. 표시 컴포넌트는 잔량 배열에서 직접 합산한다 — 표와 합계가
 *     항상 일관된다.
 *  3. 색을 인라인 style로 칠했다 → data-side로 옮겨 CSS가 칠한다(테마 오버라이드 개방).
 *
 * 색 관례(v2 승계): 매도(asks)=하락색(청), 매수(bids)=상승색(적) — 한국 호가창 관용.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { groupDigits } from "../../core/chart.js";
import orderBookStyles from "./live-order-book.css.js";

export interface JdOrderLevel {
  price: number;
  qty: number;
}

const EM_DASH = "—";

export class JdLiveOrderBook extends JdElement {
  static override tag = "jd-live-order-book";
  static override props = {
    /** 현재가 */
    current: { type: Number },
    /** 라이브 세션 여부 — 배지 상태 (v2 isOpen) */
    live: { type: Boolean, reflect: true },
    /** 배지 상태 텍스트 override. 비우면 live→"LIVE" / 그 외→"장마감" */
    label: { type: String },
    /** 우측 출처 표기 (예: "KIS 소켓") */
    source: { type: String },
    // asks/bids(배열)는 복합 데이터 — property 전용(§1.3).
  };

  declare current: number;
  declare live: boolean;
  declare label: string;
  declare source: string;

  #asks: JdOrderLevel[] = [];
  #bids: JdOrderLevel[] = [];

  #dot!: HTMLElement;
  #title!: HTMLElement;
  #source!: HTMLElement;
  #head!: HTMLTableSectionElement;
  #body!: HTMLTableSectionElement;
  #foot!: HTMLTableSectionElement;

  get asks(): JdOrderLevel[] {
    return this.#asks;
  }
  set asks(v: JdOrderLevel[]) {
    this.#asks = this.#normalize(v);
    this.requestUpdate();
  }
  get bids(): JdOrderLevel[] {
    return this.#bids;
  }
  set bids(v: JdOrderLevel[]) {
    this.#bids = this.#normalize(v);
    this.requestUpdate();
  }

  #normalize(v: unknown): JdOrderLevel[] {
    if (!Array.isArray(v)) return [];
    const num = (x: unknown): number => (typeof x === "number" && Number.isFinite(x) ? x : 0);
    return v
      .filter((l): l is Record<string, unknown> => Boolean(l) && typeof l === "object")
      .map((l) => ({ price: num(l.price), qty: num(l.qty) }));
  }

  protected render(): void {
    adoptStyles(orderBookStyles);
    this.setAttribute("role", "group");
    this.#readJsonSlot();

    const header = document.createElement("header");
    header.className = "jd-lob__head";
    const meta = document.createElement("div");
    meta.className = "jd-lob__meta";
    this.#dot = document.createElement("jd-live-status-dot");
    this.#title = document.createElement("span");
    this.#title.className = "jd-lob__title";
    meta.append(this.#dot, this.#title);
    this.#source = document.createElement("span");
    this.#source.className = "jd-lob__source";
    header.append(meta, this.#source);

    const table = document.createElement("table");
    table.className = "jd-lob__table";
    this.#head = table.createTHead();
    const hr = document.createElement("tr");
    for (const [text, side] of [
      ["매도 잔량", "ask"],
      ["호가", "mid"],
      ["매수 잔량", "bid"],
    ] as const) {
      const th = document.createElement("th");
      th.scope = "col";
      th.className = `jd-lob__th jd-lob__th--${side}`;
      th.textContent = text;
      hr.append(th);
    }
    this.#head.append(hr);
    this.#body = table.createTBody();
    this.#foot = table.createTFoot();

    this.replaceChildren(header, table);
    this.update();
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed = JSON.parse(script.textContent || "null") as {
        asks?: unknown;
        bids?: unknown;
        current?: unknown;
      } | null;
      // 슬롯은 초기값 — 이미 대입된 asks/bids 프로퍼티를 덮지 않는다(§1.3)
      if (parsed && typeof parsed === "object" && this.#asks.length === 0 && this.#bids.length === 0) {
        this.#asks = this.#normalize(parsed.asks);
        this.#bids = this.#normalize(parsed.bids);
        if (typeof parsed.current === "number") this.current = parsed.current;
      }
    } catch {
      console.warn("[junds] <jd-live-order-book> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override update(): void {
    (this.#dot as unknown as { live: boolean }).live = this.live;
    (this.#dot as unknown as { label: string }).label =
      this.label || (this.live ? "LIVE" : "장마감");

    const levels = Math.max(this.#asks.length, this.#bids.length);
    this.#title.textContent = `${levels || 0}호가`;
    this.#source.textContent = this.source || "";
    this.#source.hidden = !this.source;

    this.setAttribute("aria-label", `${levels || 0}단계 호가창`);
    this.#paintRows();
    this.#paintTotals();
  }

  #paintRows(): void {
    this.#body.textContent = "";
    if (this.#asks.length === 0 && this.#bids.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 3;
      td.className = "jd-lob__empty";
      td.textContent = "호가 데이터가 없습니다";
      tr.append(td);
      this.#body.append(tr);
      return;
    }
    const maxAsk = Math.max(1, ...this.#asks.map((a) => a.qty));
    const maxBid = Math.max(1, ...this.#bids.map((b) => b.qty));

    // 매도: 먼 호가(위) → 가까운 호가(아래)
    for (const a of [...this.#asks].reverse()) {
      this.#body.append(this.#askRow(a, a.qty / maxAsk));
    }
    // 현재가 띠
    const cur = document.createElement("tr");
    cur.className = "jd-lob__current";
    const curCell = document.createElement("td");
    curCell.colSpan = 3;
    curCell.textContent = `현재가 ${this.current > 0 ? groupDigits(Math.round(this.current)) : EM_DASH}`;
    cur.append(curCell);
    this.#body.append(cur);
    // 매수: 가까운 호가(위) → 먼 호가(아래)
    for (const b of this.#bids) {
      this.#body.append(this.#bidRow(b, b.qty / maxBid));
    }
  }

  #qtyCell(side: "ask" | "bid", qty: number, ratio: number): HTMLTableCellElement {
    const td = document.createElement("td");
    td.className = `jd-lob__qty jd-lob__qty--${side}`;
    const bar = document.createElement("span");
    bar.className = "jd-lob__bar";
    bar.setAttribute("aria-hidden", "true");
    bar.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
    const val = document.createElement("span");
    val.className = "jd-lob__qty-val";
    val.textContent = groupDigits(Math.round(qty));
    td.append(bar, val);
    return td;
  }

  #priceCell(side: "ask" | "bid", price: number): HTMLTableCellElement {
    const td = document.createElement("td");
    td.className = `jd-lob__price jd-lob__price--${side}`;
    td.setAttribute("data-side", side);
    td.textContent = price > 0 ? groupDigits(Math.round(price)) : EM_DASH;
    return td;
  }

  #spacer(): HTMLTableCellElement {
    const td = document.createElement("td");
    td.className = "jd-lob__spacer";
    return td;
  }

  #askRow(level: JdOrderLevel, ratio: number): HTMLTableRowElement {
    const tr = document.createElement("tr");
    tr.className = "jd-lob__row";
    tr.append(this.#qtyCell("ask", level.qty, ratio), this.#priceCell("ask", level.price), this.#spacer());
    return tr;
  }

  #bidRow(level: JdOrderLevel, ratio: number): HTMLTableRowElement {
    const tr = document.createElement("tr");
    tr.className = "jd-lob__row";
    tr.append(this.#spacer(), this.#priceCell("bid", level.price), this.#qtyCell("bid", level.qty, ratio));
    return tr;
  }

  #paintTotals(): void {
    this.#foot.textContent = "";
    if (this.#asks.length === 0 && this.#bids.length === 0) return;
    const totalAsk = this.#asks.reduce((s, a) => s + a.qty, 0);
    const totalBid = this.#bids.reduce((s, b) => s + b.qty, 0);
    const tr = document.createElement("tr");
    tr.className = "jd-lob__totals";
    const ask = document.createElement("td");
    ask.className = "jd-lob__total jd-lob__total--ask";
    ask.setAttribute("data-side", "ask");
    ask.textContent = groupDigits(Math.round(totalAsk));
    const label = document.createElement("td");
    label.className = "jd-lob__total-label";
    label.textContent = "총 잔량";
    const bid = document.createElement("td");
    bid.className = "jd-lob__total jd-lob__total--bid";
    bid.setAttribute("data-side", "bid");
    bid.textContent = groupDigits(Math.round(totalBid));
    tr.append(ask, label, bid);
    this.#foot.append(tr);
  }
}
