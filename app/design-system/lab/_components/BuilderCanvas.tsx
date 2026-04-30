"use client";

import { type ReactNode, useCallback, useState } from "react";
import { cn } from "@/ds/utils/cn";
import { useLab } from "../_lib/store";
import { componentDefMap } from "../_lib/registry";
import type { PropValue, TreeNode } from "../_lib/types";

// ── DS component imports ──────────────────────────────────────────────
import { Button } from "@/ds/primitives/Button";
import { Input } from "@/ds/primitives/Input";
import { Textarea } from "@/ds/primitives/Textarea";
import { Badge } from "@/ds/primitives/Badge";
import { Avatar } from "@/ds/primitives/Avatar";
import { Spinner } from "@/ds/primitives/Spinner";
import { Divider } from "@/ds/primitives/Divider";
import { Toggle } from "@/ds/primitives/Toggle";
import { Checkbox } from "@/ds/primitives/Checkbox";
import { Switch } from "@/ds/primitives/Switch";
import { StarRating } from "@/ds/primitives/StarRating";
import { Tag as DsTag } from "@/ds/primitives/Tag";
import { Label } from "@/ds/primitives/Label";
import { IconButton } from "@/ds/primitives/IconButton";
import { Kbd } from "@/ds/primitives/Kbd";
import { StatusDot } from "@/ds/primitives/StatusDot";
import { Slider } from "@/ds/primitives/Slider";
import { Card } from "@/ds/composites/Card";
import { Alert } from "@/ds/composites/Alert";
import { Skeleton } from "@/ds/composites/Skeleton";
import { ProgressBar } from "@/ds/composites/Progress";
import { EmptyState } from "@/ds/composites/EmptyState";
import { StatCard } from "@/ds/composites/StatCard";
import { SegmentedControl } from "@/ds/composites/SegmentedControl";
import { Stepper } from "@/ds/composites/Stepper";
import { Result } from "@/ds/composites/Result";

// ── Layout tags ───────────────────────────────────────────────────────
const LAYOUT_IDS = new Set([
  "div",
  "section",
  "header",
  "footer",
  "main",
  "aside",
  "nav",
]);

// ── Layout className generation ───────────────────────────────────────
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

// ── Leaf component renderer ───────────────────────────────────────────
function renderLeaf(
  node: TreeNode,
  _def: NonNullable<ReturnType<typeof componentDefMap.get>>,
): ReactNode {
  const p = node.props;
  const text = node.children ?? "";

  switch (node.componentId) {
    case "Button":
      return (
        <Button
          variant={p.variant as any}
          size={p.size as any}
          disabled={!!p.disabled}
          fullWidth={!!p.fullWidth}
        >
          {text || "Button"}
        </Button>
      );
    case "Input":
      return (
        <Input
          placeholder={(p.placeholder as string) || "입력..."}
          size={p.size as any}
          disabled={!!p.disabled}
          readOnly
        />
      );
    case "Textarea":
      return (
        <Textarea
          placeholder={(p.placeholder as string) || "입력..."}
          rows={(p.rows as number) || 3}
          disabled={!!p.disabled}
          readOnly
        />
      );
    case "Label":
      return <Label required={!!p.required}>{text || "Label"}</Label>;
    case "Badge":
      return (
        <Badge variant={p.variant as any} size={p.size as any}>
          {text || "Badge"}
        </Badge>
      );
    case "Avatar":
      return <Avatar size={p.size as any} />;
    case "Spinner":
      return <Spinner size={p.size as any} />;
    case "Divider":
      return <Divider />;
    case "Tag":
      return <DsTag color={p.color as any}>{text || "Tag"}</DsTag>;
    case "Toggle":
      return (
        <Toggle
          size={p.size as any}
          label={(p.label as string) || undefined}
          checked={false}
          onChange={() => {}}
        />
      );
    case "Checkbox":
      return (
        <Checkbox label={(p.label as string) || "체크박스"} />
      );
    case "Switch":
      return (
        <Switch
          checked={false}
          onChange={() => {}}
          size={p.size as any}
          label={(p.label as string) || undefined}
        />
      );
    case "Slider":
      return <Slider value={50} onChange={() => {}} />;
    case "StarRating":
      return (
        <StarRating
          value={(p.value as number) ?? 3}
          max={(p.max as number) ?? 5}
          size={p.size as any}
          onChange={() => {}}
        />
      );
    case "IconButton":
      return (
        <IconButton
          icon={
            <svg
              className="w-4 h-4"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M8 3v10M3 8h10" />
            </svg>
          }
          variant={p.variant as any}
          size={p.size as any}
          label="아이콘 버튼"
        />
      );
    case "Kbd":
      return <Kbd>{text || "\u2318K"}</Kbd>;
    case "StatusDot":
      return <StatusDot status={p.status as any} />;
    case "Skeleton":
      return (
        <Skeleton
          width={(p.width as string) || "100%"}
          height={(p.height as string) || "40px"}
        />
      );
    case "ProgressBar":
      return (
        <ProgressBar
          value={(p.value as number) ?? 60}
          max={(p.max as number) ?? 100}
          showLabel={!!p.showLabel}
        />
      );
    case "StatCard":
      return (
        <StatCard
          label={(p.title as string) || "통계"}
          value={(p.value as string) || "1,234"}
        />
      );
    case "EmptyState":
      return (
        <EmptyState title={(p.title as string) || "데이터 없음"} />
      );
    case "SegmentedControl":
      return (
        <SegmentedControl
          options={[
            { key: "1", label: "옵션 1" },
            { key: "2", label: "옵션 2" },
            { key: "3", label: "옵션 3" },
          ]}
          value="1"
          onChange={() => {}}
          size={p.size as any}
          fullWidth={!!p.fullWidth}
        />
      );
    case "Stepper":
      return (
        <Stepper
          steps={[
            { key: "1", title: "정보 입력" },
            { key: "2", title: "확인" },
            { key: "3", title: "완료" },
          ]}
          current={(p.current as number) ?? 0}
          direction={p.direction as any}
        />
      );
    case "Result":
      return (
        <Result
          status={(p.status as any) ?? "success"}
          title={(p.title as string) || "완료"}
        />
      );
    default:
      return (
        <div className="px-3 py-2 border border-dashed border-border rounded text-xs text-muted">
          {node.componentId}
        </div>
      );
  }
}

// ── Node toolbar ──────────────────────────────────────────────────────
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

// ── Render a single node ──────────────────────────────────────────────
function RenderNode({ nodeId }: { nodeId: string }) {
  const { state, dispatch } = useLab();
  const node = state.nodes[nodeId];
  const parentId = node?.parentId;

  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch({ type: "SELECT", nodeId: nodeId });
    },
    [dispatch, nodeId],
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch({ type: "HOVER", nodeId: nodeId });
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
    () => dispatch({ type: "DUPLICATE_NODE", nodeId: nodeId }),
    [dispatch, nodeId],
  );
  const handleDelete = useCallback(
    () => dispatch({ type: "DELETE_NODE", nodeId: nodeId }),
    [dispatch, nodeId],
  );

  const handleAddInside = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch({ type: "SELECT", nodeId: nodeId });
    },
    [dispatch, nodeId],
  );

  if (!node) return null;

  const def = componentDefMap.get(node.componentId);
  const isSelected = state.selectedId === nodeId;
  const isHovered = state.hoveredId === nodeId;
  const isContainer = def?.isContainer ?? false;
  const isLayout = LAYOUT_IDS.has(node.componentId);

  // ── Wrapper classes ─────────────────────────────────────────────────
  const wrapperCls = cn(
    "relative group",
    isSelected && "ring-2 ring-primary rounded-sm",
    !isSelected && isHovered && "ring-1 ring-dashed ring-primary/30 rounded-sm",
  );

  // ── Container content ───────────────────────────────────────────────
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

  // ── Name badge ──────────────────────────────────────────────────────
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

  // ── Render layout containers as HTML elements ───────────────────────
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
        <Tag
          className={cn(lc, "min-h-[2rem]")}
          style={bgStyle}
        >
          {renderContainerContent()}
        </Tag>
      </div>
    );
  }

  // ── Render Card as container ────────────────────────────────────────
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

  // ── Render Alert as container ───────────────────────────────────────
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
        <Alert variant={node.props.variant as any}>
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

  // ── Render leaf components ──────────────────────────────────────────
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
        {def ? renderLeaf(node, def) : (
          <div className="px-3 py-2 border border-dashed border-border rounded text-xs text-muted">
            {node.componentId}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main canvas ───────────────────────────────────────────────────────
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
