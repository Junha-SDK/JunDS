"use client";

import { useState, useCallback } from "react";
import { cn } from "@/ds/utils/cn";
import { useLab } from "../_lib/lab-store";
import { labComponents, labComponentMap } from "../_lib/component-registry";
import { ComponentSlot } from "./ComponentSlot";

/* ------------------------------------------------------------------ */
/*  Add component dropdown                                             */
/* ------------------------------------------------------------------ */

function AddComponentDropdown({
  regionId,
  onClose,
}: {
  regionId: string;
  onClose: () => void;
}) {
  const { dispatch } = useLab();

  // Group by category
  const categories = new Map<string, typeof labComponents>();
  for (const comp of labComponents) {
    if (!categories.has(comp.category)) {
      categories.set(comp.category, []);
    }
    categories.get(comp.category)!.push(comp);
  }

  const handleSelect = useCallback(
    (componentId: string) => {
      dispatch({ type: "ADD_SLOT", regionId, componentId });
      onClose();
    },
    [dispatch, regionId, onClose],
  );

  return (
    <div className="absolute bottom-full left-0 z-20 mb-1 w-56 rounded-md border border-border bg-white shadow-lg max-h-64 overflow-y-auto">
      {[...categories.entries()].map(([category, comps]) => (
        <div key={category}>
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40">
            {category}
          </div>
          {comps.map((comp) => (
            <button
              key={comp.id}
              type="button"
              onClick={() => handleSelect(comp.id)}
              className="flex w-full items-center px-3 py-1.5 text-xs hover:bg-muted/60 transition-colors text-left"
            >
              {comp.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  RegionEditor                                                       */
/* ------------------------------------------------------------------ */

export function RegionEditor({ regionId }: { regionId: string }) {
  const { state, dispatch } = useLab();
  const [showDropdown, setShowDropdown] = useState(false);
  const region = state.regions[regionId];

  if (!region) return null;

  const handleSlotClick = (slotId: string) => {
    dispatch({ type: "SELECT_SLOT", slotId });
  };

  const handleRemoveSlot = (e: React.MouseEvent, slotId: string) => {
    e.stopPropagation();
    dispatch({ type: "REMOVE_SLOT", regionId, slotId });
  };

  const handleMoveSlot = (
    e: React.MouseEvent,
    slotId: string,
    direction: "up" | "down",
  ) => {
    e.stopPropagation();
    dispatch({ type: "MOVE_SLOT", regionId, slotId, direction });
  };

  return (
    <div className="space-y-1">
      {region.slots.map((slot, idx) => {
        const isSelected = state.selectedSlotId === slot.id;
        const compDef = labComponentMap.get(slot.componentId);
        const label = compDef?.label ?? slot.componentId;

        return (
          <div key={slot.id}>
            <div
              onClick={() => handleSlotClick(slot.id)}
              className={cn(
                "flex items-center gap-1 rounded px-2 py-1.5 text-xs cursor-pointer transition-colors group",
                isSelected
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted/60 text-foreground",
              )}
            >
              {/* Drag handle placeholder */}
              <span className="text-muted-foreground/40 select-none mr-0.5">
                ⠿
              </span>

              {/* Component name */}
              <span className="flex-1 truncate font-medium">{label}</span>

              {/* Move up */}
              <button
                type="button"
                onClick={(e) => handleMoveSlot(e, slot.id, "up")}
                disabled={idx === 0}
                className={cn(
                  "h-5 w-5 flex items-center justify-center rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity",
                  idx === 0
                    ? "text-muted-foreground/30 cursor-not-allowed"
                    : "text-muted-foreground hover:bg-muted",
                )}
                title="위로 이동"
              >
                ▲
              </button>

              {/* Move down */}
              <button
                type="button"
                onClick={(e) => handleMoveSlot(e, slot.id, "down")}
                disabled={idx === region.slots.length - 1}
                className={cn(
                  "h-5 w-5 flex items-center justify-center rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity",
                  idx === region.slots.length - 1
                    ? "text-muted-foreground/30 cursor-not-allowed"
                    : "text-muted-foreground hover:bg-muted",
                )}
                title="아래로 이동"
              >
                ▼
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={(e) => handleRemoveSlot(e, slot.id)}
                className="h-5 w-5 flex items-center justify-center rounded text-[10px] text-muted-foreground hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-opacity"
                title="삭제"
              >
                ✕
              </button>
            </div>

            {/* Inline props editor when selected */}
            <ComponentSlot
              slotId={slot.id}
              regionId={regionId}
              componentId={slot.componentId}
              props={slot.props}
              children={slot.children}
            />
          </div>
        );
      })}

      {/* Add component button */}
      <div className="relative pt-1">
        <button
          type="button"
          onClick={() => setShowDropdown((v) => !v)}
          className="flex w-full items-center justify-center gap-1 rounded border border-dashed border-border px-2 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <span className="text-sm">+</span>
          <span>컴포넌트 추가</span>
        </button>

        {showDropdown && (
          <>
            {/* Backdrop to close dropdown */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />
            <AddComponentDropdown
              regionId={regionId}
              onClose={() => setShowDropdown(false)}
            />
          </>
        )}
      </div>
    </div>
  );
}
