/**
 * <jd-live-stock-table> — 전 종목 실시간 표 + 검색·필터·정렬 (v2 finance/LiveStockTable).
 *
 * v2는 HEATMAP_FLAT 시드를 쥐고 3초마다 LCG 지터로 흔들며, 검색·시장·섹터·정렬 상태를
 * 컴포넌트 안에서 관리했다. DS는 데이터를 앱이 주게 하고(DEC-003) `stocks` 프로퍼티(또는
 * JSON 슬롯)로 받는다. 검색·필터·정렬은 표시 상호작용이라 컴포넌트가 그대로 소유한다.
 *
 * 라이브 지터는 형제 jd-investor-ranking처럼 **opt-in `live`**다 — 켜지면 connected 이후
 * createInterval Behavior에서만 결정적 LCG로 흔든다(§3.1-3 render는 항상 순수, Math.random
 * 미사용). 값이 흔들리는 동안 직전 가격 대비로 ▲/▼ 방향색을 칠한다(v2 trend 이식).
 *
 * v2 대비 교정:
 *  1. toLocaleString → groupDigits(§3.1-3 결정성).
 *  2. 종목명 Link(/stock/...) 하드코딩 라우트 제거 — DS는 라우팅을 모른다. 행 클릭은
 *     `jd-select`로 발행해 앱이 이어받는다.
 *  3. 색 인라인 → data-trend/data-dir(CSS 착색).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { groupDigits } from "../../core/chart.js";
import { createInterval } from "../../behaviors/timing.js";
import stockTableStyles from "./live-stock-table.css.js";

export type JdStockMarket = "KOSPI" | "KOSDAQ" | "—";
type SortKey = "pctDesc" | "pctAsc" | "volumeDesc" | "priceDesc" | "name";
type Trend = "up" | "down" | "flat";

export interface JdLiveStock {
  name: string;
  code: string;
  market: JdStockMarket;
  group?: string;
  price: number;
  /** 등락률(%) */
  pct: number;
  /** 거래대금(억원) */
  volume: number;
}

const MARKET_FILTERS = ["ALL", "KOSPI", "KOSDAQ"] as const;
type MarketFilter = (typeof MARKET_FILTERS)[number];
const MARKET_LABEL: Record<MarketFilter, string> = {
  ALL: "전체",
  KOSPI: "코스피",
  KOSDAQ: "코스닥",
};

const SORT_OPTIONS: readonly { value: SortKey; label: string }[] = [
  { value: "pctDesc", label: "등락률 ↓" },
  { value: "pctAsc", label: "등락률 ↑" },
  { value: "volumeDesc", label: "거래대금 ↓" },
  { value: "priceDesc", label: "주가 ↓" },
  { value: "name", label: "이름순" },
];

const COLUMNS: readonly { label: string; right?: boolean }[] = [
  { label: "#" },
  { label: "종목" },
  { label: "섹터" },
  { label: "현재가", right: true },
  { label: "등락률", right: true },
  { label: "거래대금", right: true },
];

function fmtVolume(eok: number): string {
  if (!Number.isFinite(eok)) return "—";
  if (eok >= 10_000) return `${(eok / 10_000).toFixed(2)}조`;
  return `${groupDigits(Math.round(eok))}억`;
}

export class JdLiveStockTable extends JdElement {
  static override tag = "jd-live-stock-table";
  static override props = {
    /** 라이브 지터 틱 켜기 (v2는 항상 켜짐 — 여기선 opt-in) */
    live: { type: Boolean, reflect: true },
    /** 틱 간격(ms). v2 3000 */
    interval: { type: Number, default: 3000 },
    /** 배지 상태 텍스트 override */
    label: { type: String },
    /** 스크롤 영역 최대 높이(px). v2 480 */
    maxHeight: { type: Number, default: 480, attribute: "max-height" },
    // stocks(배열)는 복합 데이터 — property 전용(§1.3).
  };

  declare live: boolean;
  declare interval: number;
  declare label: string;
  declare maxHeight: number;

  #stocks: JdLiveStock[] = [];
  #prev = new Map<string, number>();
  #seed = 19;
  #timer?: { destroy(): void };

  // 표시 상호작용 상태(컴포넌트 소유)
  #query = "";
  #market: MarketFilter = "ALL";
  #group = "ALL";
  #sort: SortKey = "pctDesc";
  #groupKey = "";

  #dot!: HTMLElement;
  #count!: HTMLElement;
  #search!: HTMLInputElement;
  #marketToggle!: HTMLElement;
  #groupSelect!: HTMLSelectElement;
  #sortSelect!: HTMLSelectElement;
  #scroll!: HTMLElement;
  #body!: HTMLTableSectionElement;

  get stocks(): JdLiveStock[] {
    return this.#stocks;
  }
  set stocks(v: JdLiveStock[]) {
    this.#stocks = this.#normalize(v);
    this.#prev.clear();
    this.requestUpdate();
  }

  #normalize(v: unknown): JdLiveStock[] {
    if (!Array.isArray(v)) return [];
    const num = (x: unknown): number => (typeof x === "number" && Number.isFinite(x) ? x : 0);
    return v
      .filter((s): s is Record<string, unknown> => Boolean(s) && typeof s === "object")
      .map((s) => ({
        name: typeof s.name === "string" ? s.name : "",
        code: typeof s.code === "string" ? s.code : "",
        market: s.market === "KOSPI" || s.market === "KOSDAQ" ? s.market : "—",
        group: typeof s.group === "string" ? s.group : undefined,
        price: num(s.price),
        pct: num(s.pct),
        volume: num(s.volume),
      }));
  }

  protected render(): void {
    adoptStyles(stockTableStyles);
    this.setAttribute("role", "group");
    this.#readJsonSlot();

    const card = document.createElement("div");
    card.className = "jd-lst__card";

    const bar = document.createElement("div");
    bar.className = "jd-lst__bar";
    this.#dot = document.createElement("jd-live-status-dot");
    this.#count = document.createElement("span");
    this.#count.className = "jd-lst__count";

    this.#search = document.createElement("input");
    this.#search.type = "search";
    this.#search.className = "jd-lst__search";
    this.#search.placeholder = "종목명·코드 검색";
    this.#search.setAttribute("aria-label", "종목명·코드 검색");
    this.#search.addEventListener("input", () => {
      this.#query = this.#search.value;
      this.requestUpdate();
    });

    this.#marketToggle = document.createElement("div");
    this.#marketToggle.className = "jd-lst__toggle";
    this.#marketToggle.setAttribute("role", "group");
    this.#marketToggle.setAttribute("aria-label", "시장 필터");
    for (const m of MARKET_FILTERS) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "jd-lst__toggle-btn";
      btn.dataset.market = m;
      btn.textContent = MARKET_LABEL[m];
      btn.addEventListener("click", () => {
        this.#market = m;
        this.requestUpdate();
      });
      this.#marketToggle.append(btn);
    }

    this.#groupSelect = document.createElement("select");
    this.#groupSelect.className = "jd-lst__select";
    this.#groupSelect.setAttribute("aria-label", "섹터 필터");
    this.#groupSelect.addEventListener("change", () => {
      this.#group = this.#groupSelect.value;
      this.requestUpdate();
    });

    this.#sortSelect = document.createElement("select");
    this.#sortSelect.className = "jd-lst__select";
    this.#sortSelect.setAttribute("aria-label", "정렬 기준");
    for (const opt of SORT_OPTIONS) {
      const o = document.createElement("option");
      o.value = opt.value;
      o.textContent = opt.label;
      this.#sortSelect.append(o);
    }
    this.#sortSelect.value = this.#sort;
    this.#sortSelect.addEventListener("change", () => {
      this.#sort = this.#sortSelect.value as SortKey;
      this.requestUpdate();
    });

    bar.append(
      this.#dot,
      this.#count,
      this.#search,
      this.#marketToggle,
      this.#groupSelect,
      this.#sortSelect,
    );

    this.#scroll = document.createElement("div");
    this.#scroll.className = "jd-lst__scroll";
    const table = document.createElement("table");
    table.className = "jd-lst__table";
    const thead = table.createTHead();
    const hr = document.createElement("tr");
    for (const col of COLUMNS) {
      const th = document.createElement("th");
      th.scope = "col";
      th.className = "jd-lst__th";
      if (col.right) th.dataset.right = "";
      th.textContent = col.label;
      hr.append(th);
    }
    thead.append(hr);
    this.#body = table.createTBody();
    this.#scroll.append(table);

    card.append(bar, this.#scroll);
    this.replaceChildren(card);
    this.update();
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent || "[]");
      // 슬롯은 초기값 — 이미 대입된 stocks 프로퍼티를 덮지 않는다(§1.3)
      if (Array.isArray(parsed) && this.#stocks.length === 0)
        this.#stocks = this.#normalize(parsed);
    } catch {
      console.warn("[junds] <jd-live-stock-table> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected override connected(): void {
    if (this.live) this.#start();
  }

  protected override disconnected(): void {
    this.#timer?.destroy();
    this.#timer = undefined;
  }

  #start(): void {
    if (this.#timer) return; // 멱등 — render의 update()와 connected()가 모두 부른다(이중 시작 방지)
    this.#timer = this.own(
      createInterval(() => {
        const snapshot = new Map<string, number>();
        for (const s of this.#stocks) snapshot.set(s.name, s.price);
        this.#stocks = this.#tick(this.#stocks);
        this.#prev = snapshot;
        this.requestUpdate();
      }, Math.max(250, this.interval)),
    );
  }

  /** v2 tick — 결정적 LCG 지터로 값 한 스텝 흔들기 */
  #tick(prev: JdLiveStock[]): JdLiveStock[] {
    const jitter = (): number => {
      this.#seed = (this.#seed * 1103515245 + 12345) & 0x7fffffff;
      return (this.#seed % 1000) / 1000 - 0.5;
    };
    return prev.map((s) => ({
      ...s,
      pct: +(s.pct + jitter() * 0.45).toFixed(2),
      price: Math.max(100, Math.round(s.price * (1 + jitter() * 0.005))),
      volume: Math.max(20, Math.round(s.volume * (1 + jitter() * 0.06))),
    }));
  }

  #groups(): string[] {
    return Array.from(
      new Set(this.#stocks.map((s) => s.group).filter((g): g is string => Boolean(g))),
    );
  }

  /** 섹터 목록이 바뀌었을 때만 select 옵션을 다시 세운다(선택 유지) */
  #syncGroupOptions(): void {
    const groups = this.#groups();
    const key = groups.join("|");
    if (key === this.#groupKey) return;
    this.#groupKey = key;
    const current = this.#group;
    this.#groupSelect.textContent = "";
    const all = document.createElement("option");
    all.value = "ALL";
    all.textContent = "섹터: 전체";
    this.#groupSelect.append(all);
    for (const g of groups) {
      const o = document.createElement("option");
      o.value = g;
      o.textContent = g;
      this.#groupSelect.append(o);
    }
    this.#group = groups.includes(current) || current === "ALL" ? current : "ALL";
    this.#groupSelect.value = this.#group;
  }

  #filteredSorted(): JdLiveStock[] {
    let out = this.#stocks;
    if (this.#market !== "ALL") out = out.filter((s) => s.market === this.#market);
    if (this.#group !== "ALL") out = out.filter((s) => s.group === this.#group);
    const q = this.#query.trim().toLowerCase();
    if (q) out = out.filter((s) => s.name.toLowerCase().includes(q) || s.code.includes(q));
    const sorted = [...out];
    switch (this.#sort) {
      case "pctDesc":
        sorted.sort((a, b) => b.pct - a.pct);
        break;
      case "pctAsc":
        sorted.sort((a, b) => a.pct - b.pct);
        break;
      case "volumeDesc":
        sorted.sort((a, b) => b.volume - a.volume);
        break;
      case "priceDesc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));
        break;
    }
    return sorted;
  }

  protected override update(): void {
    // live 토글 반영
    if (this.live && !this.#timer && this.isConnected) this.#start();
    if (!this.live && this.#timer) {
      this.#timer.destroy();
      this.#timer = undefined;
    }

    (this.#dot as unknown as { live: boolean }).live = this.live;
    (this.#dot as unknown as { label: string }).label =
      this.label || (this.live ? "LIVE" : "장마감");
    this.#count.textContent = `전 종목 (${this.#stocks.length})`;
    this.#scroll.style.maxHeight = `${Math.max(120, this.maxHeight)}px`;

    for (const btn of this.#marketToggle.querySelectorAll<HTMLButtonElement>(
      ".jd-lst__toggle-btn",
    )) {
      const on = btn.dataset.market === this.#market;
      btn.toggleAttribute("data-active", on);
      btn.setAttribute("aria-pressed", String(on));
    }

    this.#syncGroupOptions();
    this.#paintRows(this.#filteredSorted());
  }

  #paintRows(rows: JdLiveStock[]): void {
    this.#body.textContent = "";
    if (rows.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = COLUMNS.length;
      td.className = "jd-lst__empty";
      td.textContent = "결과 없음";
      tr.append(td);
      this.#body.append(tr);
      return;
    }
    rows.forEach((s, i) => this.#body.append(this.#row(s, i)));
  }

  #row(s: JdLiveStock, i: number): HTMLTableRowElement {
    const ref = this.#prev.get(s.name);
    const trend: Trend =
      ref === undefined ? "flat" : s.price > ref ? "up" : s.price < ref ? "down" : "flat";

    const tr = document.createElement("tr");
    tr.className = "jd-lst__row";
    tr.tabIndex = 0;
    tr.setAttribute("role", "button");
    const emitSelect = (): boolean => this.emit("jd-select", { code: s.code, name: s.name });
    tr.addEventListener("click", emitSelect);
    tr.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        emitSelect();
      }
    });

    const rank = document.createElement("td");
    rank.className = "jd-lst__num";
    rank.textContent = String(i + 1);

    const nameCell = document.createElement("td");
    nameCell.className = "jd-lst__name-cell";
    const name = document.createElement("span");
    name.className = "jd-lst__name";
    name.textContent = s.name;
    const sub = document.createElement("span");
    sub.className = "jd-lst__sub";
    sub.textContent = `${s.code || "—"} · ${s.market}`;
    nameCell.append(name, sub);

    const sector = document.createElement("td");
    sector.className = "jd-lst__sector";
    if (s.group) {
      const tag = document.createElement("span");
      tag.className = "jd-lst__tag";
      tag.textContent = s.group;
      sector.append(tag);
    } else {
      sector.textContent = "—";
    }

    const price = document.createElement("td");
    price.className = "jd-lst__price";
    price.dataset.trend = trend;
    price.dataset.right = "";
    price.textContent = `${trend === "up" ? "▲" : trend === "down" ? "▼" : ""}${groupDigits(
      Math.round(s.price),
    )}`;

    const pct = document.createElement("td");
    pct.className = "jd-lst__pct";
    pct.dataset.dir = s.pct >= 0 ? "up" : "down";
    pct.dataset.right = "";
    pct.textContent = `${s.pct >= 0 ? "+" : ""}${s.pct.toFixed(2)}%`;

    const vol = document.createElement("td");
    vol.className = "jd-lst__vol";
    vol.dataset.right = "";
    vol.textContent = fmtVolume(s.volume);

    tr.append(rank, nameCell, sector, price, pct, vol);
    return tr;
  }
}
