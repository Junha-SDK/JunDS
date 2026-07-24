/**
 * <jd-portfolio-heatmap> — 보유 종목 히트맵 카드 (v2 finance/PortfolioHeatmap).
 *
 * v2는 카드 헤더(제목·부제·평가/손익 3지표) + MarketHeatmap(정사각근사 트리맵)을 조합하고,
 * 3초마다 setInterval로 보유가를 흔들었다. MarketHeatmap이 별도 CE로 존재하지 않아
 * (배정 밖) 트리맵 렌더를 여기 흡수한다 — 이 컴포넌트의 시각 전부가 그 트리맵이다.
 *
 * SVG는 **createElementNS**로 만든다(§6-1). 배치는 v2 MarketHeatmap의 squarified
 * (Bruls/Huijing/van Wijk)를 그대로, 색은 v2 heatmapColor(한국식 상승=빨강·하락=파랑
 * HSL)를 포팅한다.
 *
 * 결정적 렌더(§3.1-3):
 *  - 최초 render/update는 보유 데이터만으로 결정된다 — Date/random 없음.
 *  - toLocaleString 대신 core/chart groupDigits(로케일 비의존)로 금액을 끊는다.
 *  - v2의 3초 라이브 흔들기는 **opt-in** `live` 속성일 때만, connected() 이후 createInterval
 *    이펙트로만 돈다(프리렌더 스냅샷은 흔들기 전이라 안정). LCG 시드로 결정적.
 *
 * v2 대비 개선: 트리맵 SVG는 aria-hidden으로 내리고, 시각적으로 숨긴 목록이 종목별
 * "이름: 평가금액, 등락률"을 말한다(jd-treemap-chart 교정 1과 동형).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { svgNode, setAttrs, coord, positive, groupDigits, upgradeAccessor } from "../../core/chart.js";
import { createInterval, type Timer } from "../../behaviors/timing.js";
import portfolioHeatmapStyles from "./portfolio-heatmap.css.js";

export interface JdHeatmapHolding {
  name: string;
  qty: number;
  /** 평균 매입가 */
  avg: number;
  /** 현재가 */
  current: number;
  /** 일간 등락률(%) */
  pct: number;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Cell {
  name: string;
  size: number;
  change: number;
  price: number;
}
interface Placed extends Cell {
  rect: Rect;
}

/** 한국식 히트맵 색 — 상승=빨강, 하락=파랑 (v2 lib/heatmapColor 포팅) */
function heatmapColor(pct: number, scale: number): string {
  const clamped = Math.max(-scale, Math.min(scale, pct));
  const t = Math.min(1, Math.abs(clamped) / scale);
  if (Math.abs(clamped) < 0.1) return "hsl(220, 10%, 52%)";
  const r = (v: number): number => Math.round(v * 10) / 10;
  if (clamped > 0) return `hsl(358, ${r(76 + 16 * t)}%, ${r(58 - 14 * t)}%)`;
  return `hsl(218, ${r(74 + 18 * t)}%, ${r(58 - 16 * t)}%)`;
}

function worstRatio(row: { area: number }[], shorter: number): number {
  if (row.length === 0) return Infinity;
  const sum = row.reduce((s, r) => s + r.area, 0);
  let max = 0;
  let min = Infinity;
  for (const r of row) {
    if (r.area > max) max = r.area;
    if (r.area < min) min = r.area;
  }
  const sumSq = sum * sum || 1;
  const shorterSq = shorter * shorter;
  return Math.max((shorterSq * max) / sumSq, sumSq / (shorterSq * min));
}

/** squarified treemap (v2 MarketHeatmap.squarify 포팅) */
function squarify(items: Cell[], rect: Rect): Placed[] {
  const placed: Placed[] = [];
  const total = items.reduce((s, x) => s + Math.max(0.0001, x.size), 0);
  if (total <= 0 || items.length === 0) return placed;
  const sorted = [...items].sort((a, b) => b.size - a.size);
  let pool = sorted.map((it) => ({
    item: it,
    area: (Math.max(0.0001, it.size) / total) * rect.w * rect.h,
  }));
  let area = rect;
  while (pool.length > 0) {
    const row: typeof pool = [];
    const shorter = Math.min(area.w, area.h);
    const horizontal = area.w >= area.h;
    let bestRatio = Infinity;
    let i = 0;
    for (; i < pool.length; i++) {
      row.push(pool[i]!);
      const ratio = worstRatio(row, shorter);
      if (ratio > bestRatio) {
        row.pop();
        break;
      }
      bestRatio = ratio;
    }
    const consumed = row.reduce((s, r) => s + r.area, 0) || 1;
    const longer = consumed / (shorter || 1);
    let cursor = 0;
    for (const r of row) {
      const len = (r.area / consumed) * (shorter || 0);
      const cellRect: Rect = horizontal
        ? { x: area.x, y: area.y + cursor, w: longer, h: len }
        : { x: area.x + cursor, y: area.y, w: len, h: longer };
      placed.push({ ...r.item, rect: cellRect });
      cursor += len;
    }
    if (horizontal) area = { x: area.x + longer, y: area.y, w: area.w - longer, h: area.h };
    else area = { x: area.x, y: area.y + longer, w: area.w, h: area.h - longer };
    pool = pool.slice(row.length);
    if (area.w <= 0 || area.h <= 0) break;
  }
  return placed;
}

/** 원 → 억/만/원, 로케일 비의존 */
function fmtMoney(won: number): string {
  const abs = Math.abs(won);
  if (abs >= 100_000_000) return `${(won / 100_000_000).toFixed(2)}억`;
  if (abs >= 10_000) return `${groupDigits(Math.round(won / 10_000))}만`;
  return groupDigits(Math.round(won));
}
const signed = (v: number): string => (v >= 0 ? "+" : "");

export class JdPortfolioHeatmap extends JdElement {
  static override tag = "jd-portfolio-heatmap";
  static override props = {
    width: { type: Number, default: 880 },
    height: { type: Number, default: 360 },
    /** 등락률 색 채도 기준(±%) — v2 기본 6 (한국 상·하한 ±30%의 1/5) */
    scale: { type: Number, default: 6 },
    /** 있으면 3초마다 보유가를 흔든다(데모). 기본 정적 */
    live: { type: Boolean, reflect: true },
  };

  declare width: number;
  declare height: number;
  declare scale: number;
  declare live: boolean;

  #holdings: JdHeatmapHolding[] = [];
  #titleEl!: HTMLElement;
  #subEl!: HTMLElement;
  #stats!: Record<"eval" | "pnl" | "day", { value: HTMLElement; sub: HTMLElement }>;
  #svg!: SVGSVGElement;
  #bg!: SVGRectElement;
  #cellsG!: SVGGElement;
  #sr!: HTMLUListElement;
  #timer: Timer | null = null;
  #seed = 11;

  /** 보유 종목 (§1.3 복합 데이터는 property 전용) */
  get holdings(): JdHeatmapHolding[] {
    return this.#holdings;
  }
  set holdings(v: JdHeatmapHolding[]) {
    this.#holdings = this.#normalize(v);
    this.requestUpdate();
  }

  #normalize(v: unknown): JdHeatmapHolding[] {
    if (!Array.isArray(v)) return [];
    const out: JdHeatmapHolding[] = [];
    for (const raw of v as Record<string, unknown>[]) {
      if (!raw || typeof raw !== "object") continue;
      out.push({
        name: typeof raw.name === "string" ? raw.name : "",
        qty: Number(raw.qty) || 0,
        avg: Number(raw.avg) || 0,
        current: Number(raw.current) || 0,
        pct: Number(raw.pct) || 0,
      });
    }
    return out;
  }

  protected render(): void {
    adoptStyles(portfolioHeatmapStyles);
    upgradeAccessor(this, "holdings");
    this.#readJsonSlot();
    this.setAttribute("role", "group");

    const header = this.querySelector<HTMLElement>(":scope > .jd-ph__header");
    if (header) {
      this.#bindRefs(header);
    } else {
      this.#build();
    }
    this.setAttribute("aria-label", "보유 종목 히트맵");
    this.update();
  }

  #readJsonSlot(): void {
    if (this.#holdings.length > 0) return;
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      this.#holdings = this.#normalize(JSON.parse(script.textContent || "[]"));
    } catch {
      console.warn("[junds] <jd-portfolio-heatmap> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #build(): void {
    const doc = this.ownerDocument;
    const header = doc.createElement("header");
    header.className = "jd-ph__header";
    this.#titleEl = doc.createElement("h2");
    this.#titleEl.className = "jd-ph__title";
    this.#titleEl.textContent = "보유 종목 히트맵";
    this.#subEl = doc.createElement("span");
    this.#subEl.className = "jd-ph__sub";
    this.#subEl.textContent = "크기 = 평가금액 · 색 = 일간 등락률";

    const statsWrap = doc.createElement("div");
    statsWrap.className = "jd-ph__stats";
    const mk = (label: string): { value: HTMLElement; sub: HTMLElement } => {
      const block = doc.createElement("div");
      block.className = "jd-ph__stat";
      const l = doc.createElement("span");
      l.className = "jd-ph__stat-label";
      l.textContent = label;
      const value = doc.createElement("span");
      value.className = "jd-ph__stat-value";
      const sub = doc.createElement("span");
      sub.className = "jd-ph__stat-sub";
      block.append(l, value, sub);
      statsWrap.append(block);
      return { value, sub };
    };
    this.#stats = { eval: mk("총 평가금액"), pnl: mk("평가손익"), day: mk("일간 손익") };
    header.append(this.#titleEl, this.#subEl, statsWrap);

    const map = doc.createElement("div");
    map.className = "jd-ph__map";
    this.#svg = svgNode("svg", "jd-ph__svg");
    this.#svg.setAttribute("aria-hidden", "true"); // 대체 목록이 말한다
    this.#bg = svgNode("rect", "jd-ph__bg");
    this.#bg.setAttribute("x", "0");
    this.#bg.setAttribute("y", "0");
    this.#cellsG = svgNode("g", "jd-ph__cells");
    this.#svg.append(this.#bg, this.#cellsG);
    this.#sr = doc.createElement("ul");
    this.#sr.className = "jd-ph__sr";
    map.append(this.#svg, this.#sr);

    this.append(header, map);
  }

  #bindRefs(header: HTMLElement): void {
    this.#titleEl = header.querySelector(".jd-ph__title")!;
    this.#subEl = header.querySelector(".jd-ph__sub")!;
    const stat = (i: number): { value: HTMLElement; sub: HTMLElement } => {
      const block = header.querySelectorAll(".jd-ph__stat")[i]!;
      return {
        value: block.querySelector(".jd-ph__stat-value")!,
        sub: block.querySelector(".jd-ph__stat-sub")!,
      };
    };
    this.#stats = { eval: stat(0), pnl: stat(1), day: stat(2) };
    this.#svg = this.querySelector(".jd-ph__svg")!;
    this.#bg = this.#svg.querySelector(".jd-ph__bg")!;
    this.#cellsG = this.#svg.querySelector(".jd-ph__cells")!;
    this.#sr = this.querySelector(".jd-ph__sr")!;
  }

  protected override connected(): void {
    // v2 3초 흔들기 — opt-in, 이펙트 경로라 결정적 렌더 규칙과 무관
    if (this.live && !this.#timer) {
      this.#timer = this.own(createInterval(() => this.#tick(), 3000));
    }
  }

  protected override disconnected(): void {
    this.#timer = null; // own()이 destroy 완료 — 참조만 끊는다
  }

  /** LCG 결정적 흔들기 (v2 tickHoldings) */
  #tick(): void {
    const jitter = (): number => {
      this.#seed = (this.#seed * 1103515245 + 12345) & 0x7fffffff;
      return (this.#seed % 1000) / 1000 - 0.5;
    };
    this.#holdings = this.#holdings.map((h) => ({
      ...h,
      pct: Math.round((h.pct + jitter() * 0.4) * 100) / 100,
      current: Math.max(100, Math.round(h.current * (1 + jitter() * 0.004))),
    }));
    this.requestUpdate();
  }

  protected override update(): void {
    this.#paintStats();
    this.#paintMap();
  }

  #paintStats(): void {
    const hs = this.#holdings;
    const totalEval = hs.reduce((s, h) => s + h.qty * h.current, 0);
    const totalCost = hs.reduce((s, h) => s + h.qty * h.avg, 0);
    const dayPnL = hs.reduce((s, h) => {
      const prevClose = h.pct === -100 ? h.current : h.current / (1 + h.pct / 100);
      return s + h.qty * (h.current - prevClose);
    }, 0);
    const totalPnL = totalEval - totalCost;
    const totalPct = totalCost ? (totalPnL / totalCost) * 100 : 0;
    const dayBase = totalEval - dayPnL;
    const dayPct = dayBase ? (dayPnL / dayBase) * 100 : 0;

    this.#stats.eval.value.textContent = fmtMoney(totalEval);
    this.#stats.eval.value.style.color = "";
    this.#stats.eval.sub.textContent = "";

    const upDown = (v: number): string =>
      v >= 0 ? "var(--jd-finance-up, var(--jd-color-success))" : "var(--jd-finance-down, var(--jd-color-danger))";
    this.#stats.pnl.value.textContent = `${signed(totalPnL)}${fmtMoney(totalPnL)}`;
    this.#stats.pnl.value.style.color = upDown(totalPnL);
    this.#stats.pnl.sub.textContent = `${signed(totalPct)}${totalPct.toFixed(2)}%`;
    this.#stats.pnl.sub.style.color = upDown(totalPnL);

    this.#stats.day.value.textContent = `${signed(dayPnL)}${fmtMoney(dayPnL)}`;
    this.#stats.day.value.style.color = upDown(dayPnL);
    this.#stats.day.sub.textContent = `${signed(dayPct)}${dayPct.toFixed(2)}%`;
    this.#stats.day.sub.style.color = upDown(dayPnL);
  }

  #paintMap(): void {
    const w = positive(this.width, 880);
    const h = positive(this.height, 360);
    const scale = positive(this.scale, 6);
    setAttrs(this.#svg, { width: w, height: h, viewBox: `0 0 ${w} ${h}` });
    setAttrs(this.#bg, { width: w, height: h });

    const cells: Cell[] = this.#holdings
      .filter((holdItem) => holdItem.qty * holdItem.current > 0)
      .map((holdItem) => ({
        name: holdItem.name,
        size: holdItem.qty * holdItem.current,
        change: holdItem.pct,
        price: holdItem.current,
      }));
    const placed = squarify(cells, { x: 0, y: 0, w, h });

    this.#cellsG.replaceChildren(...placed.map((c) => this.#cellNode(c, scale)));

    // 시각적으로 숨긴 대체 목록
    this.#sr.replaceChildren(
      ...this.#holdings.map((holdItem) => {
        const li = this.ownerDocument.createElement("li");
        li.textContent = `${holdItem.name}: 평가 ${fmtMoney(holdItem.qty * holdItem.current)}원, ${signed(holdItem.pct)}${holdItem.pct.toFixed(2)}%`;
        return li;
      }),
    );
  }

  #cellNode(c: Placed, scale: number): SVGGElement {
    const { rect } = c;
    const g = svgNode("g", "jd-ph__cell");
    const r = svgNode("rect");
    setAttrs(r, {
      x: coord(rect.x + 0.5),
      y: coord(rect.y + 0.5),
      width: coord(Math.max(0, rect.w - 1)),
      height: coord(Math.max(0, rect.h - 1)),
    });
    r.setAttribute("fill", heatmapColor(c.change, scale));
    g.append(r);

    const baseFont = Math.max(8.5, Math.min(rect.w * 0.13, rect.h * 0.24, 19));
    const cx = coord(rect.x + rect.w / 2);
    const showName = rect.w > 44 && rect.h > 24;
    const showLabel = rect.w > 26 && rect.h > 16;
    const showSub = rect.w > 52 && rect.h > 38;
    const showPrice = rect.w > 78 && rect.h > 58;

    if (showName || showLabel) {
      const name = svgNode("text", "jd-ph__cell-name");
      const charW = baseFont * 0.62;
      const maxChars = Math.max(1, Math.floor((rect.w - 8) / charW));
      setAttrs(name, {
        x: cx,
        y: coord(rect.y + rect.h / 2 - (showSub ? baseFont * 0.55 : 0)),
        "font-size": coord(showName ? baseFont : Math.max(7.5, baseFont * 0.85)),
      });
      name.textContent = c.name.slice(0, maxChars);
      g.append(name);
    }
    if (showSub) {
      const sub = svgNode("text", "jd-ph__cell-sub");
      setAttrs(sub, {
        x: cx,
        y: coord(rect.y + rect.h / 2 + baseFont * 0.7),
        "font-size": coord(baseFont * 0.6),
      });
      sub.textContent = `${signed(c.change)}${c.change.toFixed(2)}%`;
      g.append(sub);
    }
    if (showPrice) {
      const price = svgNode("text", "jd-ph__cell-price");
      setAttrs(price, {
        x: cx,
        y: coord(rect.y + rect.h / 2 + baseFont * 1.55),
        "font-size": coord(baseFont * 0.5),
      });
      price.textContent = groupDigits(Math.round(c.price));
      g.append(price);
    }
    return g;
  }
}
