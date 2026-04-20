"use client";

import { useRef, useState, useCallback, useEffect, memo } from "react";
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
}

export interface FlowConnection {
  id: string;
  from: string;
  to: string;
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
}

// ── Constants ──────────────────────────────────────────

const NODE_DEFAULT_WIDTH = 200;
const NODE_HEADER_HEIGHT = 36;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;

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
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  selected?: boolean;
  onClick?: () => void;
}) {
  const dx = Math.abs(to.x - from.x) * 0.5;
  const d = `M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`;
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
      />
    </g>
  );
}

// ── Port Component ─────────────────────────────────────

function Port({
  side,
  onMouseDown,
}: {
  side: "input" | "output";
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(e);
      }}
      className={cn(
        "absolute w-3 h-3 rounded-full border-2 border-white bg-blue-500 cursor-crosshair z-10 hover:scale-125 transition-transform",
        side === "input"
          ? "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"
          : "right-0 top-1/2 translate-x-1/2 -translate-y-1/2"
      )}
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
    e: React.MouseEvent
  ) => void;
  onNodeClick: (nodeId: string) => void;
}

const FlowNodeCard = memo(function FlowNodeCard({
  node,
  isSelected,
  onMouseDown,
  onPortMouseDown,
  onNodeClick,
}: FlowNodeCardProps) {
  const variant = node.variant ?? "default";
  const w = node.width ?? NODE_DEFAULT_WIDTH;

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
        cursor: "grab",
      }}
      onMouseDown={(e) => {
        if (e.button === 0) {
          onMouseDown(e);
        }
      }}
      onClick={(e) => {
        // Only fire click if no significant drag happened (handled by parent)
        e.stopPropagation();
        onNodeClick(node.id);
      }}
    >
      {/* Input port (left) */}
      <Port
        side="input"
        onMouseDown={(e) => onPortMouseDown(node.id, "input", e)}
      />

      {/* Output port (right) */}
      <Port
        side="output"
        onMouseDown={(e) => onPortMouseDown(node.id, "output", e)}
      />

      {/* Header */}
      <div
        className={cn(
          "px-3 py-2 font-bold text-sm border-b rounded-t-[10px]",
          variantBorder[variant],
          variantHeaderBg[variant],
          variantHeaderText[variant]
        )}
      >
        {node.title}
      </div>

      {/* Content */}
      {node.content && (
        <div className="px-3 py-2 text-xs text-gray-400">{node.content}</div>
      )}
    </div>
  );
});

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

  // Compute bounding box of all nodes
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

  // Viewport rectangle in world coords
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
        {/* Connections */}
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
        {/* Nodes */}
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
        {/* Viewport */}
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

  // Selected IDs: external if provided, otherwise internal
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
        // Zoom toward mouse position
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
        !e.target?.toString().includes("Input")
      ) {
        // Delete selected connection
        if (selectedConnection && onDisconnect) {
          onDisconnect(selectedConnection);
          setSelectedConnection(null);
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
  }, [selectedConnection, onDisconnect]);

  // ── Mouse move (global while dragging/selecting/connecting/panning) ──
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Panning
      if (panning) {
        setPan({
          x: panning.startPanX + (e.clientX - panning.startMouseX),
          y: panning.startPanY + (e.clientY - panning.startMouseY),
        });
        return;
      }

      // Node drag
      if (dragging) {
        const dx = (e.clientX - dragging.startMouseX) / zoom;
        const dy = (e.clientY - dragging.startMouseY) / zoom;

        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          setDragging((prev) => (prev ? { ...prev, didMove: true } : prev));
        }

        // Move all selected nodes (or just the dragged one)
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

      // Selection rectangle
      if (selecting) {
        const canvas = screenToCanvas(e.clientX, e.clientY);
        setSelecting((prev) =>
          prev ? { ...prev, endX: canvas.x, endY: canvas.y } : prev
        );
        return;
      }

      // Connection dragging
      if (connecting) {
        const canvas = screenToCanvas(e.clientX, e.clientY);
        setConnecting((prev) =>
          prev ? { ...prev, mouseX: canvas.x, mouseY: canvas.y } : prev
        );
        return;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Finalize panning
      if (panning) {
        setPanning(null);
        return;
      }

      // Finalize node drag
      if (dragging) {
        setDragging(null);
        return;
      }

      // Finalize selection rectangle
      if (selecting) {
        const { startX, startY, endX, endY } = selecting;
        const left = Math.min(startX, endX);
        const right = Math.max(startX, endX);
        const top = Math.min(startY, endY);
        const bottom = Math.max(startY, endY);

        const hits: string[] = [];
        for (const node of nodes) {
          const nw = node.width ?? NODE_DEFAULT_WIDTH;
          const nh = 60; // approx node height
          // Check intersection
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

      // Finalize connection
      if (connecting) {
        setConnecting(null);
        // Connection is finalized in the port mouseDown handler
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
      // Only handle left button
      if (e.button !== 0 && e.button !== 1) return;

      // Middle click = pan
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

      // Space + left click = pan
      if (spaceDownRef.current) {
        setPanning({
          startMouseX: e.clientX,
          startMouseY: e.clientY,
          startPanX: pan.x,
          startPanY: pan.y,
        });
        return;
      }

      // Shift + left click on empty canvas = selection rect
      if (e.shiftKey) {
        const canvas = screenToCanvas(e.clientX, e.clientY);
        setSelecting({
          startX: canvas.x,
          startY: canvas.y,
          endX: canvas.x,
          endY: canvas.y,
        });
        return;
      }

      // Click on empty canvas = clear selection
      updateSelection([]);
      setSelectedConnection(null);
    },
    [pan, screenToCanvas, updateSelection]
  );

  // ── Node mouse down (drag) ──
  const handleNodeMouseDown = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (e.button !== 0) return;

      // If shift-clicking a node, toggle selection
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

      // If node is not selected, select only it (unless it's already in a group selection)
      if (!selectedSet.has(nodeId)) {
        updateSelection([nodeId]);
      }

      // Gather start positions for all nodes that will move
      const willMove = selectedSet.has(nodeId)
        ? Array.from(selectedSet)
        : [nodeId];
      const startPositions = new Map<string, { x: number; y: number }>();
      for (const nid of willMove) {
        const n = nodes.find((nd) => nd.id === nid);
        if (n) startPositions.set(nid, { x: n.x, y: n.y });
      }
      // Also include the dragged node
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
    [nodes, selectedSet, updateSelection]
  );

  // ── Node click ──
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      // Only fire click if no drag happened
      if (dragging?.didMove) return;
      onNodeClick?.(nodeId);
    },
    [dragging, onNodeClick]
  );

  // ── Port mouse down (connection) ──
  const handlePortMouseDown = useCallback(
    (nodeId: string, side: "input" | "output", e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      // If there's already a connection being made, complete it
      if (connecting) {
        if (connecting.fromId !== nodeId) {
          // Determine direction: output -> input
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
        mouseX: canvas.x,
        mouseY: canvas.y,
      });
    },
    [connecting, onConnect, screenToCanvas]
  );

  // ── Get port position in canvas coords ──
  const getPortPos = useCallback(
    (nodeId: string, side: "input" | "output") => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return { x: 0, y: 0 };
      const w = node.width ?? NODE_DEFAULT_WIDTH;
      if (side === "output") {
        return { x: node.x + w, y: node.y + NODE_HEADER_HEIGHT / 2 + 10 };
      }
      return { x: node.x, y: node.y + NODE_HEADER_HEIGHT / 2 + 10 };
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

  // Get connection "from" port position for the connecting line
  const connectingFromPos = connecting
    ? getPortPos(connecting.fromId, connecting.side)
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
              const fromPos = getPortPos(conn.from, "output");
              const toPos = getPortPos(conn.to, "input");
              return (
                <ConnectionPath
                  key={conn.id}
                  from={fromPos}
                  to={toPos}
                  selected={selectedConnection === conn.id}
                  onClick={() => handleConnectionClick(conn.id)}
                />
              );
            })}
          </g>

          {/* Temporary connection line while dragging from port */}
          {connecting && connectingFromPos && (
            <ConnectionPath
              from={connectingFromPos}
              to={{ x: connecting.mouseX, y: connecting.mouseY }}
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
      </div>

      {/* Selection hint */}
      <div className="absolute bottom-4 left-4 text-[10px] text-gray-500 z-20 select-none">
        Shift+Drag: Select | Scroll: Zoom | Middle-click / Space+Drag: Pan
      </div>
    </div>
  );
}
