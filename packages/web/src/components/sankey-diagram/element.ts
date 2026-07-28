/**
 * <jd-sankey-diagram> — 흐름량을 굵기로 보여주는 생키 다이어그램
 * (v2 composites/SankeyDiagram).
 *
 * SVG는 **createElementNS**로 만든다(§6-1). 노드·링크는 property + JSON 슬롯
 * (§1.3 — 배열은 attribute 금지). 배열 입력이 둘이라 슬롯은 객체 형태를 받는다:
 * `<script type="application/json">{"nodes":[…],"links":[…]}</script>`
 *
 * v2 대비 교정 5건:
 *  1. **순환 그래프에서 브라우저가 멎었다.** 자동 컬럼 배치 BFS가 방문 검사 없이
 *     후속 노드를 무조건 큐에 넣어서, 시작점에서 닿는 순환(S→A→B→A)이 하나만
 *     있어도 컬럼이 무한히 증가하며 탭이 죽었다(에러도 없이 정지). 컬럼이 실제로
 *     커질 때만 전파하고 노드 수를 상한으로 둔다 — 순환은 가장 긴 경로에서 끊긴다.
 *     들어오는 간선이 없는 노드가 아예 없는(전부 순환) 입력도 v2는 전 노드를
 *     컬럼 0에 겹쳐 쌓았다 — 첫 노드를 시작점으로 삼아 펼친다.
 *  2. **컬럼 번호를 건너뛰면 그림이 통째로 사라졌다.** `cols[n.column]`로 채운
 *     배열에 구멍이 생기면 `Math.max(...cols.map(…))`가 NaN이 되고, NaN 좌표를
 *     받은 SVG는 아무것도 그리지 않는다(경고 없음). 컬럼 배열을 빈 배열로 채운다.
 *  3. **`role="img"` + 자식 `<title>` 조합은 낭독되지 않았다.** role=img는 하위
 *     트리를 통째로 presentational로 만들어서, v2가 노드·링크마다 달아둔
 *     `<title>`(= 유일한 텍스트 정보)은 AT에 도달할 수 없었다. v3는 호스트가
 *     role="figure" + 이름을 맡고, svg는 장식으로 내린 뒤 **시각적으로 숨긴
 *     목록**이 노드 합계와 "출발 → 도착: 값"을 말한다. `<title>`은 마우스 툴팁
 *     용도로 유지한다.
 *  4. **음수·NaN 값이 굵기를 뒤집거나 좌표를 NaN으로 만들었다.** 유효 링크만
 *     남기고, 높이 스케일이 음수가 되지 않게 자른다(height < 노드 간격 총합인
 *     좁은 캔버스에서 실제로 발생).
 *  5. **끝나지 않는 라벨.** 라벨은 노드 오른쪽에 그리는데 마지막 컬럼만 왼쪽으로
 *     뒤집는 규칙이라, 마지막 컬럼이 비어 있으면 오른쪽 라벨이 캔버스를 넘었다.
 *     `overflow: visible`로 잘리지만은 않게 두고(css), 라벨 기준은 v2 유지.
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import sankeyDiagramStyles from "./sankey-diagram.css.js";

const NS = "http://www.w3.org/2000/svg";

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
  return document.createElementNS(NS, tag);
}

const num = (v: number): string => String(Math.round(v * 1000) / 1000);

export interface JdSankeyNode {
  /** 노드 id */
  id: string;
  /** 표시 라벨. 없으면 id */
  label?: string;
  /** 컬럼 인덱스(0=좌측). 전 노드가 지정하면 자동 배치를 쓰지 않는다 */
  column?: number;
  /** CSS 색 */
  color?: string;
}

export interface JdSankeyLink {
  source: string;
  target: string;
  value: number;
}

/** v2 DEFAULT_COLORS — 대응 토큰이 있는 5색은 번역, 분홍만 리터럴 유지 */
const PALETTE: readonly string[] = [
  "var(--jd-color-primary)",
  "var(--jd-color-success)",
  "var(--jd-color-warning)",
  "var(--jd-color-danger)",
  "var(--jd-color-info)",
  "var(--jd-color-accent)",
  "#ec4899",
];

interface Placed {
  node: JdSankeyNode;
  column: number;
  total: number;
  y: number;
  height: number;
  color: string;
}

interface LinkPath {
  d: string;
  width: number;
  color: string;
  source: string;
  target: string;
  value: number;
}

/** 교정 1 — 순환에서도 반드시 끝나는 최장경로 컬럼 배치 */
function autoColumns(nodes: JdSankeyNode[], links: JdSankeyLink[]): Map<string, number> {
  const ids = new Set(nodes.map((n) => n.id));
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, string[]>();
  for (const n of nodes) incoming.set(n.id, 0);
  for (const l of links) {
    if (!ids.has(l.source) || !ids.has(l.target)) continue;
    incoming.set(l.target, (incoming.get(l.target) ?? 0) + 1);
    const arr = outgoing.get(l.source);
    if (arr) arr.push(l.target);
    else outgoing.set(l.source, [l.target]);
  }

  const cols = new Map<string, number>();
  const limit = nodes.length; // 컬럼은 노드 수를 넘을 수 없다 — 순환 차단선
  const queue: { id: string; col: number }[] = [];
  for (const n of nodes) if ((incoming.get(n.id) ?? 0) === 0) queue.push({ id: n.id, col: 0 });
  // 전부 순환이라 시작점이 없으면 첫 노드를 시작점으로 삼는다. v2는 이 경우 큐가 비어
  // 전 노드가 컬럼 0에 겹쳐 쌓였다(링크가 자기 컬럼으로 되돌아오는 뭉개진 그림).
  if (queue.length === 0 && nodes[0]) queue.push({ id: nodes[0].id, col: 0 });

  while (queue.length) {
    const head = queue.shift();
    if (!head) break;
    const prev = cols.get(head.id);
    if (prev !== undefined && prev >= head.col) continue; // 이미 더 오른쪽 — 전파 불필요
    cols.set(head.id, head.col);
    if (head.col >= limit) continue; // 순환 — 여기서 끊는다
    for (const t of outgoing.get(head.id) ?? []) queue.push({ id: t, col: head.col + 1 });
  }
  // 소스가 없는(전부 순환) 노드는 v2와 동일하게 컬럼 0
  for (const n of nodes) if (!cols.has(n.id)) cols.set(n.id, 0);
  return cols;
}

export class JdSankeyDiagram extends JdElement {
  static override tag = "jd-sankey-diagram";
  static override props = {
    width: { type: Number, default: 560 },
    height: { type: Number, default: 320 },
    /** 노드 막대 폭(px) */
    nodeWidth: { type: Number, default: 14 },
    /** 노드 사이 세로 간격(px) */
    nodeGap: { type: Number, default: 8 },
    /** 접근 이름 */
    label: { type: String },
  };

  declare width: number;
  declare height: number;
  declare nodeWidth: number;
  declare nodeGap: number;
  declare label: string;

  #nodes: JdSankeyNode[] = [];
  #links: JdSankeyLink[] = [];

  #svg!: SVGSVGElement;
  #linkLayer!: SVGGElement;
  #nodeLayer!: SVGGElement;
  #sr!: HTMLElement;

  get nodes(): JdSankeyNode[] {
    return this.#nodes;
  }
  set nodes(v: JdSankeyNode[]) {
    this.#nodes = Array.isArray(v) ? v.filter((n) => Boolean(n) && typeof n.id === "string") : [];
    this.requestUpdate();
  }

  get links(): JdSankeyLink[] {
    return this.#links;
  }
  set links(v: JdSankeyLink[]) {
    this.#links = Array.isArray(v) ? v.filter((l) => Boolean(l)) : [];
    this.requestUpdate();
  }

  protected render(): void {
    adoptStyles(sankeyDiagramStyles);
    this.#readJsonSlot();

    // 입양(§3.3)
    const existing = this.querySelector<SVGSVGElement>(":scope > .jd-sankey-diagram__svg");
    if (existing) {
      this.#svg = existing;
      this.#linkLayer = existing.querySelector<SVGGElement>(".jd-sankey-diagram__links")!;
      this.#nodeLayer = existing.querySelector<SVGGElement>(".jd-sankey-diagram__nodes")!;
      this.#sr = this.querySelector<HTMLElement>(":scope > .jd-sankey-diagram__sr")!;
    } else {
      this.#build();
    }
    this.setAttribute("role", "figure");
    this.update();
  }

  /** 선언적 초기화 슬롯 — 1회 소비. `{ nodes, links }` */
  #readJsonSlot(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script) return;
    try {
      const parsed: unknown = JSON.parse(script.textContent || "{}");
      if (parsed && typeof parsed === "object") {
        const o = parsed as { nodes?: unknown; links?: unknown };
        if (Array.isArray(o.nodes)) this.#nodes = o.nodes as JdSankeyNode[];
        if (Array.isArray(o.links)) this.#links = o.links as JdSankeyLink[];
      }
    } catch {
      console.warn("[junds] <jd-sankey-diagram> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  #build(): void {
    this.#svg = svgEl("svg");
    this.#svg.setAttribute("class", "jd-sankey-diagram__svg");
    this.#svg.setAttribute("aria-hidden", "true"); // 교정 3 — 대체 목록이 말한다
    this.#linkLayer = svgEl("g");
    this.#linkLayer.setAttribute("class", "jd-sankey-diagram__links");
    this.#nodeLayer = svgEl("g");
    this.#nodeLayer.setAttribute("class", "jd-sankey-diagram__nodes");
    // 링크가 먼저 — 노드가 위에 겹친다(v2 순서)
    this.#svg.append(this.#linkLayer, this.#nodeLayer);

    this.#sr = this.ownerDocument.createElement("ul");
    this.#sr.className = "jd-sankey-diagram__sr";

    this.append(this.#svg, this.#sr);
  }

  protected override update(): void {
    const w = this.#px(this.width, 560);
    const h = this.#px(this.height, 320);
    const nodeWidth = this.#px(this.nodeWidth, 14);
    const nodeGap = this.#px(this.nodeGap, 8, true);

    this.#svg.setAttribute("width", num(w));
    this.#svg.setAttribute("height", num(h));
    this.#svg.setAttribute("viewBox", `0 0 ${num(w)} ${num(h)}`);
    this.setAttribute("aria-label", this.label || "생키 다이어그램");

    const { placed, links, colCount, colWidth } = this.#layout(w, h, nodeWidth, nodeGap);
    this.#syncLinks(links);
    this.#syncNodes(placed, colCount, colWidth, nodeWidth);
    this.#syncAlt(placed, links);
  }

  #layout(
    w: number,
    h: number,
    nodeWidth: number,
    nodeGap: number,
  ): { placed: Placed[]; links: LinkPath[]; colCount: number; colWidth: number } {
    const ids = new Set(this.#nodes.map((n) => n.id));
    const validLinks = this.#links.filter(
      (l) =>
        ids.has(l.source) && ids.has(l.target) && Number.isFinite(l.value) && Number(l.value) >= 0,
    );

    const explicit = this.#nodes.length > 0 && this.#nodes.every((n) => Number.isFinite(n.column));
    const colMap = explicit
      ? new Map(this.#nodes.map((n) => [n.id, Math.max(0, Math.trunc(Number(n.column)))]))
      : autoColumns(this.#nodes, validLinks);

    const totalsIn = new Map<string, number>();
    const totalsOut = new Map<string, number>();
    for (const l of validLinks) {
      totalsOut.set(l.source, (totalsOut.get(l.source) ?? 0) + Number(l.value));
      totalsIn.set(l.target, (totalsIn.get(l.target) ?? 0) + Number(l.value));
    }

    const placed: Placed[] = this.#nodes.map((node, i) => ({
      node,
      column: colMap.get(node.id) ?? 0,
      total: Math.max(totalsIn.get(node.id) ?? 0, totalsOut.get(node.id) ?? 0),
      y: 0,
      height: 0,
      color: node.color || PALETTE[i % PALETTE.length] || "var(--jd-color-primary)",
    }));

    // 교정 2 — 구멍 없는 컬럼 배열
    const colCount = Math.max(1, ...placed.map((p) => p.column + 1));
    const cols: Placed[][] = Array.from({ length: colCount }, () => []);
    for (const p of placed) cols[p.column]?.push(p);

    const maxColTotal = Math.max(1, ...cols.map((c) => c.reduce((s, p) => s + p.total, 0)));
    const maxColLen = Math.max(1, ...cols.map((c) => c.length));
    // 교정 4 — 좁은 캔버스에서 음수 스케일 방지
    const scale = Math.max(0, (h - (maxColLen - 1) * nodeGap) / maxColTotal);

    for (const col of cols) {
      let y = 0;
      for (const p of col) {
        p.height = Math.max(2, p.total * scale);
        p.y = y;
        y += p.height + nodeGap;
      }
    }

    const colWidth = (w - nodeWidth) / Math.max(1, colCount - 1);
    const byId = new Map(placed.map((p) => [p.node.id, p]));
    const sourceOffsets = new Map<string, number>();
    const targetOffsets = new Map<string, number>();

    const links: LinkPath[] = [];
    validLinks.forEach((l, i) => {
      const s = byId.get(l.source);
      const t = byId.get(l.target);
      if (!s || !t) return;
      const sx = s.column * colWidth + nodeWidth;
      const tx = t.column * colWidth;
      const so = sourceOffsets.get(l.source) ?? 0;
      const to = targetOffsets.get(l.target) ?? 0;
      const linkH = Math.max(1, Number(l.value) * scale);
      const sy = s.y + so + linkH / 2;
      const ty = t.y + to + linkH / 2;
      sourceOffsets.set(l.source, so + linkH);
      targetOffsets.set(l.target, to + linkH);
      const mid = (sx + tx) / 2;
      links.push({
        d: `M${num(sx)},${num(sy)} C${num(mid)},${num(sy)} ${num(mid)},${num(ty)} ${num(tx)},${num(
          ty,
        )}`,
        width: linkH,
        color: s.node.color || PALETTE[i % PALETTE.length] || "var(--jd-color-primary)",
        source: l.source,
        target: l.target,
        value: Number(l.value),
      });
    });

    return { placed, links, colCount, colWidth };
  }

  /** 입양(§3.3): 개수가 같으면 노드를 만들지 않고 값만 갱신 */
  #syncLinks(links: LinkPath[]): void {
    if (this.#linkLayer.children.length !== links.length) {
      this.#linkLayer.replaceChildren(
        ...links.map(() => {
          const p = svgEl("path");
          p.setAttribute("class", "jd-sankey-diagram__link");
          p.append(svgEl("title"));
          return p;
        }),
      );
    }
    const els = Array.from(this.#linkLayer.children) as SVGPathElement[];
    links.forEach((l, i) => {
      const el = els[i];
      if (!el) return;
      el.setAttribute("d", l.d);
      el.setAttribute("stroke-width", num(l.width));
      el.style.setProperty("--jd-sankey-diagram-stroke", l.color);
      const title = el.querySelector("title");
      if (title) title.textContent = `${l.source} → ${l.target}: ${l.value}`;
    });
  }

  #syncNodes(placed: Placed[], colCount: number, colWidth: number, nodeWidth: number): void {
    if (this.#nodeLayer.children.length !== placed.length) {
      this.#nodeLayer.replaceChildren(...placed.map(() => this.#createNode()));
    }
    const els = Array.from(this.#nodeLayer.children) as SVGGElement[];
    placed.forEach((p, i) => {
      const g = els[i];
      if (!g) return;
      const rect = g.querySelector<SVGRectElement>(".jd-sankey-diagram__node")!;
      const label = g.querySelector<SVGTextElement>(".jd-sankey-diagram__label")!;
      const x = p.column * colWidth;
      const isLast = p.column === colCount - 1;
      const name = p.node.label ?? p.node.id;

      rect.setAttribute("x", num(x));
      rect.setAttribute("y", num(p.y));
      rect.setAttribute("width", num(nodeWidth));
      rect.setAttribute("height", num(p.height));
      rect.style.setProperty("--jd-sankey-diagram-fill", p.color);
      const title = rect.querySelector("title");
      if (title) title.textContent = `${name}: ${p.total}`;

      label.setAttribute("x", num(isLast ? x - 4 : x + nodeWidth + 4));
      label.setAttribute("y", num(p.y + p.height / 2 + 3));
      label.setAttribute("text-anchor", isLast ? "end" : "start");
      label.textContent = name;
    });
  }

  #createNode(): SVGGElement {
    const g = svgEl("g");
    g.setAttribute("class", "jd-sankey-diagram__node-group");
    const rect = svgEl("rect");
    rect.setAttribute("class", "jd-sankey-diagram__node");
    rect.setAttribute("rx", "2");
    rect.append(svgEl("title"));
    const label = svgEl("text");
    label.setAttribute("class", "jd-sankey-diagram__label");
    g.append(rect, label);
    return g;
  }

  /** 교정 3 — 시각적으로 숨긴 텍스트 등가물 */
  #syncAlt(placed: Placed[], links: LinkPath[]): void {
    const doc = this.ownerDocument;
    const rows = [
      ...placed.map((p) => `${p.node.label ?? p.node.id}: ${p.total}`),
      ...links.map((l) => `${l.source} → ${l.target}: ${l.value}`),
    ];
    this.#sr.replaceChildren(
      ...rows.map((text) => {
        const li = doc.createElement("li");
        li.textContent = text;
        return li;
      }),
    );
  }

  #px(v: number, fallback: number, allowZero = false): number {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) return fallback;
    return n === 0 && !allowZero ? fallback : n;
  }
}
