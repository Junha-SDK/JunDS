"use client";

import { useCallback } from "react";
import { cn } from "@/ds/utils/cn";
import { useLab } from "../_lib/lab-store";
import { labComponentMap } from "../_lib/component-registry";
import type { PropDef, PropValue } from "../_lib/types";

/* ------------------------------------------------------------------ */
/*  Individual prop editor                                             */
/* ------------------------------------------------------------------ */

function PropEditor({
  def,
  value,
  onChange,
}: {
  def: PropDef;
  value: PropValue;
  onChange: (value: PropValue) => void;
}) {
  const label = def.label ?? def.name;

  switch (def.type) {
    case "select":
      return (
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-muted-foreground w-20 shrink-0 truncate">
            {label}
          </label>
          <select
            value={String(value ?? def.defaultValue ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 flex-1 rounded border border-border bg-background px-1.5 text-[11px]"
          >
            {def.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );

    case "boolean":
      return (
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-muted-foreground w-20 shrink-0 truncate">
            {label}
          </label>
          <button
            type="button"
            onClick={() => onChange(!value)}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              value ? "bg-primary" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                value ? "left-[18px]" : "left-0.5",
              )}
            />
          </button>
        </div>
      );

    case "number":
      return (
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-muted-foreground w-20 shrink-0 truncate">
            {label}
          </label>
          <input
            type="number"
            value={value !== undefined ? Number(value) : (def.defaultValue as number) ?? 0}
            onChange={(e) => onChange(Number(e.target.value))}
            className="h-7 flex-1 rounded border border-border bg-background px-2 text-[11px] font-mono"
          />
        </div>
      );

    case "color":
      return (
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-muted-foreground w-20 shrink-0 truncate">
            {label}
          </label>
          <input
            type="color"
            value={String(value ?? def.defaultValue ?? "#000000")}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 w-7 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
          />
          <input
            type="text"
            value={String(value ?? def.defaultValue ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 flex-1 rounded border border-border bg-background px-2 text-[11px] font-mono"
          />
        </div>
      );

    case "text":
    default:
      return (
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-muted-foreground w-20 shrink-0 truncate">
            {label}
          </label>
          <input
            type="text"
            value={String(value ?? def.defaultValue ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 flex-1 rounded border border-border bg-background px-2 text-[11px]"
          />
        </div>
      );
  }
}

/* ------------------------------------------------------------------ */
/*  ComponentSlot                                                      */
/* ------------------------------------------------------------------ */

export function ComponentSlot({
  slotId,
  regionId,
  componentId,
  props,
  children,
}: {
  slotId: string;
  regionId: string;
  componentId: string;
  props: Record<string, PropValue>;
  children?: string;
}) {
  const { state, dispatch } = useLab();
  const isSelected = state.selectedSlotId === slotId;
  const compDef = labComponentMap.get(componentId);

  const handlePropChange = useCallback(
    (propName: string, value: PropValue) => {
      dispatch({
        type: "UPDATE_SLOT_PROP",
        regionId,
        slotId,
        propName,
        value,
      });
    },
    [dispatch, regionId, slotId],
  );

  const handleChildrenChange = useCallback(
    (value: string) => {
      dispatch({
        type: "UPDATE_SLOT_CHILDREN",
        regionId,
        slotId,
        children: value,
      });
    },
    [dispatch, regionId, slotId],
  );

  if (!isSelected || !compDef) return null;

  return (
    <div className="mt-1 rounded border border-border bg-muted/30 p-2 space-y-2">
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        속성
      </div>

      {compDef.props.map((propDef) => (
        <PropEditor
          key={propDef.name}
          def={propDef}
          value={props[propDef.name]}
          onChange={(v) => handlePropChange(propDef.name, v)}
        />
      ))}

      {compDef.acceptsChildren && (
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-muted-foreground w-20 shrink-0">
            children
          </label>
          <input
            type="text"
            value={children ?? compDef.defaultChildren ?? ""}
            onChange={(e) => handleChildrenChange(e.target.value)}
            className="h-7 flex-1 rounded border border-border bg-background px-2 text-[11px]"
          />
        </div>
      )}
    </div>
  );
}
