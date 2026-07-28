"use client";

import { useRef, useState, useCallback, useEffect, memo, useMemo } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

export interface FlowNode {
  id: string;
  title: string;
  content?: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  x: number;
  y: number;
  width?: number;
  icon?: ReactNode;
  group?: string;
  inputs?: number;
  outputs?: number;
}

export interface FlowConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
  fromPort?: number;
  toPort?: number;
}

export interface FlowDiagramProps {
  /** 노드 목록 */
  nodes: FlowNode[];
  /** 연결선 목록 */
  connections: FlowConnection[];
  /** 노드 이동 콜백 */
  onNodeMove?: (nodeId: string, x: number, y: number) => void;
  /** 노드 클릭 콜백 */
  onNodeClick?: (nodeId: string) => void;
  /** 연결 생성 콜백 */
  onConnect?: (from: string, to: string) => void;
  /** 연결 해제 콜백 */
  onDisconnect?: (connectionId: string) => void;
  /** 선택된 노드 ID 목록 */
  selectedIds?: string[];
  /** 선택 변경 콜백 */
  onSelectionChange?: (ids: string[]) => void;
  /** 노드 삭제 콜백 */
  onNodeDelete?: (nodeIds: string[]) => void;
  /** 노드 더블 클릭 콜백 */
  onNodeDoubleClick?: (nodeId: string) => void;
  /** 추가 클래스 */
  className?: string;
  /** 그리드 표시 여부 */
  showGrid?: boolean;
  /** 미니맵 표시 여부 */
  showMinimap?: boolean;
  /** 화면 맞춤 활성화 */
  fitToView?: boolean;
  /** 읽기 전용 */
  readonly?: boolean;
  /** 연결선 스타일 */
  connectionStyle?: "bezier" | "straight" | "step";
  /** 연결선 애니메이션 */
  animateConnections?: boolean;
}

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const NODE_W = 200;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;
const FIT_PAD = 60;
const GRID_SIZE = 20;

/** 줌 컨트롤 버튼 — 네 개가 같은 옷을 입어야 한 덩어리로 읽힌다 */
const ZOOM_BTN =
  "w-8 h-8 rounded-xl bg-gray-800/90 text-white flex items-center justify-center text-sm" +
  " ring-1 ring-white/10 shadow-[0_6px_16px_-8px_rgba(0,0,0,0.6)]" +
  " transition-colors cursor-pointer hover:bg-gray-700 active:bg-gray-600" +
  " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950";

/* ================================================================== */
/*  Variant styles                                                     */
/* ================================================================== */

type V = NonNullable<FlowNode["variant"]>;
const vBorder: Record<V, string> = {
  default: "var(--muted)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  info: "var(--primary)",
};
const vHeaderBg: Record<V, string> = {
  default: "var(--foreground)",
  success: "#14532d",
  warning: "#78350f",
  danger: "#7f1d1d",
  info: "#1e3a5f",
};
const vHeaderText: Record<V, string> = {
  default: "var(--border)",
  success: "var(--success-light)",
  warning: "var(--warning-light)",
  danger: "var(--danger-light)",
  info: "var(--primary-light)",
};

const groupPalette = [
  {
    bg: "color-mix(in srgb, var(--primary) 6%, transparent)",
    border: "color-mix(in srgb, var(--primary) 30%, transparent)",
    text: "var(--primary-light)",
  },
  {
    bg: "color-mix(in srgb, var(--success) 6%, transparent)",
    border: "color-mix(in srgb, var(--success) 30%, transparent)",
    text: "#6ee7b7",
  },
  {
    bg: "color-mix(in srgb, var(--warning) 6%, transparent)",
    border: "color-mix(in srgb, var(--warning) 30%, transparent)",
    text: "#fcd34d",
  },
  {
    bg: "color-mix(in srgb, var(--danger) 6%, transparent)",
    border: "color-mix(in srgb, var(--danger) 30%, transparent)",
    text: "var(--danger-light)",
  },
  { bg: "rgba(168,85,247,0.06)", border: "rgba(168,85,247,0.3)", text: "#c4b5fd" },
];

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

/** 줌+팬을 동시에 계산하는 순수함수 */
function zoomAtPoint(
  prevZoom: number,
  prevPan: { x: number; y: number },
  mouseX: number,
  mouseY: number,
  delta: number,
) {
  const factor = delta > 0 ? 0.9 : 1.1;
  const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prevZoom * factor));
  const r = newZoom / prevZoom;
  return {
    zoom: newZoom,
    panX: mouseX - r * (mouseX - prevPan.x),
    panY: mouseY - r * (mouseY - prevPan.y),
  };
}

/* ================================================================== */
/*  Grid Background                                                    */
/* ================================================================== */

function Grid({ zoom, pan }: { zoom: number; pan: { x: number; y: number } }) {
  const s = GRID_SIZE * zoom;
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.07) 1px,transparent 1px)",
        backgroundSize: `${s}px ${s}px`,
        backgroundPosition: `${pan.x % s}px ${pan.y % s}px`,
      }}
    />
  );
}

/* ================================================================== */
/*  Connection SVG                                                     */
/* ================================================================== */

function ConnLine({
  x1,
  y1,
  x2,
  y2,
  selected,
  onClick,
  style: ls = "bezier",
  animate,
  label,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  selected?: boolean;
  onClick?: () => void;
  style?: "bezier" | "straight" | "step";
  animate?: boolean;
  label?: string;
}) {
  let d: string;
  if (ls === "straight") {
    d = `M${x1},${y1} L${x2},${y2}`;
  } else if (ls === "step") {
    const mx = (x1 + x2) / 2;
    d = `M${x1},${y1} H${mx} V${y2} H${x2}`;
  } else {
    const dx = Math.max(Math.abs(x2 - x1) * 0.4, 40);
    d = `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
  }

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const color = selected ? "var(--primary)" : "var(--muted)";
  const sw = selected ? 3 : 2;

  return (
    <g>
      {/* 투명 히트영역 */}
      <path
        d={d}
        stroke="transparent"
        strokeWidth={14}
        fill="none"
        style={{ pointerEvents: "stroke", cursor: "pointer" }}
        onClick={onClick}
      />
      {/* 실제 선 */}
      <path
        d={d}
        stroke={color}
        strokeWidth={sw}
        fill="none"
        strokeLinecap="round"
        style={{ pointerEvents: "none" }}
        strokeDasharray={animate ? "6 4" : undefined}
      >
        {animate && (
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-20"
            dur="0.8s"
            repeatCount="indefinite"
          />
        )}
      </path>
      {/* 화살표 */}
      <circle cx={x2} cy={y2} r={3} fill={color} style={{ pointerEvents: "none" }} />
      {/* 라벨 */}
      {label && (
        <g style={{ pointerEvents: "none" }}>
          <rect
            x={midX - label.length * 3.5 - 6}
            y={midY - 9}
            width={label.length * 7 + 12}
            height={18}
            rx={9}
            fill="var(--foreground)"
            stroke="var(--border)"
            strokeWidth={1}
          />
          <text
            x={midX}
            y={midY + 3.5}
            textAnchor="middle"
            fill="var(--border)"
            fontSize={10}
            fontFamily="system-ui,sans-serif"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

/* ================================================================== */
/*  Node Card                                                          */
/* ================================================================== */

const NodeCard = memo(function NodeCard({
  node,
  isSelected,
  nodeHeights,
  readonly,
  onMouseDown,
  onPortDown,
  onClick,
  onDblClick,
}: {
  node: FlowNode;
  isSelected: boolean;
  nodeHeights: React.RefObject<Map<string, number>>;
  readonly?: boolean;
  onMouseDown: (id: string, e: React.MouseEvent) => void;
  onPortDown: (id: string, side: "input" | "output", portIdx: number, e: React.MouseEvent) => void;
  onClick: (id: string) => void;
  onDblClick?: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const v = node.variant ?? "default";
  const w = node.width ?? NODE_W;
  const nIn = node.inputs ?? 1;
  const nOut = node.outputs ?? 1;

  // 노드 높이 측정
  useEffect(() => {
    if (ref.current) {
      nodeHeights.current?.set(node.id, ref.current.offsetHeight);
    }
  });

  const h = nodeHeights.current?.get(node.id) ?? 60;

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        width: w,
        borderColor: vBorder[v],
        boxShadow: isSelected
          ? `0 0 0 2px var(--primary), 0 4px 24px rgba(0,0,0,0.4)`
          : "0 4px 20px rgba(0,0,0,0.3)",
        cursor: readonly ? "default" : "grab",
        zIndex: isSelected ? 10 : 1,
      }}
      className="select-none rounded-xl border-2 bg-gray-900 text-white overflow-visible"
      onMouseDown={(e) => {
        if (!readonly && e.button === 0) {
          e.stopPropagation();
          onMouseDown(node.id, e);
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(node.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDblClick?.(node.id);
      }}
    >
      {/* 입력 포트 */}
      {Array.from({ length: nIn }, (_, i) => {
        const py = nIn === 1 ? h / 2 : (h / (nIn + 1)) * (i + 1);
        return (
          <div
            key={`i${i}`}
            onMouseDown={(e) => {
              e.stopPropagation();
              onPortDown(node.id, "input", i, e);
            }}
            className={cn(
              // bg-info 는 blue-500 과 같은 값이면서 테마를 따라간다
              "absolute w-3 h-3 rounded-full border-2 border-white/70 bg-info z-20",
              readonly
                ? "cursor-default opacity-40"
                : "cursor-crosshair hover:scale-150 transition-transform duration-150 motion-reduce:transition-none motion-reduce:hover:scale-100",
            )}
            style={{ left: -6, top: py - 6 }}
          />
        );
      })}
      {/* 출력 포트 */}
      {Array.from({ length: nOut }, (_, i) => {
        const py = nOut === 1 ? h / 2 : (h / (nOut + 1)) * (i + 1);
        return (
          <div
            key={`o${i}`}
            onMouseDown={(e) => {
              e.stopPropagation();
              onPortDown(node.id, "output", i, e);
            }}
            className={cn(
              // bg-info 는 blue-500 과 같은 값이면서 테마를 따라간다
              "absolute w-3 h-3 rounded-full border-2 border-white/70 bg-info z-20",
              readonly
                ? "cursor-default opacity-40"
                : "cursor-crosshair hover:scale-150 transition-transform duration-150 motion-reduce:transition-none motion-reduce:hover:scale-100",
            )}
            style={{ right: -6, top: py - 6 }}
          />
        );
      })}
      {/* 헤더 */}
      <div
        className="px-3 py-2 text-sm font-bold rounded-t-[10px] border-b flex items-center gap-1.5"
        style={{ background: vHeaderBg[v], color: vHeaderText[v], borderColor: vBorder[v] }}
      >
        {node.icon && <span className="shrink-0 text-base">{node.icon}</span>}
        <span className="truncate">{node.title}</span>
      </div>
      {/* 내용 */}
      {node.content && <div className="px-3 py-2 text-xs text-gray-400">{node.content}</div>}
    </div>
  );
});

/* ================================================================== */
/*  Group Overlay                                                      */
/* ================================================================== */

function GrpOverlay({
  name,
  nodes,
  ci,
  heights,
}: {
  name: string;
  nodes: FlowNode[];
  ci: number;
  heights: React.RefObject<Map<string, number>>;
}) {
  if (!nodes.length) return null;
  const c = groupPalette[ci % groupPalette.length];
  const PAD = 28;
  let x1 = Infinity,
    y1 = Infinity,
    x2 = -Infinity,
    y2 = -Infinity;
  for (const n of nodes) {
    const w = n.width ?? NODE_W;
    const h = heights.current?.get(n.id) ?? 60;
    if (n.x < x1) x1 = n.x;
    if (n.y < y1) y1 = n.y;
    if (n.x + w > x2) x2 = n.x + w;
    if (n.y + h > y2) y2 = n.y + h;
  }
  return (
    <div
      className="absolute rounded-2xl pointer-events-none"
      style={{
        left: x1 - PAD,
        top: y1 - PAD - 18,
        width: x2 - x1 + PAD * 2,
        height: y2 - y1 + PAD * 2 + 18,
        background: c.bg,
        border: `2px dashed ${c.border}`,
      }}
    >
      <span
        className="absolute top-1.5 left-3 text-[10px] font-bold tracking-wider uppercase"
        style={{ color: c.text }}
      >
        {name}
      </span>
    </div>
  );
}

/* ================================================================== */
/*  Minimap                                                            */
/* ================================================================== */

function Minimap({
  nodes,
  connections,
  zoom,
  pan,
  cw,
  ch,
  heights,
}: {
  nodes: FlowNode[];
  connections: FlowConnection[];
  zoom: number;
  pan: { x: number; y: number };
  cw: number;
  ch: number;
  heights: React.RefObject<Map<string, number>>;
}) {
  if (!nodes.length) return null;
  const MW = 150,
    MH = 90,
    P = 20;
  let x1 = Infinity,
    y1 = Infinity,
    x2 = -Infinity,
    y2 = -Infinity;
  for (const n of nodes) {
    const w = n.width ?? NODE_W;
    const h = heights.current?.get(n.id) ?? 60;
    x1 = Math.min(x1, n.x);
    y1 = Math.min(y1, n.y);
    x2 = Math.max(x2, n.x + w);
    y2 = Math.max(y2, n.y + h);
  }
  x1 -= P;
  y1 -= P;
  x2 += P;
  y2 += P;
  const ww = x2 - x1 || 1,
    wh = y2 - y1 || 1;
  const s = Math.min(MW / ww, MH / wh);
  return (
    <div
      className="absolute top-3 right-3 z-20 rounded-lg border border-gray-700 bg-gray-900/90 backdrop-blur"
      style={{ width: MW, height: MH }}
    >
      <svg width={MW} height={MH}>
        {connections.map((c) => {
          const fn = nodes.find((n) => n.id === c.from),
            tn = nodes.find((n) => n.id === c.to);
          if (!fn || !tn) return null;
          return (
            <line
              key={c.id}
              x1={(fn.x + (fn.width ?? NODE_W) - x1) * s}
              y1={(fn.y + 20 - y1) * s}
              x2={(tn.x - x1) * s}
              y2={(tn.y + 20 - y1) * s}
              stroke="var(--muted)"
              strokeWidth={0.8}
            />
          );
        })}
        {nodes.map((n) => (
          <rect
            key={n.id}
            x={(n.x - x1) * s}
            y={(n.y - y1) * s}
            width={(n.width ?? NODE_W) * s}
            height={(heights.current?.get(n.id) ?? 60) * s}
            rx={2}
            fill="var(--border)"
            stroke="var(--muted)"
            strokeWidth={0.5}
          />
        ))}
        <rect
          x={(-pan.x / zoom - x1) * s}
          y={(-pan.y / zoom - y1) * s}
          width={(cw / zoom) * s}
          height={(ch / zoom) * s}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={1.5}
          rx={1}
        />
      </svg>
    </div>
  );
}

/* ================================================================== */
/*  Main FlowDiagram                                                   */
/* ================================================================== */

/**
 * 노드와 연결선으로 구성된 플로우 다이어그램 에디터.
 * @example
 * <FlowDiagram nodes={nodes} connections={connections} onNodeMove={updateNode} />
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export function FlowDiagram({
  nodes,
  connections,
  onNodeMove,
  onNodeClick,
  onConnect,
  onDisconnect,
  selectedIds,
  onSelectionChange,
  onNodeDelete,
  onNodeDoubleClick,
  className,
  showGrid = true,
  showMinimap = false,
  fitToView: fitProp = false,
  readonly = false,
  connectionStyle = "bezier",
  animateConnections = false,
}: FlowDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeHeightsRef = useRef<Map<string, number>>(new Map());

  // 줌+팬을 하나의 state로 관리 → 동기 문제 해결
  const [camera, setCamera] = useState({ zoom: 1, panX: 0, panY: 0 });
  const [cSize, setCSize] = useState({ w: 0, h: 0 });

  // 인터랙션
  const dragRef = useRef<{
    nodeId: string;
    sx: number;
    sy: number;
    starts: Map<string, { x: number; y: number }>;
    moved: boolean;
  } | null>(null);
  const panRef = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);
  const selectRef = useRef<{ sx: number; sy: number; ex: number; ey: number } | null>(null);
  const connRef = useRef<{
    fromId: string;
    side: "input" | "output";
    port: number;
    mx: number;
    my: number;
  } | null>(null);
  const spaceRef = useRef(false);
  const [, forceRender] = useState(0);
  const kick = useCallback(() => forceRender((c) => c + 1), []);

  const [selConn, setSelConn] = useState<string | null>(null);
  const [intSel, setIntSel] = useState<Set<string>>(new Set());
  const selSet = useMemo(() => new Set(selectedIds ?? Array.from(intSel)), [selectedIds, intSel]);

  const setSel = useCallback(
    (ids: string[]) => {
      setIntSel(new Set(ids));
      onSelectionChange?.(ids);
    },
    [onSelectionChange],
  );

  const s2c = useCallback(
    (sx: number, sy: number) => {
      const r = containerRef.current?.getBoundingClientRect();
      if (!r) return { x: 0, y: 0 };
      return {
        x: (sx - r.left - camera.panX) / camera.zoom,
        y: (sy - r.top - camera.panY) / camera.zoom,
      };
    },
    [camera],
  );

  // 포트 위치 계산 (측정된 높이 사용)
  const portPos = useCallback(
    (nodeId: string, side: "input" | "output", portIdx = 0) => {
      const n = nodes.find((nd) => nd.id === nodeId);
      if (!n) return { x: 0, y: 0 };
      const w = n.width ?? NODE_W;
      const h = nodeHeightsRef.current.get(nodeId) ?? 60;
      const total = side === "input" ? n.inputs ?? 1 : n.outputs ?? 1;
      const py = total === 1 ? h / 2 : (h / (total + 1)) * (portIdx + 1);
      return { x: side === "output" ? n.x + w : n.x, y: n.y + py };
    },
    [nodes],
  );

  // 그룹 맵
  const groupMap = useMemo(() => {
    const m = new Map<string, FlowNode[]>();
    nodes.forEach((n) => {
      if (n.group) {
        m.set(n.group, [...(m.get(n.group) ?? []), n]);
      }
    });
    return m;
  }, [nodes]);

  // Fit to View
  const fitToView = useCallback(() => {
    if (!nodes.length || !cSize.w) return;
    let x1 = Infinity,
      y1 = Infinity,
      x2 = -Infinity,
      y2 = -Infinity;
    for (const n of nodes) {
      const w = n.width ?? NODE_W,
        h = nodeHeightsRef.current.get(n.id) ?? 60;
      x1 = Math.min(x1, n.x);
      y1 = Math.min(y1, n.y);
      x2 = Math.max(x2, n.x + w);
      y2 = Math.max(y2, n.y + h);
    }
    const ww = x2 - x1,
      wh = y2 - y1;
    if (ww <= 0 || wh <= 0) return;
    const z = Math.min(
      MAX_ZOOM,
      Math.max(MIN_ZOOM, Math.min((cSize.w - FIT_PAD * 2) / ww, (cSize.h - FIT_PAD * 2) / wh)),
    );
    setCamera({
      zoom: z,
      panX: cSize.w / 2 - ((x1 + x2) / 2) * z,
      panY: cSize.h / 2 - ((y1 + y2) / 2) * z,
    });
  }, [nodes, cSize]);

  // ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((es) => {
      for (const e of es) setCSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 자동 fit
  useEffect(() => {
    if (fitProp && cSize.w > 0) fitToView();
  }, [fitProp, cSize.w]); // eslint-disable-line

  // 휠 줌 (마우스 위치 기준)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      setCamera((prev) =>
        zoomAtPoint(
          prev.zoom,
          { x: prev.panX, y: prev.panY },
          e.clientX - r.left,
          e.clientY - r.top,
          e.deltaY,
        ),
      );
    };
    el.addEventListener("wheel", h, { passive: false });
    return () => el.removeEventListener("wheel", h);
  }, []);

  // 키보드
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        spaceRef.current = true;
      }
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        !(e.target instanceof HTMLInputElement)
      ) {
        if (selConn && onDisconnect) {
          onDisconnect(selConn);
          setSelConn(null);
        }
        const ids = Array.from(selSet);
        if (ids.length && onNodeDelete) onNodeDelete(ids);
      }
      if (e.key === "Escape") {
        connRef.current = null;
        selectRef.current = null;
        setSelConn(null);
        kick();
      }
    };
    const ku = (e: KeyboardEvent) => {
      if (e.key === " ") spaceRef.current = false;
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, [selConn, selSet, onDisconnect, onNodeDelete, kick]);

  // 마우스 이동/업 (글로벌)
  useEffect(() => {
    const mm = (e: MouseEvent) => {
      // 팬
      if (panRef.current) {
        const p = panRef.current;
        setCamera((prev) => ({
          ...prev,
          panX: p.px + e.clientX - p.sx,
          panY: p.py + e.clientY - p.sy,
        }));
        return;
      }
      // 노드 드래그
      if (dragRef.current) {
        const d = dragRef.current;
        const dx = (e.clientX - d.sx) / camera.zoom;
        const dy = (e.clientY - d.sy) / camera.zoom;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) d.moved = true;
        if (d.moved) {
          const toMove = selSet.has(d.nodeId) ? Array.from(selSet) : [d.nodeId];
          for (const nid of toMove) {
            const sp = d.starts.get(nid);
            if (sp && onNodeMove) onNodeMove(nid, Math.round(sp.x + dx), Math.round(sp.y + dy));
          }
        }
        return;
      }
      // 셀렉트 박스
      if (selectRef.current) {
        const c = s2c(e.clientX, e.clientY);
        selectRef.current.ex = c.x;
        selectRef.current.ey = c.y;
        kick();
        return;
      }
      // 연결선 드래그
      if (connRef.current) {
        const c = s2c(e.clientX, e.clientY);
        connRef.current.mx = c.x;
        connRef.current.my = c.y;
        kick();
      }
    };
    const mu = () => {
      if (panRef.current) {
        panRef.current = null;
        return;
      }
      if (dragRef.current) {
        dragRef.current = null;
        return;
      }
      if (selectRef.current) {
        const s = selectRef.current;
        const l = Math.min(s.sx, s.ex),
          r = Math.max(s.sx, s.ex);
        const t = Math.min(s.sy, s.ey),
          b = Math.max(s.sy, s.ey);
        const hits: string[] = [];
        for (const n of nodes) {
          const w = n.width ?? NODE_W,
            h = nodeHeightsRef.current.get(n.id) ?? 60;
          if (n.x + w > l && n.x < r && n.y + h > t && n.y < b) hits.push(n.id);
        }
        setSel(hits);
        selectRef.current = null;
        kick();
        return;
      }
      if (connRef.current) {
        connRef.current = null;
        kick();
      }
    };
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", mu);
    return () => {
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", mu);
    };
  }, [camera.zoom, selSet, nodes, onNodeMove, s2c, setSel, kick]);

  // 캔버스 마우스다운
  const onCanvasDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0 && e.button !== 1) return;
      if (e.button === 1 || spaceRef.current) {
        e.preventDefault();
        panRef.current = { sx: e.clientX, sy: e.clientY, px: camera.panX, py: camera.panY };
        kick();
        return;
      }
      if (e.shiftKey && !readonly) {
        const c = s2c(e.clientX, e.clientY);
        selectRef.current = { sx: c.x, sy: c.y, ex: c.x, ey: c.y };
        kick();
        return;
      }
      // 빈 캔버스 좌클릭 → 팬 시작
      setSel([]);
      setSelConn(null);
      panRef.current = { sx: e.clientX, sy: e.clientY, px: camera.panX, py: camera.panY };
      kick();
    },
    [camera, s2c, setSel, readonly, kick],
  );

  // 노드 마우스다운
  const onNodeDown = useCallback(
    (id: string, e: React.MouseEvent) => {
      if (e.shiftKey) {
        const ns = new Set(selSet);
        ns.has(id) ? ns.delete(id) : ns.add(id);
        setSel(Array.from(ns));
        return;
      }
      if (!selSet.has(id)) setSel([id]);
      const toMove = selSet.has(id) ? Array.from(selSet) : [id];
      const starts = new Map<string, { x: number; y: number }>();
      for (const nid of toMove) {
        const n = nodes.find((nd) => nd.id === nid);
        if (n) starts.set(nid, { x: n.x, y: n.y });
      }
      const dn = nodes.find((n) => n.id === id);
      if (dn && !starts.has(id)) starts.set(id, { x: dn.x, y: dn.y });
      dragRef.current = { nodeId: id, sx: e.clientX, sy: e.clientY, starts, moved: false };
    },
    [nodes, selSet, setSel],
  );

  const onNodeClk = useCallback(
    (id: string) => {
      if (dragRef.current?.moved) return;
      onNodeClick?.(id);
    },
    [onNodeClick],
  );

  // 포트 마우스다운
  const onPortDown = useCallback(
    (id: string, side: "input" | "output", port: number, e: React.MouseEvent) => {
      e.preventDefault();
      if (readonly) return;
      if (connRef.current) {
        if (connRef.current.fromId !== id) {
          const from = connRef.current.side === "output" ? connRef.current.fromId : id;
          const to = connRef.current.side === "output" ? id : connRef.current.fromId;
          onConnect?.(from, to);
        }
        connRef.current = null;
        kick();
        return;
      }
      const c = s2c(e.clientX, e.clientY);
      connRef.current = { fromId: id, side, port, mx: c.x, my: c.y };
      kick();
    },
    [readonly, onConnect, s2c, kick],
  );

  // 셀렉트 박스 스타일
  const selBox = selectRef.current;
  const connDrag = connRef.current;
  const connFrom = connDrag ? portPos(connDrag.fromId, connDrag.side, connDrag.port) : null;

  const isPanning = panRef.current !== null;
  const isDragging = dragRef.current !== null;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden bg-gray-950 w-full", className)}
      style={{
        minHeight: 400,
        cursor: isPanning
          ? "grabbing"
          : spaceRef.current
          ? "grab"
          : isDragging
          ? "grabbing"
          : "default",
      }}
      onMouseDown={onCanvasDown}
      onContextMenu={(e) => e.preventDefault()}
    >
      {showGrid && <Grid zoom={camera.zoom} pan={{ x: camera.panX, y: camera.panY }} />}

      {/* 변환 레이어 */}
      <div
        style={{
          transform: `translate(${camera.panX}px,${camera.panY}px) scale(${camera.zoom})`,
          transformOrigin: "0 0",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {/* 그룹 오버레이 */}
        {Array.from(groupMap.entries()).map(([name, gn], i) => (
          <GrpOverlay key={name} name={name} nodes={gn} ci={i} heights={nodeHeightsRef} />
        ))}

        {/* SVG 연결선 */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1,
            height: 1,
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <g style={{ pointerEvents: "auto" }}>
            {connections.map((c) => {
              const fp = portPos(c.from, "output", c.fromPort ?? 0);
              const tp = portPos(c.to, "input", c.toPort ?? 0);
              return (
                <ConnLine
                  key={c.id}
                  x1={fp.x}
                  y1={fp.y}
                  x2={tp.x}
                  y2={tp.y}
                  selected={selConn === c.id}
                  onClick={() => setSelConn(c.id)}
                  style={connectionStyle}
                  animate={animateConnections}
                  label={c.label}
                />
              );
            })}
          </g>
          {connDrag && connFrom && (
            <ConnLine
              x1={connFrom.x}
              y1={connFrom.y}
              x2={connDrag.mx}
              y2={connDrag.my}
              style={connectionStyle}
            />
          )}
        </svg>

        {/* 셀렉트 박스 */}
        {selBox && (
          <div
            // 범위선택은 이 시스템의 선택색(primary)으로 말한다 — pink 는 어디서도 안 쓰는 색이었다
            className="absolute border-2 border-dashed border-primary/60 bg-primary/10 rounded-lg pointer-events-none"
            style={{
              left: Math.min(selBox.sx, selBox.ex),
              top: Math.min(selBox.sy, selBox.ey),
              width: Math.abs(selBox.ex - selBox.sx),
              height: Math.abs(selBox.ey - selBox.sy),
            }}
          />
        )}

        {/* 노드 */}
        {nodes.map((n) => (
          <NodeCard
            key={n.id}
            node={n}
            isSelected={selSet.has(n.id)}
            nodeHeights={nodeHeightsRef}
            readonly={readonly}
            onMouseDown={onNodeDown}
            onPortDown={onPortDown}
            onClick={onNodeClk}
            onDblClick={onNodeDoubleClick}
          />
        ))}
      </div>

      {/* 미니맵 */}
      {showMinimap && (
        <Minimap
          nodes={nodes}
          connections={connections}
          zoom={camera.zoom}
          pan={{ x: camera.panX, y: camera.panY }}
          cw={cSize.w}
          ch={cSize.h}
          heights={nodeHeightsRef}
        />
      )}

      {/* 줌 컨트롤 — 어두운 캔버스 위라 링도 흰색이어야 보인다 */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-20">
        <button
          type="button"
          onClick={() =>
            setCamera((p) =>
              zoomAtPoint(p.zoom, { x: p.panX, y: p.panY }, cSize.w / 2, cSize.h / 2, -1),
            )
          }
          aria-label="확대"
          className={ZOOM_BTN}
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setCamera({ zoom: 1, panX: 0, panY: 0 })}
          aria-label="배율 초기화"
          className={cn(ZOOM_BTN, "text-[10px] tabular-nums")}
        >
          {Math.round(camera.zoom * 100)}%
        </button>
        <button
          type="button"
          onClick={() =>
            setCamera((p) =>
              zoomAtPoint(p.zoom, { x: p.panX, y: p.panY }, cSize.w / 2, cSize.h / 2, 1),
            )
          }
          aria-label="축소"
          className={ZOOM_BTN}
        >
          −
        </button>
        <button
          type="button"
          onClick={fitToView}
          title="전체 보기"
          aria-label="전체 보기"
          className={ZOOM_BTN}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="1" y="1" width="12" height="12" rx="2" />
            <path d="M1 5H5V1M9 1V5H13M13 9H9V13M5 13V9H1" />
          </svg>
        </button>
      </div>

      {/* 단축키 힌트 */}
      <div className="absolute bottom-4 left-4 text-[10px] text-gray-600 z-20 select-none pointer-events-none">
        {readonly
          ? "드래그: 이동 · 스크롤: 줌"
          : "드래그: 이동 · Shift+드래그: 범위선택 · 스크롤: 줌 · Delete: 삭제"}
      </div>
    </div>
  );
}
