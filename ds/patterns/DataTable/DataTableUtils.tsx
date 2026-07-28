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
    visibleCols
      .map((c) => {
        const node = c.render(row, i);
        const text = typeof node === "string" || typeof node === "number" ? String(node) : "";
        return `"${text.replace(/"/g, '""')}"`;
      })
      .join(","),
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

export function ToolbarBtn({
  children,
  onClick,
  active,
  title,
  className: cls,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  title?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // 회색 팔레트는 다크에서 무너진다 — muted 틴트는 두 모드 모두 같은 세기로 읽힌다
        active
          ? "bg-primary/10 text-primary-ink"
          : "text-muted hover:text-foreground hover:bg-muted/10",
        cls,
      )}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────── Column Filter Popover ─────────────────────────── */

export function ColumnFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
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
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className={cn(
          "p-0.5 rounded-md transition-colors duration-150 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
          value ? "text-primary-ink" : "text-muted-light hover:text-muted",
        )}
        aria-label="컬럼 필터"
      >
        <FilterIcon />
      </button>
      {open && (
        // 헤더 위에 떠 있는 팝오버 — 그림자 한 겹으로는 표에서 떨어지지 않는다
        <div
          className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-xl p-2 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35),0_4px_10px_-4px_rgba(0,0,0,0.2)] ring-1 ring-border-light animate-fade-in-scale motion-reduce:animate-none"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            // eslint-disable-next-line jsx-a11y/no-autofocus -- column filter popover: focus must move into the search input when the popover opens
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="필터..."
            className="w-36 h-7 px-2 text-xs bg-card border border-border rounded-lg outline-none transition-[border-color,box-shadow] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow)]"
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="w-full mt-1 text-[10px] text-danger hover:underline cursor-pointer text-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/55"
            >
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
