/**
 * <jd-live-top-movers> — 급등·급락·거래대금 TOP 3열 (v2 finance/LiveTopMovers).
 *
 * v2는 `/api/krx/movers`를 시장·유형별로 폴링해 rise/fall/volume 버킷을 받았다. DS는
 * 표시 컴포넌트로 분리한다(DEC-003): 앱이 `stocks` 한 벌을 싣고, 세 열은 순수 정렬로
 * **파생**한다(급등=등락률↓ · 급락=등락률↑ · 거래대금=금액↓). 시장 토글은 재-fetch가 아니라
 * 주입 데이터의 `market` 필드 필터로 동작하고 `jd-market-change`를 발행한다 — 앱이 서버
 * 사이드 필터로 이어받을 수 있다.
 *
 * 구조·색은 형제 jd-investor-ranking과 같은 관용구(3열 카드, 1위 배지, data-dir 착색)를
 * 따른다(§6 재사용). LIVE 여부는 `live`가 배지 상태만 가른다(자체 지터 없음 — v2도 값은
 * 서버가 줬다).
 *
 * v2 대비 교정: toLocaleString → groupDigits(§3.1-3), 색 인라인 → data-dir(CSS 착색).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { groupDigits } from "../../core/chart.js";
import topMoversStyles from "./live-top-movers.css.js";

export type JdMarket = "KOSPI" | "KOSDAQ";

export interface JdMoverStock {
  code: string;
  name: string;
  price: number;
  /** 등락률(%) */
  changePct: number;
  /** 거래대금(억원) */
  amount: number;
  market?: JdMarket;
}

type Tone = "up" | "down" | "neutral";
type Metric = "pct" | "amount";

interface ColumnDef {
  title: string;
  tone: Tone;
  metric: Metric;
  cmp: (a: JdMoverStock, b: JdMoverStock) => number;
}

const COLUMNS: readonly ColumnDef[] = [
  { title: "급등 TOP", tone: "up", metric: "pct", cmp: (a, b) => b.changePct - a.changePct },
  { title: "급락 TOP", tone: "down", metric: "pct", cmp: (a, b) => a.changePct - b.changePct },
  { title: "거래대금 TOP", tone: "neutral", metric: "amount", cmp: (a, b) => b.amount - a.amount },
];

const MARKETS: readonly JdMarket[] = ["KOSPI", "KOSDAQ"];
const MARKET_LABEL: Record<JdMarket, string> = { KOSPI: "코스피", KOSDAQ: "코스닥" };

function fmtAmount(eok: number): string {
  if (!Number.isFinite(eok) || eok === 0) return "—";
  if (eok >= 10_000) return `${(eok / 10_000).toFixed(2)}조`;
  return `${groupDigits(Math.round(eok))}억`;
}

export class JdLiveTopMovers extends JdElement {
  static override tag = "jd-live-top-movers";
  static override props = {
    /** 열별 표시 행 수 (v2 rows=8) */
    rows: { type: Number, default: 8 },
    /** 초기 활성 시장 */
    market: { type: String, default: "KOSPI" },
    /** 라이브 세션 여부 — 배지 상태 (v2 isOpen) */
    live: { type: Boolean, reflect: true },
    /** 배지 상태 텍스트 override */
    label: { type: String },
    /** 우측 출처 표기 (예: "네이버") */
    source: { type: String },
    // stocks(배열)는 복합 데이터 — property 전용(§1.3).
  };

  declare rows: number;
  declare market: string;
  declare live: boolean;
  declare label: string;
  declare source: string;

  #stocks: JdMoverStock[] = [];
  #active: JdMarket = "KOSPI";
  #activeSet = false;

  #dot!: HTMLElement;
  #title!: HTMLElement;
  #source!: HTMLElement;
  #toggle!: HTMLElement;
  #lists: HTMLOListElement[] = [];

  get stocks(): JdMoverStock[] {
    return this.#stocks;
  }
  set stocks(v: JdMoverStock[]) {
    this.#stocks = this.#normalize(v);
    this.requestUpdate();
  }

  #normalize(v: unknown): JdMoverStock[] {
    if (!Array.isArray(v)) return [];
    const num = (x: unknown): number => (typeof x === "number" && Number.isFinite(x) ? x : 0);
    return v
      .filter((s): s is Record<string, unknown> => Boolean(s) && typeof s === "object")
      .map((s) => ({
        code: typeof s.code === "string" ? s.code : "",
        name: typeof s.name === "string" ? s.name : "",
        price: num(s.price),
        changePct: num(s.changePct),
        amount: num(s.amount),
        market: s.market === "KOSPI" || s.market === "KOSDAQ" ? s.market : undefined,
      }));
  }

  #activeMarket(): JdMarket {
    if (this.#activeSet) return this.#active;
    return this.market === "KOSDAQ" ? "KOSDAQ" : "KOSPI";
  }

  protected render(): void {
    adoptStyles(topMoversStyles);
    this.setAttribute("role", "group");
    this.#readJsonSlot();

    const card = document.createElement("div");
    card.className = "jd-ltm__card";

    const head = document.createElement("div");
    head.className = "jd-ltm__head";
    this.#dot = document.createElement("jd-live-status-dot");
    this.#title = document.createElement("span");
    this.#title.className = "jd-ltm__title";
    this.#toggle = document.createElement("div");
    this.#toggle.className = "jd-ltm__toggle";
    this.#toggle.setAttribute("role", "group");
    this.#toggle.setAttribute("aria-label", "시장 선택");
    for (const m of MARKETS) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "jd-ltm__toggle-btn";
      btn.dataset.market = m;
      btn.textContent = MARKET_LABEL[m];
      btn.addEventListener("click", () => this.#selectMarket(m));
      this.#toggle.append(btn);
    }
    this.#source = document.createElement("span");
    this.#source.className = "jd-ltm__source";
    head.append(this.#dot, this.#title, this.#toggle, this.#source);

    const grid = document.createElement("div");
    grid.className = "jd-ltm__grid";
    this.#lists = [];
    COLUMNS.forEach((col, i) => {
      const colEl = document.createElement("div");
      colEl.className = "jd-ltm__col";
      colEl.dataset.tone = col.tone;
      if (i === COLUMNS.length - 1) colEl.setAttribute("data-last", "");
      const colHead = document.createElement("div");
      colHead.className = "jd-ltm__col-head";
      const dot = document.createElement("span");
      dot.className = "jd-ltm__col-dot";
      dot.setAttribute("aria-hidden", "true");
      const label = document.createElement("span");
      label.className = "jd-ltm__col-label";
      label.textContent = col.title;
      colHead.append(dot, label);
      const list = document.createElement("ol");
      list.className = "jd-ltm__list";
      colEl.append(colHead, list);
      grid.append(colEl);
      this.#lists.push(list);
    });

    card.append(head, grid);
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
      console.warn("[junds] <jd-live-top-movers> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #selectMarket(m: JdMarket): void {
    if (this.#activeMarket() === m) return;
    this.#active = m;
    this.#activeSet = true;
    this.emit("jd-market-change", { market: m });
    this.requestUpdate();
  }

  /** 활성 시장으로 필터 — market 필드가 전혀 없으면 필터하지 않는다 */
  #visibleStocks(): JdMoverStock[] {
    const active = this.#activeMarket();
    const filtered = this.#stocks.filter((s) => s.market === active);
    return filtered.length > 0 ? filtered : this.#stocks;
  }

  protected override update(): void {
    (this.#dot as unknown as { live: boolean }).live = this.live;
    (this.#dot as unknown as { label: string }).label =
      this.label || (this.live ? "LIVE" : "장마감");

    const active = this.#activeMarket();
    this.#title.textContent = `${MARKET_LABEL[active]} ${
      this.live ? "실시간 순위" : "장 마감 순위"
    }`;
    this.setAttribute("aria-label", `${MARKET_LABEL[active]} 등락 순위`);
    this.#source.textContent = this.source || "";
    this.#source.hidden = !this.source;

    for (const btn of this.#toggle.querySelectorAll<HTMLButtonElement>(".jd-ltm__toggle-btn")) {
      const on = btn.dataset.market === active;
      btn.toggleAttribute("data-active", on);
      btn.setAttribute("aria-pressed", String(on));
    }

    const top = Math.max(1, this.rows);
    const pool = this.#visibleStocks();
    COLUMNS.forEach((col, i) => {
      const list = this.#lists[i]!;
      const ranked = [...pool].sort(col.cmp).slice(0, top);
      this.#paintColumn(list, col, ranked);
    });
  }

  #paintColumn(list: HTMLOListElement, col: ColumnDef, ranked: JdMoverStock[]): void {
    list.textContent = "";
    if (ranked.length === 0) {
      const li = document.createElement("li");
      li.className = "jd-ltm__empty";
      li.textContent = "데이터 없음";
      list.append(li);
      return;
    }
    ranked.forEach((s, i) => {
      const li = document.createElement("li");
      li.className = "jd-ltm__row";

      const rank = document.createElement("span");
      rank.className = "jd-ltm__rank";
      rank.toggleAttribute("data-first", i === 0);
      rank.textContent = String(i + 1);

      const meta = document.createElement("div");
      meta.className = "jd-ltm__meta";
      const name = document.createElement("div");
      name.className = "jd-ltm__name";
      name.textContent = s.name;
      const sub = document.createElement("div");
      sub.className = "jd-ltm__row-sub";
      const price = document.createElement("span");
      price.className = "jd-ltm__price";
      price.textContent = groupDigits(Math.round(s.price));
      sub.append(price);
      if (s.code) {
        const code = document.createElement("span");
        code.className = "jd-ltm__code";
        code.textContent = s.code;
        sub.append(code);
      }
      meta.append(name, sub);

      const value = document.createElement("span");
      value.className = "jd-ltm__value";
      if (col.metric === "pct") {
        value.setAttribute("data-dir", s.changePct >= 0 ? "up" : "down");
        value.textContent = `${s.changePct >= 0 ? "+" : ""}${s.changePct.toFixed(2)}%`;
      } else {
        value.setAttribute("data-dir", "neutral");
        value.textContent = fmtAmount(s.amount);
      }

      li.append(rank, meta, value);
      list.append(li);
    });
  }
}
