/**
 * <jd-live-investor-board> — 실시간 투자자 매매동향 보드 (v2 finance/LiveInvestorBoard).
 *
 * 코스피·코스닥·선물 × 외국인·기관·개인 격자. 각 셀은 순매수 스파크라인 + 순매수액 +
 * 증감 핀 + 매수/매도 + 매수율 바를 담는다. `status="open"` + `live`면 v2처럼 결정적
 * LCG 지터로 interval마다 값을 흔들고, 변화한 셀에 플래시(상승=적/하락=청)를 준다.
 *
 * SSG 규칙(§3.1-3): render()·paint()는 Date.now/Math.random을 읽지 않는다 — 시계 문자열과
 * 틱은 connected 이후 이펙트에서만 갱신한다(초기 렌더는 결정적). SVG는 createElementNS.
 *
 * 데이터는 `snapshot` 프로퍼티(§1.3): Record<market, Record<investor, {buy, sell}>>.
 * 이력(스파크라인)은 컴포넌트가 틱마다 내부 축적한다.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { coord, groupDigits, svgNode, upgradeAccessor } from "../../core/chart.js";
import { createInterval } from "../../behaviors/timing.js";
import liveInvestorBoardStyles from "./live-investor-board.css.js";

type InvestorKey = "foreign" | "institution" | "individual";
type MarketKey = "kospi" | "kosdaq" | "futures";
type MarketStatus = "open" | "closed" | "holiday";

interface Row {
  buy: number;
  sell: number;
}
type Snapshot = Record<MarketKey, Record<InvestorKey, Row>>;
type NetHistory = Record<MarketKey, Record<InvestorKey, number[]>>;

interface CellRefs {
  cell: HTMLElement;
  spark: SVGSVGElement;
  net: HTMLElement;
  delta: HTMLElement;
  buy: HTMLElement;
  sell: HTMLElement;
  barBuy: HTMLElement;
  barSell: HTMLElement;
  rateBuy: HTMLElement;
  rateSell: HTMLElement;
}

const MARKETS: readonly { key: MarketKey; label: string }[] = [
  { key: "kospi", label: "코스피" },
  { key: "kosdaq", label: "코스닥" },
  { key: "futures", label: "선물" },
];

const INVESTORS: readonly { key: InvestorKey; label: string; colorVar: string }[] = [
  { key: "foreign", label: "외국인", colorVar: "var(--jd-fin-foreign)" },
  { key: "institution", label: "기관", colorVar: "var(--jd-fin-institution)" },
  { key: "individual", label: "개인", colorVar: "var(--jd-fin-individual)" },
];

const HISTORY_LEN = 16;

const STATUS_WORD: Record<MarketStatus, string> = {
  open: "LIVE",
  closed: "장마감",
  holiday: "휴장",
};

function net(row: Row): number {
  return row.buy - row.sell;
}
function buyRatio(row: Row): number {
  const total = row.buy + row.sell;
  return total === 0 ? 0 : (row.buy / total) * 100;
}
function fmtEok(eok: number): string {
  if (Math.abs(eok) >= 10_000) return `${(eok / 10_000).toFixed(2)}조`;
  return `${groupDigits(eok)}억`;
}

/** v2 tick — 결정적 지터로 buy/sell을 ±1.2% 흔든다 */
function tick(prev: Snapshot, jitter: () => number): Snapshot {
  const out = JSON.parse(JSON.stringify(prev)) as Snapshot;
  for (const m of MARKETS) {
    for (const iv of INVESTORS) {
      const row = out[m.key][iv.key];
      row.buy = Math.max(100, row.buy + Math.round(row.buy * jitter() * 0.012));
      row.sell = Math.max(100, row.sell + Math.round(row.sell * jitter() * 0.012));
    }
  }
  return out;
}

export class JdLiveInvestorBoard extends JdElement {
  static override tag = "jd-live-investor-board";
  static override props = {
    /** open | closed | holiday — v2 장중/장마감/휴장 */
    status: { type: String, default: "closed", reflect: true },
    /** 라이브 틱 켜기 (status=open일 때만 실제로 돈다) */
    live: { type: Boolean, reflect: true },
    /** 틱 간격(ms). v2 3000 */
    interval: { type: Number, default: 3000 },
  };

  declare status: string;
  declare live: boolean;
  declare interval: number;

  #snap: Snapshot = emptySnapshot();
  #prev: Snapshot = emptySnapshot();
  #history: NetHistory = emptyHistory();
  #now = "";
  #seed = 1;
  #timer?: { destroy(): void };

  // refs
  #liveEl!: HTMLElement;
  #liveWord!: HTMLElement;
  #titleEl!: HTMLElement;
  #clockEl!: HTMLElement;
  #totals = new Map<InvestorKey, HTMLElement>();
  #cells = new Map<string, CellRefs>();
  #volumeCells = new Map<MarketKey, HTMLElement>();

  get snapshot(): Snapshot {
    return this.#snap;
  }
  set snapshot(v: Snapshot) {
    this.#snap = normalizeSnapshot(v);
    // 외부 대입은 이전값을 자기 자신으로 두어 플래시가 튀지 않게 한다
    this.#prev = JSON.parse(JSON.stringify(this.#snap)) as Snapshot;
    this.requestUpdate();
  }

  protected render(): void {
    upgradeAccessor(this, "snapshot"); // 정의 이전 대입 회수(§1.3)
    adoptStyles(liveInvestorBoardStyles);
    this.#readJsonSlot();

    const card = document.createElement("div");
    card.className = "jd-lib__card";
    card.append(this.#buildHeader(), this.#buildTotals(), this.#buildGrid());
    this.append(card);
    this.update();
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent || "null");
      if (parsed && typeof parsed === "object") {
        this.#snap = normalizeSnapshot(parsed);
        this.#prev = JSON.parse(JSON.stringify(this.#snap)) as Snapshot;
      }
    } catch {
      console.warn("[junds] <jd-live-investor-board> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #buildHeader(): HTMLElement {
    const head = document.createElement("div");
    head.className = "jd-lib__head";

    this.#liveEl = document.createElement("span");
    this.#liveEl.className = "jd-lib__live";
    const ping = document.createElement("span");
    ping.className = "jd-lib__ping";
    const dot = document.createElement("span");
    dot.className = "jd-lib__dot";
    this.#liveEl.append(ping, dot);

    this.#liveWord = document.createElement("span");
    this.#liveWord.className = "jd-lib__live-word";
    this.#titleEl = document.createElement("span");
    this.#titleEl.className = "jd-lib__title";
    this.#clockEl = document.createElement("span");
    this.#clockEl.className = "jd-lib__clock";

    head.append(this.#liveEl, this.#liveWord, this.#titleEl, this.#clockEl);
    return head;
  }

  #buildTotals(): HTMLElement {
    const totals = document.createElement("div");
    totals.className = "jd-lib__totals";
    for (const iv of INVESTORS) {
      const item = document.createElement("div");
      item.className = "jd-lib__total";
      item.style.setProperty("--_c", iv.colorVar);
      const dot = document.createElement("span");
      dot.className = "jd-lib__total-dot";
      const label = document.createElement("span");
      label.className = "jd-lib__total-label";
      label.textContent = `${iv.label} 시장합계`;
      const value = document.createElement("span");
      value.className = "jd-lib__total-value";
      item.append(dot, label, value);
      totals.append(item);
      this.#totals.set(iv.key, value);
    }
    return totals;
  }

  #buildGrid(): HTMLElement {
    const grid = document.createElement("div");
    grid.className = "jd-lib__grid";
    grid.setAttribute("role", "table");

    grid.append(this.#headCell("구분"));
    for (const m of MARKETS) grid.append(this.#headCell(m.label, "center"));

    for (const iv of INVESTORS) {
      const rowHead = document.createElement("div");
      rowHead.className = "jd-lib__rowhead";
      rowHead.style.setProperty("--_c", iv.colorVar);
      const dot = document.createElement("span");
      dot.className = "jd-lib__rowhead-dot";
      rowHead.append(dot, document.createTextNode(iv.label));
      grid.append(rowHead);
      for (const m of MARKETS) grid.append(this.#buildCell(m.key, iv));
    }

    grid.append(this.#headCell("총 거래량", "muted"));
    for (const m of MARKETS) {
      const vc = document.createElement("div");
      vc.className = "jd-lib__volume";
      grid.append(vc);
      this.#volumeCells.set(m.key, vc);
    }
    return grid;
  }

  #headCell(text: string, variant?: "center" | "muted"): HTMLElement {
    const el = document.createElement("span");
    el.className = "jd-lib__headcell";
    if (variant) el.setAttribute("data-variant", variant);
    el.textContent = text;
    return el;
  }

  #buildCell(market: MarketKey, iv: { key: InvestorKey; colorVar: string }): HTMLElement {
    const cell = document.createElement("div");
    cell.className = "jd-lib__cell";
    cell.style.setProperty("--_c", iv.colorVar);

    const spark = svgNode("svg", "jd-lib__spark");
    spark.setAttribute("viewBox", "0 0 100 22");
    spark.setAttribute("preserveAspectRatio", "none");
    spark.setAttribute("aria-hidden", "true");

    const netRow = document.createElement("div");
    netRow.className = "jd-lib__netrow";
    const netVal = document.createElement("span");
    netVal.className = "jd-lib__net";
    const delta = document.createElement("span");
    delta.className = "jd-lib__delta";
    netRow.append(netVal, delta);

    const bsRow = document.createElement("div");
    bsRow.className = "jd-lib__bsrow";
    const buy = document.createElement("span");
    buy.className = "jd-lib__buy";
    const sell = document.createElement("span");
    sell.className = "jd-lib__sell";
    bsRow.append(buy, sell);

    const bar = document.createElement("div");
    bar.className = "jd-lib__bar";
    const barBuy = document.createElement("div");
    barBuy.className = "jd-lib__bar-buy";
    const barSell = document.createElement("div");
    barSell.className = "jd-lib__bar-sell";
    bar.append(barBuy, barSell);

    const rateRow = document.createElement("div");
    rateRow.className = "jd-lib__raterow";
    const rateBuy = document.createElement("span");
    rateBuy.className = "jd-lib__rate-buy";
    const rateSell = document.createElement("span");
    rateSell.className = "jd-lib__rate-sell";
    rateRow.append(rateBuy, rateSell);

    cell.append(spark, netRow, bsRow, bar, rateRow);
    this.#cells.set(`${market}:${iv.key}`, {
      cell,
      spark,
      net: netVal,
      delta,
      buy,
      sell,
      barBuy,
      barSell,
      rateBuy,
      rateSell,
    });
    return cell;
  }

  protected override connected(): void {
    this.#now = clockNow();
    this.requestUpdate();
    this.#syncTimer();
  }

  protected override disconnected(): void {
    this.#timer?.destroy();
    this.#timer = undefined;
  }

  protected override update(): void {
    this.#syncTimer();
    this.#paintHeader();
    this.#paintTotals();
    this.#paintGrid();
  }

  #syncTimer(): void {
    const shouldRun = this.live && this.status === "open" && this.isConnected;
    if (shouldRun && !this.#timer) {
      this.#timer = this.own(createInterval(() => this.#doTick(), Math.max(250, this.interval)));
    } else if (!shouldRun && this.#timer) {
      this.#timer.destroy();
      this.#timer = undefined;
    }
  }

  #doTick(): void {
    this.#prev = this.#snap;
    this.#snap = tick(this.#prev, () => {
      this.#seed = (this.#seed * 9301 + 49297) % 233280;
      return this.#seed / 233280 - 0.5;
    });
    // 이력 축적
    for (const m of MARKETS) {
      for (const iv of INVESTORS) {
        const series = [...this.#history[m.key][iv.key], net(this.#snap[m.key][iv.key])];
        this.#history[m.key][iv.key] = series.slice(-HISTORY_LEN);
      }
    }
    this.#now = clockNow();
    this.requestUpdate();
  }

  #paintHeader(): void {
    const status =
      (this.status as MarketStatus) in STATUS_WORD ? (this.status as MarketStatus) : "closed";
    const isOpen = status === "open";
    this.#liveEl.toggleAttribute("data-open", isOpen);
    this.#liveWord.textContent = STATUS_WORD[status];
    this.#liveWord.toggleAttribute("data-open", isOpen);
    this.#titleEl.textContent = isOpen
      ? "실시간 투자자 매매동향"
      : "투자자 매매동향 (장 마감 스냅샷)";
    this.#clockEl.textContent = isOpen
      ? `${this.#now || "—"} 기준 · ${Math.round(this.interval / 1000)}초 간격`
      : "정규장 09:00–15:30 KST 동안 갱신";
  }

  #paintTotals(): void {
    for (const iv of INVESTORS) {
      let sum = 0;
      for (const m of MARKETS) sum += net(this.#snap[m.key][iv.key]);
      const el = this.#totals.get(iv.key)!;
      el.textContent = `${sum >= 0 ? "+" : ""}${fmtEok(sum)}`;
      el.setAttribute("data-dir", sum >= 0 ? "up" : "down");
    }
  }

  #paintGrid(): void {
    for (const m of MARKETS) {
      let volBuy = 0;
      let volSell = 0;
      for (const iv of INVESTORS) {
        const row = this.#snap[m.key][iv.key];
        volBuy += row.buy;
        volSell += row.sell;
        this.#paintCell(
          `${m.key}:${iv.key}`,
          row,
          this.#prev[m.key][iv.key],
          this.#history[m.key][iv.key],
        );
      }
      this.#volumeCells.get(m.key)!.textContent = fmtEok(volBuy + volSell);
    }
  }

  #paintCell(key: string, row: Row, prevRow: Row, series: number[]): void {
    const r = this.#cells.get(key);
    if (!r) return;
    const n = net(row);
    const delta = n - net(prevRow);
    const ratio = buyRatio(row);

    this.#paintSparkline(r.spark, series);

    r.net.textContent = `${n > 0 ? "+" : ""}${fmtEok(n)}`;
    r.net.setAttribute("data-dir", n > 0 ? "up" : n < 0 ? "down" : "flat");

    if (delta === 0) {
      r.delta.textContent = "—";
      r.delta.setAttribute("data-dir", "flat");
    } else {
      r.delta.textContent = `${delta > 0 ? "▲" : "▼"}${fmtEok(Math.abs(delta))}`;
      r.delta.setAttribute("data-dir", delta > 0 ? "up" : "down");
    }

    r.buy.textContent = `매수 ${fmtEok(row.buy)}`;
    r.sell.textContent = `매도 ${fmtEok(row.sell)}`;
    r.barBuy.style.width = `${coord(ratio)}%`;
    r.barSell.style.width = `${coord(100 - ratio)}%`;
    r.rateBuy.textContent = `매수율 ${ratio.toFixed(1)}%`;
    r.rateSell.textContent = `매도율 ${(100 - ratio).toFixed(1)}%`;

    // 플래시 — 애니메이션 재시작(remove → reflow → set)
    r.cell.removeAttribute("data-flash");
    if (delta !== 0) {
      void r.cell.offsetWidth;
      r.cell.setAttribute("data-flash", delta > 0 ? "up" : "down");
    }
  }

  #paintSparkline(svg: SVGSVGElement, values: number[]): void {
    svg.textContent = "";
    const w = 100;
    const h = 22;
    if (values.length < 2) {
      const line = svgNode("line", "jd-lib__spark-zero");
      setLine(line, 0, h / 2, w, h / 2);
      svg.append(line);
      return;
    }
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 0);
    const range = max - min || 1;
    const step = w / (values.length - 1);
    const yOf = (v: number): number => h - ((v - min) / range) * h;
    const d = values
      .map((v, i) => `${i === 0 ? "M" : "L"}${coord(i * step)},${coord(yOf(v))}`)
      .join(" ");

    const zero = svgNode("line", "jd-lib__spark-zero");
    setLine(zero, 0, yOf(0), w, yOf(0));
    zero.setAttribute("stroke-dasharray", "2 2");

    const area = svgNode("path", "jd-lib__spark-area");
    area.setAttribute("d", `${d} L${w},${h} L0,${h} Z`);
    const line = svgNode("path", "jd-lib__spark-line");
    line.setAttribute("d", d);
    const head = svgNode("circle", "jd-lib__spark-head");
    head.setAttribute("cx", String(w));
    head.setAttribute("cy", String(coord(yOf(values[values.length - 1]!))));
    head.setAttribute("r", "2");

    svg.append(zero, area, line, head);
  }
}

function setLine(line: SVGLineElement, x1: number, y1: number, x2: number, y2: number): void {
  line.setAttribute("x1", String(coord(x1)));
  line.setAttribute("y1", String(coord(y1)));
  line.setAttribute("x2", String(coord(x2)));
  line.setAttribute("y2", String(coord(y2)));
}

function clockNow(): string {
  const d = new Date();
  const p = (n: number): string => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function emptyRow(): Row {
  return { buy: 0, sell: 0 };
}
function emptySnapshot(): Snapshot {
  const out = {} as Snapshot;
  for (const m of MARKETS) {
    out[m.key] = { foreign: emptyRow(), institution: emptyRow(), individual: emptyRow() };
  }
  return out;
}
function emptyHistory(): NetHistory {
  const out = {} as NetHistory;
  for (const m of MARKETS) out[m.key] = { foreign: [], institution: [], individual: [] };
  return out;
}
function normalizeSnapshot(v: unknown): Snapshot {
  const src = (v ?? {}) as Record<string, Record<string, Record<string, unknown>>>;
  const num = (x: unknown): number => (typeof x === "number" && Number.isFinite(x) ? x : 0);
  const out = emptySnapshot();
  for (const m of MARKETS) {
    for (const iv of INVESTORS) {
      const cell = src?.[m.key]?.[iv.key] ?? {};
      out[m.key][iv.key] = { buy: num(cell.buy), sell: num(cell.sell) };
    }
  }
  return out;
}
