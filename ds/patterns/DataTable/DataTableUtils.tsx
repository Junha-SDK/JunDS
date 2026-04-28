"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";
import type { DataTableColumn } from "./DataTable";
import { FilterIcon } from "./DataTableIcons";

/* ─────────────────────────── Export Helpers ─────────────────────────── */

export function exportCSV<T>(columns: DataTableColumn<T>[], data: T[], filename: string) {
  const visibleCols = columns.filter((c) => !c.hidden);
  const header = visibleCols.map((c) => `"${c.header}"`).join(",");
  const rows = data.map((row, i) =>
    visibleCols.map((c) => {
      const node = c.render(row, i);
      const text = typeof node === "string" || typeof node === "number" ? String(node) : "";
      return `"${text.replace(/"/g, '""')}"`;
    }).join(","),
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportJSON<T>(data: T[], filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─────────────────────────── Toolbar Button ─────────────────────────── */

export function ToolbarBtn({ children, onClick, active, title, className: cls }: {
  children: ReactNode; onClick: () => void; active?: boolean; title?: string; className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted hover:text-foreground hover:bg-gray-100",
        cls,
      )}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────── Column Filter Popover ─────────────────────────── */

export function ColumnFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={cn("p-0.5 rounded transition-colors cursor-pointer", value ? "text-primary" : "text-muted-light hover:text-muted")}
        aria-label="컬럼 필터"
      >
        <FilterIcon />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-border rounded-lg shadow-lg p-2 animate-fade-in-scale" onClick={(e) => e.stopPropagation()}>
          <input
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="필터..."
            className="w-36 h-7 px-2 text-xs border border-border rounded-md outline-none focus:border-primary"
          />
          {value && (
            <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="w-full mt-1 text-[10px] text-danger hover:underline cursor-pointer text-center">
              초기화
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Column Resizer ─────────────────────────── */

export function ColumnResizer({ onResize }: { onResize: (delta: number) => void }) {
  const startX = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startX.current = e.clientX;

    const handleMove = (ev: MouseEvent) => {
      onResize(ev.clientX - startX.current);
      startX.current = ev.clientX;
    };
    const handleUp = () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/30 transition-colors z-20"
      aria-hidden="true"
    />
  );
}
