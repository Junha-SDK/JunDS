"use client";
import { useState } from "react";
import { cn } from "../../utils/cn";

export interface JSONViewerProps {
  data: unknown;
  initialExpanded?: boolean;
  className?: string;
}

function JSONNode({ name, value, depth = 0, expanded: init = true }: { name?: string; value: unknown; depth?: number; expanded?: boolean }) {
  const [expanded, setExpanded] = useState(init && depth < 2);
  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);
  const entries = isObject ? Object.entries(value as Record<string, unknown>) : [];

  const typeColor = typeof value === "string" ? "text-success" : typeof value === "number" ? "text-primary" : typeof value === "boolean" ? "text-warning" : value === null ? "text-danger" : "text-foreground";

  if (!isObject) {
    return (
      <div className="flex" style={{ paddingLeft: depth * 16 }}>
        {name !== undefined && <span className="text-primary/70">{name}: </span>}
        <span className={typeColor}>
          {typeof value === "string" ? `"${value}"` : String(value)}
        </span>
      </div>
    );
  }

  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <button type="button" onClick={() => setExpanded(!expanded)} className="inline-flex items-center gap-1 cursor-pointer hover:bg-primary/5 rounded px-1 -ml-1">
        <svg width="10" height="10" viewBox="0 0 10 10" className={cn("transition-transform", expanded && "rotate-90")}>
          <path d="M3 2l4 3-4 3z" fill="currentColor" />
        </svg>
        {name !== undefined && <span className="text-primary/70">{name}: </span>}
        <span className="text-muted">{isArray ? `[${entries.length}]` : `{${entries.length}}`}</span>
      </button>
      {expanded && entries.map(([k, v]) => (
        <JSONNode key={k} name={isArray ? undefined : k} value={v} depth={depth + 1} expanded={init} />
      ))}
    </div>
  );
}

export function JSONViewer({ data, initialExpanded = true, className }: JSONViewerProps) {
  return (
    <div className={cn("p-3 rounded-xl border border-border bg-gray-950 text-gray-100 text-xs font-mono overflow-auto", className)}>
      <JSONNode value={data} expanded={initialExpanded} />
    </div>
  );
}
