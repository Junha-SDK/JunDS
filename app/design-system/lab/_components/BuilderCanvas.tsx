"use client";

import { type ReactNode, useCallback, useMemo } from "react";
import { cn } from "@/ds/utils/cn";
import { Renderer, type PageDoc } from "@/ds/runtime";
import { useLab } from "../_lib/store";
import { componentDefMap } from "../_lib/registry";
import { labRegistry } from "../_lib/render-registry";
import type { PropValue, TreeNode } from "../_lib/types";

import { Card } from "@/ds/composites/Card";
import { Alert } from "@/ds/composites/Alert";

const LAYOUT_IDS = new Set([
  "div",
  "section",
  "header",
  "footer",
  "main",
  "aside",
  "nav",
]);

const padMap: Record<string, string> = {
  "4": "p-1",
  "8": "p-2",
  "16": "p-4",
  "24": "p-6",
  "32": "p-8",
  "48": "p-12",
};
const gapMap: Record<string, string> = {
  "2": "gap-0.5",
  "4": "gap-1",
  "8": "gap-2",
  "12": "gap-3",
  "16": "gap-4",
  "24": "gap-6",
};
const alignMap: Record<string, string> = {
  center: "items-center",
  start: "items-start",
  end: "items-end",
  stretch: "items-stretch",
};
const justMap: Record<string, string> = {
  center: "justify-center",
  start: "justify-start",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

function layoutClassName(props: Record<string, PropValue>): string {
  const classes: string[] = [];
  if (props.display === "flex") classes.push("flex");
  if (props.display === "grid") classes.push("grid");
  if (props.flexDirection === "column") classes.push("flex-col");
  if (props.padding) classes.push(padMap[String(props.padding)] ?? "");
  if (props.gap) classes.push(gapMap[String(props.gap)] ?? "");
  if (props.alignItems)
    classes.push(alignMap[String(props.alignItems)] ?? "");
  if (props.justifyContent)
    classes.push(justMap[String(props.justifyContent)] ?? "");
  if (props.display === "grid" && props.gridCols)
    classes.push(`grid-cols-${props.gridCols}`);
  return cn(...classes.filter(Boolean));
}

function leafToPageDoc(node: TreeNode): PageDoc {
  const props: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(node.props)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      props[key] = value;
    }
  }
  return {
    schemaVersion: 1,
    id: `lab_${node.id}`,
    route: "/",
    tree: [
      {
        id: node.id,
        componentId: node.componentId,
        ...(Object.keys(props).length > 0 ? { props } : {}),
        ...(node.children ? { children: node.children } : {}),
      },
    ],
  };
}

function NodeToolbar({
  node,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: {
  node: TreeNode;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const def = componentDefMap.get(node.componentId);
  return (
    <div
      className={cn(
        "absolute -top-7 left-1/2 -translate-x-1/2 z-30",
        "flex items-center gap-0.5 px-1.5 py-0.5",
        "bg-primary text-primary-foreground rounded-md shadow-lg",
        "text-[10px] font-medium whitespace-nowrap",
      )}
    >
      <span className="px-1">{def?.label ?? node.componentId}</span>
      <span className="w-px h-3 bg-primary-foreground/30" />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onMoveUp();
        }}
        className="px-1 hover:bg-primary-foreground/20 rounded"
        title="위로 이동"
      >
        &uarr;
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onMoveDown();
        }}
        className="px-1 hover:bg-primary-foreground/20 rounded"
        title="아래로 이동"
      >
        &darr;
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        className="px-1 hover:bg-primary-foreground/20 rounded"
        title="복제"
      >
        &#x2398;
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="px-1 hover:bg-primary-foreground/20 rounded text-red-200"
        title="삭제"
      >
        &times;
      </button>
    </div>
  );
}

function RenderNode({ nodeId }: { nodeId: string }) {
  const { state, dispatch } = useLab();
  const node = state.nodes[nodeId];
  const parentId = node?.parentId;

  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch({ type: "SELECT", nodeId });
    },
    [dispatch, nodeId],
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch({ type: "HOVER", nodeId });
    },
    [dispatch, nodeId],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch({ type: "HOVER", nodeId: null });
    },
    [dispatch],
  );

  const handleMoveUp = useCallback(() => {
    const siblings = parentId ? state.nodes[parentId]?.childNodes : state.rootIds;
    if (!siblings) return;
    const idx = siblings.indexOf(nodeId);
    if (idx > 0) dispatch({ type: "MOVE_NODE", nodeId, newParentId: parentId, index: idx - 1 });
  }, [dispatch, nodeId, parentId, state.nodes, state.rootIds]);

  const handleMoveDown = useCallback(() => {
    const siblings = parentId ? state.nodes[parentId]?.childNodes : state.rootIds;
    if (!siblings) return;
    const idx = siblings.indexOf(nodeId);
    if (idx < siblings.length - 1) dispatch({ type: "MOVE_NODE", nodeId, newParentId: parentId, index: idx + 1 });
  }, [dispatch, nodeId, parentId, state.nodes, state.rootIds]);

  const handleDuplicate = useCallback(
    () => dispatch({ type: "DUPLICATE_NODE", nodeId }),
    [dispatch, nodeId],
  );
  const handleDelete = useCallback(
    () => dispatch({ type: "DELETE_NODE", nodeId }),
    [dispatch, nodeId],
  );

  const handleAddInside = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch({ type: "SELECT", nodeId });
    },
    [dispatch, nodeId],
  );

  const leafDoc = useMemo(
    () => (node ? leafToPageDoc(node) : null),
    [node],
  );

  if (!node) return null;

  const def = componentDefMap.get(node.componentId);
  const isSelected = state.selectedId === nodeId;
  const isHovered = state.hoveredId === nodeId;
  const isLayout = LAYOUT_IDS.has(node.componentId);

  const wrapperCls = cn(
    "relative group",
    isSelected && "ring-2 ring-primary rounded-sm",
    !isSelected && isHovered && "ring-1 ring-dashed ring-primary/30 rounded-sm",
  );

  function renderContainerContent(): ReactNode {
    if (node.childNodes.length === 0) {
      return (
        <div
          className={cn(
            "border-2 border-dashed border-border rounded-md",
            "flex flex-col items-center justify-center",
            "py-8 px-4 text-muted",
          )}
        >
          <p className="text-xs mb-2">컴포넌트를 추가하세요</p>
          <button
            type="button"
            onClick={handleAddInside}
            className={cn(
              "w-6 h-6 rounded-full border border-border",
              "flex items-center justify-center",
              "text-muted hover:text-foreground hover:border-primary",
              "transition-colors text-sm",
            )}
          >
            +
          </button>
        </div>
      );
    }

    return (
      <>
        {node.childNodes.map((childId) => (
          <RenderNode key={childId} nodeId={childId} />
        ))}
      </>
    );
  }

  const nameBadge = (isSelected || isHovered) && (
    <span
      className={cn(
        "absolute top-0 right-0 z-20",
        "px-1.5 py-0.5 rounded-bl-md rounded-tr-sm",
        "text-[9px] font-medium",
        isSelected
          ? "bg-primary text-primary-foreground"
          : "bg-muted/80 text-foreground",
      )}
    >
      {def?.label ?? node.componentId}
    </span>
  );

  if (isLayout) {
    const Tag = node.componentId as keyof React.JSX.IntrinsicElements;
    const lc = layoutClassName(node.props);
    const bgStyle = node.props.backgroundColor
      ? { backgroundColor: String(node.props.backgroundColor) }
      : undefined;

    return (
      <div
        className={wrapperCls}
        onClick={handleSelect}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isSelected && (
          <NodeToolbar
            node={node}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        )}
        {nameBadge}
        <Tag className={cn(lc, "min-h-[2rem]")} style={bgStyle}>
          {renderContainerContent()}
        </Tag>
      </div>
    );
  }

  if (node.componentId === "Card") {
    return (
      <div
        className={wrapperCls}
        onClick={handleSelect}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isSelected && (
          <NodeToolbar
            node={node}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        )}
        {nameBadge}
        <Card
          hoverable={!!node.props.hoverable}
          noPadding={!node.props.padding}
        >
          {renderContainerContent()}
        </Card>
      </div>
    );
  }

  if (node.componentId === "Alert") {
    return (
      <div
        className={wrapperCls}
        onClick={handleSelect}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isSelected && (
          <NodeToolbar
            node={node}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        )}
        {nameBadge}
        <Alert variant={node.props.variant as "info" | "success" | "warning" | "danger" | undefined}>
          {node.childNodes.length > 0 ? (
            node.childNodes.map((childId) => (
              <RenderNode key={childId} nodeId={childId} />
            ))
          ) : (
            <span>{node.children || "Alert message"}</span>
          )}
        </Alert>
      </div>
    );
  }

  return (
    <div
      className={wrapperCls}
      onClick={handleSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isSelected && (
        <NodeToolbar
          node={node}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      )}
      {nameBadge}
      <div className="pointer-events-none">
        {leafDoc && labRegistry.has(node.componentId) ? (
          <Renderer doc={leafDoc} registry={labRegistry} mode="design" />
        ) : (
          <div className="px-3 py-2 border border-dashed border-border rounded text-xs text-muted">
            {node.componentId}
          </div>
        )}
      </div>
    </div>
  );
}

export function BuilderCanvas() {
  const { state, dispatch } = useLab();

  const handleCanvasClick = useCallback(() => {
    dispatch({ type: "SELECT", nodeId: null });
  }, [dispatch]);

  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto min-h-screen",
        "bg-[repeating-conic-gradient(rgb(0_0_0/0.03)_0%_25%,transparent_0%_50%)]",
        "bg-[length:20px_20px] bg-background",
      )}
      onClick={handleCanvasClick}
    >
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-6 space-y-2 min-h-screen">
        {state.rootIds.length === 0 ? (
          <div
            className={cn(
              "flex flex-col items-center justify-center",
              "py-32 text-muted",
            )}
          >
            <div className="text-4xl mb-4 opacity-30">+</div>
            <p className="text-sm font-medium mb-1">캔버스가 비어 있습니다</p>
            <p className="text-xs">
              왼쪽 패널에서 컴포넌트를 클릭하여 추가하세요
            </p>
          </div>
        ) : (
          state.rootIds.map((id) => <RenderNode key={id} nodeId={id} />)
        )}
      </div>
    </div>
  );
}
