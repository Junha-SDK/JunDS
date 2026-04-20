"use client";

import { useState, useCallback } from "react";
import { cn } from "@/ds/utils/cn";
import { useLab } from "../_lib/lab-store";
import { layoutTemplateMap } from "../_lib/layout-templates";
import type { RegionStyle } from "../_lib/types";
import { RegionEditor } from "./RegionEditor";

/* ------------------------------------------------------------------ */
/*  Style control helpers                                              */
/* ------------------------------------------------------------------ */

const paddingOptions = ["0", "8px", "16px", "24px", "32px", "48px"];
const gapOptions = ["0", "4px", "8px", "12px", "16px", "24px"];
const alignItemsOptions = [
  "stretch",
  "flex-start",
  "center",
  "flex-end",
  "baseline",
];
const justifyContentOptions = [
  "flex-start",
  "center",
  "flex-end",
  "space-between",
  "space-around",
  "space-evenly",
];

function StyleSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] text-muted-foreground w-16 shrink-0 truncate">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 flex-1 rounded border border-border bg-background px-1.5 text-[11px]"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Region section (collapsible)                                       */
/* ------------------------------------------------------------------ */

function RegionSection({
  regionId,
  label,
}: {
  regionId: string;
  label: string;
}) {
  const { state, dispatch } = useLab();
  const [open, setOpen] = useState(true);
  const [showStyle, setShowStyle] = useState(false);

  const isSelected = state.selectedRegionId === regionId;
  const region = state.regions[regionId];

  const handleHeaderClick = useCallback(() => {
    dispatch({ type: "SELECT_REGION", regionId });
    setOpen(true);
  }, [dispatch, regionId]);

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setOpen((v) => !v);
    },
    [],
  );

  const handleStyleChange = useCallback(
    (key: keyof RegionStyle, value: string) => {
      dispatch({ type: "UPDATE_REGION_STYLE", regionId, key, value });
    },
    [dispatch, regionId],
  );

  if (!region) return null;

  return (
    <div className="border-b border-border">
      {/* Region header */}
      <button
        type="button"
        onClick={handleHeaderClick}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold transition-colors text-left",
          isSelected
            ? "bg-primary/10 text-primary"
            : "hover:bg-muted/40 text-foreground",
        )}
      >
        <span
          onClick={handleToggle}
          className={cn(
            "text-[10px] transition-transform cursor-pointer shrink-0",
            open ? "rotate-0" : "-rotate-90",
          )}
        >
          ▼
        </span>
        <span className="flex-1">{label}</span>
        <span className="text-[10px] text-muted-foreground font-normal">
          {region.slots.length}
        </span>
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 space-y-2">
          {/* Style toggle */}
          <button
            type="button"
            onClick={() => setShowStyle((v) => !v)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className={cn("transition-transform", showStyle ? "rotate-90" : "rotate-0")}>
              ▶
            </span>
            <span>스타일</span>
          </button>

          {showStyle && (
            <div className="rounded border border-border bg-muted/20 p-2 space-y-2">
              {/* backgroundColor */}
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-muted-foreground w-16 shrink-0">
                  배경색
                </label>
                <input
                  type="color"
                  value={region.style.backgroundColor || "#ffffff"}
                  onChange={(e) =>
                    handleStyleChange("backgroundColor", e.target.value)
                  }
                  className="h-7 w-7 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
                />
                <input
                  type="text"
                  value={region.style.backgroundColor}
                  onChange={(e) =>
                    handleStyleChange("backgroundColor", e.target.value)
                  }
                  className="h-7 flex-1 rounded border border-border bg-background px-2 text-[11px] font-mono"
                />
              </div>

              {/* padding */}
              <StyleSelect
                label="안쪽여백"
                value={region.style.padding}
                options={paddingOptions}
                onChange={(v) => handleStyleChange("padding", v)}
              />

              {/* gap */}
              <StyleSelect
                label="간격"
                value={region.style.gap}
                options={gapOptions}
                onChange={(v) => handleStyleChange("gap", v)}
              />

              {/* flexDirection */}
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-muted-foreground w-16 shrink-0">
                  방향
                </label>
                <div className="flex rounded border border-border overflow-hidden flex-1">
                  {(["row", "column"] as const).map((dir) => (
                    <button
                      key={dir}
                      type="button"
                      onClick={() => handleStyleChange("flexDirection", dir)}
                      className={cn(
                        "flex-1 py-1 text-[11px] font-medium transition-colors",
                        region.style.flexDirection === dir
                          ? "bg-primary text-primary-foreground"
                          : "bg-background hover:bg-muted/60",
                      )}
                    >
                      {dir === "row" ? "가로" : "세로"}
                    </button>
                  ))}
                </div>
              </div>

              {/* alignItems */}
              <StyleSelect
                label="정렬"
                value={region.style.alignItems}
                options={alignItemsOptions}
                onChange={(v) => handleStyleChange("alignItems", v)}
              />

              {/* justifyContent */}
              <StyleSelect
                label="배치"
                value={region.style.justifyContent}
                options={justifyContentOptions}
                onChange={(v) => handleStyleChange("justifyContent", v)}
              />
            </div>
          )}

          {/* Components list */}
          <RegionEditor regionId={regionId} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  StructurePanel                                                     */
/* ------------------------------------------------------------------ */

export function StructurePanel() {
  const { state } = useLab();
  const template = layoutTemplateMap.get(state.templateId);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col overflow-y-auto border-l border-border bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">구조</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {template?.label ?? state.templateId}
        </p>
      </div>

      {/* Regions */}
      <div className="flex-1 overflow-y-auto">
        {template?.regions.map((regionDef) => (
          <RegionSection
            key={regionDef.id}
            regionId={regionDef.id}
            label={regionDef.label}
          />
        ))}
      </div>
    </aside>
  );
}
