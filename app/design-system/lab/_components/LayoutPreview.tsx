"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/ds/utils/cn";
import { useLab } from "../_lib/lab-store";
import { layoutTemplateMap } from "../_lib/layout-templates";
import { viewportSizes } from "../_lib/types";
import type { SlotDef } from "../_lib/types";

import { Button } from "@/ds/primitives/Button";
import { Input } from "@/ds/primitives/Input";
import { Badge } from "@/ds/primitives/Badge";
import { Avatar } from "@/ds/primitives/Avatar";
import { Card } from "@/ds/composites/Card";
import { Label } from "@/ds/primitives/Label";
import { Divider } from "@/ds/primitives/Divider";
import { Textarea } from "@/ds/primitives/Textarea";
import { Spinner } from "@/ds/primitives/Spinner";
import { Tag } from "@/ds/primitives/Tag";
import { Skeleton } from "@/ds/composites/Skeleton";
import { Toggle } from "@/ds/primitives/Toggle";
import { Checkbox } from "@/ds/primitives/Checkbox";
import { Switch } from "@/ds/primitives/Switch";
import { StarRating } from "@/ds/primitives/StarRating";
import { IconButton } from "@/ds/primitives/IconButton";
import { Alert } from "@/ds/composites/Alert";
import { ProgressBar } from "@/ds/composites/Progress";

/* ------------------------------------------------------------------ */
/*  Component renderer                                                */
/* ------------------------------------------------------------------ */

function renderComponent(slot: SlotDef): React.ReactNode {
  const { componentId, props, children } = slot;

  switch (componentId) {
    case "Button":
      return <Button {...props}>{children || "Button"}</Button>;
    case "Input":
      return <Input {...props} />;
    case "Badge":
      return <Badge {...props}>{children || "Badge"}</Badge>;
    case "Avatar":
      return <Avatar {...props} />;
    case "Card":
      return <Card {...props}>{children}</Card>;
    case "Label":
      return <Label {...props}>{children || "Label"}</Label>;
    case "Divider":
      return <Divider {...props} />;
    case "Textarea":
      return <Textarea {...props} />;
    case "Spinner":
      return <Spinner {...props} />;
    case "Tag":
      return <Tag {...props}>{children || "Tag"}</Tag>;
    case "Skeleton":
      return <Skeleton {...props} />;
    case "Toggle":
      return <Toggle {...props} />;
    case "Checkbox":
      return <Checkbox {...props} />;
    case "Switch":
      return <Switch checked={false} onChange={() => {}} {...props} />;
    case "StarRating":
      return <StarRating value={3} {...props} />;
    case "IconButton":
      return <IconButton icon={<span>+</span>} label="icon" {...props} />;
    case "Alert":
      return <Alert {...props}>{children || "Alert message"}</Alert>;
    case "ProgressBar":
      return <ProgressBar value={60} {...props} />;
    default:
      return (
        <div className="rounded border border-dashed border-muted-foreground/30 px-2 py-1 text-xs text-muted-foreground">
          {componentId}
        </div>
      );
  }
}

/* ------------------------------------------------------------------ */
/*  LayoutPreview                                                     */
/* ------------------------------------------------------------------ */

export function LayoutPreview() {
  const { state, dispatch } = useLab();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

  const template = layoutTemplateMap.get(state.templateId);
  const vp = viewportSizes[state.viewport];

  /* ── Compute scale to fit viewport frame inside the container ── */
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      const padding = 48;
      const scaleX = (width - padding) / vp.width;
      const scaleY = (height - padding) / vp.height;
      setScale(Math.min(scaleX, scaleY, 1));
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [vp.width, vp.height]);

  const handleRegionClick = useCallback(
    (regionId: string) => {
      dispatch({ type: "SELECT_REGION", regionId });
    },
    [dispatch],
  );

  const handleSlotClick = useCallback(
    (e: React.MouseEvent, slotId: string) => {
      e.stopPropagation();
      dispatch({ type: "SELECT_SLOT", slotId });
    },
    [dispatch],
  );

  if (!template) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        템플릿을 찾을 수 없습니다: {state.templateId}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex flex-1 items-center justify-center overflow-hidden bg-muted/30"
    >
      {/* Viewport frame */}
      <div
        className="relative border border-border bg-background shadow-sm"
        style={{
          width: vp.width,
          height: vp.height,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {/* Viewport label */}
        <div className="absolute -top-6 left-0 text-[10px] text-muted-foreground">
          {vp.label} — {vp.width}x{vp.height}
        </div>

        {/* Grid container */}
        <div
          className="h-full w-full"
          style={{
            display: "grid",
            gridTemplate: template.gridTemplate,
            gridTemplateColumns: template.gridColumns,
            gridTemplateRows: template.gridRows,
          }}
        >
          {template.regions.map((regionDef) => {
            const regionState = state.regions[regionDef.id];
            const isSelected = state.selectedRegionId === regionDef.id;
            const isHovered = hoveredRegionId === regionDef.id;
            const Tag = regionDef.tag as keyof React.JSX.IntrinsicElements;
            const style = regionState?.style ?? regionDef.defaultStyle;
            const slots = regionState?.slots ?? regionDef.defaultSlots;

            return (
              <Tag
                key={regionDef.id}
                onClick={() => handleRegionClick(regionDef.id)}
                onMouseEnter={() => setHoveredRegionId(regionDef.id)}
                onMouseLeave={() => setHoveredRegionId(null)}
                className={cn(
                  "relative cursor-pointer transition-all",
                  isSelected && "ring-2 ring-blue-500 ring-inset",
                  !isSelected &&
                    isHovered &&
                    "border-2 border-dashed border-primary/30",
                )}
                style={{
                  gridArea: regionDef.gridArea,
                  display: "flex",
                  flexDirection: style.flexDirection,
                  alignItems: style.alignItems,
                  justifyContent: style.justifyContent,
                  padding: style.padding,
                  gap: style.gap,
                  backgroundColor: style.backgroundColor,
                  overflow: "auto",
                }}
              >
                {/* Region label badge */}
                <span className="pointer-events-none absolute left-1 top-1 z-10 rounded bg-muted/80 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                  {regionDef.label}
                </span>

                {/* Slots */}
                {slots.map((slot) => {
                  const isSlotSelected = state.selectedSlotId === slot.id;

                  return (
                    <div
                      key={slot.id}
                      onClick={(e) => handleSlotClick(e, slot.id)}
                      className={cn(
                        "relative transition-all",
                        isSlotSelected &&
                          "outline outline-2 outline-dashed outline-blue-500 outline-offset-2",
                      )}
                    >
                      {renderComponent(slot)}
                    </div>
                  );
                })}
              </Tag>
            );
          })}
        </div>
      </div>
    </div>
  );
}
