/**
 * <jd-flow-diagram> — 노드·연결선 플로우 에디터 (v2 patterns/FlowDiagram).
 * 팬·줌·드래그·범위선택·포트 연결·미니맵·그룹·키보드(space 팬 / Delete / Esc).
 *
 * v3 판단:
 *  - v2는 완전 controlled(onNodeMove가 부모 상태를 갱신해야 실제로 움직임)였다. 바닐라
 *    CE는 **자기 상태를 소유**해 즉시 반영하고(드래그/연결/삭제를 내부 배열에 적용) 동시에
 *    이벤트를 발행한다 — HTML 한 조각으로도 바로 동작한다. 소비자는 이벤트로 영속화하거나
 *    `el.nodes = […]`로 다시 통제할 수 있다(마지막 쓰기 승리 §1.3).
 *  - 콜백 7종은 이벤트로 승격(§1.5): jd-node-move·jd-node-click·jd-node-dblclick·
 *    jd-connect·jd-disconnect·jd-selection-change·jd-node-delete.
 *  - 마우스 대신 Pointer Events로 통일 — 터치/펜도 판다. window 리스너는 own()으로 소유해
 *    disconnected 시 자동 회수(§5.1). 휠 줌은 passive:false로 스크롤을 막는다.
 *  - 데이터는 property(nodes/connections) 또는 자식 <script type="application/json"> 슬롯.
 *  - SVG는 createElementNS(core/chart svgNode) — 네임스페이스 함정 회피(§6-1).
 *  - 호스트는 role=application + tabindex=0(키보드 포커스). 다크 에디터 팔레트는
 *    컴포넌트 고유 지오메트리 색이라 리터럴 유지(§4.3), 선택/연결 강조만 토큰(primary/muted).
 */
import { JdElement } from "../../core/element.js";
import { adoptStyles } from "../../core/styles.js";
import { on } from "../../behaviors/input.js";
import { createSizeObserver } from "../../behaviors/viewport.js";
import { svgNode, setAttrs } from "../../core/chart.js";
import flowDiagramStyles from "./flow-diagram.css.js";

export interface JdFlowNode {
  id: string;
  title: string;
  content?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  x: number;
  y: number;
  width?: number;
  icon?: string;
  group?: string;
  inputs?: number;
  outputs?: number;
}

export interface JdFlowConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
  fromPort?: number;
  toPort?: number;
}

interface Camera {
  zoom: number;
  panX: number;
  panY: number;
}

const NODE_W = 200;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;
const FIT_PAD = 60;
const GRID_SIZE = 20;
const GROUP_PALETTE = ["#818cf8", "#6ee7b7", "#fcd34d", "#fca5a5", "#c4b5fd"];

/** 줌+팬 동시 계산(마우스 위치 고정) — v2 zoomAtPoint 그대로 */
function zoomAtPoint(cam: Camera, mx: number, my: number, delta: number): Camera {
  const factor = delta > 0 ? 0.9 : 1.1;
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, cam.zoom * factor));
  const r = zoom / cam.zoom;
  return { zoom, panX: mx - r * (mx - cam.panX), panY: my - r * (my - cam.panY) };
}

export class JdFlowDiagram extends JdElement {
  static override tag = "jd-flow-diagram";
  static override props = {
    noGrid: { type: Boolean, reflect: true }, // v2 showGrid=true 부정형
    minimap: { type: Boolean, reflect: true }, // v2 showMinimap
    fitToView: { type: Boolean }, // 최초 화면 맞춤
    readonly: { type: Boolean, reflect: true },
    connectionStyle: { type: String, default: "bezier", reflect: true }, // bezier|straight|step
    animateConnections: { type: Boolean }, // 흐르는 점선
  };

  declare noGrid: boolean;
  declare minimap: boolean;
  declare fitToView: boolean;
  declare readonly: boolean;
  declare connectionStyle: "bezier" | "straight" | "step";
  declare animateConnections: boolean;

  #nodes: JdFlowNode[] = [];
  #connections: JdFlowConnection[] = [];
  #controlledSel: string[] | null = null;
  #intSel = new Set<string>();
  #selConn: string | null = null;

  #cam: Camera = { zoom: 1, panX: 0, panY: 0 };
  #size = { w: 0, h: 0 };
  #heights = new Map<string, number>();

  // 골격
  #grid!: HTMLElement;
  #viewport!: HTMLElement;
  #groupsLayer!: HTMLElement;
  #linksSvg!: SVGSVGElement;
  #linksG!: SVGGElement;
  #marqueeEl!: HTMLElement;
  #nodesLayer!: HTMLElement;
  #minimapEl!: HTMLElement;
  #zoomLabel!: HTMLButtonElement;
  #hint!: HTMLElement;
  #nodeEls = new Map<string, HTMLElement>();
  /** 노드 구조 시그니처 — 바뀔 때만 내용·포트를 다시 만들고 높이를 다시 잰다 */
  #nodeSigs = new Map<string, string>();

  // 제스처
  #drag: {
    nodeId: string;
    sx: number;
    sy: number;
    starts: Map<string, { x: number; y: number }>;
    moved: boolean;
  } | null = null;
  #pan: { sx: number; sy: number; px: number; py: number } | null = null;
  #marquee: { sx: number; sy: number; ex: number; ey: number } | null = null;
  #conn: { fromId: string; side: "input" | "output"; port: number; mx: number; my: number } | null =
    null;
  #space = false;
  #didFit = false;

  /* ── 데이터 ── */
  get nodes(): JdFlowNode[] {
    return this.#nodes;
  }
  set nodes(v: JdFlowNode[]) {
    this.#nodes = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }
  get connections(): JdFlowConnection[] {
    return this.#connections;
  }
  set connections(v: JdFlowConnection[]) {
    this.#connections = Array.isArray(v) ? v : [];
    this.requestUpdate();
  }
  get selectedIds(): string[] {
    return this.#controlledSel ?? Array.from(this.#intSel);
  }
  set selectedIds(v: string[] | null) {
    this.#controlledSel = Array.isArray(v) ? v : null;
    this.requestUpdate();
  }

  get #sel(): Set<string> {
    return new Set(this.#controlledSel ?? Array.from(this.#intSel));
  }

  protected render(): void {
    adoptStyles(flowDiagramStyles);
    this.#readJson();
    if (!this.hasAttribute("role")) this.setAttribute("role", "application");
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
    if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", "플로우 다이어그램");

    this.#grid = div("jd-flow__grid");
    this.#viewport = div("jd-flow__viewport");
    this.#groupsLayer = div("jd-flow__groups");
    this.#linksSvg = svgNode("svg", "jd-flow__links");
    this.#linksSvg.setAttribute("aria-hidden", "true");
    this.#linksG = svgNode("g");
    this.#linksG.style.pointerEvents = "auto";
    this.#linksSvg.append(this.#linksG);
    this.#marqueeEl = div("jd-flow__marquee");
    this.#marqueeEl.hidden = true;
    this.#nodesLayer = div("jd-flow__nodes");
    this.#viewport.append(this.#groupsLayer, this.#linksSvg, this.#marqueeEl, this.#nodesLayer);

    this.#minimapEl = div("jd-flow__minimap");
    this.#minimapEl.hidden = true;
    this.#minimapEl.addEventListener("pointerdown", (e) => e.stopPropagation());

    const zoom = this.#buildZoomControls();
    this.#hint = div("jd-flow__hint");

    this.append(this.#grid, this.#viewport, this.#minimapEl, zoom, this.#hint);
    this.update();
  }

  #buildZoomControls(): HTMLElement {
    const box = div("jd-flow__zoom");
    // 컨트롤 클릭이 캔버스 팬/선택 해제로 새지 않게 한다(v2보다 나은 동작)
    box.addEventListener("pointerdown", (e) => e.stopPropagation());
    const plus = zoomBtn("+", "확대");
    plus.addEventListener("click", () =>
      this.#setCam(zoomAtPoint(this.#cam, this.#size.w / 2, this.#size.h / 2, -1)),
    );
    this.#zoomLabel = zoomBtn("100%", "실제 크기");
    this.#zoomLabel.classList.add("jd-flow__zoom-label");
    this.#zoomLabel.addEventListener("click", () => this.#setCam({ zoom: 1, panX: 0, panY: 0 }));
    const minus = zoomBtn("−", "축소");
    minus.addEventListener("click", () =>
      this.#setCam(zoomAtPoint(this.#cam, this.#size.w / 2, this.#size.h / 2, 1)),
    );
    const fit = zoomBtn("", "전체 보기");
    fit.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="1" y="1" width="12" height="12" rx="2"/><path d="M1 5H5V1M9 1V5H13M13 9H9V13M5 13V9H1"/></svg>';
    fit.addEventListener("click", () => this.#fit());
    box.append(plus, this.#zoomLabel, minus, fit);
    return box;
  }

  #readJson(): void {
    const script = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"]',
    );
    if (!script?.textContent) return;
    try {
      const j = JSON.parse(script.textContent) as {
        nodes?: JdFlowNode[];
        connections?: JdFlowConnection[];
      };
      if (Array.isArray(j.nodes)) this.#nodes = j.nodes;
      if (Array.isArray(j.connections)) this.#connections = j.connections;
    } catch {
      console.warn("[junds] <jd-flow-diagram> JSON 슬롯 파싱 실패 — 무시합니다.");
    }
    script.remove();
  }

  protected connected(): void {
    this.own({ destroy: on(this, "wheel", (e: WheelEvent) => this.#onWheel(e), { passive: false }) });
    this.own({ destroy: on(this, "pointerdown", (e: PointerEvent) => this.#onCanvasDown(e)) });
    this.own({ destroy: on(this, "contextmenu", (e: Event) => e.preventDefault()) });
    this.own({ destroy: on(window, "pointermove", (e: PointerEvent) => this.#onPointerMove(e)) });
    this.own({ destroy: on(window, "pointerup", () => this.#onPointerUp()) });
    this.own({ destroy: on(window, "keydown", (e: KeyboardEvent) => this.#onKeyDown(e)) });
    this.own({ destroy: on(window, "keyup", (e: KeyboardEvent) => this.#onKeyUp(e)) });
    this.own(
      createSizeObserver(this, (s) => {
        this.#size = { w: s.width, h: s.height };
        if (this.fitToView && !this.#didFit && s.width > 0) {
          this.#didFit = true;
          this.#fit();
        } else {
          this.requestUpdate();
        }
      }),
    );
  }

  /* ── 좌표 변환 ── */
  #screenToScene(sx: number, sy: number): { x: number; y: number } {
    const r = this.getBoundingClientRect();
    return {
      x: (sx - r.left - this.#cam.panX) / this.#cam.zoom,
      y: (sy - r.top - this.#cam.panY) / this.#cam.zoom,
    };
  }

  #portPos(nodeId: string, side: "input" | "output", portIdx = 0): { x: number; y: number } {
    const n = this.#nodes.find((nd) => nd.id === nodeId);
    if (!n) return { x: 0, y: 0 };
    const w = n.width ?? NODE_W;
    const h = this.#heights.get(nodeId) ?? 60;
    const total = side === "input" ? (n.inputs ?? 1) : (n.outputs ?? 1);
    const py = total === 1 ? h / 2 : (h / (total + 1)) * (portIdx + 1);
    return { x: side === "output" ? n.x + w : n.x, y: n.y + py };
  }

  #setCam(cam: Camera): void {
    this.#cam = cam;
    this.requestUpdate();
  }

  /* ── 렌더 반영 ── */
  protected override update(): void {
    // 카메라 → 뷰포트 변환 + 격자
    this.#viewport.style.transform = `translate(${this.#cam.panX}px, ${this.#cam.panY}px) scale(${this.#cam.zoom})`;
    this.#grid.hidden = this.noGrid;
    if (!this.noGrid) {
      const s = GRID_SIZE * this.#cam.zoom;
      this.#grid.style.backgroundSize = `${s}px ${s}px`;
      this.#grid.style.backgroundPosition = `${this.#cam.panX % s}px ${this.#cam.panY % s}px`;
    }
    this.#zoomLabel.textContent = `${Math.round(this.#cam.zoom * 100)}%`;
    this.#hint.textContent = this.readonly
      ? "드래그: 이동 · 스크롤: 줌"
      : "드래그: 이동 · Shift+드래그: 범위선택 · 스크롤: 줌 · Delete: 삭제";

    this.#reconcileNodes();
    this.#drawGroups();
    this.#drawConnections();
    this.#drawMinimap();
  }

  #reconcileNodes(): void {
    const sel = this.#sel;
    const seen = new Set<string>();
    for (const node of this.#nodes) {
      seen.add(node.id);
      let el = this.#nodeEls.get(node.id);
      if (!el) {
        el = this.#buildNode(node);
        this.#nodeEls.set(node.id, el);
        this.#nodesLayer.append(el);
      }
      this.#syncNode(el, node, sel.has(node.id));
    }
    for (const [id, el] of this.#nodeEls) {
      if (!seen.has(id)) {
        el.remove();
        this.#nodeEls.delete(id);
        this.#heights.delete(id);
        this.#nodeSigs.delete(id);
      }
    }
  }

  #buildNode(node: JdFlowNode): HTMLElement {
    const el = div("jd-flow__node");
    el.dataset.id = node.id;
    const header = div("jd-flow__node-header");
    const icon = document.createElement("span");
    icon.className = "jd-flow__node-icon";
    const title = document.createElement("span");
    title.className = "jd-flow__node-title";
    header.append(icon, title);
    const body = div("jd-flow__node-body");
    const ports = div("jd-flow__ports");
    el.append(ports, header, body);

    el.addEventListener("pointerdown", (e) => {
      if (this.readonly || e.button !== 0) return;
      e.stopPropagation();
      this.#onNodeDown(node.id, e);
    });
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.#drag?.moved) return;
      this.emit("jd-node-click", { id: node.id });
    });
    el.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      this.emit("jd-node-dblclick", { id: node.id });
    });
    return el;
  }

  #syncNode(el: HTMLElement, node: JdFlowNode, selected: boolean): void {
    const w = node.width ?? NODE_W;
    // 항상 반영하는 값(싸다): 위치·선택·커서
    el.style.left = `${node.x}px`;
    el.style.top = `${node.y}px`;
    el.style.width = `${w}px`;
    el.dataset.variant = node.variant ?? "default";
    el.toggleAttribute("data-selected", selected);
    el.style.cursor = this.readonly ? "default" : "grab";

    // 구조가 바뀔 때만 내용·포트를 다시 만들고 offsetHeight를 다시 잰다(레이아웃 스래싱 방지)
    const sig = `${node.title} ${node.content ?? ""} ${node.icon ?? ""} ${node.inputs ?? 1} ${node.outputs ?? 1} ${w} ${this.readonly ? 1 : 0}`;
    if (this.#nodeSigs.get(node.id) === sig && this.#heights.has(node.id)) return;
    this.#nodeSigs.set(node.id, sig);

    const icon = el.querySelector<HTMLElement>(".jd-flow__node-icon")!;
    icon.textContent = node.icon ?? "";
    icon.hidden = !node.icon;
    el.querySelector(".jd-flow__node-title")!.textContent = node.title;
    const body = el.querySelector<HTMLElement>(".jd-flow__node-body")!;
    body.textContent = node.content ?? "";
    body.hidden = !node.content;

    // 측정된 높이로 포트 배치
    const h = el.offsetHeight || 60;
    this.#heights.set(node.id, h);
    this.#syncPorts(el.querySelector<HTMLElement>(".jd-flow__ports")!, node, h);
  }

  #syncPorts(host: HTMLElement, node: JdFlowNode, h: number): void {
    const nIn = node.inputs ?? 1;
    const nOut = node.outputs ?? 1;
    host.textContent = "";
    const make = (side: "input" | "output", count: number): void => {
      for (let i = 0; i < count; i++) {
        const py = count === 1 ? h / 2 : (h / (count + 1)) * (i + 1);
        const port = div("jd-flow__port");
        port.dataset.side = side;
        port.style.top = `${py - 6}px`;
        port.style[side === "input" ? "left" : "right"] = "-6px";
        if (this.readonly) port.toggleAttribute("data-readonly", true);
        port.addEventListener("pointerdown", (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.#onPortDown(node.id, side, i, e);
        });
        host.append(port);
      }
    };
    make("input", nIn);
    make("output", nOut);
  }

  /* ── 연결선 ── */
  #connPath(x1: number, y1: number, x2: number, y2: number): string {
    const style = this.connectionStyle;
    if (style === "straight") return `M${x1},${y1} L${x2},${y2}`;
    if (style === "step") {
      const mx = (x1 + x2) / 2;
      return `M${x1},${y1} H${mx} V${y2} H${x2}`;
    }
    const dx = Math.max(Math.abs(x2 - x1) * 0.4, 40);
    return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
  }

  #drawConnections(): void {
    this.#linksG.textContent = "";
    for (const c of this.#connections) {
      const fp = this.#portPos(c.from, "output", c.fromPort ?? 0);
      const tp = this.#portPos(c.to, "input", c.toPort ?? 0);
      this.#linksG.append(this.#buildConn(c, fp, tp));
    }
    // 드래그 중인 임시 연결선
    if (this.#conn) {
      const from = this.#portPos(this.#conn.fromId, this.#conn.side, this.#conn.port);
      const g = svgNode("g", "jd-flow__link");
      const path = svgNode("path", "jd-flow__link-line");
      path.setAttribute("d", this.#connPath(from.x, from.y, this.#conn.mx, this.#conn.my));
      g.append(path);
      this.#linksG.append(g);
    }
  }

  #buildConn(
    c: JdFlowConnection,
    fp: { x: number; y: number },
    tp: { x: number; y: number },
  ): SVGGElement {
    const g = svgNode("g", "jd-flow__link");
    const selected = this.#selConn === c.id;
    if (selected) g.setAttribute("data-selected", "");
    const d = this.#connPath(fp.x, fp.y, tp.x, tp.y);

    const hit = svgNode("path", "jd-flow__link-hit");
    hit.setAttribute("d", d);
    hit.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      this.#selConn = c.id;
      this.requestUpdate();
    });

    const line = svgNode("path", "jd-flow__link-line");
    line.setAttribute("d", d);
    if (this.animateConnections) line.setAttribute("data-animate", "");

    const arrow = svgNode("circle", "jd-flow__link-arrow");
    setAttrs(arrow, { cx: tp.x, cy: tp.y, r: 3 });

    g.append(hit, line, arrow);

    if (c.label) {
      const midX = (fp.x + tp.x) / 2;
      const midY = (fp.y + tp.y) / 2;
      const rect = svgNode("rect", "jd-flow__link-label-bg");
      setAttrs(rect, {
        x: midX - c.label.length * 3.5 - 6,
        y: midY - 9,
        width: c.label.length * 7 + 12,
        height: 18,
        rx: 9,
      });
      const text = svgNode("text", "jd-flow__link-label");
      setAttrs(text, { x: midX, y: midY + 3.5, "text-anchor": "middle" });
      text.textContent = c.label;
      g.append(rect, text);
    }
    return g;
  }

  /* ── 그룹 오버레이 ── */
  #drawGroups(): void {
    this.#groupsLayer.textContent = "";
    const map = new Map<string, JdFlowNode[]>();
    this.#nodes.forEach((n) => {
      if (n.group) map.set(n.group, [...(map.get(n.group) ?? []), n]);
    });
    let ci = 0;
    for (const [name, nodes] of map) {
      const color = GROUP_PALETTE[ci % GROUP_PALETTE.length]!;
      ci += 1;
      if (!nodes.length) continue;
      const PAD = 28;
      let x1 = Infinity,
        y1 = Infinity,
        x2 = -Infinity,
        y2 = -Infinity;
      for (const n of nodes) {
        const w = n.width ?? NODE_W;
        const h = this.#heights.get(n.id) ?? 60;
        x1 = Math.min(x1, n.x);
        y1 = Math.min(y1, n.y);
        x2 = Math.max(x2, n.x + w);
        y2 = Math.max(y2, n.y + h);
      }
      const box = div("jd-flow__group");
      box.style.left = `${x1 - PAD}px`;
      box.style.top = `${y1 - PAD - 18}px`;
      box.style.width = `${x2 - x1 + PAD * 2}px`;
      box.style.height = `${y2 - y1 + PAD * 2 + 18}px`;
      box.style.setProperty("--jd-flow-group", color);
      const label = document.createElement("span");
      label.className = "jd-flow__group-label";
      label.textContent = name;
      box.append(label);
      this.#groupsLayer.append(box);
    }
  }

  /* ── 미니맵 ── */
  #drawMinimap(): void {
    this.#minimapEl.hidden = !this.minimap || this.#nodes.length === 0;
    if (this.#minimapEl.hidden) return;
    const MW = 150,
      MH = 90,
      P = 20;
    let x1 = Infinity,
      y1 = Infinity,
      x2 = -Infinity,
      y2 = -Infinity;
    for (const n of this.#nodes) {
      const w = n.width ?? NODE_W;
      const h = this.#heights.get(n.id) ?? 60;
      x1 = Math.min(x1, n.x);
      y1 = Math.min(y1, n.y);
      x2 = Math.max(x2, n.x + w);
      y2 = Math.max(y2, n.y + h);
    }
    x1 -= P;
    y1 -= P;
    x2 += P;
    y2 += P;
    const ww = x2 - x1 || 1;
    const wh = y2 - y1 || 1;
    const s = Math.min(MW / ww, MH / wh);

    const svg = svgNode("svg");
    setAttrs(svg, { width: MW, height: MH });
    for (const c of this.#connections) {
      const fn = this.#nodes.find((n) => n.id === c.from);
      const tn = this.#nodes.find((n) => n.id === c.to);
      if (!fn || !tn) continue;
      const line = svgNode("line", "jd-flow__mini-link");
      setAttrs(line, {
        x1: (fn.x + (fn.width ?? NODE_W) - x1) * s,
        y1: (fn.y + 20 - y1) * s,
        x2: (tn.x - x1) * s,
        y2: (tn.y + 20 - y1) * s,
      });
      svg.append(line);
    }
    for (const n of this.#nodes) {
      const rect = svgNode("rect", "jd-flow__mini-node");
      setAttrs(rect, {
        x: (n.x - x1) * s,
        y: (n.y - y1) * s,
        width: (n.width ?? NODE_W) * s,
        height: (this.#heights.get(n.id) ?? 60) * s,
        rx: 2,
      });
      svg.append(rect);
    }
    const view = svgNode("rect", "jd-flow__mini-view");
    setAttrs(view, {
      x: (-this.#cam.panX / this.#cam.zoom - x1) * s,
      y: (-this.#cam.panY / this.#cam.zoom - y1) * s,
      width: (this.#size.w / this.#cam.zoom) * s,
      height: (this.#size.h / this.#cam.zoom) * s,
      rx: 1,
    });
    svg.append(view);
    this.#minimapEl.textContent = "";
    this.#minimapEl.append(svg);
  }

  /* ── 화면 맞춤 ── */
  #fit(): void {
    if (!this.#nodes.length || !this.#size.w) return;
    let x1 = Infinity,
      y1 = Infinity,
      x2 = -Infinity,
      y2 = -Infinity;
    for (const n of this.#nodes) {
      const w = n.width ?? NODE_W;
      const h = this.#heights.get(n.id) ?? 60;
      x1 = Math.min(x1, n.x);
      y1 = Math.min(y1, n.y);
      x2 = Math.max(x2, n.x + w);
      y2 = Math.max(y2, n.y + h);
    }
    const ww = x2 - x1;
    const wh = y2 - y1;
    if (ww <= 0 || wh <= 0) return;
    const z = Math.min(
      MAX_ZOOM,
      Math.max(MIN_ZOOM, Math.min((this.#size.w - FIT_PAD * 2) / ww, (this.#size.h - FIT_PAD * 2) / wh)),
    );
    this.#setCam({
      zoom: z,
      panX: this.#size.w / 2 - ((x1 + x2) / 2) * z,
      panY: this.#size.h / 2 - ((y1 + y2) / 2) * z,
    });
  }

  /* ── 제스처 핸들러 ── */
  #onWheel(e: WheelEvent): void {
    e.preventDefault();
    const r = this.getBoundingClientRect();
    this.#setCam(zoomAtPoint(this.#cam, e.clientX - r.left, e.clientY - r.top, e.deltaY));
  }

  #onCanvasDown(e: PointerEvent): void {
    if (e.button !== 0 && e.button !== 1) return;
    if (e.button === 1 || this.#space) {
      e.preventDefault();
      this.#pan = { sx: e.clientX, sy: e.clientY, px: this.#cam.panX, py: this.#cam.panY };
      this.toggleAttribute("data-grabbing", true);
      return;
    }
    if (e.shiftKey && !this.readonly) {
      const c = this.#screenToScene(e.clientX, e.clientY);
      this.#marquee = { sx: c.x, sy: c.y, ex: c.x, ey: c.y };
      this.requestUpdate();
      return;
    }
    // 빈 캔버스 좌클릭 → 선택 해제 + 팬
    this.#setSelection([]);
    this.#selConn = null;
    this.#pan = { sx: e.clientX, sy: e.clientY, px: this.#cam.panX, py: this.#cam.panY };
    this.toggleAttribute("data-grabbing", true);
    this.requestUpdate();
  }

  #onNodeDown(id: string, e: PointerEvent): void {
    const sel = this.#sel;
    if (e.shiftKey) {
      const next = new Set(sel);
      next.has(id) ? next.delete(id) : next.add(id);
      this.#setSelection(Array.from(next));
      return;
    }
    if (!sel.has(id)) this.#setSelection([id]);
    const toMove = this.#sel.has(id) ? Array.from(this.#sel) : [id];
    const starts = new Map<string, { x: number; y: number }>();
    for (const nid of toMove) {
      const n = this.#nodes.find((nd) => nd.id === nid);
      if (n) starts.set(nid, { x: n.x, y: n.y });
    }
    if (!starts.has(id)) {
      const n = this.#nodes.find((nd) => nd.id === id);
      if (n) starts.set(id, { x: n.x, y: n.y });
    }
    this.#drag = { nodeId: id, sx: e.clientX, sy: e.clientY, starts, moved: false };
    this.toggleAttribute("data-grabbing", true);
  }

  #onPortDown(id: string, side: "input" | "output", port: number, e: PointerEvent): void {
    if (this.readonly) return;
    if (this.#conn) {
      if (this.#conn.fromId !== id) {
        const from = this.#conn.side === "output" ? this.#conn.fromId : id;
        const to = this.#conn.side === "output" ? id : this.#conn.fromId;
        this.#applyConnect(from, to);
      }
      this.#conn = null;
      this.requestUpdate();
      return;
    }
    const c = this.#screenToScene(e.clientX, e.clientY);
    this.#conn = { fromId: id, side, port, mx: c.x, my: c.y };
    this.requestUpdate();
  }

  #onPointerMove(e: PointerEvent): void {
    if (this.#pan) {
      this.#setCam({
        ...this.#cam,
        panX: this.#pan.px + e.clientX - this.#pan.sx,
        panY: this.#pan.py + e.clientY - this.#pan.sy,
      });
      return;
    }
    if (this.#drag) {
      const dx = (e.clientX - this.#drag.sx) / this.#cam.zoom;
      const dy = (e.clientY - this.#drag.sy) / this.#cam.zoom;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) this.#drag.moved = true;
      if (this.#drag.moved) {
        const ids = this.#sel.has(this.#drag.nodeId) ? Array.from(this.#sel) : [this.#drag.nodeId];
        for (const nid of ids) {
          const start = this.#drag.starts.get(nid);
          const node = this.#nodes.find((n) => n.id === nid);
          if (start && node) {
            node.x = Math.round(start.x + dx);
            node.y = Math.round(start.y + dy);
            this.emit("jd-node-move", { id: nid, x: node.x, y: node.y });
          }
        }
        this.requestUpdate();
      }
      return;
    }
    if (this.#marquee) {
      const c = this.#screenToScene(e.clientX, e.clientY);
      this.#marquee.ex = c.x;
      this.#marquee.ey = c.y;
      this.#paintMarquee();
      return;
    }
    if (this.#conn) {
      const c = this.#screenToScene(e.clientX, e.clientY);
      this.#conn.mx = c.x;
      this.#conn.my = c.y;
      this.requestUpdate();
    }
  }

  #onPointerUp(): void {
    this.toggleAttribute("data-grabbing", false);
    if (this.#pan) {
      this.#pan = null;
      return;
    }
    if (this.#drag) {
      this.#drag = null;
      return;
    }
    if (this.#marquee) {
      const m = this.#marquee;
      const l = Math.min(m.sx, m.ex),
        r = Math.max(m.sx, m.ex),
        t = Math.min(m.sy, m.ey),
        b = Math.max(m.sy, m.ey);
      const hits: string[] = [];
      for (const n of this.#nodes) {
        const w = n.width ?? NODE_W;
        const h = this.#heights.get(n.id) ?? 60;
        if (n.x + w > l && n.x < r && n.y + h > t && n.y < b) hits.push(n.id);
      }
      this.#setSelection(hits);
      this.#marquee = null;
      this.#marqueeEl.hidden = true;
      this.requestUpdate();
      return;
    }
    if (this.#conn) {
      this.#conn = null;
      this.requestUpdate();
    }
  }

  #paintMarquee(): void {
    const m = this.#marquee;
    if (!m) return;
    this.#marqueeEl.hidden = false;
    this.#marqueeEl.style.left = `${Math.min(m.sx, m.ex)}px`;
    this.#marqueeEl.style.top = `${Math.min(m.sy, m.ey)}px`;
    this.#marqueeEl.style.width = `${Math.abs(m.ex - m.sx)}px`;
    this.#marqueeEl.style.height = `${Math.abs(m.ey - m.sy)}px`;
  }

  #onKeyDown(e: KeyboardEvent): void {
    // 포커스가 이 다이어그램(또는 내부)일 때만 키를 먹는다
    if (!this.contains(document.activeElement) && document.activeElement !== this) return;
    if (e.key === " ") {
      e.preventDefault();
      this.#space = true;
      this.toggleAttribute("data-space", true);
    }
    if (
      (e.key === "Delete" || e.key === "Backspace") &&
      !(e.target instanceof HTMLInputElement) &&
      !this.readonly
    ) {
      if (this.#selConn) {
        this.#applyDisconnect(this.#selConn);
        this.#selConn = null;
      }
      const ids = Array.from(this.#sel);
      if (ids.length) this.#applyDelete(ids);
    }
    if (e.key === "Escape") {
      this.#conn = null;
      this.#marquee = null;
      this.#marqueeEl.hidden = true;
      this.#selConn = null;
      this.requestUpdate();
    }
  }

  #onKeyUp(e: KeyboardEvent): void {
    if (e.key === " ") {
      this.#space = false;
      this.toggleAttribute("data-space", false);
    }
  }

  /* ── 상태 변이(자기 소유) + 이벤트 ── */
  #setSelection(ids: string[]): void {
    if (this.#controlledSel) {
      // controlled: 내부 상태를 바꾸지 않고 요청만 보낸다
      this.emit("jd-selection-change", { ids });
      return;
    }
    this.#intSel = new Set(ids);
    this.emit("jd-selection-change", { ids });
    this.requestUpdate();
  }

  #applyConnect(from: string, to: string): void {
    const id = `${from}->${to}-${this.#connections.length + 1}`;
    this.#connections = [...this.#connections, { id, from, to }];
    this.emit("jd-connect", { from, to });
    this.requestUpdate();
  }

  #applyDisconnect(id: string): void {
    this.#connections = this.#connections.filter((c) => c.id !== id);
    this.emit("jd-disconnect", { id });
    this.requestUpdate();
  }

  #applyDelete(ids: string[]): void {
    const set = new Set(ids);
    this.#nodes = this.#nodes.filter((n) => !set.has(n.id));
    this.#connections = this.#connections.filter((c) => !set.has(c.from) && !set.has(c.to));
    if (!this.#controlledSel) this.#intSel = new Set();
    this.emit("jd-node-delete", { ids });
    this.requestUpdate();
  }
}

/* ── DOM 헬퍼 ── */
function div(cls: string): HTMLElement {
  const el = document.createElement("div");
  el.className = cls;
  return el;
}

function zoomBtn(label: string, title: string): HTMLButtonElement {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "jd-flow__zoom-btn";
  b.title = title;
  b.setAttribute("aria-label", title);
  if (label) b.textContent = label;
  return b;
}
