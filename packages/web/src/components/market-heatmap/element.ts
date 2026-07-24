/**
 * <jd-market-heatmap> — 등락률 히트맵 트리맵 (v2 finance/MarketHeatmap).
 *
 * SVG는 **createElementNS**로 만든다(§6-1 네임스페이스 함정 — `createElement("rect")`는
 * HTML 미지 요소가 되어 조용히 안 그려진다). 배치는 v2와 같은 squarified treemap
 * (Bruls/Huijing/van Wijk)이고, 색은 v2 heatmapColor(한국 관례: 상승=적, 하락=청)를
 * 순수 함수로 승계한다. 그룹 모드는 그룹 합으로 상위 배치 후 각 칸을 헤더+내부 배치.
 *
 * 데이터는 property + JSON 슬롯(§1.3 — 배열/객체 attribute 금지).
 *
 * v2 대비 교정:
 *  1. **부모 크기를 ResizeObserver로 실측**해 그렸다 — 초기 렌더가 관측 전/후로 갈리는
 *     비결정 요소였다. 형제 <jd-treemap-chart>와 같이 width/height 프로퍼티를 진실로
 *     삼아 render를 결정적으로 두고, 반응형은 `max-width:100%`(css)가 맡는다.
 *  2. **그림뿐 대체 텍스트가 없었다**(작은 칸은 화면에서도 값이 잘렸다). svg를 장식으로
 *     내리고, 시각적으로 숨긴 목록이 항목별 "이름: ±등락% (가격)"을 복구한다(role=figure).
 *  3. **onCellClick 콜백**을 `jd-cell-click` CustomEvent(detail=cell)로 바꿔 프레임워크 무관하게.
 *  4. `toLocaleString`(가격)이 로케일 의존이라 로케일 비의존 3자리 그룹핑으로 대체(§3.1-3).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { svgNode } from "../../core/chart.js";
import heatmapStyles from "./market-heatmap.css.js";

export interface JdHeatmapCell {
  name: string;
  /** 라벨에 우선 표시할 티커(없으면 name) */
  ticker?: string;
  /** 면적을 결정하는 크기(시총·비중) */
  size: number;
  /** 색을 결정하는 등락률(%) */
  change: number;
  price?: number;
  group?: string;
}
export interface JdHeatmapGroup {
  name: string;
  cells: JdHeatmapCell[];
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface PlacedCell extends JdHeatmapCell {
  rect: Rect;
}

/** 한국 관례 색: 상승=적, 하락=청 (v2 heatmapColor, 순수 함수) */
function heatmapColor(pct: number, scale: number): string {
  const clamped = Math.max(-scale, Math.min(scale, pct));
  const t = Math.min(1, Math.abs(clamped) / scale);
  if (Math.abs(clamped) < 0.1) return "hsl(220, 10%, 52%)";
  if (clamped > 0) return `hsl(358, ${76 + 16 * t}%, ${58 - 14 * t}%)`;
  return `hsl(218, ${74 + 18 * t}%, ${58 - 16 * t}%)`;
}

/** §3.1-3: 로케일 비의존 3자리 그룹핑(정수) */
function groupInt(v: number): string {
  if (!Number.isFinite(v)) return "0";
  const neg = v < 0;
  const int = String(Math.round(Math.abs(v)));
  return `${neg ? "-" : ""}${int.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

const round2 = (v: number): number => (Number.isFinite(v) ? Math.round(v * 100) / 100 : 0);

function worstRatio(row: { area: number }[], shorter: number): number {
  if (row.length === 0) return Infinity;
  const sum = row.reduce((s, r) => s + r.area, 0);
  let max = 0;
  let min = Infinity;
  for (const r of row) {
    if (r.area > max) max = r.area;
    if (r.area < min) min = r.area;
  }
  const sumSq = sum * sum;
  const shorterSq = shorter * shorter;
  return Math.max((shorterSq * max) / sumSq, sumSq / (shorterSq * min));
}

/** Squarified treemap (Bruls/Huijing/van Wijk) — v2와 동형 */
function squarify(items: JdHeatmapCell[], rect: Rect): PlacedCell[] {
  const placed: PlacedCell[] = [];
  const total = items.reduce((s, x) => s + Math.max(0.0001, x.size), 0);
  if (total <= 0 || items.length === 0) return placed;

  const sorted = [...items].sort((a, b) => b.size - a.size);
  let pool = sorted.map((it) => ({
    item: it,
    area: (Math.max(0.0001, it.size) / total) * rect.w * rect.h,
  }));
  let area = rect;

  while (pool.length > 0) {
    const rowPool: typeof pool = [];
    const shorter = Math.min(area.w, area.h);
    const horizontal = area.w >= area.h;
    let bestRatio = Infinity;
    let i = 0;
    for (; i < pool.length; i++) {
      rowPool.push(pool[i]!);
      const ratio = worstRatio(rowPool, shorter);
      if (ratio > bestRatio) {
        rowPool.pop();
        break;
      }
      bestRatio = ratio;
    }
    const consumed = rowPool.reduce((s, r) => s + r.area, 0);
    const longer = consumed / shorter;
    let cursor = 0;
    for (const r of rowPool) {
      const len = (r.area / consumed) * shorter;
      const cellRect = horizontal
        ? { x: area.x, y: area.y + cursor, w: longer, h: len }
        : { x: area.x + cursor, y: area.y, w: len, h: longer };
      placed.push({ ...r.item, rect: cellRect });
      cursor += len;
    }
    if (horizontal) {
      area = { x: area.x + longer, y: area.y, w: area.w - longer, h: area.h };
    } else {
      area = { x: area.x, y: area.y + longer, w: area.w, h: area.h - longer };
    }
    pool = pool.slice(rowPool.length);
    if (area.w <= 0 || area.h <= 0) break;
  }
  return placed;
}

const px = (v: number, fallback: number): number =>
  Number.isFinite(v) && v > 0 ? v : fallback;

export class JdMarketHeatmap extends JdElement {
  static override tag = "jd-market-heatmap";
  static override props = {
    width: { type: Number, default: 380 },
    height: { type: Number, default: 540 },
    /** 색 채도 기준 등락률(한국 ±30% 상한 대비 기본 6) */
    scale: { type: Number, default: 6 },
    /** 접근 이름 */
    label: { type: String },
  };

  declare width: number;
  declare height: number;
  declare scale: number;
  declare label: string;

  #data: JdHeatmapCell[] = [];
  #groups: JdHeatmapGroup[] = [];
  #flat: JdHeatmapCell[] = [];

  #svg!: SVGSVGElement;
  #bg!: SVGRectElement;
  #cells!: SVGGElement;
  #sr!: HTMLUListElement;

  get data(): JdHeatmapCell[] {
    return this.#data;
  }
  set data(v: JdHeatmapCell[]) {
    this.#data = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }
  get groups(): JdHeatmapGroup[] {
    return this.#groups;
  }
  set groups(v: JdHeatmapGroup[]) {
    this.#groups = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(heatmapStyles);
    this.#readJsonSlot();
    this.#upgrade("data");
    this.#upgrade("groups");

    const existing = this.querySelector<SVGSVGElement>(":scope > .jd-mh__svg");
    if (existing) {
      this.#svg = existing;
      this.#bg = existing.querySelector<SVGRectElement>(".jd-mh__bg")!;
      this.#cells = existing.querySelector<SVGGElement>(".jd-mh__cells")!;
      this.#sr = this.querySelector<HTMLUListElement>(":scope > .jd-mh__sr")!;
    } else {
      this.#build();
    }
    this.setAttribute("role", "figure");
    this.update();
  }

  #upgrade(name: "data" | "groups"): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const rec = this as unknown as Record<string, unknown>;
    const value = rec[name];
    delete rec[name];
    rec[name] = value;
  }

  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(':scope > script[type="application/json"]');
    if (!script) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent || "null");
      if (Array.isArray(parsed)) {
        this.#data = parsed as JdHeatmapCell[];
      } else if (parsed && typeof parsed === "object") {
        const obj = parsed as { data?: unknown; groups?: unknown };
        if (Array.isArray(obj.data)) this.#data = obj.data as JdHeatmapCell[];
        if (Array.isArray(obj.groups)) this.#groups = obj.groups as JdHeatmapGroup[];
      }
    } catch {
      console.warn(`[junds] <${this.localName}> JSON 슬롯 파싱 실패 — 무시합니다.`);
    }
    script.remove();
  }

  #build(): void {
    this.#svg = svgNode("svg", "jd-mh__svg");
    this.#svg.setAttribute("aria-hidden", "true"); // 값은 대체 목록이 말한다
    this.#bg = svgNode("rect", "jd-mh__bg");
    this.#cells = svgNode("g", "jd-mh__cells");
    this.#svg.append(this.#bg, this.#cells);

    this.#sr = this.ownerDocument.createElement("ul");
    this.#sr.className = "jd-mh__sr";

    this.append(this.#svg, this.#sr);
  }

  protected override connected(): void {
    this.#svg.addEventListener("click", this.#onClick);
  }
  protected override disconnected(): void {
    this.#svg.removeEventListener("click", this.#onClick);
  }

  #onClick = (e: Event): void => {
    const g = (e.target as Element).closest<SVGGElement>(".jd-mh__cell");
    if (!g) return;
    const idx = Number(g.dataset.cellIdx);
    const cell = this.#flat[idx];
    if (cell) this.emit("jd-cell-click", { cell });
  };

  protected override update(): void {
    const w = px(this.width, 380);
    const h = px(this.height, 540);
    this.#svg.setAttribute("width", String(w));
    this.#svg.setAttribute("height", String(h));
    this.#svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    this.setAttribute("aria-label", this.label || "시장 히트맵");

    this.#bg.setAttribute("x", "0");
    this.#bg.setAttribute("y", "0");
    this.#bg.setAttribute("width", String(w));
    this.#bg.setAttribute("height", String(h));

    const scale = px(this.scale, 6);
    const nodes: SVGElement[] = [];
    this.#flat = [];

    if (this.#groups.length > 0) {
      const groupRects = squarify(
        this.#groups.map((g) => ({
          name: g.name,
          size: g.cells.reduce((s, c) => s + Math.max(0, c.size), 0),
          change: 0,
        })),
        { x: 0, y: 0, w, h },
      );
      for (const gr of groupRects) {
        const grp = this.#groups.find((g) => g.name === gr.name);
        if (!grp) continue;
        const headerH = Math.min(20, gr.rect.h * 0.16);
        nodes.push(this.#buildGroupHeader(gr.name, gr.rect, headerH));
        const inner: Rect = {
          x: gr.rect.x,
          y: gr.rect.y + headerH,
          w: gr.rect.w,
          h: Math.max(0, gr.rect.h - headerH),
        };
        for (const c of squarify(grp.cells, inner)) {
          if (!c.group) c.group = grp.name; // 대체 목록 그룹 맥락
          nodes.push(this.#buildCell(c, this.#flat.length, scale));
          this.#flat.push(c);
        }
      }
    } else {
      for (const c of squarify(this.#data, { x: 0, y: 0, w, h })) {
        nodes.push(this.#buildCell(c, this.#flat.length, scale));
        this.#flat.push(c);
      }
    }

    this.#cells.replaceChildren(...nodes);
    this.#syncAlt();
  }

  #buildGroupHeader(name: string, rect: Rect, headerH: number): SVGGElement {
    const g = svgNode("g", "jd-mh__group");
    const bg = svgNode("rect", "jd-mh__group-bg");
    bg.setAttribute("x", String(round2(rect.x)));
    bg.setAttribute("y", String(round2(rect.y)));
    bg.setAttribute("width", String(round2(rect.w)));
    bg.setAttribute("height", String(round2(headerH)));
    const divider = svgNode("rect", "jd-mh__group-divider");
    divider.setAttribute("x", String(round2(rect.x)));
    divider.setAttribute("y", String(round2(rect.y + headerH - 1)));
    divider.setAttribute("width", String(round2(rect.w)));
    divider.setAttribute("height", "1");

    const charW = 7.5;
    const maxChars = Math.max(2, Math.floor((rect.w - 12) / charW));
    const label = name.length > maxChars ? `${name.slice(0, maxChars - 1)}…` : name;
    const text = svgNode("text", "jd-mh__group-label");
    text.setAttribute("x", String(round2(rect.x + 8)));
    text.setAttribute("y", String(round2(rect.y + headerH / 2 + 1)));
    text.setAttribute("dominant-baseline", "middle");
    text.textContent = label;

    g.append(bg, divider, text);
    return g;
  }

  #buildCell(cell: PlacedCell, idx: number, scale: number): SVGGElement {
    const { rect } = cell;
    const change = cell.change;
    const price = cell.price;
    const fill = heatmapColor(change, scale);
    const showLabel = rect.w > 26 && rect.h > 16;
    const showName = rect.w > 44 && rect.h > 24;
    const showSubtext = rect.w > 52 && rect.h > 38;
    const showPrice = rect.w > 78 && rect.h > 58;
    const sign = change > 0 ? "+" : "";

    const baseFont = Math.max(8.5, Math.min(rect.w * 0.13, rect.h * 0.24, 19));
    const charW = baseFont * 0.62;
    const maxChars = Math.max(1, Math.floor((rect.w - 8) / charW));
    const labelText = (cell.ticker ?? cell.name).slice(0, maxChars);
    const cx = round2(rect.x + rect.w / 2);
    const cy = rect.y + rect.h / 2;

    const g = svgNode("g", "jd-mh__cell");
    g.dataset.cellIdx = String(idx);

    const r = svgNode("rect", "jd-mh__cell-rect");
    r.style.setProperty("--jd-mh-fill", fill);
    r.setAttribute("x", String(round2(rect.x + 0.5)));
    r.setAttribute("y", String(round2(rect.y + 0.5)));
    r.setAttribute("width", String(round2(Math.max(0, rect.w - 1))));
    r.setAttribute("height", String(round2(Math.max(0, rect.h - 1))));
    g.append(r);

    if (showName) {
      g.append(
        this.#cellText(cx, round2(cy - (showSubtext ? baseFont * 0.55 : 0)), baseFont, 800, labelText),
      );
    } else if (showLabel) {
      g.append(this.#cellText(cx, round2(cy), Math.max(7.5, baseFont * 0.85), 800, labelText));
    }
    if (showSubtext) {
      const t = this.#cellText(cx, round2(cy + baseFont * 0.7), baseFont * 0.6, 700, `${sign}${change.toFixed(2)}%`);
      g.append(t);
    }
    if (showPrice && price) {
      const t = this.#cellText(cx, round2(cy + baseFont * 1.55), baseFont * 0.5, 500, groupInt(price));
      t.classList.add("jd-mh__cell-price");
      g.append(t);
    }
    return g;
  }

  #cellText(x: number, y: number, size: number, weight: number, content: string): SVGTextElement {
    const t = svgNode("text", "jd-mh__cell-text");
    t.setAttribute("x", String(x));
    t.setAttribute("y", String(y));
    t.setAttribute("font-size", String(round2(size)));
    t.setAttribute("font-weight", String(weight));
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("dominant-baseline", "middle");
    t.textContent = content;
    return t;
  }

  #syncAlt(): void {
    const doc = this.ownerDocument;
    this.#sr.replaceChildren(
      ...this.#flat.map((c) => {
        const li = doc.createElement("li");
        const sign = c.change > 0 ? "+" : "";
        const priceText = c.price ? ` (${groupInt(c.price)})` : "";
        const groupText = c.group ? `${c.group} · ` : "";
        li.textContent = `${groupText}${c.ticker ?? c.name}: ${sign}${c.change.toFixed(2)}%${priceText}`;
        return li;
      }),
    );
  }
}
