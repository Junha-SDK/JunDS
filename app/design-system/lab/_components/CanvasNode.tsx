"use client";

import React, { useRef, useState, useCallback, memo } from "react";
import { cn } from "@/ds/utils/cn";
import { useLab } from "../_lib/lab-store";
import { labComponentMap } from "../_lib/component-registry";
import type { CanvasNode as CanvasNodeType } from "../_lib/types";

// ─── DS Component imports ───
import { Button } from "@/ds/primitives/Button";
import { Input } from "@/ds/primitives/Input";
import { Textarea } from "@/ds/primitives/Textarea";
import { Badge } from "@/ds/primitives/Badge";
import { Avatar } from "@/ds/primitives/Avatar";
import { Spinner } from "@/ds/primitives/Spinner";
import { Toggle } from "@/ds/primitives/Toggle";
import { Checkbox } from "@/ds/primitives/Checkbox";
import { Switch } from "@/ds/primitives/Switch";
import { StarRating } from "@/ds/primitives/StarRating";
import { Tag } from "@/ds/primitives/Tag";
import { Divider } from "@/ds/primitives/Divider";
import { Label } from "@/ds/primitives/Label";
import { IconButton } from "@/ds/primitives/IconButton";
import { Card } from "@/ds/composites/Card";
import { Alert } from "@/ds/composites/Alert";
import { Skeleton } from "@/ds/composites/Skeleton";
import { ProgressBar } from "@/ds/composites/Progress";
import { SegmentedControl } from "@/ds/composites/SegmentedControl";
import { Tabs } from "@/ds/composites/Tabs";
import { Tooltip } from "@/ds/composites/Tooltip";

// ─── Renderers ───
const componentRenderers: Record<
  string,
  (props: Record<string, unknown>, children?: string) => React.ReactNode
> = {
  Button: (props, children) => (
    <Button {...(props as any)}>{children || "Button"}</Button>
  ),
  Input: (props) => <Input {...(props as any)} />,
  Textarea: (props) => <Textarea {...(props as any)} />,
  Badge: (props, children) => (
    <Badge {...(props as any)}>{children || "Badge"}</Badge>
  ),
  Avatar: (props) => <Avatar {...(props as any)} />,
  Spinner: (props) => <Spinner {...(props as any)} />,
  Toggle: (props) => <Toggle {...(props as any)} onChange={() => {}} />,
  Checkbox: (props) => <Checkbox {...(props as any)} onChange={() => {}} />,
  Switch: (props) => (
    <Switch
      {...(props as any)}
      checked={props.checked as boolean ?? false}
      onChange={() => {}}
    />
  ),
  StarRating: (props) => <StarRating {...(props as any)} />,
  Tag: (props, children) => (
    <Tag {...(props as any)}>{children || "Tag"}</Tag>
  ),
  Divider: (props) => <Divider {...(props as any)} />,
  Label: (props, children) => (
    <Label {...(props as any)}>{children || "Label"}</Label>
  ),
  IconButton: (props) => (
    <IconButton
      {...(props as any)}
      label={(props.label as string) || "icon button"}
      icon={
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      }
    />
  ),
  Card: (props, children) => (
    <Card {...(props as any)}>
      <div className="p-4 text-sm text-gray-600">{children || "Card content"}</div>
    </Card>
  ),
  Alert: (props, children) => (
    <Alert {...(props as any)}>{children || "Alert message"}</Alert>
  ),
  Skeleton: (props) => <Skeleton {...(props as any)} />,
  ProgressBar: (props) => <ProgressBar {...(props as any)} />,
  SegmentedControl: (props) => (
    <SegmentedControl
      {...(props as any)}
      options={[
        { key: "a", label: "Option A" },
        { key: "b", label: "Option B" },
        { key: "c", label: "Option C" },
      ]}
      value="a"
      onChange={() => {}}
    />
  ),
  Tabs: (props) => (
    <Tabs
      {...(props as any)}
      tabs={[
        { value: "tab1", label: "Tab 1" },
        { value: "tab2", label: "Tab 2" },
        { value: "tab3", label: "Tab 3" },
      ]}
      value="tab1"
      onChange={() => {}}
    />
  ),
  Tooltip: (props, children) => (
    <Tooltip {...(props as any)} content={(props.content as string) || "Tooltip"}>
      <span className="inline-block px-2 py-1 text-sm border border-dashed border-gray-300 rounded">
        {children || "Hover me"}
      </span>
    </Tooltip>
  ),
};

// ─── Resize handles ───
type HandlePos = "nw" | "ne" | "sw" | "se";

const handleCursors: Record<HandlePos, string> = {
  nw: "cursor-nwse-resize",
  ne: "cursor-nesw-resize",
  sw: "cursor-nesw-resize",
  se: "cursor-nwse-resize",
};

const handlePositions: Record<HandlePos, string> = {
  nw: "-top-1 -left-1",
  ne: "-top-1 -right-1",
  sw: "-bottom-1 -left-1",
  se: "-bottom-1 -right-1",
};

// ─── Component ───
interface CanvasNodeProps {
  node: CanvasNodeType;
  isSelected: boolean;
  zoom: number;
}

export const CanvasNodeView = memo(function CanvasNodeView({
  node,
  isSelected,
  zoom,
}: CanvasNodeProps) {
  const { dispatch } = useLab();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, nx: 0, ny: 0 });
  const resizeStart = useRef({
    mx: 0,
    my: 0,
    w: 0,
    h: 0,
    x: 0,
    y: 0,
    handle: "se" as HandlePos,
  });

  const def = labComponentMap.get(node.componentId);

  // ─── Drag ───
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).dataset.resizeHandle) return;
      e.stopPropagation();
      dispatch({ type: "SELECT", nodeIds: [node.id] });
      setDragging(true);
      dragStart.current = {
        mx: e.clientX,
        my: e.clientY,
        nx: node.rect.x,
        ny: node.rect.y,
      };

      const onMove = (ev: MouseEvent) => {
        const dx = (ev.clientX - dragStart.current.mx) / zoom;
        const dy = (ev.clientY - dragStart.current.my) / zoom;
        dispatch({
          type: "MOVE_NODE",
          nodeId: node.id,
          x: dragStart.current.nx + dx,
          y: dragStart.current.ny + dy,
        });
      };

      const onUp = () => {
        setDragging(false);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [dispatch, node.id, node.rect.x, node.rect.y, zoom],
  );

  // ─── Resize ───
  const handleResizeDown = useCallback(
    (e: React.MouseEvent, handle: HandlePos) => {
      e.stopPropagation();
      e.preventDefault();
      resizeStart.current = {
        mx: e.clientX,
        my: e.clientY,
        w: node.rect.width,
        h: node.rect.height,
        x: node.rect.x,
        y: node.rect.y,
        handle,
      };

      const onMove = (ev: MouseEvent) => {
        const s = resizeStart.current;
        const dx = (ev.clientX - s.mx) / zoom;
        const dy = (ev.clientY - s.my) / zoom;

        let newW = s.w;
        let newH = s.h;
        let newX = s.x;
        let newY = s.y;

        if (handle.includes("e")) newW = s.w + dx;
        if (handle.includes("w")) {
          newW = s.w - dx;
          newX = s.x + dx;
        }
        if (handle.includes("s")) newH = s.h + dy;
        if (handle.includes("n")) {
          newH = s.h - dy;
          newY = s.y + dy;
        }

        const minW = def?.minWidth ?? 20;
        const minH = def?.minHeight ?? 20;
        if (newW < minW) {
          if (handle.includes("w")) newX = s.x + s.w - minW;
          newW = minW;
        }
        if (newH < minH) {
          if (handle.includes("n")) newY = s.y + s.h - minH;
          newH = minH;
        }

        dispatch({
          type: "RESIZE_NODE",
          nodeId: node.id,
          width: newW,
          height: newH,
        });
        if (handle.includes("w") || handle.includes("n")) {
          dispatch({
            type: "MOVE_NODE",
            nodeId: node.id,
            x: newX,
            y: newY,
          });
        }
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [dispatch, node.id, node.rect, zoom, def],
  );

  const renderer = componentRenderers[node.componentId];

  return (
    <div
      ref={wrapperRef}
      onMouseDown={handleMouseDown}
      className={cn(
        "absolute group",
        dragging ? "cursor-grabbing" : "cursor-grab",
        isSelected && "ring-2 ring-blue-500 ring-offset-1",
      )}
      style={{
        left: node.rect.x,
        top: node.rect.y,
        width: node.rect.width,
        height: node.rect.height,
        zIndex: node.zIndex,
      }}
    >
      {/* Rendered DS component */}
      <div className="w-full h-full overflow-hidden pointer-events-none flex items-center justify-center">
        {renderer
          ? renderer(
              node.props as Record<string, unknown>,
              node.children,
            )
          : (
            <div className="text-xs text-gray-400 italic">
              {node.componentId}
            </div>
          )}
      </div>

      {/* Resize handles (visible when selected) */}
      {isSelected &&
        (["nw", "ne", "sw", "se"] as HandlePos[]).map((handle) => (
          <div
            key={handle}
            data-resize-handle="true"
            onMouseDown={(e) => handleResizeDown(e, handle)}
            className={cn(
              "absolute w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-sm z-10",
              handleCursors[handle],
              handlePositions[handle],
            )}
          />
        ))}
    </div>
  );
});
