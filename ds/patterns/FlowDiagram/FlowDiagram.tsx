"use client";

import { useRef, useState, useCallback, useEffect, memo, useMemo } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

// ── Types ──────────────────────────────────────────────

export interface FlowNode {
  id: string;
  title: string;
  content?: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  /** Position on canvas */
  x: number;
  y: number;
  /** Width (auto if not set) */
  width?: number;
  /** 노드 아이콘 */
  icon?: ReactNode;
  /** 노드 그룹 (같은 그룹은 같은 배경 영역으로 표시) */
  group?: string;
  /** 여러 입력 포트 */
  inputs?: number;
  /** 여러 출력 포트 */
  outputs?: number;
}

export interface FlowConnection {
  id: string;
  from: string;
  to: string;
  /** 연결선 위에 표시할 라벨 */
  label?: string;
  /** 연결선 from의 포트 인덱스 (0부터) */
  fromPort?: number;
  /** 연결선 to의 포트 인덱스 (0부터) */
  toPort?: number;
}

export interface FlowDiagramProps {
  nodes: FlowNode[];
  connections: FlowConnection[];
  onNodeMove?: (nodeId: string, x: number, y: number) => void;
  onNodeClick?: (nodeId: string) => void;
  onConnect?: (from: string, to: string) => void;
  onDisconnect?: (connectionId: string) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  className?: string;
  /** 그리드 표시 */
  showGrid?: boolean;
  /** 미니맵 표시 */
  showMinimap?: boolean;
  /** 노드 삭제 핸들러 */
  onNodeDelete?: (nodeIds: string[]) => void;
  /** 노드 더블클릭 핸들러 */
  onNodeDoubleClick?: (nodeId: string) => void;
  /** 전체 보기 (Fit to View) */
  fitToView?: boolean;
  /** 읽기 전용 */
  readonly?: boolean;
  /** 연결선 스타일 */
  connectionStyle?: "bezier" | "straight" | "step";
  /** 연결선 애니메이션 (점선 흐르는 효과) */
  animateConnections?: boolean;
}

// ── Constants ──────────────────────────────────────────

const NODE_DEFAULT_WIDTH = 200;
const NODE_HEADER_HEIGHT = 36;
const NODE_APPROX_HEIGHT = 60;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const FIT_PADDING = 60;

// ── Variant Styles ─────────────────────────────────────

const variantBorder: Record<NonNullable<FlowNode["variant"]>, string> = {
  default: "border-gray-600",
  success: "border-green-500",
  warning: "border-amber-500",
  danger: "border-red-500",
  info: "border-blue-500",
};

const variantHeaderBg: Record<NonNullable<FlowNode["variant"]>, string> = {
  default: "bg-gray-800",
  success: "bg-green-900/50",
  warning: "bg-amber-900/50",
  danger: "bg-red-900/50",
  info: "bg-blue-900/50",
};

const variantHeaderText: Record<NonNullable<FlowNode["variant"]>, string> = {
  default: "text-gray-200",
  success: "text-green-300",
  warning: "text-amber-300",
  danger: "text-red-300",
  info: "text-blue-300",
};

// ── Group Colors ──────────────────────────────────────

const groupColors = [
  { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.35)", text: "#93c5fd" },
  { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.35)", text: "#6ee7b7" },
  { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.35)", text: "#fcd34d" },
  { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.35)", text: "#fca5a5" },
  { bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.35)", text: "#c4b5fd" },
];

// ── Grid Background ────────────────────────────────────

function GridBackground({
  zoom,
  pan,
}: {
  zoom: number;
  pan: { x: number; y: number };
}) {
  const size = 24 * zoom;
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: `${pan.x % size}px ${pan.y % size}px`,
      }}
    />
  );
}

// ── SVG Connection Path ────────────────────────────────

function ConnectionPath({
  from,
  to,
  selected,
  onClick,
  style: pathStyle = "bezier",
  animate = false,
  label,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  selected?: boolean;
  onClick?: () => void;
  style?: "bezier" | "straight" | "step";
  animate?: boolean;
  label?: string;
}) {
  let d: string;
  let midX: number;
  let midY: number;

  if (pathStyle === "straight") {
    d = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
    midX = (from.x + to.x) / 2;
    midY = (from.y + to.y) / 2;
  } else if (pathStyle === "step") {
    const mx = (from.x + to.x) / 2;
    d = `M ${from.x} ${from.y} L ${mx} ${from.y} L ${mx} ${to.y} L ${to.x} ${to.y}`;
    midX = mx;
    midY = (from.y + to.y) / 2;
  } else {
    // bezier
    const dx = Math.abs(to.x - from.x) * 0.5;
    d = `M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`;
    midX = (from.x + to.x) / 2;
    midY = (from.y + to.y) / 2;
  }

  return (
    <g>
      {/* Invisible wider path for easier clicking */}
      <path
        d={d}
        stroke="transparent"
        strokeWidth={12}
        fill="none"
        className="cursor-pointer"
        style={{ pointerEvents: "stroke" }}
        onClick={onClick}
      />
      <path
        d={d}
        stroke={selected ? "#3b82f6" : "#6b7280"}
        strokeWidth={selected ? 3 : 2}
        fill="none"
        className="transition-colors"
        strokeLinecap="round"
        style={{ pointerEvents: "none" }}
        {...(animate
          ? {
              strokeDasharray: "6 4",
              strokeDashoffset: 0,
            }
          : {})}
      >
        {animate && (
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-20"
            dur="1s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Connection label */}
      {label && (
        <>
          <rect
            x={midX - label.length * 3.5 - 6}
            y={midY - 10}
            width={label.length * 7 + 12}
            height={20}
            rx={10}
            fill="#1f2937"
            stroke="#4b5563"
            strokeWidth={1}
          />
          <text
            x={midX}
            y={midY + 4}
            textAnchor="middle"
            fill="#d1d5db"
            fontSize={11}
            fontFamily="sans-serif"
            style={{ pointerEvents: "none" }}
          >
            {label}
          </text>
        </>
      )}
    </g>
  );
}

// ── Port Component ─────────────────────────────────────

function Port({
  side,
  index,
  total,
  onMouseDown,
  disabled,
}: {
  side: "input" | "output";
  index: number;
  total: number;
  onMouseDown: (e: React.MouseEvent) => void;
  disabled?: boolean;
}) {
  // Distribute ports vertically
  const spacing = total > 1 ? 100 / (total + 1) : 50;
  const topPercent = spacing * (index + 1);

  return (
    <div
      onMouseDown={(e) => {
        if (disabled) return;
        e.stopPropagation();
        onMouseDown(e);
      }}
      className={cn(
        "absolute w-3 h-3 rounded-full border-2 border-white bg-blue-500 z-10 transition-transform",
        disabled ? "cursor-default opacity-50" : "cursor-crosshair hover:scale-125",
        side === "input" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"
      )}
      style={{
        top: `${topPercent}%`,
        transform: `${side === "input" ? "translateX(-50%)" : "translateX(50%)"} translateY(-50%)`,
      }}
    />
  );
}

// ── Node Component ─────────────────────────────────────

interface FlowNodeCardProps {
  node: FlowNode;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onPortMouseDown: (
    nodeId: string,
    side: "input" | "output",
    portIndex: number,
    e: React.MouseEvent
  ) => void;
  onNodeClick: (nodeId: string) => void;
  onDoubleClick?: (nodeId: string) => void;
  readonly?: boolean;
}

const FlowNodeCard = memo(function FlowNodeCard({
  node,
  isSelected,
  onMouseDown,
  onPortMouseDown,
  onNodeClick,
  onDoubleClick,
  readonly,
}: FlowNodeCardProps) {
  const variant = node.variant ?? "default";
  const w = node.width ?? NODE_DEFAULT_WIDTH;
  const inputCount = node.inputs ?? 1;
  const outputCount = node.outputs ?? 1;

  return (
    <div
      className={cn(
        "absolute select-none rounded-xl border-2 bg-gray-900 text-white overflow-visible transition-shadow duration-150",
        variantBorder[variant],
        isSelected && "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-950"
      )}
      style={{
        left: node.x,
        top: node.y,
        width: w,
        minWidth: 180,
        maxWidth: 280,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        cursor: readonly ? "default" : "grab",
      }}
      onMouseDown={(e) => {
        if (readonly) return;
        if (e.button === 0) {
          onMouseDown(e);
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick(node.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick?.(node.id);
      }}
    >
      {/* Input ports (left) */}
      {Array.from({ length: inputCount }, (_, i) => (
        <Port
          key={`in-${i}`}
          side="input"
          index={i}
          total={inputCount}
          disabled={readonly}
          onMouseDown={(e) => onPortMouseDown(node.id, "input", i, e)}
        />
      ))}

      {/* Output ports (right) */}
      {Array.from({ length: outputCount }, (_, i) => (
        <Port
          key={`out-${i}`}
          side="output"
          index={i}
          total={outputCount}
          disabled={readonly}
          onMouseDown={(e) => onPortMouseDown(node.id, "output", i, e)}
        />
      ))}

      {/* Header */}
      <div
        className={cn(
          "px-3 py-2 font-bold text-sm border-b rounded-t-[10px] flex items-center gap-2",
          variantBorder[variant],
          variantHeaderBg[variant],
          variantHeaderText[variant]
        )}
      >
        {node.icon && <span className="flex-shrink-0">{node.icon}</span>}
        {node.title}
      </div>

      {/* Content */}
      {node.content && (
        <div className="px-3 py-2 text-xs text-gray-400">{node.content}</div>
      )}
    </div>
  );
});

// ── Group Overlay ──────────────────────────────────────

function GroupOverlay({
  groupName,
  nodes,
  colorIndex,
}: {
  groupName: string;
  nodes: FlowNode[];
  colorIndex: number;
}) {
  if (nodes.length === 0) return null;

  const color = groupColors[colorIndex % groupColors.length];
  const PAD = 24;

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const n of nodes) {
    const w = n.width ?? NODE_DEFAULT_WIDTH;
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x + w > maxX) maxX = n.x + w;
    if (n.y + NODE_APPROX_HEIGHT > maxY) maxY = n.y + NODE_APPROX_HEIGHT;
  }

  return (
    <div
      className="absolute rounded-xl pointer-events-none"
      style={{
        left: minX - PAD,
        top: minY - PAD - 20,
        width: maxX - minX + PAD * 2,
        height: maxY - minY + PAD * 2 + 20,
        background: color.bg,
        border: `2px dashed ${color.border}`,
      }}
    >
      <div
        className="absolute top-1 left-3 text-xs font-semibold"
        style={{ color: color.text }}
      >
        {groupName}
      </div>
    </div>
  );
}

// ── Minimap ────────────────────────────────────────────

function Minimap({
  nodes,
  connections,
  zoom,
  pan,
  containerWidth,
  containerHeight,
}: {
  nodes: FlowNode[];
  connections: FlowConnection[];
  zoom: number;
  pan: { x: number; y: number };
  containerWidth: number;
  containerHeight: number;
}) {
  if (nodes.length === 0) return null;

  const MINIMAP_W = 160;
  const MINIMAP_H = 100;
  const PADDING = 20;

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const n of nodes) {
    const w = n.width ?? NODE_DEFAULT_WIDTH;
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x + w > maxX) maxX = n.x + w;
    if (n.y + 60 > maxY) maxY = n.y + 60;
  }
  minX -= PADDING;
  minY -= PADDING;
  maxX += PADDING;
  maxY += PADDING;

  const worldW = maxX - minX || 1;
  const worldH = maxY - minY || 1;
  const scale = Math.min(MINIMAP_W / worldW, MINIMAP_H / worldH);

  const vpX = -pan.x / zoom;
  const vpY = -pan.y / zoom;
  const vpW = containerWidth / zoom;
  const vpH = containerHeight / zoom;

  return (
    <div
      className="absolute top-4 right-4 z-20 rounded-lg border border-gray-700 bg-gray-900/80 backdrop-blur-sm overflow-hidden"
      style={{ width: MINIMAP_W, height: MINIMAP_H }}
    >
      <svg width={MINIMAP_W} height={MINIMAP_H}>
        {connections.map((conn) => {
          const fromNode = nodes.find((n) => n.id === conn.from);
          const toNode = nodes.find((n) => n.id === conn.to);
          if (!fromNode || !toNode) return null;
          const fw = fromNode.width ?? NODE_DEFAULT_WIDTH;
          const x1 = (fromNode.x + fw - minX) * scale;
          const y1 = (fromNode.y + NODE_HEADER_HEIGHT / 2 - minY) * scale;
          const x2 = (toNode.x - minX) * scale;
          const y2 = (toNode.y + NODE_HEADER_HEIGHT / 2 - minY) * scale;
          return (
            <line
              key={conn.id}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#6b7280"
              strokeWidth={1}
            />
          );
        })}
        {nodes.map((n) => {
          const w = n.width ?? NODE_DEFAULT_WIDTH;
          return (
            <rect
              key={n.id}
              x={(n.x - minX) * scale}
              y={(n.y - minY) * scale}
              width={w * scale}
              height={40 * scale}
              rx={2}
              fill="#374151"
              stroke="#6b7280"
              strokeWidth={0.5}
            />
          );
        })}
        <rect
          x={(vpX - minX) * scale}
          y={(vpY - minY) * scale}
          width={vpW * scale}
          height={vpH * scale}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={1.5}
          rx={1}
        />
      </svg>
    </div>
  );
}

// ── Main FlowDiagram ───────────────────────────────────

export function FlowDiagram({
  nodes,
  connections,
  onNodeMove,
  onNodeClick,
  onConnect,
  onDisconnect,
  selectedIds,
  onSelectionChange,
  className,
  showGrid = true,
  showMinimap = false,
  onNodeDelete,
  onNodeDoubleClick,
  fitToView: fitToViewProp = false,
  readonly = false,
  connectionStyle = "bezier",
  animateConnections = false,
}: FlowDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  // Interaction state
  const [dragging, setDragging] = useState<{
    nodeId: string;
    startMouseX: number;
    startMouseY: number;
    startPositions: Map<string, { x: number; y: number }>;
    didMove: boolean;
  } | null>(null);

  const [selecting, setSelecting] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  const [connecting, setConnecting] = useState<{
    fromId: string;
    side: "input" | "output";
    portIndex: number;
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const [panning, setPanning] = useState<{
    startMouseX: number;
    startMouseY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);

  const [internalSelected, setInternalSelected] = useState<Set<string>>(
    new Set()
  );
  const [selectedConnection, setSelectedConnection] = useState<string | null>(
    null
  );

  const spaceDownRef = useRef(false);

  const selectedSet = new Set(
    selectedIds ?? Array.from(internalSelected)
  );

  const updateSelection = useCallback(
    (ids: string[]) => {
      const newSet = new Set(ids);
      setInternalSelected(newSet);
      onSelectionChange?.(ids);
    },
    [onSelectionChange]
  );

  // Convert screen coords to canvas coords
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (screenX - rect.left - pan.x) / zoom,
        y: (screenY - rect.top - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  // ── Fit to View ──
  const performFitToView = useCallback(() => {
    if (nodes.length === 0 || containerSize.w === 0) return;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const n of nodes) {
      const w = n.width ?? NODE_DEFAULT_WIDTH;
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x + w > maxX) maxX = n.x + w;
      if (n.y + NODE_APPROX_HEIGHT > maxY) maxY = n.y + NODE_APPROX_HEIGHT;
    }

    const worldW = maxX - minX;
    const worldH = maxY - minY;
    if (worldW <= 0 || worldH <= 0) return;

    const availW = containerSize.w - FIT_PADDING * 2;
    const availH = containerSize.h - FIT_PADDING * 2;
    const newZoom = Math.min(
      MAX_ZOOM,
      Math.max(MIN_ZOOM, Math.min(availW / worldW, availH / worldH))
    );

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const newPanX = containerSize.w / 2 - centerX * newZoom;
    const newPanY = containerSize.h / 2 - centerY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [nodes, containerSize]);

  // ── Compute groups ──
  const groupMap = useMemo(() => {
    const map = new Map<string, FlowNode[]>();
    for (const node of nodes) {
      if (node.group) {
        const arr = map.get(node.group) ?? [];
        arr.push(node);
        map.set(node.group, arr);
      }
    }
    return map;
  }, [nodes]);

  // ── Observe container size ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Auto fit to view when prop is true ──
  useEffect(() => {
    if (fitToViewProp && containerSize.w > 0) {
      performFitToView();
    }
  }, [fitToViewProp, containerSize.w, containerSize.h]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Wheel zoom ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const factor = e.deltaY > 0 ? 0.9 : 1.1;

      setZoom((prevZoom) => {
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prevZoom * factor));
        const ratio = newZoom / prevZoom;
        setPan((prevPan) => ({
          x: mouseX - ratio * (mouseX - prevPan.x),
          y: mouseY - ratio * (mouseY - prevPan.y),
        }));
        return newZoom;
      });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  // ── Keyboard: shift, space, delete ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        spaceDownRef.current = true;
      }
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        // Delete selected connection
        if (selectedConnection && onDisconnect) {
          onDisconnect(selectedConnection);
          setSelectedConnection(null);
        }
        // Delete selected nodes
        const selectedArr = Array.from(
          selectedIds ? new Set(selectedIds) : internalSelected
        );
        if (selectedArr.length > 0 && onNodeDelete) {
          onNodeDelete(selectedArr);
        }
      }
      if (e.key === "Escape") {
        setConnecting(null);
        setSelecting(null);
        setSelectedConnection(null);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") {
        spaceDownRef.current = false;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedConnection, onDisconnect, onNodeDelete, selectedIds, internalSelected]);

  // ── Mouse move (global while dragging/selecting/connecting/panning) ──
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (panning) {
        setPan({
          x: panning.startPanX + (e.clientX - panning.startMouseX),
          y: panning.startPanY + (e.clientY - panning.startMouseY),
        });
        return;
      }

      if (dragging) {
        const dx = (e.clientX - dragging.startMouseX) / zoom;
        const dy = (e.clientY - dragging.startMouseY) / zoom;

        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          setDragging((prev) => (prev ? { ...prev, didMove: true } : prev));
        }

        const nodesToMove = selectedSet.has(dragging.nodeId)
          ? Array.from(selectedSet)
          : [dragging.nodeId];

        for (const nid of nodesToMove) {
          const startPos = dragging.startPositions.get(nid);
          if (startPos && onNodeMove) {
            onNodeMove(nid, startPos.x + dx, startPos.y + dy);
          }
        }
        return;
      }

      if (selecting) {
        const canvas = screenToCanvas(e.clientX, e.clientY);
        setSelecting((prev) =>
          prev ? { ...prev, endX: canvas.x, endY: canvas.y } : prev
        );
        return;
      }

      if (connecting) {
        const canvas = screenToCanvas(e.clientX, e.clientY);
        setConnecting((prev) =>
          prev ? { ...prev, mouseX: canvas.x, mouseY: canvas.y } : prev
        );
        return;
      }
    };

    const handleMouseUp = () => {
      if (panning) {
        setPanning(null);
        return;
      }

      if (dragging) {
        setDragging(null);
        return;
      }

      if (selecting) {
        const { startX, startY, endX, endY } = selecting;
        const left = Math.min(startX, endX);
        const right = Math.max(startX, endX);
        const top = Math.min(startY, endY);
        const bottom = Math.max(startY, endY);

        const hits: string[] = [];
        for (const node of nodes) {
          const nw = node.width ?? NODE_DEFAULT_WIDTH;
          const nh = NODE_APPROX_HEIGHT;
          if (
            node.x + nw > left &&
            node.x < right &&
            node.y + nh > top &&
            node.y < bottom
          ) {
            hits.push(node.id);
          }
        }
        updateSelection(hits);
        setSelecting(null);
        return;
      }

      if (connecting) {
        setConnecting(null);
        return;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    dragging,
    selecting,
    connecting,
    panning,
    zoom,
    nodes,
    selectedSet,
    onNodeMove,
    screenToCanvas,
    updateSelection,
  ]);

  // ── Canvas mouse down ──
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0 && e.button !== 1) return;

      if (e.button === 1) {
        e.preventDefault();
        setPanning({
          startMouseX: e.clientX,
          startMouseY: e.clientY,
          startPanX: pan.x,
          startPanY: pan.y,
        });
        return;
      }

      if (spaceDownRef.current) {
        setPanning({
          startMouseX: e.clientX,
          startMouseY: e.clientY,
          startPanX: pan.x,
          startPanY: pan.y,
        });
        return;
      }

      if (e.shiftKey && !readonly) {
        const canvas = screenToCanvas(e.clientX, e.clientY);
        setSelecting({
          startX: canvas.x,
          startY: canvas.y,
          endX: canvas.x,
          endY: canvas.y,
        });
        return;
      }

      updateSelection([]);
      setSelectedConnection(null);
    },
    [pan, screenToCanvas, updateSelection, readonly]
  );

  // ── Node mouse down (drag) ──
  const handleNodeMouseDown = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (e.button !== 0 || readonly) return;

      if (e.shiftKey) {
        const newSelected = new Set(selectedSet);
        if (newSelected.has(nodeId)) {
          newSelected.delete(nodeId);
        } else {
          newSelected.add(nodeId);
        }
        updateSelection(Array.from(newSelected));
        return;
      }

      if (!selectedSet.has(nodeId)) {
        updateSelection([nodeId]);
      }

      const willMove = selectedSet.has(nodeId)
        ? Array.from(selectedSet)
        : [nodeId];
      const startPositions = new Map<string, { x: number; y: number }>();
      for (const nid of willMove) {
        const n = nodes.find((nd) => nd.id === nid);
        if (n) startPositions.set(nid, { x: n.x, y: n.y });
      }
      const draggedNode = nodes.find((n) => n.id === nodeId);
      if (draggedNode && !startPositions.has(nodeId)) {
        startPositions.set(nodeId, { x: draggedNode.x, y: draggedNode.y });
      }

      setDragging({
        nodeId,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startPositions,
        didMove: false,
      });
    },
    [nodes, selectedSet, updateSelection, readonly]
  );

  // ── Node click ──
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (dragging?.didMove) return;
      onNodeClick?.(nodeId);
    },
    [dragging, onNodeClick]
  );

  // ── Port mouse down (connection) ──
  const handlePortMouseDown = useCallback(
    (nodeId: string, side: "input" | "output", portIndex: number, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (readonly) return;

      if (connecting) {
        if (connecting.fromId !== nodeId) {
          const from =
            connecting.side === "output" ? connecting.fromId : nodeId;
          const to = connecting.side === "output" ? nodeId : connecting.fromId;
          onConnect?.(from, to);
        }
        setConnecting(null);
        return;
      }

      const canvas = screenToCanvas(e.clientX, e.clientY);
      setConnecting({
        fromId: nodeId,
        side,
        portIndex,
        mouseX: canvas.x,
        mouseY: canvas.y,
      });
    },
    [connecting, onConnect, screenToCanvas, readonly]
  );

  // ── Get port position in canvas coords ──
  const getPortPos = useCallback(
    (nodeId: string, side: "input" | "output", portIndex: number = 0) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return { x: 0, y: 0 };
      const w = node.width ?? NODE_DEFAULT_WIDTH;
      const totalPorts = side === "input" ? (node.inputs ?? 1) : (node.outputs ?? 1);
      const nodeHeight = NODE_APPROX_HEIGHT;
      const spacing = totalPorts > 1 ? nodeHeight / (totalPorts + 1) : nodeHeight / 2;
      const y = node.y + spacing * (portIndex + 1);

      if (side === "output") {
        return { x: node.x + w, y };
      }
      return { x: node.x, y };
    },
    [nodes]
  );

  // ── Connection click ──
  const handleConnectionClick = useCallback(
    (connId: string) => {
      setSelectedConnection(connId);
    },
    []
  );

  // ── Selection rect style ──
  const selectionRectStyle = selecting
    ? {
        left: Math.min(selecting.startX, selecting.endX),
        top: Math.min(selecting.startY, selecting.endY),
        width: Math.abs(selecting.endX - selecting.startX),
        height: Math.abs(selecting.endY - selecting.startY),
      }
    : undefined;

  const connectingFromPos = connecting
    ? getPortPos(connecting.fromId, connecting.side, connecting.portIndex)
    : null;

  const isPanning = panning !== null;
  const isDragging = dragging !== null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-gray-950 w-full h-full",
        className
      )}
      style={{
        cursor: isPanning
          ? "grabbing"
          : spaceDownRef.current
            ? "grab"
            : isDragging
              ? "grabbing"
              : "default",
        minHeight: 400,
      }}
      onMouseDown={handleCanvasMouseDown}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Grid background */}
      {showGrid && <GridBackground zoom={zoom} pan={pan} />}

      {/* Zoom/Pan transform wrapper */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          position: "absolute",
          top: 0,
          left: 0,
          width: 0,
          height: 0,
        }}
      >
        {/* Group overlays (render behind nodes) */}
        {Array.from(groupMap.entries()).map(([groupName, groupNodes], i) => (
          <GroupOverlay
            key={groupName}
            groupName={groupName}
            nodes={groupNodes}
            colorIndex={i}
          />
        ))}

        {/* SVG layer for connections */}
        <svg
          className="absolute"
          style={{
            overflow: "visible",
            top: 0,
            left: 0,
            width: 1,
            height: 1,
            pointerEvents: "none",
          }}
        >
          <g style={{ pointerEvents: "auto" }}>
            {connections.map((conn) => {
              const fromPos = getPortPos(conn.from, "output", conn.fromPort ?? 0);
              const toPos = getPortPos(conn.to, "input", conn.toPort ?? 0);
              return (
                <ConnectionPath
                  key={conn.id}
                  from={fromPos}
                  to={toPos}
                  selected={selectedConnection === conn.id}
                  onClick={() => handleConnectionClick(conn.id)}
                  style={connectionStyle}
                  animate={animateConnections}
                  label={conn.label}
                />
              );
            })}
          </g>

          {/* Temporary connection line while dragging from port */}
          {connecting && connectingFromPos && (
            <ConnectionPath
              from={connectingFromPos}
              to={{ x: connecting.mouseX, y: connecting.mouseY }}
              style={connectionStyle}
            />
          )}
        </svg>

        {/* Selection rectangle */}
        {selecting && selectionRectStyle && (
          <div
            className="absolute border-2 border-dashed border-pink-500 bg-pink-500/10 rounded-lg pointer-events-none"
            style={selectionRectStyle}
          />
        )}

        {/* Nodes */}
        {nodes.map((node) => (
          <FlowNodeCard
            key={node.id}
            node={node}
            isSelected={selectedSet.has(node.id)}
            onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
            onPortMouseDown={handlePortMouseDown}
            onNodeClick={handleNodeClick}
            onDoubleClick={onNodeDoubleClick}
            readonly={readonly}
          />
        ))}
      </div>

      {/* Minimap */}
      {showMinimap && (
        <Minimap
          nodes={nodes}
          connections={connections}
          zoom={zoom}
          pan={pan}
          containerWidth={containerSize.w}
          containerHeight={containerSize.h}
        />
      )}

      {/* Zoom controls (bottom-right) */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-20">
        <button
          type="button"
          onClick={() =>
            setZoom((z) => Math.min(MAX_ZOOM, z * 1.2))
          }
          className="w-8 h-8 rounded-lg bg-gray-800 text-white flex items-center justify-center text-sm hover:bg-gray-700 transition-colors"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          className="w-8 h-8 rounded-lg bg-gray-800 text-white flex items-center justify-center text-[10px] hover:bg-gray-700 transition-colors"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          onClick={() =>
            setZoom((z) => Math.max(MIN_ZOOM, z * 0.8))
          }
          className="w-8 h-8 rounded-lg bg-gray-800 text-white flex items-center justify-center text-sm hover:bg-gray-700 transition-colors"
        >
          -
        </button>
        {/* Fit to View button */}
        <button
          type="button"
          onClick={performFitToView}
          className="w-8 h-8 rounded-lg bg-gray-800 text-white flex items-center justify-center text-[10px] hover:bg-gray-700 transition-colors"
          title="Fit to View"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="12" height="12" rx="2" />
            <path d="M1 5H5V1M9 1V5H13M13 9H9V13M5 13V9H1" />
          </svg>
        </button>
      </div>

      {/* Selection hint */}
      <div className="absolute bottom-4 left-4 text-[10px] text-gray-500 z-20 select-none">
        {readonly
          ? "Scroll: Zoom | Middle-click / Space+Drag: Pan"
          : "Shift+Drag: Select | Scroll: Zoom | Middle-click / Space+Drag: Pan | Delete: Remove"}
      </div>
    </div>
  );
}
